'use client';

import ReciboPrint from './impressaoRecibo'; 
import { useState, useEffect } from 'react'; 
import { createClient } from '@/utils/supabase/client';
import { getUserProfile } from '@/utils/supabase/profile';
import { CompanyRepository } from '@/app/repositories/CompanyRepository';
import { getCompanyPlan, canAccessFeature } from '@/app/lib/planGuard';
import './print.css';

export default function RecibosPage() { 
  const [form, setForm] = useState({
    id: '',
    dataRecibo: new Date().toISOString().split('T')[0],
    time: '',
    lojaId: '',
    userId: '',
    name: '',
    valor: 15,
    funcaoDesempenhada: '',
    setor: '',
    horaInicio: '',
    horaIntervalo: '',
    horaVoltaIntervalo: '',
    horaFinal: '',
    valorPagamento: '',
  });
  const [mostrarRecibo, setMostrarRecibo] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [companyPlan, setCompanyPlan] = useState<'free' | 'pro' | 'business'>('free');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadCompanyPlan();
  }, []);

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

  const canSendEmail = canAccessFeature(companyPlan, 'auto_send');

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess(false);
    setIsSendingEmail(true);

    try {
      const response = await fetch(`/api/recibos/${form.id}/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar e-mail.');
      }

      setEmailSuccess(true);
      setEmailTo('');
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess(false);
      }, 2000);
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Erro ao enviar e-mail.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  function validarHorario(horarios: {
    horaInicio: string;
    horaIntervalo: string;
    horaVoltaIntervalo: string;
    horaFinal: string;
  }): string | null {
    const {
      horaInicio,
      horaIntervalo,
      horaVoltaIntervalo,
      horaFinal,
    } = horarios;

    if (!horaInicio || !horaFinal) {
      return 'Hora de entrada e saída são obrigatórias';
    }

    const intervaloPreenchido = horaIntervalo && horaVoltaIntervalo;
    const intervaloParcial =
      (horaIntervalo && !horaVoltaIntervalo) ||
      (!horaIntervalo && horaVoltaIntervalo);

    if (intervaloParcial) {
      return 'Se preencher o intervalo, preencha os dois horários';
    }

    const toDate = (hora: string) => new Date(`1970-01-01T${hora}:00`);

    const inicio = toDate(horaInicio);
    const fim = toDate(horaFinal);

    if (inicio >= fim) {
      return 'A hora de entrada deve ser menor que a hora de saída';
    }

    if (intervaloPreenchido) {
      const intervalo = toDate(horaIntervalo);
      const volta = toDate(horaVoltaIntervalo);

      if (!(inicio < intervalo && intervalo < volta && volta < fim)) {
        return 'Ordem dos horários inválida (esperado: Entrada < Intervalo < Volta < Saída)';
      }
    }

    return null;
  }

  const calculateValorPagamento = (currentForm = form) => {
    const {
      horaInicio,
      horaIntervalo,
      horaVoltaIntervalo,
      horaFinal,
      valor
    } = currentForm;

    const toDate = (hora: string) => new Date(`1970-01-01T${hora}:00`);

    const inicio = toDate(horaInicio);
    const fim = toDate(horaFinal);

    let horasTrabalhadas = 0;

    if (horaIntervalo && horaVoltaIntervalo) {
      const inicioIntervalo = toDate(horaIntervalo);
      const voltaIntervalo = toDate(horaVoltaIntervalo);

      const antesAlmoco = (inicioIntervalo.getTime() - inicio.getTime()) / 1000 / 60 / 60;
      const depoisAlmoco = (fim.getTime() - voltaIntervalo.getTime()) / 1000 / 60 / 60;
      horasTrabalhadas = antesAlmoco + depoisAlmoco;
    } else {
      horasTrabalhadas = (fim.getTime() - inicio.getTime()) / 1000 / 60 / 60;
    }

    const valorPorHora = valor / 8;
    return Number((horasTrabalhadas * valorPorHora).toFixed(2));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

 const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Validar campos obrigatórios
    if (!form.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    
    if (!form.setor) {
      errors.setor = 'Setor é obrigatório';
    }
    
    if (!form.funcaoDesempenhada.trim()) {
      errors.funcaoDesempenhada = 'Função desempenhada é obrigatória';
    }
    
    if (!form.dataRecibo) {
      errors.dataRecibo = 'Data é obrigatória';
    }
    
    // Validar horários
    const horarioErro = validarHorario(form);
    if (horarioErro) {
      errors.horario = horarioErro;
    }
    
    return errors;
  };

  const resetForm = () => {
    setForm({
      id: '',
      dataRecibo: new Date().toISOString().split('T')[0],
      time: '',
      lojaId: '',
      userId: '',
      name: '',
      valor: 15,
      funcaoDesempenhada: '',
      setor: '',
      horaInicio: '',
      horaIntervalo: '',
      horaVoltaIntervalo: '',
      horaFinal: '',
      valorPagamento: '',
    });
    setFormErrors({});
    setGeneralError(null);
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setGeneralError(null);
  
  try {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    const valorPagamento = calculateValorPagamento();
    const payload = {
      ...form,
      valor: Number(form.valor),
      valorPagamento,
    };

    const response = await fetch('/api/recibos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || 'O recibo não pôde ser salvo.');
    }

    const createdRecibo = await response.json();
    
    setForm((prev) => ({
      ...prev,
      valorPagamento: valorPagamento.toFixed(2),
      id: createdRecibo.id,
    }));

    setMostrarRecibo(true);
  } catch (error) {
    console.error('Erro ao processar recibo:', error);
    setGeneralError(
      error instanceof Error
        ? error.message
        : 'Ocorreu um erro ao processar o recibo. Tente novamente.'
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold text-blue-700 mb-6">Emitir Recibo Completo</h1>

          {generalError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{generalError}</p>
                </div>
              </div>
            </div>
          )}

          {formErrors.horario && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{formErrors.horario}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            {/* Informações básicas */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">Informações Básicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700">
                    Data do Recibo <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="dataRecibo" 
                    value={form.dataRecibo} 
                    onChange={handleChange} 
                    className={`input w-full ${formErrors.dataRecibo ? 'border-red-500' : ''}`} 
                  />
                  {formErrors.dataRecibo && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.dataRecibo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700">
                    Valor da Diária (R$)
                  </label>
                  <input 
                    type="number" 
                    name="valor" 
                    value={form.valor} 
                    onChange={handleChange} 
                    min="1"
                    step="0.01"
                    className="input w-full" 
                  />
                  <p className="text-gray-500 text-xs mt-1">Valor base para cálculo da remuneração</p>
                </div>
              </div>
            </div>
            
            {/* Informações pessoais */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">Informações Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    placeholder="Nome completo do prestador" 
                    className={`input w-full ${formErrors.name ? 'border-red-500' : ''}`} 
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700">
                    Setor <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="setor" 
                    value={form.setor} 
                    onChange={handleChange} 
                    className={`input w-full ${formErrors.setor ? 'border-red-500' : ''}`}
                  >
                    <option value="">Selecione o setor</option>
                    <option value="Caixa">Caixa</option>
                    <option value="Repositor">Repositor</option>
                    <option value="Açougue">Açougue</option>
                    <option value="Padaria">Padaria</option>
                    <option value="Limpeza">Limpeza</option>
                    <option value="Estoque">Estoque</option>
                    <option value="Outros">Outros</option>
                  </select>
                  {formErrors.setor && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.setor}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700">
                    Função Desempenhada <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="funcaoDesempenhada" 
                    value={form.funcaoDesempenhada} 
                    onChange={handleChange} 
                    placeholder="Descrição da função exercida" 
                    className={`input w-full ${formErrors.funcaoDesempenhada ? 'border-red-500' : ''}`} 
                  />
                  {formErrors.funcaoDesempenhada && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.funcaoDesempenhada}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Registro de horários */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">Registro de Horários</h2>
              <p className="text-sm text-gray-500 mb-4">
                Preencha os horários de entrada e saída. O intervalo é opcional, mas se preenchido, ambos os campos devem ser informados.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700">
                    Entrada <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="time" 
                    name="horaInicio" 
                    value={form.horaInicio} 
                    onChange={handleChange} 
                    className={`input w-full ${formErrors.horario ? 'border-red-500' : ''}`} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700">
                    Saída <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="time" 
                    name="horaFinal" 
                    value={form.horaFinal} 
                    onChange={handleChange} 
                    className={`input w-full ${formErrors.horario ? 'border-red-500' : ''}`} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700">
                    Saída para intervalo
                  </label>
                  <input 
                    type="time" 
                    name="horaIntervalo" 
                    value={form.horaIntervalo} 
                    onChange={handleChange} 
                    className={`input w-full ${formErrors.horario ? 'border-red-500' : ''}`} 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700">
                    Volta do intervalo
                  </label>
                  <input 
                    type="time" 
                    name="horaVoltaIntervalo" 
                    value={form.horaVoltaIntervalo} 
                    onChange={handleChange} 
                    className={`input w-full ${formErrors.horario ? 'border-red-500' : ''}`} 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button 
                type="button" 
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
              >
                Limpar Formulário
              </button>
              
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : (
                  'Emitir Recibo'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      {mostrarRecibo && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl w-full">
              <ReciboPrint
                dados={{
                  loja: 'Loja Exemplo',
                  name: form.name,
                  setor: form.setor,
                  funcaoDesempenhada: form.funcaoDesempenhada,
                  horaInicio: form.horaInicio,
                  horaIntervalo: form.horaIntervalo,
                  horaVoltaIntervalo: form.horaVoltaIntervalo,
                  horaFinal: form.horaFinal,
                  valorPagamento: Number(form.valorPagamento) || 0,
                  dataRecibo: form.dataRecibo,
                }}
                onClose={() => setMostrarRecibo(false)}
              />
              
              {/* Email button */}
              {canSendEmail && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                  >
                    Enviar por e-mail
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Enviar recibo por e-mail</h3>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email do destinatário</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="destinatario@exemplo.com"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                />
              </div>
              
              {emailError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {emailError}
                </div>
              )}
              
              {emailSuccess && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  E-mail enviado com sucesso!
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border rounded-md bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md"
                  disabled={isSendingEmail}
                >
                  {isSendingEmail ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
