
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Need service role to bypass RLS

const supabase = createClient(supabaseUrl, supabaseKey);

async function upgradeUser() {
  const userId = 'user_383EKUxwmKLc3SRcbZlT2l26scV';
  console.log(`Upgrading user ${userId} to pro...`);
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ plan: 'pro', subscription_status: 'active' })
    .eq('id', userId);
    
  if (error) {
    console.error('Error upgrading user:', error);
  } else {
    console.log('User upgraded successfully!');
  }
}

upgradeUser();
