// AI Provider configurations and model definitions

export interface ChatModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'openrouter' | 'stablehorde' | 'meridian' | 'liz' | 'github';
  description?: string;
  contextWindow?: number;
  downtimeUntil?: string; // ISO timestamp for maintenance countdown
  usageWeight?: number; // How many "requests" this model counts as for daily limits
}

export interface ImageModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'openrouter' | 'appypie' | 'stablehorde' | 'github';
  description?: string;
  downtimeUntil?: string; // ISO timestamp for maintenance countdown
  usageWeight?: number; // How many "requests" this model counts as for daily limits
}

export interface VideoModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'openrouter' | 'github';
  description?: string;
  maxDuration?: number;
  downtimeUntil?: string; // ISO timestamp for maintenance countdown
  usageWeight?: number; // How many "requests" this model counts as for daily limits
}

// Calculate downtime timestamp (until 2PM EST)
const POLLINATIONS_DOWNTIME = '2026-01-09T19:00:00Z';

// Available chat models
export const CHAT_MODELS: ChatModel[] = [
  { id: 'nova-fast', name: 'Amazon Nova Micro', provider: 'pollinations', description: 'Amazon Nova Micro', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'qwen-coder', name: 'Qwen3 Coder 30B', provider: 'pollinations', description: 'Qwen3 Coder 30B', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'mistral', name: 'Mistral Small 3.2 24B', provider: 'pollinations', description: 'Mistral Small 3.2 24B', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'gemini-fast', name: 'Google Gemini 2.5 Flash Lite', provider: 'pollinations', description: 'Google Gemini 2.5 Flash Lite', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'openai-fast', name: 'OpenAI GPT-5 Nano', provider: 'pollinations', description: 'OpenAI GPT-5 Nano', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'grok', name: 'xAI Grok 4 Fast', provider: 'pollinations', description: 'xAI Grok 4 Fast', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'openai', name: 'OpenAI GPT-5 Mini', provider: 'pollinations', description: 'OpenAI GPT-5 Mini', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'perplexity-fast', name: 'Perplexity Sonar', provider: 'pollinations', description: 'Perplexity Sonar', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'gemini', name: 'Google Gemini 3 Flash', provider: 'pollinations', description: 'Google Gemini 3 Flash', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'gemini-search', name: 'Google Gemini 3 Flash', provider: 'pollinations', description: 'Google Gemini 3 Flash', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'chickytutor', name: 'ChickyTutor AI Language Tutor', provider: 'pollinations', description: 'ChickyTutor AI Language Tutor', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'minimax', name: 'MiniMax M2.1', provider: 'pollinations', description: 'MiniMax M2.1', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'claude-fast', name: 'Anthropic Claude Haiku 4.5', provider: 'pollinations', description: 'Anthropic Claude Haiku 4.5', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'deepseek', name: 'DeepSeek V3.2', provider: 'pollinations', description: 'DeepSeek V3.2', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'glm', name: 'Z.ai GLM-4.7', provider: 'pollinations', description: 'Z.ai GLM-4.7', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'kimi-k2-thinking', name: 'Moonshot Kimi K2 Thinking', provider: 'pollinations', description: 'Moonshot Kimi K2 Thinking', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'midijourney', name: 'MIDIjourney', provider: 'pollinations', description: 'MIDIjourney', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'claude', name: 'Anthropic Claude Sonnet 4.5', provider: 'pollinations', description: 'Anthropic Claude Sonnet 4.5', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'claude-large', name: 'Anthropic Claude Opus 4.5', provider: 'pollinations', description: 'Anthropic Claude Opus 4.5', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'perplexity-reasoning', name: 'Perplexity Sonar Reasoning', provider: 'pollinations', description: 'Perplexity Sonar Reasoning', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'gemini-large', name: 'Google Gemini 3 Pro', provider: 'pollinations', description: 'Google Gemini 3 Pro', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'openai-large', name: 'OpenAI GPT-5.2', provider: 'pollinations', description: 'OpenAI GPT-5.2', downtimeUntil: POLLINATIONS_DOWNTIME },
  { id: 'openai-audio', name: 'OpenAI GPT-4o Mini Audio', provider: 'pollinations', description: 'OpenAI GPT-4o Mini Audio', downtimeUntil: POLLINATIONS_DOWNTIME },
  // OpenRouter free models
  { id: 'xiaomi/mimo-v2-flash:free', name: 'Xiaomi Mimo V2 Flash', provider: 'openrouter', description: 'Xiaomi Mimo V2 Flash model' },
  { id: 'mistralai/devstral-2512:free', name: 'Mistral Devstral 2512', provider: 'openrouter', description: 'Mistral AI Devstral 2512' },
  { id: 'kwaipilot/kat-coder-pro:free', name: 'Kwai KAT Coder Pro', provider: 'openrouter', description: 'Kwai Pilot KAT Coder Pro' },
  { id: 'nex-agi/deepseek-v3.1-nex-n1:free', name: 'Nex DeepSeek V3.1 Nex N1', provider: 'openrouter', description: 'Nex AGI DeepSeek V3.1 Nex N1' },
  { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'TNG DeepSeek R1T2 Chimera', provider: 'openrouter', description: 'TNG Tech DeepSeek R1T2 Chimera' },
  { id: 'tngtech/deepseek-r1t-chimera:free', name: 'TNG DeepSeek R1T Chimera', provider: 'openrouter', description: 'TNG Tech DeepSeek R1T Chimera' },
  { id: 'tngtech/tng-r1t-chimera:free', name: 'TNG R1T Chimera', provider: 'openrouter', description: 'TNG Tech R1T Chimera' },
  { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 0528', provider: 'openrouter', description: 'DeepSeek R1 0528 model' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'NVIDIA Nemotron 3 Nano 30B', provider: 'openrouter', description: 'NVIDIA Nemotron 3 Nano 30B A3B' },
  { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'NVIDIA Nemotron Nano 12B V2 VL', provider: 'openrouter', description: 'NVIDIA Nemotron Nano 12B V2 Vision-Language' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen 3 Coder', provider: 'openrouter', description: 'Qwen 3 Coder model' },
  { id: 'ai/glm-4.5-air:free', name: 'GLM 4.5 Air', provider: 'openrouter', description: 'Z-AI GLM 4.5 Air' },
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
  // Liz Proxy models (Non-Claude only as requested)
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
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'liz', description: 'DeepSeek V3' },
  { id: 'deepseek-r1-0528', name: 'DeepSeek R1 0528', provider: 'liz', description: 'DeepSeek R1 0528' },
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
  // GitHub Models
  { id: 'AI21-Jamba-1.5-Large', name: 'AI21 Jamba 1.5 Large', provider: 'github', usageWeight: 10 },
  { id: 'Phi-4-reasoning', name: 'Phi-4 Reasoning', provider: 'github', usageWeight: 25 },
  { id: 'Phi-4-multimodal-instruct', name: 'Phi-4 Multimodal', provider: 'github', usageWeight: 5 },
  { id: 'Phi-4-mini-reasoning', name: 'Phi-4 Mini Reasoning', provider: 'github', usageWeight: 10 },
  { id: 'Phi-4-mini-instruct', name: 'Phi-4 Mini Instruct', provider: 'github', usageWeight: 1 },
  { id: 'Phi-4', name: 'Phi-4', provider: 'github', usageWeight: 3 },
  { id: 'text-embedding-3-small', name: 'OpenAI Text Embedding 3 (small)', provider: 'github', usageWeight: 1 },
  { id: 'text-embedding-3-large', name: 'OpenAI Text Embedding 3 (large)', provider: 'github', usageWeight: 2 },
  { id: 'o4-mini', name: 'OpenAI o4-mini', provider: 'github', usageWeight: 15 },
  { id: 'o3-mini', name: 'OpenAI o3-mini', provider: 'github', usageWeight: 15 },
  { id: 'o3', name: 'OpenAI o3', provider: 'github', usageWeight: 30 },
  { id: 'o1-preview', name: 'OpenAI o1-preview', provider: 'github', usageWeight: 25 },
  { id: 'o1-mini', name: 'OpenAI o1-mini', provider: 'github', usageWeight: 10 },
  { id: 'o1', name: 'OpenAI o1', provider: 'github', usageWeight: 30 },
  { id: 'gpt-5-nano', name: 'OpenAI gpt-5-nano', provider: 'github', usageWeight: 40 },
  { id: 'gpt-5-mini', name: 'OpenAI gpt-5-mini', provider: 'github', usageWeight: 50 },
  { id: 'gpt-5-chat', name: 'OpenAI gpt-5-chat (preview)', provider: 'github', usageWeight: 75 },
  { id: 'gpt-5', name: 'OpenAI gpt-5', provider: 'github', usageWeight: 100 },
  { id: 'gpt-4o-mini', name: 'OpenAI GPT-4o mini', provider: 'github', usageWeight: 1 },
  { id: 'gpt-4o', name: 'OpenAI GPT-4o', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4.1-nano', name: 'OpenAI GPT-4.1-nano', provider: 'github', usageWeight: 15 },
  { id: 'gpt-4.1-mini', name: 'OpenAI GPT-4.1-mini', provider: 'github', usageWeight: 25 },
  { id: 'gpt-4.1', name: 'OpenAI GPT-4.1', provider: 'github', usageWeight: 50 },
  { id: 'Meta-Llama-3.1-8B-Instruct', name: 'Meta-Llama-3.1-8B-Instruct', provider: 'github', usageWeight: 2 },
  { id: 'Meta-Llama-3.1-405B-Instruct', name: 'Meta-Llama-3.1-405B-Instruct', provider: 'github', usageWeight: 20 },
  { id: 'MAI-DS-R1', name: 'MAI-DS-R1', provider: 'github', usageWeight: 25 },
  { id: 'Llama-3.3-70B-Instruct', name: 'Llama-3.3-70B-Instruct', provider: 'github', usageWeight: 10 },
  { id: 'Llama-3.2-90B-Vision-Instruct', name: 'Llama-3.2-90B-Vision-Instruct', provider: 'github', usageWeight: 15 },
  { id: 'Llama-3.2-11B-Vision-Instruct', name: 'Llama-3.2-11B-Vision-Instruct', provider: 'github', usageWeight: 5 },
  { id: 'Llama-4-Scout-17B-16E-Instruct', name: 'Llama 4 Scout 17B 16E Instruct', provider: 'github', usageWeight: 30 },
  { id: 'Llama-4-Maverick-17B-128E-Instruct-FP8', name: 'Llama 4 Maverick 17B 128E Instruct FP8', provider: 'github', usageWeight: 50 },
  { id: 'Cohere-command-r-plus-08-2024', name: 'Cohere Command R+ 08-2024', provider: 'github', usageWeight: 15 },
  { id: 'Cohere-command-r-08-2024', name: 'Cohere Command R 08-2024', provider: 'github', usageWeight: 5 },
  { id: 'Cohere-command-a', name: 'Cohere Command A', provider: 'github', usageWeight: 3 },
  { id: 'Mistral-small-3.1', name: 'Mistral Small 3.1', provider: 'github', usageWeight: 3 },
  { id: 'Codestral-25.01', name: 'Codestral 25.01', provider: 'github', usageWeight: 5 },
  { id: 'Mistral-medium-3-25.05', name: 'Mistral Medium 3 (25.05)', provider: 'github', usageWeight: 10 },
  { id: 'Ministral-3B', name: 'Ministral 3B', provider: 'github', usageWeight: 1 },
  { id: 'DeepSeek-V3-0324', name: 'DeepSeek-V3-0324', provider: 'github', usageWeight: 10 },
];

// Premium models that require a subscription
export const PREMIUM_MODELS = new Set([
  // Flagship & Next-Gen Chat
  'openai-large', // GPT-5.2
  'openai',       // GPT-5 Mini
  'claude',       // Claude Sonnet 4.5
  'claude-large', // Claude Opus 4.5
  'gemini-large', // Google Gemini 3 Pro
  'gemini-2.5-pro',
  'gemini-3-pro-preview',
  'grok',         // xAI Grok 4 Fast
  
  // Reasoning & Specialized
  'deepseek-r1',
  'perplexity-reasoning',
  'kimi-k2-thinking',
  'gemini-search',
  'openai-audio',
  'meridian',
  'chickytutor',
  'midijourney',
  'minimax',
  
  // GitHub Premium Models
  'AI21-Jamba-1.5-Large',
  'Phi-4-reasoning',
  'o4-mini',
  'o3-mini',
  'o3',
  'o1-preview',
  'o1-mini',
  'o1',
  'gpt-5-nano',
  'gpt-5-mini',
  'gpt-5-chat',
  'gpt-5',
  'gpt-4.1-nano',
  'gpt-4.1-mini',
  'gpt-4.1',
  'Meta-Llama-3.1-405B-Instruct',
  'MAI-DS-R1',
  'Llama-3.3-70B-Instruct',
  'Llama-3.2-90B-Vision-Instruct',
  'Llama-4-Scout-17B-16E-Instruct',
  'Llama-4-Maverick-17B-128E-Instruct-FP8',
  'Cohere-command-r-plus-08-2024',
  'Mistral-medium-3-25.05',
  'DeepSeek-V3-0324',
  'Stable-Diffusion-3.5-Large',
  'HunyuanImage-3.0',
  'Qwen-Image',
  
  // Video (All)
  'veo',
  'seedance',
  'seedance-pro',
  
  // High-Res Image
  'nanobanana-pro',
  'seedream-pro',
  'gptimage-large'
]);

// Available image models
export const IMAGE_MODELS: ImageModel[] = [
  { id: 'flux', name: 'Flux', provider: 'pollinations', description: 'Flux Schnell - Fast high-quality image generation', downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 5 },
  { id: 'zimage', name: 'Z-Image', provider: 'pollinations', description: 'Z-Image Turbo - Fast 6B Flux with 2x upscaling', downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 5 },
  { id: 'turbo', name: 'Turbo', provider: 'pollinations', description: 'SDXL Turbo - Single-step real-time generation', downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 5 },
  { id: 'gptimage', name: 'GPT Image', provider: 'pollinations', description: "GPT Image 1 Mini - OpenAI's image generation model", downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 5 },
  { id: 'gptimage-large', name: 'GPT Image Large', provider: 'pollinations', description: "GPT Image 1.5 - OpenAI's advanced image generation model", downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 15 },
  { id: 'seedream', name: 'Seedream', provider: 'pollinations', description: 'Seedream 4.0 - ByteDance ARK (better quality)', downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 5 },
  { id: 'kontext', name: 'Kontext', provider: 'pollinations', description: 'FLUX.1 Kontext - In-context editing & generation', downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 5 },
  { id: 'nanobanana', name: 'Nanobanana', provider: 'pollinations', description: 'NanoBanana - Gemini 2.5 Flash Image', downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 5 },
  { id: 'seedream-pro', name: 'Seedream Pro', provider: 'pollinations', description: 'Seedream 4.5 Pro - ByteDance ARK (4K, Multi-Image)', downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 15 },
  { id: 'nanobanana-pro', name: 'Nanobanana Pro', provider: 'pollinations', description: 'NanoBanana Pro - Gemini 3 Pro Image (4K, Thinking)', downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 15 },
  // AppyPie models
  { id: 'appypie-sdxl', name: 'AppyPie SDXL', provider: 'appypie', description: 'SDXL - High-resolution, realistic image generation', usageWeight: 15 },
  { id: 'appypie-sd-inpainting', name: 'AppyPie SD Inpainting', provider: 'appypie', description: 'Stable Diffusion 1.5 Inpainting - Image editing with masks', usageWeight: 10 },
  { id: 'appypie-flux-schnell', name: 'AppyPie Flux Schnell', provider: 'appypie', description: 'Flux-1 Schnell - Fast futuristic image generation', usageWeight: 10 },
  // GitHub Models
  { id: 'Stable-Diffusion-3.5-Large', name: 'Stable Diffusion 3.5 Large', provider: 'github', description: 'Stability AI Stable Diffusion 3.5 Large', usageWeight: 10 },
  { id: 'HunyuanImage-3.0', name: 'Hunyuan Image 3.0', provider: 'github', description: 'Tencent Hunyuan Image 3.0', usageWeight: 15 },
  { id: 'Qwen-Image', name: 'Qwen Image', provider: 'github', description: 'Alibaba Qwen Image multimodal model', usageWeight: 5 },
  // Stable Horde models (popular selection)
  { id: 'stable-horde-flux-schnell', name: 'Flux.1-Schnell fp8', provider: 'stablehorde', description: 'Flux.1-Schnell fp8 (Compact) - Fast high-quality generation', usageWeight: 5 },
  { id: 'stable-horde-sdxl', name: 'SDXL 1.0', provider: 'stablehorde', description: 'Stable Diffusion XL 1.0 - High quality image generation', usageWeight: 5 },
  { id: 'stable-horde-deliberate', name: 'Deliberate', provider: 'stablehorde', description: 'Deliberate - Versatile general purpose model', usageWeight: 5 },
  { id: 'stable-horde-dreamshaper', name: 'Dreamshaper', provider: 'stablehorde', description: 'Dreamshaper - Creative artistic generation', usageWeight: 5 },
  { id: 'stable-horde-realistic-vision', name: 'Realistic Vision', provider: 'stablehorde', description: 'Realistic Vision - Photo-realistic images', usageWeight: 5 },
  { id: 'stable-horde-absolute-reality', name: 'AbsoluteReality', provider: 'stablehorde', description: 'AbsoluteReality - High fidelity realistic images', usageWeight: 5 },
  { id: 'stable-horde-juggernaut-xl', name: 'Juggernaut XL', provider: 'stablehorde', description: 'Juggernaut XL - Versatile SDXL model', usageWeight: 5 },
  { id: 'stable-horde-pony-diffusion', name: 'Pony Diffusion XL', provider: 'stablehorde', description: 'Pony Diffusion XL - Anime and character focused', usageWeight: 5 },
  { id: 'stable-horde-stable-diffusion', name: 'Stable Diffusion', provider: 'stablehorde', description: 'Stable Diffusion 1.5 - Classic SD model', usageWeight: 5 },
  { id: 'stable-horde-anything-v5', name: 'Anything v5', provider: 'stablehorde', description: 'Anything v5 - Anime style generation', usageWeight: 5 },
  { id: 'stable-horde-flux-dev', name: 'Flux.1-Dev', provider: 'stablehorde', description: 'Flux.1-Dev - High quality Flux model', usageWeight: 10 },
  { id: 'stable-horde-icbinp', name: "I Can't Believe It's Not Photo", provider: 'stablehorde', description: 'ICBINP - Extremely realistic photographic style', usageWeight: 5 },
  { id: 'stable-horde-dreamlike-photoreal', name: 'Dreamlike Photoreal', provider: 'stablehorde', description: 'Dreamlike Photoreal - Artistic photographic style', usageWeight: 5 },
];

// Available video models
export const VIDEO_MODELS: VideoModel[] = [
  { id: 'seedance-pro', name: 'Seedance Pro', provider: 'pollinations', description: 'Seedance Pro-Fast - BytePlus video generation (better prompt adherence)', downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 50 },
  { id: 'seedance', name: 'Seedance', provider: 'pollinations', description: 'Seedance Lite - BytePlus video generation (better quality)', downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 50 },
  { id: 'veo', name: 'Veo', provider: 'pollinations', description: "Veo 3.1 Fast - Google's video generation model (preview)", downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 50 },
  { id: 'openai-audio', name: 'OpenAI GPT-4o Mini Audio', provider: 'pollinations', description: 'OpenAI GPT-4o Mini Audio', downtimeUntil: POLLINATIONS_DOWNTIME, usageWeight: 25 },
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
  github: 'https://models.inference.ai.azure.com',
};
