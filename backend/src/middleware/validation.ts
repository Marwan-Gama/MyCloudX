import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors,
        });
      } else {
        next(error);
      }
    }
  };
};

// Validation schemas
export const authSchemas = {
  register: z.object({
    body: z.object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required"),
    }),
  }),

  forgotPassword: z.object({
    body: z.object({
      email: z.string().email("Invalid email address"),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      token: z.string().min(1, "Token is required"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }),
  }),
};

export const fileSchemas = {
  upload: z.object({
    body: z.object({
      category: z.string().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      name: z
        .string()
        .min(1, "File name is required")
        .max(255, "File name too long")
        .optional(),
      category: z.string().optional(),
    }),
    params: z.object({
      id: z.string().min(1, "File ID is required"),
    }),
  }),

  share: z.object({
    body: z.object({
      userEmail: z.string().email("Invalid email address"),
    }),
    params: z.object({
      id: z.string().min(1, "File ID is required"),
    }),
  }),

  getFiles: z.object({
    query: z.object({
      category: z.enum(["Home", "My Files", "Shared", "Trash"]).optional(),
      search: z.string().optional(),
      sortBy: z.enum(["name", "date", "size"]).optional(),
      sortDirection: z.enum(["asc", "desc"]).optional(),
      page: z
        .string()
        .transform((val) => parseInt(val))
        .pipe(z.number().min(1))
        .optional(),
      limit: z
        .string()
        .transform((val) => parseInt(val))
        .pipe(
          z
            .number()
            .min(1)
            .max(100)
        )
        .optional(),
    }),
  }),
};

export const userSchemas = {
  updateProfile: z.object({
    body: z.object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .optional(),
      avatar: z
        .string()
        .url("Invalid avatar URL")
        .optional(),
    }),
  }),
};
