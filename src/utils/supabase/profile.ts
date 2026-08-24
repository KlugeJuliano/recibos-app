import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Users } from '@/app/types'

type ProfileSeed = {
  email?: string
  name?: string
  role?: string
  companyId?: string
  lojaId?: string
  is_super_admin?: boolean
}

type UserProfileRow = {
  id: string
  email?: string | null
  name?: string | null
  role?: string | null
  company_id?: string | null
  loja_id?: string | null
  companyId?: string | null
  lojaId?: string | null
  is_super_admin?: boolean | null
}

function toUsers(row: UserProfileRow): Users {
  return {
    id: row.id,
    email: row.email ?? '',
    name: row.name ?? 'Usuário',
    role: row.role ?? 'funcionario',
    companyId: row.company_id ?? row.companyId ?? '',
    lojaId: row.loja_id ?? row.lojaId ?? '',
    is_super_admin: row.is_super_admin ?? false,
  }
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
    role: seed?.role ?? 'funcionario',
    companyId: seed?.companyId ?? '',
    lojaId: seed?.lojaId ?? '',
    is_super_admin: seed?.is_super_admin ?? false,
  }
}

function toUserProfilePayload(profile: Users) {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    company_id: profile.companyId || null,
    loja_id: profile.lojaId || null,
    is_super_admin: profile.is_super_admin ?? false,
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

  return data ? toUsers(data as UserProfileRow) : null
}

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
  seed?: ProfileSeed
): Promise<Users> {
  const existingProfile = await getUserProfile(supabase, user.id)

  if (existingProfile) {
    const nextProfile: Users = {
      ...existingProfile,
      email: existingProfile.email || seed?.email || user.email || '',
      name: existingProfile.name || seed?.name || user.user_metadata?.name || user.user_metadata?.company_name || 'Usuário',
      role: ['Funcionário', 'funcionario'].includes(existingProfile.role) && seed?.role ? seed.role : existingProfile.role,
      companyId: existingProfile.companyId || seed?.companyId || '',
      lojaId: existingProfile.lojaId || seed?.lojaId || '',
    }

    const shouldUpdate =
      nextProfile.email !== existingProfile.email ||
      nextProfile.name !== existingProfile.name ||
      nextProfile.role !== existingProfile.role ||
      nextProfile.companyId !== existingProfile.companyId ||
      nextProfile.lojaId !== existingProfile.lojaId

    if (!shouldUpdate) {
      return existingProfile
    }

    const { data, error } = await supabase
      .from('users')
      .update(toUserProfilePayload(nextProfile))
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return toUsers(data as UserProfileRow)
  }

  const profile = getDefaultProfile(user, seed)
  const { data, error } = await supabase
    .from('users')
    .upsert(toUserProfilePayload(profile), { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    throw error
  }

  return toUsers(data as UserProfileRow)
}
