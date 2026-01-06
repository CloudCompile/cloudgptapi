# Stable Horde Provider

This document explains how to use the Stable Horde provider in CloudGPT API.

## Overview

Stable Horde is a distributed network of community-run workers that generate AI images and text using various models. This integration allows you to generate images using popular Stable Diffusion models through the Stable Horde API.

## Setup

1. Get your API key from [Stable Horde](https://stablehorde.net/)
2. Add it to your `.env` file:
   ```
   STABLEHORDE_API_KEY=your_api_key_here
   ```

The default API key from `STABLEHORDEDOCS.md` is already included in `.env.example`.

## Available Models

### Image Models

- **Flux.1-Schnell fp8** (`stable-horde-flux-schnell`) - Fast high-quality generation
- **SDXL 1.0** (`stable-horde-sdxl`) - High quality image generation
- **Deliberate** (`stable-horde-deliberate`) - Versatile general purpose model
- **Dreamshaper** (`stable-horde-dreamshaper`) - Creative artistic generation
- **Realistic Vision** (`stable-horde-realistic-vision`) - Photo-realistic images
- **AbsoluteReality** (`stable-horde-absolute-reality`) - High fidelity realistic images
- **Juggernaut XL** (`stable-horde-juggernaut-xl`) - Versatile SDXL model
- **Pony Diffusion XL** (`stable-horde-pony-diffusion`) - Anime and character focused
- **Stable Diffusion** (`stable-horde-stable-diffusion`) - Classic SD 1.5 model
- **Anything v5** (`stable-horde-anything-v5`) - Anime style generation

### Text Models

- **Nemotron Nano 9B V2** (`stable-horde-nemotron-nano-9b`) - NVIDIA Nemotron Nano 9B V2
- **Llama 3.2 3B Instruct** (`stable-horde-llama-3.2-3b`) - Meta Llama 3.2 3B Instruct
- **Mistral 7B Instruct** (`stable-horde-mistral-7b`) - Mistral AI 7B Instruct model
- **Qwen 3 4B** (`stable-horde-qwen3-4b`) - Qwen 3 4B model
- **NeonMaid-12B** (`stable-horde-neonmaid-12b`) - NeonMaid-12B v2 creative model

## Usage Example

### Image Generation

```bash
curl -X POST 'http://localhost:3000/api/image' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "a beautiful sunset over mountains",
    "model": "stable-horde-sdxl",
    "width": 1024,
    "height": 1024,
    "steps": 30,
    "cfg_scale": 7.5
  }'
```

### Stable Horde Specific Parameters

- `steps` - Number of diffusion steps (default: 30)
- `cfg_scale` - Classifier-free guidance scale (default: 7.5)
- `sampler_name` - Sampler to use (default: 'k_euler_a')
  - Options: k_euler, k_euler_a, k_heun, k_dpm_2, k_dpm_2_a, k_lms, k_dpmpp_2s_a, k_dpmpp_2m, k_dpmpp_sde, ddim
- `karras` - Use Karras noise schedule (default: true)
- `nsfw` - Allow NSFW content (default: false)
- `trusted_workers` - Only use trusted workers (default: false)
- `seed` - Random seed for reproducibility

## How It Works

The Stable Horde integration uses an async polling approach:

1. **Submit Request**: Sends a generation request to Stable Horde API
2. **Poll for Status**: Polls the API every 2 seconds to check completion status
3. **Fetch Result**: Once complete, fetches the generated image
4. **Timeout**: Maximum wait time is 2 minutes (configurable)

## Rate Limits

Stable Horde has community-based rate limits. With an API key, you get priority access. The system will queue your request and process it when workers are available.

## Notes

- Generation times vary based on worker availability
- Higher quality settings (more steps, larger images) take longer
- SDXL models generally take longer than SD 1.5 models
- Consider using `trusted_workers: true` for more reliable results
