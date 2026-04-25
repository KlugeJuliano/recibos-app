export interface Sector {
  id: string;
  name: string;
  description?: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
}

export interface Loja {
  id: string;
  loja: string;
  cnpj: string;
  companyId: string;
  address?: string;
  phone?: string;
  sectors: Sector[];
}

export interface Users {
  id: string;
  email: string;
  lojaId: string;
  name: string;
  role: string;
  companyId: string;
}

export interface Recibos {
  id: string;
  lojaId: string;
  userId: string;
  name: string;
  valor: number;
  funcaoDesempenhada: string;
  dataRecibo: string;
  time: string;
  setor: string;
  horaInicio: string;
  horaIntervalo: string;
  horaVoltaIntervalo: string;
  horaFinal: string;
  valorPagamento: number;
}
