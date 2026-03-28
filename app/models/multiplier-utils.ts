import { getModelUsageWeight } from '@/lib/api-keys';

export function getMultiplierLabel(weight: number) {
  if (weight === 1) return '1x';
  if (weight < 1) return `${weight}x`;
  if (weight % 1 === 0) return `${weight}x`;
  return weight.toFixed(2) + 'x';
}

export function getMultiplierDescription(weight: number) {
  if (weight === 1) return 'Standard: 1 request per call.';
  if (weight < 1) return `Discounted: Only ${weight} requests per call.`;
  if (weight > 1) return `Premium: Costs ${weight} requests per call.`;
  return `${weight}x requests per call.`;
}

export function getModelMultiplier(modelId: string) {
  return getModelUsageWeight(modelId);
}
