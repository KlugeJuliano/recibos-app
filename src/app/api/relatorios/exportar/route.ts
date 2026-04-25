import puppeteer from 'puppeteer';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ReciboRow = {
  id: string;
  name?: string;
  valor?: number;
  valorPagamento?: number;
  dataRecibo?: string;
  funcaoDesempenhada?: string;
};

function currency(value?: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value ?? 0));
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildReportHtml(recibos: ReciboRow[]) {
  const total = recibos.reduce((sum, recibo) => sum + Number(recibo.valorPagamento ?? recibo.valor ?? 0), 0);
  const rows = recibos
    .map(
      (recibo) => `
        <tr>
          <td>${escapeHtml(recibo.id)}</td>
          <td>${escapeHtml(recibo.name)}</td>
          <td>${escapeHtml(recibo.funcaoDesempenhada)}</td>
          <td>${escapeHtml(recibo.dataRecibo)}</td>
          <td class="right">${currency(recibo.valorPagamento ?? recibo.valor)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; padding: 32px; }
          h1 { margin: 0; color: #185FA5; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0; }
          .card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; }
          .label { color: #64748b; font-size: 12px; text-transform: uppercase; }
          .value { margin-top: 6px; font-size: 22px; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 12px; }
          th, td { border-bottom: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background: #f8fafc; color: #334155; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <h1>Relatorio de Recibos</h1>
        <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <section class="summary">
          <div class="card"><div class="label">Total de recibos</div><div class="value">${recibos.length}</div></div>
          <div class="card"><div class="label">Valor total</div><div class="value">${currency(total)}</div></div>
          <div class="card"><div class="label">Ticket medio</div><div class="value">${currency(recibos.length ? total / recibos.length : 0)}</div></div>
        </section>
        <table>
          <thead>
            <tr><th>ID</th><th>Recebedor</th><th>Referencia</th><th>Data</th><th class="right">Valor</th></tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="5">Nenhum recibo encontrado.</td></tr>'}</tbody>
        </table>
      </body>
    </html>
  `;
}

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get('format') ?? 'pdf';
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
    .eq('userId', user.id) // Validação de propriedade
    .order('dataRecibo', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const recibos = (data ?? []) as ReciboRow[];

  if (format === 'csv' || format === 'excel') {
    const csv = [
      'id,recebedor,referencia,data,valor',
      ...recibos.map((recibo) =>
        [
          recibo.id,
          recibo.name ?? '',
          recibo.funcaoDesempenhada ?? '',
          recibo.dataRecibo ?? '',
          String(recibo.valorPagamento ?? recibo.valor ?? 0),
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="relatorio-recibos.csv"',
      },
    });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(buildReportHtml(recibos), { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    const body = new ArrayBuffer(pdf.byteLength);
    new Uint8Array(body).set(pdf);

    return new Response(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="relatorio-recibos.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } finally {
    await browser.close();
  }
}
