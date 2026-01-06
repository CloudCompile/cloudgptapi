# ☁️ CloudGPT - Unified AI API Gateway

A powerful, unified API gateway for AI chat, image, and video generation. Access 100+ AI models from multiple providers through a single, consistent OpenAI-compatible API interface.

## ✨ Features

- **🔗 Unified API** - Single API for chat, image, and video generation
- **🤖 100+ AI Models** - Access models from Pollinations, OpenRouter, Routeway, Stable Horde, AppyPie, and Meridian
- **⚡ Edge Runtime** - Fast responses with Vercel Edge Functions
- **🔐 Authentication** - Secure user accounts with Clerk (optional)
- **🔑 API Keys** - Generate and manage API keys from the dashboard
- **🎮 Interactive Playground** - Test models directly in your browser
- **📊 Model Monitor** - Real-time status dashboard for all models
- **🌐 CORS Enabled** - Ready for cross-origin requests
- **📱 Responsive** - Works on desktop and mobile devices
- **🎨 Dark Mode** - Automatic dark mode support
- **🔒 Rate Limiting** - Built-in rate limiting for anonymous and authenticated users

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/CloudCompile/cloudgptapi.git
cd cloudgptapi

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env.local
# Edit .env.local with your API keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

> **Note:** The application works without any environment variables configured. Provider API keys are optional and enable additional features like higher rate limits and specific provider access.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CloudCompile/cloudgptapi)

1. Click the "Deploy" button above
2. Configure environment variables (optional):
   - Add Clerk keys for authentication
   - Add provider API keys for enhanced access
3. Deploy and enjoy!

The application is optimized for Vercel's Edge Runtime for maximum performance.

## 📡 API Endpoints

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick Reference

### Chat Completions

Generate chat completions using various LLMs.

```bash
POST /api/chat
```

**Request:**
```json
{
  "model": "openai",
  "messages": [
    {"role": "user", "content": "Hello, how are you?"}
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking."
      },
      "finish_reason": "stop"
    }
  ]
}
```

### Image Generation

Generate images from text prompts.

```bash
POST /api/image
```

**Request:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "model": "flux",
  "width": 1024,
  "height": 1024
}
```

**Response:** Returns the generated image (PNG/JPEG)

### Video Generation

Generate videos from text prompts.

```bash
POST /api/video
```

**Request:**
```json
{
  "prompt": "A cat playing with a ball",
  "model": "veo",
  "duration": 4
}
```

**Response:** Returns the generated video (MP4)

### Model Listings

Get available models for each modality:

```bash
GET /api/models/chat   # List chat models
GET /api/models/image  # List image models
GET /api/models/video  # List video models
```

## 🔑 Authentication

### User Authentication

The dashboard and API key management require user authentication via Clerk. Sign in to access:
- API key creation and management
- Usage statistics (coming soon)
- Account settings

### API Authentication

Use your API key in the Authorization header:

```bash
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Authorization: Bearer cgpt_xxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "openai", "messages": [{"role": "user", "content": "Hello!"}]}'
```

## 📋 Available Models

### Chat Models (60+)

CloudGPT provides access to 60+ chat models across multiple providers:

**Pollinations AI** - Premium models including:
- OpenAI GPT-4o, GPT-4o Mini, GPT-4.5
- Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3.5 Opus
- Gemini 2.0 Flash, Gemini 2.5 Pro
- DeepSeek V3, Grok 3, Mistral Large
- Qwen 2.5 Coder, Perplexity, and more

**OpenRouter** - 30+ free models including:
- Meta Llama 3.1 405B, Llama 3.3 70B
- Google Gemini 2.0 Flash, Gemma 3 series
- DeepSeek R1 and variants
- NVIDIA Nemotron series
- Mistral AI models

**Routeway** - 20+ free models including:
- DeepSeek V3.1, R1 variants
- MiniMax M2, GLM 4.6
- Longcat Flash Chat
- Kimi K2 models

**Stable Horde** - Text generation models:
- Nemotron Nano 9B V2
- Llama 3.2 3B Instruct
- Mistral 7B Instruct
- Qwen 3 4B, NeonMaid-12B

**Meridian** - Cognitive substrate with persistent memory

### Image Models (30+)

**Pollinations AI**:
- Flux Schnell - Fast high-quality generation
- SDXL Turbo - Real-time generation
- Seedream 4.0/4.5 Pro - ByteDance ARK
- GPT Image 1/1.5 - OpenAI DALL-E
- NanoBanana/Pro - Gemini-powered
- Kontext - In-context editing
- Z-Image Turbo - 6B Flux with upscaling

**AppyPie**:
- SDXL - High-resolution realistic images
- Stable Diffusion 1.5 Inpainting
- Flux-1 Schnell

**Stable Horde** (10+ models):
- Flux.1-Schnell fp8, SDXL 1.0
- Deliberate, Dreamshaper
- Realistic Vision, AbsoluteReality
- Juggernaut XL, Pony Diffusion XL
- Anything v5, and more

### Video Models

**Pollinations AI**:
- Veo 3.1 Fast - Google's video generation
- Seedance Lite - BytePlus video generation
- Seedance Pro-Fast - Better prompt adherence

> **Tip:** Use `GET /api/models/chat`, `/api/models/image`, or `/api/models/video` to get the complete list of available models with their IDs and descriptions.

## 🛠️ Configuration

### Environment Variables

Create a `.env.local` file with the following optional variables:

```env
# Clerk Authentication (optional - for API key management)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Provider API Keys (optional - for authenticated access)
POLLINATIONS_API_KEY=your_pollinations_key
ROUTEWAY_API_KEY=your_routeway_key
OPENROUTER_API_KEY=your_openrouter_key
STABLEHORDE_API_KEY=0000000000  # Use '0000000000' for anonymous access
APPYPIE_API_KEY=your_appypie_key
MERIDIAN_API_KEY=your_meridian_key

