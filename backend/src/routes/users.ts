import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate, userSchemas } from "../middleware/validation";
import { userController } from "../controllers/userController";

const router = Router();

// All routes require authentication
router.use(authenticate);

// User profile operations
router.get("/profile", userController.getProfile);
router.put(
  "/profile",
  validate(userSchemas.updateProfile),
  userController.updateProfile
);
router.delete("/profile", userController.deleteAccount);

// User search (for sharing files)
router.get("/search", userController.searchUsers);

export default router;
