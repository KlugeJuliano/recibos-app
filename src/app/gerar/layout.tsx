import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gerador de Recibo Online Grátis | ReciboPro',
  description: 'Faça recibo online grátis agora. Escolha o tipo, preencha os dados e baixe em PDF na hora, sem cadastro.',
};

export default function GerarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}