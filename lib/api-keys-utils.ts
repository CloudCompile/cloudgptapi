// Client-safe API key utilities
// This file contains functions that don't depend on server-only modules
// and can be safely imported in Client Components

import { CHAT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from './providers';

/**
 * Get the usage weight for a model.
 * If not defined in the model, defaults to 1.
 */
export function getModelUsageWeight(modelId: string): number {
  const allModels = [...CHAT_MODELS, ...IMAGE_MODELS, ...VIDEO_MODELS];
  const model = allModels.find(m => m.id === modelId);
  
  // Default weights based on request
  // cheap: 0.25, 0.33, 0.75
  // good: 5, 10, 20
  
  if (model?.usageWeight !== undefined) {
    return model.usageWeight;
  }

  // Fallback heuristics if weight isn't explicitly defined
  const id = modelId.toLowerCase();
  
  // Very cheap models
  if (id.includes('flash') || id.includes('mini') || id.includes('nano') || id.endsWith(':free')) {
    if (id.includes('4o-mini') || id.includes('flash')) return 0.25;
    return 0.33;
  }

  // High end models
  if (id.includes('gpt-5') || id.includes('o1') || id.includes('opus')) return 20;
  if (id.includes('gpt-4') || id.includes('sonnet') || id.includes('pro')) return 10;
  if (id.includes('reasoner') || id.includes('thinking') || id.includes('large')) return 5;

  return 1;
}

// Generate a new API key with the vtai prefix
export function generateApiKey(): string {
  const { v4: uuidv4 } = require('uuid');
  const prefix = 'vtai';
  const key = uuidv4().replace(/-/g, '');
  return `${prefix}_${key}`;
}

// Extract API key from request headers (Bearer token)
export function extractApiKey(headers: Headers): string | null {
  const authHeader = headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.substring(7);
    // Validate key format before returning
    if (key.startsWith('vtai_') && key.length === 37) {
      return key;
    }
  }
  return null;
}

/**
 * Check if the current time is during peak hours (5:00 PM to 5:00 AM UTC)
 * Peak hours are when usage is high and we want to apply lower rate limits
 */
export function isPeakHours(): boolean {
  const now = new Date();
  const hour = now.getUTCHours();
  // Peak hours: 17:00 (5 PM) to 05:00 (5 AM) UTC
  // This means hours 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4
  return hour >= 17 || hour < 5;
}

/**
 * Apply peak hours reduction to rate limits
 * During peak hours (5 PM - 5 AM), reduce rate limits by 50% for all users
 */
export function applyPeakHoursLimit(baseLimit: number): number {
  if (isPeakHours()) {
    return Math.max(1, Math.floor(baseLimit * 0.5)); // 50% reduction, minimum 1
  }
  return baseLimit;
}

/**
 * Get daily limit for a plan
 */
export function getDailyLimitForPlan(plan: string): number {
  const p = plan.toLowerCase();
  
  // Custom request: Free has 1k rpd
  if (p === 'pro') return 10000;
  if (p === 'pro_plus') return 25000;
  if (p === 'developer') return 50000;
  if (p === 'admin') return 1000000;
  
  return 75; // Default Free tier limit (75 RPD)
}
