import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility helper function to conditionally join classNames and merge tailwind styles.
 *
 * - `clsx`: Handles conditional logic, parsing objects, arrays, and strings into a unified class string.
 * - `twMerge`: Solves the tailwind class conflicts by overriding duplicate/conflicting classes on elements.
 *
 * @param inputs - Array of class names, conditional expressions, or objects of classes.
 * @returns Concatenated, conflict-free class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
