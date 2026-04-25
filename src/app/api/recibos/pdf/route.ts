import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptPdf, type ReceiptPdfRecord } from '@/app/lib/receiptPdf';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const recibo = (await request.json()) as ReceiptPdfRecord;
  const id = recibo.id || crypto.randomUUID();
  const document = React.createElement(ReceiptPdf, {
    recibo: {
      ...recibo,
      id,
    },
  }) as unknown as Parameters<typeof renderToBuffer>[0];
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
