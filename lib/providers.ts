// AI Provider configurations and model definitions

export interface ChatModel {
  id: string;
  name: string;
  provider: 'pollinations';
  description?: string;
  contextWindow?: number;
}

export interface ImageModel {
  id: string;
  name: string;
  provider: 'pollinations';
  description?: string;
}

export interface VideoModel {
  id: string;
  name: string;
  provider: 'pollinations';
  description?: string;
  maxDuration?: number;
}

// Available chat models
export const CHAT_MODELS: ChatModel[] = [
  { id: 'openai', name: 'OpenAI GPT-4o', provider: 'pollinations', description: 'OpenAI GPT-4o model' },
  { id: 'openai-fast', name: 'OpenAI GPT-4o Mini', provider: 'pollinations', description: 'Faster OpenAI model' },
  { id: 'openai-large', name: 'OpenAI GPT-4.5', provider: 'pollinations', description: 'Large OpenAI model' },
  { id: 'qwen-coder', name: 'Qwen 2.5 Coder', provider: 'pollinations', description: 'Qwen 2.5 Coder 32B' },
  { id: 'mistral', name: 'Mistral Large', provider: 'pollinations', description: 'Mistral AI Large' },
  { id: 'openai-audio', name: 'OpenAI Audio', provider: 'pollinations', description: 'OpenAI with audio support' },
  { id: 'gemini', name: 'Gemini 2.0 Flash', provider: 'pollinations', description: 'Google Gemini 2.0 Flash' },
  { id: 'gemini-fast', name: 'Gemini Fast', provider: 'pollinations', description: 'Fast Gemini model' },
  { id: 'deepseek', name: 'DeepSeek V3', provider: 'pollinations', description: 'DeepSeek V3 model' },
  { id: 'grok', name: 'Grok 3', provider: 'pollinations', description: 'xAI Grok 3' },
  { id: 'gemini-search', name: 'Gemini Search', provider: 'pollinations', description: 'Gemini with Google Search' },
  { id: 'chickytutor', name: 'ChickyTutor', provider: 'pollinations', description: 'Educational AI tutor' },
  { id: 'midijourney', name: 'Midijourney', provider: 'pollinations', description: 'Creative AI assistant' },
  { id: 'claude-fast', name: 'Claude 3 Haiku', provider: 'pollinations', description: 'Fast Claude model' },
  { id: 'claude', name: 'Claude 3.5 Sonnet', provider: 'pollinations', description: 'Anthropic Claude 3.5 Sonnet' },
  { id: 'claude-large', name: 'Claude 3.5 Opus', provider: 'pollinations', description: 'Large Claude model' },
  { id: 'perplexity-fast', name: 'Perplexity Fast', provider: 'pollinations', description: 'Fast Perplexity model' },
  { id: 'perplexity-reasoning', name: 'Perplexity Reasoning', provider: 'pollinations', description: 'Perplexity with reasoning' },
  { id: 'kimi-k2-thinking', name: 'Kimi K2 Thinking', provider: 'pollinations', description: 'Kimi K2 reasoning model' },
  { id: 'gemini-large', name: 'Gemini 2.5 Pro', provider: 'pollinations', description: 'Google Gemini 2.5 Pro' },
  { id: 'nova-micro', name: 'Nova Micro', provider: 'pollinations', description: 'Compact Nova model' },
];

// Available image models
export const IMAGE_MODELS: ImageModel[] = [
  { id: 'kontext', name: 'Kontext', provider: 'pollinations', description: 'FLUX.1 Kontext - In-context editing & generation' },
  { id: 'turbo', name: 'Turbo', provider: 'pollinations', description: 'SDXL Turbo - Single-step real-time generation' },
  { id: 'nanobanana', name: 'Nanobanana', provider: 'pollinations', description: 'NanoBanana - Gemini 2.5 Flash Image' },
  { id: 'nanobanana-pro', name: 'Nanobanana Pro', provider: 'pollinations', description: 'NanoBanana Pro - Gemini 3 Pro Image (4K, Thinking)' },
  { id: 'seedream', name: 'Seedream', provider: 'pollinations', description: 'Seedream 4.0 - ByteDance ARK (better quality)' },
  { id: 'seedream-pro', name: 'Seedream Pro', provider: 'pollinations', description: 'Seedream 4.5 Pro - ByteDance ARK (4K, Multi-Image)' },
  { id: 'gptimage', name: 'GPT Image', provider: 'pollinations', description: "GPT Image 1 Mini - OpenAI's image generation model" },
  { id: 'gptimage-large', name: 'GPT Image Large', provider: 'pollinations', description: "GPT Image 1.5 - OpenAI's advanced image generation model" },
  { id: 'flux', name: 'Flux', provider: 'pollinations', description: 'Flux Schnell - Fast high-quality image generation' },
  { id: 'zimage', name: 'Z-Image', provider: 'pollinations', description: 'Z-Image Turbo - Fast 6B Flux with 2x upscaling' },
];

// Available video models
export const VIDEO_MODELS: VideoModel[] = [
  { id: 'veo', name: 'Veo', provider: 'pollinations', description: "Veo 3.1 Fast - Google's video generation model (preview)" },
  { id: 'seedance', name: 'Seedance', provider: 'pollinations', description: 'Seedance Lite - BytePlus video generation (better quality)' },
  { id: 'seedance-pro', name: 'Seedance Pro', provider: 'pollinations', description: 'Seedance Pro-Fast - BytePlus video generation (better prompt adherence)' },
];

// Provider base URLs
export const PROVIDER_URLS = {
  pollinations: 'https://gen.pollinations.ai',
};
