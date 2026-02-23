import nodemailer from "nodemailer";

/**
 * Creates the proper mail transporter based on environment.
 * Production: uses real SMTP credentials from env vars.
 * Development: creates an Ethereal test account on-the-fly.
 */
async function createTransporter() {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables are required in production.");
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development: auto-create a free Ethereal test account
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetToken, userName = "User") {
  const transporter = await createTransporter();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Explainer AI" <${process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@explainer-ai.app"}>`,
    to: email,
    subject: "Password Reset Request — Explainer AI",
    text: `Hello ${userName},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.\n\nBest regards,\nExplainer AI Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
        <p style="color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Best regards,<br>Explainer AI Team</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("Email preview URL:", previewUrl);
  }

  return {
    success: true,
    messageId: info.messageId,
    previewUrl: previewUrl || undefined,
  };
}

/**
 * Verify email transporter connection
 */
export async function verifyEmailConnection() {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    console.log("Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("Email server connection error:", error);
    return false;
  }
}



