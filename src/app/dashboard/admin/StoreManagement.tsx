'use client';

import { useState, useEffect } from 'react';
import { Loja, Company, Sector } from '@/app/types';
import { lojas, companies, sectors as allSectors } from '@/app/lib/mokdata';

export default function StoreManagement() {
  const [stores, setStores] = useState<Loja[]>(lojas);
  const [editingStore, setEditingStore] = useState<Loja | null>(null);
  const [filteredStores, setFilteredStores] = useState<Loja[]>(lojas);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('');
  const [formData, setFormData] = useState<Omit<Loja, 'sectors'> & {selectedSectors: string[]}>({
    id: '',
    loja: '',
    cnpj: '',
    companyId: '',
    address: '',
    phone: '',
    selectedSectors: []
  });
  const [availableSectors, setAvailableSectors] = useState<Sector[]>(allSectors);

  // Open edit modal with store data
  const handleEdit = (store: Loja) => {
    setEditingStore(store);
    setFormData({
      id: store.id,
      loja: store.loja,
      cnpj: store.cnpj,
      companyId: store.companyId,
      address: store.address || '',
      phone: store.phone || '',
      selectedSectors: store.sectors.map(s => s.id)
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

  // Handle phone input with mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove all non-digits
    value = value.replace(/\D/g, '');
    
    // Apply phone mask: (XX) XXXX-XXXX
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
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
    setFormData(prev => ({
      ...prev,
      companyId: e.target.value
    }));
  };

  // Save store changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get selected sectors as full objects
    const selectedSectorObjects = allSectors.filter(sector => 
      formData.selectedSectors.includes(sector.id)
    );
    
    if (editingStore) {
      // Update existing store
      setStores(prev => 
        prev.map(store => 
          store.id === editingStore.id 
            ? { 
                ...formData,
                sectors: selectedSectorObjects
              } 
            : store
        )
      );
    } else {
      // Add new store
      const newStore: Loja = {
        ...formData,
        id: `loja${Date.now().toString().slice(-4)}`, // Simple way to generate a unique ID
        sectors: selectedSectorObjects
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
      cnpj: '',
      companyId: '',
      address: '',
      phone: '',
      selectedSectors: []
    });
  };

  // Start creating a new store
  const handleAddNew = () => {
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

  // Handle company filter change
  const handleCompanyFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    setSelectedCompanyFilter(companyId);
    
    // Filter stores based on selected company
    if (companyId) {
      setFilteredStores(stores.filter(store => store.companyId === companyId));
    } else {
      setFilteredStores(stores);
    }
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome da Loja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNPJ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endereço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Setores
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(selectedCompanyFilter ? filteredStores : stores).map(store => {
              const company = companies.find(c => c.id === store.companyId);
              return (
                <tr key={store.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {store.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{store.loja}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {store.cnpj}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {store.address || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {store.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {store.sectors.map(sector => (
                        <span key={sector.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                          {sector.name}
                        </span>
                      ))}
                      {store.sectors.length === 0 && '-'}
                    </div>
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
              );
            })}
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Empresa</label>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleCompanyChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Ex: Rua Principal, 100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(XX) XXXX-XXXX"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Setores</label>
                <div className="flex space-x-2">
                  <select
                    onChange={handleSectorChange}
                    value=""
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  >
                    <option value="">Selecione os setores</option>
                    {allSectors
                      .filter(sector => !formData.selectedSectors.includes(sector.id))
                      .map(sector => (
                        <option key={sector.id} value={sector.id}>{sector.name}</option>
                      ))}
                  </select>
                </div>
                {formData.selectedSectors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Setores selecionados:</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {formData.selectedSectors.map(sectorId => {
                        const sector = allSectors.find(s => s.id === sectorId);
                        return sector ? (
                          <div key={sector.id} className="flex items-center bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-sm">
                            {sector.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveSector(sector.id)}
                              className="ml-1 text-indigo-500 hover:text-indigo-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
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

