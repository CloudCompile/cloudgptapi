# 🤖 Comprehensive AI Models Guide

This document provides detailed information about all AI models available through CloudGPT API, including their descriptions, costs, performance characteristics, creators, strengths, and weaknesses.

## Table of Contents

- [Chat Models](#chat-models)
- [Image Generation Models](#image-generation-models)
- [Video Generation Models](#video-generation-models)
- [Model Selection Guide](#model-selection-guide)

---

## Chat Models

### OpenAI Models

#### **GPT-4o** (`openai`)
- **Creator**: OpenAI
- **Context Window**: 128,000 tokens
- **Pricing**: 
  - Input: ~$2.50/1M tokens
  - Output: ~$10/1M tokens
- **Response Time**: Medium (2-5 seconds)
- **Strengths**:
  - Excellent general-purpose reasoning
  - Strong code generation and debugging
  - Multimodal capabilities (text + vision)
  - Superior instruction following
  - High-quality creative writing
- **Weaknesses**:
  - Higher cost compared to alternatives
  - Slower than fast variants
  - No real-time search/internet access
- **Best For**: Complex reasoning, code generation, creative writing, general chat applications

#### **GPT-4o Mini** (`openai-fast`)
- **Creator**: OpenAI
- **Context Window**: 128,000 tokens
- **Pricing**: 
  - Input: ~$0.15/1M tokens
  - Output: ~$0.60/1M tokens
- **Response Time**: Fast (1-3 seconds)
- **Strengths**:
  - Very cost-effective
  - Fast response times
  - Good instruction following
  - Suitable for high-volume applications
- **Weaknesses**:
  - Less capable than GPT-4o for complex reasoning
  - May struggle with nuanced tasks
- **Best For**: High-volume applications, simple queries, chatbots, real-time applications

#### **GPT-4.5** (`openai-large`)
- **Creator**: OpenAI
- **Context Window**: 128,000 tokens
- **Pricing**: 
  - Input: ~$5/1M tokens
  - Output: ~$15/1M tokens
- **Response Time**: Slower (5-10 seconds)
- **Strengths**:
  - Highest reasoning capability in GPT lineup
  - Best for extremely complex tasks
  - Advanced problem-solving
- **Weaknesses**:
  - Most expensive OpenAI model
  - Slowest response times
  - Overkill for simple tasks
- **Best For**: Research, complex problem-solving, advanced coding tasks

### Anthropic Claude Models

#### **Claude 3.5 Sonnet** (`claude`)
- **Creator**: Anthropic
- **Context Window**: 200,000 tokens
- **Pricing**: 
  - Input: $3/1M tokens
  - Output: $15/1M tokens
- **Response Time**: Medium (2-4 seconds)
- **Strengths**:
  - Exceptional reasoning and analysis
  - Superior long-context understanding
  - Excellent coding abilities
  - Strong safety and ethical guidelines
  - High-quality technical writing
  - Great at following complex instructions
- **Weaknesses**:
  - Can be overly cautious/refuse benign requests
  - Slightly slower than GPT-4o Mini
- **Best For**: Code review, technical documentation, long-form analysis, ethical AI applications

#### **Claude 3 Haiku** (`claude-fast`)
- **Creator**: Anthropic
- **Context Window**: 200,000 tokens
- **Pricing**: 
  - Input: $0.25/1M tokens
  - Output: $1.25/1M tokens
- **Response Time**: Very Fast (<1 second)
- **Strengths**:
  - Fastest Claude model
  - Very cost-effective
  - Good for real-time applications
  - Maintains Claude's safety features
- **Weaknesses**:
  - Less capable for complex reasoning
  - Reduced creative abilities
- **Best For**: Real-time chat, simple queries, high-volume applications, customer support

#### **Claude 3.5 Opus** (`claude-large`)
- **Creator**: Anthropic
- **Context Window**: 200,000 tokens
- **Pricing**: 
  - Input: $15/1M tokens
  - Output: $75/1M tokens
- **Response Time**: Slow (5-8 seconds)
- **Strengths**:
  - Highest capability Claude model
  - Best-in-class for complex reasoning
  - Exceptional at creative tasks
  - Superior code generation
- **Weaknesses**:
  - Most expensive model available
  - Slowest response times
- **Best For**: Complex research, high-stakes decisions, advanced creative work

### Google Gemini Models

#### **Gemini 2.0 Flash** (`gemini`)
- **Creator**: Google DeepMind
- **Context Window**: 1,000,000 tokens
- **Pricing**: 
  - Input: $0.075/1M tokens
  - Output: $0.30/1M tokens
- **Response Time**: Fast (1-2 seconds)
- **Strengths**:
  - Extremely large context window (1M tokens)
  - Very cost-effective
  - Fast response times
  - Excellent multimodal capabilities
  - Good at following instructions
- **Weaknesses**:
  - May not match GPT-4o/Claude on complex reasoning
  - Less refined responses than flagship models
- **Best For**: Long documents, multimodal tasks, cost-sensitive applications

#### **Gemini 2.5 Pro** (`gemini-large`)
- **Creator**: Google DeepMind
- **Context Window**: 2,000,000 tokens
- **Pricing**: 
  - Input: $1.25/1M tokens (≤200K tokens)
  - Input: $2.50/1M tokens (>200K tokens)
  - Output: $10/1M tokens
- **Response Time**: Medium (3-5 seconds)
- **Strengths**:
  - Largest context window available (2M tokens)
  - Excellent reasoning capabilities
  - Strong multimodal understanding
  - Advanced code generation
  - Superior long-context performance
- **Weaknesses**:
  - Higher cost for long contexts
  - Slower than Flash variants
- **Best For**: Very long documents, research papers, complex multimodal tasks

#### **Gemini Fast** (`gemini-fast`)
- **Creator**: Google DeepMind
- **Context Window**: 1,000,000 tokens
- **Pricing**: 
  - Input: $0.04/1M tokens
  - Output: $0.15/1M tokens
- **Response Time**: Very Fast (<1 second)
- **Strengths**:
  - Extremely fast
  - Very low cost
  - Large context window
- **Weaknesses**:
  - Lower quality than other Gemini models
  - May miss nuances
- **Best For**: High-throughput applications, simple queries

#### **Gemini Search** (`gemini-search`)
- **Creator**: Google DeepMind
- **Context Window**: 1,000,000 tokens
- **Pricing**: Similar to Gemini 2.0 Flash + search overhead
- **Response Time**: Medium (3-6 seconds)
- **Strengths**:
  - Real-time Google Search integration
  - Up-to-date information
  - Fact-checking capabilities
  - Large context window
- **Weaknesses**:
  - Slower due to search latency
  - Higher cost due to search operations
- **Best For**: Current events, fact-checking, research requiring recent data

### DeepSeek Models

#### **DeepSeek V3** (`deepseek`)
- **Creator**: DeepSeek (Hangzhou)
- **Context Window**: 64,000 tokens
- **Pricing**: 
  - Input: $0.27/1M tokens
  - Output: $1.10/1M tokens
- **Response Time**: Fast (1-3 seconds)
- **Strengths**:
  - Excellent cost-performance ratio
  - Strong coding capabilities
  - Good mathematical reasoning
  - Open-source friendly
  - Fast inference
- **Weaknesses**:
  - Smaller context window
  - May lag behind GPT-4/Claude in complex reasoning
  - Less refined in creative writing
- **Best For**: Cost-effective coding, math problems, budget-conscious applications

### xAI Models

#### **Grok 3** (`grok`)
- **Creator**: xAI (Elon Musk)
- **Context Window**: 128,000 tokens
- **Pricing**: ~$2/1M tokens (input), ~$10/1M tokens (output)
- **Response Time**: Medium (2-4 seconds)
- **Strengths**:
  - Access to real-time X (Twitter) data
  - Witty, conversational style
  - Good general reasoning
  - Up-to-date on current events via X
- **Weaknesses**:
  - Can be less formal/professional
  - May include opinions/bias from X data
  - Newer model with less optimization
- **Best For**: Social media analysis, current events, conversational AI

### Mistral AI Models

#### **Mistral Large** (`mistral`)
- **Creator**: Mistral AI (France)
- **Context Window**: 128,000 tokens
- **Pricing**: 
  - Input: $2/1M tokens
  - Output: $6/1M tokens
- **Response Time**: Fast (1-3 seconds)
- **Strengths**:
  - Excellent multilingual capabilities (especially European languages)
  - Strong code generation
  - Good cost-performance ratio
  - Fast inference
  - Open-source heritage
- **Weaknesses**:
  - May trail GPT-4/Claude in complex reasoning
  - Smaller ecosystem than major providers
- **Best For**: Multilingual applications, European language tasks, cost-effective coding

### Alibaba Qwen Models

#### **Qwen 2.5 Coder** (`qwen-coder`)
- **Creator**: Alibaba Cloud
- **Context Window**: 32,000 tokens
- **Pricing**: 
  - Input: $0.20/1M tokens
  - Output: $0.60/1M tokens
- **Response Time**: Fast (1-2 seconds)
- **Strengths**:
  - Specialized for code generation
  - Excellent code completion
  - Strong debugging capabilities
  - Very cost-effective
  - Fast response times
  - Good multilingual code support
- **Weaknesses**:
  - Smaller context window
  - Less capable for non-coding tasks
  - May struggle with very complex architecture decisions
- **Best For**: Code generation, debugging, code completion, developer tools

### Perplexity Models

#### **Perplexity Fast** (`perplexity-fast`)
- **Creator**: Perplexity AI
- **Context Window**: 128,000 tokens
- **Pricing**: ~$0.50/1M tokens (input), ~$1.50/1M tokens (output)
- **Response Time**: Fast (1-3 seconds)
- **Strengths**:
  - Real-time web search integration
  - Fast responses with citations
  - Good for fact-checking
  - Cost-effective
- **Weaknesses**:
  - May sacrifice depth for speed
  - Limited creative capabilities
- **Best For**: Quick research, fact-checking, Q&A with sources

#### **Perplexity Reasoning** (`perplexity-reasoning`)
- **Creator**: Perplexity AI
- **Context Window**: 128,000 tokens
- **Pricing**: ~$1/1M tokens (input), ~$3/1M tokens (output)
- **Response Time**: Medium (3-5 seconds)
- **Strengths**:
  - Deep reasoning with web search
  - Comprehensive research capabilities
  - Excellent citation quality
  - Multi-step reasoning
- **Weaknesses**:
  - Slower than Fast variant
  - Higher cost
- **Best For**: In-depth research, academic queries, complex analysis with sources

### Moonshot AI Models

#### **Kimi K2 Thinking** (`kimi-k2-thinking`)
- **Creator**: Moonshot AI (China)
- **Context Window**: 128,000 tokens
- **Pricing**: ~$1/1M tokens (input), ~$3/1M tokens (output)
- **Response Time**: Medium (3-5 seconds)
- **Strengths**:
  - Advanced reasoning capabilities
  - Good for complex problem-solving
  - Strong Chinese language support
  - Thinking/reasoning traces
- **Weaknesses**:
  - May be slower than alternatives
  - Less known internationally
- **Best For**: Complex reasoning tasks, Chinese language applications, step-by-step problem solving

### Amazon Nova Models

#### **Nova Micro** (`nova-micro`)
- **Creator**: Amazon Web Services
- **Context Window**: 128,000 tokens
- **Pricing**: 
  - Input: $0.035/1M tokens
  - Output: $0.14/1M tokens
- **Response Time**: Very Fast (<1 second)
- **Strengths**:
  - Extremely cost-effective
  - Very fast response times
  - Good for simple tasks
  - AWS integration
- **Weaknesses**:
  - Limited capabilities for complex tasks
  - Newer model with less track record
- **Best For**: Simple queries, high-volume applications, AWS ecosystem

### Specialized Models

#### **ChickyTutor** (`chickytutor`)
- **Creator**: Pollinations AI
- **Context Window**: 128,000 tokens
- **Pricing**: Free tier available
- **Response Time**: Fast (1-3 seconds)
- **Strengths**:
  - Specialized for educational content
  - Explains concepts clearly
  - Good for tutoring and learning
  - Patient and encouraging tone
- **Weaknesses**:
  - Limited to educational contexts
  - May oversimplify complex topics
- **Best For**: Educational applications, tutoring, learning platforms

#### **Midijourney** (`midijourney`)
- **Creator**: Pollinations AI
- **Context Window**: 128,000 tokens
- **Pricing**: Free tier available
- **Response Time**: Fast (1-3 seconds)
- **Strengths**:
  - Creative and artistic responses
  - Good for brainstorming
  - Imaginative problem-solving
- **Weaknesses**:
  - May lack precision for technical tasks
  - Less suitable for formal applications
- **Best For**: Creative writing, brainstorming, artistic projects

---

## Image Generation Models

### **Flux** (`flux`)
- **Creator**: Black Forest Labs
- **Technology**: Flux Schnell
- **Pricing**: ~$0.003 per image
- **Generation Time**: 3-8 seconds
- **Strengths**:
  - Fast high-quality generation
  - Excellent prompt adherence
  - Good detail and composition
  - Consistent results
  - Great for realistic images
- **Weaknesses**:
  - May struggle with very complex prompts
  - Limited style variations
- **Best For**: General-purpose image generation, realistic images, product mockups

### **Turbo** (`turbo`)
- **Creator**: Stability AI
- **Technology**: SDXL Turbo
- **Pricing**: ~$0.001 per image
- **Generation Time**: 1-3 seconds
- **Strengths**:
  - Extremely fast generation
  - Single-step inference
  - Real-time generation capable
  - Very cost-effective
- **Weaknesses**:
  - Lower quality than multi-step models
  - Less detail
  - May produce artifacts
- **Best For**: Real-time applications, rapid prototyping, high-volume generation

### **Kontext** (`kontext`)
- **Creator**: Black Forest Labs
- **Technology**: FLUX.1 Kontext
- **Pricing**: ~$0.005 per image
- **Generation Time**: 5-10 seconds
- **Strengths**:
  - In-context editing and generation
  - Can modify existing images
  - Excellent for iterative design
  - Maintains style consistency
- **Weaknesses**:
  - Slower than other models
  - Higher cost
- **Best For**: Image editing, iterative design, style-consistent generations

### **Nanobanana** (`nanobanana`)
- **Creator**: Google DeepMind
- **Technology**: Gemini 2.5 Flash Image
- **Pricing**: ~$0.002 per image
- **Generation Time**: 4-8 seconds
- **Strengths**:
  - Good quality-to-speed ratio
  - Excellent prompt understanding (LLM-powered)
  - Natural language processing
  - Multimodal capabilities
- **Weaknesses**:
  - May be less artistic than specialized models
  - Newer technology
- **Best For**: Natural language prompts, integrated multimodal workflows

### **Nanobanana Pro** (`nanobanana-pro`)
- **Creator**: Google DeepMind
- **Technology**: Gemini 3 Pro Image
- **Pricing**: ~$0.010 per image
- **Generation Time**: 8-15 seconds
- **Strengths**:
  - 4K resolution support
  - Advanced reasoning for prompts
  - Thinking/planning capabilities
  - High-quality outputs
  - Superior prompt understanding
- **Weaknesses**:
  - Slower generation
  - Higher cost
- **Best For**: High-resolution images, complex prompts, professional work

### **Seedream** (`seedream`)
- **Creator**: ByteDance
- **Technology**: ByteDance ARK
- **Pricing**: ~$0.004 per image
- **Generation Time**: 5-10 seconds
- **Strengths**:
  - Better quality than standard models
  - Good detail and composition
  - Consistent style
  - Chinese market optimizations
- **Weaknesses**:
  - Moderate speed
  - Less known internationally
- **Best For**: High-quality generation, Asian aesthetic preferences

### **Seedream Pro** (`seedream-pro`)
- **Creator**: ByteDance
- **Technology**: ByteDance ARK (Advanced)
- **Pricing**: ~$0.012 per image
- **Generation Time**: 10-20 seconds
- **Strengths**:
  - 4K resolution support
  - Multi-image generation
  - Highest quality in Seedream lineup
  - Excellent for professional use
- **Weaknesses**:
  - Slowest generation times
  - Highest cost
- **Best For**: Professional graphics, high-resolution needs, multi-image sets

### **GPT Image** (`gptimage`)
- **Creator**: OpenAI
- **Technology**: GPT Image 1 Mini (DALL-E based)
- **Pricing**: ~$0.040 per image
- **Generation Time**: 8-15 seconds
- **Strengths**:
  - Excellent prompt understanding
  - Creative interpretations
  - Good with complex concepts
  - OpenAI quality and safety
- **Weaknesses**:
  - Higher cost
  - Slower generation
  - Content policy restrictions
- **Best For**: Creative projects, conceptual art, brand-safe content

### **GPT Image Large** (`gptimage-large`)
- **Creator**: OpenAI
- **Technology**: GPT Image 1.5
- **Pricing**: ~$0.080 per image
- **Generation Time**: 15-30 seconds
- **Strengths**:
  - Highest quality OpenAI image generation
  - Advanced prompt interpretation
  - Best-in-class for complex scenes
  - Superior detail and composition
- **Weaknesses**:
  - Most expensive option
  - Slowest generation
  - Strict content policies
- **Best For**: Professional work, complex compositions, high-stakes projects

### **Z-Image** (`zimage`)
- **Creator**: Community/Open Source
- **Technology**: 6B Flux with 2x upscaling
- **Pricing**: ~$0.002 per image
- **Generation Time**: 4-8 seconds
- **Strengths**:
  - Built-in 2x upscaling
  - Good quality-to-cost ratio
  - Fast generation
  - Higher effective resolution
- **Weaknesses**:
  - Upscaling may introduce artifacts
  - Less control over final resolution
- **Best For**: Web graphics, social media, cost-effective high-resolution needs

---

## Video Generation Models

### **Veo** (`veo`)
- **Creator**: Google DeepMind
- **Technology**: Veo 3.1 Fast
- **Max Duration**: 8 seconds
- **Pricing**: ~$0.10-0.30 per video
- **Generation Time**: 30-90 seconds
- **Strengths**:
  - High-quality video generation
  - Good motion consistency
  - Excellent prompt understanding
  - Realistic physics
  - Preview/experimental access to cutting-edge tech
- **Weaknesses**:
  - Limited to 8 seconds
  - Slower generation
  - Preview quality (may have inconsistencies)
  - Higher cost
- **Best For**: Short video clips, product demos, social media content

### **Seedance** (`seedance`)
- **Creator**: BytePlus/ByteDance
- **Technology**: Seedance Lite
- **Max Duration**: 10 seconds
- **Pricing**: ~$0.08-0.20 per video
- **Generation Time**: 40-120 seconds
- **Strengths**:
  - Better quality than baseline models
  - Good motion dynamics
  - 10-second duration
  - Smooth transitions
  - Cost-effective for quality
- **Weaknesses**:
  - Moderate generation time
  - May struggle with complex scenes
- **Best For**: Marketing videos, short animations, social media

### **Seedance Pro** (`seedance-pro`)
- **Creator**: BytePlus/ByteDance
- **Technology**: Seedance Pro-Fast
- **Max Duration**: 10 seconds
- **Pricing**: ~$0.15-0.40 per video
- **Generation Time**: 60-180 seconds
- **Strengths**:
  - Better prompt adherence than Lite
  - Higher quality output
  - Professional-grade results
  - 10-second duration
  - Superior motion consistency
- **Weaknesses**:
  - Slower generation
  - Higher cost
  - Longer wait times
- **Best For**: Professional video content, advertising, high-quality shorts

---

## Model Selection Guide

### By Use Case

**General Chat & Assistance**
- Budget: Nova Micro, Gemini Fast
- Balanced: GPT-4o Mini, Claude 3 Haiku
- Premium: GPT-4o, Claude 3.5 Sonnet

**Code Generation & Debugging**
- Budget: Qwen 2.5 Coder, DeepSeek V3
- Balanced: GPT-4o, Mistral Large
- Premium: Claude 3.5 Opus, GPT-4.5

**Long Documents & Research**
- Gemini 2.0 Flash (1M tokens)
- Gemini 2.5 Pro (2M tokens)
- Claude 3.5 Sonnet (200K tokens)

**Real-time & Search**
- Perplexity Fast (quick research)
- Gemini Search (Google Search integration)
- Grok 3 (X/Twitter integration)

**Creative Writing**
- Claude 3.5 Opus
- GPT-4o
- Midijourney (creative projects)

**Educational Content**
- ChickyTutor (specialized)
- GPT-4o Mini
- Claude 3 Haiku

**Multilingual Applications**
- Mistral Large (European languages)
- Gemini 2.5 Pro (broad language support)
- Kimi K2 (Chinese)

### Image Generation by Need

**Fast Prototyping**: Turbo, Z-Image
**Balanced Quality/Speed**: Flux, Nanobanana
**High Quality**: Seedream Pro, GPT Image Large, Nanobanana Pro
**Iterative Editing**: Kontext
**Professional Work**: GPT Image Large, Seedream Pro, Nanobanana Pro

### Video Generation by Need

**Quick Social Content**: Seedance
**Balanced**: Veo
**Professional**: Seedance Pro

### By Budget (Chat Models)

**Free Tier**: Various Routeway and OpenRouter models (free tier available)
**Low Cost (<$0.50/1M tokens)**: Nova Micro, Gemini Fast, Qwen Coder
**Mid-Range ($0.50-3/1M tokens)**: DeepSeek V3, Gemini 2.0 Flash, GPT-4o Mini
**Premium ($3-15/1M tokens)**: GPT-4o, Claude 3.5 Sonnet, Gemini 2.5 Pro
**Ultra Premium (>$15/1M tokens)**: Claude 3.5 Opus

### By Response Time

**Ultra-Fast (<1s)**: Nova Micro, Gemini Fast, Claude 3 Haiku
**Fast (1-3s)**: GPT-4o Mini, DeepSeek V3, Mistral Large, Qwen Coder
**Medium (2-5s)**: GPT-4o, Claude 3.5 Sonnet, Gemini 2.5 Pro
**Slow (5-10s)**: GPT-4.5, Claude 3.5 Opus, Perplexity Reasoning

---

## Notes on Pricing

- All pricing is approximate and may vary based on provider, region, and usage volume
- Prices are generally lower for higher volume usage
- Some models offer batch processing discounts
- Prompt caching can significantly reduce costs for repeated queries
- Free tier models may have rate limits or quality trade-offs

## Notes on Performance

- Response times are approximate and depend on:
  - Server load
  - Prompt complexity
  - Response length
  - Network latency
- Benchmark scores vary by task type
- Real-world performance may differ from benchmarks

## Updates

This document reflects model information as of January 2026. AI models are rapidly evolving:
- New models are released frequently
- Existing models receive updates and improvements
- Pricing and capabilities may change
- Check provider documentation for the most current information

---

**For API usage and integration details, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

**For setup instructions, see [KEYS_SETUP.md](./KEYS_SETUP.md)**
