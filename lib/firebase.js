// ⚠️ DEPRECATED: This file is kept for backward compatibility during migration
// New code should use lib/supabase.ts instead

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Legacy Firebase compatibility exports (deprecated)
export const db = null // Use supabase instead
export const storage = null // Use supabase.storage instead
export const auth = null // Use supabase.auth instead
export const analytics = null // Use external analytics instead

// For migration compatibility - will be removed after full migration
export { supabase as firebase }
