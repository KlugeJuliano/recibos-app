'use client';

import { useState } from 'react';
import { Loja } from '@/app/types';
import { lojas } from '@/app/lib/mokdata';

export default function StoreManagement() {
  const [stores, setStores] = useState<Loja[]>(lojas);
  const [editingStore, setEditingStore] = useState<Loja | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    loja: '',
    cnpj: ''
  });

  // Open edit modal with store data
  const handleEdit = (store: Loja) => {
    setEditingStore(store);
    setFormData({
      id: store.id,
      loja: store.loja,
      cnpj: store.cnpj
    });
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format CNPJ input with mask
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove all non-digits
    value = value.replace(/\D/g, '');
    
    // Apply CNPJ mask: XX.XXX.XXX/XXXX-XX
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    setFormData(prev => ({
      ...prev,
      cnpj: value
    }));
  };

  // Save store changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStore) {
      // Update existing store
      setStores(prev => 
        prev.map(store => 
          store.id === editingStore.id 
            ? { ...formData } 
            : store
        )
      );
    } else {
      // Add new store
      const newStore: Loja = {
        ...formData,
        id: `loja${Date.now().toString().slice(-4)}`, // Simple way to generate a unique ID
      };
      setStores(prev => [...prev, newStore]);
    }
    
    // Reset form
    handleCancel();
  };

  // Delete store
  const handleDelete = (storeId: string) => {
    if (confirm('Tem certeza que deseja excluir esta loja? Isso pode afetar usuários vinculados a ela.')) {
      setStores(prev => prev.filter(store => store.id !== storeId));
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingStore(null);
    setFormData({
      id: '',
      loja: '',
      cnpj: ''
    });
  };

  // Start creating a new store
  const handleAddNew = () => {
    setEditingStore(null);
    setFormData({
      id: '',
      loja: '',
      cnpj: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gerenciamento de Lojas</h2>
        <button
          onClick={handleAddNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Nova Loja
        </button>
      </div>

      {/* Store Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome da Loja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNPJ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stores.map(store => (
              <tr key={store.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {store.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{store.loja}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{store.cnpj}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(store)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(store.id)}
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

      {/* Store Form Modal */}
      {(editingStore !== null || formData.id === '') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingStore ? 'Editar Loja' : 'Nova Loja'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome da Loja</label>
                <input
                  type="text"
                  name="loja"
                  value={formData.loja}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleCnpjChange}
                  required
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
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

