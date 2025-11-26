import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a photo URL by prepending the server base URL if the path is relative
 * @param photoPath - The photo path from the API (e.g., "/uploads/cafes/photo.jpg")
 * @returns The full URL to the photo
 */
export function formatPhotoUrl(photoPath: string | undefined | null): string | undefined {
  if (!photoPath) {
    return undefined;
  }

  // If it's already an absolute URL (starts with http:// or https://), return as-is
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }

  // In development, use relative paths (Vite proxy will handle it)
  if (import.meta.env.DEV) {
    // Ensure photoPath starts with /
    return photoPath.startsWith("/") ? photoPath : `/${photoPath}`;
  }

  // In production, use absolute URLs
  const baseURL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  // Remove /api suffix if present in baseURL for photo paths
  const serverURL = baseURL.replace(/\/api$/, "");

  // Ensure photoPath starts with /
  const normalizedPath = photoPath.startsWith("/") ? photoPath : `/${photoPath}`;

  return `${serverURL}${normalizedPath}`;
}
