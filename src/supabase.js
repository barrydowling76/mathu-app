import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hdfvxjmnodwbbttejasl.supabase.co'
const supabaseKey = 'sb_publishable_nY8ZaTjSm8VG3gP9evmXLg_ISbP4hCO'

export const supabase = createClient(supabaseUrl, supabaseKey)
