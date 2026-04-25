'use client';

import { useState, useEffect } from 'react';
import { Sector } from '@/app/types';
import { createClient } from '@/utils/supabase/client';
import { SectorRepository } from '@/app/repositories/SectionRepository';

export default function SectorManagement() {
  const supabase = createClient();
  const [sectorList, setSectorList] = useState<Sector[]>([]);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      setIsLoading(true);
      const data = await SectorRepository.getAll(supabase);
      setSectorList(data);
    } catch (error) {
      console.error('Erro ao carregar setores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (sector: Sector) => {
    setEditingSector(sector);
    setIsModalOpen(true);
    setFormData({
      name: sector.name,
      description: sector.description || ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (editingSector) {
        await SectorRepository.update(supabase, editingSector.id, {
          name: formData.name,
          description: formData.description
        });
      } else {
        await SectorRepository.add(supabase, {
          name: formData.name,
          description: formData.description
        } as Sector);
      }
      
      await loadSectors();
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar setor:', error);
      alert('Erro ao salvar setor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sectorId: string) => {
    if (confirm('Tem certeza que deseja excluir este setor?')) {
      try {
        setIsLoading(true);
        await SectorRepository.delete(supabase, sectorId);
        await loadSectors();
      } catch (error) {
        console.error('Erro ao excluir setor:', error);
        alert('Erro ao excluir setor.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingSector(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleAddNew = () => {
    setIsModalOpen(true);
    setEditingSector(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  if (isLoading && sectorList.length === 0) {
    return <div className="p-8 text-center text-gray-500">Carregando setores...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gerenciamento de Setores</h2>
        <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Novo Setor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sectorList.map(sector => (
              <tr key={sector.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sector.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sector.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(sector)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                  <button onClick={() => handleDelete(sector.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingSector ? 'Editar Setor' : 'Novo Setor'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div className="flex justify-end space-x-3 mt-5">
                <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded-md bg-white">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md" disabled={isLoading}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
