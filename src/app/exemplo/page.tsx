import Link from 'next/link';
import PrintButton from '@/components/PrintButton';

const example = {
  locador: 'Joao Silva',
  locatario: 'Maria Souza',
  valor: 'R$ 1.500,00',
  mes: 'Abril/2026',
  endereco: 'Rua das Flores, 123 - Sao Paulo/SP',
};

export const metadata = {
  title: 'Exemplo de Recibo de Aluguel | ReciboPro',
  description: 'Veja um exemplo de recibo profissional antes de criar o seu no ReciboPro.',
};

export default function ExemploPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-bold text-blue-700">ReciboPro</Link>
          <Link href="/login?signup=true" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Criar minha conta</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Exemplo publico</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Exemplo de recibo de aluguel</h1>
          <p className="mt-4 leading-7 text-slate-600">
            Veja como um recibo gerado pelo ReciboPro fica organizado para impressao ou PDF.
          </p>

          <div className="mt-8 rounded-md border border-slate-200 bg-white p-5">
            <dl className="grid gap-4 text-sm">
              {Object.entries(example).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[120px_1fr] gap-4">
                  <dt className="font-semibold capitalize text-slate-500">{key}</dt>
                  <dd className="text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PrintButton className="rounded-md bg-blue-700 px-5 py-3 font-semibold text-white">
              Baixar este exemplo em PDF
            </PrintButton>
            <Link href="/gerar?tipo=aluguel" className="rounded-md border border-blue-200 px-5 py-3 text-center font-semibold text-blue-700">
              Personalizar o meu
            </Link>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-center text-xs uppercase tracking-[0.22em] text-slate-400">ReciboPro</p>
          <h2 className="mt-4 text-center text-2xl font-bold">RECIBO DE ALUGUEL</h2>
          <p className="mt-8 font-serif text-lg leading-9">
            Eu, <strong>{example.locador}</strong>, declaro ter recebido de <strong>{example.locatario}</strong> a importancia de{' '}
            <strong>{example.valor}</strong>, referente ao aluguel do imovel situado em <strong>{example.endereco}</strong>, relativo ao mes de{' '}
            <strong>{example.mes}</strong>.
          </p>
          <p className="mt-10 text-right">Sao Paulo, 25/04/2026.</p>
          <div className="mt-20 border-t border-slate-400 pt-2 text-center text-sm">{example.locador}</div>
        </div>
      </section>
    </main>
  );
}
