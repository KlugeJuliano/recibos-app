'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserManagement from './UserManagement';
import StoreManagement from './StoreManagement';
import SettingsManagement from './SettingsManagement';

type AdminTab = 'users' | 'stores' | 'settings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if user has admin access
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    // Redirect if not authenticated or not an admin
    if (status === 'unauthenticated' || session?.user.role !== 'Gerente') {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [session, status, router]);

  // Handle tab change
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  // Render unauthorized state
  if (session?.user.role !== 'Gerente') {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-red-800">Acesso Restrito</h2>
        <p className="mt-2 text-sm text-red-700">
          Você não tem permissão para acessar esta área. Este incidente será registrado.
        </p>
      </div>
    );
  }

  return (
    <main className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
        <p className="text-gray-600">
          Gerencie usuários, lojas e configurações do sistema.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => handleTabChange('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Usuários
          </button>
          <button
            onClick={() => handleTabChange('stores')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stores'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Lojas
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Configurações
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'stores' && <StoreManagement />}
        {activeTab === 'settings' && <SettingsManagement />}
      </div>
    </main>
  );
}
