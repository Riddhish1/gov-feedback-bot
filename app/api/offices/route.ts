import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Office from "@/models/Office";

/**
 * GET /api/offices
 * Returns all offices as JSON.
 * Used by the admin QR page.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    const division = searchParams.get('division') || '';
    const dept = searchParams.get('dept') || '';
    const sortKey = searchParams.get('sortKey') || 'office_id';
    const sortDir = searchParams.get('sortDir') === 'asc' ? 1 : -1;

    await connectDB();

    const query: any = {};
    if (search) {
      query.$or = [
        { office_name: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } }
      ];
    }
    if (division) query.division = division;
    if (dept) query.department = dept;

    // Map frontend sort keys to DB schema fields
    const dbSortKey = sortKey === 'name' ? 'office_name' : sortKey === 'dept' ? 'department' : sortKey === 'expected_visitors' ? 'expected_visitors' : sortKey === 'omes' ? 'office_id' : sortKey;

    const total = await Office.countDocuments(query);
    const offices = await Office.find(query)
      .sort({ [dbSortKey]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Fetch available filter lists dynamically
    const divisions = await Office.distinct("division").lean();
    const departments = await Office.distinct("department").lean();

    return NextResponse.json({
      offices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      divisions: divisions.filter(Boolean),
      departments: departments.filter(Boolean)
    });
  } catch (error) {
    console.error("[GET /api/offices]", error);
    return NextResponse.json(
      { error: "Failed to fetch offices" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/offices
 * Creates a new office.
 * Used by the add-office page.
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Generate a unique generic office_id
    // e.g. "OFFICE-123456"
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const generatedId = `OFF-MH-${randomId}`;

    // Extract the needed fields (could also validate using Zod)
    const newOffice = new Office({
      office_id: generatedId,
      office_name: body.officeName,
      department: body.department,
      office_type: body.officeType,
      district: body.district,
      division: body.division,
      state: "Maharashtra", // Hardcoded for this use-case per design
      digipin: body.digipin,
      treasury_code: body.treasuryCode,
      services: body.services || [],
      expected_visitors: body.expectedVisitors ? parseInt(body.expectedVisitors) : null,
      working_hours: {
        from: body.workingHoursFrom,
        to: body.workingHoursTo
      },
      guardian_secretary: body.guardianSecretary || null,
      office_head_contact: {
        name: body.officeHeadName,
        phone: body.officeHeadPhone,
        email: body.officeHeadEmail
      },
      collector_contact: {
        name: body.collectorName,
        phone: body.collectorPhone,
        email: body.collectorEmail
      },
      divisional_commissioner_contact: {
        name: body.divCommName,
        phone: body.divCommPhone,
        email: body.divCommEmail
      },
      address: body.address || null,
      geo: {
        lat: body.geoLat ? parseFloat(body.geoLat) : null,
        lng: body.geoLng ? parseFloat(body.geoLng) : null
      },
      tags: body.tags || [],
      is_active: body.isActive !== undefined ? body.isActive : true,
      metadata: body.metadata || {}
    });

    await newOffice.save();

    return NextResponse.json(
      { message: "Office created successfully", office: newOffice },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/offices]", error);
    return NextResponse.json(
      { error: "Failed to create office" },
      { status: 500 }
    );
  }
}
