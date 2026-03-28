import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/kinde-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { isFandomPluginConfigured } from '@/lib/plugins';

const REMOTE_PLUGIN_URL = (process.env.FANDOM_PLUGIN_URL || process.env.NEXT_PUBLIC_FANDOM_PLUGIN_URL || '').trim();

async function verifyOwnership(userId: string | null, keyId: string) {
  if (!userId) return false;
  
  const { data: keyData, error: keyError } = await supabaseAdmin
    .from('api_keys')
    .select('user_id')
    .eq('id', keyId)
    .eq('user_id', userId)
    .maybeSingle();

  return !keyError && !!keyData;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: keyId } = await params;
  
  try {
    const userId = await getCurrentUserId();
    if (!await verifyOwnership(userId, keyId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isFandomPluginConfigured()) {
      return NextResponse.json({ snippets: [] });
    }

    const response = await fetch(`${REMOTE_PLUGIN_URL}/lore/${keyId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ snippets: [] });
      }
      return NextResponse.json({ error: 'Failed to fetch lore from remote service' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[LoreAPI] Error fetching lore:', error);
    return NextResponse.json({ error: 'Remote service unavailable' }, { status: 503 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: keyId } = await params;
  
  try {
    const userId = await getCurrentUserId();
    if (!await verifyOwnership(userId, keyId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isFandomPluginConfigured()) {
      return NextResponse.json({ error: 'Lorebook/Wiki plugin is not configured' }, { status: 503 });
    }

    const body = await req.json();
    
    const response = await fetch(`${REMOTE_PLUGIN_URL}/lore/${keyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to add lore snippet' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[LoreAPI] Error adding lore:', error);
    return NextResponse.json({ error: 'Remote service unavailable' }, { status: 503 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: keyId } = await params;
  const { searchParams } = new URL(req.url);
  const snippetId = searchParams.get('snippetId');

  if (!snippetId) {
    return NextResponse.json({ error: 'Snippet ID is required' }, { status: 400 });
  }
  
  try {
    const userId = await getCurrentUserId();
    if (!await verifyOwnership(userId, keyId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isFandomPluginConfigured()) {
      return NextResponse.json({ error: 'Lorebook/Wiki plugin is not configured' }, { status: 503 });
    }

    const response = await fetch(`${REMOTE_PLUGIN_URL}/lore/${keyId}/${snippetId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to delete lore snippet' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LoreAPI] Error deleting lore:', error);
    return NextResponse.json({ error: 'Remote service unavailable' }, { status: 503 });
  }
}
