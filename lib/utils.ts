import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-app-source',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Get a Pollinations API key using random selection for load balancing
 * Supports multiple API keys via POLLINATIONS_API_KEY (primary) and POLLINATIONS_API_KEY_2 (secondary)
 * Returns undefined if no keys are configured
 * Uses random selection to avoid race conditions in edge runtime environments
 */
export function getPollinationsApiKey(): string | undefined {
  const keys = [
    process.env.POLLINATIONS_API_KEY,
    process.env.POLLINATIONS_API_KEY_2,
  ].filter(Boolean) as string[];
  
  if (keys.length === 0) {
    return undefined;
  }
  
  // Use random selection to distribute load across keys
  // This is thread-safe and works well in edge runtime environments
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}
