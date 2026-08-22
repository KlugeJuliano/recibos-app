import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptPdf, type ReceiptPdfRecord } from '@/app/lib/receiptPdf';
import { createClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/utils/supabase/profile';
import { CompanyRepository } from '@/app/repositories/CompanyRepository';

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

  // Buscar logo e nome da empresa
  let logo_url: string | undefined;
  let company_name: string | undefined;
  
  const profile = await getUserProfile(supabase, user.id);
  if (profile?.companyId) {
    const company = await CompanyRepository.findById(supabase, profile.companyId);
    if (company?.logo_url) logo_url = company.logo_url;
    if (company?.name) company_name = company.name;
  }

  const document = React.createElement(ReceiptPdf, {
    recibo: {
      ...recibo,
      id,
      logo_url,
      company_name,
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
