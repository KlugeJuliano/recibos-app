import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { receiptTypes } from '@/app/lib/receiptTypes';

export const metadata = {
  title: 'ReciboPro | Gerador de Recibos Online',
  description: 'Gere recibos profissionais online, visualize na hora e baixe em PDF.',
};

const heroBadges = ['100% online', 'PDF profissional', 'Sem instalacao'];

const features = [
  {
    title: 'Criacao instantanea',
    description: 'Gere recibos completos em poucos segundos com campos objetivos e preenchimento padronizado.',
  },
  {
    title: 'Historico organizado',
    description: 'Mantenha seus recibos salvos para consulta, conferencia e reemissao sempre que precisar.',
  },
  {
    title: 'Multi-lojas e equipes',
    description: 'Organize usuarios, lojas, setores e funcoes para uma rotina mais profissional.',
  },
  {
    title: 'Impressao e envio',
    description: 'Prepare recibos prontos para imprimir, salvar em PDF ou compartilhar com o cliente.',
  },
  {
    title: 'Controle financeiro',
    description: 'Acompanhe valores, datas e pessoas envolvidas para reduzir perda de informacao.',
  },
  {
    title: 'Acesso seguro',
    description: 'Autenticacao moderna e dados centralizados para proteger a operacao da sua empresa.',
  },
];

const reasons = [
  {
    title: 'Validade e clareza no comprovante',
    description: 'Recibos com informacoes essenciais bem organizadas: pagador, recebedor, valor, data e descricao.',
    tag: 'Documento claro',
  },
  {
    title: 'Preenchimento rapido e consistente',
    description: 'Padronize dados repetidos e diminua erros comuns em recibos feitos manualmente.',
    tag: 'Menos retrabalho',
  },
  {
    title: 'Gestao para quem emite com frequencia',
    description: 'Ideal para autonomos, prestadores, lojas e empresas que precisam consultar historico depois.',
    tag: 'Rotina profissional',
  },
  {
    title: 'Pronto para crescer',
    description: 'Comece simples e evolua para controle de lojas, setores, funcoes e usuarios.',
    tag: 'Base escalavel',
  },
];

