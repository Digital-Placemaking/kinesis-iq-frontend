/**
 * lib/utils.ts
 * General utility functions.
 * Provides className merging utility (cn) for Tailwind CSS class composition.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
