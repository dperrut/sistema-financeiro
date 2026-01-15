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
  handleCurrencyChange,
  setAnticipateModal
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. RESUMO DE SALDOS (Agora com visual Branco/Dark + Sombra) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-[90px] transition-all duration-300">
        
        {/* Lado Esquerdo: Disponível Livre */}
        <div className="py-2 px-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-0">
            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
              <DollarSign size={18} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">Disponível (Livre)</p>
          </div>
          <h2 className={`text-2xl font-bold ${accumulatedBalance >= 0 ? 'text-gray-800 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>
            R$ {accumulatedBalance.toFixed(2)}
          </h2>
        </div>

        {/* Lado Direito: Totais (Patrimônio, Metas, Investimentos) */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 bg-gray-50 dark:bg-gray-900/20">
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-base font-bold text-gray-700 dark:text-gray-200 block">R$ {totalPatrimony.toFixed(2)}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Total</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-base font-bold text-gray-700 dark:text-gray-200 block">R$ {totalGoals.toFixed(2)}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Metas</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-base font-bold text-gray-700 dark:text-gray-200 block">R$ {totalInvestments.toFixed(2)}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Invest.</span>
          </div>
        </div>
      </div>

      {/* 2. CARDS MENSAIS */}
      <SummaryCards income={monthlyIncome} expense={monthlyExpense} balance={monthlyBalance} />

      {/* 3. ÁREA OPERACIONAL */}
      <div className="flex flex-col gap-4">
        
        {/* Linha de Receita (MODO ESCURO APLICADO) */}
          <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-green-500 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <div className="md:col-span-1 text-[10px] font-extrabold text-green-600 dark:text-green-400 uppercase text-center">Receita</div>
              <input className="md:col-span-3 p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:border-green-400 transition-colors" placeholder="Descrição" value={incomeForm.description} onChange={e=>setIncomeForm({...incomeForm, description:e.target.value})}/>
              
              <input 
                className="md:col-span-2 p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:border-green-400 transition-colors" 
                type="text" 
                placeholder="R$ 0,00" 
                value={incomeForm.amount} 
                onChange={(e) => handleCurrencyChange(e, setIncomeForm, incomeForm, 'amount')} 
              />

              <select className="md:col-span-2 p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:border-green-400 transition-colors" value={incomeForm.category} onChange={e=>setIncomeForm({...incomeForm, category:e.target.value})}>
                {incomeCategories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <input className="md:col-span-2 p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:border-green-400 transition-colors" type="date" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm, date:e.target.value})}/>
              <button onClick={()=>addTransaction('income')} className="md:col-span-2 bg-green-600 text-white p-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all active:scale-95 shadow-sm">
                {editingId ? 'Salvar' : '+ Receita'}
              </button>
            </div>
          </div>

          {/* Linha de Despesa (CORRIGIDA: Layout Horizontal e Checkbox Visível) */}
          {/* Linha de Despesa (AJUSTE FINAL: Botão Toggle no lugar de Checkbox) */}
          <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-red-500 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              
              <div className="md:col-span-1 text-[10px] font-extrabold text-red-600 dark:text-red-400 uppercase text-center">Despesa</div>
              
              {/* Reduzi um pouco a descrição (col-span-3 -> col-span-2) para dar espaço aos valores */}
              <input className="md:col-span-2 p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:border-red-400 transition-colors" placeholder="Descrição" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description:e.target.value})}/>
              
              {/* BLOCO DE VALORES (Agora ocupa 3 colunas para caber tudo folgado) */}
              <div className="md:col-span-3 flex items-center gap-1">
                <input 
                  className="flex-1 w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:border-red-400 transition-colors" 
                  type="text" 
                  placeholder="R$ 0,00" 
                  value={expenseForm.amount} 
                  onChange={(e) => handleCurrencyChange(e, setExpenseForm, expenseForm, 'amount')} 
                />
                
                <input 
                  disabled={!!editingId} 
                  className="w-12 p-2 text-xs border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-center transition-colors placeholder-gray-400 focus:outline-none focus:border-red-400" 
                  title="Qtd Parcelas" 
                  placeholder="1x" 
                  type="text" 
                  inputMode="numeric"
                  maxLength={3}
                  value={expenseForm.installments} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setExpenseForm({...expenseForm, installments: val});
                  }}
                />

                {/* BOTÃO TOGGLE (Substitui o Checkbox) */}
                {/* BOTÃO TOGGLE (LIVRE: Pode clicar a qualquer momento) */}
                <button
                  type="button"
                  onClick={() => setExpenseForm({...expenseForm, isInstallmentValue: !expenseForm.isInstallmentValue})}
                  disabled={!!editingId} 
                  className={`
                    h-9 px-2 rounded-lg text-[9px] font-bold leading-tight uppercase transition-all border border-gray-200 dark:border-gray-600
                    ${expenseForm.isInstallmentValue 
                      ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' 
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}
                    ${!!editingId ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                  `}
                  title="Clique para alternar: Valor Total ou Valor da Parcela"
                >
                  {expenseForm.isInstallmentValue ? 'Valor\nParcela' : 'Valor\nTotal'}
                </button>
              </div>

              <select className="md:col-span-2 p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:border-red-400 transition-colors" value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category:e.target.value})}>
                {expenseCategories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              
              <input className="md:col-span-2 p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:border-red-400 transition-colors" type="date" value={expenseForm.date} onChange={e=>setExpenseForm({...expenseForm, date:e.target.value})}/>
              
              <button onClick={()=>addTransaction('expense')} className="md:col-span-2 bg-red-600 text-white p-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-all active:scale-95 shadow-sm h-[38px]">
                {editingId ? 'Salvar' : '+ Despesa'}
              </button>
            </div>
          </div>

        {/* LISTA DO EXTRATO (MODO ESCURO APLICADO) */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit max-h-[600px] overflow-y-auto transition-colors duration-300">
          <h3 className="font-bold mb-4 flex justify-between items-center text-gray-700 dark:text-gray-100">
            Extrato <span className="text-xs font-normal bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-gray-500 border dark:border-gray-600">{formatMonthYear(currentDate)}</span>
          </h3>
          <div className="space-y-1">
            {transactions.filter(t => { 
              const [y, m] = t.date.split('-'); 
              return (parseInt(m)-1)===currentDate.getMonth() && parseInt(y)===currentDate.getFullYear() 
            }).slice().reverse().map(t => (
              <div key={t.id} className={`flex justify-between items-center border-b border-gray-50 dark:border-gray-700 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${editingId === t.id ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : ''}`}>
                <div>
                  <p className="font-bold text-sm dark:text-gray-200">{t.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.date.split('-').reverse().join('/')} • {t.category} • <span className="text-indigo-500 dark:text-indigo-400 font-medium">{t.authorName}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${
                    (['Aporte', 'Resgate', 'Estorno'].includes(t.category)) 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : t.type === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {t.type === 'receita' ? '+' : '-'} R$ {Number(t.value).toFixed(2)}
                  </span>
                  {/* BOTÃO DE ANTECIPAR (Só aparece se for parcelado) */}
                  {t.installmentGroupId && (
                    <button 
                      onClick={() => setAnticipateModal({ show: true, transaction: t })} 
                      className="text-orange-400 hover:text-orange-600 p-1 transition-colors"
                      title="Antecipar Parcelas Futuras"
                    >
                      {/* Ícone Fast Forward (⏩) */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
                    </button>
                  )}
                  <button onClick={()=>startEditing(t)} className="text-blue-400 hover:text-blue-600 p-1"><Edit size={14}/></button>
                  <button onClick={()=>removeTransaction(t.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center text-gray-400 dark:text-gray-500 py-10 flex flex-col items-center">
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