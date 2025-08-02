import { Response } from "express";
import { prisma } from "../index";
import { AuthenticatedRequest } from "../types";
import { CustomError } from "../middleware/errorHandler";

export const userController = {
  // Get user profile
  getProfile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      res.json({
        success: true,
        data: { user },
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
          error: "Failed to fetch profile",
        });
      }
    }
  },

  // Update user profile
  updateProfile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { name, avatar } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (avatar) updateData.avatar = avatar;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: { user: updatedUser },
        message: "Profile updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
    }
  },

  // Delete user account
  deleteAccount: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      // Delete all user's files from S3 and database
      const userFiles = await prisma.file.findMany({
        where: { ownerId: userId },
      });

      // Note: In a real application, you would also delete files from S3 here
      // For now, we'll just delete from database

      // Delete all file shares
      await prisma.fileShare.deleteMany({
        where: {
          OR: [{ sharedByUserId: userId }, { sharedWithUserId: userId }],
        },
      });

      // Delete all password reset tokens
      await prisma.passwordResetToken.deleteMany({
        where: { userId },
      });

      // Delete all files
      await prisma.file.deleteMany({
        where: { ownerId: userId },
      });

      // Delete user
      await prisma.user.delete({
        where: { id: userId },
      });

      // Clear authentication cookie
      res.clearCookie("token");

      res.json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to delete account",
      });
    }
  },

  // Search users (for file sharing)
  searchUsers: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { q } = req.query;
      const userId = req.user!.id;

      if (!q || typeof q !== "string") {
        throw new CustomError("Search query is required", 400);
      }

      const users = await prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            },
            { id: { not: userId } }, // Exclude current user
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
        take: 10,
      });

      res.json({
        success: true,
        data: { users },
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
          error: "Failed to search users",
        });
      }
    }
  },
};
