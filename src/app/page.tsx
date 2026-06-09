import { Metadata } from 'next';
import HomeContent from '@/components/HomeContent';

export const metadata = {
  title: 'ReciboPro | Gerador de Recibos Online',
  description: 'Gere recibos profissionais online, visualize na hora e baixe em PDF.',
};

export default function HomePage() {
  return <HomeContent />;
}
