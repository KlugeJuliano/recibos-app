'use client';

import { useEffect, useState } from 'react';
import { Recibos } from '../../types';

export default function RelatoriosPage() {
  const [recibos, setRecibos] = useState<Recibos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecibos = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/recibos");
        
        if (!res.ok) {
          throw new Error(`Erro ao buscar dados: ${res.status}`);
        }
        
        const data = await res.json();
        setRecibos(data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar recibos:", err);
        if( err instanceof Error){
          setError(err.message);
        }else{
          setError("Ocorreu erro ao buscar os recibos");
        }
        setRecibos([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecibos();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-700">Relatórios de Recibos</h1>
            <p className="mt-1 text-sm text-gray-500">Exporte os dados em PDF ou CSV.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href="/api/relatorios/exportar?format=pdf"
              className="rounded-lg bg-green-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-800"
            >
              Exportar PDF
            </a>
            <a
              href="/api/relatorios/exportar?format=csv"
              className="rounded-lg border border-green-200 px-4 py-2 text-center text-sm font-semibold text-green-700 hover:bg-green-50"
            >
              Exportar CSV
            </a>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700"></div>
            <span className="ml-3 text-gray-600">Carregando recibos...</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && !error && recibos.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum recibo encontrado</h3>
            <p className="mt-1 text-gray-500">Não há recibos disponíveis para exibição no momento.</p>
          </div>
        )}

        {!isLoading && !error && recibos.length > 0 && (
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Valor</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Data</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map((recibo) => (
                <tr key={recibo.id} className="border-t">
                  <td className="py-2 px-4 text-sm text-gray-700">{recibo.id}</td>
                  <td className="py-2 px-4 text-sm text-gray-700">{recibo.name}</td>
                  <td className="py-2 px-4 text-sm text-gray-700">{`R$ ${recibo.valor.toFixed(2)}`}</td>
                  <td className="py-2 px-4 text-sm text-gray-700">{recibo.dataRecibo}</td>
                  <td className="py-2 px-4 text-sm">
                    <a
                      href={`/api/recibos/${recibo.id}/pdf`}
                      className="font-semibold text-blue-700 hover:text-blue-900"
                    >
                      PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
