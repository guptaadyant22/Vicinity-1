// Shared utility for merging conditional class names with Tailwind CSS classes.
// Combines clsx for conditional logic and twMerge to resolve Tailwind conflicts.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge and de-duplicate Tailwind + conditional classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
