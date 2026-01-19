// --- COMPONENTE: BARRA LATERAL (OVERLAY/GLASSMORPHISM) ---
import React from 'react';
import { TrendingUp, DollarSign, Target, Briefcase, Lock, LogOut, Home } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, handleLogout, familyName, isOpen, setIsOpen }) {
  return (
    <>
      {/* 1. BACKDROP: Clica fora para fechar (Só aparece se isOpen for true) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-30 md:z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 2. SIDEBAR COM EFEITO DE VIDRO (GLASSMORPHISM) */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-40  /* Fixa no topo/esquerda, acima de tudo */
        bg-blue-900/5 dark:bg-gray-900/5 backdrop-blur-md /* O EFEITO VIDRO */
        text-white shadow-2xl border-r border-white/10
        transition-transform duration-300 ease-in-out /* Animação de deslize */
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} /* Abre/Fecha */
        hidden md:flex flex-col /* Só aparece em Desktop (md) */
      `}>
        
        {/* CABEÇALHO DO MENU */}
        <div className="p-6 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg"> 
            <Home className="text-white" size={24}/>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Finanças</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-wider">{familyName}</p>
          </div>
          
          {/* Botão X para fechar */}
          <button onClick={() => setIsOpen(false)} className="ml-auto text-white/50 hover:text-white">
            ✕
          </button>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="flex-1 px-4 space-y-2 py-4">
          <button onClick={() => { setActiveTab('dashboard'); setIsOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'dashboard' ? 'bg-blue-600/80 shadow-lg text-white' : 'hover:bg-white/10 text-blue-100'}`}><TrendingUp size={20}/> <span>Visão Geral</span></button>
          <button onClick={() => { setActiveTab('transactions'); setIsOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'transactions' ? 'bg-blue-600/80 shadow-lg text-white' : 'hover:bg-white/10 text-blue-100'}`}><DollarSign size={20}/> <span>Lançamentos</span></button>
          <button onClick={() => { setActiveTab('goals'); setIsOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'goals' ? 'bg-blue-600/80 shadow-lg text-white' : 'hover:bg-white/10 text-blue-100'}`}><Target size={20}/> <span>Metas</span></button>
          <button onClick={() => { setActiveTab('investments'); setIsOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'investments' ? 'bg-blue-600/80 shadow-lg text-white' : 'hover:bg-white/10 text-blue-100'}`}><Briefcase size={20}/> <span>Investimentos</span></button>
          <button onClick={() => { setActiveTab('settings'); setIsOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-blue-600/80 shadow-lg text-white' : 'hover:bg-white/10 text-blue-100'}`}><Lock size={20}/> <span>Configurações</span></button>
        </nav>

        {/* RODAPÉ */}
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-600/80 hover:text-white text-red-300 transition-colors font-bold"><LogOut size={20}/> <span>Sair</span></button>
        </div>
      </aside>

      {/* MENU INFERIOR (MOBILE) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around py-1 px-2 z-50 shadow-up safe-area-pb transition-colors duration-300">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-1 rounded-lg ${activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700' : 'text-gray-400 dark:text-gray-500'}`}><TrendingUp size={20}/><span className="text-[9px] font-bold mt-0.5">Visão</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center p-1 rounded-lg ${activeTab === 'transactions' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700' : 'text-gray-400 dark:text-gray-500'}`}><DollarSign size={20}/><span className="text-[9px] font-bold mt-0.5">Lançar</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center p-1 rounded-lg ${activeTab === 'goals' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700' : 'text-gray-400 dark:text-gray-500'}`}><Target size={20}/><span className="text-[9px] font-bold mt-0.5">Metas</span></button>
          <button onClick={() => setActiveTab('investments')} className={`flex flex-col items-center p-1 rounded-lg ${activeTab === 'investments' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700' : 'text-gray-400 dark:text-gray-500'}`}><Briefcase size={20}/><span className="text-[9px] font-bold mt-0.5">Investir</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-1 rounded-lg ${activeTab === 'settings' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700' : 'text-gray-400 dark:text-gray-500'}`}><Lock size={20}/><span className="text-[9px] font-bold mt-0.5">Config</span></button>
      </div>
    </>
  );
}