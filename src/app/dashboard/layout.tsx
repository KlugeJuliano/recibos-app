// app/dashboard/layout.tsx
import type { ReactNode } from 'react';
import { auth } from '@/app/auth';
import DashboardHeader from './DashboardHeader';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Get the current session (server-side)
  const session = await auth();
  const user = session?.user;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader 
        userName={user?.name || 'Usuário'} 
        userRole={user?.role || 'Convidado'} 
      />
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-1">
            <a 
              href="/dashboard" 
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium"
            >
              Dashboard
            </a>
            <a 
              href="/dashboard/recibos" 
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium"
            >
              Recibos
            </a>
            <a 
              href="/dashboard/relatorios" 
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium"
            >
              Relatórios
            </a>
            {user?.role === 'Gerente' && (
              <a 
                href="/dashboard/admin" 
                className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium"
              >
                Administração
              </a>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
