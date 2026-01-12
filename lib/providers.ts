// AI Provider configurations and model definitions

export interface ChatModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'openrouter' | 'stablehorde' | 'meridian' | 'github' | 'claude' | 'gemini' | 'poe' | 'liz';
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

// Available chat models by provider
const POLLINATIONS_CHAT_MODELS: ChatModel[] = [
  { id: 'deepseek', name: 'DeepSeek V3.2', provider: 'pollinations', description: 'DeepSeek V3.2', contextWindow: 400, usageWeight: 10 },
  { id: 'chickytutor', name: 'ChickyTutor AI Language Tutor', provider: 'pollinations', description: 'ChickyTutor AI Language Tutor', contextWindow: 200, usageWeight: 5 },
  { id: 'kimi-k2-thinking', name: 'Moonshot Kimi K2 Thinking', provider: 'pollinations', description: 'Moonshot Kimi K2 Thinking', contextWindow: 200, usageWeight: 15 },
  { id: 'openai-audio', name: 'OpenAI GPT-4o Mini Audio', provider: 'pollinations', description: 'OpenAI GPT-4o Mini Audio', contextWindow: 150, usageWeight: 5 },
  { id: 'midijourney', name: 'MIDIjourney', provider: 'pollinations', description: 'MIDIjourney', contextWindow: 150, usageWeight: 20 },
  { id: 'glm', name: 'Z.ai GLM-4.7', provider: 'pollinations', description: 'Z.ai GLM-4.7', contextWindow: 150, usageWeight: 10 },
  { id: 'minimax', name: 'MiniMax M2.1', provider: 'pollinations', description: 'MiniMax M2.1', contextWindow: 150, usageWeight: 8 },
  { id: 'openai-large', name: 'OpenAI GPT-5.2', provider: 'pollinations', description: 'OpenAI GPT-5.2', contextWindow: 100, usageWeight: 40 },
  { id: 'perplexity-reasoning', name: 'Perplexity Sonar Reasoning', provider: 'pollinations', description: 'Perplexity Sonar Reasoning', contextWindow: 100, usageWeight: 25 },
  { id: 'nova-fast', name: 'Amazon Nova Micro', provider: 'pollinations', description: 'Amazon Nova Micro', contextWindow: 24400, usageWeight: 1 },
  { id: 'mistral', name: 'Mistral Small 3.2 24B', provider: 'pollinations', description: 'Mistral Small 3.2 24B', contextWindow: 2000, usageWeight: 1 },
  { id: 'qwen-coder', name: 'Qwen3 Coder 30B', provider: 'pollinations', description: 'Qwen3 Coder 30B', contextWindow: 1600, usageWeight: 1 },
  { id: 'grok', name: 'xAI Grok 4 Fast', provider: 'pollinations', description: 'xAI Grok 4 Fast', contextWindow: 900, usageWeight: 1 },
  { id: 'openai', name: 'OpenAI GPT-5 Mini', provider: 'pollinations', description: 'OpenAI GPT-5 Mini', contextWindow: 750, usageWeight: 1 },
  { id: 'perplexity-fast', name: 'Perplexity Sonar', provider: 'pollinations', description: 'Perplexity Sonar', contextWindow: 750, usageWeight: 1 },
  { id: 'openai-fast', name: 'OpenAI GPT-5 Nano', provider: 'pollinations', description: 'OpenAI GPT-5 Nano', contextWindow: 700, usageWeight: 1 },
];

const GEMINI_CHAT_MODELS: ChatModel[] = [
  { id: 'gemini-search', name: 'Google Gemini 3 Flash', provider: 'gemini', description: 'Google Gemini 3 Flash (Search)', contextWindow: 200, usageWeight: 10 },
  { id: 'gemini', name: 'Google Gemini 3 Flash', provider: 'gemini', description: 'Google Gemini 3 Flash', contextWindow: 150, usageWeight: 8 },
  { id: 'gemini-large', name: 'Google Gemini 3 Pro', provider: 'gemini', description: 'Google Gemini 3 Pro', contextWindow: 30, usageWeight: 25 },
  { id: 'gemini-fast', name: 'Google Gemini 2.5 Flash Lite', provider: 'gemini', description: 'Google Gemini 2.5 Flash Lite', contextWindow: 2000, usageWeight: 1 },
];

