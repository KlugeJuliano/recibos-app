import { createClient } from '@/utils/supabase/server';

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

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await getAuthenticatedClient();

  if (!user) {
    return Response.json({ error: 'Nao autenticado.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('recibos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // Validação de propriedade
    .single();

  if (error) {
    return Response.json({ error: 'Recibo não encontrado ou acesso negado.' }, { status: 404 });
  }

  return Response.json(data);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await getAuthenticatedClient();

  if (!user) {
    return Response.json({ error: 'Nao autenticado.' }, { status: 401 });
  }

  const payload = await request.json();
  
  // No PUT, garantimos que apenas o dono pode atualizar
  const { data, error } = await supabase
    .from('recibos')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id) // Validação de propriedade
    .select()
    .single();

  if (error) {
    return Response.json({ error: 'Erro ao atualizar ou acesso negado.' }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await getAuthenticatedClient();

  if (!user) {
    return Response.json({ error: 'Nao autenticado.' }, { status: 401 });
  }

  const { error } = await supabase
    .from('recibos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Validação de propriedade

  if (error) {
    return Response.json({ error: 'Erro ao excluir ou acesso negado.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
