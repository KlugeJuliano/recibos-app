import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Nao autenticado.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('recibos')
    .select('*')
    .order('dataRecibo', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const recibos = data ?? [];
  const valorTotal = recibos.reduce((total, recibo) => total + Number(recibo.valorPagamento ?? recibo.valor ?? 0), 0);

  return Response.json({
    totalRecibos: recibos.length,
    valorTotal,
    ticketMedio: recibos.length ? valorTotal / recibos.length : 0,
    recibos,
  });
}