const CLAUDE_CHAT_MODELS: ChatModel[] = [
  { id: 'claude-fast', name: 'Anthropic Claude Haiku 4.5', provider: 'claude', description: 'Anthropic Claude Haiku 4.5', contextWindow: 55, usageWeight: 5 },
  { id: 'claude', name: 'Anthropic Claude Sonnet 4.5', provider: 'claude', description: 'Anthropic Claude Sonnet 4.5', contextWindow: 30, usageWeight: 15 },
  { id: 'claude-large', name: 'Anthropic Claude Opus 4.5', provider: 'claude', description: 'Anthropic Claude Opus 4.5', contextWindow: 20, usageWeight: 40 },
];

const OPENROUTER_CHAT_MODELS: ChatModel[] = [
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
];

const STABLEHORDE_CHAT_MODELS: ChatModel[] = [
  // Stable Horde text models (selection of popular models)
  { id: 'stable-horde-nemotron-nano-9b', name: 'Nemotron Nano 9B V2', provider: 'stablehorde', description: 'NVIDIA Nemotron Nano 9B V2' },
  { id: 'stable-horde-llama-3.2-3b', name: 'Llama 3.2 3B Instruct', provider: 'stablehorde', description: 'Meta Llama 3.2 3B Instruct' },
  { id: 'stable-horde-mistral-7b', name: 'Mistral 7B Instruct', provider: 'stablehorde', description: 'Mistral AI 7B Instruct model' },
  { id: 'stable-horde-qwen3-4b', name: 'Qwen 3 4B', provider: 'stablehorde', description: 'Qwen 3 4B model' },
  { id: 'stable-horde-neonmaid-12b', name: 'NeonMaid-12B', provider: 'stablehorde', description: 'NeonMaid-12B v2 creative model' },
];

const MERIDIAN_CHAT_MODELS: ChatModel[] = [
  // Meridian model
  { id: 'meridian', name: 'Meridian', provider: 'meridian', description: 'Meridian cognitive substrate with persistent memory' },
];



