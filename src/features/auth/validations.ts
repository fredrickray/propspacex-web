import { z } from "zod";

// ── Reusable field schemas ──
const email = z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address");

const password = z.string().min(8, "Password is required");

// ── Form schemas ──
export const signupSchema = z.object({
    email,
    password,
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    appRole: z.enum(['buyer', 'agent']),
});
export const loginSchema = z.object({
    email,
    password,
});

export const forgotPasswordSchema = z.object({
    email,
});

// ── Inferred types ──
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
