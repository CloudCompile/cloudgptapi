import { NextRequest, NextResponse } from 'next/server';
import { CHAT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/lib/providers';

export const runtime = 'edge';

export async function GET() {
  const allModels = [
    ...CHAT_MODELS.map(m => ({
      id: m.id,
      object: 'model',
      created: 1700000000,
      owned_by: m.provider,
    })),
    ...IMAGE_MODELS.map(m => ({
      id: m.id,
      object: 'model',
      created: 1700000000,
      owned_by: m.provider,
    })),
    ...VIDEO_MODELS.map(m => ({
      id: m.id,
      object: 'model',
      created: 1700000000,
      owned_by: m.provider,
    })),
  ];

  return NextResponse.json({
    object: 'list',
    data: allModels,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
