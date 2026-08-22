'use client';

import { useState, useEffect } from 'react';
import { Users, Loja } from '@/app/types';
import { createClient } from '@/utils/supabase/client';
import { UserRepository } from '@/app/repositories/UserRepository';
import { StoreRepository } from '@/app/repositories/StoreRepository';
import { CompanyRepository } from '@/app/repositories/CompanyRepository';
import { getCompanyPlan, canAccessFeature } from '@/app/lib/planGuard';
import { getUserProfile } from '@/utils/supabase/profile';

export default function UserManagement() {
  const supabase = createClient();
  const [users, setUsers] = useState<Users[]>([]);
  const [stores, setStores] = useState<Loja[]>([]);
  const [editingUser, setEditingUser] = useState<Users | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companyPlan, setCompanyPlan] = useState<'free' | 'pro' | 'business'>('free');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    lojaId: '',
    role: '',
    companyId: ''
  });

  useEffect(() => {
    loadData();
    loadCompanyPlan();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, storesData] = await Promise.all([
        UserRepository.getAll(supabase),
        StoreRepository.getAll(supabase)
      ]);
      setUsers(usersData);
      setStores(storesData);
    } catch (error) {
      console.error('Erro ao carregar dados de usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompanyPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const profile = await getUserProfile(supabase, user.id);
      if (profile?.companyId) {
        const plan = await CompanyRepository.getCompanyPlan(supabase, profile.companyId);
        setCompanyPlan(plan);
      }
    } catch (error) {
      console.error('Erro ao carregar plano da empresa:', error);
    }
  };

  const handleEdit = (user: Users) => {
    setEditingUser(user);
    setIsModalOpen(true);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      lojaId: user.lojaId,
      role: user.role,
      companyId: user.companyId
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-fill companyId when store is selected
    if (name === 'lojaId') {
      const selectedStore = stores.find(s => s.id === value);
      if (selectedStore) {
        setFormData(prev => ({ ...prev, companyId: selectedStore.companyId }));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userToSave = {
        id: formData.id,
        name: formData.name,
        email: formData.email,
        lojaId: formData.lojaId,
        role: formData.role,
        companyId: formData.companyId
      };

      if (editingUser) {
        await UserRepository.update(supabase, editingUser.id, userToSave);
      } else {
        await UserRepository.add(supabase, userToSave);
      }
      
      await loadData();
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        setIsLoading(true);
        await UserRepository.delete(supabase, userId);
        await loadData();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      id: '',
      name: '',
      email: '',
      lojaId: '',
      role: '',
      companyId: ''
    });
  };

  const handleAddNew = () => {
    setIsModalOpen(true);
    setEditingUser(null);
    setFormData({
      id: '',
      name: '',
      email: '',
      lojaId: '',
      role: '',
      companyId: ''
    });
  };

  const canAddUser = canAccessFeature(companyPlan, 'multi_user') || users.length === 0;
  const blockReason = companyPlan === 'free' && users.length > 0 
    ? 'Plano Free permite apenas 1 usuário (admin). Faça upgrade para Pro ou Business para adicionar equipe.'
    : '';

  if (isLoading && users.length === 0) {
    return <div className="p-8 text-center text-gray-500">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gerenciamento de Usuários</h2>
        <button 
          onClick={handleAddNew} 
          disabled={!canAddUser}
          className={`px-4 py-2 rounded transition ${canAddUser 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={blockReason}
        >
          Novo Perfil
        </button>
      </div>

      {blockReason && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">{blockReason}</p>
          <a href="/login?signup=true" className="mt-2 inline-block text-amber-600 hover:text-amber-700 underline text-sm">
            Ver planos disponíveis
          </a>
        </div>
      )}

      <p className="text-sm text-gray-500">
        Novos usuários devem criar a conta pela tela de login. Aqui você administra o perfil já vinculado ao ID do usuário no Supabase Auth.
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loja</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => {
              const store = stores.find(s => s.id === user.lojaId);
              return (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store?.loja || user.lojaId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingUser ? 'Editar Perfil' : 'Novo Perfil'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID do Usuário no Supabase Auth</label>
                  <input type="text" name="id" value={formData.id} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Loja</label>
                <select name="lojaId" value={formData.lojaId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                  <option value="">Selecione uma loja</option>
                  {stores.map(store => <option key={store.id} value={store.id}>{store.loja}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Função</label>
                <select name="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                  <option value="">Selecione uma função</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Funcionário">Funcionário</option>
                  <option value="Atendente">Atendente</option>
                </select>
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
