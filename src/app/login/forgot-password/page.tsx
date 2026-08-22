'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/utils/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Digite seu email.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('O serviço de autenticação está temporariamente indisponível. Por favor, tente novamente mais tarde.');
      return;
    }

    try {
      setIsLoading(true);
      const supabase = createClient();
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess('Verifique seu email para redefinir a senha. O link expira em 1 hora.');
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
      console.error('Reset password error:', err);
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
          <p className="text-sm font-medium text-emerald-300">Recuperação de senha</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Recupere o acesso à sua conta
          </h1>
          <p className="mt-5 leading-8 text-slate-300">
            Digite seu email e enviaremos um link para você criar uma nova senha.
          </p>
        </div>

        <p className="text-sm text-slate-400">
          O link de recuperação expira em 1 hora.
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
              Recuperar senha
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Esqueceu a senha?
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Digite seu email profissional para receber as instruções de recuperação.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email profissional</label>
              <input
                type="email"
                className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
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
                'Enviar link de recuperação'
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