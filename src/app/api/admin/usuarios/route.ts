import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/utils/supabase/auth';
import { getUserProfile } from '@/utils/supabase/profile';
import { CompanyRepository } from '@/app/repositories/CompanyRepository';
import { toUserPayload } from '@/app/repositories/UserRepository';
import { getCompanyPlan, canAccessFeature } from '@/app/lib/planGuard';

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

  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data ?? []);
}

export async function POST(request: Request) {
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

  const profile = await getUserProfile(supabase, user.id);
  if (!profile?.companyId) {
    return Response.json({ error: 'Empresa não encontrada.' }, { status: 404 });
  }

  const plan = await getCompanyPlan(supabase, profile.companyId);
  
  // Bloquear criação de usuários no plano Free (apenas 1 usuário admin)
  if (plan === 'free') {
    const userCount = await CompanyRepository.countUsers(supabase, profile.companyId);
    if (userCount >= 1) {
      return Response.json({ 
        error: 'Plano Free permite apenas 1 usuário (admin). Faça upgrade para Pro ou Business para adicionar equipe.' 
      }, { status: 403 });
    }
  }

  const rawPayload = await request.json();
  const payload = toUserPayload(rawPayload);
  
  const { data, error } = await supabase
    .from('users')
    .insert(payload)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}