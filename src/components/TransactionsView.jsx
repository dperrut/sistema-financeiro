// --- COMPONENTE: TELA DE LANÇAMENTOS (VISUAL ATUALIZADO) ---
import React from 'react';
import { DollarSign, List, Edit, Trash2, Calendar, CreditCard } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* 1. RESUMO DE SALDOS (Visual Card Único) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
            
            {/* Disponível Livre */}
            <div className="p-6 flex flex-col items-center justify-center bg-green-50/50 dark:bg-green-900/10 col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full text-green-600 dark:text-green-300">
                        <DollarSign size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Disponível</span>
                </div>
                <h2 className={`text-3xl font-extrabold ${accumulatedBalance >= 0 ? 'text-gray-800 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>
                    R$ {accumulatedBalance.toFixed(2)}
                </h2>
            </div>

            {/* Totais Secundários */}
            <div className="p-4 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gray-400 uppercase mb-1">Patrimônio Total</span>
                <span className="text-xl font-bold text-gray-700 dark:text-gray-200">R$ {totalPatrimony.toFixed(2)}</span>
            </div>

            <div className="p-4 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gray-400 uppercase mb-1">Em Metas</span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">R$ {totalGoals.toFixed(2)}</span>
            </div>

            <div className="p-4 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gray-400 uppercase mb-1">Investido</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">R$ {totalInvestments.toFixed(2)}</span>
            </div>
        </div>
      </div>

      {/* 2. CARDS MENSAIS (Receita/Despesa do Mês) */}
      <SummaryCards income={monthlyIncome} expense={monthlyExpense} balance={monthlyBalance} />

      {/* 3. ÁREA OPERACIONAL (Formulários) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* FORMULÁRIO DE RECEITA */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-green-500 transition-colors duration-300">
            <h3 className="text-sm font-extrabold text-green-600 dark:text-green-400 uppercase mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Nova Receita
            </h3>
            
            <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                        className="w-full p-3 text-sm border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" 
                        placeholder="Descrição (Ex: Salário)" 
                        value={incomeForm.description} 
                        onChange={e=>setIncomeForm({...incomeForm, description:e.target.value})}
                    />
                    <input 
                        className="w-full p-3 text-sm border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-bold text-gray-700" 
                        type="text" 
                        placeholder="R$ 0,00" 
                        value={incomeForm.amount} 
                        onChange={(e) => handleCurrencyChange(e, setIncomeForm, incomeForm, 'amount')} 
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select 
                        className="w-full p-3 text-sm border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" 
                        value={incomeForm.category} 
                        onChange={e=>setIncomeForm({...incomeForm, category:e.target.value})}
                    >
                        {incomeCategories.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                    <input 
                        className="w-full p-3 text-sm border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" 
                        type="date" 
                        value={incomeForm.date} 
                        onChange={e=>setIncomeForm({...incomeForm, date:e.target.value})}
                    />
                </div>
                
                <button 
                    onClick={()=>addTransaction('income')} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                    {editingId ? <><Edit size={16}/> Atualizar Receita</> : <><DollarSign size={16}/> Adicionar Receita</>}
                </button>
            </div>
        </div>

        {/* FORMULÁRIO DE DESPESA */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-red-500 transition-colors duration-300">
            <h3 className="text-sm font-extrabold text-red-600 dark:text-red-400 uppercase mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Nova Despesa
            </h3>
            
            <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                        className="w-full p-3 text-sm border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" 
                        placeholder="Descrição (Ex: Supermercado)" 
                        value={expenseForm.description} 
                        onChange={e=>setExpenseForm({...expenseForm, description:e.target.value})}
                    />
                    
                    {/* BLOCO DE VALORES + OPÇÕES */}
                    <div className="flex gap-2">
                        <input 
                            className="flex-1 w-full p-3 text-sm border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-bold text-gray-700" 
                            type="text" 
                            placeholder="R$ 0,00" 
                            value={expenseForm.amount} 
                            onChange={(e) => handleCurrencyChange(e, setExpenseForm, expenseForm, 'amount')} 
                        />
                        
                        {/* Input Parcelas */}
                        <input 
                          disabled={!!editingId || expenseForm.isFixed} 
                          className={`w-14 p-2 text-xs border rounded-xl text-center transition-colors outline-none focus:border-red-500 ${expenseForm.isFixed ? 'bg-gray-200 dark:bg-gray-800 opacity-50' : 'bg-gray-50 dark:bg-gray-700 dark:text-white'}`}
                          placeholder="1x" 
                          maxLength={3}
                          value={expenseForm.isFixed ? '' : expenseForm.installments} 
                          onChange={e => setExpenseForm({...expenseForm, installments: e.target.value.replace(/\D/g, '')})}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                   {/* Botão Toggle Valor/Parcela */}
                   {!expenseForm.isFixed && (
                      <button
                        type="button"
                        onClick={() => setExpenseForm({...expenseForm, isInstallmentValue: !expenseForm.isInstallmentValue})}
                        disabled={!!editingId} 
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all flex-1 ${expenseForm.isInstallmentValue ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}
                      >
                        {expenseForm.isInstallmentValue ? 'Valor da Parcela' : 'Valor Total'}
                      </button>
                    )}

                    {/* Botão Fixa */}
                    <button
                        type="button"
                        onClick={() => setExpenseForm({...expenseForm, isFixed: !expenseForm.isFixed, installments: '1', isInstallmentValue: false})}
                        disabled={!!editingId}
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all w-24 ${expenseForm.isFixed ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}
                    >
                        {expenseForm.isFixed ? 'Fixa ✅' : 'Fixa?'}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select 
                        className="w-full p-3 text-sm border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" 
                        value={expenseForm.category} 
                        onChange={e=>setExpenseForm({...expenseForm, category:e.target.value})}
                    >
                        {expenseCategories.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                    <input 
                        className="w-full p-3 text-sm border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" 
                        type="date" 
                        value={expenseForm.date} 
                        onChange={e=>setExpenseForm({...expenseForm, date:e.target.value})}
                    />
                </div>
                
                <button 
                    onClick={()=>addTransaction('expense')} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                    {editingId ? <><Edit size={16}/> Atualizar Despesa</> : <><DollarSign size={16}/> Adicionar Despesa</>}
                </button>
            </div>
        </div>
      </div>

      {/* 4. LISTA DO EXTRATO (Expandida) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px] transition-colors duration-300">
        <h3 className="font-bold mb-6 flex justify-between items-center text-gray-800 dark:text-gray-100 text-lg">
          <span className="flex items-center gap-2"><List className="text-blue-500"/> Extrato de Movimentações</span>
          <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
            {formatMonthYear(currentDate)}
          </span>
        </h3>
        
        <div className="space-y-2">
          {transactions.filter(t => { 
            const [y, m] = t.date.split('-'); 
            return (parseInt(m)-1)===currentDate.getMonth() && parseInt(y)===currentDate.getFullYear() 
          }).slice().reverse().map(t => (
            <div key={t.id} className={`group flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 dark:border-gray-700/50 last:border-0 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all ${editingId === t.id ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800' : ''}`}>
              
              {/* Info Esquerda */}
              <div className="flex items-start gap-4 mb-2 md:mb-0">
                <div className={`p-3 rounded-full ${t.type === 'receita' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {t.type === 'receita' ? <DollarSign size={20}/> : <CreditCard size={20}/>}
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200 text-base">{t.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {t.date.split('-').reverse().join('/')}</span>
                    <span>•</span>
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{t.category}</span>
                    <span>•</span>
                    <span className="text-indigo-500 dark:text-indigo-400 font-medium">{t.authorName}</span>
                    {t.isFixed && <span className="text-purple-500 font-bold ml-1" title="Despesa Fixa">↺ Fixa</span>}
                  </div>
                </div>
              </div>

              {/* Info Direita (Valor e Ações) */}
              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pl-14 md:pl-0">
                <span className={`font-bold text-lg whitespace-nowrap ${
                  (['Aporte', 'Resgate', 'Estorno'].includes(t.category)) 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : t.type === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {t.type === 'receita' ? '+' : '-'} R$ {Number(t.value).toFixed(2)}
                </span>
                
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Botão Antecipar */}
                  {t.installmentGroupId && (
                    <button 
                      onClick={() => setAnticipateModal({ show: true, transaction: t })} 
                      className="p-2 text-orange-400 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                      title="Antecipar Parcelas Futuras"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
                    </button>
                  )}
                  
                  <button onClick={()=>startEditing(t)} className="p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Editar">
                    <Edit size={18}/>
                  </button>
                  <button onClick={()=>removeTransaction(t.id)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="Excluir">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {transactions.filter(t => { 
            const [y, m] = t.date.split('-'); 
            return (parseInt(m)-1)===currentDate.getMonth() && parseInt(y)===currentDate.getFullYear() 
          }).length === 0 && (
            <div className="text-center text-gray-400 dark:text-gray-500 py-16 flex flex-col items-center">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-full mb-3">
                  <List size={40} className="opacity-30"/>
              </div>
              <p className="text-lg font-medium">Nenhum lançamento neste mês.</p>
              <p className="text-sm opacity-60">Use os formulários acima para adicionar receitas ou despesas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}