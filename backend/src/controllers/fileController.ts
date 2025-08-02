import { Request, Response } from "express";
import { prisma } from "../index";
import {
  uploadToS3,
  generateSignedUrl,
  deleteFromS3,
  generateFileKey,
} from "../utils/s3";
import { sendEmail, createFileSharedEmail } from "../utils/email";
import { AuthenticatedRequest } from "../types";
import { CustomError } from "../middleware/errorHandler";

export const fileController = {
  // Get files with filtering and pagination
  getFiles: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        category,
        search,
        sortBy = "date",
        sortDirection = "desc",
        page = 1,
        limit = 20,
      } = req.query;
      const userId = req.user!.id;

      // Build where clause based on category
      let whereClause: any = { isDeleted: false };

      if (category === "My Files") {
        whereClause.ownerId = userId;
      } else if (category === "Shared") {
        whereClause.sharedWith = {
          some: {
            sharedWithUserId: userId,
          },
        };
      } else if (category === "Trash") {
        whereClause.isDeleted = true;
        whereClause.ownerId = userId;
      } else {
        // Home - show all user's files and shared files
        whereClause.OR = [
          { ownerId: userId },
          {
            sharedWith: {
              some: {
                sharedWithUserId: userId,
              },
            },
          },
        ];
      }

      // Add search filter
      if (search) {
        whereClause.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { originalName: { contains: search as string, mode: "insensitive" } },
        ];
      }

      // Build order clause
      const orderBy: any = {};
      if (sortBy === "name") {
        orderBy.name = sortDirection;
      } else if (sortBy === "size") {
        orderBy.size = sortDirection;
      } else {
        orderBy.createdAt = sortDirection;
      }

      // Get total count
      const total = await prisma.file.count({ where: whereClause });

      // Get files with pagination
      const files = await prisma.file.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          sharedWith: {
            include: {
              sharedWithUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });

      res.json({
        success: true,
        data: files,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch files",
      });
    }
  },

  // Upload file
  uploadFile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        throw new CustomError("No file uploaded", 400);
      }

      const { category = "My Files" } = req.body;
      const userId = req.user!.id;
      const file = req.file;

      // Generate unique S3 key
      const s3Key = generateFileKey(userId, file.originalname);

      // Upload to S3
      const uploadResult = await uploadToS3(file.buffer, s3Key, file.mimetype);

      // Save file metadata to database
      const savedFile = await prisma.file.create({
        data: {
          name: file.originalname,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          s3Key: uploadResult.key,
          s3Url: uploadResult.url,
          category,
          ownerId: userId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: { file: savedFile },
        message: "File uploaded successfully",
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
          error: "Failed to upload file",
        });
      }
    }
  },

  // Get single file
  getFile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const file = await prisma.file.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              sharedWith: {
                some: {
                  sharedWithUserId: userId,
                },
              },
            },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          sharedWith: {
            include: {
              sharedWithUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!file) {
        throw new CustomError("File not found", 404);
      }

      res.json({
        success: true,
        data: { file },
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
          error: "Failed to fetch file",
        });
      }
    }
  },

  // Update file
  updateFile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, category } = req.body;
      const userId = req.user!.id;

      const file = await prisma.file.findFirst({
        where: {
          id,
          ownerId: userId,
          isDeleted: false,
        },
      });

      if (!file) {
        throw new CustomError("File not found", 404);
      }

      const updatedFile = await prisma.file.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(category && { category }),
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: { file: updatedFile },
        message: "File updated successfully",
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
          error: "Failed to update file",
        });
      }
    }
  },

  // Delete file (soft delete)
  deleteFile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const file = await prisma.file.findFirst({
        where: {
          id,
          ownerId: userId,
          isDeleted: false,
        },
      });

      if (!file) {
        throw new CustomError("File not found", 404);
      }

      await prisma.file.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: "File moved to trash",
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
          error: "Failed to delete file",
        });
      }
    }
  },

  // Restore file from trash
  restoreFile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const file = await prisma.file.findFirst({
        where: {
          id,
          ownerId: userId,
          isDeleted: true,
        },
      });

      if (!file) {
        throw new CustomError("File not found in trash", 404);
      }

      await prisma.file.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });

      res.json({
        success: true,
        message: "File restored successfully",
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
          error: "Failed to restore file",
        });
      }
    }
  },

  // Share file
  shareFile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { userEmail } = req.body;
      const userId = req.user!.id;

      // Check if file exists and user owns it
      const file = await prisma.file.findFirst({
        where: {
          id,
          ownerId: userId,
          isDeleted: false,
        },
      });

      if (!file) {
        throw new CustomError("File not found", 404);
      }

      // Find user to share with
      const userToShareWith = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!userToShareWith) {
        throw new CustomError("User not found", 404);
      }

      if (userToShareWith.id === userId) {
        throw new CustomError("Cannot share file with yourself", 400);
      }

      // Check if already shared
      const existingShare = await prisma.fileShare.findUnique({
        where: {
          fileId_sharedWithUserId: {
            fileId: id,
            sharedWithUserId: userToShareWith.id,
          },
        },
      });

      if (existingShare) {
        throw new CustomError("File already shared with this user", 400);
      }

      // Create share
      await prisma.fileShare.create({
        data: {
          fileId: id,
          sharedByUserId: userId,
          sharedWithUserId: userToShareWith.id,
        },
      });

      // Send email notification
      try {
        const emailTemplate = createFileSharedEmail(
          file.name,
          req.user!.name,
          userToShareWith.name
        );
        await sendEmail(userToShareWith.email, emailTemplate);
      } catch (emailError) {
        console.error("Failed to send share notification email:", emailError);
      }

      res.json({
        success: true,
        message: "File shared successfully",
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
          error: "Failed to share file",
        });
      }
    }
  },

  // Unshare file
  unshareFile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id, userId: sharedUserId } = req.params;
      const userId = req.user!.id;

      // Check if file exists and user owns it
      const file = await prisma.file.findFirst({
        where: {
          id,
          ownerId: userId,
          isDeleted: false,
        },
      });

      if (!file) {
        throw new CustomError("File not found", 404);
      }

      // Delete share
      await prisma.fileShare.deleteMany({
        where: {
          fileId: id,
          sharedWithUserId: sharedUserId,
        },
      });

      res.json({
        success: true,
        message: "File unshared successfully",
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
          error: "Failed to unshare file",
        });
      }
    }
  },

  // Get file shares
  getFileShares: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const file = await prisma.file.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              sharedWith: {
                some: {
                  sharedWithUserId: userId,
                },
              },
            },
          ],
        },
      });

      if (!file) {
        throw new CustomError("File not found", 404);
      }

      const shares = await prisma.fileShare.findMany({
        where: { fileId: id },
        include: {
          sharedWithUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: { shares },
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
          error: "Failed to fetch file shares",
        });
      }
    }
  },

  // Download file
  downloadFile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const file = await prisma.file.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              sharedWith: {
                some: {
                  sharedWithUserId: userId,
                },
              },
            },
          ],
          isDeleted: false,
        },
      });

      if (!file) {
        throw new CustomError("File not found", 404);
      }

      // Generate signed URL for download
      const downloadUrl = await generateSignedUrl(file.s3Key, 3600); // 1 hour

      res.json({
        success: true,
        data: {
          downloadUrl,
          fileName: file.originalName,
          mimeType: file.mimeType,
        },
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
          error: "Failed to generate download link",
        });
      }
    }
  },

  // Get storage usage
  getStorageUsage: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const result = await prisma.file.aggregate({
        where: {
          ownerId: userId,
          isDeleted: false,
        },
        _sum: {
          size: true,
        },
        _count: {
          id: true,
        },
      });

      const totalSize = result._sum.size || 0;
      const fileCount = result._count.id || 0;

      res.json({
        success: true,
        data: {
          totalSize,
          fileCount,
          totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch storage usage",
      });
    }
  },
};
