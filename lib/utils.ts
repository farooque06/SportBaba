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
  // Remove non-numeric characters from phone
  const cleanPhone = phone.replace(/\D/g, "");
  // If phone doesn't have country code, assume Nepal (+977)
  const finalPhone = cleanPhone.length === 10 ? `977${cleanPhone}` : cleanPhone;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
}
