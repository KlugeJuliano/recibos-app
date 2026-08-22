import { createClient } from '@/utils/supabase/server';
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

  const { data, error } = await supabase
    .from('recibos')
    .select('*')
    .eq('userId', user.id)
    .order('dataRecibo', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data ?? []);
}

function calculateValorPagamento(recibo: any) {
  const {
    horaInicio,
    horaIntervalo,
    horaVoltaIntervalo,
    horaFinal,
    valor
  } = recibo;

  if (!horaInicio || !horaFinal) return 0;

  const toDate = (hora: string) => new Date(`1970-01-01T${hora}:00`);
  const inicio = toDate(horaInicio);
  const fim = toDate(horaFinal);

  let horasTrabalhadas = 0;

  if (horaIntervalo && horaVoltaIntervalo) {
    const inicioIntervalo = toDate(horaIntervalo);
    const voltaIntervalo = toDate(horaVoltaIntervalo);
    const antesAlmoco = (inicioIntervalo.getTime() - inicio.getTime()) / 1000 / 60 / 60;
    const depoisAlmoco = (fim.getTime() - voltaIntervalo.getTime()) / 1000 / 60 / 60;
    horasTrabalhadas = antesAlmoco + depoisAlmoco;
  } else {
    horasTrabalhadas = (fim.getTime() - inicio.getTime()) / 1000 / 60 / 60;
  }

  const valorPorHora = Number(valor) / 8;
  return Number((horasTrabalhadas * valorPorHora).toFixed(2));
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
  
  // Recalcular valor no servidor para evitar manipulação do cliente
  const valorPagamento = calculateValorPagamento(payload);

  let profile = null;
  try {
    profile = await getUserProfile(supabase, user.id);
  } catch (error) {
    console.error('Não foi possível carregar o perfil do usuário:', error);
  }
  const lojaId = payload.lojaId || payload.loja_id || profile?.lojaId;
  const companyId = profile?.companyId;

  let numero_sequencial = null;
  if (companyId) {
    const plan = await getCompanyPlan(supabase, companyId);
    if (canAccessFeature(plan, 'sequential_numbering')) {
      const { data } = await supabase.rpc('get_next_receipt_number', { company_id: companyId });
      numero_sequencial = data;
    }
  }

  const recibo = {
    ...payload,
    id: payload.id || crypto.randomUUID(),
    userId: user.id,
    lojaId,
    loja_id: lojaId,
    valorPagamento, // Sobrescreve com o valor calculado no servidor
    numero_sequencial,
  };

  if (!lojaId) {
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
