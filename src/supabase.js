import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hdfvxjmnodwbbttejasl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkZnZ4am1ub2R3YmJ0dGVqYXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzMxMDYsImV4cCI6MjA4ODY0OTEwNn0.2fIq1ycY_3PuWJsQCut3BgswHkEzqswt44SIYh_iIVI'

export const supabase = createClient(supabaseUrl, supabaseKey)