const GITHUB_CHAT_MODELS: ChatModel[] = [
  // GitHub Models
  { id: 'AI21-Jamba-1.5-Large', name: 'AI21 Jamba 1.5 Large', provider: 'github', usageWeight: 10 },
  { id: 'Phi-4-reasoning', name: 'Phi-4 Reasoning', provider: 'github', usageWeight: 25 },
  { id: 'Phi-4-multimodal-instruct', name: 'Phi-4 Multimodal', provider: 'github', usageWeight: 5 },
  { id: 'Phi-4-mini-reasoning', name: 'Phi-4 Mini Reasoning', provider: 'github', usageWeight: 10 },
  { id: 'Phi-4-mini-instruct', name: 'Phi-4 Mini Instruct', provider: 'github', usageWeight: 1 },
  { id: 'Phi-4', name: 'Phi-4', provider: 'github', usageWeight: 3 },
  
  // OpenAI Models (from API key test)
  { id: 'babbage-002', name: 'Babbage-002', provider: 'github', usageWeight: 1 },
  { id: 'chatgpt-4o-latest', name: 'ChatGPT-4o Latest', provider: 'github', usageWeight: 10 },
  { id: 'computer-use-preview', name: 'Computer Use Preview', provider: 'github', usageWeight: 50 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'github', usageWeight: 1 },
  { id: 'gpt-3.5-turbo-0125', name: 'GPT-3.5 Turbo 0125', provider: 'github', usageWeight: 1 },
  { id: 'gpt-3.5-turbo-1106', name: 'GPT-3.5 Turbo 1106', provider: 'github', usageWeight: 1 },
  { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16k', provider: 'github', usageWeight: 1 },
  { id: 'gpt-3.5-turbo-instruct', name: 'GPT-3.5 Turbo Instruct', provider: 'github', usageWeight: 1 },
  { id: 'gpt-3.5-turbo-instruct-0914', name: 'GPT-3.5 Turbo Instruct 0914', provider: 'github', usageWeight: 1 },
  { id: 'gpt-4', name: 'GPT-4', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4-0125-preview', name: 'GPT-4 0125 Preview', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4-0613', name: 'GPT-4 0613', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4-1106-preview', name: 'GPT-4 1106 Preview', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4-turbo-2024-04-09', name: 'GPT-4 Turbo 2024-04-09', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'github', usageWeight: 50 },
  { id: 'gpt-4.1-2025-04-14', name: 'GPT-4.1 2025-04-14', provider: 'github', usageWeight: 50 },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'github', usageWeight: 25 },
  { id: 'gpt-4.1-mini-2025-04-14', name: 'GPT-4.1 Mini 2025-04-14', provider: 'github', usageWeight: 25 },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'github', usageWeight: 15 },
  { id: 'gpt-4.1-nano-2025-04-14', name: 'GPT-4.1 Nano 2025-04-14', provider: 'github', usageWeight: 15 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4o-2024-05-13', name: 'GPT-4o 2024-05-13', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4o-2024-08-06', name: 'GPT-4o 2024-08-06', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4o-2024-11-20', name: 'GPT-4o 2024-11-20', provider: 'github', usageWeight: 10 },
  { id: 'gpt-4o-audio-preview', name: 'GPT-4o Audio Preview', provider: 'github', usageWeight: 15 },
  { id: 'gpt-4o-audio-preview-2024-12-17', name: 'GPT-4o Audio Preview 2024-12-17', provider: 'github', usageWeight: 15 },
  { id: 'gpt-4o-audio-preview-2025-06-03', name: 'GPT-4o Audio Preview 2025-06-03', provider: 'github', usageWeight: 15 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'github', usageWeight: 1 },
  { id: 'gpt-4o-mini-2024-07-18', name: 'GPT-4o Mini 2024-07-18', provider: 'github', usageWeight: 1 },
  { id: 'gpt-4o-mini-audio-preview', name: 'GPT-4o Mini Audio Preview', provider: 'github', usageWeight: 3 },
  { id: 'gpt-4o-mini-audio-preview-2024-12-17', name: 'GPT-4o Mini Audio Preview 2024-12-17', provider: 'github', usageWeight: 3 },
  { id: 'gpt-4o-mini-realtime-preview', name: 'GPT-4o Mini Realtime Preview', provider: 'github', usageWeight: 5 },
  { id: 'gpt-4o-mini-realtime-preview-2024-12-17', name: 'GPT-4o Mini Realtime Preview 2024-12-17', provider: 'github', usageWeight: 5 },
  { id: 'gpt-4o-mini-search-preview', name: 'GPT-4o Mini Search Preview', provider: 'github', usageWeight: 5 },
  { id: 'gpt-4o-mini-search-preview-2025-03-11', name: 'GPT-4o Mini Search Preview 2025-03-11', provider: 'github', usageWeight: 5 },
  { id: 'gpt-4o-realtime-preview', name: 'GPT-4o Realtime Preview', provider: 'github', usageWeight: 20 },
  { id: 'gpt-4o-realtime-preview-2024-12-17', name: 'GPT-4o Realtime Preview 2024-12-17', provider: 'github', usageWeight: 20 },
  { id: 'gpt-4o-realtime-preview-2025-06-03', name: 'GPT-4o Realtime Preview 2025-06-03', provider: 'github', usageWeight: 20 },
  { id: 'gpt-4o-search-preview', name: 'GPT-4o Search Preview', provider: 'github', usageWeight: 15 },
  { id: 'gpt-4o-search-preview-2025-03-11', name: 'GPT-4o Search Preview 2025-03-11', provider: 'github', usageWeight: 15 },
  { id: 'gpt-5', name: 'GPT-5', provider: 'github', usageWeight: 100 },
  { id: 'gpt-5-2025-08-07', name: 'GPT-5 2025-08-07', provider: 'github', usageWeight: 100 },
  { id: 'gpt-5-chat-latest', name: 'GPT-5 Chat Latest', provider: 'github', usageWeight: 75 },
  { id: 'gpt-5-codex', name: 'GPT-5 Codex', provider: 'github', usageWeight: 100 },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'github', usageWeight: 50 },
  { id: 'gpt-5-mini-2025-08-07', name: 'GPT-5 Mini 2025-08-07', provider: 'github', usageWeight: 50 },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'github', usageWeight: 40 },
  { id: 'gpt-5-nano-2025-08-07', name: 'GPT-5 Nano 2025-08-07', provider: 'github', usageWeight: 40 },
  { id: 'gpt-5-pro', name: 'GPT-5 Pro', provider: 'github', usageWeight: 150 },
  { id: 'gpt-5-search-api', name: 'GPT-5 Search API', provider: 'github', usageWeight: 120 },
  { id: 'gpt-5-search-api-2025-10-14', name: 'GPT-5 Search API 2025-10-14', provider: 'github', usageWeight: 120 },
  { id: 'gpt-audio', name: 'GPT-Audio', provider: 'github', usageWeight: 30 },
  { id: 'gpt-audio-2025-08-28', name: 'GPT-Audio 2025-08-28', provider: 'github', usageWeight: 30 },
  { id: 'gpt-audio-mini', name: 'GPT-Audio Mini', provider: 'github', usageWeight: 15 },
  { id: 'gpt-audio-mini-2025-10-06', name: 'GPT-Audio Mini 2025-10-06', provider: 'github', usageWeight: 15 },
  { id: 'gpt-realtime', name: 'GPT-Realtime', provider: 'github', usageWeight: 35 },
  { id: 'gpt-realtime-mini', name: 'GPT-Realtime Mini', provider: 'github', usageWeight: 20 },
  { id: 'gpt-realtime-mini-2025-10-06', name: 'GPT-Realtime Mini 2025-10-06', provider: 'github', usageWeight: 20 },
  { id: 'o1', name: 'o1', provider: 'github', usageWeight: 30 },
  { id: 'o1-2024-12-17', name: 'o1 2024-12-17', provider: 'github', usageWeight: 30 },
  { id: 'o1-mini', name: 'o1-mini', provider: 'github', usageWeight: 10 },
  { id: 'o1-preview', name: 'o1-preview', provider: 'github', usageWeight: 25 },
  { id: 'o1-pro', name: 'o1-pro', provider: 'github', usageWeight: 50 },
  { id: 'o3', name: 'o3', provider: 'github', usageWeight: 30 },
  { id: 'o3-2025-04-16', name: 'o3 2025-04-16', provider: 'github', usageWeight: 30 },
  { id: 'o3-mini', name: 'o3-mini', provider: 'github', usageWeight: 15 },
  { id: 'o3-mini-2025-01-31', name: 'o3-mini 2025-01-31', provider: 'github', usageWeight: 15 },
  { id: 'o4-mini', name: 'o4-mini', provider: 'github', usageWeight: 15 },
  { id: 'text-embedding-3-small', name: 'Text Embedding 3 Small', provider: 'github', usageWeight: 1 },
  { id: 'text-embedding-3-large', name: 'Text Embedding 3 Large', provider: 'github', usageWeight: 2 },
  { id: 'text-embedding-ada-002', name: 'Text Embedding Ada-002', provider: 'github', usageWeight: 1 },
  
  // Other GitHub Models
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

