'use client';

import LogoutButton from '@/components/LogoutButton';

type DashboardHeaderProps = {
  userName: string;
  userRole: string;
};


export default function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and app name */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">Sistema de Recibos</h1>
            </div>
          </div>
          
          {/* User info and logout button */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium">{userName}</span>
              <span className="text-xs text-blue-200">{userRole}</span>
            </div>
            
            {/* Mobile user display */}
            <div className="md:hidden">
              <span className="text-sm font-medium">{userName}</span>
            </div>
            
            {/* Logout button */}
            <LogoutButton 
              variant="secondary" 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-400 text-white"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

