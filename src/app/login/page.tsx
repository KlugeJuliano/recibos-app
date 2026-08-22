'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { ensureUserProfile, getUserProfile } from '@/utils/supabase/profile';
import Link from 'next/link';
import Image from 'next/image';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const syncUserProfile = async (
    supabase: SupabaseClient,
    user: User | null,
    fallbackName?: string,
    role?: string,
    companyId?: string
  ) => {
    if (!user) {
      return;
    }

    await ensureUserProfile(supabase, user, {
      email,
      name: fallbackName,
      role,
      companyId,
    });
  };

  const ensureCompanyForSignup = async (
    supabase: SupabaseClient,
    user: User | null,
    name: string
  ) => {
    if (!user) {
      return undefined;
    }

    const existingProfile = await getUserProfile(supabase, user.id);
    if (existingProfile?.companyId) {
      return existingProfile.companyId;
    }

    const companyId = crypto.randomUUID();
    const { data, error: companyError } = await supabase
      .from('companies')
      .insert({
        id: companyId,
        name: name.trim(),
        cnpj: '',
      })
      .select('id')
      .single();

    if (companyError) {
      throw companyError;
    }

    return data.id as string;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password || (isSignUp && !companyName)) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('O serviço de autenticação está temporariamente indisponível. Por favor, tente novamente mais tarde.');
      return;
    }
    
    try {
      setIsLoading(true);
      const supabase = createClient();
      const normalizedCompanyName = companyName.trim();
      
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              company_name: normalizedCompanyName,
            }
          }
        });
        
        if (signUpError) {
          setError(signUpError.message);
        } else {
          if (data.session) {
            const companyId = await ensureCompanyForSignup(supabase, data.user, normalizedCompanyName);
            await syncUserProfile(supabase, data.user, normalizedCompanyName, 'admin', companyId);
            router.push('/dashboard');
            router.refresh();
          } else {
            setSuccess('Conta criada com sucesso! Verifique seu email para confirmar o cadastro e concluir o acesso da empresa.');
          }
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (loginError) {
          setError('Credenciais inválidas. Verifique seu email e senha.');
        } else {
          await syncUserProfile(supabase, data.user);
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f7f8f4] text-slate-950 lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Recibos App">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-400">
            <Image src="/invoice.svg" alt="" width={24} height={24} className="invert" />
          </span>
          <span className="text-lg font-semibold">Recibos App</span>
        </Link>

        <div className="max-w-xl">
          <p className="text-sm font-medium text-emerald-300">Organizacao que aparece no atendimento</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Entre para emitir recibos com mais consistencia e menos improviso.
          </h1>
          <p className="mt-5 leading-8 text-slate-300">
            Padronize dados da empresa, mantenha historico acessivel e reduza erros em rotinas de pagamento.
          </p>
          <div className="mt-8 grid gap-3">
            {['Cadastro guiado para empresas', 'Acesso seguro com Supabase Auth', 'Fluxo pronto para lojas e equipes'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-400">
          Crie a base hoje. Ganhe velocidade em cada recibo depois.
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950">
              <Image src="/invoice.svg" alt="Logo" width={24} height={24} className="invert" />
            </div>
            <span className="text-xl font-bold text-slate-950">Recibos App</span>
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              {isSignUp ? 'Novo cadastro' : 'Acesso ao painel'}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              {isSignUp ? 'Crie sua conta empresarial' : 'Bem-vindo de volta'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {isSignUp
                ? 'Configure o acesso inicial e comece a organizar recibos, lojas e equipe.'
                : 'Acesse seu painel para emitir, conferir e organizar recibos.'}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 rounded-md bg-slate-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
                setSuccess('');
              }}
              className={`rounded px-3 py-2 transition ${!isSignUp ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
                setSuccess('');
              }}
              className={`rounded px-3 py-2 transition ${isSignUp ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleAuth} className="mt-7 space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Nome da empresa</label>
                <input
                  type="text"
                  className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Minha Loja Ltda"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Email profissional</label>
              <input
                type="email"
                className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Senha</label>
              <input
                type="password"
                className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-md bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                isSignUp ? 'Criar conta e continuar' : 'Entrar no painel'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isSignUp ? 'Ja possui uma conta?' : 'Ainda nao tem uma conta?'}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
              }}
              className="ml-2 font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {isSignUp ? 'Fazer login' : 'Cadastrar empresa'}
            </button>
          </p>
          
          {!isSignUp && (
            <p className="mt-4 text-center text-sm text-slate-500">
              <Link href="/login/forgot-password" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Esqueceu a senha?
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
