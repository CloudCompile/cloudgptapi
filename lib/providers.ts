// AI Provider configurations and model definitions

export interface ChatModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'openrouter' | 'stablehorde' | 'meridian' | 'github' | 'claude' | 'gemini' | 'openai' | 'kivest' | 'bluesminds' | 'anthropic' | 'google' | 'xai' | 'deepseek' | 'moonshot' | 'zhipu' | 'minimax' | 'meta' | 'amazon' | 'mistral' | 'microsoft' | 'bytedance' | 'xiaomi' | 'alibaba' | 'litrouter';
  description?: string;
  contextWindow?: number;
  downtimeUntil?: string;
  usageWeight?: number;
}

export interface ImageModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'openrouter' | 'appypie' | 'stablehorde' | 'github' | 'openai' | 'google' | 'xai' | 'zhipu' | 'alibaba' | 'minimax';
  description?: string;
  downtimeUntil?: string;
  usageWeight?: number;
}

export interface VideoModel {
  id: string;
  name: string;
  provider: 'pollinations' | 'openrouter' | 'github' | 'google';
  description?: string;
  maxDuration?: number;
  downtimeUntil?: string;
  usageWeight?: number;
}

// Available chat models by provider
const POLLINATIONS_CHAT_MODELS: ChatModel[] = [
  { id: 'gpt-5.1', name: 'OpenAI GPT-5.1', provider: 'pollinations', description: 'OpenAI GPT-5.1', contextWindow: 400, usageWeight: 2 },
  { id: 'gpt-oss-120b', name: 'OpenAI GPT-OSS 120B', provider: 'pollinations', description: 'OpenAI GPT-OSS 120B', contextWindow: 200, usageWeight: 2 },
  { id: 'gpt-oss-20b', name: 'OpenAI GPT-OSS 20B', provider: 'pollinations', description: 'OpenAI GPT-OSS 20B', contextWindow: 200, usageWeight: 1 },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'pollinations', description: 'DeepSeek Chat', contextWindow: 160, usageWeight: 1 },
  { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'pollinations', description: 'DeepSeek Reasoner', contextWindow: 160, usageWeight: 3 },
  { id: 'deepseek-r1-0528', name: 'DeepSeek R1 0528', provider: 'pollinations', description: 'DeepSeek R1 0528', contextWindow: 160, usageWeight: 4 },
  { id: 'qwen3-235b-a22b', name: 'Qwen3 235B A22B', provider: 'pollinations', description: 'Qwen3 235B A22B', contextWindow: 512, usageWeight: 2 },
  { id: 'qwen3-32b', name: 'Qwen3 32B', provider: 'pollinations', description: 'Qwen3 32B', contextWindow: 256, usageWeight: 1 },
  { id: 'qwen-next-80b', name: 'Qwen3 Next 80B Instruct', provider: 'pollinations', description: 'Qwen3 Next 80B A3B Instruct', contextWindow: 256, usageWeight: 2 },
  { id: 'qwen-next-80b-thinking', name: 'Qwen3 Next 80B Thinking', provider: 'pollinations', description: 'Qwen3 Next 80B A3B Thinking', contextWindow: 256, usageWeight: 3 },
  { id: 'qwen3.5-plus', name: 'Qwen 3.5 Plus', provider: 'pollinations', description: 'Qwen 3.5 Plus', contextWindow: 256, usageWeight: 1 },
  { id: 'qwen3.5-flash', name: 'Qwen 3.5 Flash', provider: 'pollinations', description: 'Qwen 3.5 Flash', contextWindow: 256, usageWeight: 1 },
  { id: 'qwen-deep-research', name: 'Qwen Deep Research', provider: 'pollinations', description: 'Qwen Deep Research', contextWindow: 256, usageWeight: 4 },
  { id: 'kimi-k2', name: 'Kimi K2', provider: 'pollinations', description: 'Moonshot Kimi K2', contextWindow: 256, usageWeight: 1 },
];

