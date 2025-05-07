import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getFileType(url: string): 'image' | 'video' | 'unknown' {
  const extension = url.split('.').pop()?.toLowerCase();
  
  if (!extension) return 'unknown';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
    return 'image';
  }
  
  if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
    return 'video';
  }
  
  return 'unknown';
}

export function getAdTypeName(adType: string): string {
  const mapping: Record<string, string> = {
    'SOCIAL_MEDIA': 'Social Media',
    'SEARCH': 'Search',
    'NATIVE': 'Native',
    'YOUTUBE': 'YouTube',
  };
  
  return mapping[adType] || adType;
} 