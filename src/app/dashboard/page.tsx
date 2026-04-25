import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

const metrics = [
  { label: 'Recibos emitidos', value: '0', detail: 'comece emitindo o primeiro hoje', tone: 'bg-emerald-500' },
  { label: 'Rotinas pendentes', value: '3', detail: 'cadastros que melhoram sua operacao', tone: 'bg-amber-400' },
  { label: 'Nivel de organizacao', value: 'Novo', detail: 'configure dados para ganhar velocidade', tone: 'bg-sky-500' },
];

const actions = [
  {
    href: '/dashboard/recibos',
    title: 'Emitir recibo',
    description: 'Crie um recibo com horario, funcao e valor calculado.',
    cta: 'Nova emissao',
  },
  {
    href: '/dashboard/relatorios',
    title: 'Conferir historico',
    description: 'Acompanhe recibos anteriores e mantenha controle financeiro.',
    cta: 'Abrir relatorios',
  },
  {
    href: '/dashboard/admin',
    title: 'Organizar equipe',
    description: 'Cadastre usuarios, lojas, setores e funcoes operacionais.',
    cta: 'Ir para administracao',
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] p-4 sm:p-6 lg:p-8">
      <section className="rounded-md bg-slate-950 px-6 py-8 text-white sm:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-emerald-300">Painel operacional</p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Transforme cada recibo em controle de gestao.</h1>
            <p className="mt-4 leading-7 text-slate-300">
              Priorize as acoes que mantem a equipe produtiva: emitir, conferir e padronizar dados.
            </p>
          </div>
          <Link
            href="/dashboard/recibos"
            className="rounded-md bg-emerald-400 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Emitir recibo agora
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-slate-200 bg-white p-5">
            <div className={`mb-5 h-1.5 w-16 rounded ${metric.tone}`} />
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <div className="mt-2 text-3xl font-bold text-slate-950">{metric.value}</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{metric.detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-md border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Proximas melhores acoes</h2>
              <p className="mt-1 text-sm text-slate-600">Fluxos que ajudam a criar habito e reter controle.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="block rounded-md border border-slate-200 p-5 transition hover:border-emerald-300 hover:bg-emerald-50/60"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-semibold text-slate-950">{action.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{action.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">{action.cta}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-md border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-950">Checklist de maturidade</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Quanto mais completo o cadastro, menor o atrito para emitir recibos consistentes.
          </p>
          <div className="mt-6 space-y-4">
            {['Empresa cadastrada', 'Lojas e setores revisados', 'Funcoes padronizadas', 'Equipe com acesso correto'].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-md bg-[#f7f8f4] p-4">
            <p className="text-sm leading-6 text-slate-600">
              Dica: mantenha nomes de cargos e setores consistentes para acelerar emissao e relatorios.
            </p>
          </div>
          <div className="mt-6">
            <LogoutButton variant="text" className="px-0 py-0 font-semibold" />
          </div>
        </aside>
      </section>
    </main>
  );
}