const KIVEST_CHAT_MODELS: ChatModel[] = [
  // OpenAI GPT-5 (via Kivest) - Ultra tier (via Aqua)
  { id: 'gpt-5.4', name: 'GPT-5.4', provider: 'openai', description: 'OpenAI GPT-5.4', usageWeight: 6 },
  { id: 'gpt-5.3-codex', name: 'GPT-5.3 Codex', provider: 'openai', description: 'OpenAI GPT-5.3 Codex', usageWeight: 6 },
  { id: 'gpt-5.3-spark', name: 'GPT-5.3 Spark', provider: 'openai', description: 'OpenAI GPT-5.3 Spark', usageWeight: 5 },
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'openai', description: 'OpenAI GPT-5.2', usageWeight: 5 },
  { id: 'gpt-5.2-codex', name: 'GPT-5.2 Codex', provider: 'openai', description: 'OpenAI GPT-5.2 Codex', usageWeight: 5 },
  { id: 'gpt-5.1', name: 'GPT-5.1', provider: 'openai', description: 'OpenAI GPT-5.1', usageWeight: 4 },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai', description: 'OpenAI GPT-5 Nano', usageWeight: 2 },
  { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'openai', description: 'OpenAI GPT-OSS 120B', usageWeight: 4 },
  { id: 'gpt-oss-20b', name: 'GPT-OSS 20B', provider: 'openai', description: 'OpenAI GPT-OSS 20B', usageWeight: 2 },
  // Meta (via Kivest)
  { id: 'llama3.1-8B', name: 'Llama 3.1 8B', provider: 'meta', description: 'Meta Llama 3.1 8B', usageWeight: 1 },
  { id: 'llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B 128E', provider: 'meta', description: 'Meta Llama 4 Maverick 17B 128E Instruct', usageWeight: 4 },
  { id: 'llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B 16E', provider: 'meta', description: 'Meta Llama 4 Scout 17B 16E Instruct', usageWeight: 4 },
  // Google (via Kivest) - Pro tier - removed duplicates, keeping LitRouter versions
  { id: 'nemotron-3-nano-30b-a3b', name: 'Nemotron 3 Nano 30B A3B', provider: 'google', description: 'NVIDIA Nemotron 3 Nano 30B A3B', usageWeight: 2 },
  { id: 'step-3.5-flash', name: 'Step 3.5 Flash', provider: 'google', description: 'StepFun Step 3.5 Flash', usageWeight: 2 },
  // Alibaba Qwen (via Kivest) - Pro tier
  { id: 'qwen3.5-plus', name: 'Qwen 3.5 Plus', provider: 'alibaba', description: 'Alibaba Qwen 3.5 Plus', usageWeight: 2 },
  { id: 'qwen3.5-flash', name: 'Qwen 3.5 Flash', provider: 'alibaba', description: 'Alibaba Qwen 3.5 Flash', usageWeight: 1 },
  { id: 'qwen-slides', name: 'Qwen Slides', provider: 'alibaba', description: 'Alibaba Qwen Slides', usageWeight: 4 },
  { id: 'qwen-deep-research', name: 'Qwen Deep Research', provider: 'alibaba', description: 'Alibaba Qwen Deep Research', usageWeight: 6 },
  { id: 'qwen3.5-397b-a17b', name: 'Qwen 3.5 397B A17B', provider: 'alibaba', description: 'Alibaba Qwen 3.5 397B A17B', usageWeight: 2 },
  { id: 'qwen3-235b-a22b', name: 'Qwen3 235B A22B', provider: 'alibaba', description: 'Alibaba Qwen3 235B A22B', usageWeight: 2 },
  { id: 'qwen3-32b', name: 'Qwen3 32B', provider: 'alibaba', description: 'Alibaba Qwen3 32B', usageWeight: 2 },
  { id: 'qwen3-coder-480b-a35b-instruct', name: 'Qwen3 Coder 480B A35B', provider: 'alibaba', description: 'Alibaba Qwen3 Coder 480B A35B Instruct', usageWeight: 2 },
  { id: 'qwen3-next-80b-a3b-instruct', name: 'Qwen3 Next 80B A3B Instruct', provider: 'alibaba', description: 'Alibaba Qwen3 Next 80B A3B Instruct', usageWeight: 2 },
  { id: 'qwen3-next-80b-a3b-thinking', name: 'Qwen3 Next 80B A3B Thinking', provider: 'alibaba', description: 'Alibaba Qwen3 Next 80B A3B Thinking', usageWeight: 2 },
  // DeepSeek (via Kivest) - Free tier with x3 weights
  { id: 'deepseek-r1-0528', name: 'DeepSeek R1 0528', provider: 'deepseek', description: 'DeepSeek R1 0528', usageWeight: 3 },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', description: 'DeepSeek Chat', usageWeight: 3 },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'deepseek', description: 'DeepSeek V3.2', usageWeight: 3 },
  { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'deepseek', description: 'DeepSeek Reasoner', usageWeight: 3 },
  // Microsoft (via Kivest) - Pro tier
  { id: 'phi-4-mini-flash-reasoning', name: 'Phi-4 Mini Flash Reasoning', provider: 'microsoft', description: 'Microsoft Phi-4 Mini Flash Reasoning', usageWeight: 3 },
  { id: 'phi-4-multimodal-instruct', name: 'Phi-4 Multimodal Instruct', provider: 'microsoft', description: 'Microsoft Phi-4 Multimodal Instruct', usageWeight: 6 },
  // MiniMax (via Kivest) - Pro tier
  { id: 'minimax-m2.1', name: 'MiniMax M2.1', provider: 'minimax', description: 'MiniMax M2.1', usageWeight: 4 },
  { id: 'minimax-m2.5', name: 'MiniMax M2.5', provider: 'minimax', description: 'MiniMax M2.5', usageWeight: 6 },
  { id: 'minimax-m2', name: 'MiniMax M2', provider: 'minimax', description: 'MiniMax M2', usageWeight: 3 },
  { id: 'minimax-m2.7', name: 'MiniMax M2.7', provider: 'minimax', description: 'MiniMax M2.7', usageWeight: 4 },
  // Xiaomi/Mimo (via Kivest) - Free tier
  // Xiaomi Mimo V2 Pro and Mimo V2 Omni are free
  // Mistral (via Kivest) - Pro tier
  { id: 'devstral-2-123b', name: 'Devstral 2 123B', provider: 'mistral', description: 'Mistral Devstral 2 123B', usageWeight: 6 },
  { id: 'mistral-large-3-675b-instruct', name: 'Mistral Large 3 675B', provider: 'mistral', description: 'Mistral Large 3 675B Instruct', usageWeight: 2 },
  // Legacy Kimi (via Kivest)
  { id: 'kimi-k2-thinking', name: 'Kimi K2 Thinking', provider: 'moonshot', description: 'Moonshot Kimi K2 Thinking', usageWeight: 3 },
  { id: 'kimi-k2-instruct-0905', name: 'Kimi K2 Instruct 0905', provider: 'moonshot', description: 'Moonshot Kimi K2 Instruct 0905', usageWeight: 4 },
  { id: 'kimi-k2.5', name: 'Kimi K2.5', provider: 'moonshot', description: 'Moonshot Kimi K2.5', usageWeight: 6 },
  // Zhipu (via Kivest) - Pro tier
  { id: 'glm-4.7', name: 'GLM 4.7', provider: 'zhipu', description: 'Zhipu GLM 4.7', usageWeight: 2 },
  { id: 'glm-5', name: 'GLM 5', provider: 'zhipu', description: 'Zhipu GLM 5', usageWeight: 3 },
  { id: 'glm-5.1', name: 'GLM 5.1', provider: 'zhipu', description: 'Zhipu GLM 5.1', usageWeight: 4 },
  { id: 'nova', name: 'Nova', provider: 'minimax', description: 'MiniMax Nova', usageWeight: 2 },
  // ByteDance (via Kivest) - Pro tier
  { id: 'seed-oss-36b-instruct', name: 'Seed OSS 36B Instruct', provider: 'bytedance', description: 'ByteDance Seed OSS 36B Instruct', usageWeight: 2 },
  // Xiaomi (via Kivest) - Pro tier
  { id: 'mimo-omni', name: 'Mimo V2 Omni', provider: 'xiaomi', description: 'Xiaomi Mimo V2 Omni', usageWeight: 3 },
  // Claude (via Aqua - provider field still anthropic for display)
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', provider: 'anthropic', description: 'Anthropic Claude Sonnet 4.6', usageWeight: 10 },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'anthropic', description: 'Anthropic Claude Opus 4.6', usageWeight: 25 },
  { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', provider: 'anthropic', description: 'Anthropic Claude Opus 4.5', usageWeight: 20 },
  { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'anthropic', description: 'Anthropic Claude Sonnet 4.5', usageWeight: 10 },
  // Ultra/Pro tier
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', description: 'Google Gemini 2.5 Pro', usageWeight: 15 },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', provider: 'google', description: 'Google Gemini 3 Pro Preview', usageWeight: 15 },
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', provider: 'google', description: 'Google Gemini 3.1 Pro', usageWeight: 15 },
  // xAI Grok (via Kivest)
  { id: 'grok-4', name: 'Grok 4', provider: 'xai', description: 'xAI Grok 4', usageWeight: 12 },
  // Meta (via Kivest) - Ultra
  { id: 'llama-4-maverick', name: 'Llama 4 Maverick', provider: 'meta', description: 'Meta Llama 4 Maverick', usageWeight: 8 },
  // Mistral (via Kivest) - Ultra
  { id: 'mistral-large-3', name: 'Mistral Large 3', provider: 'mistral', description: 'Mistral Large 3', usageWeight: 15 },
  // Xiaomi Mimo (via Kivest) - Ultra
  { id: 'mimo-pro', name: 'Mimo V2 Pro', provider: 'xiaomi', description: 'Xiaomi Mimo V2 Pro', usageWeight: 10 },
];

