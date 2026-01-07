import { NextRequest, NextResponse } from 'next/server';
import { CHAT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/lib/providers';
import { getCorsHeaders } from '@/lib/utils';

export const runtime = 'edge';

export async function GET() {
  const allModels = [
    ...CHAT_MODELS.map(m => ({
      id: m.id,
      object: 'model',
      created: 1700000000,
      owned_by: m.provider === 'liz' ? 'google' : m.provider,
      permission: [
        {
          id: 'modelperm-' + m.id,
          object: 'model_permission',
          created: 1700000000,
          allow_create_engine: false,
          allow_sampling: true,
          allow_logprobs: true,
          allow_search_indices: false,
          allow_view: true,
          allow_fine_tuning: false,
          organization: '*',
          group: null,
          is_blocking: false,
        },
      ],
      root: m.id,
      parent: null,
    })),
    ...IMAGE_MODELS.map(m => ({
      id: m.id,
      object: 'model',
      created: 1700000000,
      owned_by: m.provider,
      permission: [],
      root: m.id,
      parent: null,
    })),
    ...VIDEO_MODELS.map(m => ({
      id: m.id,
      object: 'model',
      created: 1700000000,
      owned_by: m.provider,
      permission: [],
      root: m.id,
      parent: null,
    })),
  ];

  return NextResponse.json({
    object: 'list',
    data: allModels,
  }, {
    headers: getCorsHeaders()
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204, 
    headers: getCorsHeaders() 
  });
}
