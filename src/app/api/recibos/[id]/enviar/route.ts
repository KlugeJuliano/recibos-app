import { createClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/utils/supabase/profile';
import { CompanyRepository } from '@/app/repositories/CompanyRepository';
import { getCompanyPlan, canAccessFeature } from '@/app/lib/planGuard';
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptPdf, type ReceiptPdfRecord } from '@/app/lib/receiptPdf';
import React from 'react';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY não configurada');
  }
  return new Resend(apiKey);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Não autenticado.' }, { status: 401 });

  const profile = await getUserProfile(supabase, user.id);
  if (!profile?.companyId) return Response.json({ error: 'Empresa não encontrada.' }, { status: 404 });

  const plan = await getCompanyPlan(supabase, profile.companyId);
  if (!canAccessFeature(plan, 'auto_send')) {
    return Response.json({ error: 'Envio automático disponível apenas no Pro/Business.' }, { status: 403 });
  }

  const { id } = await params;
  const { email: toEmail } = await request.json();
  if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
    return Response.json({ error: 'Email destinatário inválido.' }, { status: 400 });
  }

  // Buscar recibo
  const { data: recibo, error } = await supabase
    .from('recibos')
    .select('*')
    .eq('id', id)
    .eq('userId', user.id)
    .single();
  if (error || !recibo) return Response.json({ error: 'Recibo não encontrado.' }, { status: 404 });

  // Buscar logo da empresa
  const company = await CompanyRepository.findById(supabase, profile.companyId);
  const logo_url = company?.logo_url;
  const company_name = company?.name || 'ReciboPro';

  // Gerar PDF
  const document = React.createElement(ReceiptPdf, {
    recibo: { ...recibo, id, logo_url, company_name },
  }) as unknown as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(document);
  const pdfBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  // Enviar via Resend
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'ReciboPro <onboarding@resend.dev>';
  
  const resend = getResendClient();
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    subject: `Seu recibo - ${company_name}`,
    html: `<p>Olá,<br/><br/>Segue em anexo o recibo referente a <strong>${recibo.funcaoDesempenhada || 'serviços prestados'}</strong>.</p>`,
    attachments: [{
      filename: `recibo-${id}.pdf`,
      content: Buffer.from(pdfBuffer),
    }],
  });

  if (sendError) {
    console.error('Resend error:', sendError);
    return Response.json({ error: 'Falha ao enviar e-mail.' }, { status: 500 });
  }

  return Response.json({ success: true });
}