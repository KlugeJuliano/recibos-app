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

  const { data, error } = await supabase.from('recibos').select('*').eq('id', id).single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
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
  const { data, error } = await supabase.from('recibos').update(payload).eq('id', id).select().single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await getAuthenticatedClient();

  if (!user) {
    return Response.json({ error: 'Nao autenticado.' }, { status: 401 });
  }

  const { error } = await supabase.from('recibos').delete().eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
