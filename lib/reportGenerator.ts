import Session from "@/models/Session";
import Office from "@/models/Office";
import MonthlyReport, { IReportEntry, ReportType } from "@/models/MonthlyReport";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns { start: Date, end: Date } for a "YYYY-MM" string. */
function monthBounds(month: string): { start: Date; end: Date } {
  const [y, m] = month.split("-").map(Number);
  return {
    start: new Date(y, m - 1, 1),
    end: new Date(y, m, 1), // exclusive upper bound
  };
}

/** Returns "YYYY-MM" for N months before `base`. */
function monthOffset(base: string, offsetMonths: number): string {
  const [y, m] = base.split("-").map(Number);
  const d = new Date(y, m - 1 - offsetMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── Per-month snapshot aggregation ────────────────────────────────────────────

interface OfficeSnapshot {
  office_id: string;
  avg_rating: number;
  count: number;
  service_breakdown: Record<string, number>;
}

/**
 * Aggregates all completed Office-flow sessions for a given month
 * into per-office average ratings and per-service breakdowns.
 */
async function aggregateMonth(month: string): Promise<Map<string, OfficeSnapshot>> {
  const { start, end } = monthBounds(month);

  // Stage 1: per-office average rating
  const pipeline = await Session.aggregate<{
    _id: string;
    avg_rating: number;
    count: number;
  }>([
    {
      $match: {
        completed: true,
        created_at: { $gte: start, $lt: end },
        "answers.office_rating": { $ne: null },
      },
    },
    {
      $group: {
        _id: "$office_id",
        avg_rating: { $avg: "$answers.office_rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Stage 2: per-office per-service breakdown
  const servicePipeline = await Session.aggregate<{
    _id: { office_id: string; service: string };
    avg: number;
  }>([
    {
      $match: {
        completed: true,
        created_at: { $gte: start, $lt: end },
        "answers.office_rating": { $ne: null },
        "answers.cat1_q8_service": { $ne: null },
      },
    },
    {
      $group: {
        _id: { office_id: "$office_id", service: "$answers.cat1_q8_service" },
        avg: { $avg: "$answers.office_rating" },
      },
    },
  ]);

  // Index service breakdown by office_id
  const serviceMap = new Map<string, Record<string, number>>();
  for (const s of servicePipeline) {
    const key = s._id.office_id;
    if (!serviceMap.has(key)) serviceMap.set(key, {});
    serviceMap.get(key)![s._id.service] = Number(s.avg.toFixed(2));
  }

  const result = new Map<string, OfficeSnapshot>();
  for (const row of pipeline) {
    result.set(row._id, {
      office_id: row._id,
      avg_rating: Number(row.avg_rating.toFixed(2)),
      count: row.count,
      service_breakdown: serviceMap.get(row._id) || {},
    });
  }

  return result;
}

// ── Office metadata lookup (cached per run) ──────────────────────────────────

type OfficeMeta = { office_name: string; district: string; region: string; taluka: string; department: string };

async function loadOfficeIndex(): Promise<Map<string, OfficeMeta>> {
  const offices = await Office.find({ is_active: true })
    .select("office_id office_name district region taluka department")
    .lean();

  const index = new Map<string, OfficeMeta>();
  for (const o of offices) {
    index.set(o.office_id, {
      office_name: o.office_name || o.office_id,
      district: o.district || "",
      region: o.region || "",
      taluka: o.taluka || "",
      department: o.department || "",
    });
  }
  return index;
}

// ── Trend computation ─────────────────────────────────────────────────────────

function computeTrend(currentAvg: number, previousAvg: number | null): "improving" | "stable" | "declining" {
  if (previousAvg === null) return "stable";
  if (currentAvg > previousAvg + 0.2) return "improving";
  if (currentAvg < previousAvg - 0.2) return "declining";
  return "stable";
}

// ── Build an IReportEntry from raw data ───────────────────────────────────────

function buildEntry(
  snap: OfficeSnapshot,
  meta: OfficeMeta,
  prevAvg: number | null,
  consecutiveMonths: number
): IReportEntry {
  return {
    office_id: snap.office_id,
    office_name: meta.office_name,
    district: meta.district,
    region: meta.region,
    taluka: meta.taluka,
    department: meta.department,
    avg_rating: snap.avg_rating,
    submission_count: snap.count,
    service_breakdown: snap.service_breakdown,
    consecutive_months: consecutiveMonths,
    trend: computeTrend(snap.avg_rating, prevAvg),
  };
}

// ── Report summary helper ─────────────────────────────────────────────────────

function summarise(entries: IReportEntry[]) {
  const total = entries.length;
  const avg = total > 0
    ? Number((entries.reduce((s, e) => s + e.avg_rating, 0) / total).toFixed(2))
    : 0;
  return { total_offices: total, avg_rating: avg };
}

// ── Individual Report Generators ──────────────────────────────────────────────

async function generateType1(
  month: string,
  currentSnaps: Map<string, OfficeSnapshot>,
  officeIndex: Map<string, OfficeMeta>
): Promise<IReportEntry[]> {
  const entries: IReportEntry[] = [];
  for (const [id, snap] of currentSnaps) {
    if (snap.avg_rating >= 4.5) {
      const meta = officeIndex.get(id);
      if (meta) entries.push(buildEntry(snap, meta, null, 1));
    }
  }
  return entries;
}

async function generateStreakReport(
  month: string,
  requiredMonths: number,
  minRating: number,
  currentSnaps: Map<string, OfficeSnapshot>,
  officeIndex: Map<string, OfficeMeta>
): Promise<IReportEntry[]> {
  // Load historical snapshots for lookback
  const historySnaps: Map<string, OfficeSnapshot>[] = [];
  for (let i = 1; i < requiredMonths; i++) {
    historySnaps.push(await aggregateMonth(monthOffset(month, i)));
  }

  const entries: IReportEntry[] = [];
  for (const [id, snap] of currentSnaps) {
    if (snap.avg_rating < minRating) continue;

    let streak = true;
    for (const hist of historySnaps) {
      const prev = hist.get(id);
      if (!prev || prev.avg_rating < minRating) {
        streak = false;
        break;
      }
    }

    if (streak) {
      const meta = officeIndex.get(id);
      const prevMonth = historySnaps[0]?.get(id);
      if (meta) entries.push(buildEntry(snap, meta, prevMonth?.avg_rating ?? null, requiredMonths));
    }
  }
  return entries;
}

async function generateLowRatingReport(
  month: string,
  currentSnaps: Map<string, OfficeSnapshot>,
  officeIndex: Map<string, OfficeMeta>
): Promise<IReportEntry[]> {
  // Look back up to 6 months for <3★ streaks (min 3 months required)
  const maxLookback = 6;
  const historySnaps: Map<string, OfficeSnapshot>[] = [];
  for (let i = 1; i < maxLookback; i++) {
    historySnaps.push(await aggregateMonth(monthOffset(month, i)));
  }

  const entries: IReportEntry[] = [];
  for (const [id, snap] of currentSnaps) {
    if (snap.avg_rating >= 3) continue; // only <3★ offices

    let streak = 1; // current month counts
    for (const hist of historySnaps) {
      const prev = hist.get(id);
      if (prev && prev.avg_rating < 3) {
        streak++;
      } else {
        break;
      }
    }

    if (streak >= 3) {
      const meta = officeIndex.get(id);
      const prevMonth = historySnaps[0]?.get(id);
      if (meta) entries.push(buildEntry(snap, meta, prevMonth?.avg_rating ?? null, streak));
    }
  }
  return entries;
}

async function generateDecliningReport(
  month: string,
  currentSnaps: Map<string, OfficeSnapshot>,
  officeIndex: Map<string, OfficeMeta>
): Promise<IReportEntry[]> {
  // Offices that were >=3★ and dropped to <3★ sustained for 3-6 months
  const maxLookback = 7; // need 1 extra month to check "was >=3"
  const historySnaps: Map<string, OfficeSnapshot>[] = [];
  for (let i = 1; i < maxLookback; i++) {
    historySnaps.push(await aggregateMonth(monthOffset(month, i)));
  }

  const entries: IReportEntry[] = [];
  for (const [id, snap] of currentSnaps) {
    if (snap.avg_rating >= 3) continue;

    let belowStreak = 1;
    let foundAbove = false;
    for (const hist of historySnaps) {
      const prev = hist.get(id);
      if (!prev) break;
      if (prev.avg_rating < 3) {
        belowStreak++;
      } else {
        // Found the month where it was still >= 3
        foundAbove = true;
        break;
      }
    }

    if (foundAbove && belowStreak >= 3) {
      const meta = officeIndex.get(id);
      const prevMonth = historySnaps[0]?.get(id);
      if (meta) entries.push(buildEntry(snap, meta, prevMonth?.avg_rating ?? null, belowStreak));
    }
  }
  return entries;
}

async function generateMasterReport(
  month: string,
  currentSnaps: Map<string, OfficeSnapshot>,
  officeIndex: Map<string, OfficeMeta>
): Promise<IReportEntry[]> {
  // Previous month for trend calculation
  const prevSnaps = await aggregateMonth(monthOffset(month, 1));

  const entries: IReportEntry[] = [];
  for (const [id, meta] of officeIndex) {
    const snap = currentSnaps.get(id);
    const prevSnap = prevSnaps.get(id);

    entries.push({
      office_id: id,
      office_name: meta.office_name,
      district: meta.district,
      region: meta.region,
      taluka: meta.taluka,
      department: meta.department,
      avg_rating: snap?.avg_rating ?? 0,
      submission_count: snap?.count ?? 0,
      service_breakdown: snap?.service_breakdown ?? {},
      consecutive_months: 1,
      trend: computeTrend(snap?.avg_rating ?? 0, prevSnap?.avg_rating ?? null),
    });
  }
  return entries;
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

export async function generateAllReports(month: string): Promise<{ type: ReportType; count: number }[]> {
  console.log(`📊 [Reports] Generating all reports for ${month}...`);

  const officeIndex = await loadOfficeIndex();
  const currentSnaps = await aggregateMonth(month);
  const results: { type: ReportType; count: number }[] = [];

  const generators: [ReportType, () => Promise<IReportEntry[]>][] = [
    [1, () => generateType1(month, currentSnaps, officeIndex)],
    [2, () => generateStreakReport(month, 2, 4.5, currentSnaps, officeIndex)],
    [3, () => generateStreakReport(month, 3, 4.5, currentSnaps, officeIndex)],
    [4, () => generateLowRatingReport(month, currentSnaps, officeIndex)],
    [5, () => generateDecliningReport(month, currentSnaps, officeIndex)],
    [6, () => generateMasterReport(month, currentSnaps, officeIndex)],
  ];

  for (const [reportType, generator] of generators) {
    const entries = await generator();

    await MonthlyReport.findOneAndUpdate(
      { report_month: month, report_type: reportType } as any,
      {
        $set: {
          generated_at: new Date(),
          entries,
          summary: summarise(entries),
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    results.push({ type: reportType, count: entries.length });
    console.log(`  ✅ Type ${reportType}: ${entries.length} offices`);
  }

  console.log(`📊 [Reports] Complete.`);
  return results;
}
