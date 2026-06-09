import { Metadata } from 'next';
import Link from 'next/link';
import { receiptTypes, getReceiptType } from '@/app/lib/receiptTypes';
import { motion } from 'framer-motion';

type Props = {
  params: Promise<{ type: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const receipt = getReceiptType(type);
  
  return {
    title: `Recibo de ${receipt.name} Online Grátis | ReciboPro`,
    description: `Gere seu ${receipt.name.toLowerCase()} profissional em segundos. ${receipt.description} Baixe em PDF agora mesmo.`,
  };
}

export default async function ReceiptTypePage({ params }: Props) {
  const { type } = await params;
  const receipt = getReceiptType(type);

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Tipo de recibo não encontrado</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-950">
            <span className="h-6 w-6 rounded bg-blue-700" />
            ReciboPro
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-700">
            ← Voltar ao início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-6xl mb-6 block">{receipt.emoji}</span>
          <h1 className="text-4xl font-bold text-slate-950 sm:text-5xl">
            Gerador de Recibo de {receipt.name}
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
            Precisa de um comprovante de {receipt.name.toLowerCase()}? 
            Nosso modelo profissional garante clareza, validade e agilidade no processo de emissão.
          </p>
          
          <div className="mt-10">
            <Link 
              href={`/gerar?tipo=${receipt.id}`} 
              className="rounded-md bg-blue-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-800 active:scale-95 inline-block"
            >
              Criar meu Recibo de {receipt.name} agora
            </Link>
          </div>
        </motion.div>

        <section className="mt-20 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-8 border border-slate-200">
            <h2 className="text-xl font-bold mb-4">Por que usar este modelo?</h2>
            <ul className="space-y-3 text-slate-600">
              <li className="flex gap-2 items-start">
                <span className="text-blue-700 font-bold">✓</span> 
                Padronização profissional para {receipt.name.toLowerCase()}.
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-blue-700 font-bold">✓</span> 
                Campos essenciais para evitar dúvidas jurídicas.
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-blue-700 font-bold">✓</span> 
                Download imediato em formato PDF.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-blue-700 p-8 text-white">
            <h2 className="text-xl font-bold mb-4">Dica de Preenchimento</h2>
            <p className="text-blue-50 leading-relaxed">
              Ao emitir um recibo de {receipt.name.toLowerCase()}, certifique-se de que o valor esteja escrito por extenso e que a data de pagamento seja a data real da transação. Isso evita contestações futuras.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
