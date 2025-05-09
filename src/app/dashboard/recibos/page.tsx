'use client';

import { useState } from 'react';

export default function RecibosPage() {
  const [form, setForm] = useState({
    dataRecibo: '',
    time: '',
    lojaId: '',
    userId: '',
    name: '',
    valor: 150,
    funcaoDesempenhada: '',
    setor: '',
    horaInicio: '',
    horaIntervalo: '',
    horaVoltaIntervalo: '',
    horaFinal: '',
    valorPagamento: '',
  });

  const calculateValorPagamento = () => {
    const {
      horaInicio,
      horaIntervalo,
      horaVoltaIntervalo,
      horaFinal,
      valor
    } = form;
  
    if (!horaInicio || !horaIntervalo || !horaVoltaIntervalo || !horaFinal || !valor) return;
  
    const toDate = (hora: string) => new Date(`1970-01-01T${hora}:00`);
  
    const inicio = toDate(horaInicio);
    const inicioIntervalo = toDate(horaIntervalo);
    const voltaIntervalo = toDate(horaVoltaIntervalo);
    const fim = toDate(horaFinal);
  
    // Tempo trabalhado antes do almoço
    const antesAlmoco = (inicioIntervalo.getTime() - inicio.getTime()) / 1000 / 60 / 60;
  
    // Tempo trabalhado depois do almoço
    const depoisAlmoco = (fim.getTime() - voltaIntervalo.getTime()) / 1000 / 60 / 60;
  
    const horasTrabalhadas = antesAlmoco + depoisAlmoco;
  
    const valorDia = valor;
    const valorPorHora = valorDia / 8;
  
    const valorTotal = horasTrabalhadas * valorPorHora;
  
    setForm((prev) => ({
      ...prev,
      valorPagamento: valorTotal.toFixed(2) // Convert to string
    }));
  };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do recibo:', form);
    alert('Recibo preenchido com sucesso!');
    // Futuramente, aqui você insere a chamada ao Supabase
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Emitir Recibo Completo</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
       
          
          <div>
          <label className="block text-gray-700">Entrada</label>
          <input type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} placeholder="Entrada manhã" className="input" />
          </div>
          <div>
          <label className="block text-gray-700">Saída para intervalo</label>
          <input type="time" name="horaIntervalo" value={form.horaIntervalo} onChange={handleChange} placeholder="Início Intervalo" className="input" />
            </div>
          <div>
          <label className="block text-gray-700">Volta do intervalo</label>
          <input type="time" name="horaVoltaIntervalo" value={form.horaVoltaIntervalo} onChange={handleChange} placeholder="Volta Intervalo" className="input" />
          </div>
          <div> 
          <label className="block text-gray-700">Saída</label>
          <input type="time" name="horaFinal" value={form.horaFinal} onChange={handleChange} placeholder="Final" className="input" />
          </div>

          <select
             name="setor"
             value={form.setor}
             onChange={handleChange}
             className="input"
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
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nome" className="input" />
          <input type="text" name="funcaoDesempenhada" value={form.funcaoDesempenhada} onChange={handleChange} placeholder="Função Desempenhada" className="input" />

          

          <div className="col-span-1 md:col-span-2 text-right mt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Emitir Recibo
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
