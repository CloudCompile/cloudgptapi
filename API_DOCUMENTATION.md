# CloudGPT API Documentation

Complete API reference for CloudGPT - Unified AI API Gateway
     
## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Rate Limits](#rate-limits)
- [Error Handling](#error-handling)
- [Custom Headers](#custom-headers)
- [Transparency & Data Privacy](#transparency--data-privacy)
- [Endpoints](#endpoints)
- [Chat Completions](#chat-completions)
- [Advanced Memory Integrated Free AI Chat](#advanced-memory-integrated-free-ai-chat)
- [Image Generation](#image-generation)
  - [Video Generation](#video-generation)
  - [List Models](#list-models)
  - [API Key Management](#api-key-management)
- [Provider Support](#provider-support) 

## Authentication

All API requests require authentication using an API key in the Authorization header:

```http
Authorization: Bearer cgpt_your_api_key_here
```

Get your API key from the [Dashboard](/dashboard) after signing up.

## Base URL

```
https://cloudgptapi.vercel.app
```

## Rate Limits

| User Type | Chat | Image | Video |
|-----------|------|-------|-------|
| Anonymous (IP-based) | 10/min | 5/min | 2/min |
| Authenticated (API Key) | 60/min* | 30/min* | 10/min* |

*\*Default limits for authenticated users. Custom limits can be configured per API key.*

Rate limit information is included in response headers:
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

## Error Handling

All errors follow this format:

```json
{
  "error": "Error description",
  "details": "Technical details (if available)"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request - Invalid parameters
- `401` - Unauthorized - Invalid or missing API key
- `429` - Too Many Requests - Rate limit exceeded
- `500` - Internal Server Error

## Custom Headers

CloudGPT automatically adds or propagates headers to upstream providers (like PolliStack/Meridian) for user differentiation and storage isolation:

| Header | Value / Source | Description |
|--------|----------------|-------------|
| `X-App-Source` | `CloudGPT-Website` or `CloudGPT-API` | Identifies if the request came from the official playground or a 3rd party API client. |
| `x-user-id` | Clerk ID, API Key User ID, or IP-based ID | A unique identifier for the end-user, ensuring isolated storage/memory in backend routers. |

*Note: API clients can pass their own `x-user-id` header to override the default identification for their end-users.*

## Transparency & Data Privacy

CloudGPT is committed to being an honest and transparent AI gateway. Here is exactly how we handle your information and how our routing works.

### Stateless Architecture
CloudGPT acts as a **stateless router**. This means:
- We **do not store** chat messages, generated images, or video files on our own infrastructure.
- We **do not train** models on your data.
- We only store metadata (timestamps, model IDs, token counts) necessary for billing and rate-limiting.

### Routing Logic
When a request hits CloudGPT, it follows this flow:
1. **Auth Check:** The `Authorization` header is validated.
2. **User ID Derivation:** A unique ID is assigned to the request based on the [User Identification Chain](#user-identification-chain).
3. **Provider Selection:** The request is mapped to an upstream provider (e.g., Pollinations, Meridian, OpenRouter).
4. **Header Injection:** CloudGPT injects `X-App-Source` and `x-user-id` headers before forwarding the request.

### User Identification Chain
To ensure data isolation (especially for the Memory API), we identify users in this order:
1. **Explicit Header:** `x-user-id` provided by the API client.
2. **API Key Owner:** The ID of the account that generated the API key.
3. **Clerk Session:** The logged-in user (for website requests).
4. **Anonymous IP:** The public IP address of the requester (fallback).

### Data Storage & Third Parties
While CloudGPT is stateless, our upstream providers may have different policies:
- **Memory API (Meridian):** Conversation context is stored in a cognitive substrate managed by Meridian Labs. This data is isolated by the user ID provided by CloudGPT.
- **Image/Video (Pollinations):** Generated media is temporarily cached on Pollinations' edge servers to allow for download and retrieval.
- **Provider Keys:** CloudGPT uses its own master keys for upstream providers; your API keys are never shared with them.

## Endpoints

### Chat Completions

Generate text completions using various LLMs.

**Endpoint:** `POST /v1/chat/completions`

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

Standard OpenAI-compatible response format.

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "openai",
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

### Advanced Memory Integrated Free AI Chat

Generate text completions with long-term cognitive recall using the Meridian substrate. This endpoint provides persistent memory across sessions at no cost.

**Endpoint:** `POST /api/mem`

**Request Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Remember that my favorite project is CloudGPT."
    }
  ]
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messages` | array | Yes | Array of message objects for the AI to process and remember. |

**Response:**

```json
{
  "response": "I've noted that your favorite project is CloudGPT. I'll remember this for our future interactions!"
}
```

*Note: You must provide an `x-user-id` header or be logged in via Clerk for memory to persist correctly for the specific user.*

### Image Generation

Generate images from text prompts using OpenAI-compatible format.

**Endpoint:** `POST /v1/images/generations`

**Request Body:**

```json
{
  "prompt": "A beautiful sunset over mountains, digital art",
  "model": "flux",
  "n": 1,
  "size": "1024x1024",
  "response_format": "url"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Text description of the image |
| `model` | string | No | Model ID. Default: "flux" |
| `n` | integer | No | Number of images to generate. Default: 1 |
| `size` | string | No | Image dimensions (e.g., "1024x1024") |
| `response_format` | string | No | "url" or "b64_json". Default: "url" |

**Response:**

```json
{
  "created": 1589478378,
  "data": [
    {
      "url": "https://..."
    }
  ]
}
```

*Note: You can still use the legacy `POST /api/image` to receive raw binary data directly.*

### Video Generation

Generate videos from text prompts.

**Endpoint:** `POST /v1/video/generations`

**Request Body:**

```json
{
  "prompt": "A cat playing with a red ball",
  "model": "veo",
  "duration": 4
}
```

**Response:**

```json
{
  "created": 1589478378,
  "data": [
    {
      "url": "https://..."
    }
  ]
}
```

*Note: You can still use the legacy `POST /api/video` to receive raw binary data directly.*

### List Models

Get available models for all modalities (Chat, Image, Video) in a single OpenAI-compatible list.

**Endpoint:** `GET /v1/models`

**Response:**

```json
{
  "object": "list",
  "data": [
    {
      "id": "openai",
      "object": "model",
      "created": 1710000000,
      "owned_by": "pollinations",
      "type": "chat"
    },
    ...
  ]
}
```

## Provider Support

CloudGPT aggregates multiple top-tier AI providers:

| Provider | Description |
|----------|-------------|
| **Pollinations** | Main provider for fast text, image, and video models. |
| **Routeway** | Provider for free high-performance models. |
| **OpenRouter** | Gateway to a massive selection of models. |
| **Stable Horde** | Community-driven distributed model network. |
| **Meridian** | Specialized cognitive substrate with persistent memory. |

### Popular Chat Models

| Model ID | Name | Provider |
|----------|------|----------|
| `openai` | OpenAI GPT-5 Mini | Pollinations |
| `claude` | Anthropic Claude Sonnet 4.5 | Pollinations |
| `gemini` | Gemini 3 Flash | Pollinations |
| `deepseek` | DeepSeek V3.2 | Pollinations |
| `meridian` | Meridian (Memory) | Meridian |
| `llama-3.3-70b-instruct:free` | Llama 3.3 70B | Routeway |

### Popular Image Models

| Model ID | Name | Provider |
|----------|------|----------|
| `flux` | Flux Schnell | Pollinations |
| `turbo` | SDXL Turbo | Pollinations |
| `kontext` | FLUX.1 Kontext | Pollinations |
| `appypie-sdxl` | AppyPie SDXL | AppyPie |

## Code Examples

### JavaScript (fetch)

```javascript
const response = await fetch('https://cloudgptapi.vercel.app/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
    'x-user-id': 'user_123' // Optional: differentiate storage
  },
  body: JSON.stringify({
    model: 'openai',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

const data = await response.json();
console.log(data);
```

## Support

For issues or questions, visit our [Dashboard](/dashboard) or contact support at meridianlabsapp.website.