const POE_CHAT_MODELS: ChatModel[] = [
  // Anthropic
  { id: 'claude-sonnet-3.5', name: 'Claude 3.5 Sonnet', provider: 'poe', usageWeight: 10 },
  { id: 'claude-haiku-3.5', name: 'Claude 3.5 Haiku', provider: 'poe', usageWeight: 2 },
  { id: 'claude-opus-4', name: 'Claude 3 Opus', provider: 'poe', usageWeight: 25 },
  { id: 'claude-haiku-3', name: 'Claude 3 Haiku', provider: 'poe', usageWeight: 1 },
  
  // OpenAI
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'poe', usageWeight: 10 },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'poe', usageWeight: 1 },
  { id: 'o1', name: 'o1', provider: 'poe', usageWeight: 30 },
  { id: 'o1-mini', name: 'o1-mini', provider: 'poe', usageWeight: 15 },
  { id: 'o1-pro', name: 'o1-preview', provider: 'poe', usageWeight: 25 },
  
  // Google
  { id: 'gemini-2.5-pro', name: 'Gemini 1.5 Pro', provider: 'poe', usageWeight: 15 },
  { id: 'gemini-2.5-flash', name: 'Gemini 1.5 Flash', provider: 'poe', usageWeight: 2 },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'poe', usageWeight: 5 },
  
  // Meta
  { id: 'llama-3.1-405b-fp16', name: 'Llama 3.1 405B', provider: 'poe', usageWeight: 20 },
  { id: 'llama-3.1-70b-fp16', name: 'Llama 3.1 70B', provider: 'poe', usageWeight: 5 },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'poe', usageWeight: 8 },
  
  // Others
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'poe', usageWeight: 10 },
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'poe', usageWeight: 25 },
  { id: 'qwen-2.5-72b-t', name: 'Qwen 2.5 72B', provider: 'poe', usageWeight: 8 },
  { id: 'mistral-large-2', name: 'Mistral Large 2', provider: 'poe', usageWeight: 12 },
  { id: 'grok-4-fast-non-reasoning', name: 'Grok 2', provider: 'poe', usageWeight: 15 },
  { id: 'Web-Search', name: 'Web Search', provider: 'poe', usageWeight: 5 },
];

