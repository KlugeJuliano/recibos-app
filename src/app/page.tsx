
import Link from 'next/link';


export default function HomePage() {
  return (
    
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero */}
      <header className="bg-blue-600 text-white py-20 px-4 text-center">
  <div className="max-w-4xl mx-auto">
    <img
      src="/invoice.svg"
      alt="Ilustração de recibo"
      className="w-64 mx-auto mb-8"
    />
    <h1 className="text-5xl font-bold mb-4">Sistema de Emissão de Recibos</h1>
    <p className="text-lg max-w-2xl mx-auto">
      Uma solução simples e poderosa para gerenciar recibos, relatórios e lojas com segurança e agilidade.
    </p>
    
      <Link
      href="/login"
      className="inline-block mt-8 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
    >
      Acessar o Sistema
    </Link>
    
      
  </div>
</header>


      {/* Benefícios */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-semibold mb-10 text-gray-800">Por que usar nosso sistema?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2 text-gray-500">Simples de Usar</h3>
            <p className="text-gray-600">Interface intuitiva para gerar e gerenciar recibos em segundos.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2 text-gray-500">Multi-lojas</h3>
            <p className="text-gray-600">Controle centralizado para múltiplas unidades com segurança.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2 text-gray-500">Relatórios Detalhados</h3>
            <p className="text-gray-600">Acompanhe os dados de emissão em tempo real com filtros e exportação.</p>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-blue-700 text-white text-center py-6 mt-auto">
        <p>&copy; {new Date().getFullYear()} Sistema de Recibos. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
