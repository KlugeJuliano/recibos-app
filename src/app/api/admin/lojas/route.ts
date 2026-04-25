import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/utils/supabase/auth';

export async function GET() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  if (!(await isAdmin(supabase, user.id))) {
    return Response.json({ error: 'Acesso negado. Requer privilégios de administrador.' }, { status: 403 });
  }

  const { data, error } = await supabase.from('stores').select('*');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data ?? []);
}
