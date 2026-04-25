import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ensureUserProfile, getUserProfile } from '@/utils/supabase/profile';

const adminRoles = new Set(['gerente', 'admin', 'super_admin', 'super admin']);

function canAccessAdmin(role?: string | null) {
  return adminRoles.has(String(role ?? '').trim().toLowerCase());
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let profile = null;

  try {
    profile = await getUserProfile(supabase, user.id);

    if (!profile) {
      profile = await ensureUserProfile(supabase, user);
    }
  } catch (error) {
    console.error('Nao foi possivel carregar o perfil administrativo:', error);
  }

  if (!canAccessAdmin(profile?.role)) {
    redirect('/dashboard');
  }

  return children;
}
