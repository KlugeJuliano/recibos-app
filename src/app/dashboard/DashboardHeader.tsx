'use client';

import LogoutButton from '@/components/LogoutButton';

type DashboardHeaderProps = {
  userName: string;
  userRole: string;
};


export default function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white text-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white">
              RA
            </div>
            <div>
              <h1 className="text-base font-semibold">Recibos App</h1>
              <p className="hidden text-xs text-slate-500 sm:block">Painel de operacao</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold">{userName}</span>
              <span className="text-xs text-slate-500">{userRole}</span>
            </div>
            
            <div className="md:hidden">
              <span className="text-sm font-medium">{userName}</span>
            </div>
            
            <LogoutButton 
              variant="secondary" 
              size="sm" 
              className="bg-slate-100 hover:bg-slate-200 text-slate-800"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
