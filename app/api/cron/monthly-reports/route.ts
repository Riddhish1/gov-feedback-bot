import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { generateAllReports } from "@/lib/reportGenerator";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for heavy aggregation

/**
 * GET /api/cron/monthly-reports
 *
 * Generates all 6 monthly report types for the previous month.
 * Protected by CRON_SECRET. Designed for Vercel Cron (1st of each month).
 *
 * Optional query param: ?month=2026-02 to regenerate a specific month.
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get("authorization");
    const key = request.nextUrl.searchParams.get("key");
    const isCron =
      authHeader === `Bearer ${process.env.CRON_SECRET}` ||
      key === process.env.CRON_SECRET;

    if (process.env.CRON_SECRET && !isCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Determine target month (default = previous month)
    const monthParam = request.nextUrl.searchParams.get("month");
    let targetMonth: string;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      targetMonth = monthParam;
    } else {
      const now = new Date();
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      targetMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
    }

    const results = await generateAllReports(targetMonth);

    return NextResponse.json({
      status: "success",
      month: targetMonth,
      reports: results,
    });
  } catch (error) {
    console.error("[Cron Monthly Reports Error]", error);
    return NextResponse.json(
      { error: "Failed to generate monthly reports" },
      { status: 500 }
    );
  }
}
