'use client';

import { useState } from 'react';

const recibosExemplo = [
  { id: 1, cliente: 'João Silva', valor: 150.0, data: '2025-05-01' },
];

export default function RelatoriosPage() {
  const [recibos] = useState(recibosExemplo);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Relatórios de Recibos</h1>

        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Valor</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Data</th>
            </tr>
          </thead>
          <tbody>
            {recibos.map((recibo) => (
              <tr key={recibo.id} className="border-t">
                <td className="py-2 px-4 text-sm text-gray-700">{recibo.id}</td>
                <td className="py-2 px-4 text-sm text-gray-700">{recibo.cliente}</td>
                <td className="py-2 px-4 text-sm text-gray-700">{`R$ ${recibo.valor.toFixed(2)}`}</td>
                <td className="py-2 px-4 text-sm text-gray-700">{recibo.data}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 text-sm text-gray-500 text-center">
          ⚙️ Funcionalidades de filtro e exportação em breve.
        </div>
      </div>
    </main>
  );
}
