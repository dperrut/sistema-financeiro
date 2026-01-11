// --- COMPONENTE: CABEÇALHO (TOPO COM NOME DA TELA E PERFIL) ---
import React from 'react';

export default function Header({ activeTab, familyName, currentUser }) {
  // Função auxiliar para definir o título amigável da tela
  const getTitle = () => {
    const titles = {
      dashboard: 'Visão Geral',
      transactions: 'Fluxo de Caixa',
      goals: 'Metas',
      investments: 'Carteira',
      settings: 'Configurações'
    };
    return titles[activeTab] || 'Finanças';
  };

  return (
    <header className="bg-white shadow-sm px-4 py-3 md:px-8 md:py-4 flex justify-between items-center z-10 sticky top-0">
      <div>
        <h2 className="text-lg font-bold text-gray-800">{getTitle()}</h2>
        <p className="text-xs text-gray-400 md:hidden">{familyName}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-gray-700">{currentUser?.name}</p>
          <p className="text-xs text-blue-500 font-bold uppercase">{familyName}</p>
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
          {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}