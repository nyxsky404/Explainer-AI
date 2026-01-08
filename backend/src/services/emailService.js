import nodemailer from "nodemailer";

// Create a transporter using Ethereal test credentials
// For production, replace with your actual SMTP server details
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "darryl.kling65@ethereal.email",
    pass: "mTErqYn352At9xFZfT",
  },
});

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name (optional)
 * @returns {Promise<Object>} Email send result
 */
export async function sendPasswordResetEmail(
  email,
  resetToken,
  userName = "User"
) {
  try {
    // Construct reset URL (adjust FRONTEND_URL based on your frontend setup)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: '"Explainer AI" <darryl.kling65@ethereal.email>',
      to: email,
      subject: "Password Reset Request",
      text: `Hello ${userName},\n\nYou requested a password reset. Please click the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nPodcast App Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>You requested a password reset. Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
          <p style="color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Best regards,<br>Podcast App Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info), // Ethereal provides preview URL
    };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Verify email transporter connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log("Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("Email server connection error:", error);
    return false;
  }
}
