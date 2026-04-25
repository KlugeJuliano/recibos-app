import { createClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/utils/supabase/profile';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('recibos')
    .select('*')
    .order('dataRecibo', { ascending: false });

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

  const payload = await request.json();
  let profile = null;

  try {
    profile = await getUserProfile(supabase, user.id);
  } catch (error) {
    console.error('Não foi possível carregar o perfil do usuário:', error);
  }
  const recibo = {
    ...payload,
    id: payload.id || crypto.randomUUID(),
    userId: user.id,
    lojaId: payload.lojaId || profile?.lojaId,
  };

  if (!recibo.lojaId) {
    return Response.json(
      { error: 'Seu usuário precisa estar vinculado a uma loja para emitir recibos.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('recibos')
    .insert(recibo)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
