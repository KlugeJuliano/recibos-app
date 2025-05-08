export type Loja = {
    id: string;
    loja: string;
    cnpj: string;

}

export type Users = {
    id: string;
    name: string;
    password: string;
    lojaId: string;
    role: string;
    email:string;
}

export type Recibos = {
    id: string;
    dataRecibo: string;
    time: string;
    lojaId: string;
    userId: string;
    name: string;
    valor: number;
    funcaoDesempenhada: string;
    setor: string;
    horaInicio: string;
    horaIntervalo: string;
    horaVoltaIntervalo: string;
    horaFinal: string;
    valorPagamento: number;

}