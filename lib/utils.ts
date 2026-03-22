// Shared class name utility
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge conditional and Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
