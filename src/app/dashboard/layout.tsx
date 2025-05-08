// app/dashboard/layout.tsx
import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Aqui pode colocar o menu lateral, navbar, etc */}
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Sistema de Recibos</h1>
      </header>

      <main className="p-4">{children}</main>
    </div>
  );
}
