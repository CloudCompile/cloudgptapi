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
      contextWindow: '128K tokens',
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
      'Less capable than full GPT-4o on complex tasks',
      'May struggle with very nuanced queries',
      'Smaller context window'
    ],
    useCases: ['Quick queries', 'Simple coding tasks', 'General conversation', 'Content summarization'],
    technicalSpecs: {
      contextWindow: '128K tokens',
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
      contextWindow: '200K tokens',
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
      contextWindow: '1M tokens',
      architecture: 'Transformer-based',
      releaseDate: '2024'
    }
  },
  'deepseek': {
    id: 'deepseek',
    name: 'DeepSeek V3.2',
    provider: 'Pollinations',
    family: 'DeepSeek',
    description: 'DeepSeek V3.2 model',
    longDescription: 'DeepSeek V3.2 is a powerful open-source language model with strong performance on coding and reasoning tasks.',
    strengths: [
      'Excellent coding capabilities',
      'Strong mathematical reasoning',
      'Open source',
      'Cost-effective',
      'Good multilingual support'
    ],
    weaknesses: [
      'Less known than major providers',
      'May lack some creative writing finesse',
      'Smaller community support'
    ],
    useCases: ['Code generation', 'Mathematical problem solving', 'Technical documentation', 'Algorithm design'],
    technicalSpecs: {
      contextWindow: '64K tokens',
      architecture: 'Transformer-based',
      releaseDate: '2024'
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
      contextWindow: '32K tokens',
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
      contextWindow: '32K tokens',
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
