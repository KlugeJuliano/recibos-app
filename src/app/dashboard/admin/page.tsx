'use client';

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">Área Administrativa</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-purple-100 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-purple-800">Gerenciar Usuários</h2>
            <p className="text-sm text-gray-700 mt-1">
              Adicione, edite ou remova usuários com acesso ao sistema.
            </p>
          </div>

          <div className="bg-indigo-100 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-indigo-800">Gerenciar Lojas</h2>
            <p className="text-sm text-gray-700 mt-1">
              Visualize e administre as lojas cadastradas e suas permissões.
            </p>
          </div>

          <div className="bg-pink-100 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-pink-800">Configurações</h2>
            <p className="text-sm text-gray-700 mt-1">
              Altere configurações gerais do sistema.
            </p>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 text-center">
          ⚙️ Recursos administrativos avançados ainda em desenvolvimento.
        </div>
      </div>
    </main>
  );
}