const faqs = [
  {
    question: 'O sistema funciona no celular?',
    answer: 'Sim. O ReciboPro foi pensado para funcionar em computador, tablet e celular, sem instalacao.',
  },
  {
    question: 'Preciso instalar algum programa?',
    answer: 'Nao. O acesso e feito pelo navegador, com login seguro e dados salvos online.',
  },
  {
    question: 'Posso testar antes de usar no dia a dia?',
    answer: 'Sim. Voce pode acessar o gerador aberto e criar um recibo de exemplo antes de criar sua conta.',
  },
  {
    question: 'O recibo substitui nota fiscal?',
    answer: 'Nao. O recibo comprova pagamento, mas nao substitui documentos fiscais exigidos por lei.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="ReciboPro">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-700">
              <Image src="/invoice.svg" alt="" width={22} height={22} className="invert" />
            </span>
            <span className="text-lg font-bold text-slate-950">ReciboPro</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#como-funciona" className="hover:text-blue-700">Como funciona</a>
            <a href="#planos" className="hover:text-blue-700">Precos</a>
            <Link href="/exemplo" className="hover:text-blue-700">Exemplos</Link>
            <a href="#faq" className="hover:text-blue-700">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700">
              Entrar
            </Link>
            <Link href="/login?signup=true" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800">
              Comecar gratis
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 text-white">
          <div className="absolute inset-0 opacity-30">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,white,transparent_28%)]" />
          </div_

          <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_.95fr] lg:px-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <p className="inline-flex rounded-md border border-white/25 bg-white/10 px-3 py-1 text-sm font-semibold text-blue-50">
                Sistema digital para emissao de recibos
              </p>
              <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Recibos profissionais em segundos
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">
                Abandone recibos improvisados e organize sua rotina com um sistema online rapido, seguro e preparado para empresas, lojas e prestadores de servico.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/gerar" className="rounded-md bg-white px-6 py-3 text-center font-bold text-blue-800 shadow-xl shadow-blue-950/20 transition hover:bg-blue-50 active:scale-95">
                  Gerar recibo agora
                </Link>
                <Link href="/exemplo" className="rounded-md border border-white/30 px-6 py-3 text-center font-bold text-white transition hover:bg-white/10 active:scale-95">
                  Ver exemplo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {heroBadges.map((badge) => (
                  <span key={badge} className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-blue-50">
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-full bg-white/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-md border border-white/20 bg-white text-slate-950 shadow-2xl shadow-blue-950/40 transition-transform duration-300 hover:scale-[1.02]">
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-700">Novo recibo</p>
                      <p className="mt-1 text-xs text-slate-500">Pronto para baixar em PDF</p>
                    </div>
                    <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Online</span>
                  </div>
                </div>
                <div className="grid gap-4 p-5">
                  <Image src="/invoice.svg" alt="Previa de recibo profissional" width={774} height={419} priority fetchPriority="high" className="h-auto w-full rounded border border-slate-100 bg-white" />
                  <div className="grid grid-cols-3 gap-3">
                    {['R$ 350,00', 'PDF', 'Assinar'].map((item) => (
                      <div key={item} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm font-semibold text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="como-funciona" className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Como funciona</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Do formulario ao PDF em tres passos</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                ['1', 'Escolha o tipo', 'Selecione o modelo ideal para sua situacao.'],
                ['2', 'Preencha os dados', 'Informe pagador, recebedor, valor e referencia.'],
                ['3', 'Baixe o PDF', 'Visualize, imprima ou salve o recibo profissional.'],
              ].map(([number, title, description], idx) => (
                <motion.article 
                  key={title} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="rounded-md border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-5xl font-bold text-blue-100">{number}</div>
                  <h3 className="mt-4 text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-slate-600">{description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Tudo em um so lugar</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Funcionalidades pensadas para quem precisa emitir recibos com frequencia
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Do preenchimento ao historico, o ReciboPro reduz etapas manuais e deixa seu atendimento mais profissional.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <article key={feature.title} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-sm font-bold text-blue-700">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Tipos de recibo</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">O tipo certo para cada situacao</h2>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {receiptTypes.map((type) => (
                <Link
                  key={type.id}
                  href={`/gerar?tipo=${type.id}`}
                  className="rounded-md border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-2xl">{type.emoji}</span>
                    <span className={`rounded px-2 py-1 text-xs font-bold ${type.free ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {type.free ? 'Gratis' : 'Login'}
                    </span>
                  </div>
                  <h3 className="mt-4 font-bold text-slate-950">{type.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{type.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
            {[
              ['30 seg', 'para criar um recibo'],
              ['100%', 'online e responsivo'],
              ['PDF', 'pronto para enviar'],
              ['LGPD', 'rotina mais segura'],
            ].map(([value, label]) => (
              <div key={value} className="rounded-md border border-slate-200 bg-white p-6 text-center">
                <div className="text-3xl font-bold text-blue-700">{value}</div>
                <p className="mt-2 text-sm font-medium text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="beneficios" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Por que escolher</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Troque recibos manuais por uma experiencia mais rapida e confiavel
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                O ReciboPro ajuda sua empresa a parecer mais organizada para o cliente e mais previsivel para a equipe.
              </p>
            </div>

            <div className="space-y-4">
              {reasons.map((reason, index) => (
                <article key={reason.title} className="rounded-md border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-700 font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">{reason.tag}</span>
                      <h3 className="mt-1 text-lg font-bold text-slate-950">{reason.title}</h3>
                      <p className="mt-2 leading-7 text-slate-600">{reason.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
              <h3 className="text-2xl font-bold text-slate-400">Metodo tradicional</h3>
              <ul className="mt-6 space-y-3 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✕</span> Recibos espalhados em arquivos diferentes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✕</span> Dados repetidos digitados varias vezes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✕</span> Dificuldade para consultar historico
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✕</span> Aparencia menos profissional
                </li>
              </ul>
            </div>
            <div className="rounded-md border border-blue-300/30 bg-blue-600 p-6 shadow-xl shadow-blue-500/20 transition-transform hover:scale-[1.02]">
              <h3 className="text-2xl font-bold">Com ReciboPro</h3>
              <ul className="mt-6 space-y-3 text-blue-50">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-300">✓</span> Emissao rapida e padronizada
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-300">✓</span> Historico online e organizado
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-300">✓</span> PDF profissional pronto para compartilhar
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-300">✓</span> Controle para lojas, equipes e gestores
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="planos" className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Planos</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Comece simples e evolua conforme sua operacao cresce
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <article className="rounded-md border-2 border-blue-700 bg-white p-7 shadow-lg">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">Essencial</p>
                <h3 className="mt-3 text-3xl font-bold text-slate-950">Teste gratis</h3>
                <p className="mt-3 text-slate-600">Para validar o fluxo e comecar a emitir recibos profissionais.</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  <li>Recibos profissionais</li>
                  <li>Gerador online</li>
                  <li>Exportacao para PDF</li>
                  <li>Historico de emissoes</li>
                </ul>
                <Link href="/login?signup=true" className="mt-7 block rounded-md bg-blue-700 px-5 py-3 text-center font-bold text-white transition hover:bg-blue-800">
                  Comecar agora
                </Link>
              </article>

              <article className="rounded-md border border-slate-200 bg-white p-7">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Profissional</p>
                <h3 className="mt-3 text-3xl font-bold text-slate-950">Em breve</h3>
                <p className="mt-3 text-slate-600">Para equipes, multiplas lojas e rotinas com maior volume.</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  <li>Tudo do Essencial</li>
                  <li>Multiplos usuarios</li>
                  <li>Relatorios avancados</li>
                  <li>Suporte prioritario</li>
                </ul>
                <button className="mt-7 block w-full rounded-md bg-slate-200 px-5 py-3 text-center font-bold text-slate-500" type="button" disabled>
                  Em breve
                </button>
              </article>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Perguntas frequentes</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">Tire suas duvidas sobre o ReciboPro</h2>
            </div>
            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-md border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-950">{faq.question}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-blue-700 px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold">Pronto para emitir recibos com mais profissionalismo?</h2>
              <p className="mt-4 leading-7 text-blue-50">
                Crie sua conta, organize sua empresa e comece a emitir recibos em poucos minutos.
              </p>
            </div>
            <Link href="/gerar" className="rounded-md bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50">
              Gerar recibo agora
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 px-4 py-8 text-slate-300 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm md:flex-row">
          <p>ReciboPro - recibos profissionais online para empresas e prestadores.</p>
          <div className="flex gap-5">
            <Link href="/gerar" className="hover:text-white">Gerador gratis</Link>
            <Link href="/login" className="hover:text-white">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
