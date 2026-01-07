// Error handling utilities for CloudGPT API
// Provides structured error types, provider-specific error codes, and retry suggestions

import { NextResponse } from 'next/server';
import { getCorsHeaders } from './utils';

// Error codes enum for type safety
export enum ErrorCode {
  // Client errors (4xx)
  INVALID_REQUEST = 'invalid_request',
  INVALID_MESSAGES = 'invalid_messages',
  INVALID_ENDPOINT = 'invalid_endpoint',
  MODEL_NOT_FOUND = 'model_not_found',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNAUTHORIZED = 'unauthorized',
  
  // Provider errors (mapped to appropriate status)
  PROVIDER_UNAVAILABLE = 'provider_unavailable',
  PROVIDER_RATE_LIMIT = 'provider_rate_limit',
  PROVIDER_TIMEOUT = 'provider_timeout',
  PROVIDER_AUTH_ERROR = 'provider_auth_error',
  PROVIDER_OVERLOADED = 'provider_overloaded',
  PROVIDER_MODEL_UNAVAILABLE = 'provider_model_unavailable',
  PROVIDER_ERROR = 'provider_error',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'internal_error',
  EMPTY_RESPONSE = 'empty_response',
  REQUEST_TIMEOUT = 'request_timeout',
}

// Error types for categorization
export type ErrorType = 
  | 'invalid_request_error'
  | 'authentication_error'
  | 'rate_limit_error'
  | 'provider_error'
  | 'timeout_error'
  | 'server_error';

// Provider names for display
export type ProviderName = 'pollinations' | 'openrouter' | 'liz' | 'stablehorde' | 'meridian';

// Structured error response interface
export interface ApiError {
  message: string;
  type: ErrorType;
  code: ErrorCode;
  param?: string | null;
  provider?: ProviderName;
  request_id?: string;
  retry_after?: number;
  suggestion?: string;
  original_status?: number;
  details?: string;
}

// Provider display names for user-friendly messages
const PROVIDER_DISPLAY_NAMES: Record<ProviderName, string> = {
  pollinations: 'Pollinations',
  openrouter: 'OpenRouter',
  liz: 'Liz proxy',
  stablehorde: 'Stable Horde',
  meridian: 'Meridian',
};

// Alternative models to suggest when a provider fails
const FALLBACK_SUGGESTIONS: Record<ProviderName, string[]> = {
  pollinations: ['Try a different Pollinations model like "openai-fast" or "gemini"'],
  openrouter: ['Try a Pollinations model like "openai" or "claude"', 'Try a Liz model like "claude-3.5-sonnet"'],
  liz: ['Try a Pollinations model like "openai" or "claude"', 'Try an OpenRouter model'],
  stablehorde: ['Try a Pollinations model like "openai" or "mistral"', 'Stable Horde may have high queue times'],
  meridian: ['Try a Pollinations model like "openai"', 'Meridian is an experimental provider'],
};

// Get retry suggestion based on error code and provider
function getRetrySuggestion(code: ErrorCode, provider?: ProviderName): string {
  switch (code) {
    case ErrorCode.PROVIDER_RATE_LIMIT:
      return provider 
        ? `Wait a moment and try again, or ${FALLBACK_SUGGESTIONS[provider]?.[0] || 'try a different model'}.`
        : 'Wait a moment and try again, or try a different model.';
    
    case ErrorCode.PROVIDER_UNAVAILABLE:
    case ErrorCode.PROVIDER_OVERLOADED:
      return provider
        ? FALLBACK_SUGGESTIONS[provider]?.[0] || 'Try a different model or provider.'
        : 'Try a different model or provider.';
    
    case ErrorCode.PROVIDER_TIMEOUT:
      return 'Try reducing the message length or max_tokens, or try again later.';
    
    case ErrorCode.PROVIDER_AUTH_ERROR:
      return 'This is a server configuration issue. Please contact support or try a different provider.';
    
    case ErrorCode.PROVIDER_MODEL_UNAVAILABLE:
      return provider
        ? `This model may be temporarily unavailable. ${FALLBACK_SUGGESTIONS[provider]?.[0] || 'Try a different model.'}`
        : 'This model may be temporarily unavailable. Try a different model.';
    
    case ErrorCode.MODEL_NOT_FOUND:
      return 'Use GET /v1/models to see available models and their aliases.';
    
    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return 'Wait for the rate limit to reset or use an API key for higher limits.';
    
    case ErrorCode.REQUEST_TIMEOUT:
      return 'Try reducing the message length or max_tokens.';
    
    default:
      return 'Try again later or contact support if the issue persists.';
  }
}