// Bluesminds Chat Models - Pro tier
const BLUESMINDS_CHAT_MODELS: ChatModel[] = [
  // DeepSeek - Free tier with x3 weights
  { id: 'deepseek-v3.1', name: 'DeepSeek V3.1', provider: 'deepseek', description: 'DeepSeek V3.1', usageWeight: 3 },
  // xAI Grok - Pro tier
  { id: 'grok-4.2', name: 'Grok 4.2', provider: 'xai', description: 'xAI Grok 4.2', usageWeight: 6 },
  { id: 'grok-4.1-thinking', name: 'Grok 4.1 Thinking', provider: 'xai', description: 'xAI Grok 4.1 Thinking', usageWeight: 4 },
  { id: 'grok', name: 'Grok 4 Fast', provider: 'xai', description: 'xAI Grok 4 Fast', usageWeight: 4 },
  // Zhipu - Pro tier
  { id: 'glm-4.6', name: 'GLM 4.6', provider: 'zhipu', description: 'Zhipu GLM 4.6', usageWeight: 2 },
  // Anthropic - Pro tier (Haiku/Sonnet) or Ultra (Opus)
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'anthropic', description: 'Anthropic Claude Haiku 4.5', usageWeight: 2 },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', provider: 'anthropic', description: 'Anthropic Claude Sonnet 4.6', usageWeight: 10 },
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', provider: 'anthropic', description: 'Anthropic Claude 3.7 Sonnet', usageWeight: 10 },
  // OpenAI - Pro tier
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'openai', description: 'OpenAI GPT-5.2', usageWeight: 12 },
];

