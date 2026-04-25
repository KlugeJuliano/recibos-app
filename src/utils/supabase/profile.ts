import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Users } from '@/app/types'

type ProfileSeed = {
  email?: string
  name?: string
}

function getDefaultProfile(user: User, seed?: ProfileSeed): Users {
  return {
    id: user.id,
    email: user.email ?? seed?.email ?? '',
    name:
      seed?.name ??
      user.user_metadata?.name ??
      user.user_metadata?.company_name ??
      user.email?.split('@')[0] ??
      'Usuário',
    role: 'Funcionário',
    companyId: '',
    lojaId: '',
  }
}

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Users | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
  seed?: ProfileSeed
): Promise<Users> {
  const existingProfile = await getUserProfile(supabase, user.id)

  if (existingProfile) {
    return existingProfile
  }

  const profile = getDefaultProfile(user, seed)
  const { data, error } = await supabase
    .from('users')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
