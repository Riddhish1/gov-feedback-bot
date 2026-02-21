import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Office from "@/models/Office";

/**
 * GET /api/offices
 * Returns all offices as JSON.
 * Used by the admin QR page.
 */
export async function GET() {
  try {
    await connectDB();
    const offices = await Office.find({}).lean().sort({ office_id: 1 });
    return NextResponse.json({ offices });
  } catch (error) {
    console.error("[GET /api/offices]", error);
    return NextResponse.json(
      { error: "Failed to fetch offices" },
      { status: 500 }
    );
  }
}
