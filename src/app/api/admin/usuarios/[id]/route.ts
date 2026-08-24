import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/utils/supabase/auth';
import { getUserProfile } from '@/utils/supabase/profile';
import { CompanyRepository } from '@/app/repositories/CompanyRepository';
import { getCompanyPlan, canAccessFeature } from '@/app/lib/planGuard';

type Params = {
  params: Promise<{ id: string }>;
};

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await getAuthenticatedClient();

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

  // Bloquear atualização de usuário no plano Free (apenas 1 usuário admin)
  if (plan === 'free') {
    const userCount = await CompanyRepository.countUsers(supabase, profile.companyId);
    if (userCount >= 1) {
      return Response.json({ 
        error: 'Plano Free permite apenas 1 usuário (admin). Faça upgrade para Pro ou Business para adicionar equipe.' 
      }, { status: 403 });
    }
  }

  const payload = await request.json();
  
  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await getAuthenticatedClient();

  if (!user) {
    return Response.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  if (!(await isAdmin(supabase, user.id))) {
    return Response.json({ error: 'Acesso negado. Requer privilégios de administrador.' }, { status: 403 });
  }

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}