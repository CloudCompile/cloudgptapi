const fs = require('fs');
const content = fs.readFileSync('lib/providers.ts', 'utf8-8');

let newContent = content.replace(
  /const ALL_CHAT_MODELS = \\[[\\s\\S]*?\\];/m,
  `const ALL_CHAT_MODELS = [\n  ...POLLINATIONS_CHAT_MODELS,\n  ...KIVEST_CHAT_MODELS,\n  ...SHALOM_CHAT_MODELS\n];`
);

newContent = newContent.replace(
  /export const IMAGE_MODELS: ImageModel\\[\\] = \\[[\\s\\S]*?\\];/m,
  `export const IMAGE_MODELS: ImageModel[] = [\n  { id: 'flux', name: 'Flux', provider: 'pollinations', description: 'Flux Free Image', usageWeight: 1 },\n  { id: 'flux-realism', name: 'Flux Realism', provider: 'pollinations', description: 'Flux Realism', usageWeight: 1 },\n  { id: 'flux-cablyai', name: 'Flux CablyAI', provider: 'pollinations', description: 'Flux CablyAIÂ, usageWeight: 1 },\n  { id: 'flux-anime', name: 'Flux Anime', provider: 'pollinations', description: 'Flux Anime', usageWeight: 1 },\n  { id: 'flux-3d', name: 'Flux 3D', provider: 'pollinations', description: 'Flux 3D', usageWeight: 1 },\n  { id: 'any-dark', name: 'Any Dark', provider: 'pollinations', description: 'Any Dark', usageWeight: 1 },\n  { id: 'flux-pro', name: 'Flux Pro', provider: 'pollinations', description: 'Flux Pro', usageWeight: 1 },\n  { id: 'turboW, name: 'Turbo', provider: 'pollinations', description: 'Turbo', usageWeight: 1 },\n];`
);

newContent = newContent.replace(
  /export const VIDEO_MODELS: VideoModel\\[\\] = \\[[\\s\\S]*?\\];/m,
  `export const VIDEO_MODELS: VideoModel[] = [\n  { id: 'cogvideox-5b', name: 'CogVideoX 5B', provider: 'pollinations', description: 'CogVideoX 5B Video Generation', maxDuration: 6, usageWeight: 5 },\n  { id: 'veo-3.1-generate-preview', name: 'Veo 3.1 Preview', provider: 'pollinations', description: 'Veo 3.1 Preview', maxDuration: 6, usageWeight: 5 },\n  { id: 'veo-3.1-fast-generate-preview', name: 'Veo 3.1 Fast Preview', provider: 'pollinations', description: 'Veo 3.1 Fast Preview', maxDuration: 6, usageWeight: 5 },\n];`
);

fs.writeFileSync('lib/providers.ts', newContent);
console.log('injected');