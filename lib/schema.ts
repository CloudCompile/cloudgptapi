import { z } from 'zod';

export const ChatCompletionMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.union([z.string(), z.array(z.any())]).nullable().optional(),
  name: z.string().optional(),
  tool_calls: z.array(z.any()).optional(),
  tool_call_id: z.string().optional(),
});

export const ChatCompletionRequestSchema = z.object({
  model: z.string().min(1, "Model is required"),
  messages: z.array(ChatCompletionMessageSchema).min(1, "messages array must not be empty"),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  n: z.number().int().min(1).optional(),
  stream: z.boolean().optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  max_tokens: z.number().int().min(1).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  logit_bias: z.record(z.number()).optional(),
  user: z.string().import { z } from 'zod';

ex(z
export const ChatComplool  role: z.enum(['system', 'user', 'assistant', 'toolin  content: z.union([z.string(), z.array(z.any())]).nullon  name: z.string().optional(),
  tool_calls: z.array(z.any()).optional())   tool_calls: z.array(z.anumber  tool_call_id: z.s,
}).passthrough();
