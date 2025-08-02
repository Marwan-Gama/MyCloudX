import nodemailer from "nodemailer";
import { EmailTemplate } from "../types";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email
export const sendEmail = async (
  to: string,
  template: EmailTemplate
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  };

  await transporter.sendMail(mailOptions);
};

// Email templates
export const createPasswordResetEmail = (
  resetUrl: string,
  userName: string
): EmailTemplate => ({
  subject: "MyCloudX - Password Reset Request",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hello ${userName},</h2>
      <p>You requested a password reset for your MyCloudX account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Reset Password
      </a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The MyCloudX Team</p>
    </div>
  `,
  text: `
    Hello ${userName},
    
    You requested a password reset for your MyCloudX account.
    
    Click the following link to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request this password reset, please ignore this email.
    
    Best regards,
    The MyCloudX Team
  `,
});

export const createFileSharedEmail = (
  fileName: string,
  sharedByUserName: string,
  sharedWithUserName: string
): EmailTemplate => ({
  subject: `MyCloudX - File Shared: ${fileName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hello ${sharedWithUserName},</h2>
      <p><strong>${sharedByUserName}</strong> has shared a file with you on MyCloudX.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #333;">File Details:</h3>
        <p style="margin: 0;"><strong>File Name:</strong> ${fileName}</p>
        <p style="margin: 5px 0 0 0;"><strong>Shared by:</strong> ${sharedByUserName}</p>
      </div>
      <p>You can now access this file in your "Shared" folder on MyCloudX.</p>
      <p>Best regards,<br>The MyCloudX Team</p>
    </div>
  `,
  text: `
    Hello ${sharedWithUserName},
    
    ${sharedByUserName} has shared a file with you on MyCloudX.
    
    File Details:
    - File Name: ${fileName}
    - Shared by: ${sharedByUserName}
    
    You can now access this file in your "Shared" folder on MyCloudX.
    
    Best regards,
    The MyCloudX Team
  `,
});
