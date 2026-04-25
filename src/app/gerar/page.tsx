'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getReceiptType, receiptTypes } from '@/app/lib/receiptTypes';

type FormState = {
  recebedor: string;
  pagador: string;
  valor: string;
  referente: string;
  cidade: string;
  data: string;
};

const initialForm: FormState = {
  recebedor: '',
  pagador: '',
  valor: '',
  referente: '',
  cidade: '',
  data: new Date().toISOString().split('T')[0],
};

function formatCurrency(value: string) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(number) ? number : 0);
}

function formatDate(value: string) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR') : 'data';
}

function getReceiptTitle(typeId: string) {
  switch (typeId) {
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

function getReferenceLabel(typeId: string) {
  switch (typeId) {
    case 'aluguel':
      return 'Imovel, periodo e vencimento';
    case 'servico':
      return 'Servico prestado';
    case 'trabalhista':
      return 'Atividade, diaria ou turno';
    case 'honorarios':
      return 'Servico profissional ou processo';
    case 'doacao':
      return 'Finalidade da doacao';
    case 'emprestimo':
      return 'Condicoes ou descricao do emprestimo';
    case 'caucao':
      return 'Contrato, imovel ou garantia';
    case 'condominio':
      return 'Unidade e mes de referencia';
    case 'venda-imovel':
      return 'Imovel, sinal ou arras';
    case 'juridico':
      return 'Acordo, processo ou objeto';
    default:
      return 'Referente a';
  }
}

function getPartyLabels(typeId: string) {
  switch (typeId) {
    case 'aluguel':
      return { receiver: 'Locador ou administradora', payer: 'Locatario' };
    case 'servico':
      return { receiver: 'Prestador do servico', payer: 'Contratante' };
    case 'doacao':
      return { receiver: 'Beneficiario', payer: 'Doador' };
    case 'emprestimo':
      return { receiver: 'Quem recebeu o valor', payer: 'Quem entregou o valor' };
    case 'condominio':
      return { receiver: 'Condominio ou administradora', payer: 'Morador ou proprietario' };
    case 'venda-imovel':
      return { receiver: 'Vendedor', payer: 'Comprador' };
    case 'juridico':
      return { receiver: 'Recebedor', payer: 'Pagador do acordo' };
    default:
      return { receiver: 'Nome do recebedor', payer: 'Nome do pagador' };
  }
}

function buildReceiptText(typeId: string, form: FormState) {
  const receiver = form.recebedor || 'Nome do recebedor';
  const payer = form.pagador || 'Nome do pagador';
  const value = formatCurrency(form.valor);
  const reference = form.referente || 'descricao do pagamento';
  const date = formatDate(form.data);

  switch (typeId) {
    case 'aluguel':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente ao aluguel de ${reference}, pago em ${date}.`;
    case 'servico':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente a prestacao de servicos de ${reference}, realizada em ${date}.`;
    case 'trabalhista':
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente ao pagamento por atividade trabalhista, diaria ou turno de ${reference}, em ${date}.`;
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
      return `Eu, ${receiver}, declaro que recebi de ${payer} a quantia de ${value}, referente a ${reference}.`;
  }
}

function FreeGenerator() {
  const searchParams = useSearchParams();
  const receiptRef = useRef<HTMLDivElement>(null);
  const selectedType = getReceiptType(searchParams.get('tipo'));
  const [activeType, setActiveType] = useState(selectedType.id);
  const [form, setForm] = useState<FormState>(initialForm);
  const [message, setMessage] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const currentType = useMemo(() => getReceiptType(activeType), [activeType]);
  const isLocked = !currentType.free;
  const partyLabels = getPartyLabels(currentType.id);
  const receiptTitle = getReceiptTitle(currentType.id);
  const receiptText = buildReceiptText(currentType.id, form);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage('');
  };

  const validateRequiredFields = () => {
    if (isLocked) {
      setMessage('Crie uma conta gratuita para acessar este tipo de recibo.');
      return false;
    }

    if (!form.recebedor || !form.pagador || !form.valor || !form.referente) {
      setMessage('Preencha recebedor, pagador, valor e referente para gerar o recibo.');
      return false;
    }

    return true;
  };

  const handlePrint = () => {
    if (!validateRequiredFields() || !receiptRef.current) {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${receiptTitle}</title>
          <style>
            body { margin: 0; padding: 32px; background: #fff; color: #0f172a; font-family: Georgia, 'Times New Roman', serif; }
            .receipt { max-width: 720px; margin: 0 auto; }
            @page { size: A4; margin: 18mm; }
          </style>
        </head>
        <body><main class="receipt">${receiptRef.current.innerHTML}</main></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPdf = async () => {
    if (!validateRequiredFields()) {
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const response = await fetch('/api/recibos/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: currentType.id,
          name: form.recebedor,
          loja: form.pagador,
          valorPagamento: Number(form.valor),
          funcaoDesempenhada: form.referente,
          dataRecibo: form.data,
          cidade: form.cidade,
          setor: currentType.name,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Nao foi possivel gerar o PDF.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentType.id}-recibo.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel gerar o PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-bold text-blue-700">ReciboPro</Link>
          <Link href="/login?signup=true" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Criar conta gratis</Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr_380px] lg:px-8">
        <aside className="rounded-md border border-slate-200 bg-white p-4">
          <h1 className="text-lg font-bold">Tipo de recibo</h1>
          <div className="mt-4 space-y-2">
            {receiptTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setActiveType(type.id);
                  setForm(initialForm);
                  setMessage(type.free ? '' : 'Este tipo requer login para emissao completa.');
                }}
                className={`w-full rounded-md border px-3 py-3 text-left text-sm transition ${
                  activeType === type.id
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white hover:border-blue-200'
                }`}
              >
                <span className="mr-2">{type.emoji}</span>
                {type.name}
                <span className={`ml-2 rounded px-2 py-0.5 text-xs ${type.free ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {type.free ? 'Gratis' : 'Login'}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-md border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Gerador gratuito</p>
          <h2 className="mt-2 text-2xl font-bold">Recibo de {currentType.name}</h2>
          <p className="mt-2 text-sm text-slate-600">{currentType.description}</p>

          {message && (
            <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {message}
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              {partyLabels.receiver}
              <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" value={form.recebedor} onChange={(e) => updateField('recebedor', e.target.value)} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              {partyLabels.payer}
              <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" value={form.pagador} onChange={(e) => updateField('pagador', e.target.value)} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Valor
              <input type="number" min="0" step="0.01" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" value={form.valor} onChange={(e) => updateField('valor', e.target.value)} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Data
              <input type="date" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" value={form.data} onChange={(e) => updateField('data', e.target.value)} />
            </label>
            <label className="text-sm font-medium text-slate-700 md:col-span-2">
              {getReferenceLabel(currentType.id)}
              <textarea className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2" value={form.referente} onChange={(e) => updateField('referente', e.target.value)} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Cidade
              <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" value={form.cidade} onChange={(e) => updateField('cidade', e.target.value)} />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handlePrint} className="rounded-md border border-blue-200 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50">
              Imprimir
            </button>
            <button type="button" onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="rounded-md bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70">
              {isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF'}
            </button>
            {isLocked && (
              <Link href="/login?signup=true" className="rounded-md border border-blue-200 px-5 py-3 text-center font-semibold text-blue-700">
                Acessar todos os tipos
              </Link>
            )}
          </div>
        </section>

        <aside className="rounded-md border border-slate-200 bg-white p-5 print:border-0 print:shadow-none">
          <div ref={receiptRef} className="mx-auto min-h-[520px] rounded border border-slate-200 bg-white p-6 font-serif text-slate-900 shadow-sm">
            <p className="text-center text-xs uppercase tracking-[0.22em] text-slate-400">ReciboPro</p>
            <h2 className="mt-4 text-center text-2xl font-bold">{receiptTitle}</h2>
            <p className="mt-8 leading-8">
              {receiptText}
            </p>
            <p className="mt-8 text-right">
              {form.cidade || 'Cidade'}, {formatDate(form.data)}.
            </p>
            <div className="mt-20 border-t border-slate-400 pt-2 text-center text-sm">
              {form.recebedor || 'Assinatura do recebedor'}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function GerarPage() {
  return (
    <Suspense fallback={null}>
      <FreeGenerator />
    </Suspense>
  );
}
