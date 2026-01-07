import { NextResponse } from 'next/server';
import { CHAT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/lib/providers';
import { getCorsHeaders } from '@/lib/utils';

export const runtime = 'edge';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

export async function GET() {
  const allModels = [
    ...CHAT_MODELS.map(m => ({
      id: m.id,
      object: 'model',
      created: 1677610602, // Placeholder timestamp
      owned_by: m.provider,
      type: 'chat'
    })),
    ...IMAGE_MODELS.map(m => ({
      id: m.id,
      object: 'model',
      created: 1677610602,
      owned_by: m.provider,
      type: 'image'
    })),
    ...VIDEO_MODELS.map(m => ({
      id: m.id,
      object: 'model',
      created: 1677610602,
      owned_by: m.provider,
      type: 'video'
    }))
  ];

  return NextResponse.json({
    object: 'list',
    data: allModels
  }, {
    headers: getCorsHeaders()
  });
}
