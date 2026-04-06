import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function test() {
  const { error: insertErr } = await supabaseAdmin.from('usage_logs').insert({
    api_key_id: 'b54f0e02-89e5-464f-98ed-e524824ffe29',
    user_id: 'test',
    model_id: 'test',
    type: 'chat',
    timestamp: new Date().toISOString()
  });
  console.log("Insert without tokens error:", insertErr ? insertErr : "Success!");
}
test();