// Map upstream HTTP status codes to our error codes
export function mapUpstreamStatus(
  status: number,
  provider: ProviderName,
  errorText?: string
): { code: ErrorCode; type: ErrorType; mappedStatus: number; message: string } {
  // Check for specific error patterns in the response text
  const lowerErrorText = errorText?.toLowerCase() || '';
  
  switch (status) {
    case 418:
      // "I'm a teapot" - often used for rate limiting or bot detection
      return {
        code: ErrorCode.PROVIDER_UNAVAILABLE,
        type: 'provider_error',
        mappedStatus: 503,
        message: `The ${PROVIDER_DISPLAY_NAMES[provider]} is temporarily unavailable (returned unusual status).`,
      };
    
    case 429:
      return {
        code: ErrorCode.PROVIDER_RATE_LIMIT,
        type: 'rate_limit_error',
        mappedStatus: 429,
        message: `The ${PROVIDER_DISPLAY_NAMES[provider]} is rate limited.`,
      };
    
    case 401:
    case 403:
      return {
        code: ErrorCode.PROVIDER_AUTH_ERROR,
        type: 'authentication_error',
        mappedStatus: 502,
        message: `Authentication error with ${PROVIDER_DISPLAY_NAMES[provider]}.`,
      };
    
    case 404:
      // Model not found on provider
      if (lowerErrorText.includes('model') || lowerErrorText.includes('not found')) {
        return {
          code: ErrorCode.PROVIDER_MODEL_UNAVAILABLE,
          type: 'provider_error',
          mappedStatus: 503,
          message: `The requested model is not available on ${PROVIDER_DISPLAY_NAMES[provider]}.`,
        };
      }
      return {
        code: ErrorCode.PROVIDER_ERROR,
        type: 'provider_error',
        mappedStatus: 502,
        message: `Resource not found on ${PROVIDER_DISPLAY_NAMES[provider]}.`,
      };
    
    case 408:
      return {
        code: ErrorCode.PROVIDER_TIMEOUT,
        type: 'timeout_error',
        mappedStatus: 504,
        message: `Request to ${PROVIDER_DISPLAY_NAMES[provider]} timed out.`,
      };
    
    case 500:
    case 502:
    case 503:
    case 504:
      // Check for overload indicators
      if (lowerErrorText.includes('overload') || lowerErrorText.includes('capacity') || lowerErrorText.includes('busy')) {
        return {
          code: ErrorCode.PROVIDER_OVERLOADED,
          type: 'provider_error',
          mappedStatus: 503,
          message: `The ${PROVIDER_DISPLAY_NAMES[provider]} is currently overloaded.`,
        };
      }
      return {
        code: ErrorCode.PROVIDER_ERROR,
        type: 'provider_error',
        mappedStatus: 502,
        message: `The ${PROVIDER_DISPLAY_NAMES[provider]} encountered an error.`,
      };
    
    default:
      if (status >= 500) {
        return {
          code: ErrorCode.PROVIDER_ERROR,
          type: 'provider_error',
          mappedStatus: 502,
          message: `The ${PROVIDER_DISPLAY_NAMES[provider]} returned an error.`,
        };
      }
      return {
        code: ErrorCode.PROVIDER_ERROR,
        type: 'provider_error',
        mappedStatus: status,
        message: `Unexpected error from ${PROVIDER_DISPLAY_NAMES[provider]}.`,
      };
  }
}

