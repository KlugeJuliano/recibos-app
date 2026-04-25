'use client';

import { Suspense, useMemo, useState } from 'react';
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

function FreeGenerator() {
  const searchParams = useSearchParams();
  const selectedType = getReceiptType(searchParams.get('tipo'));
  const [activeType, setActiveType] = useState(selectedType.id);
  const [form, setForm] = useState<FormState>(initialForm);
  const [message, setMessage] = useState('');

  const currentType = useMemo(() => getReceiptType(activeType), [activeType]);
  const isLocked = !currentType.free;

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage('');
  };

  const handlePrint = () => {
    if (isLocked) {
      setMessage('Crie uma conta gratuita para acessar este tipo de recibo.');
      return;
    }

    if (!form.recebedor || !form.pagador || !form.valor || !form.referente) {
      setMessage('Preencha recebedor, pagador, valor e referente para gerar o recibo.');
      return;
    }

    window.print();
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
              Nome do recebedor
              <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" value={form.recebedor} onChange={(e) => updateField('recebedor', e.target.value)} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Nome do pagador
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
              Referente a
              <textarea className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2" value={form.referente} onChange={(e) => updateField('referente', e.target.value)} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Cidade
              <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" value={form.cidade} onChange={(e) => updateField('cidade', e.target.value)} />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handlePrint} className="rounded-md bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">
              Baixar PDF
            </button>
            {isLocked && (
              <Link href="/login?signup=true" className="rounded-md border border-blue-200 px-5 py-3 text-center font-semibold text-blue-700">
                Acessar todos os tipos
              </Link>
            )}
          </div>
        </section>

        <aside className="rounded-md border border-slate-200 bg-white p-5 print:border-0 print:shadow-none">
          <div className="mx-auto min-h-[520px] rounded border border-slate-200 bg-white p-6 font-serif text-slate-900 shadow-sm">
            <p className="text-center text-xs uppercase tracking-[0.22em] text-slate-400">ReciboPro</p>
            <h2 className="mt-4 text-center text-2xl font-bold">RECIBO</h2>
            <p className="mt-8 leading-8">
              Eu, <strong>{form.recebedor || 'Nome do recebedor'}</strong>, declaro que recebi de{' '}
              <strong>{form.pagador || 'Nome do pagador'}</strong> a quantia de{' '}
              <strong>{formatCurrency(form.valor)}</strong>, referente a{' '}
              <strong>{form.referente || 'descricao do pagamento'}</strong>.
            </p>
            <p className="mt-8 text-right">
              {form.cidade || 'Cidade'}, {form.data ? new Date(`${form.data}T00:00:00`).toLocaleDateString('pt-BR') : 'data'}.
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
