
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Manually load and set env vars before ANY imports
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

import { supabaseAdmin } from './lib/supabase';
import { applyPlanOverride } from './lib/api-keys';

async function simulateRequest(email: string) {
  console.log(`--- Simulating request for ${email} ---`);
  
  try {
    // 1. Fetch user profile (Simulating what happens in the API route)
    console.log('1. Fetching profile from Supabase...');
    const startFetch = Date.now();
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, plan, email')
      .eq('email', email)
      .single();
    const endFetch = Date.now();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError.message);
      if (profileError.code === 'PGRST116') {
        console.log('Result: User profile not found in database.');
      }
      return;
    }
    
    console.log(`Profile found in ${endFetch - startFetch}ms:`, profile);
    
    // 2. Apply override
    console.log('2. Applying plan override...');
    const startOverride = Date.now();
    const finalPlan = await applyPlanOverride(profile.email, profile.plan || 'free', profile.id, 'id');
    const endOverride = Date.now();
    
    console.log(`Override applied in ${endOverride - startOverride}ms. Final Plan: ${finalPlan}`);
    
    // 3. Verify final plan in DB (to see if update actually stuck)
    const { data: updatedProfile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', profile.id)
      .single();
    
    console.log('3. Verification check - DB Plan is now:', updatedProfile?.plan);
    
    if (updatedProfile?.plan === 'pro') {
      console.log('Success: User is correctly recognized as PRO.');
    } else {
      console.error('Failure: User plan is still', updatedProfile?.plan);
    }

  } catch (err: any) {
    console.error('System error during simulation:', err.message);
  }
}

// Run for the specific user
simulateRequest('bakatsun09@gmail.com');
