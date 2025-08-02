import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate, authSchemas } from "../middleware/validation";
import { authController } from "../controllers/authController";

const router = Router();

// Public routes
router.post(
  "/register",
  validate(authSchemas.register),
  authController.register
);
router.post("/login", validate(authSchemas.login), authController.login);
router.post(
  "/forgot-password",
  validate(authSchemas.forgotPassword),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(authSchemas.resetPassword),
  authController.resetPassword
);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;
