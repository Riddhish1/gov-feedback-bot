import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAuth, hashPassword, generateInviteToken, INVITE_TOKEN_EXPIRES } from "@/lib/auth";
import nodemailer from "nodemailer";

async function sendInviteEmail(toEmail: string, name: string, role: string, inviteToken: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invite?token=${inviteToken}`;

  await transporter.sendMail({
    from: `"Gov Feedback System" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME}>`,
    to: toEmail,
    subject: `Invitation to Join Government Feedback System as ${role}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hello ${name},</h2>
        <p>You have been invited to join the Government Feedback System as <strong>${role}</strong>.</p>
        <p>Please click the link below to set your password and complete your registration:</p>
        <p><a href="${inviteUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Set Password</a></p>
        <p>This link will expire in 48 hours.</p>
        <p>If you did not expect this invitation, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Government Feedback System - Maharashtra</p>
      </body>
      </html>
    `,
  });
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth("ADMIN");

    const { name, email, mobile, role, assignedDistrict, assignedTalukas } = await request.json();

    if (!name || !email || !mobile || !role) {
      return NextResponse.json(
        { error: "Name, email, mobile, and role are required" },
        { status: 400 }
      );
    }

    if (!["DISTRICT_HEAD", "TALUKA_HEAD"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const inviteToken = await generateInviteToken();
    const inviteExpires = new Date(Date.now() + INVITE_TOKEN_EXPIRES);

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(tempPassword);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      role,
      assignedDistrict: assignedDistrict || null,
      assignedTalukas: assignedTalukas || [],
      isActive: true,
      isEmailVerified: false,
      inviteToken,
      inviteExpires,
    });

    try {
      await sendInviteEmail(email, name, role.replace("_", " "), inviteToken);
    } catch (emailError) {
      console.error("[Invite Email Failed]", emailError);
      await User.findByIdAndDelete(user._id);
      return NextResponse.json(
        { error: "Failed to send invitation email" },
        { status: 500 }
      );
    }

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
    console.error("[Auth Invite]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const authUser = await requireAuth("ADMIN");
    await connectDB();

    const users = await User.find().select("-password -inviteToken -passwordResetToken").sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[Auth Invite GET]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
