'use client';

import { useState, useEffect } from 'react';
import { Company } from '@/app/types';
import { createClient } from '@/utils/supabase/client';
import { CompanyRepository } from '@/app/repositories/CompanyRepository';
import { getCompanyPlan, canAccessFeature } from '@/app/lib/planGuard';
import { getUserProfile } from '@/utils/supabase/profile';
import Image from 'next/image';

type Tab = 'dados' | 'logo';

export default function CompanyManagement() {
  const supabase = createClient();
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dados');
  const [companyPlan, setCompanyPlan] = useState<'free' | 'pro' | 'business'>('free');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Company, 'id'> & {id?: string}>({
    name: '',
    cnpj: '',
  });

  useEffect(() => {
    loadCompanies();
    loadCompanyPlan();
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

  const loadCompanyPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      const profile = await getUserProfile(supabase, user.id);
      if (profile?.companyId) {
        const plan = await CompanyRepository.getCompanyPlan(supabase, profile.companyId);
        setCompanyPlan(plan);
        const company = await CompanyRepository.findById(supabase, profile.companyId);
        if (company?.logo_url) {
          setLogoPreview(company.logo_url);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar plano da empresa:', error);
    }
  };

  // Open edit modal with company data
  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
    setActiveTab('dados');
    setGeneralError('');
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

  // Save company changes (dados tab)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
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
      let message = 'Erro ao salvar empresa.';
      if (error instanceof Error) {
        // Check for duplicate CNPJ error (PostgreSQL unique constraint violation)
        if (error.message.includes('23505') || error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          message = 'Já existe uma empresa cadastrada com este CNPJ.';
        } else {
          message = error.message;
        }
      }
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload logo to storage
  const handleLogoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById('logo-file') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      setGeneralError('Selecione um arquivo de imagem.');
      return;
    }

    setLogoUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/company/logo', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload do logotipo.');
      }
      
      setLogoPreview(data.logoUrl);
      setGeneralError('Logotipo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload do logotipo:', error);
      setGeneralError(error instanceof Error ? error.message : 'Erro ao fazer upload do logotipo.');
    } finally {
      setLogoUploading(false);
    }
  };

  // Delete company
  const handleDelete = async (companyId: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa? Isso pode afetar lojas e usuários vinculados a ela.')) {
      try {
        setGeneralError('');
        setIsLoading(true);
        
        if (!currentUserId) {
          throw new Error('Usuário não autenticado.');
        }
        
        // Proactive checks for related records
        const [userCount, storeCount, reciboCount] = await Promise.all([
          CompanyRepository.countUsersExcluding(supabase, companyId, currentUserId),
          CompanyRepository.countStores(supabase, companyId),
          CompanyRepository.countRecibos(supabase, companyId),
        ]);

        if (userCount > 0 || storeCount > 0 || reciboCount > 0) {
          const details = [];
          if (userCount > 0) details.push(`${userCount} usuário(s) além do admin`);
          if (storeCount > 0) details.push(`${storeCount} loja(s)`);
          if (reciboCount > 0) details.push(`${reciboCount} recibo(s)`);
          
          setGeneralError(`Não é possível excluir: esta empresa tem ${details.join(', ')} vinculado(s). Remova-os primeiro.`);
          return;
        }

        await CompanyRepository.delete(supabase, companyId);
        await loadCompanies();
      } catch (error) {
        console.error('Erro ao excluir empresa:', error);
        const message = error instanceof Error ? error.message : 'Erro ao excluir empresa.';
        setGeneralError(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setGeneralError('');
    setFormData({
      name: '',
      cnpj: '',
    });
  };

  // Start creating a new company
  const handleAddNew = () => {
    setIsModalOpen(true);
    setEditingCompany(null);
    setActiveTab('dados');
    setGeneralError('');
    setFormData({
      name: '',
      cnpj: '',
    });
  };

  const canUploadLogo = canAccessFeature(companyPlan, 'logo');

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

      {generalError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{generalError}</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {generalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{generalError}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('dados')}
                  className={`py-3 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'dados'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dados da Empresa
                </button>
                <button
                  onClick={() => setActiveTab('logo')}
                  className={`py-3 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'logo'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Logotipo
                </button>
              </nav>
            </div>

            {/* Tab: Dados da Empresa */}
            {activeTab === 'dados' && (
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
            )}

            {/* Tab: Logotipo */}
            {activeTab === 'logo' && (
              <div className="space-y-4">
                {!canUploadLogo ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                    <svg className="w-12 h-12 mx-auto text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h4 className="mt-3 text-lg font-semibold text-amber-800">Logotipo disponível apenas no plano Pro</h4>
                    <p className="mt-2 text-amber-700">Faça upgrade para o plano Pro ou Business para adicionar o logotipo da sua empresa nos recibos PDF.</p>
                    <a href="/login?signup=true" className="mt-4 inline-block bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700 transition">
                      Ver planos
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleLogoUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Logotipo da Empresa</label>
                      <p className="mt-1 text-sm text-gray-500">Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 2MB. Recomendado: 300x150px.</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="relative w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        {logoPreview ? (
                          <Image src={logoPreview} alt="Preview do logotipo" width={144} height={96} className="object-contain" />
                        ) : (
                          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <input
                          type="file"
                          id="logo-file"
                          name="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="sr-only"
                        />
                        <label htmlFor="logo-file" className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                          Escolher arquivo
                        </label>
                        <p className="text-xs text-gray-500">PNG, JPG ou SVG até 2MB</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-5">
                      <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded-md bg-white">Cancelar</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md" disabled={logoUploading}>
                        {logoUploading ? 'Enviando...' : 'Salvar Logotipo'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}