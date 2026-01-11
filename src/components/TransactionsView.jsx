// --- COMPONENTE: TELA DE LANÇAMENTOS (FORMULÁRIOS E EXTRATO) ---
import React from 'react';
import { DollarSign, List, Edit, Trash2 } from 'lucide-react';
import SummaryCards from './SummaryCards';

export default function TransactionsView({ 
  accumulatedBalance, totalPatrimony, totalGoals, totalInvestments,
  monthlyIncome, monthlyExpense, monthlyBalance,
  editingId, setEditingId,
  incomeForm, setIncomeForm,
  expenseForm, setExpenseForm,
  addTransaction, startEditing, removeTransaction,
  incomeCategories, expenseCategories,
  transactions, currentDate, formatMonthYear, currentUser
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. RESUMO DE SALDOS (BANDEIRA ESCURA) */}
      <div className="bg-gray-800 text-white rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-[100px]">
        <div className="p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-600 bg-gray-900/30">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-green-500/20 p-2 rounded-full"><DollarSign size={20} className="text-green-400" /></div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Disponível (Livre)</p>
          </div>
          <h2 className={`text-3xl font-bold ${accumulatedBalance >= 0 ? 'text-white' : 'text-red-300'}`}>
            R$ {accumulatedBalance.toFixed(2)}
          </h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-600 bg-gray-700/10">
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-lg font-bold text-gray-200 block">R$ {totalPatrimony.toFixed(2)}</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">Total</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-lg font-bold text-gray-200 block">R$ {totalGoals.toFixed(2)}</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">Metas</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-lg font-bold text-gray-200 block">R$ {totalInvestments.toFixed(2)}</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">Invest.</span>
          </div>
        </div>
      </div>

      {/* 2. CARDS MENSAIS (REUTILIZANDO COMPONENTE) */}
      <SummaryCards income={monthlyIncome} expense={monthlyExpense} balance={monthlyBalance} />

      {/* 3. FORMULÁRIOS E EXTRATO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Formulário Receita */}
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="font-bold text-green-700 mb-2">Nova Receita</h3>
            <div className="space-y-2">
              <input className="w-full p-2 border rounded" placeholder="Descrição" value={incomeForm.description} onChange={e=>setIncomeForm({...incomeForm, description:e.target.value})}/>
              <input className="w-full p-2 border rounded" type="number" placeholder="Valor" value={incomeForm.amount} onChange={e=>setIncomeForm({...incomeForm, amount:e.target.value})}/>
              <select className="w-full p-2 border rounded bg-white" value={incomeForm.category} onChange={e=>setIncomeForm({...incomeForm, category:e.target.value})}>
                {incomeCategories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <input className="w-full p-2 border rounded" type="date" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm, date:e.target.value})}/>
              <button onClick={()=>addTransaction('income')} className="w-full bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700 transition-colors">
                {editingId ? 'Salvar Alteração' : 'Adicionar Receita'}
              </button>
            </div>
          </div>

          {/* Formulário Despesa */}
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
            <h3 className="font-bold text-red-700 mb-2">Nova Despesa</h3>
            <div className="space-y-2">
              <input className="w-full p-2 border rounded" placeholder="Descrição" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description:e.target.value})}/>
              <div className="flex gap-2">
                <input className="w-2/3 p-2 border rounded" type="number" placeholder="Valor" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount:e.target.value})}/>
                <input disabled={!!editingId} className="w-1/3 p-2 border rounded" type="number" placeholder="Parc." value={expenseForm.installments} onChange={e=>setExpenseForm({...expenseForm, installments:e.target.value})}/>
              </div>
              <select className="w-full p-2 border rounded bg-white" value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category:e.target.value})}>
                {expenseCategories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={()=>addTransaction('expense')} className="w-full bg-red-600 text-white p-2 rounded font-bold hover:bg-red-700 transition-colors">
                {editingId ? 'Salvar Alteração' : 'Adicionar Despesa'}
              </button>
            </div>
          </div>
        </div>

        {/* LISTA DO EXTRATO */}
        <div className="bg-white p-4 rounded-xl shadow h-fit max-h-[600px] overflow-y-auto border border-gray-100">
          <h3 className="font-bold mb-4 flex justify-between items-center text-gray-700">
            Extrato <span className="text-xs font-normal bg-gray-100 px-3 py-1 rounded-full text-gray-500 border">{formatMonthYear(currentDate)}</span>
          </h3>
          {transactions.filter(t => { 
            const [y, m] = t.date.split('-'); 
            return (parseInt(m)-1)===currentDate.getMonth() && parseInt(y)===currentDate.getFullYear() 
          }).slice().reverse().map(t => (
            <div key={t.id} className={`flex justify-between items-center border-b border-gray-50 p-3 rounded-lg hover:bg-gray-50 transition-colors ${editingId === t.id ? 'bg-orange-50 border border-orange-200' : ''}`}>
              <div>
                <p className="font-bold text-sm">{t.description}</p>
                <p className="text-xs text-gray-500">{t.date.split('-').reverse().join('/')} • {t.category} • <span className="text-indigo-500 font-medium">{t.authorName}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${t.type === 'receita' ? 'text-green-600' : (t.category.includes('Investimento') ? 'text-blue-600' : 'text-red-600')}`}>
                  {t.type === 'receita' ? '+' : '-'} R$ {Number(t.value).toFixed(2)}
                </span>
                <button onClick={()=>startEditing(t)} className="text-blue-400 hover:text-blue-600 p-1"><Edit size={14}/></button>
                <button onClick={()=>removeTransaction(t.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && <div className="text-center text-gray-400 py-10 flex flex-col items-center"><List size={40} className="mb-2 opacity-20"/><p>Nenhum lançamento.</p></div>}
        </div>
      </div>
    </div>
  );
}