import { Request, Response } from "express";
import { prisma } from "../index";
import { generateToken } from "../utils/jwt";
import {
  hashPassword,
  comparePassword,
  validatePassword,
} from "../utils/password";
import { sendEmail, createPasswordResetEmail } from "../utils/email";
import { AuthenticatedRequest } from "../types";
import { CustomError } from "../middleware/errorHandler";
import crypto from "crypto";

export const authController = {
  // Register new user
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new CustomError("User with this email already exists", 400);
      }

      // Validate password
      if (!validatePassword(password)) {
        throw new CustomError(
          "Password must be at least 8 characters long and contain uppercase, lowercase, and number",
          400
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      });

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      // Set HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        data: { user },
        message: "User registered successfully",
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  },

  // Login user
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new CustomError("Invalid email or password", 401);
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError("Invalid email or password", 401);
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      // Set HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt,
          },
        },
        message: "Login successful",
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  },

  // Logout user
  logout: async (req: AuthenticatedRequest, res: Response) => {
    res.clearCookie("token");
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  },

  // Get current user
  getMe: async (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      data: { user: req.user },
    });
  },

  // Forgot password
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists or not
        res.json({
          success: true,
          message:
            "If an account with that email exists, a password reset link has been sent",
        });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Save reset token to database
      await prisma.passwordResetToken.create({
        data: {
          token: hashedToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // Create reset URL
      const resetUrl = `${process.env.FRONTEND_URL ||
        "http://localhost:3000"}/reset-password?token=${resetToken}`;

      // Send email
      const emailTemplate = createPasswordResetEmail(resetUrl, user.name);
      await sendEmail(user.email, emailTemplate);

      res.json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // Reset password
  resetPassword: async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      // Hash the token
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Find valid reset token
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token: hashedToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!resetToken) {
        throw new CustomError("Invalid or expired reset token", 400);
      }

      // Validate new password
      if (!validatePassword(password)) {
        throw new CustomError(
          "Password must be at least 8 characters long and contain uppercase, lowercase, and number",
          400
        );
      }

      // Update password
      const hashedPassword = await hashPassword(password);
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      // Delete all reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      });

      res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  },
};
