
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function generateApiKey(): string {
  const prefix = 'cgpt_';
  const key = uuidv4().replace(/-/g, '');
  return `${prefix}${key}`;
}

async function createKeyForUser(email: string) {
  console.log(`--- Generating API key for ${email} ---`);
  
  try {
    // 1. Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, plan')
      .eq('email', email)
      .maybeSingle();

    if (profileError) {
      console.error(`Error finding profile for ${email}:`, profileError.message);
      return;
    }

    if (!profile) {
      console.error(`Profile not found for email: ${email}`);
      return;
    }

    console.log(`Found profile: ${profile.id} (${profile.email}), current plan: ${profile.plan}`);

    // 2. Generate new key
    const newKey = generateApiKey();
    const keyName = `Test Key - ${new Date().toLocaleDateString()}`;

    // 3. Insert into api_keys table
    const { data: apiKey, error: insertError } = await supabaseAdmin
      .from('api_keys')
      .insert({
        key: newKey,
        user_id: profile.id,
        name: keyName,
        rate_limit: 5000, // Pro level limit
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error('Error inserting API key:', insertError.message);
      return;
    }

    if (!apiKey) {
      console.error('No data returned after inserting API key');
      return;
    }

    console.log('\n--- API Key Generated Successfully ---');
    console.log(`Email: ${email}`);
    console.log(`Key: ${newKey}`);
    console.log(`Name: ${keyName}`);
    console.log(`Rate Limit: ${apiKey.rate_limit}`);
    console.log('--------------------------------------\n');

    return newKey;
  } catch (err: any) {
    console.error('System error:', err.message);
  }
}

const targetEmail = process.argv[2] || 'bakatsun09@gmail.com';
createKeyForUser(targetEmail);
