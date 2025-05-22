'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  // Simulação de verificação de autenticação (mais tarde trocaremos por Supabase)
  useEffect(() => {
    const isLoggedIn = true; // trocaremos por verificação real
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);
  
  

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Dashboard</h1>
        <p className="text-gray-600">
          Bem-vindo ao seu painel. Aqui você poderá visualizar e gerenciar seus recibos, relatórios e configurações da loja.
        </p>

        <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="bg-blue-100 rounded-lg p-4" onClick={()=>router.push('/dashboard/recibos')}>
            <h2 className="text-xl font-semibold text-blue-700">Emitir Recibo</h2>
            <p className="text-sm text-gray-700">Crie um novo recibo rapidamente.</p>
          </div>

          <div className="bg-green-100 rounded-lg p-4" onClick={()=> router.push('dashboard/relatorios')}>
            <h2 className="text-xl font-semibold text-green-700">Relatórios</h2>
            <p className="text-sm text-gray-700">Visualize e exporte recibos anteriores.</p>
          </div>

          <div className="bg-yellow-100 rounded-lg p-4" onClick={()=> router.push('dashboard/admin')}>
            <h2 className="text-xl font-semibold text-yellow-700">Administração</h2>
            <p className="text-sm text-gray-700">Gerencie usuários, lojas e permissões.</p>
          </div>

          <div className="bg-red-100 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-red-700" onClick={()=> router.push('login')}>Sair</h2>
            <p className="text-sm text-gray-700">Encerre sua sessão com segurança.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