const GEMINI_CHAT_MODELS: ChatModel[] = [
];

const CLAUDE_CHAT_MODELS: ChatModel[] = [
];

const OPENROUTER_CHAT_MODELS: ChatModel[] = [
  { id: 'openrouter/free', name: 'OpenRouter Free Router', provider: 'openrouter', description: 'OpenRouter free-model router' },
  { id: 'qwen/qwen3.6-plus:free', name: 'Qwen3.6 Plus (free)', provider: 'openrouter', description: 'Qwen Qwen3.6 Plus free' },
  { id: 'stepfun-ai/step-3.5-flash:free', name: 'Step 3.5 Flash (free)', provider: 'openrouter', description: 'StepFun Step 3.5 Flash free' },
  { id: 'nvidia/nemotron-3-super:free', name: 'Nemotron 3 Super (free)', provider: 'openrouter', description: 'NVIDIA Nemotron 3 Super free' },
  { id: 'arcee-ai/trinity-large-preview:free', name: 'Trinity Large Preview (free)', provider: 'openrouter', description: 'Arcee AI Trinity Large Preview free' },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air (free)', provider: 'openrouter', description: 'Z.ai GLM 4.5 Air free' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B A3B (free)', provider: 'openrouter', description: 'NVIDIA Nemotron 3 Nano 30B A3B free' },
  { id: 'arcee-ai/trinity-mini:free', name: 'Trinity Mini (free)', provider: 'openrouter', description: 'Arcee AI Trinity Mini free' },
  { id: 'nvidia/nemotron-nano-12b-2-vl:free', name: 'Nemotron Nano 12B 2 VL (free)', provider: 'openrouter', description: 'NVIDIA Nemotron Nano 12B 2 VL free' },
  { id: 'minimax/minimax-m2.5:free', name: 'MiniMax M2.5 (free)', provider: 'openrouter', description: 'MiniMax M2.5 free' },
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'Nemotron Nano 9B V2 (free)', provider: 'openrouter', description: 'NVIDIA Nemotron Nano 9B V2 free' },
  { id: 'openai/gpt-oss-120b:free', name: 'GPT-OSS 120B (free)', provider: 'openrouter', description: 'OpenAI GPT-OSS 120B free' },
  { id: 'qwen/qwen3-coder-480b-a35b:free', name: 'Qwen3 Coder 480B A35B (free)', provider: 'openrouter', description: 'Qwen Qwen3 Coder 480B A35B free' },
  { id: 'openai/gpt-oss-20b:free', name: 'GPT-OSS 20B (free)', provider: 'openrouter', description: 'OpenAI GPT-OSS 20B free' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next 80B A3B Instruct (free)', provider: 'openrouter', description: 'Qwen Qwen3 Next 80B A3B Instruct free' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B (free)', provider: 'openrouter', description: 'Google Gemma 3 27B free' },
  { id: 'google/gemma-3-4b-it:free', name: 'Gemma 3 4B (free)', provider: 'openrouter', description: 'Google Gemma 3 4B free' },
  { id: 'google/gemma-3n-e4b-it:free', name: 'Gemma 3n 4B (free)', provider: 'openrouter', description: 'Google Gemma 3n 4B free' },
  { id: 'google/gemma-3-12b-it:free', name: 'Gemma 3 12B (free)', provider: 'openrouter', description: 'Google Gemma 3 12B free' },
  { id: 'google/gemma-3n-e2b-it:free', name: 'Gemma 3n 2B (free)', provider: 'openrouter', description: 'Google Gemma 3n 2B free' },
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

