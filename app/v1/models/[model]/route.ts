import { NextRequest, NextResponse } from 'next/server';
import { CHAT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/lib/providers';
import { getCorsHeaders } from '@/lib/utils';

export const runtime = 'edge';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const { model: modelId } = await params;
  
  const model = [
    ...CHAT_MODELS,
    ...IMAGE_MODELS,
    ...VIDEO_MODELS
  ].find(m => m.id === modelId);

  if (!model) {
    return NextResponse.json({
      error: {
        message: `Model '${modelId}' not found`,
        type: 'invalid_request_error',
        param: 'model',
        code: 'model_not_found'
      }
    }, {
      status: 404,
      headers: getCorsHeaders()
    });
  }

  return NextResponse.json({
    id: model.id,
    object: 'model',
    created: 1677610602,
    owned_by: model.provider,
  }, {
    headers: getCorsHeaders()
  });
}
