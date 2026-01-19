import React from 'react';
import { Moon, Sun, Menu } from 'lucide-react'; // <--- Adicionado Menu

export default function Header({ activeTab, familyName, currentUser, darkMode, toggleTheme, toggleSidebar }) {
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
    <header className={`px-4 py-3 md:px-8 md:py-4 flex justify-between items-center z-10 sticky top-0 shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-b border-gray-800' : 'bg-white'}`}>
      
      {/* --- LADO ESQUERDO: MENU + TÍTULOS --- */}
      <div className="flex items-center gap-4">
        
        {/* Novo Botão Menu (Só aparece no Desktop) */}
        <button 
          onClick={toggleSidebar}
          className={`hidden md:block p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Abrir Menu"
        >
          <Menu size={24} />
        </button>

        {/* Bloco de Título (Que já existia) */}
        <div>
          <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{getTitle()}</h2>
          <p className="text-xs text-gray-400 md:hidden">{familyName}</p>
        </div>
      </div>

      {/* --- LADO DIREITO: PERFIL E TEMA (MANTIDO IGUAL) --- */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme} 
          title={darkMode ? "Desativar modo escuro" : "Ativar modo escuro"}
          className={`p-2 rounded-full transition-all ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="text-right hidden md:block">
          <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{currentUser?.name}</p>
          <p className="text-xs text-blue-500 font-bold uppercase">{familyName}</p>
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
          {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}