const LIZ_CHAT_MODELS: ChatModel[] = [
  // Liz's flagship models (proxied)
  { id: 'liz-claude-3-7-sonnet', name: 'Claude 3.7 Sonnet (Liz)', provider: 'liz', description: 'Anthropic Claude 3.7 Sonnet via Liz Proxy', contextWindow: 200, usageWeight: 15 },
  { id: 'liz-claude-3-5-sonnet', name: 'Claude 3.5 Sonnet (Liz)', provider: 'liz', description: 'Anthropic Claude 3.5 Sonnet via Liz Proxy', contextWindow: 200, usageWeight: 15 },
  { id: 'liz-claude-3-opus', name: 'Claude 3 Opus (Liz)', provider: 'liz', description: 'Anthropic Claude 3 Opus via Liz Proxy (NSFW/Smut Optimized)', contextWindow: 200, usageWeight: 30 },
  { id: 'liz-claude-sonnet-4', name: 'Claude Sonnet 4 (Liz)', provider: 'liz', description: 'Anthropic Claude Sonnet 4 via Liz Proxy', contextWindow: 30, usageWeight: 15 },
  { id: 'liz-claude-opus-4', name: 'Claude Opus 4 (Liz)', provider: 'liz', description: 'Anthropic Claude Opus 4 via Liz Proxy (Creative/NSFW)', contextWindow: 20, usageWeight: 30 },
  { id: 'liz-claude-opus-4.5', name: 'Claude Opus 4.5 (Liz)', provider: 'liz', description: 'Anthropic Claude Opus 4.5 via Liz Proxy (Ultimate Reasoning)', contextWindow: 20, usageWeight: 40 },
  { id: 'liz-gpt-4o', name: 'GPT-4o (Liz)', provider: 'liz', description: 'OpenAI GPT-4o via Liz Proxy', contextWindow: 128, usageWeight: 15 },
  { id: 'liz-gemini-3-pro', name: 'Gemini 3 Pro (Liz)', provider: 'liz', description: 'Google Gemini 3 Pro via Liz Proxy (Preview)', contextWindow: 30, usageWeight: 25 },
  { id: 'liz-gemini-3-flash', name: 'Gemini 3 Flash (Liz)', provider: 'liz', description: 'Google Gemini 3 Flash via Liz Proxy (Preview)', contextWindow: 150, usageWeight: 10 },
  { id: 'liz-gemini-2.5-pro', name: 'Gemini 2.5 Pro (Liz)', provider: 'liz', description: 'Google Gemini 2.5 Pro via Liz Proxy', contextWindow: 128, usageWeight: 20 },
  { id: 'liz-gemini-2.5-flash', name: 'Gemini 2.5 Flash (Liz)', provider: 'liz', description: 'Google Gemini 2.5 Flash via Liz Proxy', contextWindow: 128, usageWeight: 5 },
  { id: 'liz-gemini-2.0-flash', name: 'Gemini 2.0 Flash (Liz)', provider: 'liz', description: 'Google Gemini 2.0 Flash via Liz Proxy', contextWindow: 128, usageWeight: 5 },
  { id: 'liz-gemini-1.5-pro', name: 'Gemini 1.5 Pro (Liz)', provider: 'liz', description: 'Google Gemini 1.5 Pro via Liz Proxy', contextWindow: 128, usageWeight: 20 },
  { id: 'liz-deepseek-v3', name: 'DeepSeek V3 (Liz)', provider: 'liz', description: 'DeepSeek V3 via Liz Proxy', contextWindow: 400, usageWeight: 10 },
  { id: 'liz-deepseek-r1', name: 'DeepSeek R1 (Liz)', provider: 'liz', description: 'DeepSeek R1 Reasoning via Liz Proxy', contextWindow: 128, usageWeight: 25 },
  { id: 'liz-o1', name: 'OpenAI o1 (Liz)', provider: 'liz', description: 'OpenAI o1 Reasoning via Liz Proxy', contextWindow: 128, usageWeight: 40 },
  { id: 'liz-o3-mini', name: 'OpenAI o3-mini (Liz)', provider: 'liz', description: 'OpenAI o3-mini Reasoning via Liz Proxy', contextWindow: 128, usageWeight: 20 },
  { id: 'liz-qwen3-235b', name: 'Qwen3 235B (Liz)', provider: 'liz', description: 'Qwen3 235B a22b via Liz Proxy', contextWindow: 128, usageWeight: 15 },
  { id: 'liz-llama-3.3-70b', name: 'Llama 3.3 70B (Liz)', provider: 'liz', description: 'Meta Llama 3.3 70B via Liz Proxy', contextWindow: 128, usageWeight: 12 },
];

