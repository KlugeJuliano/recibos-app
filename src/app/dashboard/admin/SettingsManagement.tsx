'use client';

import { useState } from 'react';

// Define types for settings
type GeneralSettings = {
  companyName: string;
  taxId: string;
  logoUrl: string;
  currency: string;
};

type SecuritySettings = {
  requireStrongPasswords: boolean;
  sessionTimeout: number; // in minutes
  twoFactorAuth: boolean;
};

type EmailSettings = {
  senderEmail: string;
  smtpServer: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  enableEmailNotifications: boolean;
};

type Settings = {
  general: GeneralSettings;
  security: SecuritySettings;
  email: EmailSettings;
};

// Initial settings
const defaultSettings: Settings = {
  general: {
    companyName: 'Sistema de Recibos',
    taxId: '',
    logoUrl: '',
    currency: 'BRL',
  },
  security: {
    requireStrongPasswords: true,
    sessionTimeout: 60,
    twoFactorAuth: false,
  },
  email: {
    senderEmail: '',
    smtpServer: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    enableEmailNotifications: false,
  },
};

export default function SettingsManagement() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes for general settings
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [name]: value
      }
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle input changes for security settings
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  // Handle number input for security settings
  const handleSecurityNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10) || 0;
    
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [name]: numValue
      }
    }));
  };

  // Handle input changes for email settings
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate settings before saving
  const validateSettings = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate general settings
    if (!settings.general.companyName.trim()) {
      newErrors.companyName = 'O nome da empresa é obrigatório';
    }
    
    // Validate email settings if notifications are enabled
    if (settings.email.enableEmailNotifications) {
      if (!settings.email.senderEmail.trim()) {
        newErrors.senderEmail = 'O email do remetente é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email.senderEmail)) {
        newErrors.senderEmail = 'Email inválido';
      }
      
      if (!settings.email.smtpServer.trim()) {
        newErrors.smtpServer = 'O servidor SMTP é obrigatório';
      }
      
      if (!settings.email.smtpPort.trim()) {
        newErrors.smtpPort = 'A porta SMTP é obrigatória';
      } else if (!/^\d+$/.test(settings.email.smtpPort)) {
        newErrors.smtpPort = 'A porta deve ser um número';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSettings()) {
      return;
    }
    
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset settings to default
  const handleReset = () => {
    if (confirm('Tem certeza que deseja redefinir todas as configurações para os valores padrão?')) {
      setSettings(defaultSettings);
      setErrors({});
      setSaveStatus('idle');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Configurações do Sistema</h2>
        <div className="space-x-2">
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
            disabled={isLoading}
          >
            Redefinir
          </button>
          <button
            onClick={handleSave}
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : 'Salvar Configurações'}
          </button>
        </div>
      </div>

      {/* Status messages */}
      {saveStatus === 'success' && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded" role="alert">
          <p>Configurações salvas com sucesso!</p>
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p>Erro ao salvar as configurações. Por favor, tente novamente.</p>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-3 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Geral
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Segurança
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`py-3 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'email'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Email
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                  <input
                    type="text"
                    name="companyName"
                    value={settings.general.companyName}
                    onChange={handleGeneralChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNPJ da Empresa</label>
                  <input
                    type="text"
                    name="taxId"
                    value={settings.general.taxId}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL do Logo</label>
                  <input
                    type="text"
                    name="logoUrl"
                    value={settings.general.logoUrl}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Moeda</label>
                  <select
                    name="currency"
                    value={settings.general.currency}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="requireStrongPasswords"
                    checked={settings.security.requireStrongPasswords}
                    onChange={handleSecurityChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Exigir senhas fortes</label>
                  <p className="text-gray-500">
                    Senhas devem ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tempo de expiração da sessão (minutos)
                </label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={settings.security.sessionTimeout}
                  onChange={handleSecurityNumberChange}
                  min="5"
                  max="1440"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="twoFactorAuth"
                    checked={settings.security.twoFactorAuth}
                    onChange={handleSecurityChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Autenticação de dois fatores</label>
                  <p className="text-gray-500">
                    Habilitar verificação adicional ao fazer login (ainda em desenvolvimento).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex items-start mb-4">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="enableEmailNotifications"
                    checked={settings.email.enableEmailNotifications}
                    onChange={handleEmailChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Habilitar notificações por email</label>
                  <p className="text-gray-500">
                    Enviar emails automáticos para recibos gerados e outras ações.
                  </p>
                </div>
              </div>

              {settings.email.enableEmailNotifications && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Configurações de SMTP</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email do Remetente</label>
                      <input
                        type="email"
                        name="senderEmail"
                        value={settings.email.senderEmail}
                        onChange={handleEmailChange}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.senderEmail ? 'border-red-500' : 'border-gray-300'
                        } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
                      />
                      {errors.senderEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.senderEmail}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Servidor SMTP</label>
                      <input
                        type="text"
                        name="smtpServer"
                        value={settings.email.smtpServer}
                        onChange={handleEmailChange}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.smtpServer ? 'border-red-500' : 'border-gray-300'
                        } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
                        placeholder="smtp.seudominio.com"
                      />
                      {errors.smtpServer && (
                        <p className="mt-1 text-sm text-red-600">{errors.smtpServer}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Porta SMTP</label>
                      <input
                        type="text"
                        name="smtpPort"
                        value={settings.email.smtpPort}
                        onChange={handleEmailChange}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.smtpPort ? 'border-red-500' : 'border-gray-300'
                        } shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500`}
                        placeholder="587 ou 465"
                      />
                      {errors.smtpPort && (
                        <p className="mt-1 text-sm text-red-600">{errors.smtpPort}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Usuário SMTP</label>
                      <input
                        type="text"
                        name="smtpUser"
                        value={settings.email.smtpUser}
                        onChange={handleEmailChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Senha SMTP</label>
                      <input
                        type="password"
                        name="smtpPassword"
                        value={settings.email.smtpPassword}
                        onChange={handleEmailChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
