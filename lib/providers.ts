// AI Provider configurations and model definitions

export interface ChatModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'mapleai';
  description?: string;
  contextWindow?: number;
}

export interface ImageModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'mapleai';
  description?: string;
}

export interface VideoModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'mapleai';
  description?: string;
  maxDuration?: number;
}

// Available chat models
export const CHAT_MODELS: ChatModel[] = [
  // Pollinations models
  { id: 'openai', name: 'OpenAI GPT-4o', provider: 'pollinations', description: 'OpenAI GPT-4o model' },
  { id: 'openai-fast', name: 'OpenAI GPT-4o Mini', provider: 'pollinations', description: 'Faster OpenAI model' },
  { id: 'openai-large', name: 'OpenAI GPT-4.5', provider: 'pollinations', description: 'Large OpenAI model' },
  { id: 'openai-audio', name: 'OpenAI Audio', provider: 'pollinations', description: 'OpenAI with audio support' },
  { id: 'claude', name: 'Claude 3.5 Sonnet', provider: 'pollinations', description: 'Anthropic Claude 3.5 Sonnet' },
  { id: 'claude-fast', name: 'Claude 3 Haiku', provider: 'pollinations', description: 'Fast Claude model' },
  { id: 'claude-large', name: 'Claude 3.5 Opus', provider: 'pollinations', description: 'Large Claude model' },
  { id: 'gemini', name: 'Gemini 2.0 Flash', provider: 'pollinations', description: 'Google Gemini 2.0 Flash' },
  { id: 'gemini-fast', name: 'Gemini Fast', provider: 'pollinations', description: 'Fast Gemini model' },
  { id: 'gemini-large', name: 'Gemini 2.5 Pro', provider: 'pollinations', description: 'Google Gemini 2.5 Pro' },
  { id: 'gemini-search', name: 'Gemini Search', provider: 'pollinations', description: 'Gemini with Google Search' },
  { id: 'deepseek', name: 'DeepSeek V3', provider: 'pollinations', description: 'DeepSeek V3 model' },
  { id: 'grok', name: 'Grok 3', provider: 'pollinations', description: 'xAI Grok 3' },
  { id: 'mistral', name: 'Mistral Large', provider: 'pollinations', description: 'Mistral AI Large' },
  { id: 'qwen-coder', name: 'Qwen 2.5 Coder', provider: 'pollinations', description: 'Qwen 2.5 Coder 32B' },
  { id: 'perplexity-fast', name: 'Perplexity Fast', provider: 'pollinations', description: 'Fast Perplexity model' },
  { id: 'perplexity-reasoning', name: 'Perplexity Reasoning', provider: 'pollinations', description: 'Perplexity with reasoning' },
  { id: 'kimi-k2-thinking', name: 'Kimi K2 Thinking', provider: 'pollinations', description: 'Kimi K2 reasoning model' },
  { id: 'nova-micro', name: 'Nova Micro', provider: 'pollinations', description: 'Compact Nova model' },
  // MapleAI models
  { id: 'mapleai-gpt4o', name: 'MapleAI GPT-4o', provider: 'mapleai', description: 'GPT-4o via MapleAI' },
  { id: 'mapleai-claude', name: 'MapleAI Claude', provider: 'mapleai', description: 'Claude 3.5 via MapleAI' },
  { id: 'mapleai-gemini', name: 'MapleAI Gemini', provider: 'mapleai', description: 'Gemini 2.0 via MapleAI' },
];

// Available image models
export const IMAGE_MODELS: ImageModel[] = [
  // Pollinations models
  { id: 'flux', name: 'Flux', provider: 'pollinations', description: 'High quality image generation' },
  { id: 'zimage', name: 'Z-Image', provider: 'pollinations', description: 'Advanced image generation' },
  { id: 'z-image-turbo', name: 'Z-Image Turbo', provider: 'pollinations', description: 'Fast Z-Image variant' },
  { id: 'turbo', name: 'Turbo', provider: 'pollinations', description: 'Fast image generation' },
  { id: 'gptimage', name: 'GPT Image', provider: 'pollinations', description: 'OpenAI DALL-E' },
  { id: 'gptimage-large', name: 'GPT Image Large', provider: 'pollinations', description: 'Large DALL-E model' },
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5', provider: 'pollinations', description: 'DALL-E 1.5' },
  { id: 'gpt-image-1-mini', name: 'GPT Image Mini', provider: 'pollinations', description: 'Compact DALL-E' },
  { id: 'kontext', name: 'Kontext', provider: 'pollinations', description: 'Context-aware generation' },
  { id: 'seedream', name: 'Seedream', provider: 'pollinations', description: 'Creative generation' },
  { id: 'seedream-pro', name: 'Seedream Pro', provider: 'pollinations', description: 'Advanced Seedream' },
  { id: 'nanobanana', name: 'Nanobanana', provider: 'pollinations', description: 'Efficient generation' },
  { id: 'nanobanana-pro', name: 'Nanobanana Pro', provider: 'pollinations', description: 'Advanced Nanobanana' },
  // MapleAI image models
  { id: 'mapleai-dalle', name: 'MapleAI DALL-E', provider: 'mapleai', description: 'DALL-E via MapleAI' },
  { id: 'mapleai-flux', name: 'MapleAI Flux', provider: 'mapleai', description: 'Flux via MapleAI' },
];

// Available video models
export const VIDEO_MODELS: VideoModel[] = [
  // Pollinations models
  { id: 'veo', name: 'Veo', provider: 'pollinations', description: 'Google Veo video generation', maxDuration: 8 },
  { id: 'veo-3.1-fast', name: 'Veo 3.1 Fast', provider: 'pollinations', description: 'Fast Veo variant', maxDuration: 8 },
  { id: 'seedance', name: 'Seedance', provider: 'pollinations', description: 'Creative video generation', maxDuration: 10 },
  { id: 'seedance-pro', name: 'Seedance Pro', provider: 'pollinations', description: 'Advanced Seedance', maxDuration: 10 },
  // MapleAI video models
  { id: 'mapleai-veo', name: 'MapleAI Veo', provider: 'mapleai', description: 'Veo via MapleAI', maxDuration: 8 },
];

// Provider base URLs
export const PROVIDER_URLS = {
  pollinations: 'https://gen.pollinations.ai',
  mapleai: 'https://api.mapleai.de',
};