# Application Settings
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

> **Note:** All provider API keys are optional. The application works without any configuration. See [KEYS_SETUP.md](./KEYS_SETUP.md) for detailed setup instructions.

### Rate Limits

| User Type | Chat | Image | Video |
|-----------|------|-------|-------|
| Anonymous | 10/min | 5/min | 2/min |
| Authenticated (with API key) | 60/min | 30/min | 10/min |

Rate limit headers are included in all responses:
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the limit resets

## 📁 Project Structure

```
cloudgptapi/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Chat completions endpoint
│   │   ├── image/route.ts         # Image generation endpoint
│   │   ├── video/route.ts         # Video generation endpoint
│   │   ├── keys/route.ts          # API key management
│   │   └── models/
│   │       ├── chat/route.ts      # List chat models
│   │       ├── image/route.ts     # List image models
│   │       └── video/route.ts     # List video models
│   ├── dashboard/page.tsx         # API key management dashboard
│   ├── playground/page.tsx        # Interactive model testing
│   ├── models/page.tsx            # Model status monitor
│   ├── layout.tsx                 # Root layout with Clerk
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── lib/
│   ├── api-keys.ts                # API key utilities & rate limiting
│   └── providers.ts               # AI provider configs & model definitions
├── docs/                          # Static docs for GitHub Pages
├── middleware.ts                  # Clerk middleware
├── KEYS_SETUP.md                  # Environment setup guide
├── API_DOCUMENTATION.md           # Complete API reference
└── README.md                      # This file
```

## 🌐 GitHub Pages Frontend

The `/docs` folder contains a static frontend that can be deployed to GitHub Pages. It provides:
- API documentation
- Interactive examples
- Getting started guide

To enable GitHub Pages:
1. Go to your repository Settings
2. Navigate to Pages
3. Set Source to "Deploy from a branch"
4. Select the `main` branch and `/docs` folder

## 🔧 Recent Improvements

### Bug Fixes & Security
- ✅ Added comprehensive input validation (JSON parsing, type checking, range validation)
- ✅ Fixed potential memory leaks in playground (URL.createObjectURL cleanup)
- ✅ Improved error handling across all API routes
- ✅ Added CORS headers for cross-origin requests
- ✅ Enhanced rate limiting implementation
- ✅ Better error messages with detailed feedback
- ✅ Input sanitization for prompts and messages

### API Enhancements
- ✅ Validation for message structure (role and content required)
- ✅ Image dimension validation (1-4096 range)
- ✅ Video duration validation (positive numbers)
- ✅ Safe parseInt operations to prevent NaN values
- ✅ Non-empty string validation for prompts
- ✅ Enhanced error responses with details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔒 Security

This project implements several security best practices:

- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Secure cross-origin resource sharing
- **Type Safety**: TypeScript for compile-time type checking
- **Error Handling**: Comprehensive error handling without exposing sensitive information
- **No Hardcoded Secrets**: All sensitive data via environment variables

If you discover a security vulnerability, please email the maintainers directly instead of using the issue tracker.

## ⚠️ Important Notes

### In-Memory Storage Limitation

The current implementation uses **in-memory storage** for:
- API keys
- Rate limiting data

This is suitable for development and testing but has limitations:
- Data is lost on serverless function cold starts
- Not shared across multiple instances
- Does not persist across deployments

**For production use**, replace with:
- **Vercel KV** or **Redis** for rate limiting
- **PostgreSQL**, **MongoDB**, or **Supabase** for API key storage

See `lib/api-keys.ts` for implementation details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Pollinations AI](https://pollinations.ai) - Primary AI generation API provider
- [OpenRouter](https://openrouter.ai) - Multi-model AI API aggregator  
- [Routeway](https://routeway.ai) - Free AI model access
- [Stable Horde](https://stablehorde.net) - Distributed AI generation network
- [AppyPie](https://appypie.com) - Image generation services
- [Meridian Labs](https://meridianlabs.website) - Cognitive substrate API
- [Clerk](https://clerk.com) - Authentication and user management
- [Vercel](https://vercel.com) - Hosting platform and Edge Functions
- [Next.js](https://nextjs.org) - React framework for production

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Setup Guide](./KEYS_SETUP.md) - Detailed environment configuration
- [Stable Horde Guide](./docs/STABLEHORDE.md) - Using Stable Horde models
- [Live Demo](https://cloudgptapi.vercel.app) - Try it out online
- [Model Monitor](https://cloudgptapi.vercel.app/models) - Check model status
- [Interactive Playground](https://cloudgptapi.vercel.app/playground) - Test models in browser

---

Made with ❤️ by the CloudCompile team. Star ⭐ this repo if you find it helpful!
