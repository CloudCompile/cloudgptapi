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

// Round-robin counter for API key selection
let pollinationsKeyIndex = 0;

/**
 * Get a Pollinations API key using round-robin load balancing
 * Supports multiple API keys via POLLINATIONS_API_KEY (primary) and POLLINATIONS_API_KEY_2 (secondary)
 * Returns undefined if no keys are configured
 */
export function getPollinationsApiKey(): string | undefined {
  const keys = [
    process.env.POLLINATIONS_API_KEY,
    process.env.POLLINATIONS_API_KEY_2,
  ].filter(Boolean) as string[];
  
  if (keys.length === 0) {
    return undefined;
  }
  
  // Use round-robin to distribute load across keys
  const key = keys[pollinationsKeyIndex % keys.length];
  pollinationsKeyIndex = (pollinationsKeyIndex + 1) % keys.length;
  
  return key;
}
