// Extended model information including descriptions, strengths, weaknesses, and technical details

export interface ModelDetails {
  id: string;
  name: string;
  provider: string;
  family?: string;
  description: string;
  longDescription?: string;
  strengths: string[];
  weaknesses: string[];
  useCases: string[];
  technicalSpecs?: {
    contextWindow?: string;
    maxTokens?: string;
    trainingData?: string;
    releaseDate?: string;
    architecture?: string;
  };
}

export const CHAT_MODEL_DETAILS: Record<string, ModelDetails> = {
  'openai': {
    id: 'openai',
    name: 'OpenAI GPT-5 Mini',
    provider: 'Pollinations',
    family: 'GPT-5',
    description: 'OpenAI GPT-5 Mini model',
    longDescription: 'GPT-5 Mini is OpenAI\'s latest multimodal model that can process both text and images, offering improved reasoning, coding, and creative capabilities compared to previous versions.',
    strengths: [
      'Excellent reasoning and problem-solving',
      'Strong coding capabilities',
      'Multimodal (text and image understanding)',
      'High quality creative writing',
      'Good at following complex instructions'
    ],
    weaknesses: [
      'Can be verbose in responses',
      'May occasionally hallucinate facts',
      'Knowledge cutoff in training data'
    ],
    useCases: ['Complex problem solving', 'Code generation and debugging', 'Creative writing', 'Data analysis', 'General conversation'],
    technicalSpecs: {
      contextWindow: '750',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'openai-fast': {
    id: 'openai-fast',
    name: 'OpenAI GPT-5 Nano',
    provider: 'Pollinations',
    family: 'GPT-5',
    description: 'Fast OpenAI GPT-5 Nano model',
    longDescription: 'GPT-5 Nano is a faster, more efficient version of GPT-5 Mini, optimized for speed while maintaining strong performance on most tasks.',
    strengths: [
      'Fast response times',
      'Cost-effective',
      'Good general knowledge',
      'Efficient for simple tasks'
    ],
    weaknesses: [
      'Less capable than full GPT-5 Mini on complex tasks',
      'May struggle with very nuanced queries',
      'Smaller context window'
    ],
    useCases: ['Quick queries', 'Simple coding tasks', 'General conversation', 'Content summarization'],
    technicalSpecs: {
      contextWindow: '700',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'claude': {
    id: 'claude',
    name: 'Anthropic Claude Sonnet 4.5',
    provider: 'Pollinations',
    family: 'Claude 4.5',
    description: 'Anthropic Claude Sonnet 4.5',
    longDescription: 'Claude Sonnet 4.5 is Anthropic\'s balanced model offering excellent performance across a wide range of tasks, with strong focus on safety and helpfulness.',
    strengths: [
      'Excellent at analysis and reasoning',
      'Strong code generation',
      'Very good at following instructions',
      'Balanced speed and capability',
      'Safety-focused responses'
    ],
    weaknesses: [
      'Can be overly cautious at times',
      'May refuse certain harmless requests',
      'Less creative than some alternatives'
    ],
    useCases: ['Code review and generation', 'Technical writing', 'Data analysis', 'Research assistance', 'Safe AI applications'],
    technicalSpecs: {
      contextWindow: '30',
      architecture: 'Constitutional AI',
      releaseDate: '2024'
    }
  },
  'gemini': {
    id: 'gemini',
    name: 'Gemini 3 Flash',
    provider: 'Pollinations',
    family: 'Gemini 3',
    description: 'Google Gemini 3 Flash',
    longDescription: 'Gemini 3 Flash is Google\'s fast, efficient multimodal AI model with excellent reasoning and real-time capabilities.',
    strengths: [
      'Fast response times',
      'Strong multimodal capabilities',
      'Excellent for real-time applications',
      'Good reasoning abilities',
      'Integration with Google services'
    ],
    weaknesses: [
      'Less tested than GPT-4',
      'May have inconsistent performance',
      'Limited availability in some regions'
    ],
    useCases: ['Real-time chat', 'Multimodal tasks', 'Quick information retrieval', 'Education', 'General assistance'],
    technicalSpecs: {
      contextWindow: '150',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'gemini-large': {
    id: 'gemini-large',
    name: 'Google Gemini 3 Pro',
    provider: 'Google',
    family: 'Gemini 3',
    description: 'Google Gemini 3 Pro flagship model',
    longDescription: 'Gemini 3 Pro is Google\'s most capable model, offering state-of-the-art performance in complex reasoning, multimodal understanding, and creative tasks.',
    strengths: [
      'Top-tier reasoning and logic',
      'Superior multimodal understanding',
      'Excellent creative capabilities',
      'Large context window',
      'Strong coding performance'
    ],
    weaknesses: [
      'Higher latency than Flash',
      'Limited availability in some regions'
    ],
    useCases: ['Complex problem solving', 'Multimodal research', 'Advanced creative work', 'Deep reasoning'],
    technicalSpecs: {
      contextWindow: '30',
      architecture: 'Gemini 3 Architecture',
      releaseDate: '2025'
    }
  },
  'chickytutor': {
    id: 'chickytutor',
    name: 'ChickyTutor AI Language Tutor',
    provider: 'Pollinations',
    family: 'Chicky',
    description: 'AI Language Learning Assistant',
    longDescription: 'ChickyTutor is a specialized AI model designed to help users learn new languages through interactive conversation, grammar correction, and cultural insights.',
    strengths: [
      'Patient and encouraging tone',
      'Excellent grammar correction',
      'Natural conversational style',
      'Supports multiple languages',
      'Cultural context awareness'
    ],
    weaknesses: [
      'Less capable for general coding',
      'May struggle with very technical scientific topics'
    ],
    useCases: ['Language learning', 'Conversation practice', 'Grammar check', 'Translation help'],
    technicalSpecs: {
      contextWindow: '200',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'midijourney': {
    id: 'midijourney',
    name: 'MIDIjourney',
    provider: 'Pollinations',
    family: 'MIDI',
    description: 'AI Music & MIDI Generation Model',
    longDescription: 'MIDIjourney is a specialized model for generating musical compositions in MIDI format, capable of creating complex melodies, harmonies, and rhythms across various genres.',
    strengths: [
      'Excellent musical theory knowledge',
      'Generates high-quality MIDI data',
      'Supports multiple musical genres',
      'Creative composition abilities',
      'Good at following stylistic instructions'
    ],
    weaknesses: [
      'Does not output raw audio (MIDI only)',
      'Not for general text conversation'
    ],
    useCases: ['Music composition', 'Melody generation', 'Chord progression ideas', 'Songwriting assistance'],
    technicalSpecs: {
      contextWindow: '150',
      architecture: 'Specialized MIDI Transformer',
      releaseDate: '2024'
    }
  },
  'deepseek': {
    id: 'deepseek',
    name: 'DeepSeek V3.2',
    provider: 'Pollinations',
    family: 'DeepSeek',
    description: 'DeepSeek V3.2 reasoning model',
    longDescription: 'DeepSeek V3.2 is a state-of-the-art open-source language model optimized for deep reasoning, mathematical problem solving, and complex logic.',
    strengths: [
      'Exceptional reasoning and logic',
      'Strong mathematical capabilities',
      'Excellent coding performance',
      'Large context window',
      'Highly cost-effective'
    ],
    weaknesses: [
      'Can be slower for simple tasks',
      'Less creative than some alternatives'
    ],
    useCases: ['Complex problem solving', 'Math and logic', 'Scientific research', 'Advanced coding'],
    technicalSpecs: {
      contextWindow: '400',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'gemini-search': {
    id: 'gemini-search',
    name: 'Google Gemini 3 Flash (Search)',
    provider: 'Google',
    family: 'Gemini 3',
    description: 'Google Gemini 3 Flash with Search & Vision',
    longDescription: 'Gemini 3 Flash optimized for web search, real-time information retrieval, and vision tasks.',
    strengths: [
      'Real-time web search integration',
      'Superior vision and image understanding',
      'Excellent coding assistance',
      'Fast response times',
      'Large context window'
    ],
    weaknesses: [
      'Less deep reasoning than Pro versions',
      'Search results depend on availability'
    ],
    useCases: ['Information retrieval', 'Image analysis', 'Quick coding tasks', 'General assistance'],
    technicalSpecs: {
      contextWindow: '200',
      architecture: 'Gemini 3 Architecture',
      releaseDate: '2025'
    }
  },
  'kimi-k2-thinking': {
    id: 'kimi-k2-thinking',
    name: 'Moonshot Kimi K2 Thinking',
    provider: 'Moonshot AI',
    family: 'Kimi',
    description: 'Moonshot Kimi K2 with deep thinking capabilities',
    longDescription: 'Kimi K2 Thinking is designed for long-context reasoning and deep analysis of complex information.',
    strengths: [
      'Deep thinking and analysis',
      'Excellent long-context performance',
      'Strong logical reasoning',
      'Large context window',
      'Highly accurate responses'
    ],
    weaknesses: [
      'Higher latency due to thinking process',
      'Limited multimodal support'
    ],
    useCases: ['Deep analysis', 'Long document processing', 'Logical deduction', 'Research'],
    technicalSpecs: {
      contextWindow: '200',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'openai-audio': {
    id: 'openai-audio',
    name: 'OpenAI GPT-4o Mini Audio',
    provider: 'OpenAI',
    family: 'GPT-4o',
    description: 'Multimodal GPT-4o Mini with Audio support',
    longDescription: 'A specialized version of GPT-4o Mini that supports vision, audio input, and high-quality audio output.',
    strengths: [
      'Full audio input and output',
      'Vision and image understanding',
      'Fast and efficient',
      'Large context window',
      'Natural voice generation'
    ],
    weaknesses: [
      'Less reasoning power than GPT-5',
      'Audio processing adds slight latency'
    ],
    useCases: ['Voice assistants', 'Audio-to-text', 'Image analysis', 'Real-time conversation'],
    technicalSpecs: {
      contextWindow: '150',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'glm': {
    id: 'glm',
    name: 'Z.ai GLM-4.7',
    provider: 'Z-AI',
    family: 'GLM',
    description: 'GLM-4.7 reasoning model',
    longDescription: 'The latest version of the General Language Model (GLM), optimized for reasoning and logic.',
    strengths: [
      'Strong logical reasoning',
      'Good multilingual support',
      'Fast response times',
      'Large context window',
      'Balanced performance'
    ],
    weaknesses: [
      'Less vision capability than competitors',
      'Knowledge cutoff concerns'
    ],
    useCases: ['General reasoning', 'Translation', 'Coding assistance', 'Content generation'],
    technicalSpecs: {
      contextWindow: '150',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'minimax': {
    id: 'minimax',
    name: 'MiniMax M2.1',
    provider: 'MiniMax',
    family: 'MiniMax',
    description: 'MiniMax M2.1 reasoning model',
    longDescription: 'MiniMax M2.1 is a high-performance reasoning model with strong logic and creative capabilities.',
    strengths: [
      'Deep logical reasoning',
      'Creative writing ability',
      'Fast and reliable',
      'Large context window',
      'Strong performance in Chinese'
    ],
    weaknesses: [
      'Smaller global community',
      'Limited multimodal features'
    ],
    useCases: ['Reasoning tasks', 'Creative writing', 'General chat', 'Educational support'],
    technicalSpecs: {
      contextWindow: '150',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'openai-large': {
    id: 'openai-large',
    name: 'OpenAI GPT-5.2',
    provider: 'OpenAI',
    family: 'GPT-5',
    description: 'OpenAI GPT-5.2 flagship model',
    longDescription: 'The next generation of OpenAI\'s flagship series, GPT-5.2 offers unparalleled reasoning and vision capabilities.',
    strengths: [
      'Ultimate reasoning performance',
      'Superior vision and image understanding',
      'Exceptional coding capabilities',
      'Highly stable and reliable',
      'Large context window'
    ],
    weaknesses: [
      'Higher usage weight',
      'Can be verbose'
    ],
    useCases: ['Deep analysis', 'Complex software engineering', 'Advanced scientific research', 'High-end creative projects'],
    technicalSpecs: {
      contextWindow: '100',
      architecture: 'Next-gen Transformer',
      releaseDate: '2025'
    }
  },
  'perplexity-reasoning': {
    id: 'perplexity-reasoning',
    name: 'Perplexity Sonar Reasoning',
    provider: 'Perplexity',
    family: 'Sonar',
    description: 'Perplexity Sonar with Search & Reasoning',
    longDescription: 'Perplexity Sonar Reasoning combines deep logical thinking with real-time web search capabilities.',
    strengths: [
      'Real-time web search',
      'Deep reasoning and logic',
      'Excellent for research',
      'Highly accurate information',
      'Large context window'
    ],
    weaknesses: [
      'Higher latency than standard Sonar',
      'Search results depend on availability'
    ],
    useCases: ['In-depth research', 'Fact-checking', 'Complex information retrieval', 'Logical analysis'],
    technicalSpecs: {
      contextWindow: '100',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'claude-fast': {
    id: 'claude-fast',
    name: 'Anthropic Claude Haiku 4.5',
    provider: 'Anthropic',
    family: 'Claude 4.5',
    description: 'Fast Anthropic Claude Haiku 4.5 with Vision',
    longDescription: 'Claude Haiku 4.5 is the fastest model in the Claude 4.5 family, now with built-in vision support.',
    strengths: [
      'Extremely fast response times',
      'Vision and image understanding',
      'Highly cost-effective',
      'Excellent for simple tasks',
      'Balanced context window'
    ],
    weaknesses: [
      'Less reasoning power than Sonnet/Opus',
      'Smaller context window'
    ],
    useCases: ['Quick queries', 'Image tagging', 'Simple coding', 'General chat'],
    technicalSpecs: {
      contextWindow: '55',
      architecture: 'Constitutional AI',
      releaseDate: '2025'
    }
  },
  'claude-large': {
    id: 'claude-large',
    name: 'Anthropic Claude Opus 4.5',
    provider: 'Anthropic',
    family: 'Claude 4.5',
    description: 'Anthropic Claude Opus 4.5 flagship model',
    longDescription: 'Claude Opus 4.5 is Anthropic\'s most powerful model, offering deep reasoning and superior vision capabilities.',
    strengths: [
      'Deep philosophical reasoning',
      'Superior vision and image analysis',
      'Highly creative expression',
      'Exceptional at nuanced roleplay',
      '20 context window'
    ],
    weaknesses: [
      'Higher usage weight',
      'Slower than Sonnet'
    ],
    useCases: ['Premium roleplay', 'Philosophical exploration', 'Creative writing', 'Deep emotional support'],
    technicalSpecs: {
      contextWindow: '20',
      architecture: 'Constitutional AI',
      releaseDate: '2025'
    }
  },
  'mistral': {
    id: 'mistral',
    name: 'Mistral Small 3.2 24B',
    provider: 'Pollinations',
    family: 'Mistral',
    description: 'Mistral Small 3.2 24B',
    longDescription: 'Mistral Small 3.2 24B is a high-performance European AI model offering strong multilingual capabilities and reasoning.',
    strengths: [
      'Excellent multilingual support',
      'Strong reasoning capabilities',
      'European data privacy standards',
      'Good for business applications',
      'Competitive performance'
    ],
    weaknesses: [
      'Newer in the market',
      'Smaller ecosystem than OpenAI',
      'May have some edge case issues'
    ],
    useCases: ['Multilingual applications', 'European business use', 'Code generation', 'General reasoning'],
    technicalSpecs: {
      contextWindow: '2000',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'qwen-coder': {
    id: 'qwen-coder',
    name: 'Qwen3 Coder 30B',
    provider: 'Pollinations',
    family: 'Qwen',
    description: 'Qwen3 Coder 30B',
    longDescription: 'Qwen3 Coder is a specialized coding model from Alibaba Cloud, optimized for software development tasks.',
    strengths: [
      'Specialized for coding tasks',
      'Supports many programming languages',
      'Good code completion',
      'Strong debugging capabilities',
      'Open source'
    ],
    weaknesses: [
      'Less capable for non-coding tasks',
      'May struggle with creative writing',
      'Smaller context window than some alternatives'
    ],
    useCases: ['Code generation', 'Code review', 'Debugging', 'API development', 'Technical documentation'],
    technicalSpecs: {
      contextWindow: '1600',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'nova-fast': {
    id: 'nova-fast',
    name: 'Amazon Nova Micro',
    provider: 'Pollinations',
    family: 'Nova',
    description: 'Amazon Nova Micro',
    longDescription: 'Amazon Nova Micro is a fast and efficient model optimized for quick responses and simple tasks.',
    strengths: [
      'Fast response times',
      'Cost-effective',
      'Good for simple queries',
      'Efficient'
    ],
    weaknesses: [
      'Limited reasoning capabilities',
      'Smaller context window'
    ],
    useCases: ['Quick queries', 'Simple tasks', 'Summarization'],
    technicalSpecs: {
      contextWindow: '24400',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'gemini-fast': {
    id: 'gemini-fast',
    name: 'Google Gemini 2.5 Flash Lite',
    provider: 'Google',
    family: 'Gemini 2.5',
    description: 'Fast Google Gemini 2.5 Flash Lite',
    longDescription: 'Gemini 2.5 Flash Lite is a lightweight, high-speed model from Google, perfect for low-latency tasks.',
    strengths: [
      'Extremely low latency',
      'Efficient multimodal support',
      'Fast response times',
      'Cost-effective'
    ],
    weaknesses: [
      'Lower reasoning power',
      'Small context window'
    ],
    useCases: ['Real-time chat', 'Simple multimodal tasks', 'Quick queries'],
    technicalSpecs: {
      contextWindow: '2000',
      architecture: 'Gemini Architecture',
      releaseDate: '2024'
    }
  },
  'grok': {
    id: 'grok',
    name: 'xAI Grok 4 Fast',
    provider: 'xAI',
    family: 'Grok',
    description: 'xAI Grok 4 Fast',
    longDescription: 'Grok 4 Fast is xAI\'s efficient and real-time model, offering a unique personality and fast response times.',
    strengths: [
      'Real-time information',
      'Fast response times',
      'Unique personality',
      'Good general knowledge'
    ],
    weaknesses: [
      'Limited context window',
      'May be less stable than established models'
    ],
    useCases: ['Real-time news', 'Quick queries', 'General conversation'],
    technicalSpecs: {
      contextWindow: '900',
      architecture: 'Transformer-based',
      releaseDate: '2025'
    }
  },
  'perplexity-fast': {
    id: 'perplexity-fast',
    name: 'Perplexity Sonar',
    provider: 'Perplexity',
    family: 'Sonar',
    description: 'Fast Perplexity Sonar Search',
    longDescription: 'Perplexity Sonar is optimized for fast web search and information retrieval.',
    strengths: [
      'Fast search results',
      'Accurate information retrieval',
      'Good for quick fact-checking'
    ],
    weaknesses: [
      'Limited reasoning',
      'Small context window'
    ],
    useCases: ['Quick search', 'Fact checking', 'General queries'],
    technicalSpecs: {
      contextWindow: '750',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  // Liz Proxy Models
  'liz-claude-3-7-sonnet': {
    id: 'liz-claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet (Liz)',
    provider: 'Liz Proxy',
    family: 'Claude 3.7',
    description: 'Anthropic Claude 3.7 Sonnet via Liz Proxy',
    longDescription: 'Anthropic\'s most intelligent and capable model to date, featuring breakthrough reasoning and creative writing capabilities. Proxied via Liz for uncensored performance.',
    strengths: [
      'Reasoning',
      'Creative Writing',
      'Coding',
      'Uncensored Content'
    ],
    weaknesses: [
      'Higher Latency'
    ],
    useCases: ['Roleplay', 'Complex Coding', 'Creative Writing', 'Deep Reasoning'],
    technicalSpecs: {
      contextWindow: '200',
      architecture: 'Transformer-based',
      releaseDate: '2025'
    }
  },
  'liz-claude-3-5-sonnet': {
    id: 'liz-claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet (Liz)',
    provider: 'Liz Proxy',
    family: 'Claude 3.5',
    description: 'Anthropic Claude 3.5 Sonnet via Liz Proxy',
    longDescription: 'Claude 3.5 Sonnet is Anthropic\'s balanced model, offering the best combination of speed and intelligence for complex tasks.',
    strengths: [
      'Industry-leading speed',
      'Superior coding and reasoning',
      'Excellent vision capabilities',
      'Nuanced writing and roleplay',
      'Large context window'
    ],
    weaknesses: [
      'Less reasoning than Opus',
      'Can be blunt'
    ],
    useCases: ['Coding assistance', 'Vision tasks', 'Complex reasoning', 'Roleplay'],
    technicalSpecs: {
      contextWindow: '200',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'liz-claude-3-opus': {
    id: 'liz-claude-3-opus',
    name: 'Claude 3 Opus (Liz)',
    provider: 'Liz Proxy',
    family: 'Claude 3',
    description: 'Anthropic Claude 3 Opus via Liz Proxy (NSFW/Smut Optimized)',
    longDescription: 'Claude 3 Opus is Anthropic\'s most powerful model, optimized by Liz for creative writing and unaligned responses.',
    strengths: [
      'Deep philosophical reasoning',
      'Superior roleplay and creative writing',
      'Unmatched nuance and intelligence',
      'Excellent for complex instructions',
      'Optimized for NSFW/Smut content'
    ],
    weaknesses: [
      'Higher latency',
      'High usage weight'
    ],
    useCases: ['Creative writing', 'Advanced roleplay', 'Complex problem solving', 'Nuanced conversation'],
    technicalSpecs: {
      contextWindow: '200',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'liz-claude-sonnet-4': {
    id: 'liz-claude-sonnet-4',
    name: 'Claude Sonnet 4 (Liz)',
    provider: 'Liz Proxy',
    family: 'Claude 4',
    description: 'Anthropic Claude Sonnet 4 via Liz Proxy',
    longDescription: 'The next generation of Anthropic\'s balanced model, offering improved performance and intelligence.',
    strengths: [
      'Next-gen reasoning',
      'Improved coding performance',
      'Better vision capabilities',
      'Higher efficiency',
      'Enhanced instruction following'
    ],
    weaknesses: [
      'New and potentially unstable',
      'Limited historical testing'
    ],
    useCases: ['Complex reasoning', 'Next-gen software development', 'Advanced vision tasks'],
    technicalSpecs: {
      contextWindow: '30',
      architecture: 'Transformer-based',
      releaseDate: '2025'
    }
  },
  'liz-claude-opus-4': {
    id: 'liz-claude-opus-4',
    name: 'Claude Opus 4 (Liz)',
    provider: 'Liz Proxy',
    family: 'Claude 4',
    description: 'Anthropic Claude Opus 4 via Liz Proxy (Creative/NSFW)',
    longDescription: 'Anthropic\'s future flagship model, optimized for the most demanding creative and reasoning tasks.',
    strengths: [
      'State-of-the-art intelligence',
      'Deepest reasoning capabilities',
      'Superior creative expression',
      'Ultimate instruction following',
      'Optimized for creative and NSFW content'
    ],
    weaknesses: [
      'Highest usage weight',
      'Higher latency'
    ],
    useCases: ['Ultimate creative projects', 'Deep reasoning research', 'Complex philosophical exploration'],
    technicalSpecs: {
      contextWindow: '20',
      architecture: 'Transformer-based',
      releaseDate: '2025'
    }
  },
  'liz-claude-opus-4.5': {
    id: 'liz-claude-opus-4.5',
    name: 'Claude Opus 4.5 (Liz)',
    provider: 'Liz Proxy',
    family: 'Claude 4.5',
    description: 'Anthropic Claude Opus 4.5 via Liz Proxy (Ultimate Reasoning)',
    longDescription: 'The pinnacle of the Claude family, offering the highest level of intelligence and reasoning available.',
    strengths: [
      'Unparalleled intelligence',
      'Ultimate reasoning and logic',
      'Best-in-class vision and creativity',
      'Superior performance across all benchmarks',
      'Deeply nuanced understanding'
    ],
    weaknesses: [
      'Highest usage weight',
      'Longer response times'
    ],
    useCases: ['Cutting-edge scientific research', 'Ultimate problem solving', 'High-end creative work'],
    technicalSpecs: {
      contextWindow: '20',
      architecture: 'Transformer-based',
      releaseDate: '2025'
    }
  },
  'liz-gpt-4o': {
    id: 'liz-gpt-4o',
    name: 'GPT-4o (Liz)',
    provider: 'Liz Proxy',
    family: 'GPT-4o',
    description: 'OpenAI GPT-4o via Liz Proxy',
    longDescription: 'OpenAI\'s flagship multimodal model, offering high speed and intelligence across text and vision.',
    strengths: [
      'Excellent multimodal performance',
      'Very fast response times',
      'Strong reasoning and coding',
      'Highly stable and reliable',
      'Large knowledge base'
    ],
    weaknesses: [
      'Can be verbose',
      'May follow instructions too literally'
    ],
    useCases: ['General assistance', 'Multimodal tasks', 'Coding help', 'Information retrieval'],
    technicalSpecs: {
      contextWindow: '128',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'liz-gemini-1.5-pro': {
    id: 'liz-gemini-1.5-pro',
    name: 'Gemini 1.5 Pro (Liz)',
    provider: 'Liz Proxy',
    family: 'Gemini 1.5',
    description: 'Google Gemini 1.5 Pro via Liz Proxy',
    longDescription: 'Gemini 1.5 Pro features a massive context window and strong multimodal capabilities, making it ideal for analyzing large amounts of data or long documents.',
    strengths: [
      'Massive context window',
      'Strong multimodal understanding',
      'Excellent at needle-in-a-haystack tasks',
      'Good reasoning capabilities',
      'Fast for its size'
    ],
    weaknesses: [
      'May hallucinate in very long contexts',
      'Proxied access latency'
    ],
    useCases: ['Long document analysis', 'Video/Audio understanding', 'Complex data retrieval', 'Large-scale coding projects'],
    technicalSpecs: {
      contextWindow: '128',
      architecture: 'Gemini Architecture',
      releaseDate: '2024'
    }
  },
  'liz-gemini-2.0-flash': {
    id: 'liz-gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (Liz)',
    provider: 'Liz Proxy',
    family: 'Gemini 2.0',
    description: 'Google Gemini 2.0 Flash via Liz Proxy',
    longDescription: 'A high-speed multimodal model from the Gemini 2.0 family, offering excellent performance for daily tasks.',
    strengths: [
      'Fast and responsive',
      'Good multimodal capabilities',
      'Cost-effective',
      'Stable performance',
      'Versatile for common tasks'
    ],
    weaknesses: [
      'Less depth than newer versions',
      'Limited reasoning on complex topics'
    ],
    useCases: ['Daily assistant tasks', 'Fast chat', 'Simple data extraction'],
    technicalSpecs: {
      contextWindow: '128',
      architecture: 'Gemini Architecture',
      releaseDate: '2024'
    }
  },
  'liz-gemini-2.5-flash': {
    id: 'liz-gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Liz)',
    provider: 'Liz Proxy',
    family: 'Gemini 2.5',
    description: 'Google Gemini 2.5 Flash via Liz Proxy',
    longDescription: 'Gemini 2.5 Flash is a high-speed, efficient multimodal model optimized for low-latency tasks.',
    strengths: [
      'Extremely fast response times',
      'Strong multimodal performance',
      'Great for quick tasks',
      'Reliable for real-time chat',
      'Efficient instruction following'
    ],
    weaknesses: [
      'Lower reasoning than Pro models',
      'Smaller knowledge base'
    ],
    useCases: ['Real-time assistance', 'Fast summarization', 'Quick queries', 'Vision-based chat'],
    technicalSpecs: {
      contextWindow: '128',
      architecture: 'Gemini Architecture',
      releaseDate: '2024'
    }
  },
  'liz-gemini-2.5-pro': {
    id: 'liz-gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (Liz)',
    provider: 'Liz Proxy',
    family: 'Gemini 2.5',
    description: 'Google Gemini 2.5 Pro via Liz Proxy',
    longDescription: 'Gemini 2.5 Pro is a highly capable multimodal model designed for complex reasoning and creative tasks.',
    strengths: [
      'Strong logical reasoning',
      'Superior multimodal understanding',
      'Excellent for research and analysis',
      'High creative potential',
      'Reliable performance'
    ],
    weaknesses: [
      'Higher latency than Flash',
      'Higher usage weight'
    ],
    useCases: ['Deep research', 'Complex multimodal analysis', 'Creative projects', 'Strategic planning'],
    technicalSpecs: {
      contextWindow: '128',
      architecture: 'Gemini Architecture',
      releaseDate: '2024'
    }
  },
  'liz-gemini-3-flash': {
    id: 'liz-gemini-3-flash',
    name: 'Gemini 3 Flash (Liz)',
    provider: 'Liz Proxy',
    family: 'Gemini 3',
    description: 'Google Gemini 3 Flash via Liz Proxy (Preview)',
    longDescription: 'The next generation of Google\'s efficient models, Gemini 3 Flash (Preview) offers a glimpse into the future of high-speed, high-capability AI.',
    strengths: [
      'Next-gen performance',
      'Incredible speed',
      'Enhanced multimodal logic',
      'Experimental features',
      'Efficient resource usage'
    ],
    weaknesses: [
      'Experimental/Preview status',
      'Potential for unexpected behavior',
      'Limited availability'
    ],
    useCases: ['Cutting-edge application development', 'Experimental AI workflows', 'Testing next-gen capabilities', 'High-speed future-proofing'],
    technicalSpecs: {
      contextWindow: '150',
      architecture: 'Gemini 3 Architecture',
      releaseDate: '2025 (Preview)'
    }
  },
  'liz-gemini-3-pro': {
    id: 'liz-gemini-3-pro',
    name: 'Gemini 3 Pro (Liz)',
    provider: 'Liz Proxy',
    family: 'Gemini 3',
    description: 'Google Gemini 3 Pro via Liz Proxy (Preview)',
    longDescription: 'Google\'s future flagship model, Gemini 3 Pro (Preview), represents the ultimate in reasoning and multimodal AI technology.',
    strengths: [
      'Ultimate reasoning performance',
      'Next-gen multimodal synthesis',
      'Massive future-ready context',
      'Deep conceptual understanding',
      'Top-tier problem solving'
    ],
    weaknesses: [
      'Experimental/Preview status',
      'Highest latency',
      'Very high usage weight'
    ],
    useCases: ['Future-tech research', 'Ultimate conceptual design', 'Next-gen software architecture', 'Experimental deep reasoning'],
    technicalSpecs: {
      contextWindow: '30',
      architecture: 'Gemini 3 Architecture',
      releaseDate: '2025 (Preview)'
    }
  },
  'liz-deepseek-v3': {
    id: 'liz-deepseek-v3',
    name: 'DeepSeek V3 (Liz)',
    provider: 'Liz Proxy',
    family: 'DeepSeek',
    description: 'DeepSeek V3 via Liz Proxy',
    longDescription: 'DeepSeek V3 is a powerful open-source model that rivals top proprietary models in coding and reasoning performance.',
    strengths: [
      'Exceptional coding performance',
      'Strong mathematical reasoning',
      'Very cost-effective',
      'High speed',
      'Strong multilingual support'
    ],
    weaknesses: [
      'Less creative than Claude',
      'Can be blunt in responses'
    ],
    useCases: ['Software development', 'Math problem solving', 'Technical analysis', 'Translation'],
    technicalSpecs: {
      contextWindow: '400',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'liz-deepseek-r1': {
    id: 'liz-deepseek-r1',
    name: 'DeepSeek R1 (Liz)',
    provider: 'Liz Proxy',
    family: 'DeepSeek',
    description: 'DeepSeek R1 Reasoning via Liz Proxy',
    longDescription: 'DeepSeek R1 is a specialized reasoning model designed to think through complex problems before responding, similar to OpenAI\'s o1.',
    strengths: [
      'Step-by-step reasoning',
      'Excellent at complex math and logic',
      'Great for debugging difficult code',
      'Higher accuracy on factual queries',
      'Transparent thinking process'
    ],
    weaknesses: [
      'Slower response time due to thinking',
      'Not ideal for simple chat'
    ],
    useCases: ['Complex math', 'Logic puzzles', 'Advanced debugging', 'Scientific research', 'Fact checking'],
    technicalSpecs: {
      contextWindow: '128',
      architecture: 'Reasoning-optimized Transformer',
      releaseDate: '2025'
    }
  },
  'liz-o1': {
    id: 'liz-o1',
    name: 'OpenAI o1 (Liz)',
    provider: 'Liz Proxy',
    family: 'OpenAI o1',
    description: 'OpenAI o1 Reasoning via Liz Proxy',
    longDescription: 'OpenAI o1 is a new class of model trained with reinforcement learning to perform complex reasoning. It excels at science, math, and coding.',
    strengths: [
      'Unmatched reasoning capabilities',
      'PhD-level performance in science',
      'Exceptional math and logic',
      'Self-correcting thought process',
      'Highly accurate on complex tasks'
    ],
    weaknesses: [
      'Significant "thinking" latency',
      'High usage weight',
      'No multimodal support yet'
    ],
    useCases: ['Scientific research', 'Advanced mathematics', 'Complex software architecture', 'Strategic planning'],
    technicalSpecs: {
      contextWindow: '128',
      architecture: 'RL-based Reasoning',
      releaseDate: '2024'
    }
  },
  'liz-o3-mini': {
    id: 'liz-o3-mini',
    name: 'OpenAI o3-mini (Liz)',
    provider: 'Liz Proxy',
    family: 'OpenAI o3',
    description: 'OpenAI o3-mini Reasoning via Liz Proxy',
    longDescription: 'OpenAI o3-mini is a faster, more efficient reasoning model that provides high-level logic and coding capabilities at a lower latency than o1.',
    strengths: [
      'Fast reasoning',
      'Strong coding skills',
      'Good balance of logic and speed',
      'Cost-effective reasoning',
      'Excellent instruction following'
    ],
    weaknesses: [
      'Less "deep" than o1-full',
      'Smaller knowledge base than o1'
    ],
    useCases: ['Coding assistance', 'Intermediate math', 'Logical analysis', 'Quick problem solving'],
    technicalSpecs: {
      contextWindow: '128',
      architecture: 'Efficient Reasoning',
      releaseDate: '2025'
    }
  },
  'liz-qwen3-235b': {
    id: 'liz-qwen3-235b',
    name: 'Qwen3 235B (Liz)',
    provider: 'Liz Proxy',
    family: 'Qwen 3',
    description: 'Qwen3 235B a22b via Liz Proxy',
    longDescription: 'Qwen3 235B is Alibaba\'s massive open-source flagship model, offering state-of-the-art performance in multilingual understanding, coding, and mathematics.',
    strengths: [
      'Massive scale for deep understanding',
      'Top-tier multilingual capabilities',
      'Excellent at complex math and coding',
      'Strong logical reasoning',
      'Large knowledge base'
    ],
    weaknesses: [
      'High usage weight',
      'Can be slower than smaller models'
    ],
    useCases: ['Multilingual applications', 'Complex coding tasks', 'Mathematical proofing', 'Deep research', 'Enterprise-grade reasoning'],
    technicalSpecs: {
      contextWindow: '128',
      architecture: 'Transformer-based (MoE)',
      releaseDate: '2025'
    }
  },
  'liz-llama-3.3-70b': {
    id: 'liz-llama-3.3-70b',
    name: 'Llama 3.3 70B (Liz)',
    provider: 'Liz Proxy',
    family: 'Llama 3.3',
    description: 'Meta Llama 3.3 70B via Liz Proxy',
    longDescription: 'Meta Llama 3.3 70B is a high-performance open-weights model that rivals GPT-4 class models in reasoning and instruction following while being highly efficient.',
    strengths: [
      'Excellent instruction following',
      'Balanced speed and capability',
      'Strong reasoning performance',
      'Reliable for structured output',
      'Great for general-purpose chat'
    ],
    weaknesses: [
      'Smaller knowledge base than 405B models',
      'Less creative than Claude for long-form writing'
    ],
    useCases: ['General purpose chat', 'Instruction following', 'Summarization', 'Structured data extraction', 'Customer support'],
    technicalSpecs: {
      contextWindow: '128',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  }
};

export const IMAGE_MODEL_DETAILS: Record<string, ModelDetails> = {
  'flux': {
    id: 'flux',
    name: 'Flux',
    provider: 'Pollinations',
    family: 'Flux',
    description: 'Flux Schnell - Fast high-quality image generation',
    longDescription: 'Flux Schnell is a state-of-the-art image generation model offering high quality results with fast generation times.',
    strengths: [
      'High quality images',
      'Fast generation speed',
      'Good prompt adherence',
      'Consistent results',
      'Open source'
    ],
    weaknesses: [
      'May struggle with very complex compositions',
      'Limited control over fine details',
      'Some bias in training data'
    ],
    useCases: ['Art generation', 'Marketing materials', 'Concept art', 'Prototyping', 'Social media content'],
    technicalSpecs: {
      architecture: 'Diffusion model',
      releaseDate: '2024'
    }
  },
  'kontext': {
    id: 'kontext',
    name: 'Kontext',
    provider: 'Pollinations',
    family: 'Flux',
    description: 'FLUX.1 Kontext - In-context editing & generation',
    longDescription: 'FLUX.1 Kontext specializes in in-context image editing and generation, allowing for precise modifications to existing images.',
    strengths: [
      'Excellent for image editing',
      'Preserves context well',
      'Good at understanding instructions',
      'High quality outputs',
      'Versatile editing capabilities'
    ],
    weaknesses: [
      'Requires clear instructions for best results',
      'May be slower than pure generation models',
      'Learning curve for optimal use'
    ],
    useCases: ['Image editing', 'Photo manipulation', 'Design iteration', 'Content modification'],
    technicalSpecs: {
      architecture: 'Diffusion model with context encoding',
      releaseDate: '2024'
    }
  },
  'gptimage': {
    id: 'gptimage',
    name: 'GPT Image',
    provider: 'Pollinations',
    family: 'DALL-E',
    description: "GPT Image 1 Mini - OpenAI's image generation model",
    longDescription: 'GPT Image is OpenAI\'s image generation model, offering high-quality, creative image synthesis from text prompts.',
    strengths: [
      'Creative and imaginative outputs',
      'Good understanding of complex prompts',
      'Safety features built-in',
      'Consistent quality',
      'Good at text rendering in images'
    ],
    weaknesses: [
      'Can be expensive',
      'May censor some prompts',
      'Limited control over specific details'
    ],
    useCases: ['Creative art', 'Marketing visuals', 'Concept design', 'Educational materials'],
    technicalSpecs: {
      architecture: 'DALL-E based',
      releaseDate: '2024'
    }
  },
  'stable-horde-flux-schnell': {
    id: 'stable-horde-flux-schnell',
    name: 'Flux.1-Schnell fp8',
    provider: 'Stable Horde',
    family: 'Flux',
    description: 'Flux.1-Schnell fp8 (Compact) - Fast high-quality generation',
    longDescription: 'Community-powered Flux Schnell model running on the Stable Horde distributed network, offering free access to high-quality image generation.',
    strengths: [
      'Free to use',
      'Community-powered',
      'No API key required',
      'Good quality outputs',
      'Distributed processing'
    ],
    weaknesses: [
      'Variable queue times',
      'Dependent on community resources',
      'May have slower generation during peak times'
    ],
    useCases: ['Free image generation', 'Experimentation', 'Hobbyist projects', 'Learning'],
    technicalSpecs: {
      architecture: 'Diffusion model (fp8 optimized)',
      releaseDate: '2024'
    }
  },
  'stable-horde-sdxl': {
    id: 'stable-horde-sdxl',
    name: 'SDXL 1.0',
    provider: 'Stable Horde',
    family: 'Stable Diffusion',
    description: 'Stable Diffusion XL 1.0 - High quality image generation',
    longDescription: 'Stable Diffusion XL is a powerful open-source image generation model with improved quality and detail over previous SD versions.',
    strengths: [
      'High quality outputs',
      'Open source',
      'Large community',
      'Many fine-tuned variants',
      'Free via Stable Horde'
    ],
    weaknesses: [
      'Requires good prompt engineering',
      'Can be slow on community resources',
      'May need negative prompts for best results'
    ],
    useCases: ['Art creation', 'Concept art', 'Photography-style images', 'Product visualization'],
    technicalSpecs: {
      architecture: 'Latent diffusion model',
      releaseDate: '2023'
    }
  }
};

export const VIDEO_MODEL_DETAILS: Record<string, ModelDetails> = {
  'veo': {
    id: 'veo',
    name: 'Veo',
    provider: 'Pollinations',
    family: 'Veo',
    description: "Veo 3.1 Fast - Google's video generation model (preview)",
    longDescription: 'Veo is Google\'s cutting-edge video generation model capable of creating high-quality, coherent videos from text descriptions.',
    strengths: [
      'High quality video output',
      'Good temporal coherence',
      'Understanding of physics and motion',
      'Creative video synthesis',
      'Fast generation for preview mode'
    ],
    weaknesses: [
      'Still in preview/experimental stage',
      'Limited video length',
      'May have artifacts in complex scenes',
      'Computationally expensive'
    ],
    useCases: ['Video prototyping', 'Animation concepts', 'Marketing videos', 'Educational content', 'Social media'],
    technicalSpecs: {
      architecture: 'Diffusion-based video model',
      releaseDate: '2024'
    }
  },
  'seedance': {
    id: 'seedance',
    name: 'Seedance',
    provider: 'Pollinations',
    family: 'Seedance',
    description: 'Seedance Lite - BytePlus video generation (better quality)',
    longDescription: 'Seedance is BytePlus\'s video generation model offering high-quality video synthesis with good motion dynamics.',
    strengths: [
      'Good video quality',
      'Smooth motion',
      'Affordable',
      'Good prompt adherence',
      'Reliable performance'
    ],
    weaknesses: [
      'Limited duration',
      'May struggle with very complex scenes',
      'Newer in the market'
    ],
    useCases: ['Short-form content', 'Animation', 'Video ads', 'Concept videos'],
    technicalSpecs: {
      architecture: 'Video diffusion model',
      releaseDate: '2024'
    }
  },
  'seedance-pro': {
    id: 'seedance-pro',
    name: 'Seedance Pro',
    provider: 'Pollinations',
    family: 'Seedance',
    description: 'Seedance Pro-Fast - BytePlus video generation (better prompt adherence)',
    longDescription: 'Seedance Pro is the advanced version with improved prompt understanding and generation quality for professional video needs.',
    strengths: [
      'Excellent prompt adherence',
      'Professional quality',
      'Fast generation',
      'Good for complex scenes',
      'Consistent results'
    ],
    weaknesses: [
      'Higher cost than Lite version',
      'Still has duration limits',
      'Resource intensive'
    ],
    useCases: ['Professional video content', 'Marketing campaigns', 'High-quality animations', 'Commercial projects'],
    technicalSpecs: {
      architecture: 'Advanced video diffusion model',
      releaseDate: '2024'
    }
  }
};

// Default details for models without specific information
export function getModelDetails(modelId: string, modelType: 'chat' | 'image' | 'video'): ModelDetails | null {
  const detailsMap = modelType === 'chat' ? CHAT_MODEL_DETAILS : 
                     modelType === 'image' ? IMAGE_MODEL_DETAILS : 
                     VIDEO_MODEL_DETAILS;
  
  return detailsMap[modelId] || null;
}
