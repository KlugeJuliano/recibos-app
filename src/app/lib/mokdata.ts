import { Loja, Users, Recibos } from "../types";
import { v4 as uuid } from "uuid";


export const lojas: Loja[] = [
  { id: "loja1", loja: "Loja Central", cnpj: "00.000.000/0001-00" },
  { id: "loja2", loja: "Loja Bairro", cnpj: "11.111.111/0001-11" },
];

export const usuarios: Users[] = [
  {
      id: "u1", email: "admin@central.com", password: "123456", lojaId: "loja1",
      name: "Juliano",
      role: "Gerente"
  },
  {
      id: "u2", email: "admin@bairro.com", password: "123456", lojaId: "loja2",
      name: "Peão",
      role: "nehuma"
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
