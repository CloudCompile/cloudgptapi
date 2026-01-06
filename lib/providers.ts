// AI Provider configurations and model definitions

export interface ChatModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'routeway';
  description?: string;
  contextWindow?: number;
}

export interface ImageModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'routeway';
  description?: string;
}

export interface VideoModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'routeway';
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
  // Routeway free models
  { id: 'nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B', provider: 'routeway', description: 'NVIDIA Nemotron 3 Nano 30B' },
  { id: 'devstral-2512:free', name: 'Devstral 2512', provider: 'routeway', description: 'Devstral 2512 model' },
  { id: 'kimi-k2-0905:free', name: 'Kimi K2 0905', provider: 'routeway', description: 'Kimi K2 0905 model' },
  { id: 'longcat-flash-chat:free', name: 'Longcat Flash Chat', provider: 'routeway', description: 'Longcat Flash Chat model' },
  { id: 'minimax-m2:free', name: 'MiniMax M2', provider: 'routeway', description: 'MiniMax M2 model' },
  { id: 'glm-4.6:free', name: 'GLM 4.6', provider: 'routeway', description: 'GLM 4.6 model' },
  { id: 'deepseek-v3.1-terminus:free', name: 'DeepSeek V3.1 Terminus', provider: 'routeway', description: 'DeepSeek V3.1 Terminus model' },
  { id: 'mai-ds-r1:free', name: 'MAI DS R1', provider: 'routeway', description: 'MAI DS R1 model' },
  { id: 'nemotron-nano-9b-v2:free', name: 'Nemotron Nano 9B V2', provider: 'routeway', description: 'NVIDIA Nemotron Nano 9B V2' },
  { id: 'gpt-oss-120b:free', name: 'GPT OSS 120B', provider: 'routeway', description: 'GPT OSS 120B model' },
  { id: 'deepseek-v3.1:free', name: 'DeepSeek V3.1', provider: 'routeway', description: 'DeepSeek V3.1 model' },
  { id: 'deepseek-r1t2-chimera:free', name: 'DeepSeek R1T2 Chimera', provider: 'routeway', description: 'DeepSeek R1T2 Chimera model' },
  { id: 'llama-3.2-1b-instruct:free', name: 'Llama 3.2 1B Instruct', provider: 'routeway', description: 'Meta Llama 3.2 1B Instruct' },
  { id: 'llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B Instruct', provider: 'routeway', description: 'Meta Llama 3.2 3B Instruct' },
  { id: 'deepseek-r1-distill-qwen-32b:free', name: 'DeepSeek R1 Distill Qwen 32B', provider: 'routeway', description: 'DeepSeek R1 Distill Qwen 32B' },
  { id: 'deepseek-r1:free', name: 'DeepSeek R1', provider: 'routeway', description: 'DeepSeek R1 model' },
  { id: 'deepseek-r1-0528:free', name: 'DeepSeek R1 0528', provider: 'routeway', description: 'DeepSeek R1 0528 model' },
  { id: 'mistral-nemo-instruct:free', name: 'Mistral Nemo Instruct', provider: 'routeway', description: 'Mistral Nemo Instruct model' },
  { id: 'llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct', provider: 'routeway', description: 'Meta Llama 3.3 70B Instruct' },
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
  routeway: 'https://api.routeway.ai',
};