export const CHAT_MODELS: ChatModel[] = [
  ...POLLINATIONS_CHAT_MODELS,
  ...GEMINI_CHAT_MODELS,
  ...CLAUDE_CHAT_MODELS,
  ...OPENROUTER_CHAT_MODELS,
  ...STABLEHORDE_CHAT_MODELS,
  ...MERIDIAN_CHAT_MODELS,
  ...GITHUB_CHAT_MODELS,
  ...POE_CHAT_MODELS,
  ...LIZ_CHAT_MODELS,
];

// Premium models that require a subscription
export const PREMIUM_MODELS = new Set([
  // Flagship & Next-Gen Chat (User specified Premium)
  'deepseek',
  'gemini-search',
  'chickytutor',
  'kimi-k2-thinking',
  'openai-audio',
  'gemini',
  'midijourney',
  'glm',
  'minimax',
  'openai-large',
  'perplexity-reasoning',
  'claude-fast',
  'claude',
  'gemini-large',
  'claude-large',

  // Liz Premium Models
  'liz-claude-3-7-sonnet',
  'liz-claude-3-5-sonnet',
  'liz-claude-3-opus',
  'liz-claude-sonnet-4',
  'liz-claude-opus-4',
  'liz-claude-opus-4.5',
  'liz-gpt-4o',
  'liz-gemini-3-pro',
  'liz-gemini-3-flash',
  'liz-gemini-2.5-pro',
  'liz-gemini-2.5-flash',
  'liz-gemini-2.0-flash',
  'liz-gemini-1.5-pro',
  'liz-deepseek-v3',
  'liz-deepseek-r1',
  'liz-o1',
  'liz-o3-mini',
  'liz-qwen3-235b',
  'liz-llama-3.3-70b',

  // Other Existing Premium Models
  'gemini-2.5-pro',
  'gemini-3-pro-preview',
  
  // Reasoning & Specialized
  'deepseek-r1',
  'meridian',
  
  // GitHub Premium Models
  'AI21-Jamba-1.5-Large',
  'Phi-4-reasoning',
  'o4-mini',
  'o3-mini',
  'o3',
  'o1-preview',
  'o1-mini',
  'o1',
  'gpt-5-chat',
  'gpt-5',
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
  
  // Poe Premium Models
  'claude-sonnet-3.5',
  'claude-haiku-3.5',
  'claude-opus-4',
  'gpt-4o',
  'o1',
  'o1-mini',
  'o1-pro',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'llama-3.1-405b-fp16',
  'llama-3.3-70b',
  'deepseek-v3',
  'deepseek-r1',
  'mistral-large-2',
  'grok-4-fast-non-reasoning',
  
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
  { id: 'flux', name: 'Flux', provider: 'pollinations', description: 'Flux Schnell - Fast high-quality image generation', usageWeight: 5 },
  { id: 'zimage', name: 'Z-Image', provider: 'pollinations', description: 'Z-Image Turbo - Fast 6B Flux with 2x upscaling', usageWeight: 5 },
  { id: 'turbo', name: 'Turbo', provider: 'pollinations', description: 'SDXL Turbo - Single-step real-time generation', usageWeight: 5 },
  { id: 'gptimage', name: 'GPT Image', provider: 'pollinations', description: "GPT Image 1 Mini - OpenAI's image generation model", usageWeight: 5 },
  { id: 'gptimage-large', name: 'GPT Image Large', provider: 'pollinations', description: "GPT Image 1.5 - OpenAI's advanced image generation model", usageWeight: 15 },
  { id: 'seedream', name: 'Seedream', provider: 'pollinations', description: 'Seedream 4.0 - ByteDance ARK (better quality)', usageWeight: 5 },
  { id: 'kontext', name: 'Kontext', provider: 'pollinations', description: 'FLUX.1 Kontext - In-context editing & generation', usageWeight: 5 },
  { id: 'nanobanana', name: 'Nanobanana', provider: 'pollinations', description: 'NanoBanana - Gemini 2.5 Flash Image', usageWeight: 5 },
  { id: 'seedream-pro', name: 'Seedream Pro', provider: 'pollinations', description: 'Seedream 4.5 Pro - ByteDance ARK (4K, Multi-Image)', usageWeight: 15 },
  { id: 'nanobanana-pro', name: 'Nanobanana Pro', provider: 'pollinations', description: 'NanoBanana Pro - Gemini 3 Pro Image (4K, Thinking)', usageWeight: 15 },
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
  { id: 'seedance-pro', name: 'Seedance Pro', provider: 'pollinations', description: 'Seedance Pro-Fast - BytePlus video generation (better prompt adherence)', usageWeight: 50 },
  { id: 'seedance', name: 'Seedance', provider: 'pollinations', description: 'Seedance Lite - BytePlus video generation (better quality)', usageWeight: 50 },
  { id: 'veo', name: 'Veo', provider: 'pollinations', description: "Veo 3.1 Fast - Google's video generation model (preview)", usageWeight: 50 },
  { id: 'openai-audio', name: 'OpenAI GPT-4o Mini Audio', provider: 'pollinations', description: 'OpenAI GPT-4o Mini Audio', usageWeight: 25 },
];

// Provider base URLs
export const PROVIDER_URLS = {
  pollinations: 'https://gen.pollinations.ai',
  openrouter: 'https://openrouter.ai',
  appypie: {
    sdxl: 'https://gateway.appypie.com/getImage/v1/getSDXLImage',
    inpainting: 'https://gateway-stable-diffusion-v1-5-inpainting.appypie.workers.dev/getImage',
    fluxSchnell: 'https://gateway.pixazo.ai/flux-1-schnell/v1/getData',
  },
  stablehorde: 'https://stablehorde.net/api/v2',
  meridian: 'https://meridianlabsapp.website/api',
  github: 'https://models.inference.ai.azure.com',
  poe: 'https://api.poe.com/v1',
};
