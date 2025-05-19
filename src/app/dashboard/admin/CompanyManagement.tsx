'use client';

import { useState } from 'react';
import { Company } from '@/app/types';
import { companies } from '@/app/lib/mokdata';

export default function CompanyManagement() {
  const [companyList, setCompanyList] = useState<Company[]>(companies);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<Company>({
    id: '',
    name: '',
    cnpj: '',
  });

  // Open edit modal with company data
  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      id: company.id,
      name: company.name,
      cnpj: company.cnpj
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

  // Save company changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCompany) {
      // Update existing company
      setCompanyList(prev => 
        prev.map(company => 
          company.id === editingCompany.id 
            ? formData
            : company
        )
      );
    } else {
      // Add new company
      const newCompany: Company = {
        ...formData,
        id: `company${Date.now().toString().slice(-4)}`, // Simple way to generate a unique ID
      };
      setCompanyList(prev => [...prev, newCompany]);
    }
    
    // Reset form
    handleCancel();
  };

  // Delete company
  const handleDelete = (companyId: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa? Isso pode afetar lojas e usuários vinculados a ela.')) {
      setCompanyList(prev => prev.filter(company => company.id !== companyId));
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingCompany(null);
    setFormData({
      id: '',
      name: '',
      cnpj: '',
    });
  };

  // Start creating a new company
  const handleAddNew = () => {
    setEditingCompany(null);
    setFormData({
      id: '',
      name: '',
      cnpj: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gerenciamento de Empresas</h2>
        <button
          onClick={handleAddNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Nova Empresa
        </button>
      </div>

      {/* Company Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome da Empresa
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
            {companyList.map(company => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{company.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{company.cnpj}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(company)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
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

      {/* Company Form Modal */}
      {(editingCompany !== null || formData.id === '') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
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

