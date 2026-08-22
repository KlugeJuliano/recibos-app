'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    const type = searchParams.get('type');
    
    if (!code || type !== 'recovery') {
      setIsValidToken(false);
      setError('Link de recuperação inválido ou expirado. Solicite um novo link.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidToken) return;

    if (!password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('O serviço de autenticação está temporariamente indisponível. Por favor, tente novamente mais tarde.');
      return;
    }

    try {
      setIsLoading(true);
      const supabase = createClient();
      
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess('Senha alterada com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          router.push('/login');
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
      console.error('Update password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
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
            <p className="text-sm font-medium text-emerald-300">Link inválido</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Link de recuperação inválido
            </h1>
            <p className="mt-5 leading-8 text-slate-300">
              Este link expirou ou é inválido. Solicite um novo link de recuperação.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950">
                <Image src="/invoice.svg" alt="Logo" width={24} height={24} className="invert" />
              </div>
              <span className="text-xl font-bold text-slate-950">Recibos App</span>
            </Link>

            <div className="text-center">
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Este link expirou ou é inválido.
              </p>
              <Link
                href="/login/forgot-password"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Solicitar novo link
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

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
          <p className="text-sm font-medium text-emerald-300">Nova senha</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Crie sua nova senha
          </h1>
          <p className="mt-5 leading-8 text-slate-300">
            Sua nova senha deve ser diferente das anteriores e ter pelo menos 6 caracteres.
          </p>
        </div>

        <p className="text-sm text-slate-400">
          O link expira em 1 hora.
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
              Redefinir senha
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Nova senha
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Digite sua nova senha abaixo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nova senha</label>
              <input
                type="password"
                className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Confirmar nova senha</label>
              <input
                type="password"
                className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                required
                autoComplete="new-password"
                disabled={isLoading}
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
                'Salvar nova senha'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Voltar para o login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}