'use client';

import { useState, useEffect } from 'react';
import { Company } from '@/app/types';
import { createClient } from '@/utils/supabase/client';
import { CompanyRepository } from '@/app/repositories/CompanyRepository';

export default function CompanyManagement() {
  const supabase = createClient();
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Omit<Company, 'id'> & {id?: string}>({
    name: '',
    cnpj: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await CompanyRepository.getAll(supabase);
      setCompanyList(data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit modal with company data
  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
    setFormData({
      id: company.id,
      name: company.name,
      cnpj: company.cnpj
    });
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // Save company changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (editingCompany) {
        await CompanyRepository.update(supabase, editingCompany.id, {
          name: formData.name,
          cnpj: formData.cnpj
        });
      } else {
        await CompanyRepository.add(supabase, {
          name: formData.name,
          cnpj: formData.cnpj
        } as Company);
      }
      
      await loadCompanies();
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert('Erro ao salvar empresa.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete company
  const handleDelete = async (companyId: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa? Isso pode afetar lojas e usuários vinculados a ela.')) {
      try {
        setIsLoading(true);
        await CompanyRepository.delete(supabase, companyId);
        await loadCompanies();
      } catch (error) {
        console.error('Erro ao excluir empresa:', error);
        alert('Erro ao excluir empresa.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setFormData({
      name: '',
      cnpj: '',
    });
  };

  // Start creating a new company
  const handleAddNew = () => {
    setIsModalOpen(true);
    setEditingCompany(null);
    setFormData({
      name: '',
      cnpj: '',
    });
  };

  if (isLoading && companyList.length === 0) {
    return <div className="p-8 text-center text-gray-500">Carregando empresas...</div>;
  }

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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companyList.map(company => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.cnpj}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(company)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                  <button onClick={() => handleDelete(company.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                <input type="text" name="cnpj" value={formData.cnpj} onChange={handleCnpjChange} required placeholder="XX.XXX.XXX/XXXX-XX" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
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
