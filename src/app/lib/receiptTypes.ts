export type ReceiptType = {
  id: string;
  name: string;
  emoji: string;
  free: boolean;
  description: string;
};

export const receiptTypes: ReceiptType[] = [
  { id: 'aluguel', name: 'Aluguel', emoji: '🏠', free: true, description: 'Comprovante para recebimento de aluguel.' },
  { id: 'servico', name: 'Servico', emoji: '🧾', free: true, description: 'Recibo para prestacao de servicos.' },
  { id: 'pagamento-geral', name: 'Pagamento geral', emoji: '💳', free: true, description: 'Recibo simples para pagamentos diversos.' },
  { id: 'trabalhista', name: 'Trabalhista', emoji: '👷', free: false, description: 'Recibo para diarias, turnos e pagamentos operacionais.' },
  { id: 'honorarios', name: 'Honorarios', emoji: '💼', free: false, description: 'Recibo de honorarios profissionais.' },
  { id: 'doacao', name: 'Doacao', emoji: '🤝', free: false, description: 'Comprovante formal de doacao.' },
  { id: 'emprestimo', name: 'Emprestimo', emoji: '💰', free: false, description: 'Recibo para acordo de emprestimo.' },
  { id: 'caucao', name: 'Caucao', emoji: '🔐', free: false, description: 'Recibo para recebimento de caucao.' },
  { id: 'condominio', name: 'Condominio', emoji: '🏢', free: false, description: 'Recibo para taxas condominiais.' },
  { id: 'venda-imovel', name: 'Venda de imovel', emoji: '🏘️', free: false, description: 'Recibo de sinal ou arras.' },
  { id: 'juridico', name: 'Juridico', emoji: '⚖️', free: false, description: 'Recibo para acordo juridico.' },
  { id: 'personalizado', name: 'Personalizado', emoji: '✍️', free: false, description: 'Modelo adaptavel para casos especificos.' },
];

export const getReceiptType = (id?: string | null) =>
  receiptTypes.find((type) => type.id === id) ?? receiptTypes[0];
