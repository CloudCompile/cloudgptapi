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
  const invalidKeys = [
    'sk_v36iYt2n9Xm4PqW7zR5bL8kH1jD0vS9u', // Expired/Invalid Key 1 (Confirmed unresponsive)
    'sk_nun1ulPVBLupdJrHBF7CGwIgBAoJsEV3', // Key 4 (Requested removal / Insufficient balance)
    'sk_dk0IDDUCHuz2RUyEZtAJ668NKMd6d5Vv', // Hardcoded Priority Key (Requested removal)
  ];

  const keys = [
    process.env.POLLINATIONS_API_KEY_2,
    process.env.POLLINATIONS_API_KEY,
    process.env.POLLINATIONS_API_KEY_1,
    process.env.POLLINATIONS_API_KEY_3,
    process.env.POLLINATIONS_API_KEY_5,
    process.env.POLLINATIONS_KEY_3,
  ].filter(Boolean) as string[];
  
  // Filter out invalid keys and duplicates
  return Array.from(new Set(keys)).filter(key => !invalidKeys.includes(key));
}

/**
 * Get all available Claude-specific API keys
 */
export function getClaudeApiKeys(): string[] {
  const keys = [
    process.env.CLAUDE_API_KEY,
    process.env.ANTHROPIC_API_KEY,
  ].filter(Boolean) as string[];
  
  return Array.from(new Set(keys));
}

/**
 * Get a Pollinations API key using random selection for load balancing
 */
export function getPollinationsApiKey(): string | undefined {
  const keys = getPollinationsApiKeys();
  if (keys.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Get a Claude API key using random selection
 */
export function getClaudeApiKey(): string | undefined {
  const keys = getClaudeApiKeys();
  if (keys.length === 0) return getPollinationsApiKey(); // Fallback to general keys
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Safely parse JSON string
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  if (!text || text.trim() === '') return fallback;
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    return fallback;
  }
}

/**
 * Safely parse response as JSON
 */
export async function safeResponseJson<T>(response: Response, fallback: T): Promise<T> {
  try {
    const text = await response.text();
    return safeJsonParse(text, fallback);
  } catch (e) {
    return fallback;
  }
}

/**
 * Get OpenRouter API keys for fallback and load balancing
 * Supports multiple API keys via OPENROUTER_API_KEY and OPENROUTER_FALLBACK_KEY
 * Also looks for OPENROUTER_API_KEY_1 through OPENROUTER_API_KEY_5
 */
export function getOpenRouterApiKeys(): string[] {
  const invalidKeys = [
    'sk_nun1ulPVBLupdJrHBF7CGwIgBAoJsEV3', // Key 4 (Requested removal)
  ];

  const keys = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_FALLBACK_KEY,
    process.env.OPENROUTER_API_KEY_1,
    process.env.OPENROUTER_API_KEY_2,
    process.env.OPENROUTER_API_KEY_3,
    process.env.OPENROUTER_API_KEY_5,
  ].filter(Boolean) as string[];
  
  return Array.from(new Set(keys)).filter(key => !invalidKeys.includes(key));
}

/**
 * Plans that have Pro access to premium models
 */
export const PRO_PLANS = ['pro', 'ultra', 'enterprise', 'developer', 'admin', 'video_pro'];

/**
 * Plans that have access to video generation
 */
export const VIDEO_PLANS = ['video_pro', 'ultra', 'enterprise', 'admin'];

/**
 * Check if a user plan has pro access
 */
export function hasProAccess(plan: string | undefined | null): boolean {
  if (!plan) return false;
  return PRO_PLANS.includes(plan.toLowerCase());
}

/**
 * Check if a user plan has video access
 */
export function hasVideoAccess(plan: string | undefined | null): boolean {
  if (!plan) return false;
  return VIDEO_PLANS.includes(plan.toLowerCase());
}

/**
 * Get OpenRouter API key using random selection
 */
export function getOpenRouterApiKey(): string | undefined {
  const keys = getOpenRouterApiKeys();
  if (keys.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Get all available Poe API keys
 */
export function getPoeApiKeys(): string[] {
  const keys = [
    process.env.POE_API_KEY,
    process.env.POE_KEY,
    'G7NomPrb7UaPFpi9vVUlgbCWQmmXZ7saGBISiU6SEmg', // User provided key
  ].filter(Boolean) as string[];
  
  return Array.from(new Set(keys));
}

/**
 * Get a Poe API key using random selection
 */
export function getPoeApiKey(): string | undefined {
  const keys = getPoeApiKeys();
  if (keys.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Get all available Kivest API keys
 */
export function getKivestApiKeys(): string[] {
  const keys = [
    process.env.KIVEST_API_KEY,
    process.env.KIVEST_API_KEY_1,
    process.env.KIVEST_API_KEY_2,
  ].filter(Boolean) as string[];

  return Array.from(new Set(keys));
}

/**
 * Get a Kivest API key using random selection for rotation/load-balancing
 */
export function getKivestApiKey(): string | undefined {
  const keys = getKivestApiKeys();
  if (keys.length === 0) return undefined;

  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Get Shalom (Bluesminds) API key
 */
export function getShalomApiKey(): string | undefined {
  return process.env.SHALOM_API_KEY;
}

/**
 * Get all available Liz API keys
 */
export function getLizApiKeys(): string[] {
  const keys = [
    process.env.LIZ_API_KEY,
    'sk-946715b46e8fcd676f8cc5d4e9c80a51', // User provided key
  ].filter(Boolean) as string[];
  
  return Array.from(new Set(keys));
}

/**
 * Get a Liz API key using random selection
 */
export function getLizApiKey(): string | undefined {
  const keys = getLizApiKeys();
  if (keys.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Get OpenAI API keys from environment and user-provided keys
 */
export function getOpenAIApiKeys(): string[] {
  const keys = [
    process.env.OPENAI_API_KEY,
    // User-provided key from issue - replace with your own key in production
    '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',
  ].filter(Boolean) as string[];
  
  return Array.from(new Set(keys));
}

/**
 * Get an OpenAI API key using random selection
 */
export function getOpenAIApiKey(): string | undefined {
  const keys = getOpenAIApiKeys();
  if (keys.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}
