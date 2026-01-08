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
 * Get all available Pollinations API keys
 */
export function getPollinationsApiKeys(): string[] {
  const keys = [
    process.env.POLLINATIONS_API_KEY,
    process.env.POLLINATIONS_API_KEY_1,
    process.env.POLLINATIONS_API_KEY_2,
    process.env.POLLINATIONS_API_KEY_3,
    process.env.POLLINATIONS_API_KEY_4,
    process.env.POLLINATIONS_API_KEY_5,
    process.env.POLLINATIONS_KEY_3,
  ].filter(Boolean) as string[];
  
  return Array.from(new Set(keys));
}

/**
 * Get a Pollinations API key using random selection for load balancing
 * Supports multiple API keys via POLLINATIONS_API_KEY (primary) and numbered versions
 * Returns undefined if no keys are configured
 * Uses random selection to avoid race conditions in edge runtime environments
 */
export function getPollinationsApiKey(): string | undefined {
  const keys = getPollinationsApiKeys();
  
  if (keys.length === 0) {
    return undefined;
  }
  
  // Use random selection to distribute load across keys
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Get OpenRouter API keys for fallback and load balancing
 * Supports multiple API keys via OPENROUTER_API_KEY and OPENROUTER_FALLBACK_KEY
 * Also looks for OPENROUTER_API_KEY_1 through OPENROUTER_API_KEY_5
 */
export function getOpenRouterApiKeys(): string[] {
  const keys = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_FALLBACK_KEY,
    process.env.OPENROUTER_API_KEY_1,
    process.env.OPENROUTER_API_KEY_2,
    process.env.OPENROUTER_API_KEY_3,
    process.env.OPENROUTER_API_KEY_4,
    process.env.OPENROUTER_API_KEY_5,
  ].filter(Boolean) as string[];

  // Return unique keys to avoid trying the same key multiple times in fallback logic
  return Array.from(new Set(keys));
}

/**
 * Get a single OpenRouter API key using random selection
 */
export function getOpenRouterApiKey(): string | undefined {
  const keys = getOpenRouterApiKeys();
  if (keys.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}
