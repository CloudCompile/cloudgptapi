import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/kinde-auth';
import { supabaseAdmin } from '@/lib/supabase';

async function verifyOwnership(userId: string | null, keyId: string): Promise<boolean> {
  if (!userId) return false;
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('user_id')
    .eq('id', keyId)
    .eq('user_id', userId)
    .maybeSingle();
  return !error && !!data;
}

/**
 * GET /api/keys/[id]/plugins/fandom/lore
 * Returns all manual lore snippets for this API key.
 */
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

    const { data, error } = await supabaseAdmin
      .from('lore_snippets')
      .select('id, title, content, source, created_at')
      .eq('api_key_id', keyId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[LoreAPI] GET error:', error);
      return NextResponse.json({ error: 'Failed to fetch snippets' }, { status: 500 });
    }

    return NextResponse.json({ snippets: data ?? [] });
  } catch (err) {
    console.error('[LoreAPI] GET exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/keys/[id]/plugins/fandom/lore
 * Adds a new manual lore snippet.
 */
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

    const body = await req.json();
    const title: string = (body.title || '').trim();
    const content: string = (body.content || '').trim();

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('lore_snippets')
      .insert({ api_key_id: keyId, title, content, source: body.source || 'manual' })
      .select('id, title, content, source, created_at')
      .single();

    if (error) {
      console.error('[LoreAPI] POST error:', error);
      return NextResponse.json({ error: 'Failed to add snippet' }, { status: 500 });
    }

    return NextResponse.json({ snippet: data });
  } catch (err) {
    console.error('[LoreAPI] POST exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/keys/[id]/plugins/fandom/lore?snippetId=...
 * Deletes a specific snippet.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: keyId } = await params;
  const snippetId = new URL(req.url).searchParams.get('snippetId');

  if (!snippetId) {
    return NextResponse.json({ error: 'snippetId is required' }, { status: 400 });
  }

  try {
    const userId = await getCurrentUserId();
    if (!await verifyOwnership(userId, keyId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabaseAdmin
      .from('lore_snippets')
      .delete()
      .eq('id', snippetId)
      .eq('api_key_id', keyId); // ensures users can only delete their own snippets

    if (error) {
      console.error('[LoreAPI] DELETE error:', error);
      return NextResponse.json({ error: 'Failed to delete snippet' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[LoreAPI] DELETE exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
