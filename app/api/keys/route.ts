import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateApiKey } from '@/lib/api-keys';
import { supabaseAdmin } from '@/lib/supabase';
import { syncUser } from '@/lib/admin-actions';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync user profile on every dashboard visit/key fetch
    const user = await currentUser();
    if (user) {
      try {
        await syncUser(userId, user.emailAddresses[0].emailAddress);
      } catch (syncError) {
        console.error('Error in syncUser:', syncError);
        // Continue even if sync fails, as the table might already have the user
      }
    }

    const { data: keys, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

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
        .single();
      
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

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert(newKey)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating API key:', error);
      return NextResponse.json({ 
        error: 'Failed to create API key',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

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
