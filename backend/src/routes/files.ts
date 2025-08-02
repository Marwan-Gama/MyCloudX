import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth";
import { validate, fileSchemas } from "../middleware/validation";
import { fileController } from "../controllers/fileController";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "52428800"), // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(",") || [
      "image/*",
      "video/*",
      "audio/*",
      "application/pdf",
      "text/*",
    ];

    const isAllowed = allowedTypes.some((type) => {
      if (type.endsWith("/*")) {
        return file.mimetype.startsWith(type.slice(0, -2));
      }
      return file.mimetype === type;
    });

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// File CRUD operations
router.get("/", validate(fileSchemas.getFiles), fileController.getFiles);
router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/:id", fileController.getFile);
router.put("/:id", validate(fileSchemas.update), fileController.updateFile);
router.delete("/:id", fileController.deleteFile);
router.post("/:id/restore", fileController.restoreFile);

// File sharing
router.post(
  "/:id/share",
  validate(fileSchemas.share),
  fileController.shareFile
);
router.delete("/:id/share/:userId", fileController.unshareFile);
router.get("/:id/shares", fileController.getFileShares);

// File download
router.get("/:id/download", fileController.downloadFile);

// Storage usage
router.get("/storage/usage", fileController.getStorageUsage);

export default router;
