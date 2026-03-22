import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generatePasswordResetToken, PASSWORD_RESET_EXPIRES } from "@/lib/auth";
import nodemailer from "nodemailer";

async function sendResetEmail(toEmail: string, name: string, resetToken: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"Gov Feedback System" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME}>`,
    to: toEmail,
    subject: "Password Reset - Government Feedback System",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hello ${name},</h2>
        <p>We received a request to reset your password.</p>
        <p>Please click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Government Feedback System - Maharashtra</p>
      </body>
      </html>
    `,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "If the email exists, a reset link will be sent" },
        { status: 200 }
      );
    }

    const resetToken = await generatePasswordResetToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRES);
    await user.save();

    try {
      await sendResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error("[Reset Email Failed]", emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If the email exists, a reset link will be sent",
    });
  } catch (error) {
    console.error("[Auth Forgot Password]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
