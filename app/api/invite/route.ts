import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/kinde-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const code = (body?.code || '').trim();
    if (!code) return NextResponse.json({ error: 'Missing invite code' }, { status: 400 });

    // Validate invite code against environment or static list
    const allowed = (process.env.INVITE_CODES || '').split(',').map(s => s.trim()).filter(Boolean);
    const envSingle = (process.env.INVITE_CODE || '').trim();
    if (envSingle) allowed.push(envSingle);

    if (!allowed.includes(code)) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 });
    }

    // Upgrade the user's plan to pro
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ plan: 'pro' })
      .eq('id', userId);

    if (error) {
      console.error('Failed to assign pro plan via invite:', error);
      return NextResponse.json({ error: 'Failed to upgrade user' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Invite API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
