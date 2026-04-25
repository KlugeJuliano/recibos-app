'use client'

import { Component, ErrorInfo, ReactNode, useEffect, useRef, useState } from 'react'

type Props = {
  dados: {
    loja: string
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

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode, fallback?: ReactNode }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro no componente de recibo:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 max-w-2xl mx-auto bg-white text-black shadow-md" role="alert">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erro ao gerar recibo</h2>
          <p>Ocorreu um erro ao processar o recibo. Por favor, tente novamente.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            aria-label="Tentar novamente"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Validação de formato de hora (HH:MM)
const isValidTimeFormat = (time: string): boolean => {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

// Converter número para extenso (português brasileiro)
const valorPorExtenso = (valor: number): string => {
  if (isNaN(valor) || valor < 0) return "valor inválido";
  
  // Separar parte inteira e decimal
  const partes = valor.toFixed(2).split('.');
  const reais = parseInt(partes[0]);
  const centavos = parseInt(partes[1]);
  
  // Arrays para conversão de números
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezADezenove = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  
  // Função para converter número menor que 1000
  const converterGrupo = (num: number): string => {
    if (num === 0) return '';
    if (num === 100) return 'cem';
    
    let resultado = '';
    
    // Centenas
    if (num >= 100) {
      resultado += centenas[Math.floor(num / 100)] + ' ';
      num %= 100;
      if (num > 0) resultado += 'e ';
    }
    
    // Dezenas e unidades
    if (num >= 10 && num < 20) {
      resultado += dezADezenove[num - 10];
    } else {
      if (num >= 20) {
        resultado += dezenas[Math.floor(num / 10)];
        num %= 10;
        if (num > 0) resultado += ' e ';
      }
      
      if (num > 0) {
        resultado += unidades[num];
      }
    }
    
    return resultado.trim();
  };
  
  // Converter reais
  let resultado = '';
  if (reais === 0 && centavos === 0) {
    return 'zero reais';
  }
  
  if (reais > 0) {
    resultado = converterGrupo(reais) + (reais === 1 ? ' real' : ' reais');
  }
  
  // Converter centavos
  if (centavos > 0) {
    if (reais > 0) resultado += ' e ';
    resultado += converterGrupo(centavos) + (centavos === 1 ? ' centavo' : ' centavos');
  }
  
  return resultado;
};

export default function ReciboPrint({ dados, onClose }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [reciboId, setReciboId] = useState('')
  const [geradoEm, setGeradoEm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Validar os dados do recibo
  useEffect(() => {
    const errors: string[] = [];

    // Validar campos obrigatórios
    if (!dados.name) errors.push('Nome é obrigatório');
    if (!dados.setor) errors.push('Setor é obrigatório');
    if (!dados.funcaoDesempenhada) errors.push('Função desempenhada é obrigatória');
    if (!dados.dataRecibo) errors.push('Data do recibo é obrigatória');
    
    // Validar horários
    if (!dados.horaInicio || !isValidTimeFormat(dados.horaInicio)) 
      errors.push('Hora de início inválida');
    if (!dados.horaFinal || !isValidTimeFormat(dados.horaFinal)) 
      errors.push('Hora de saída inválida');
      
    // Validar horários de intervalo, se fornecidos
    if (dados.horaIntervalo && !isValidTimeFormat(dados.horaIntervalo))
      errors.push('Hora de intervalo inválida');
    if (dados.horaVoltaIntervalo && !isValidTimeFormat(dados.horaVoltaIntervalo))
      errors.push('Hora de volta do intervalo inválida');
      
    // Validar valor
    if (isNaN(dados.valorPagamento) || dados.valorPagamento <= 0)
      errors.push('Valor de pagamento inválido');
      
    setValidationErrors(errors);
  }, [dados]);

  useEffect(() => {
    try {
      setIsLoading(true);
      setReciboId(crypto.randomUUID());
      setGeradoEm(new Date().toLocaleString('pt-BR'));
    } catch (error) {
      console.error("Erro ao gerar ID do recibo:", error);
      setReciboId('Erro ao gerar ID');
    } finally {
      setIsLoading(false);
    }
  }, [])
  
  // Formatar a data brasileira (DD/MM/YYYY)
  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(data);
    } catch (e) {
      // Se houver erro ao converter a data, retorna a string original
      return dataString;
    }
  }
  
  // Formatar o valor monetário (R$ X,XX)
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
  
  // Verificar se há intervalos registrados
  const temIntervalo = dados.horaIntervalo && dados.horaVoltaIntervalo;

  const handlePrint = () => {
    const receiptContent = receiptRef.current;
    if (!receiptContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Recibo ${reciboId}</title>
          <style>
            body { margin: 0; padding: 32px; background: #fff; color: #000; font-family: Georgia, 'Times New Roman', serif; }
            .receipt-only { max-width: 720px; margin: 0 auto; }
            @page { size: A4; margin: 18mm; }
          </style>
        </head>
        <body>
          <main class="receipt-only">${receiptContent.innerHTML}</main>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  const handleDownloadPdf = async () => {
    try {
      setPdfError('');
      setIsPdfLoading(true);
      const response = await fetch('/api/recibos/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dados, id: reciboId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Não foi possível gerar o PDF.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-${reciboId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : 'Não foi possível gerar o PDF.');
    } finally {
      setIsPdfLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white text-black shadow-md" role="status">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="sr-only">Carregando...</span>
        </div>
      </div>
    );
  }

  if (validationErrors.length > 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white text-black shadow-md" role="alert">
        <h2 className="text-xl font-bold text-red-600 mb-4">Erro nos dados do recibo</h2>
        <ul className="list-disc pl-5 mb-4">
          {validationErrors.map((error, index) => (
            <li key={index} className="text-red-600">{error}</li>
          ))}
        </ul>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          aria-label="Fechar e voltar ao formulário"
        >
          Voltar ao formulário
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-2xl mx-auto bg-white text-black shadow-md print:shadow-none print:bg-white print:p-0" role="document">
        <div ref={receiptRef}>
          <h1 className="text-center text-xl font-bold mb-6 print:mb-4">RECIBO DE PAGAMENTO</h1>
          <div className="text-lg leading-8 print:leading-7">
            <p className="mb-4">
              Eu, <strong>{dados.name}</strong>, declaro que recebi de <strong>{dados.loja}</strong> a quantia de <strong>{formatarValor(dados.valorPagamento)}</strong> (
                <span>{valorPorExtenso(dados.valorPagamento)}</span>
              ) referente a serviços de <strong>{dados.funcaoDesempenhada}</strong> realizados no dia <strong>{formatarData(dados.dataRecibo)}</strong>.
            </p>
            
            <p className="mb-4">
              <strong>Horário de trabalho:</strong><br />
              Entrada: <strong>{dados.horaInicio}h</strong><br />
              Saída: <strong>{dados.horaFinal}h</strong>
              
              {temIntervalo && (
                <>
                  <br />
                  <br />
                  <strong>Intervalo:</strong><br />
                  Saída para intervalo: <strong>{dados.horaIntervalo}h</strong><br />
                  Retorno do intervalo: <strong>{dados.horaVoltaIntervalo}h</strong>
                </>
              )}
            </p>
          </div>
          
          <div className="mt-10 print:mt-12">
            <p className="text-right mb-8 print:mb-10">
              São Paulo, {formatarData(dados.dataRecibo)}
            </p>
            
            <div className="flex justify-between items-end print:mt-8">
              <div className="w-5/12">
                <div className="border-t border-black pt-1">
                  <p className="text-center">{dados.name}</p>
                  <p className="text-center text-sm text-gray-600">CPF: ___.___.___-__</p>
                </div>
              </div>
              
              <div className="w-5/12">
                <div className="border-t border-black pt-1">
                  <p className="text-center">Responsável {dados.setor}</p>
                  <p className="text-center text-sm text-gray-600">Carimbo e assinatura</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-4 border-t border-gray-300 text-xs text-gray-600 print:mt-16">
            <p><strong>Nº do Recibo:</strong> {reciboId}</p>
            <p><strong>Gerado em:</strong> {geradoEm}</p>
            <p className="mt-1 print:mt-2">Este recibo é válido como comprovante de pagamento.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          <button 
            onClick={handlePrint} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            aria-label="Imprimir recibo"
          >
            Imprimir
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label="Baixar PDF do recibo"
            disabled={isPdfLoading}
          >
            {isPdfLoading ? 'Gerando PDF...' : 'Baixar PDF'}
          </button>
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            aria-label="Fechar janela de recibo"
          >
            Fechar
          </button>
        </div>
        {pdfError && <p className="mt-3 text-sm text-red-600 print:hidden">{pdfError}</p>}
      </div>
    </ErrorBoundary>
  );
}
