'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type LogoutButtonProps = {
  className?: string;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
};

export default function LogoutButton({
  className = '',
  variant = 'primary',
  size = 'md',
  label = 'Sair'
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Base styles based on variant and size
  const baseStyles = {
    primary: 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    text: 'text-red-600 hover:text-red-700 bg-transparent'
  };

  const sizeStyles = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-3 px-6'
  };

  const buttonStyle = `rounded-lg transition-colors duration-200 flex items-center justify-center ${baseStyles[variant]} ${sizeStyles[size]} ${className}`;

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      // Sign out and redirect to login page
      await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      });
      
      // Use router to redirect after logout
      router.push('/login');
      router.refresh(); // Refresh to update auth state
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={buttonStyle}
      disabled={isLoading}
      type="button"
      aria-label="Logout"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saindo...
        </>
      ) : (
        label
      )}
    </button>
  );
}

