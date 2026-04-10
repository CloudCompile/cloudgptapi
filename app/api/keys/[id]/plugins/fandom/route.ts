import { getCurrentUserId } from '@/lib/kinde-auth';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/keys/[id]/plugins/fandom
 * Returns fandom plugin enabled state + settings from Supabase.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    const { id: keyId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: keyData, error } = await supabaseAdmin
      .from('api_keys')
      .select('user_id, fandom_plugin_enabled, fandom_settings')
      .eq('id', keyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !keyData) {
      return NextResponse.json({ error: 'API key not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      enabled: keyData.fandom_plugin_enabled || false,
      settings: keyData.fandom_settings || null,
    });
  } catch (err: any) {
    console.error('[GET Fandom Plugin] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/keys/[id]/plugins/fandom
 * Updates fandom plugin enabled state + settings in Supabase.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    const { id: keyId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('user_id')
      .eq('id', keyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (keyError || !keyData) {
      return NextResponse.json({ error: 'API key not found or unauthorized' }, { status: 404 });
    }

    const body = await request.json();
    const { enabled, settings } = body;

    const { error: updateError } = await supabaseAdmin
      .from('api_keys')
      .update({
        fandom_plugin_enabled: Boolean(enabled),
        fandom_settings: settings ?? null,
      })
      .eq('id', keyId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('[PATCH Fandom Plugin] Supabase update error:', updateError);
      return NextResponse.json({ error: 'Failed to save plugin settings', details: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      enabled: Boolean(enabled),
      settings: settings ?? null,
    });
  } catch (err: any) {
    console.error('[PATCH Fandom Plugin] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
