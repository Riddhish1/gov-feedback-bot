import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, generateToken, setAuthCookie, verifyToken } from "@/lib/auth";

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

    // Verify the token using jose (Edge-compatible)
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if this is a password reset token
    // Note: We need to check the token type - since we don't store type in JWT payload
    // we'll check if user has this token in database
    await connectDB();

    const user = await User.findOne({ passwordResetToken: token });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      );
    }

    if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
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
      },
    });
  } catch (error) {
    console.error("[Auth Reset Password]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
