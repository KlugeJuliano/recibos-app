import { SupabaseClient } from '@supabase/supabase-js';
import { getUserProfile } from './profile';

export async function isAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(supabase, userId);
    return profile?.role === 'admin';
  } catch (error) {
    console.error('Erro ao verificar permissões de admin:', error);
    return false;
  }
}
