'use client';

import { useState } from 'react';
import { Sector } from '@/app/types';
import { sectors } from '@/app/lib/mokdata';

export default function SectorManagement() {
  const [sectorList, setSectorList] = useState<Sector[]>(sectors);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: ''
  });

  // Open edit modal with sector data
  const handleEdit = (sector: Sector) => {
    setEditingSector(sector);
    setFormData({
      id: sector.id,
      name: sector.name,
      description: sector.description || ''
    });
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save sector changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSector) {
      // Update existing sector
      setSectorList(prev => 
        prev.map(sector => 
          sector.id === editingSector.id 
            ? { ...sector, ...formData } 
            : sector
        )
      );
    } else {
      // Add new sector
      const newSector: Sector = {
        ...formData,
        id: `sector${Date.now()}`, // Simple way to generate a unique ID
      };
      setSectorList(prev => [...prev, newSector]);
    }
    
    // Reset form
    handleCancel();
  };

  // Delete sector
  const handleDelete = (sectorId: string) => {
    if (confirm('Tem certeza que deseja excluir este setor?')) {
      setSectorList(prev => prev.filter(sector => sector.id !== sectorId));
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingSector(null);
    setFormData({
      id: '',
      name: '',
      description: ''
    });
  };

  // Start creating a new sector
  const handleAddNew = () => {
    setEditingSector(null);
    setFormData({
      id: '',
      name: '',
      description: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gerenciamento de Setores</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Novo Setor
        </button>
      </div>

      {/* Sector Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sectorList.map(sector => (
              <tr key={sector.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{sector.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{sector.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(sector)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(sector.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sector Form Modal */}
      {(editingSector !== null || formData.id === '') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingSector ? 'Editar Setor' : 'Novo Setor'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-5">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

