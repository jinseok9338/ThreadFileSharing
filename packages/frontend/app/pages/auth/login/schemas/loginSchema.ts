import { z } from "zod";

/**
 * Login form validation schema
 * Uses i18n keys for error messages
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "validation.emailRequired")
    .email("validation.emailInvalid"),
  password: z.string().min(8, "validation.passwordMinLength"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
