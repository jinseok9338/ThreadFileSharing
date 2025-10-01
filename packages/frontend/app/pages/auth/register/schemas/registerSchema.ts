import { z } from "zod";

/**
 * Register form validation schema
 * Uses i18n keys for error messages
 */
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "validation.nameMinLength")
    .max(100, "validation.nameMaxLength"),
  email: z.email("validation.emailInvalid"),
  companyName: z
    .string()
    .min(2, "validation.companyNameMinLength")
    .max(100, "validation.companyNameMaxLength"),
  password: z
    .string()
    .min(8, "validation.passwordMinLength")
    .regex(/[A-Z]/, "validation.passwordUppercase")
    .regex(/[0-9]/, "validation.passwordNumber")
    .regex(/[!@#$%^&*]/, "validation.passwordSpecialChar"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
