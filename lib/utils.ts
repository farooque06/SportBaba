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

export function isValidName(value: string) {
  return value.trim().length >= 2 && value.trim().length <= MAX_NAME_LENGTH;
}

export function isValidPhone(value: string) {
  return /^\d{10}$/.test(value);
}

export function isValidEmail(value: string) {
  return value.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
