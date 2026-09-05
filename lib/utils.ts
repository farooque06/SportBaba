import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: any) {
  const num = Number(amount) || 0;
  return `NRS ${num.toLocaleString()}`;
}
export function getWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const finalPhone = cleanPhone.length === 10 ? `977${cleanPhone}` : cleanPhone;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
}

export const MAX_NAME_LENGTH = 80;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_PHONE_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 128;

/**
 * Validates that a string contains only letters, spaces, hyphens, and apostrophes (min 2, max 80 chars).
 * Blocks numbers and special symbols.
 */
export function isAlphabeticName(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > MAX_NAME_LENGTH) return false;
  return /^[a-zA-Z\s.'-]+$/.test(trimmed);
}

export function isValidName(value: string) {
  return isAlphabeticName(value);
}

export function isValidPhone(value: string) {
  return /^\d{10}$/.test(value);
}

export function isValidEmail(value: string) {
  return value.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Filters input to keep strictly digits [0-9] up to maxDigits.
 */
export function sanitizeNumericInput(value: string, maxDigits?: number): string {
  const digits = value.replace(/\D/g, "");
  return maxDigits ? digits.slice(0, maxDigits) : digits;
}

/**
 * Filters input to allow only valid numeric/decimal amounts (positive numbers).
 */
export function sanitizeDecimalInput(value: string): string {
  // Allow digits and at most one decimal point
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return cleaned;
}

/**
 * Validates date of birth: must be a valid date, user must be at least 13 years old.
 */
export function isValidDateOfBirth(value: string): boolean {
  if (!value) return false;
  const dob = new Date(value);
  if (isNaN(dob.getTime())) return false;
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
  return actualAge >= 13 && actualAge <= 120;
}

/**
 * Validates city name: letters, spaces, hyphens (2-100 chars).
 */
export function isValidCity(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  return /^[a-zA-Z\s.'-]+$/.test(trimmed);
}

/**
 * Evaluates password strength: weak / fair / strong.
 */
export function getPasswordStrength(password: string): 'weak' | 'fair' | 'strong' {
  if (!password || password.length < 8) return 'weak';
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  return 'strong';
}
