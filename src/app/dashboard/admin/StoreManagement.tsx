'use client';

import { useState, useEffect } from 'react';
import { Loja, Company, Sector } from '@/app/types';
import { createClient } from '@/utils/supabase/client';
import { StoreRepository } from '@/app/repositories/StoreRepository';
import { CompanyRepository } from '@/app/repositories/CompanyRepository';
import { SectorRepository } from '@/app/repositories/SectionRepository';
import { getCompanyPlan, canAccessFeature } from '@/app/lib/planGuard';
import { getUserProfile } from '@/utils/supabase/profile';

export default function StoreManagement() {
  const supabase = createClient();
  const [stores, setStores] = useState<Loja[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allSectors, setAllSectors] = useState<Sector[]>([]);
  const [editingStore, setEditingStore] = useState<Loja | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredStores, setFilteredStores] = useState<Loja[]>([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [companyPlan, setCompanyPlan] = useState<'free' | 'pro' | 'business'>('free');
  const [generalError, setGeneralError] = useState('');
  
  const [formData, setFormData] = useState<Omit<Loja, 'sectors'> & {selectedSectors: string[]}>({
    id: '',
    loja: '',
    cnpj: '',
    companyId: '',
    address: '',
    phone: '',
    selectedSectors: []
  });

  useEffect(() => {
    loadData();
    loadCompanyPlan();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [storesData, companiesData, sectorsData] = await Promise.all([
        StoreRepository.getAll(supabase),
        CompanyRepository.getAll(supabase),
        SectorRepository.getAll(supabase)
      ]);
      
      setStores(storesData);
      setCompanies(companiesData);
      setAllSectors(sectorsData);
      setFilteredStores(storesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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

  // Open edit modal with store data
  const handleEdit = (store: Loja) => {
    setEditingStore(store);
    setIsModalOpen(true);
    setFormData({
      id: store.id,
      loja: store.loja,
      cnpj: store.cnpj,
      companyId: store.companyId,
      address: store.address || '',
      phone: store.phone || '',
      selectedSectors: store.sectors?.map(s => s.id) || []
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
    value = value.replace(/\D/g, '');
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    setFormData(prev => ({ ...prev, cnpj: value }));
  };

  // Handle phone input with mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    setFormData(prev => ({ ...prev, phone: value }));
  };

  // Handle sector selection
  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sectorId = e.target.value;
    if (sectorId && !formData.selectedSectors.includes(sectorId)) {
      setFormData(prev => ({
        ...prev,
        selectedSectors: [...prev.selectedSectors, sectorId]
      }));
    }
  };

  // Remove a sector
  const handleRemoveSector = (sectorId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSectors: prev.selectedSectors.filter(id => id !== sectorId)
    }));
  };

  // Select company
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, companyId: e.target.value }));
  };

  // Save store changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneralError('');
    
    try {
      const selectedSectorObjects = allSectors.filter(sector => 
        formData.selectedSectors.includes(sector.id)
      );

      const storeToSave: any = {
        loja: formData.loja,
        cnpj: formData.cnpj,
        companyId: formData.companyId,
        address: formData.address,
        phone: formData.phone,
        // Note: Relation handling depends on DB schema. 
        // For now saving sectors as array if supported, otherwise this needs a link table update.
        sectors: selectedSectorObjects 
      };

      const url = editingStore ? `/api/admin/lojas/${editingStore.id}` : '/api/admin/lojas';
      const method = editingStore ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeToSave),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar loja.');
      }
      
      await loadData();
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar loja:', error);
      setGeneralError(error instanceof Error ? error.message : 'Erro ao salvar loja.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete store
  const handleDelete = async (storeId: string) => {
    if (confirm('Tem certeza que deseja excluir esta loja? Isso pode afetar usuários vinculados a ela.')) {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/admin/lojas/${storeId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao excluir loja.');
        }
        
        await loadData();
      } catch (error) {
        console.error('Erro ao excluir loja:', error);
        setGeneralError(error instanceof Error ? error.message : 'Erro ao excluir loja.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingStore(null);
    setFormData({
      id: '',
      loja: '',
      cnpj: '',
      companyId: '',
      address: '',
      phone: '',
      selectedSectors: []
    });
  };

  // Start creating a new store
  const handleAddNew = () => {
    setIsModalOpen(true);
    setEditingStore(null);
    setFormData({
      id: '',
      loja: '',
      cnpj: '',
      companyId: '',
      address: '',
      phone: '',
      selectedSectors: []
    });
  };

  const canAddStore = canAccessFeature(companyPlan, 'multi_store') || stores.length === 0;
  const blockReason = companyPlan === 'free' && stores.length > 0 
    ? 'Plano Free permite apenas 1 loja. Faça upgrade para Pro ou Business para múltiplas lojas.'
    : '';

  // Handle company filter change
  const handleCompanyFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    setSelectedCompanyFilter(companyId);
    if (companyId) {
      setFilteredStores(stores.filter(store => store.companyId === companyId));
    } else {
      setFilteredStores(stores);
    }
  };

  if (isLoading && stores.length === 0) {
    return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gerenciamento de Lojas</h2>
        <button 
          onClick={handleAddNew} 
          disabled={!canAddStore}
          className={`px-4 py-2 rounded transition ${canAddStore 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={blockReason}
        >
          Nova Loja
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

      {generalError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{generalError}</p>
        </div>
      )}

      {/* Company Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Empresa</label>
        <select
          value={selectedCompanyFilter}
          onChange={handleCompanyFilter}
          className="w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        >
          <option value="">Todas as Empresas</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
      </div>

      {/* Store Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Loja</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setores</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(selectedCompanyFilter ? filteredStores : stores).map(store => {
              const company = companies.find(c => c.id === store.companyId);
              return (
                <tr key={store.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.loja}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.cnpj}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.address || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {store.sectors?.map(sector => (
                        <span key={sector.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">{sector.name}</span>
                      ))}
                      {(!store.sectors || store.sectors.length === 0) && '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(store)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                    <button onClick={() => handleDelete(store.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Store Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingStore ? 'Editar Loja' : 'Nova Loja'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome da Loja</label>
                <input type="text" name="loja" value={formData.loja} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                <input type="text" name="cnpj" value={formData.cnpj} onChange={handleCnpjChange} required placeholder="XX.XXX.XXX/XXXX-XX" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Empresa</label>
                <select name="companyId" value={formData.companyId} onChange={handleCompanyChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                  <option value="">Selecione uma empresa</option>
                  {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handlePhoneChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Setores</label>
                <select onChange={handleSectorChange} value="" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                  <option value="">Selecione os setores</option>
                  {allSectors.filter(sector => !formData.selectedSectors.includes(sector.id)).map(sector => (
                    <option key={sector.id} value={sector.id}>{sector.name}</option>
                  ))}
                </select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.selectedSectors.map(sectorId => {
                    const sector = allSectors.find(s => s.id === sectorId);
                    return sector && (
                      <div key={sector.id} className="flex items-center bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-sm">
                        {sector.name}
                        <button type="button" onClick={() => handleRemoveSector(sector.id)} className="ml-1 text-indigo-500">×</button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-5">
                <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded-md bg-white">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md" disabled={isLoading}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
