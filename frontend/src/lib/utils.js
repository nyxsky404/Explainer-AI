import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function truncateUrl(url, maxLength = 50) {
  if (!url) return '';
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength) + '...';
}
