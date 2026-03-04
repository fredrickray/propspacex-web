import { z } from "zod";

// ── Reusable field schemas ──
const email = z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address");

const password = z.string().min(1, "Password is required");

// ── Form schemas ──
export const loginSchema = z.object({
    email,
    password,
});

export const forgotPasswordSchema = z.object({
    email,
});

// ── Inferred types ──
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
