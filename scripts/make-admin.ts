import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function makeAdmin(email: string) {
  console.log(`Making ${email} an admin...`);

  try {
    // First, check if profile exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, email')
      .eq('email', email)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      process.exit(1);
    }

    if (!profile) {
      console.log(`No profile found for ${email}. Creating one...`);
      // If no profile, we need to get the user ID from Clerk or create with generated ID
      const customId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: customId,
          email,
          role: 'admin',
          plan: 'admin',
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        process.exit(1);
      }

      console.log(`✓ New admin profile created with ID: ${customId}`);
    } else {
      // Update existing profile to admin
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin', plan: 'admin' })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        process.exit(1);
      }

      console.log(`✓ ${email} (ID: ${profile.id}) is now an admin`);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

makeAdmin('christopherhauser1234@gmail.com');
