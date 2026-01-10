import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateApiKey } from '@/lib/api-keys';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: User sync is handled by the SyncUser component in the root layout
    // No need to sync here to avoid duplicate webhook notifications

    const { data: keys, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log(`[GET /api/keys] Found ${keys?.length || 0} keys for user: ${userId}`);

    if (error) {
      console.error('Supabase error fetching API keys:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch API keys',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    // Return keys with masked values
    const maskedKeys = (keys || []).map(k => ({
      id: k.id,
      name: k.name,
      keyPreview: k.key ? `${k.key.substring(0, 12)}...${k.key.substring(k.key.length - 4)}` : 'Invalid Key',
      createdAt: k.created_at,
      usageCount: k.usage_count,
      lastUsedAt: k.last_used_at,
    }));

    return NextResponse.json({ keys: maskedKeys });
  } catch (err: any) {
    console.error('Unexpected error in GET /api/keys:', err);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: err.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const name = body.name || 'Unnamed Key';

    // Get user's plan to set initial rate limit
    let profileData;
    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.warn('Profile fetch error (might not exist yet):', profileError.message);
      }
      profileData = profile;
    } catch (err) {
      console.warn('Exception fetching profile:', err);
    }

    const plan = profileData?.plan || 'free';
    const rateLimit = plan === 'pro' ? 500 : plan === 'enterprise' ? 1000 : 60;

    const newKey = {
      key: generateApiKey(),
      user_id: userId,
      name,
      rate_limit: rateLimit,
    };

    console.log(`[POST /api/keys] User ID: ${userId}, Plan: ${plan}`);
    console.log(`[POST /api/keys] Data to insert:`, JSON.stringify(newKey, null, 2));
    console.log(`[POST /api/keys] Attempting to insert key into public.api_keys table...`);

    const { data, error, status, statusText } = await supabaseAdmin
      .from('api_keys')
      .insert(newKey)
      .select()
      .maybeSingle();

    if (error) {
      console.error(`[POST /api/keys] Supabase error (Status: ${status} ${statusText}):`, error);
      return NextResponse.json({ 
        error: 'Failed to create API key',
        details: error.message,
        code: error.code,
        status
      }, { status: 500 });
    }

    if (!data) {
      console.error(`[POST /api/keys] No data returned after insertion (Status: ${status} ${statusText})`);
      return NextResponse.json({ error: 'Failed to create API key: No data returned' }, { status: 500 });
    }

    // Verify persistence by reading it back
    const { data: verifiedData, error: verifyError } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('id', data.id)
      .maybeSingle();

    if (verifyError || !verifiedData) {
      console.error(`[POST /api/keys] CRITICAL: Key was "created" but could not be read back! Verification error:`, verifyError);
    } else {
      console.log(`[POST /api/keys] Verification SUCCESS: Key ${data.id} is persistent in database.`);
    }

    const keyPreview = data.key ? `${data.key.substring(0, 12)}...${data.key.substring(data.key.length - 4)}` : 'N/A';
    console.log(`[POST /api/keys] Key created successfully. DB ID: ${data.id}, Key: ${keyPreview}`);

    // Return the full key only on creation
    return NextResponse.json({
      id: data.id,
      key: data.key,
      name: data.name,
      createdAt: data.created_at,
      message: 'Save this key securely - it will not be shown again!',
    });
  } catch (err: any) {
    console.error('Unexpected error in POST /api/keys:', err);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: err.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const keyId = body.id;

  if (!keyId) {
    return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
