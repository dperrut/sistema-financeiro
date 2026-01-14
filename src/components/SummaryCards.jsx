// --- COMPONENTE: CARDS DE RESUMO (COM MODO ESCURO) ---
import React from 'react';

export default function SummaryCards({ income, expense, balance }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Card Entrou */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border-l-4 border-green-500 transition-colors duration-300">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Entrou</p>
        <p className="text-lg font-bold text-green-600 dark:text-green-400 truncate">R$ {income.toFixed(2)}</p>
      </div>

      {/* Card Saiu */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border-l-4 border-red-500 transition-colors duration-300">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Saiu</p>
        <p className="text-lg font-bold text-red-600 dark:text-red-400 truncate">R$ {expense.toFixed(2)}</p>
      </div>

      {/* Card Balanço */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border-l-4 border-blue-500 transition-colors duration-300">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Balanço</p>
        <p className={`text-lg font-bold truncate ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
          R$ {balance.toFixed(2)}
        </p>
      </div>
    </div>
  );
}