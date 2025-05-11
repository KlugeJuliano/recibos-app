'use client';

import { useState } from 'react';

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

// Sample permissions
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

// Initial sample functions/roles
const initialFunctions: FunctionRole[] = [
  {
    id: 'gerente',
    name: 'Gerente',
    description: 'Acesso total ao sistema',
    permissions: availablePermissions.map(p => p.id),
  },
  {
    id: 'funcionario',
    name: 'Funcionário',
    description: 'Pode criar e editar recibos',
    permissions: ['create_recibo', 'edit_recibo', 'view_reports'],
  },
  {
    id: 'atendente',
    name: 'Atendente',
    description: 'Apenas visualiza recibos',
    permissions: ['view_reports'],
  },
];

export default function FunctionManagement() {
  const [functions, setFunctions] = useState<FunctionRole[]>(initialFunctions);
  const [editingFunction, setEditingFunction] = useState<FunctionRole | null>(null);
  const [formData, setFormData] = useState<FunctionRole>({
    id: '',
    name: '',
    description: '',
    permissions: [],
  });

  // Open edit modal with function data
  const handleEdit = (func: FunctionRole) => {
    setEditingFunction(func);
    setFormData({
      id: func.id,
      name: func.name,
      description: func.description,
      permissions: [...func.permissions],
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

  // Handle permission checkbox changes
  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId];
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  // Save function changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one permission is selected
    if (formData.permissions.length === 0) {
      alert('Selecione pelo menos uma permissão');
      return;
    }
    
    if (editingFunction) {
      // Update existing function
      setFunctions(prev => 
        prev.map(func => 
          func.id === editingFunction.id ? { ...formData } : func
        )
      );
    } else {
      // Generate a slugified ID if not provided
      const newId = formData.id || formData.name.toLowerCase().replace(/\s+/g, '_');
      
      // Add new function
      const newFunction: FunctionRole = {
        ...formData,
        id: newId,
      };
      setFunctions(prev => [...prev, newFunction]);
    }
    
    // Reset form
    handleCancel();
  };

  // Delete function
  const handleDelete = (functionId: string) => {
    // Check if there are any users with this role before deletion
    // This would be a database check in a real app
    
    if (confirm('Tem certeza que deseja excluir esta função? Isso pode afetar usuários que a utilizam.')) {
      setFunctions(prev => prev.filter(func => func.id !== functionId));
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingFunction(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      permissions: [],
    });
  };

  // Start creating a new function
  const handleAddNew = () => {
    setEditingFunction(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      permissions: [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gerenciamento de Funções</h2>
        <button
          onClick={handleAddNew}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Nova Função
        </button>
      </div>

      {/* Functions Table */}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissões
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {functions.map(func => (
              <tr key={func.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{func.name}</div>
                  <div className="text-xs text-gray-500">{func.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{func.description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {func.permissions.map(permId => {
                      const permission = availablePermissions.find(p => p.id === permId);
                      return permission ? (
                        <span key={permId} className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {permission.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(func)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(func.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={func.id === 'gerente'} // Prevent deletion of the admin role
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Function Form Modal */}
      {(editingFunction !== null || formData.name !== '' || formData.id === '') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingFunction ? 'Editar Função' : 'Nova Função'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome da Função</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID da Função (opcional)</label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    placeholder="gerado-automaticamente"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                  />
                  <p className="text-xs text-gray-500 mt-1">Deixe em branco para gerar automaticamente</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissões</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border rounded-md">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id={`perm-${permission.id}`}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`perm-${permission.id}`} className="font-medium text-gray-700">
                          {permission.name}
                        </label>
                        <p className="text-gray-500 text-xs">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {formData.permissions.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Selecione pelo menos uma permissão</p>
                )}
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
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

