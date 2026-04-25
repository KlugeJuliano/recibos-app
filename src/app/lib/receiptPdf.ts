import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export type ReceiptPdfRecord = {
  id?: string;
  tipo?: string;
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
  cidade?: string;
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

function receiptTitle(tipo?: string) {
  switch (tipo) {
    case 'aluguel':
      return 'RECIBO DE ALUGUEL';
    case 'servico':
      return 'RECIBO DE PRESTACAO DE SERVICO';
    case 'trabalhista':
      return 'RECIBO DE PAGAMENTO TRABALHISTA';
    case 'honorarios':
      return 'RECIBO DE HONORARIOS';
    case 'doacao':
      return 'RECIBO DE DOACAO';
    case 'emprestimo':
      return 'RECIBO DE EMPRESTIMO';
    case 'caucao':
      return 'RECIBO DE CAUCAO';
    case 'condominio':
      return 'RECIBO DE CONDOMINIO';
    case 'venda-imovel':
      return 'RECIBO DE SINAL DE IMOVEL';
    case 'juridico':
      return 'RECIBO DE ACORDO JURIDICO';
    case 'personalizado':
      return 'RECIBO PERSONALIZADO';
    default:
      return 'RECIBO DE PAGAMENTO';
  }
}

function receiptStatement({
  tipo,
  receiver,
  payer,
  amount,
  reference,
  date,
}: {
  tipo?: string;
  receiver: string;
  payer: string;
  amount: number;
  reference: string;
  date: string;
}) {
  const value = formatCurrency(amount);

  switch (tipo) {
    case 'aluguel':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente ao aluguel de ${reference}, vencido ou pago em ${date}.`;
    case 'servico':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente a prestacao de servicos de ${reference}, realizada em ${date}.`;
    case 'trabalhista':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente ao pagamento por atividade trabalhista/diaria de ${reference}, na data de ${date}.`;
    case 'honorarios':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente a honorarios profissionais por ${reference}, em ${date}.`;
    case 'doacao':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, a titulo de doacao para ${reference}, em ${date}.`;
    case 'emprestimo':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente a emprestimo relacionado a ${reference}, em ${date}.`;
    case 'caucao':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente a caucao de ${reference}, em ${date}.`;
    case 'condominio':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente a taxa condominial de ${reference}, em ${date}.`;
    case 'venda-imovel':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente a sinal, arras ou parte de pagamento do imovel ${reference}, em ${date}.`;
    case 'juridico':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente a acordo juridico sobre ${reference}, em ${date}.`;
    case 'personalizado':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente a ${reference}, em ${date}.`;
    default:
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value} referente a ${reference}, na data de ${date}.`;
  }
}

export function ReceiptPdf({ recibo }: { recibo: ReceiptPdfRecord }) {
  const amount = recibo.valorPagamento ?? recibo.valor ?? Number(recibo.dados?.valor ?? 0);
  const receiver = recibo.name ?? String(recibo.dados?.recebedor ?? 'Recebedor');
  const payer = String(recibo.dados?.pagador ?? recibo.loja ?? 'Pagador');
  const reference = recibo.funcaoDesempenhada ?? String(recibo.dados?.referente ?? 'servicos prestados');
  const id = recibo.id ?? crypto.randomUUID();
  const date = formatDate(recibo.dataRecibo);
  const cidade = recibo.cidade || 'Sao Paulo';

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.eyebrow }, 'ReciboPro'),
      React.createElement(Text, { style: styles.title }, receiptTitle(recibo.tipo)),
      React.createElement(Text, { style: styles.meta }, `Nº ${id}`),
      React.createElement(
        Text,
        { style: styles.body },
        receiptStatement({
          tipo: recibo.tipo,
          receiver,
          payer,
          amount,
          reference,
          date,
        })
      ),
      React.createElement(
        View,
        { style: styles.row },
        React.createElement(Text, null, `Setor: ${recibo.setor || '-'}`),
        React.createElement(Text, null, `Entrada: ${recibo.horaInicio || '-'} | Saida: ${recibo.horaFinal || '-'}`),
        React.createElement(Text, null, `Intervalo: ${recibo.horaIntervalo || '-'} | Retorno: ${recibo.horaVoltaIntervalo || '-'}`)
      ),
      React.createElement(Text, { style: styles.placeDate }, `${cidade}, ${date}.`),
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
