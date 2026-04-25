'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

// Types for function management
type Permission = {
  id: string;
  name: string;
  description: string;
};

type FunctionRole = {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
};

// Sample permissions - In a real app, these could also come from the DB
const availablePermissions: Permission[] = [
  { id: 'create_recibo', name: 'Criar Recibos', description: 'Permite criar novos recibos' },
  { id: 'edit_recibo', name: 'Editar Recibos', description: 'Permite editar recibos existentes' },
  { id: 'delete_recibo', name: 'Excluir Recibos', description: 'Permite excluir recibos' },
  { id: 'view_reports', name: 'Ver Relatórios', description: 'Permite visualizar relatórios' },
  { id: 'manage_users', name: 'Gerenciar Usuários', description: 'Permite gerenciar usuários' },
  { id: 'manage_stores', name: 'Gerenciar Lojas', description: 'Permite gerenciar lojas' },
  { id: 'manage_settings', name: 'Gerenciar Configurações', description: 'Permite alterar configurações do sistema' },
  { id: 'manage_functions', name: 'Gerenciar Funções', description: 'Permite gerenciar funções e permissões' },
];

export default function FunctionManagement() {
  const supabase = createClient();
  const [functions, setFunctions] = useState<FunctionRole[]>([]);
  const [editingFunction, setEditingFunction] = useState<FunctionRole | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FunctionRole>({
    id: '',
    name: '',
    description: '',
    permissions: [],
  });

  useEffect(() => {
    loadFunctions();
  }, []);

  const loadFunctions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('roles').select('*');
      if (error) throw error;
      setFunctions(data || []);
    } catch (error) {
      console.error('Erro ao carregar funções:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (func: FunctionRole) => {
    setEditingFunction(func);
    setIsModalOpen(true);
    setFormData({
      id: func.id,
      name: func.name,
      description: func.description,
      permissions: [...func.permissions],
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId];
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.permissions.length === 0) {
      alert('Selecione pelo menos uma permissão');
      return;
    }
    
    setIsLoading(true);
    try {
      if (editingFunction) {
        const { error } = await supabase
          .from('roles')
          .update({
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions
          })
          .eq('id', editingFunction.id);
        if (error) throw error;
      } else {
        const newId = formData.id || formData.name.toLowerCase().replace(/\s+/g, '_');
        const { error } = await supabase
          .from('roles')
          .insert([{
            id: newId,
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions
          }]);
        if (error) throw error;
      }
      
      await loadFunctions();
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar função:', error);
      alert('Erro ao salvar função.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (functionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta função? Isso pode afetar usuários que a utilizam.')) {
      try {
        setIsLoading(true);
        const { error } = await supabase.from('roles').delete().eq('id', functionId);
        if (error) throw error;
        await loadFunctions();
      } catch (error) {
        console.error('Erro ao excluir função:', error);
        alert('Erro ao excluir função.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingFunction(null);
    setFormData({ id: '', name: '', description: '', permissions: [] });
  };

  const handleAddNew = () => {
    setIsModalOpen(true);
    setEditingFunction(null);
    setFormData({ id: '', name: '', description: '', permissions: [] });
  };

  if (isLoading && functions.length === 0) {
    return <div className="p-8 text-center text-gray-500">Carregando funções...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gerenciamento de Funções</h2>
        <button onClick={handleAddNew} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
          Nova Função
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissões</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {functions.map(func => (
              <tr key={func.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{func.name}</div>
                  <div className="text-xs text-gray-500">{func.id}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{func.description}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {func.permissions.map(permId => {
                      const permission = availablePermissions.find(p => p.id === permId);
                      return permission && (
                        <span key={permId} className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {permission.name}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(func)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                  <button onClick={() => handleDelete(func.id)} className="text-red-600 hover:text-red-900" disabled={func.id === 'gerente'}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">{editingFunction ? 'Editar Função' : 'Nova Função'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome da Função</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID da Função (opcional)</label>
                  <input type="text" name="id" value={formData.id} onChange={handleChange} placeholder="gerado-automaticamente" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" disabled={!!editingFunction} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissões</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border rounded-md">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-start">
                      <input type="checkbox" id={`perm-${permission.id}`} checked={formData.permissions.includes(permission.id)} onChange={() => handlePermissionChange(permission.id)} className="h-4 w-4 text-green-600 rounded" />
                      <div className="ml-3 text-sm">
                        <label htmlFor={`perm-${permission.id}`} className="font-medium text-gray-700">{permission.name}</label>
                        <p className="text-gray-500 text-xs">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-5">
                <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded-md bg-white">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md" disabled={isLoading}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
