'use client';

import ReciboPrint from './impressaoRecibo'; 

import { useState } from 'react'; 




export default function RecibosPage() { 
  const [form, setForm] = useState({
    dataRecibo: '',
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

  const calculateValorPagamento = () => {
    const {
      horaInicio,
      horaIntervalo,
      horaVoltaIntervalo,
      horaFinal,
      valor
    } = form;

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
    const valorTotal = horasTrabalhadas * valorPorHora;

    setForm((prev) => ({
      ...prev,
      valorPagamento: valorTotal.toFixed(2)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const erro = validarHorario(form);
  if (erro) {
    alert(erro);
    return;
  }

  calculateValorPagamento();
  setMostrarRecibo(true);
};


  return (
    <>
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold text-blue-700 mb-6">Emitir Recibo Completo</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Entrada</label>
              <input type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-gray-700">Saída para intervalo</label>
              <input type="time" name="horaIntervalo" value={form.horaIntervalo} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="block text-gray-700">Volta do intervalo</label>
              <input type="time" name="horaVoltaIntervalo" value={form.horaVoltaIntervalo} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="block text-gray-700">Saída</label>
              <input type="time" name="horaFinal" value={form.horaFinal} onChange={handleChange} className="input" required />
            </div>

            <div>
              <label className="block text-gray-700">Setor</label>
              <select name="setor" value={form.setor} onChange={handleChange} className="input">
                <option value="">Selecione o setor</option>
                <option value="Caixa">Caixa</option>
                <option value="Repositor">Repositor</option>
                <option value="Açougue">Açougue</option>
                <option value="Padaria">Padaria</option>
                <option value="Limpeza">Limpeza</option>
                <option value="Estoque">Estoque</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

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
      {mostrarRecibo && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl w-full">
              <ReciboPrint
                dados={{
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
            </div>
          </div>
        </>
      )}
    </>
  );
}
