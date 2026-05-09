import { supabase } from "./lib/supabase"

async function checkSchema() {
  const { data, error } = await supabase.from('facilities').select('*').limit(1)
  if (error) console.error(error)
  else console.log(Object.keys(data[0] || {}))
}

checkSchema()
