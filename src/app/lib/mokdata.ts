import { Loja, Users, Recibos, Company, Sector } from "../types";
import { v4 as uuid } from "uuid";

export const companies: Company[] = [
  { id: "company1", name: "Empresa ABC", cnpj: "22.222.222/0001-22" },
  { id: "company2", name: "Grupo XYZ", cnpj: "33.333.333/0001-33" },
];

export const sectors: Sector[] = [
  { id: "sector1", name: "Vendas", description: "Setor de vendas" },
  { id: "sector2", name: "Financeiro", description: "Setor financeiro" },
  { id: "sector3", name: "Estoque", description: "Gestão de estoque" },
  { id: "sector4", name: "Atendimento", description: "Atendimento ao cliente" },
];

export const lojas: Loja[] = [
  { 
    id: "loja1", 
    loja: "Loja Central", 
    cnpj: "00.000.000/0001-00",
    companyId: "company1",
    address: "Rua Principal, 100",
    phone: "(11) 1234-5678",
    sectors: [
      { id: "sector1", name: "Vendas", description: "Setor de vendas" },
      { id: "sector2", name: "Financeiro", description: "Setor financeiro" }
    ]
  },
  { 
    id: "loja2", 
    loja: "Loja Bairro", 
    cnpj: "11.111.111/0001-11",
    companyId: "company2",
    address: "Av. Secundária, 200",
    phone: "(11) 8765-4321",
    sectors: [
      { id: "sector3", name: "Estoque", description: "Gestão de estoque" },
      { id: "sector4", name: "Atendimento", description: "Atendimento ao cliente" }
    ]
  },
];

export const usuarios: Users[] = [
  {
    id: "u1",
    email: "admin@central.com",
    lojaId: "loja1",
    name: "Juliano",
    role: "Gerente",
    companyId: "company1"
  },
  {
    id: "u2",
    email: "admin@bairro.com",
    lojaId: "loja2",
    name: "Peão",
    role: "nehuma",
    companyId: "company2"
  },
];

export const recibos: Recibos[] = [
  {
    id: uuid(),
    lojaId: "loja1",
    userId: "u1",
    name: "João da Silva",
    valor: 120.0,
    funcaoDesempenhada: "Serviço de manutenção",
    dataRecibo: new Date().toISOString(),
    time: "",
    setor: "",
    horaInicio: "",
    horaIntervalo: "",
    horaVoltaIntervalo: "",
    horaFinal: "",
    valorPagamento: 0
  },
  {
    id: uuid(),
    lojaId: "loja2",
    userId: "u2",
    name: "Maria Oliveira",
    valor: 89.9,
    funcaoDesempenhada: "Venda de produto",
    dataRecibo: new Date().toISOString(),
    time: "",
    setor: "",
    horaInicio: "",
    horaIntervalo: "",
    horaVoltaIntervalo: "",
    horaFinal: "",
    valorPagamento: 0
  },
];
