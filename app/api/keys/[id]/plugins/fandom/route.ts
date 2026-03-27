import { auth } from '@clerk/nextjs/server';
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
    const { userId } = await auth();
    const { id: keyId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isFandomPluginConfigured()) {
      return NextResponse.json({ enabled: false, settings: null });
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

    // Fetch from remote VPS
    const response = await fetch(`${REMOTE_PLUGIN_URL}/settings/${keyId}`);
    if (!response.ok) {
      // If not found on remote, it might be new. The remote service handles default settings.
      return NextResponse.json({ enabled: false, settings: null });
    }

    const data = await response.json();
    return NextResponse.json({
      enabled: data.enabled,
      settings: data.settings
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
    const { userId } = await auth();
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

    return NextResponse.json({
      success: true,
      enabled,
      settings
    });
  } catch (err: any) {
    console.error('[PATCH Fandom Plugin] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
