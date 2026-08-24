// app/dashboard/layout.tsx
import type { ReactNode } from 'react';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { ensureUserProfile, getUserProfile } from '@/utils/supabase/profile';
import DashboardHeader from './DashboardHeader';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let profile = null;

  try {
    profile = await getUserProfile(supabase, user.id);

    if (!profile) {
      profile = await ensureUserProfile(supabase, user);
    }
  } catch (error) {
    console.error('Não foi possível sincronizar o perfil do usuário:', error);
  }

  const userRole = profile?.role || 'Funcionário';
  const userName = profile?.name || user.user_metadata?.name || user.email || 'Usuário';
  const canAccessAdmin = ['gerente', 'admin', 'super_admin', 'super admin'].includes(
    userRole.trim().toLowerCase()
  );
  
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader 
        userName={userName}
        userRole={userRole} 
      />
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-1">
            <Link
              href="/dashboard" 
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/recibos" 
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium"
            >
              Recibos
            </Link>
            <Link
              href="/dashboard/relatorios" 
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium"
            >
              Relatórios
            </Link>
            {canAccessAdmin && (
              <Link
                href="/dashboard/admin" 
                className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium"
              >
                Administração
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
