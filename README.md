# ☁️ Vetra - Unified AI API Gateway

A unified API gateway for Pollinations-powered chat, image, and video generation through a single, consistent OpenAI-compatible interface.

## ✨ Features

- **🔗 Unified API** - Single API for chat, image, and video generation
- **⚡ Edge Runtime** - Fast responses with Vercel Edge Functions
- **🔐 Authentication** - Secure user accounts with Clerk
- **🔑 API Keys** - Generate and manage API keys from the dashboard
- **🌐 Pollinations-Native** - Pollinations chat, image, and video in one API
- **📱 Responsive** - Works on desktop and mobile devices
- **🎨 Dark Mode** - Automatic dark mode support

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/CloudCompile/cloudgptapi.git
cd cloudgptapi

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📡 API Endpoints

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

For full redeploy instructions from scratch, see [VETRA_VERCEL_SETUP.md](./VETRA_VERCEL_SETUP.md).

### Quick Reference

### Chat Completions

Generate chat completions using various LLMs.

```bash
POST /v1/chat/completions
```

**Headers:**
```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
x-user-id: unique-user-123 (optional)
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
  "model": "openai",
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
POST /v1/images/generations
```

**Request:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "model": "flux"
}
```

**Response:** Returns JSON with image URL. Use `POST /api/image` for raw binary.

### Video Generation

Generate videos from text prompts.

```bash
POST /v1/video/generations
```

**Request:**
```json
{
  "prompt": "A cat playing with a ball",
  "model": "veo",
  "duration": 4
}
```

**Response:** Returns JSON with video URL. Use `POST /api/video` for raw binary.

### Model Listings

Get available models for all modalities:

```bash
GET /v1/models
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
curl -X POST https://vetraai.vercel.app/v1/chat/completions \
  -H "Authorization: Bearer cgpt_xxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "openai", "messages": [{"role": "user", "content": "Hello!"}]}'
```

## 📋 Available Models

### Chat Models

| Model ID | Name | Description |
|----------|------|-------------|
| `openai` | OpenAI GPT-5 Mini | Fast general-purpose chat |
| `openai-fast` | OpenAI GPT-5 Nano | Lowest-latency option |
| `openai-large` | OpenAI GPT-5.2 | Highest capability |
| `deepseek` | DeepSeek V3.2 | Strong reasoning and coding |
| `kimi-k2-thinking` | Moonshot Kimi K2 Thinking | Chain-of-thought optimized |
| `perplexity-fast` | Perplexity Sonar | Fast web-style responses |
| `perplexity-reasoning` | Perplexity Sonar Reasoning | Deeper reasoning responses |
| `mistral` | Mistral Small 3.2 24B | Efficient all-around model |
| `qwen-coder` | Qwen3 Coder 30B | Coding-focused model |

### Image Models

| Model ID | Name | Description |
|----------|------|-------------|
| `flux` | Flux | High-quality generation |
| `turbo` | Turbo | Fast generation |
| `gptimage` | GPT Image | OpenAI DALL-E |
| `kontext` | Kontext | Context-aware |
| `seedream` | Seedream | Creative styles |

### Video Models

| Model ID | Name | Max Duration |
|----------|------|--------------|
| `veo` | Google Veo | 8 seconds |
| `seedance` | Seedance | 10 seconds |
| `seedance-pro` | Seedance Pro | 10 seconds |

## 🛠️ Configuration

See [KEYS_SETUP.md](./KEYS_SETUP.md) for detailed instructions on setting up:
- Clerk authentication
- Pollinations API key
- Other environment variables

## 📁 Project Structure

```
vetra/
├── app/
│   ├── api/
│   │   ├── image/route.ts     # Image generation endpoint
│   │   ├── video/route.ts     # Video generation endpoint
│   │   ├── keys/route.ts      # API key management
│   │   ├── mem/route.ts       # Memory API endpoint
│   │   └── models/
│   │       ├── image/route.ts # List image models
│   │       └── video/route.ts # List video models
│   ├── v1/
│   │   ├── chat/
│   │   │   └── completions/route.ts # Chat completions endpoint
│   │   └── models/route.ts    # List chat models
│   ├── dashboard/
│   │   └── page.tsx           # Dashboard page
│   ├── layout.tsx             # Root layout with Clerk
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── lib/
│   ├── api-keys.ts            # API key utilities
│   └── providers.ts           # AI provider configs
├── docs/                      # Frontend for GitHub Pages
├── middleware.ts              # Auth middleware
├── KEYS_SETUP.md              # Keys setup guide
└── README.md                  # This file
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

## 🔒 Rate Limits

| User Type | Chat | Image | Video |
|-----------|------|-------|-------|
| Anonymous | 10/min | 5/min | 2/min |
| Authenticated | 60/min | 30/min | 10/min |

Rate limit headers are included in responses:
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset timestamp

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Pollinations AI](https://pollinations.ai) - AI generation API
- [Clerk](https://clerk.com) - Authentication
- [Vercel](https://vercel.com) - Hosting platform
- [Next.js](https://nextjs.org) - React framework