// Parse retry-after header from provider response
export function parseRetryAfter(headers: Headers): number | undefined {
  const retryAfter = headers.get('retry-after');
  if (!retryAfter) return undefined;
  
  // Could be seconds or a date
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) return seconds;
  
  // Try parsing as date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000));
  }
  
  return undefined;
}

// Create a standardized error response
export function createErrorResponse(
  error: Partial<ApiError> & { message: string; code: ErrorCode },
  status: number,
  additionalHeaders?: Record<string, string>
): NextResponse {
  const errorType = error.type || getErrorType(error.code);
  const suggestion = error.suggestion || getRetrySuggestion(error.code, error.provider);
  
  const responseBody = {
    error: {
      message: error.message,
      type: errorType,
      code: error.code,
      param: error.param ?? null,
      ...(error.provider && { provider: error.provider }),
      ...(error.request_id && { request_id: error.request_id }),
      ...(error.retry_after && { retry_after: error.retry_after }),
      suggestion,
      ...(error.original_status && { original_status: error.original_status }),
      ...(error.details && { details: error.details }),
    },
  };
  
  const headers: Record<string, string> = {
    ...getCorsHeaders(),
    ...additionalHeaders,
  };
  
  if (error.request_id) {
    headers['X-Request-Id'] = error.request_id;
  }
  
  if (error.retry_after) {
    headers['Retry-After'] = String(error.retry_after);
  }
  
  return NextResponse.json(responseBody, { status, headers });
}

// Get error type from error code
function getErrorType(code: ErrorCode): ErrorType {
  switch (code) {
    case ErrorCode.INVALID_REQUEST:
    case ErrorCode.INVALID_MESSAGES:
    case ErrorCode.INVALID_ENDPOINT:
    case ErrorCode.MODEL_NOT_FOUND:
      return 'invalid_request_error';
    
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.PROVIDER_AUTH_ERROR:
      return 'authentication_error';
    
    case ErrorCode.RATE_LIMIT_EXCEEDED:
    case ErrorCode.PROVIDER_RATE_LIMIT:
      return 'rate_limit_error';
    
    case ErrorCode.PROVIDER_TIMEOUT:
    case ErrorCode.REQUEST_TIMEOUT:
      return 'timeout_error';
    
    case ErrorCode.PROVIDER_UNAVAILABLE:
    case ErrorCode.PROVIDER_OVERLOADED:
    case ErrorCode.PROVIDER_MODEL_UNAVAILABLE:
    case ErrorCode.PROVIDER_ERROR:
      return 'provider_error';
    
    case ErrorCode.INTERNAL_ERROR:
    case ErrorCode.EMPTY_RESPONSE:
    default:
      return 'server_error';
  }
}

// Create upstream error response with full context
export function createUpstreamErrorResponse(
  upstreamStatus: number,
  upstreamHeaders: Headers,
  errorText: string,
  provider: ProviderName,
  requestId: string
): NextResponse {
  const { code, type, mappedStatus, message } = mapUpstreamStatus(upstreamStatus, provider, errorText);
  const retryAfter = parseRetryAfter(upstreamHeaders);
  
  console.error(`[${requestId}] Upstream error from ${provider}: ${upstreamStatus} - ${errorText.substring(0, 200)}`);
  
  if (upstreamStatus === 418) {
    console.warn(`[${requestId}] Provider ${provider} returned 418 "I'm a teapot" - mapping to 503`);
  }
  
  return createErrorResponse(
    {
      message,
      code,
      type,
      provider,
      request_id: requestId,
      retry_after: retryAfter,
      original_status: upstreamStatus,
      details: errorText.substring(0, 500), // Limit details length
    },
    mappedStatus
  );
}
