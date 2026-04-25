import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export type ReceiptPdfRecord = {
  id?: string;
  name?: string;
  valor?: number;
  valorPagamento?: number;
  funcaoDesempenhada?: string;
  setor?: string;
  dataRecibo?: string;
  horaInicio?: string;
  horaIntervalo?: string;
  horaVoltaIntervalo?: string;
  horaFinal?: string;
  loja?: string;
  dados?: Record<string, unknown>;
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Times-Roman',
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  eyebrow: {
    textAlign: 'center',
    fontSize: 9,
    letterSpacing: 3,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Times-Bold',
  },
  meta: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 10,
    color: '#64748b',
  },
  body: {
    marginTop: 42,
    fontSize: 14,
    lineHeight: 1.8,
  },
  row: {
    marginTop: 18,
    fontSize: 12,
    lineHeight: 1.5,
  },
  placeDate: {
    marginTop: 54,
    textAlign: 'right',
    fontSize: 12,
  },
  signatureRow: {
    marginTop: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 32,
  },
  signature: {
    width: '45%',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    textAlign: 'center',
    fontSize: 11,
  },
  footer: {
    position: 'absolute',
    left: 48,
    right: 48,
    bottom: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
  },
});

function formatCurrency(value?: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value ?? 0));
}

function formatDate(value?: string) {
  if (!value) {
    return new Date().toLocaleDateString('pt-BR');
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

export function ReceiptPdf({ recibo }: { recibo: ReceiptPdfRecord }) {
  const amount = recibo.valorPagamento ?? recibo.valor ?? Number(recibo.dados?.valor ?? 0);
  const receiver = recibo.name ?? String(recibo.dados?.recebedor ?? 'Recebedor');
  const payer = String(recibo.dados?.pagador ?? recibo.loja ?? 'Pagador');
  const reference = recibo.funcaoDesempenhada ?? String(recibo.dados?.referente ?? 'servicos prestados');
  const id = recibo.id ?? crypto.randomUUID();

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.eyebrow }, 'ReciboPro'),
      React.createElement(Text, { style: styles.title }, 'RECIBO DE PAGAMENTO'),
      React.createElement(Text, { style: styles.meta }, `Nº ${id}`),
      React.createElement(
        Text,
        { style: styles.body },
        `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${formatCurrency(amount)} referente a ${reference}, na data de ${formatDate(recibo.dataRecibo)}.`
      ),
      React.createElement(
        View,
        { style: styles.row },
        React.createElement(Text, null, `Setor: ${recibo.setor || '-'}`),
        React.createElement(Text, null, `Entrada: ${recibo.horaInicio || '-'} | Saida: ${recibo.horaFinal || '-'}`),
        React.createElement(Text, null, `Intervalo: ${recibo.horaIntervalo || '-'} | Retorno: ${recibo.horaVoltaIntervalo || '-'}`)
      ),
      React.createElement(Text, { style: styles.placeDate }, `Sao Paulo, ${formatDate(recibo.dataRecibo)}.`),
      React.createElement(
        View,
        { style: styles.signatureRow },
        React.createElement(Text, { style: styles.signature }, receiver),
        React.createElement(Text, { style: styles.signature }, `Responsavel ${recibo.setor || ''}`)
      ),
      React.createElement(Text, { style: styles.footer }, 'Gerado por ReciboPro')
    )
  );
}
