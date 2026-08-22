import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/utils/supabase/auth';
import { getUserProfile } from '@/utils/supabase/profile';
import { CompanyRepository } from '@/app/repositories/CompanyRepository';
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

  const { data, error } = await supabase.from('stores').select('*');

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
  
  // Bloquear criação de lojas no plano Free (apenas 1 loja)
  if (plan === 'free') {
    const storeCount = await CompanyRepository.countStores(supabase, profile.companyId);
    if (storeCount >= 1) {
      return Response.json({ 
        error: 'Plano Free permite apenas 1 loja. Faça upgrade para Pro ou Business para múltiplas lojas.' 
      }, { status: 403 });
    }
  }

  const payload = await request.json();
  
  const { data, error } = await supabase
    .from('stores')
    .insert(payload)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}