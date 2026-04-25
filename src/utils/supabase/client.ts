'use client'

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export const createClient = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase não está configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente do deploy.'
    )
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}
