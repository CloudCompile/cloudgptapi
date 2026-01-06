# CloudGPT API Documentation

Complete API reference for CloudGPT - Unified AI API Gateway

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Rate Limits](#rate-limits)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Chat Completions](#chat-completions)
  - [Image Generation](#image-generation)
  - [Video Generation](#video-generation)
  - [List Models](#list-models)
  - [API Key Management](#api-key-management)
- [Provider Support](#provider-support)

**📖 For detailed information about all models, including costs, response times, creators, strengths, and weaknesses, see [MODELS.md](./MODELS.md)**

## Authentication

All API requests require authentication using an API key in the Authorization header:

```http
Authorization: Bearer cgpt_your_api_key_here
```

Get your API key from the [Dashboard](https://your-app.vercel.app/dashboard) after signing up.

## Base URL

```
https://your-app.vercel.app
```

Replace `your-app.vercel.app` with your actual deployment URL.

## Rate Limits

| User Type | Chat | Image | Video |
|-----------|------|-------|-------|
| Anonymous | 10/min | 5/min | 2/min |
| Authenticated | 60/min | 30/min | 10/min |

Rate limit information is included in response headers:
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "message": "Error description",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request - Invalid parameters
- `401` - Unauthorized - Invalid or missing API key
- `429` - Too Many Requests - Rate limit exceeded
- `500` - Internal Server Error

## Endpoints

### Chat Completions

Generate text completions using various LLMs.

**Endpoint:** `POST /api/chat`

**Request Body:**

```json
{
  "model": "openai",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": false
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model ID (see [Chat Models](#chat-models)) |
| `messages` | array | Yes | Array of message objects with `role` and `content` |
| `temperature` | number | No | Sampling temperature (0-2). Default: 0.7 |
| `max_tokens` | integer | No | Maximum tokens to generate |
| `stream` | boolean | No | Enable streaming responses. Default: false |

**Response:**

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking. How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 18,
    "total_tokens": 38
  }
}
```

**Example:**

```bash
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Authorization: Bearer cgpt_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai",
    "messages": [
      {"role": "user", "content": "Write a haiku about AI"}
    ]
  }'
```

### Image Generation

Generate images from text prompts.

**Endpoint:** `POST /api/image`

**Request Body:**

```json
{
  "prompt": "A beautiful sunset over mountains, digital art",
  "model": "flux",
  "width": 1024,
  "height": 1024,
  "seed": 12345
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Text description of the image |
| `model` | string | Yes | Model ID (see [Image Models](#image-models)) |
| `width` | integer | No | Image width. Default: 1024 |
| `height` | integer | No | Image height. Default: 1024 |
| `seed` | integer | No | Random seed for reproducibility |

**Response:**

Returns the generated image as binary data (PNG/JPEG) with appropriate `Content-Type` header.

**Example:**

```bash
curl -X POST https://your-app.vercel.app/api/image \
  -H "Authorization: Bearer cgpt_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic city at night",
    "model": "flux",
    "width": 1024,
    "height": 1024
  }' \
  --output image.png
```

### Video Generation

Generate videos from text prompts.

**Endpoint:** `POST /api/video`

**Request Body:**

```json
{
  "prompt": "A cat playing with a red ball on a sunny day",
  "model": "veo",
  "duration": 4,
  "width": 1280,
  "height": 720
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Text description of the video |
| `model` | string | Yes | Model ID (see [Video Models](#video-models)) |
| `duration` | integer | No | Video duration in seconds. Default: 4 |
| `width` | integer | No | Video width. Default: 1280 |
| `height` | integer | No | Video height. Default: 720 |

**Response:**

Returns the generated video as binary data (MP4) with appropriate `Content-Type` header.

**Example:**

```bash
curl -X POST https://your-app.vercel.app/api/video \
  -H "Authorization: Bearer cgpt_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Ocean waves crashing on a beach",
    "model": "veo",
    "duration": 4
  }' \
  --output video.mp4
```

### List Models

Get available models for each modality.

#### Chat Models

**Endpoint:** `GET /api/models/chat`

**Response:**

```json
{
  "object": "list",
  "data": [
    {
      "id": "openai",
      "name": "OpenAI GPT-4o",
      "provider": "pollinations",
      "description": "OpenAI GPT-4o model"
    },
    {
      "id": "mapleai-gpt4o",
      "name": "MapleAI GPT-4o",
      "provider": "mapleai",
      "description": "GPT-4o via MapleAI"
    }
  ]
}
```

#### Image Models

**Endpoint:** `GET /api/models/image`

**Response:**

```json
{
  "object": "list",
  "data": [
    {
      "id": "flux",
      "name": "Flux",
      "provider": "pollinations",
      "description": "High quality image generation"
    },
    {
      "id": "mapleai-dalle",
      "name": "MapleAI DALL-E",
      "provider": "mapleai",
      "description": "DALL-E via MapleAI"
    }
  ]
}
```

#### Video Models

**Endpoint:** `GET /api/models/video`

**Response:**

```json
{
  "object": "list",
  "data": [
    {
      "id": "veo",
      "name": "Veo",
      "provider": "pollinations",
      "description": "Google Veo video generation",
      "maxDuration": 8
    },
    {
      "id": "mapleai-veo",
      "name": "MapleAI Veo",
      "provider": "mapleai",
      "description": "Veo via MapleAI",
      "maxDuration": 8
    }
  ]
}
```

### API Key Management

#### Create API Key

**Endpoint:** `POST /api/keys`

**Request Body:**

```json
{
  "name": "My Production Key"
}
```

**Response:**

```json
{
  "id": "key_abc123",
  "key": "cgpt_xyz789...",
  "name": "My Production Key",
  "created": 1234567890
}
```

**Note:** The full API key is only shown once during creation. Store it securely.

#### List API Keys

**Endpoint:** `GET /api/keys`

**Response:**

```json
{
  "data": [
    {
      "id": "key_abc123",
      "name": "My Production Key",
      "prefix": "cgpt_xyz...",
      "created": 1234567890,
      "lastUsed": 1234567900
    }
  ]
}
```

#### Delete API Key

**Endpoint:** `DELETE /api/keys/:id`

**Response:**

```json
{
  "deleted": true,
  "id": "key_abc123"
}
```

## Provider Support

### Available Providers

| Provider | Chat | Image | Video |
|----------|------|-------|-------|
| Pollinations | ✅ | ✅ | ✅ |

### Chat Models

| Model ID | Name | Provider | Context Window |
|----------|------|----------|----------------|
| `openai` | OpenAI GPT-4o | Pollinations | 128k |
| `openai-fast` | GPT-4o Mini | Pollinations | 128k |
| `openai-large` | GPT-4.5 | Pollinations | 128k |
| `claude` | Claude 3.5 Sonnet | Pollinations | 200k |
| `claude-fast` | Claude 3 Haiku | Pollinations | 200k |
| `gemini` | Gemini 2.0 Flash | Pollinations | 1M |
| `gemini-large` | Gemini 2.5 Pro | Pollinations | 2M |
| `deepseek` | DeepSeek V3 | Pollinations | 64k |
| `grok` | Grok 3 | Pollinations | 128k |
| `mistral` | Mistral Large | Pollinations | 128k |
| `qwen-coder` | Qwen 2.5 Coder | Pollinations | 32k |
| `perplexity-fast` | Perplexity Fast | Pollinations | 128k |
| `perplexity-reasoning` | Perplexity Reasoning | Pollinations | 128k |
| `kimi-k2-thinking` | Kimi K2 Thinking | Pollinations | 128k |
| `gemini-large` | Gemini 2.5 Pro | Pollinations | 2M |
| `nova-micro` | Nova Micro | Pollinations | 128k |
| `chickytutor` | ChickyTutor | Pollinations | 128k |
| `midijourney` | Midijourney | Pollinations | 128k |
| `mapleai-gpt4o` | MapleAI GPT-4o | MapleAI | 128k |
| `mapleai-claude` | MapleAI Claude | MapleAI | 200k |
| `mapleai-gemini` | MapleAI Gemini | MapleAI | 1M |

### Image Models

| Model ID | Name | Provider | Description |
|----------|------|----------|-------------|
| `kontext` | Kontext | Pollinations | FLUX.1 Kontext - In-context editing |
| `turbo` | Turbo | Pollinations | SDXL Turbo - Real-time generation |
| `nanobanana` | Nanobanana | Pollinations | Gemini 2.5 Flash Image |
| `nanobanana-pro` | Nanobanana Pro | Pollinations | Gemini 3 Pro Image (4K) |
| `seedream` | Seedream | Pollinations | ByteDance ARK (better quality) |
| `seedream-pro` | Seedream Pro | Pollinations | ByteDance ARK (4K, Multi-Image) |
| `gptimage` | GPT Image | Pollinations | OpenAI image generation |
| `gptimage-large` | GPT Image Large | Pollinations | OpenAI advanced image generation |
| `flux` | Flux | Pollinations | Fast high-quality generation |
| `zimage` | Z-Image | Pollinations | Fast 6B Flux with 2x upscaling |
| `mapleai-dalle` | MapleAI DALL-E | MapleAI | DALL-E via MapleAI |
| `mapleai-flux` | MapleAI Flux | MapleAI | Flux via MapleAI |

### Video Models

| Model ID | Name | Provider | Max Duration |
|----------|------|----------|--------------|
| `veo` | Google Veo | Pollinations | 8 seconds |
| `seedance` | Seedance | Pollinations | 10 seconds |
| `seedance-pro` | Seedance Pro | Pollinations | 10 seconds |
| `mapleai-veo` | MapleAI Veo | MapleAI | 8 seconds |

## Code Examples

### Python

```python
import requests

API_KEY = "cgpt_your_api_key"
BASE_URL = "https://your-app.vercel.app"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Chat completion
response = requests.post(
    f"{BASE_URL}/api/chat",
    headers=headers,
    json={
        "model": "openai",
        "messages": [{"role": "user", "content": "Hello!"}]
    }
)
print(response.json())

# Image generation
response = requests.post(
    f"{BASE_URL}/api/image",
    headers=headers,
    json={
        "prompt": "A sunset over mountains",
        "model": "flux"
    }
)
with open("image.png", "wb") as f:
    f.write(response.content)
```

### JavaScript/Node.js

```javascript
const API_KEY = "cgpt_your_api_key";
const BASE_URL = "https://your-app.vercel.app";

// Chat completion
const response = await fetch(`${BASE_URL}/api/chat`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "openai",
    messages: [{ role: "user", content: "Hello!" }]
  })
});

const data = await response.json();
console.log(data);

// Image generation
const imageResponse = await fetch(`${BASE_URL}/api/image`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt: "A sunset over mountains",
    model: "flux"
  })
});

const imageBlob = await imageResponse.blob();
```

### cURL

```bash
# Chat completion
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Authorization: Bearer cgpt_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Image generation
curl -X POST https://your-app.vercel.app/api/image \
  -H "Authorization: Bearer cgpt_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A sunset over mountains",
    "model": "flux"
  }' \
  --output image.png

# Video generation
curl -X POST https://your-app.vercel.app/api/video \
  -H "Authorization: Bearer cgpt_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Ocean waves",
    "model": "veo"
  }' \
  --output video.mp4
```

## Support

For issues, questions, or feature requests:
- GitHub Issues: https://github.com/CloudCompile/cloudgpt/issues
- Documentation: https://github.com/CloudCompile/cloudgpt/blob/main/README.md
- Setup Guide: https://github.com/CloudCompile/cloudgpt/blob/main/KEYS_SETUP.md
