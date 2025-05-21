'use client'

import { useEffect, useState } from 'react'

type Props = {
  dados: {
    name: string
    setor: string
    funcaoDesempenhada: string
    horaInicio: string
    horaIntervalo: string
    horaVoltaIntervalo: string
    horaFinal: string
    valorPagamento: number
    dataRecibo: string
  }
  onClose: () => void
}

export default function ReciboPrint({ dados, onClose }: Props) {
  const [reciboId, setReciboId] = useState('')
  const [geradoEm, setGeradoEm] = useState('')

  useEffect(() => {
    setReciboId(crypto.randomUUID())
    setGeradoEm(new Date().toLocaleString('pt-BR'))
  }, [])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white text-black shadow-md print:shadow-none print:bg-white print:p-0">
      <div className="text-lg leading-8">
        <p>
          Eu, <strong>{dados.name}</strong>, recebi de <strong>{dados.setor}</strong> a quantia de <strong>R$ {dados.valorPagamento.toFixed(2)}</strong> referente a <strong>{dados.funcaoDesempenhada}</strong>, no dia <strong>{dados.dataRecibo}</strong>, nos períodos <strong>{dados.horaInicio}</strong>, <strong>{dados.horaIntervalo}</strong>, <strong>{dados.horaVoltaIntervalo}</strong> e <strong>{dados.horaFinal}</strong>.
        </p>

        <div className="mt-12">
          <div className="flex justify-between mt-6">
            <div>
              <p className="border-t border-black w-64 text-center mt-6">Assinatura do Recebedor</p>
            </div>
            <div>
              <p className="border-t border-black w-64 text-center mt-6">Assinatura do Gerente</p>
            </div>
          </div>

          <div className="mt-12 text-sm">
            <p><strong>Nº do Recibo:</strong> {reciboId}</p>
            <p><strong>Gerado em:</strong> {geradoEm}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-4 no-print">
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Imprimir</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Fechar</button>
        </div>
      </div>
    </div>
  )
}
