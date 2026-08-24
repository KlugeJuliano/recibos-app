import { Metadata } from 'next';
import HomeContent from '@/components/HomeContent';

export const metadata = {
  title: 'ReciboPro | Gerador de Recibos Online',
  description: 'Gerador de recibo online grátis. Crie recibos profissionais, visualize na hora e baixe em PDF sem instalar nada.',
};

export default function HomePage() {
  return <HomeContent />;
}
