// --- COMPONENTE: TELA DE LANÇAMENTOS (COM MÁSCARA DE MOEDA) ---
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
  transactions, currentDate, formatMonthYear, currentUser,
  handleCurrencyChange // <--- 1. RECEBENDO A FUNÇÃO AQUI
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. RESUMO DE SALDOS (BANNER ESCURO) */}
      <div className="bg-gray-800 text-white rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-[90px]">
        <div className="py-2 px-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-600 bg-gray-900/30">
          <div className="flex items-center gap-3 mb-0">
            <div className="bg-green-500/20 p-1 rounded-full"><DollarSign size={18} className="text-green-400" /></div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Disponível (Livre)</p>
          </div>
          <h2 className={`text-2xl font-bold ${accumulatedBalance >= 0 ? 'text-white' : 'text-red-300'}`}>
            R$ {accumulatedBalance.toFixed(2)}
          </h2>
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-600 bg-gray-700/10">
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-base font-bold text-gray-200 block">R$ {totalPatrimony.toFixed(2)}</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">Total</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-base font-bold text-gray-200 block">R$ {totalGoals.toFixed(2)}</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">Metas</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-base font-bold text-gray-200 block">R$ {totalInvestments.toFixed(2)}</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold">Invest.</span>
          </div>
        </div>
      </div>

      {/* 2. CARDS MENSAIS */}
      <SummaryCards income={monthlyIncome} expense={monthlyExpense} balance={monthlyBalance} />

      {/* 3. ÁREA OPERACIONAL */}
      <div className="flex flex-col gap-4">
        
        {/* FORMULÁRIOS COMPACTOS */}
        <div className="flex flex-col gap-3">
          {/* Linha de Receita */}
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 border-l-4 border-green-500">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <div className="md:col-span-1 text-[10px] font-extrabold text-green-600 uppercase text-center">Receita</div>
              <input className="md:col-span-3 p-2 text-sm border rounded-lg bg-gray-50 outline-none focus:border-green-400" placeholder="Descrição" value={incomeForm.description} onChange={e=>setIncomeForm({...incomeForm, description:e.target.value})}/>
              
              {/* --- ALTERAÇÃO 2: CAMPO DE VALOR RECEITA --- */}
              <input 
                className="md:col-span-2 p-2 text-sm border rounded-lg bg-gray-50 outline-none focus:border-green-400" 
                type="text" // Mudado de number para text
                placeholder="R$ 0,00" 
                value={incomeForm.amount} 
                onChange={(e) => handleCurrencyChange(e, setIncomeForm, incomeForm, 'amount')} // Usando a formatação
              />

              <select className="md:col-span-2 p-2 text-sm border rounded-lg bg-gray-50 outline-none focus:border-green-400" value={incomeForm.category} onChange={e=>setIncomeForm({...incomeForm, category:e.target.value})}>
                {incomeCategories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <input className="md:col-span-2 p-2 text-sm border rounded-lg bg-gray-50 outline-none focus:border-green-400" type="date" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm, date:e.target.value})}/>
              <button onClick={()=>addTransaction('income')} className="md:col-span-2 bg-green-600 text-white p-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all active:scale-95 shadow-sm">
                {editingId ? 'Salvar' : '+ Receita'}
              </button>
            </div>
          </div>

          {/* Linha de Despesa */}
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 border-l-4 border-red-500">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <div className="md:col-span-1 text-[10px] font-extrabold text-red-600 uppercase text-center">Despesa</div>
              <input className="md:col-span-3 p-2 text-sm border rounded-lg bg-gray-50 outline-none focus:border-red-400" placeholder="Descrição" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description:e.target.value})}/>
              <div className="md:col-span-2 flex gap-1">
                
                {/* --- ALTERAÇÃO 3: CAMPO DE VALOR DESPESA --- */}
                <input 
                  className="w-full p-2 text-sm border rounded-lg bg-gray-50 outline-none focus:border-red-400" 
                  type="text" // Mudado de number para text
                  placeholder="R$ 0,00" 
                  value={expenseForm.amount} 
                  onChange={(e) => handleCurrencyChange(e, setExpenseForm, expenseForm, 'amount')} // Usando a formatação
                />
                
                <input disabled={!!editingId} className="w-10 p-2 text-xs border rounded-lg bg-gray-50 text-center" title="Parcelas" type="number" value={expenseForm.installments} onChange={e=>setExpenseForm({...expenseForm, installments:e.target.value})}/>
              </div>
              <select className="md:col-span-2 p-2 text-sm border rounded-lg bg-gray-50 outline-none focus:border-red-400" value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category:e.target.value})}>
                {expenseCategories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <input className="md:col-span-2 p-2 text-sm border rounded-lg bg-gray-50 outline-none focus:border-red-400" type="date" value={expenseForm.date} onChange={e=>setExpenseForm({...expenseForm, date:e.target.value})}/>
              <button onClick={()=>addTransaction('expense')} className="md:col-span-2 bg-red-600 text-white p-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-all active:scale-95 shadow-sm">
                {editingId ? 'Salvar' : '+ Despesa'}
              </button>
            </div>
          </div>
        </div>

        {/* LISTA DO EXTRATO */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-fit max-h-[600px] overflow-y-auto">
          <h3 className="font-bold mb-4 flex justify-between items-center text-gray-700">
            Extrato <span className="text-xs font-normal bg-gray-100 px-3 py-1 rounded-full text-gray-500 border">{formatMonthYear(currentDate)}</span>
          </h3>
          <div className="space-y-1">
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
                  <span className={`font-bold text-sm ${
                    (['Aporte', 'Resgate', 'Estorno'].includes(t.category)) 
                      ? 'text-blue-600' 
                      : t.type === 'receita' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {t.type === 'receita' ? '+' : '-'} R$ {Number(t.value).toFixed(2)}
                  </span>
                  <button onClick={()=>startEditing(t)} className="text-blue-400 hover:text-blue-600 p-1"><Edit size={14}/></button>
                  <button onClick={()=>removeTransaction(t.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                <List size={40} className="mb-2 opacity-20"/>
                <p>Nenhum lançamento.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}