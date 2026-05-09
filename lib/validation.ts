import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone in E.164 format (e.g. +14155552671)");

export const otpSchema = z.string().length(6, "Enter the 6-digit code").regex(/^\d{6}$/);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["BUYER", "SELLER", "AGENT"]),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const sendOtpSchema = z.object({ phone: phoneSchema });
export type SendOtpInput = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: otpSchema,
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["BUYER", "SELLER", "AGENT"]).optional(),
  avatar: z.string().url().optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;