const OPENAI_CHAT_MODELS: ChatModel[] = [
  // OpenAI Models (from official OpenAI API)
  { id: 'babbage-002', name: 'Babbage-002', provider: 'openai', usageWeight: 1 },
  { id: 'chatgpt-4o-latest', name: 'ChatGPT-4o Latest', provider: 'openai', usageWeight: 10 },
  { id: 'computer-use-preview', name: 'Computer Use Preview', provider: 'openai', usageWeight: 50 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', usageWeight: 1 },
  { id: 'gpt-3.5-turbo-0125', name: 'GPT-3.5 Turbo 0125', provider: 'openai', usageWeight: 1 },
  { id: 'gpt-3.5-turbo-1106', name: 'GPT-3.5 Turbo 1106', provider: 'openai', usageWeight: 1 },
  { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16k', provider: 'openai', usageWeight: 1 },
  { id: 'gpt-3.5-turbo-instruct', name: 'GPT-3.5 Turbo Instruct', provider: 'openai', usageWeight: 1 },
  { id: 'gpt-3.5-turbo-instruct-0914', name: 'GPT-3.5 Turbo Instruct 0914', provider: 'openai', usageWeight: 1 },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4-0125-preview', name: 'GPT-4 0125 Preview', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4-0613', name: 'GPT-4 0613', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4-1106-preview', name: 'GPT-4 1106 Preview', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4-turbo-2024-04-09', name: 'GPT-4 Turbo 2024-04-09', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai', usageWeight: 50 },
  { id: 'gpt-4.1-2025-04-14', name: 'GPT-4.1 2025-04-14', provider: 'openai', usageWeight: 50 },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'openai', usageWeight: 25 },
  { id: 'gpt-4.1-mini-2025-04-14', name: 'GPT-4.1 Mini 2025-04-14', provider: 'openai', usageWeight: 25 },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'openai', usageWeight: 15 },
  { id: 'gpt-4.1-nano-2025-04-14', name: 'GPT-4.1 Nano 2025-04-14', provider: 'openai', usageWeight: 15 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4o-2024-05-13', name: 'GPT-4o 2024-05-13', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4o-2024-08-06', name: 'GPT-4o 2024-08-06', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4o-2024-11-20', name: 'GPT-4o 2024-11-20', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4o-audio-preview', name: 'GPT-4o Audio Preview', provider: 'openai', usageWeight: 15 },
  { id: 'gpt-4o-audio-preview-2024-12-17', name: 'GPT-4o Audio Preview 2024-12-17', provider: 'openai', usageWeight: 15 },
  { id: 'gpt-4o-audio-preview-2025-06-03', name: 'GPT-4o Audio Preview 2025-06-03', provider: 'openai', usageWeight: 15 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', usageWeight: 1 },
  { id: 'gpt-4o-mini-2024-07-18', name: 'GPT-4o Mini 2024-07-18', provider: 'openai', usageWeight: 1 },
  { id: 'gpt-4o-mini-audio-preview', name: 'GPT-4o Mini Audio Preview', provider: 'openai', usageWeight: 3 },
  { id: 'gpt-4o-mini-audio-preview-2024-12-17', name: 'GPT-4o Mini Audio Preview 2024-12-17', provider: 'openai', usageWeight: 3 },
  { id: 'gpt-4o-mini-realtime-preview', name: 'GPT-4o Mini Realtime Preview', provider: 'openai', usageWeight: 5 },
  { id: 'gpt-4o-mini-realtime-preview-2024-12-17', name: 'GPT-4o Mini Realtime Preview 2024-12-17', provider: 'openai', usageWeight: 5 },
  { id: 'gpt-4o-mini-search-preview', name: 'GPT-4o Mini Search Preview', provider: 'openai', usageWeight: 5 },
  { id: 'gpt-4o-mini-search-preview-2025-03-11', name: 'GPT-4o Mini Search Preview 2025-03-11', provider: 'openai', usageWeight: 5 },
  { id: 'gpt-4o-mini-transcribe', name: 'GPT-4o Mini Transcribe', provider: 'openai', usageWeight: 3 },
  { id: 'gpt-4o-mini-tts', name: 'GPT-4o Mini TTS', provider: 'openai', usageWeight: 3 },
  { id: 'gpt-4o-realtime-preview', name: 'GPT-4o Realtime Preview', provider: 'openai', usageWeight: 20 },
  { id: 'gpt-4o-realtime-preview-2024-12-17', name: 'GPT-4o Realtime Preview 2024-12-17', provider: 'openai', usageWeight: 20 },
  { id: 'gpt-4o-realtime-preview-2025-06-03', name: 'GPT-4o Realtime Preview 2025-06-03', provider: 'openai', usageWeight: 20 },
  { id: 'gpt-4o-search-preview', name: 'GPT-4o Search Preview', provider: 'openai', usageWeight: 15 },
  { id: 'gpt-4o-search-preview-2025-03-11', name: 'GPT-4o Search Preview 2025-03-11', provider: 'openai', usageWeight: 15 },
  { id: 'gpt-4o-transcribe', name: 'GPT-4o Transcribe', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-4o-transcribe-diarize', name: 'GPT-4o Transcribe Diarize', provider: 'openai', usageWeight: 12 },
  { id: 'gpt-5', name: 'GPT-5', provider: 'openai', usageWeight: 100 },
  { id: 'gpt-5-2025-08-07', name: 'GPT-5 2025-08-07', provider: 'openai', usageWeight: 100 },
  { id: 'gpt-5-chat-latest', name: 'GPT-5 Chat Latest', provider: 'openai', usageWeight: 75 },
  { id: 'gpt-5-codex', name: 'GPT-5 Codex', provider: 'openai', usageWeight: 100 },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai', usageWeight: 50 },
  { id: 'gpt-5-mini-2025-08-07', name: 'GPT-5 Mini 2025-08-07', provider: 'openai', usageWeight: 50 },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai', usageWeight: 40 },
  { id: 'gpt-5-nano-2025-08-07', name: 'GPT-5 Nano 2025-08-07', provider: 'openai', usageWeight: 40 },
  { id: 'gpt-5-pro', name: 'GPT-5 Pro', provider: 'openai', usageWeight: 150 },
  { id: 'gpt-5-search-api', name: 'GPT-5 Search API', provider: 'openai', usageWeight: 120 },
  { id: 'gpt-5-search-api-2025-10-14', name: 'GPT-5 Search API 2025-10-14', provider: 'openai', usageWeight: 120 },
  { id: 'gpt-audio', name: 'GPT-Audio', provider: 'openai', usageWeight: 30 },
  { id: 'gpt-audio-2025-08-28', name: 'GPT-Audio 2025-08-28', provider: 'openai', usageWeight: 30 },
  { id: 'gpt-audio-mini', name: 'GPT-Audio Mini', provider: 'openai', usageWeight: 15 },
  { id: 'gpt-audio-mini-2025-10-06', name: 'GPT-Audio Mini 2025-10-06', provider: 'openai', usageWeight: 15 },
  { id: 'gpt-image-1', name: 'GPT-Image-1', provider: 'openai', usageWeight: 20 },
  { id: 'gpt-image-1-mini', name: 'GPT-Image-1 Mini', provider: 'openai', usageWeight: 10 },
  { id: 'gpt-realtime', name: 'GPT-Realtime', provider: 'openai', usageWeight: 35 },
  { id: 'gpt-realtime-mini', name: 'GPT-Realtime Mini', provider: 'openai', usageWeight: 20 },
  { id: 'gpt-realtime-mini-2025-10-06', name: 'GPT-Realtime Mini 2025-10-06', provider: 'openai', usageWeight: 20 },
  { id: 'o1', name: 'o1', provider: 'openai', usageWeight: 30 },
  { id: 'o1-2024-12-17', name: 'o1 2024-12-17', provider: 'openai', usageWeight: 30 },
  { id: 'o1-pro', name: 'o1-pro', provider: 'openai', usageWeight: 50 },
  { id: 'o3', name: 'o3', provider: 'openai', usageWeight: 30 },
  { id: 'o3-2025-04-16', name: 'o3 2025-04-16', provider: 'openai', usageWeight: 30 },
  { id: 'o3-mini', name: 'o3-mini', provider: 'openai', usageWeight: 15 },
  { id: 'o3-mini-2025-01-31', name: 'o3-mini 2025-01-31', provider: 'openai', usageWeight: 15 },
  { id: 'o4-mini-deep-research', name: 'o4-mini Deep Research', provider: 'openai', usageWeight: 25 },
  { id: 'o4-mini-deep-research-2025-06-26', name: 'o4-mini Deep Research 2025-06-26', provider: 'openai', usageWeight: 25 },
  { id: 'text-embedding-3-large', name: 'Text Embedding 3 Large', provider: 'openai', usageWeight: 1 },
  { id: 'text-embedding-ada-002', name: 'Text Embedding Ada-002', provider: 'openai', usageWeight: 1 },
];

// Deduplicate models by ID - last provider wins
// Order: pollinations → kivest
const ALL_CHAT_MODELS = [...POLLINATIONS_CHAT_MODELS, ...KIVEST_CHAT_MODELS, ...OPENROUTER_CHAT_MODELS];

// Keep last occurrence of each model ID (kivest overwrites pollinations)
const seen = new Set<string>();
export const CHAT_MODELS: ChatModel[] = [...ALL_CHAT_MODELS].reverse().filter(model => {
  if (seen.has(model.id)) return false;
  seen.add(model.id);
  return true;
}).reverse();

// All models require PRO subscription (except DeepSeek free tier)
export const PREMIUM_MODELS = new Set([
  ...OPENROUTER_CHAT_MODELS
    .map(model => model.id)
    .filter(id => !id.endsWith(':free')),
  // OpenAI (Pro/Ultra)
  'gpt-5.4', 'gpt-5.3-codex', 'gpt-5.3-spark', 'gpt-5.2', 'gpt-5.2-codex', 'gpt-5.1', 'gpt-5-nano', 'gpt-oss-120b', 'gpt-oss-20b',
  'qwen3.5-plus', 'qwen3.5-flash', 'qwen-slides', 'qwen-deep-research',
  'qwen3.5-397b-a17b', 'qwen3-235b-a22b', 'qwen3-32b', 'qwen3-coder-480b-a35b-instruct',
  'qwen3-next-80b-a3b-instruct', 'qwen3-next-80b-a3b-thinking',
  'phi-4-mini-flash-reasoning', 'phi-4-multimodal-instruct',
  'mimo-v2-pro', 'devstral-2-123b', 'mistral-large-3-675b-instruct', 'mistral-large-3', 'mimo-pro',
  'seed-oss-36b-instruct',
  // Meta (Pro)
  'llama3.1-8B', 'llama-4-maverick-17b-128e-instruct', 'llama-4-scout-17b-16e-instruct', 'llama-4-maverick',
  // Google (Pro)
  'gemini-3-pro-preview', 'gemini-3-flash-preview',
  'gemini-2.5-flash', 'gemini-3.1-pro', 'gemini-2.5-pro',
  'gemini-3.1-pro', 'gemini-3.1-flash-lite-preview', 'gemini-3.1-flash-lite-preview-thinking',
  'gemini-3-flash-preview-thinking', 'gemini-2.5-flash-lite', 'gemini-2.5-flash-thinking',
  'nemotron-3-nano-30b-a3b', 'step-3.5-flash', 'gemma-3-27b-it',
  // MiniMax (Pro - except minimax-2.7 which is duplicate/free)
  'minimax-m2.1', 'minimax-m2.5', 'minimax-m2', 'minimax-m2.7', 'nova',
  // Moonshot (Pro)
  'kimi-k2-instruct-0905', 'kimi-k2.5', 'kimi-k2-thinking',
  // Zhipu (Pro - except glm-4.7 which is free)
  'glm-5', 'glm-4.6', 'glm-5.1', 'glm-4.5', 'glm-4.5-flash', 'glm-5-turbo',
  // xAI Grok (Pro)
  'grok-4.2', 'grok-4.1-thinking', 'grok', 'grok-3', 'grok-4',
  // Xiaomi (Pro - except mimo-v2-pro and mimo-omni which are free, but mimo-pro is Ultra)
  'mimo-pro',
  // Anthropic (Pro - Haiku only, Sonnet/Opus are Ultra)
  'claude-haiku-4.5', 'claude-sonnet-4.6', 'claude-3-7-sonnet-20250219', 'claude-sonnet-4-5',
  // Ultra models (also in premium - these must be here to show correctly on /models page)
  'claude-opus-4-6', 'claude-opus-4-5',
  // Image models (Pro/Ultra - all non-flux models)
  'flux-2', 'zimage', 'qwen-image', 'nanobanana', 'imagen4', 'grok-image',
  'dall-e-3', 'gpt-image-1', 'gpt-image-1.5',
  // Video models (Pro/Ultra)
  'pix2pix-video', 'svd', 'cogvideox-5b',
  // LitRouter additional models (Pro)
  // Alibaba
  'qwen2.5-32b-eva-v0.2', 'qwen2.5-7b-instruct', 'qwen2.5-coder-32b-instruct',
  'qwen3-4b-fp8', 'qwen3-coder', 'qwq-32b',
  // Anthropic
  'claude-sonnet-4.5',
  // Google
  'gemini-2.5-flash-lite', 'gemini-2.5-flash-thinking', 'gemini-3.1-lite',
  'gemini-3.1-flash-lite-preview', 'gemini-3.1-flash-lite-preview-thinking', 'gemma-3-27b-it',
  // Meta
  'llama-3.3-70b-instruct', 'llama-4-maverick', 'llama-4-scout',
  // Microsoft
  'phi-4',
  // MiniMax
  'nova-micro-v1',
  // Mistral
  'mistral-large-3', 'mistral-small-2506',
  // OpenAI
  'gpt-5-mini', 'gpt-5-nano', 'gpt-5.2', 'gpt-5.4', 'o3', 'o3-mini', 'o4-mini',
  'sonar', 'sonar-deep-research', 'sonar-pro', 'sonar-reasoning', 'sonar-reasoning-pro',
  // xAI
  'grok-3', 'grok-3-mini', 'grok-3-mini-fast', 'grok-4', 'grok-4.1',
]);

// Ultra-only models (require ultra plan) - all from Aqua (aquadevs)
export const ULTRA_MODELS = new Set([
  // Claude Ultra (via Aqua)
  'claude-opus-4-6', 'claude-opus-4-5', 'claude-sonnet-4.6', 'claude-sonnet-4-5',
  // Gemini Ultra (via Aqua)
  'gemini-2.5-pro', 'gemini-3.1-pro', 'gemini-3-pro-preview',
  // OpenAI GPT-5 Ultra (via Aqua) 
  'gpt-5.1', 'gpt-5.2', 'gpt-5.2-codex', 'gpt-5.3-codex', 'gpt-5.3-spark', 'gpt-5.4',
  // Zhipu Ultra (via Aqua)
  'glm-5.1',
  // Xiaomi Ultra (via Aqua)
  'mimo-pro',
  // Image models (Ultra)
  'dall-e-3', 'gpt-image-1', 'gpt-image-1.5',
  // Video models (Ultra)
  'cogvideox-5b', 'pix2pix-video', 'svd',
]);

// Free models (no subscription required)
export const FREE_MODELS = new Set([
  // Free models
  'deepseek-chat', 'deepseek-v3.2', 'deepseek-v3.1', 'deepseek-reasoner',
  'glm-4.7', 'mimo-omni',
  ...OPENROUTER_CHAT_MODELS
    .map(model => model.id)
    .filter(id => id.endsWith(':free')),
]);

// Available image models - Pro tier (except flux which is free)
export const IMAGE_MODELS: ImageModel[] = [
  // Pollinations (Free)
  { id: 'flux', name: 'Flux', provider: 'pollinations', description: 'Flux Free Image', usageWeight: 10 },
  { id: 'flux-realism', name: 'Flux Realism', provider: 'pollinations', description: 'Flux Realism', usageWeight: 10 },
  { id: 'flux-anime', name: 'Flux Anime', provider: 'pollinations', description: 'Flux Anime', usageWeight: 10 },
  { id: 'flux-3d', name: 'Flux 3D', provider: 'pollinations', description: 'Flux 3D', usageWeight: 10 },
  { id: 'sdxl', name: 'SDXL', provider: 'pollinations', description: 'Stable Diffusion XL', usageWeight: 10 },
  { id: 'any-dark', name: 'Any Dark', provider: 'pollinations', description: 'Any Dark', usageWeight: 10 },
  // Aqua (Pro) - Image models from various providers
  { id: 'flux-2', name: 'Flux 2', provider: 'pollinations', description: 'Flux 2 Image Generation', usageWeight: 4 },
  { id: 'zimage', name: 'ZImage', provider: 'zhipu', description: 'ZImage Generation', usageWeight: 3 },
  { id: 'qwen-image', name: 'Qwen Image', provider: 'alibaba', description: 'Alibaba Qwen Image Generation', usageWeight: 3 },
  { id: 'nanobanana', name: 'NanoBanana', provider: 'google', description: 'Google NanoBanana Image Generation', usageWeight: 4 },
  { id: 'imagen4', name: 'Imagen 4', provider: 'google', description: 'Google Imagen 4', usageWeight: 5 },
  { id: 'grok-image', name: 'Grok Imagine 1.0', provider: 'xai', description: 'xAI Grok Imagine', usageWeight: 4 },
  // OpenAI (Ultra) - via Aqua/Polliuations if available
  { id: 'dall-e-3', name: 'DALL-E 3', provider: 'openai', description: 'OpenAI DALL-E 3 Image Generation', usageWeight: 20 },
  { id: 'gpt-image-1', name: 'GPT Image 1', provider: 'openai', description: 'OpenAI GPT Image 1', usageWeight: 25 },
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5', provider: 'openai', description: 'OpenAI GPT Image 1.5', usageWeight: 25 },
];

// Available video models - Pro tier
export const VIDEO_MODELS: VideoModel[] = [
  // Pollinations (Pro)
  { id: 'cogvideox-5b', name: 'CogVideoX 5B', provider: 'pollinations', description: 'CogVideoX 5B', usageWeight: 8, maxDuration: 10 },
  { id: 'pix2pix-video', name: 'Pix2Pix Video', provider: 'pollinations', description: 'Pix2Pix Video Generation', usageWeight: 8, maxDuration: 10 },
  { id: 'svd', name: 'Stable Video Diffusion', provider: 'pollinations', description: 'SVD Video Generation', usageWeight: 6, maxDuration: 4 },
];

// Video models require pro/video_pro plan for access
export const VIDEO_MODELS_SET = new Set(VIDEO_MODELS.map(m => m.id));

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
  liz: 'https://api.lizai.xyz',
  openai: 'https://api.openai.com/v1',
  kivest: 'https://ai.ezif.in/v1',
  shalom: 'https://api.bluesminds.com/v1',
  bluesminds: 'https://api.bluesminds.com/v1',
  minimax: 'https://api.bluesminds.com/v1',
  aqua: 'https://api.aquadevs.com/v1',
  blazeai: 'https://blazeai.boxu.dev/v1',
};
