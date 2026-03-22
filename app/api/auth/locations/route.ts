import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Office from "@/models/Office";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth("ADMIN");

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const district = searchParams.get("district");

    if (district) {
      const talukas = await Office.distinct("taluka", { district: district, taluka: { $nin: [null, ""] } });
      return NextResponse.json({ talukas: talukas.filter(Boolean).sort() });
    }

    const districts = await Office.distinct("district", { state: "Maharashtra" });
    const divisions = await Office.distinct("division", { state: "Maharashtra", division: { $nin: [null, ""] } });

    return NextResponse.json({
      divisions: divisions.filter(Boolean).sort(),
      districts: districts.filter(Boolean).sort(),
    });
  } catch (error) {
    console.error("[Auth Locations]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
