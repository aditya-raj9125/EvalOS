import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    role: z.enum(["teacher", "admin"], {
      message: "Please select a role",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Upload Wizard ────────────────────────────────────────────────────────────

export const batchConfigSchema = z.object({
  batchName: z
    .string()
    .min(3, "Batch name must be at least 3 characters")
    .max(100, "Batch name too long"),
  subject: z.string().min(1, "Subject is required"),
  expectedMarks: z
    .number({ message: "Expected marks must be a number" })
    .min(1, "Must be at least 1")
    .max(1000, "Cannot exceed 1000"),
  enableStudentPortal: z.boolean().default(false),
  accessCode: z.string().optional(),
  notifyOnComplete: z.boolean().default(false),
}).refine(
  (data) =>
    !data.enableStudentPortal ||
    (data.accessCode && data.accessCode.length >= 4),
  {
    message: "Access code must be at least 4 characters when portal is enabled",
    path: ["accessCode"],
  }
);

export const rubricSchema = z.object({
  questionPaper: z
    .instanceof(File, { message: "Question paper PDF is required" })
    .refine(
      (f) => f.type === "application/pdf",
      "Question paper must be a PDF"
    ),
  markingScheme: z
    .instanceof(File, { message: "Marking scheme PDF is required" })
    .refine(
      (f) => f.type === "application/pdf",
      "Marking scheme must be a PDF"
    ),
  guidelines: z.string().max(2000, "Guidelines too long").optional(),
});

// ─── Review ───────────────────────────────────────────────────────────────────

export const overrideScoreSchema = z.object({
  newScore: z
    .number({ message: "Score must be a number" })
    .min(0, "Score cannot be negative"),
  reason: z.string().min(10, "Please provide a reason for the override"),
});

// ─── Student ──────────────────────────────────────────────────────────────────

export const studentLookupSchema = z.object({
  rollNumber: z
    .string()
    .min(1, "Roll number is required")
    .regex(/^[A-Za-z0-9-]+$/, "Invalid roll number format"),
});

// ─── Exported types ───────────────────────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BatchConfigFormData = z.infer<typeof batchConfigSchema>;
export type RubricFormData = z.infer<typeof rubricSchema>;
export type OverrideScoreFormData = z.infer<typeof overrideScoreSchema>;
export type StudentLookupFormData = z.infer<typeof studentLookupSchema>;
