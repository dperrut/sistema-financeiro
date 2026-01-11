// --- COMPONENTE: CARDS DE RESUMO (EXIBE ENTRADAS, SAÍDAS E BALANÇO) ---
import React from 'react';

export default function SummaryCards({ income, expense, balance }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-green-500">
        <p className="text-[10px] text-gray-500 uppercase font-bold">Entrou</p>
        <p className="text-lg font-bold text-green-600 truncate">R$ {income.toFixed(2)}</p>
      </div>
      <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-red-500">
        <p className="text-[10px] text-gray-500 uppercase font-bold">Saiu</p>
        <p className="text-lg font-bold text-red-600 truncate">R$ {expense.toFixed(2)}</p>
      </div>
      <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-blue-500">
        <p className="text-[10px] text-gray-500 uppercase font-bold">Balanço</p>
        <p className={`text-lg font-bold truncate ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          R$ {balance.toFixed(2)}
        </p>
      </div>
    </div>
  );
}