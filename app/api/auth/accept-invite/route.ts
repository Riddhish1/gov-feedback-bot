import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, verifyInviteToken, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const isValidToken = await verifyInviteToken(token);
    if (!isValidToken) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ inviteToken: token });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 400 }
      );
    }

    if (user.inviteExpires && new Date() > user.inviteExpires) {
      return NextResponse.json(
        { error: "Invitation token has expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.inviteToken = undefined;
    user.inviteExpires = undefined;
    user.isEmailVerified = true;
    await user.save();

    const authToken = await generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      assignedDistrict: user.assignedDistrict,
      assignedTalukas: user.assignedTalukas,
    });

    await setAuthCookie(authToken);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedDistrict: user.assignedDistrict,
        assignedTalukas: user.assignedTalukas,
      },
    });
  } catch (error) {
    console.error("[Auth Accept Invite]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
