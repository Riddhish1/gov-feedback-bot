import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserById } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await requireAuth();
    const user = await getUserById(authUser.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        assignedDistrict: user.assignedDistrict,
        assignedTalukas: user.assignedTalukas,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("[Auth Me]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
