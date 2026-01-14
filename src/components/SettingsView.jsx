// --- COMPONENTE: TELA DE CONFIGURAÇÕES (VERSÃO COMPACTA) ---
import React from 'react';
import { Users, Eye, Edit, LogIn, List, XCircle, Upload, AlertTriangle, Trash2 } from 'lucide-react';

export default function SettingsView({ 
  currentUser, familyPin, handleEditPin, 
  joinFamilyForm, setJoinFamilyForm, handleJoinFamily,
  newIncomeCat, setNewIncomeCat, handleAddCategory, incomeCategories, handleRemoveCategory,
  newExpenseCat, setNewExpenseCat, expenseCategories,
  importDataToFirebase, resetAllData, handleExportData
}) {
  return (
    // REDUZIDO: space-y-4 -> space-y-3 e pb-10 -> pb-4
    <div className="max-w-6xl mx-auto space-y-3 pb-4">
      
      {/* 1. SEÇÃO DE GESTÃO DE FAMÍLIA */}
      {/* REDUZIDO: gap-4 -> gap-3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* CARD: SUA FAMÍLIA ATUAL */}
        {/* REDUZIDO: p-4 -> p-3 */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-indigo-50 dark:border-indigo-900/30 flex flex-col justify-between transition-colors duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-300"><Users size={20}/></div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Sua Família</h3>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Dados de Acesso</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-600/50 flex-1">
              <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">ID Familiar</p>
              <p className="text-xs font-mono font-bold text-gray-700 dark:text-gray-200 select-all truncate">{currentUser.familyId}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-600/50 w-24 text-center">
              <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">PIN</p>
              <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={() => alert(`Seu PIN: ${familyPin}`)}>
                <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-200">****</span>
                <Eye size={12} className="text-gray-300 dark:text-gray-500"/>
                <button onClick={(e) => {e.stopPropagation(); handleEditPin();}} className="text-blue-500 ml-1"><Edit size={12}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* CARD: CONECTAR A OUTRA FAMÍLIA */}
        {/* REDUZIDO: p-4 -> p-3 */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between transition-colors duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-50 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-300"><LogIn size={20}/></div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Trocar de Família</h3>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <input 
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white text-xs outline-none transition-colors" 
                placeholder="ID da Família..." 
                value={joinFamilyForm.familyId} 
                onChange={e => setJoinFamilyForm({...joinFamilyForm, familyId: e.target.value})}
              />
            </div>
            <div className="w-16">
              <input 
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white text-xs text-center outline-none transition-colors" 
                placeholder="PIN" 
                maxLength={6} 
                value={joinFamilyForm.pin} 
                onChange={e => setJoinFamilyForm({...joinFamilyForm, pin: e.target.value})}
              />
            </div>
            <button onClick={handleJoinFamily} className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 dark:hover:bg-blue-600 text-xs transition-colors">Entrar</button>
          </div>
        </div>
      </div>

      {/* 2. GESTÃO DE CATEGORIAS */}
      {/* REDUZIDO: p-5 -> p-3 */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2 text-sm">
          <List size={18} className="text-gray-500 dark:text-gray-400"/> Personalizar Categorias
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h4 className="font-bold text-green-700 dark:text-green-400 mb-2 text-[11px] uppercase tracking-widest">Receitas</h4>
            <div className="flex gap-2 mb-2">
              <input className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-gray-50 dark:bg-gray-700 dark:text-white outline-none transition-colors" placeholder="Nova..." value={newIncomeCat} onChange={e => setNewIncomeCat(e.target.value)} />
              <button onClick={() => handleAddCategory('income', newIncomeCat)} className="bg-green-600 dark:bg-green-700 text-white px-3 rounded-lg font-bold">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {incomeCategories.map(cat => (
                <span key={cat} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-[10px] font-bold border border-green-100 dark:border-green-800/30 flex items-center gap-1.5">
                  {cat}
                  <button onClick={() => handleRemoveCategory('income', cat)} className="text-green-300 hover:text-red-500"><XCircle size={10}/></button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 text-[11px] uppercase tracking-widest">Despesas</h4>
            <div className="flex gap-2 mb-2">
              <input className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-gray-50 dark:bg-gray-700 dark:text-white outline-none transition-colors" placeholder="Nova..." value={newExpenseCat} onChange={e => setNewExpenseCat(e.target.value)} />
              <button onClick={() => handleAddCategory('expense', newExpenseCat)} className="bg-red-600 dark:bg-red-700 text-white px-3 rounded-lg font-bold">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {expenseCategories.map(cat => (
                <span key={cat} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-[10px] font-bold border border-red-100 dark:border-red-800/30 flex items-center gap-1.5">
                  {cat}
                  <button onClick={() => handleRemoveCategory('expense', cat)} className="text-red-300 hover:text-red-500"><XCircle size={10}/></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MANUTENÇÃO (BACKUP E SEGURANÇA) */}
      {/* REDUZIDO: gap-4 -> gap-3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-70 hover:opacity-100 transition-opacity">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 flex flex-col gap-2 transition-colors">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Backup de Segurança</h4>
            <span className="text-[9px] bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 dark:text-gray-300 font-bold">JSON</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportData} className="flex-1 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 px-3 py-2 rounded-lg font-bold text-[10px] border border-blue-100 dark:border-blue-900/30 shadow-sm hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
              <Upload size={14} className="rotate-180"/> Exportar
            </button>
            <label className="flex-1 bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-300 px-3 py-2 rounded-lg cursor-pointer font-bold text-[10px] border border-orange-100 dark:border-orange-900/30 shadow-sm hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
              <Upload size={14}/> Importar
              <input type="file" accept=".json" onChange={importDataToFirebase} className="hidden" />
            </label>
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-dashed border-red-200 dark:border-red-900/30 flex items-center justify-between transition-colors">
          <div>
            <h4 className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1"><AlertTriangle size={12}/> Zona Crítica</h4>
            <p className="text-[10px] text-red-400 dark:text-red-500/80 font-medium">Apagar tudo</p>
          </div>
          <button onClick={resetAllData} className="text-red-600 dark:text-red-400 font-bold text-[10px] bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-all shadow-sm">
            Resetar App
          </button>
        </div>
      </div>
    </div>
  );
}