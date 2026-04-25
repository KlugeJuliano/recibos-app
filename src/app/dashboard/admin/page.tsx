import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/utils/supabase/profile';
import AdminPanel from './AdminPanel';

export default async function AdminPage() {
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
  } catch (error) {
    console.error('Não foi possível carregar o perfil administrativo:', error);
  }

  if (profile?.role !== 'Gerente') {
    redirect('/dashboard');
  }

  return <AdminPanel />;
}
