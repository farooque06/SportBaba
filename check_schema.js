import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data, error } = await supabase.from('facilities').select('*').limit(1)
  console.log('Data:', JSON.stringify(data, null, 2))
  console.log('Error:', error)
}
run()
