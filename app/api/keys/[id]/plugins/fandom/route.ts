import { getCurrentUserId } from '@/lib/kinde-auth';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isFandomPluginConfigured } from '@/lib/plugins';

const REMOTE_PLUGIN_URL = (process.env.FANDOM_PLUGIN_URL || process.env.NEXT_PUBLIC_FANDOM_PLUGIN_URL || '').trim();

/**
 * GET /api/keys/[id]/plugins/fandom
 * Fetch fandom plugin settings for a specific API key from remote VPS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id: keyId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isFandomPluginConfigured()) {
      return NextResponse.json({ enabled: false, settings: null });
    }

    // Verify key ownership and fetch persisted plugin config
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('user_id, fandom_plugin_enabled, fandom_settings')
      .eq('id', keyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (keyError || !keyData) {
      return NextResponse.json({ error: 'API key not found or unauthorized' }, { status: 404 });
    }

    // Fetch from remote VPS
    const response = await fetch(`${REMOTE_PLUGIN_URL}/settings/${keyId}`);
    if (!response.ok) {
      // Fall back to persisted local settings so plugin state still works
      return NextResponse.json({
        enabled: keyData.fandom_plugin_enabled || false,
        settings: keyData.fandom_settings || null
      });
    }

    const data = await response.json();
    const remoteEnabled = Boolean(data.enabled);
    const remoteSettings = data.settings ?? null;

    // Keep local key settings in sync with remote so runtime pipeline can read them from api_keys
    await supabaseAdmin
      .from('api_keys')
      .update({
        fandom_plugin_enabled: remoteEnabled,
        fandom_settings: remoteSettings
      })
      .eq('id', keyId)
      .eq('user_id', userId);

    return NextResponse.json({
      enabled: remoteEnabled,
      settings: remoteSettings
    });
  } catch (err: any) {
    console.error('[GET Fandom Plugin] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/keys/[id]/plugins/fandom
 * Update fandom plugin settings for a specific API key on remote VPS
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const { id: keyId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isFandomPluginConfigured()) {
      return NextResponse.json({ error: 'Lorebook/Wiki plugin is not configured' }, { status: 503 });
    }

    // Verify key ownership in Supabase first
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

    // Update on remote VPS
    const response = await fetch(`${REMOTE_PLUGIN_URL}/settings/${keyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, settings }),
    });

    if (!response.ok) {
      console.error('[PATCH Fandom Plugin] Remote Error:', await response.text());
      return NextResponse.json({ error: 'Failed to update remote settings' }, { status: 500 });
    }

    // Persist plugin state on API key for runtime pipeline reads (validateApiKey -> parser)
    const { error: updateError } = await supabaseAdmin
      .from('api_keys')
      .update({
        fandom_plugin_enabled: Boolean(enabled),
        fandom_settings: settings ?? null
      })
      .eq('id', keyId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('[PATCH Fandom Plugin] Supabase update error:', updateError);
      return NextResponse.json({ error: 'Failed to persist plugin settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      enabled: Boolean(enabled),
      settings: settings ?? null
    });
  } catch (err: any) {
    console.error('[PATCH Fandom Plugin] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
