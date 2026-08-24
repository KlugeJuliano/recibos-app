import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptPdf, type ReceiptPdfRecord } from '@/app/lib/receiptPdf';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
    .eq('id', id)
    .eq('user_id', user.id) // Validação de propriedade
    .single();

  if (error || !data) {
    return Response.json({ error: 'Recibo nao encontrado ou acesso negado.' }, { status: 404 });
  }

  const document = React.createElement(ReceiptPdf, { recibo: data as ReceiptPdfRecord }) as unknown as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(document);
  const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recibo-${id}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
