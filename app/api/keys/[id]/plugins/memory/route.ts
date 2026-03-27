import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function getMemoryEnabled(settings: any): boolean {
  return Boolean(settings?.plugins?.memory?.enabled);
}

function withMemoryEnabled(settings: any, enabled: boolean): any {
  return {
    ...(settings || {}),
    plugins: {
      ...(settings?.plugins || {}),
      memory: { enabled: Boolean(enabled) }
    }
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: keyId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('user_id, fandom_settings')
      .eq('id', keyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (keyError || !keyData) {
      return NextResponse.json({ error: 'API key not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      enabled: getMemoryEnabled(keyData.fandom_settings)
    });
  } catch (err: any) {
    console.error('[GET Memory Plugin] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: keyId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('user_id, fandom_settings')
      .eq('id', keyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (keyError || !keyData) {
      return NextResponse.json({ error: 'API key not found or unauthorized' }, { status: 404 });
    }

    const body = await request.json();
    const enabled = Boolean(body?.enabled);
    const nextSettings = withMemoryEnabled(keyData.fandom_settings, enabled);

    const { error: updateError } = await supabaseAdmin
      .from('api_keys')
      .update({ fandom_settings: nextSettings })
      .eq('id', keyId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('[PATCH Memory Plugin] Supabase update error:', updateError);
      return NextResponse.json({ error: 'Failed to persist plugin settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, enabled });
  } catch (err: any) {
    console.error('[PATCH Memory Plugin] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
