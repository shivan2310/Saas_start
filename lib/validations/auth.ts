import { z } from "zod";

// This deliberately validates the common, deliverable public-email shape.
// Ownership is confirmed separately through Supabase's verification email.
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email address is too long")
  .email("Invalid email address")
  .refine((email) => {
    const domain = email.slice(email.lastIndexOf("@") + 1);
    return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain);
  }, "Enter a valid email address with a domain, such as name@example.com");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
