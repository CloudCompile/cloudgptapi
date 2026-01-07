// AI Provider configurations and model definitions

export interface ChatModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'openrouter' | 'stablehorde' | 'meridian' | 'liz';
  description?: string;
  contextWindow?: number;
}

export interface ImageModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'openrouter' | 'appypie' | 'stablehorde';
  description?: string;
}

export interface VideoModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'openrouter';
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
  { id: 'perplexity-fast', name: 'Perplexity Fast', provider: 'pollinations', description: 'Fast Perplexity model' },
  { id: 'perplexity-reasoning', name: 'Perplexity Reasoning', provider: 'pollinations', description: 'Perplexity with reasoning' },
  { id: 'kimi-k2-thinking', name: 'Kimi K2 Thinking', provider: 'pollinations', description: 'Kimi K2 reasoning model' },
  { id: 'gemini-large', name: 'Gemini 2.5 Pro', provider: 'pollinations', description: 'Google Gemini 2.5 Pro' },
  { id: 'nova-micro', name: 'Nova Micro', provider: 'pollinations', description: 'Compact Nova model' },
  // OpenRouter free models
  { id: 'xiaomi/mimo-v2-flash:free', name: 'Xiaomi Mimo V2 Flash', provider: 'openrouter', description: 'Xiaomi Mimo V2 Flash model' },
  { id: 'mistralai/devstral-2512:free', name: 'Mistral Devstral 2512', provider: 'openrouter', description: 'Mistral AI Devstral 2512' },
  { id: 'kwaipilot/kat-coder-pro:free', name: 'Kwai KAT Coder Pro', provider: 'openrouter', description: 'Kwai Pilot KAT Coder Pro' },
  { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'TNG DeepSeek R1T2 Chimera', provider: 'openrouter', description: 'TNG Tech DeepSeek R1T2 Chimera' },
  { id: 'nex-agi/deepseek-v3.1-nex-n1:free', name: 'Nex DeepSeek V3.1 Nex N1', provider: 'openrouter', description: 'Nex AGI DeepSeek V3.1 Nex N1' },
  { id: 'tngtech/deepseek-r1t-chimera:free', name: 'TNG DeepSeek R1T Chimera', provider: 'openrouter', description: 'TNG Tech DeepSeek R1T Chimera' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'NVIDIA Nemotron 3 Nano 30B', provider: 'openrouter', description: 'NVIDIA Nemotron 3 Nano 30B A3B' },
  { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'NVIDIA Nemotron Nano 12B V2 VL', provider: 'openrouter', description: 'NVIDIA Nemotron Nano 12B V2 Vision-Language' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen 3 Coder', provider: 'openrouter', description: 'Qwen 3 Coder model' },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air', provider: 'openrouter', description: 'Z-AI GLM 4.5 Air' },
  { id: 'tngtech/tng-r1t-chimera:free', name: 'TNG R1T Chimera', provider: 'openrouter', description: 'TNG Tech R1T Chimera' },
  { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 0528', provider: 'openrouter', description: 'DeepSeek R1 0528 model' },
  { id: 'google/gemma-3-27b-it:free', name: 'Google Gemma 3 27B IT', provider: 'openrouter', description: 'Google Gemma 3 27B Instruct' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Meta Llama 3.3 70B Instruct', provider: 'openrouter', description: 'Meta Llama 3.3 70B Instruct' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Google Gemini 2.0 Flash Exp', provider: 'openrouter', description: 'Google Gemini 2.0 Flash Experimental' },
  { id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', name: 'Dolphin Mistral 24B Venice', provider: 'openrouter', description: 'Cognitive Computations Dolphin Mistral 24B Venice Edition' },
  { id: 'openai/gpt-oss-120b:free', name: 'OpenAI GPT OSS 120B', provider: 'openrouter', description: 'OpenAI GPT OSS 120B' },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 Llama 3.1 405B', provider: 'openrouter', description: 'Nous Research Hermes 3 Llama 3.1 405B' },
  { id: 'meta-llama/llama-3.1-405b-instruct:free', name: 'Meta Llama 3.1 405B Instruct', provider: 'openrouter', description: 'Meta Llama 3.1 405B Instruct' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B Instruct', provider: 'openrouter', description: 'Mistral AI 7B Instruct' },
  { id: 'openai/gpt-oss-20b:free', name: 'OpenAI GPT OSS 20B', provider: 'openrouter', description: 'OpenAI GPT OSS 20B' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1 24B Instruct', provider: 'openrouter', description: 'Mistral AI Small 3.1 24B Instruct' },
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'NVIDIA Nemotron Nano 9B V2', provider: 'openrouter', description: 'NVIDIA Nemotron Nano 9B V2' },
  { id: 'arcee-ai/trinity-mini:free', name: 'Arcee AI Trinity Mini', provider: 'openrouter', description: 'Arcee AI Trinity Mini' },
  { id: 'qwen/qwen3-4b:free', name: 'Qwen 3 4B', provider: 'openrouter', description: 'Qwen 3 4B model' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Meta Llama 3.2 3B Instruct', provider: 'openrouter', description: 'Meta Llama 3.2 3B Instruct' },
  { id: 'qwen/qwen-2.5-vl-7b-instruct:free', name: 'Qwen 2.5 VL 7B Instruct', provider: 'openrouter', description: 'Qwen 2.5 Vision-Language 7B Instruct' },
  { id: 'google/gemma-3n-e2b-it:free', name: 'Google Gemma 3N E2B IT', provider: 'openrouter', description: 'Google Gemma 3N E2B Instruct' },
  { id: 'google/gemma-3-4b-it:free', name: 'Google Gemma 3 4B IT', provider: 'openrouter', description: 'Google Gemma 3 4B Instruct' },
  { id: 'google/gemma-3-12b-it:free', name: 'Google Gemma 3 12B IT', provider: 'openrouter', description: 'Google Gemma 3 12B Instruct' },
  { id: 'google/gemma-3n-e4b-it:free', name: 'Google Gemma 3N E4B IT', provider: 'openrouter', description: 'Google Gemma 3N E4B Instruct' },
  { id: 'moonshotai/kimi-k2:free', name: 'Moonshot AI Kimi K2', provider: 'openrouter', description: 'Moonshot AI Kimi K2' },
  // Stable Horde text models (selection of popular models)
  { id: 'stable-horde-nemotron-nano-9b', name: 'Nemotron Nano 9B V2', provider: 'stablehorde', description: 'NVIDIA Nemotron Nano 9B V2' },
  { id: 'stable-horde-llama-3.2-3b', name: 'Llama 3.2 3B Instruct', provider: 'stablehorde', description: 'Meta Llama 3.2 3B Instruct' },
  { id: 'stable-horde-mistral-7b', name: 'Mistral 7B Instruct', provider: 'stablehorde', description: 'Mistral AI 7B Instruct model' },
  { id: 'stable-horde-qwen3-4b', name: 'Qwen 3 4B', provider: 'stablehorde', description: 'Qwen 3 4B model' },
  { id: 'stable-horde-neonmaid-12b', name: 'NeonMaid-12B', provider: 'stablehorde', description: 'NeonMaid-12B v2 creative model' },
  // Meridian model
  { id: 'meridian', name: 'Meridian', provider: 'meridian', description: 'Meridian cognitive substrate with persistent memory' },
  // Liz Proxy models
  { id: 'gemini-2.0-flash-001', name: 'Gemini 2.0 Flash 001', provider: 'liz', description: 'Google Gemini 2.0 Flash 001' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', provider: 'liz', description: 'Google Gemini 3 Flash Preview' },
  { id: 'gemini-2.0-flash-lite-001', name: 'Gemini 2.0 Flash Lite 001', provider: 'liz', description: 'Google Gemini 2.0 Flash Lite 001' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'liz', description: 'Google Gemini 2.5 Flash' },
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', provider: 'liz', description: 'Google Gemini 2.5 Flash Image' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'liz', description: 'Google Gemini 2.5 Flash Lite' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'liz', description: 'Google Gemini 2.5 Pro' },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image Preview', provider: 'liz', description: 'Google Gemini 3 Pro Image Preview' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', provider: 'liz', description: 'Google Gemini 3 Pro Preview' },
  { id: 'deepseek-prover-v2', name: 'DeepSeek Prover V2', provider: 'liz', description: 'DeepSeek Prover V2' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'liz', description: 'DeepSeek R1' },
  { id: 'deepseek-r1-0528', name: 'DeepSeek R1 0528', provider: 'liz', description: 'DeepSeek R1 0528' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'liz', description: 'DeepSeek V3' },
  { id: 'deepseek-v3.1', name: 'DeepSeek V3.1', provider: 'liz', description: 'DeepSeek V3.1' },
  { id: 'deepseek-v3.2-exp', name: 'DeepSeek V3.2 Exp', provider: 'liz', description: 'DeepSeek V3.2 Experimental' },
  { id: 'deepseek-v3.2-speciale', name: 'DeepSeek V3.2 Speciale', provider: 'liz', description: 'DeepSeek V3.2 Speciale' },
  { id: 'deepseek-v3.1-nex-n1:free', name: 'DeepSeek V3.1 Nex N1', provider: 'liz', description: 'DeepSeek V3.1 Nex N1 Free' },
  { id: 'glm-4.5-air:free', name: 'GLM 4.5 Air Free', provider: 'liz', description: 'GLM 4.5 Air Free' },
  { id: 'glm-4-32b', name: 'GLM 4 32B', provider: 'liz', description: 'GLM 4 32B' },
  { id: 'glm-4.5', name: 'GLM 4.5', provider: 'liz', description: 'GLM 4.5' },
  { id: 'glm-4.5-air', name: 'GLM 4.5 Air', provider: 'liz', description: 'GLM 4.5 Air' },
  { id: 'glm-4.5v', name: 'GLM 4.5V', provider: 'liz', description: 'GLM 4.5 Vision' },
  { id: 'glm-4.6', name: 'GLM 4.6', provider: 'liz', description: 'GLM 4.6' },
  { id: 'glm-4.7', name: 'GLM 4.7', provider: 'liz', description: 'GLM 4.7' },
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
  // AppyPie models
  { id: 'appypie-sdxl', name: 'AppyPie SDXL', provider: 'appypie', description: 'SDXL - High-resolution, realistic image generation' },
  { id: 'appypie-sd-inpainting', name: 'AppyPie SD Inpainting', provider: 'appypie', description: 'Stable Diffusion 1.5 Inpainting - Image editing with masks' },
  { id: 'appypie-flux-schnell', name: 'AppyPie Flux Schnell', provider: 'appypie', description: 'Flux-1 Schnell - Fast futuristic image generation' },
  // Stable Horde models (popular selection)
  { id: 'stable-horde-flux-schnell', name: 'Flux.1-Schnell fp8', provider: 'stablehorde', description: 'Flux.1-Schnell fp8 (Compact) - Fast high-quality generation' },
  { id: 'stable-horde-sdxl', name: 'SDXL 1.0', provider: 'stablehorde', description: 'Stable Diffusion XL 1.0 - High quality image generation' },
  { id: 'stable-horde-deliberate', name: 'Deliberate', provider: 'stablehorde', description: 'Deliberate - Versatile general purpose model' },
  { id: 'stable-horde-dreamshaper', name: 'Dreamshaper', provider: 'stablehorde', description: 'Dreamshaper - Creative artistic generation' },
  { id: 'stable-horde-realistic-vision', name: 'Realistic Vision', provider: 'stablehorde', description: 'Realistic Vision - Photo-realistic images' },
  { id: 'stable-horde-absolute-reality', name: 'AbsoluteReality', provider: 'stablehorde', description: 'AbsoluteReality - High fidelity realistic images' },
  { id: 'stable-horde-juggernaut-xl', name: 'Juggernaut XL', provider: 'stablehorde', description: 'Juggernaut XL - Versatile SDXL model' },
  { id: 'stable-horde-pony-diffusion', name: 'Pony Diffusion XL', provider: 'stablehorde', description: 'Pony Diffusion XL - Anime and character focused' },
  { id: 'stable-horde-stable-diffusion', name: 'Stable Diffusion', provider: 'stablehorde', description: 'Stable Diffusion 1.5 - Classic SD model' },
  { id: 'stable-horde-anything-v5', name: 'Anything v5', provider: 'stablehorde', description: 'Anything v5 - Anime style generation' },
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
  openrouter: 'https://openrouter.ai',
  liz: 'https://lizley.zeabur.app',
  appypie: {
    sdxl: 'https://gateway.appypie.com/getImage/v1/getSDXLImage',
    inpainting: 'https://gateway-stable-diffusion-v1-5-inpainting.appypie.workers.dev/getImage',
    fluxSchnell: 'https://gateway.pixazo.ai/flux-1-schnell/v1/getData',
  },
  stablehorde: 'https://stablehorde.net/api/v2',
  meridian: 'https://meridianlabsapp.website/api',
};
