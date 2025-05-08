'use client';

import { useState } from 'react';

export default function RecibosPage() {
  const [form, setForm] = useState({
    dataRecibo: '',
    time: '',
    lojaId: '',
    userId: '',
    name: '',
    valor: '',
    funcaoDesempenhada: '',
    setor: '',
    horaInicio: '',
    horaIntervalo: '',
    horaVoltaIntervalo: '',
    horaFinal: '',
    valorPagamento: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <input type="date" name="dataRecibo" value={form.dataRecibo} onChange={handleChange} placeholder="Data do Recibo" className="input" />
          <input type="time" name="time" value={form.time} onChange={handleChange} placeholder="Hora" className="input" />
          <input type="text" name="lojaId" value={form.lojaId} onChange={handleChange} placeholder="ID da Loja" className="input" />
          <input type="text" name="userId" value={form.userId} onChange={handleChange} placeholder="ID do Usuário" className="input" />
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nome" className="input" />
          <input type="number" step="0.01" name="valor" value={form.valor} onChange={handleChange} placeholder="Valor Bruto" className="input" />
          <input type="text" name="funcaoDesempenhada" value={form.funcaoDesempenhada} onChange={handleChange} placeholder="Função Desempenhada" className="input" />
          <input type="text" name="setor" value={form.setor} onChange={handleChange} placeholder="Setor" className="input" />
          <input type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} placeholder="Início" className="input" />
          <input type="time" name="horaIntervalo" value={form.horaIntervalo} onChange={handleChange} placeholder="Início Intervalo" className="input" />
          <input type="time" name="horaVoltaIntervalo" value={form.horaVoltaIntervalo} onChange={handleChange} placeholder="Volta Intervalo" className="input" />
          <input type="time" name="horaFinal" value={form.horaFinal} onChange={handleChange} placeholder="Final" className="input" />
          <input type="number" step="0.01" name="valorPagamento" value={form.valorPagamento} onChange={handleChange} placeholder="Valor a Pagar" className="input" />

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
