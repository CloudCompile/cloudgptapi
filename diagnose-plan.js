const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/"/g,''),
  process.env.SUPABASE_SERVICE_ROLE_KEY.replace(/"/g,'')
);

async function diagnose() {
  // 1. Find the API key
  const { data: keyData, error: keyErr } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', 'vtai_ad26c5b107ca47ea9cc9568094a60297')
    .maybeSingle();
    
  if (keyErr) { console.error('Key lookup error:', keyErr); return; }
  if (!keyData) { console.error('Key not found!'); return; }
  
  console.log('=== API KEY ===');
  console.log('user_id:', keyData.user_id);
  console.log('name:', keyData.name);
  console.log('key plan column:', keyData.plan || '(not set)');
  
  // 2. Find the profile
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', keyData.user_id)
    .maybeSingle();
    
  if (profErr) { console.error('Profile error:', profErr); }
  
  if (!profile) {
    console.log('=== PROFILE: NOT FOUND for user_id:', keyData.user_id, '===');
    const { data: allProfiles } = await supabase.from('profiles').select('id, email, plan').limit(20);
    console.log('All profiles (first 20):');
    if (allProfiles) {
      allProfiles.forEach(function(p) { console.log('  ', p.id, '|', p.email, '|', p.plan); });
    }
  } else {
    console.log('=== PROFILE ===');
    console.log('id:', profile.id);
    console.log('email:', profile.email);
    console.log('plan:', profile.plan);
    console.log('role:', profile.role);
  }
  
  // 3. Check subscriptions
  const { data: subs } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', keyData.user_id);
    
  console.log('=== SUBSCRIPTIONS ===');
  if (!subs || subs.length === 0) {
    console.log('No subscriptions found for user_id:', keyData.user_id);
  } else {
    subs.forEach(function(s) {
      console.log('  sub_id:', s.stripe_subscription_id);
      console.log('  status:', s.status);
      console.log('  price_id:', s.stripe_price_id);
      console.log('  period_end:', s.stripe_current_period_end);
    });
  }
}

diagnose().catch(function(e) { console.error(e); });
