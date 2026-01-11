// --- COMPONENTE: BARRA LATERAL E MENU MOBILE (NAVEGAÇÃO DO SISTEMA) ---
import React from 'react';
import { TrendingUp, DollarSign, Target, Briefcase, Lock, LogOut, Home } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, handleLogout, familyName }) {
  return (
    <>
      {/* MENU LATERAL (DESKTOP) */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-900 text-white shadow-xl z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg"><Home className="text-blue-900" size={24}/></div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Finanças</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-wider">{familyName}</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 py-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'dashboard' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><TrendingUp size={20}/> <span>Dashboard</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'transactions' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><DollarSign size={20}/> <span>Lançamentos</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'goals' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><Target size={20}/> <span>Metas</span></button>
          <button onClick={() => setActiveTab('investments')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'investments' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><Briefcase size={20}/> <span>Investimentos</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><Lock size={20}/> <span>Configurações</span></button>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-600 hover:text-white text-red-300 transition-colors font-bold"><LogOut size={20}/> <span>Sair</span></button>
        </div>
      </aside>

      {/* MENU INFERIOR (MOBILE) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50 shadow-up safe-area-pb">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><TrendingUp size={22}/><span className="text-[10px] font-bold mt-1">Visão</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'transactions' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><DollarSign size={22}/><span className="text-[10px] font-bold mt-1">Lançar</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'goals' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><Target size={22}/><span className="text-[10px] font-bold mt-1">Metas</span></button>
          <button onClick={() => setActiveTab('investments')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'investments' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><Briefcase size={22}/><span className="text-[10px] font-bold mt-1">Investir</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><Lock size={22}/><span className="text-[10px] font-bold mt-1">Config</span></button>
      </div>
    </>
  );
}