'use client';

import { useState } from 'react';
import UserManagement from './UserManagement';
import StoreManagement from './StoreManagement';
import CompanyManagement from './CompanyManagement';
import SectorManagement from './SectorManagement';

type ManagementSection = 'none' | 'users' | 'stores' | 'companies' | 'sectors';

export default function AdminPanel() {
  const [selectedSection, setSelectedSection] = useState<ManagementSection>('none');

  if (selectedSection !== 'none') {
    return (
      <div className="py-6 px-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setSelectedSection('none')}
            className="text-blue-600 hover:text-blue-800 flex items-center group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao Painel
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {selectedSection === 'users' && <UserManagement />}
          {selectedSection === 'stores' && <StoreManagement />}
          {selectedSection === 'companies' && <CompanyManagement />}
          {selectedSection === 'sectors' && <SectorManagement />}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Painel Administrativo</h1>
        <p className="text-lg text-gray-600">
          Selecione uma das áreas abaixo para gerenciar o sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          onClick={() => setSelectedSection('users')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-500 transform hover:-translate-y-1"
        >
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 ml-4">Usuários</h2>
          </div>
          <p className="text-gray-600">
            Gerencie perfis, permissões e vínculo dos usuários com as lojas.
          </p>
        </div>

        <div
          onClick={() => setSelectedSection('stores')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-500 transform hover:-translate-y-1"
        >
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 ml-4">Lojas</h2>
          </div>
          <p className="text-gray-600">
            Cadastre e gerencie lojas, seus endereços e setores.
          </p>
        </div>

        <div
          onClick={() => setSelectedSection('companies')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-500 transform hover:-translate-y-1"
        >
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 ml-4">Empresas</h2>
          </div>
          <p className="text-gray-600">
            Gerencie as empresas do sistema e suas informações corporativas.
          </p>
        </div>

        <div
          onClick={() => setSelectedSection('sectors')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-amber-500 transform hover:-translate-y-1"
        >
          <div className="flex items-center mb-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 ml-4">Setores</h2>
          </div>
          <p className="text-gray-600">
            Configure os setores disponíveis para todas as lojas do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
