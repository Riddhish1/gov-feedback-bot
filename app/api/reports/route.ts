import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MonthlyReport from "@/models/MonthlyReport";

export const dynamic = "force-dynamic";

/**
 * GET /api/reports
 *
 * Fetches report data with advanced filtering and search.
 *
 * Query params:
 *   type     — Report type 1–6 (default: 6)
 *   month    — "YYYY-MM" (default: latest available)
 *   district — Filter by district name (case-insensitive substring)
 *   region   — Filter by region name
 *   star     — Min average rating filter (e.g. star=4 → avg_rating >= 4)
 *   service  — Filter entries that have this service in their breakdown
 *   search   — Fuzzy search across office_name and office_id
 *   sort     — Sort field: "rating" | "submissions" | "name" | "district" (default: rating desc)
 *   order    — "asc" | "desc" (default: desc)
 *   page     — Page number (default: 1)
 *   limit    — Items per page (default: 50, max: 200)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const params = request.nextUrl.searchParams;

    const reportType = parseInt(params.get("type") || "6", 10);
    const district   = params.get("district") || "";
    const region     = params.get("region") || "";
    const starMin    = parseFloat(params.get("star") || "0");
    const service    = params.get("service") || "";
    const search     = params.get("search") || "";
    const sortField  = params.get("sort") || "rating";
    const sortOrder  = params.get("order") === "asc" ? 1 : -1;
    const page       = Math.max(1, parseInt(params.get("page") || "1", 10));
    const limit      = Math.min(200, Math.max(1, parseInt(params.get("limit") || "50", 10)));

    // Determine target month
    let targetMonth = params.get("month") || "";

    if (!targetMonth) {
      // Find the latest available report for this type
      const latest = await MonthlyReport.findOne({ report_type: reportType } as any)
        .sort({ report_month: -1 })
        .select("report_month")
        .lean();

      targetMonth = latest?.report_month || "";
    }

    if (!targetMonth) {
      return NextResponse.json({
        entries: [],
        summary: { total_offices: 0, avg_rating: 0 },
        pagination: { page, limit, total: 0, totalPages: 0 },
        month: "",
        report_type: reportType,
        available_months: [],
      });
    }

    // Fetch the report document
    const report = await MonthlyReport.findOne({
      report_month: targetMonth,
      report_type: reportType,
    } as any).lean();

    if (!report) {
      // Get available months for this type
      const available = await MonthlyReport.distinct("report_month", { report_type: reportType } as any);
      return NextResponse.json({
        entries: [],
        summary: { total_offices: 0, avg_rating: 0 },
        pagination: { page, limit, total: 0, totalPages: 0 },
        month: targetMonth,
        report_type: reportType,
        available_months: available.sort().reverse(),
      });
    }

    // Filter entries in-memory (reports are pre-computed, entries array is bounded)
    let filtered = report.entries;

    if (district) {
      const lc = district.toLowerCase();
      filtered = filtered.filter(e => e.district.toLowerCase().includes(lc));
    }

    if (region) {
      const lc = region.toLowerCase();
      filtered = filtered.filter(e => e.region.toLowerCase().includes(lc));
    }

    if (starMin > 0) {
      filtered = filtered.filter(e => e.avg_rating >= starMin);
    }

    if (service) {
      const lc = service.toLowerCase();
      filtered = filtered.filter(e =>
        Object.keys(e.service_breakdown).some(k => k.toLowerCase().includes(lc))
      );
    }

    if (search) {
      const lc = search.toLowerCase();
      filtered = filtered.filter(e =>
        e.office_name.toLowerCase().includes(lc) ||
        e.office_id.toLowerCase().includes(lc) ||
        e.district.toLowerCase().includes(lc)
      );
    }

    // Sort
    const sortKeyMap: Record<string, (e: typeof filtered[0]) => number | string> = {
      rating:      e => e.avg_rating,
      submissions: e => e.submission_count,
      name:        e => e.office_name.toLowerCase(),
      district:    e => e.district.toLowerCase(),
    };

    const sortFn = sortKeyMap[sortField] || sortKeyMap.rating;
    filtered.sort((a, b) => {
      const va = sortFn(a);
      const vb = sortFn(b);
      if (typeof va === "number" && typeof vb === "number") {
        return sortOrder * (va - vb);
      }
      return sortOrder * String(va).localeCompare(String(vb));
    });

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    // Recalculate summary for filtered set
    const filteredAvg = total > 0
      ? Number((filtered.reduce((s, e) => s + e.avg_rating, 0) / total).toFixed(2))
      : 0;

    // Get available months
    const available = await MonthlyReport.distinct("report_month", { report_type: reportType } as any);

    return NextResponse.json({
      entries: paginated,
      summary: { total_offices: total, avg_rating: filteredAvg },
      pagination: { page, limit, total, totalPages },
      month: targetMonth,
      report_type: reportType,
      generated_at: report.generated_at,
      available_months: available.sort().reverse(),
    });
  } catch (error) {
    console.error("[GET /api/reports]", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
