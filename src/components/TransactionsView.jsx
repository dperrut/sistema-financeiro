// --- COMPONENTE: TELA DE LANÇAMENTOS (LAYOUT LADO A LADO 35/65) ---
import React, { useState, useEffect } from 'react';
import { DollarSign, List, Edit, Trash2, Calendar, CreditCard, Wallet, Target, PieChart, ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

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

  // 1. Estado para armazenar os cartões reais
  const [creditCards, setCreditCards] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Geral');
  
  // 2. Constante para métodos de pagamento (pode manter aqui)
  const PAYMENT_METHODS = ["Pix", "Dinheiro", "Débito", "Crédito"];

  // 3. Efeito para buscar os cartões do Firebase (Igual ao SettingsView)
  useEffect(() => {
    if (currentUser?.familyId) {
      const cardsRef = ref(db, `families/${currentUser.familyId}/creditCards`);
      const unsubscribe = onValue(cardsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const cardsList = Object.entries(data).map(([key, val]) => ({ id: key, ...val }));
          setCreditCards(cardsList);
        } else {
          setCreditCards([]);
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* 1. HEADER UNIFICADO (Mantido Full Width) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        
        {/* Totais Globais */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-gray-700 bg-gray-50/30 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            {/* Disponível */}
            <div className="p-2 flex flex-col items-center justify-center group hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-colors">
                <div className="flex items-center gap-1.5 opacity-80 mb-0.5">
                    <Wallet size={12} className="text-green-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Disponível</span>
                </div>
                <h2 className={`text-lg font-extrabold leading-none ${accumulatedBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    R$ {accumulatedBalance.toFixed(2)}
                </h2>
            </div>
            
            {/* Patrimônio */}
            <div className="p-2 flex flex-col items-center justify-center group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
                    <DollarSign size={12} className="text-blue-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Patrimônio</span>
                </div>
                <h2 className="text-lg font-extrabold text-gray-700 dark:text-gray-200 leading-none">
                    R$ {totalPatrimony.toFixed(2)}
                </h2>
            </div>

            {/* Metas */}
            <div className="p-2 flex flex-col items-center justify-center group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                 <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
                    <Target size={12} className="text-purple-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Metas</span>
                </div>
                <h2 className="text-lg font-extrabold text-purple-600 dark:text-purple-400 leading-none">
                    R$ {totalGoals.toFixed(2)}
                </h2>
            </div>

            {/* Investido */}
            <div className="p-2 flex flex-col items-center justify-center group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                 <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
                    <PieChart size={12} className="text-blue-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Investido</span>
                </div>
                <h2 className="text-lg font-extrabold text-blue-600 dark:text-blue-400 leading-none">
                    R$ {totalInvestments.toFixed(2)}
                </h2>
            </div>
        </div>

        {/* Resumo do Mês */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
            {/* Receita */}
            <div className="p-3 flex items-center justify-between bg-green-50/20 dark:bg-green-900/5">
                 <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300">
                        <ArrowUpCircle size={14}/>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Receita</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">R$ {monthlyIncome.toFixed(2)}</p>
                    </div>
                 </div>
            </div>
            {/* Despesa */}
            <div className="p-3 flex items-center justify-between bg-red-50/20 dark:bg-red-900/5">
                 <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300">
                        <ArrowDownCircle size={14}/>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Despesa</p>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">R$ {monthlyExpense.toFixed(2)}</p>
                    </div>
                 </div>
            </div>
            {/* Balanço */}
            <div className="p-3 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800">
                 <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${monthlyBalance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'} dark:bg-gray-700 dark:text-gray-300`}>
                        <TrendingUp size={14}/>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Balanço</p>
                        <p className={`text-sm font-bold ${monthlyBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                            R$ {monthlyBalance.toFixed(2)}
                        </p>
                    </div>
                 </div>
            </div>
        </div>
      </div>

      {/* --- GRID PRINCIPAL: LADO A LADO --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 2. COLUNA ESQUERDA: FORMULÁRIOS (35% - Sticky) */}
        <div className="lg:col-span-4 space-y-4 sticky top-4">
            
            {/* Formulário Receita */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-green-500 transition-colors">
                <h3 className="text-xs font-extrabold text-green-600 dark:text-green-400 uppercase mb-3 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Nova Receita
                </h3>
                <div className="space-y-2">
                    <input 
                        className="w-full p-2 text-xs border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all" 
                        placeholder="Descrição" 
                        value={incomeForm.description} 
                        onChange={e=>setIncomeForm({...incomeForm, description:e.target.value})}
                    />
                    <div className="flex gap-2">
                        <input 
                            className="flex-1 w-full p-2 text-xs border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all font-bold" 
                            type="text" 
                            placeholder="R$ 0,00" 
                            value={incomeForm.amount} 
                            onChange={(e) => handleCurrencyChange(e, setIncomeForm, incomeForm, 'amount')} 
                        />
                         <input 
                            className="w-28 p-2 text-xs border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all" 
                            type="date" 
                            value={incomeForm.date} 
                            onChange={e=>setIncomeForm({...incomeForm, date:e.target.value})}
                        />
                    </div>
                    <select 
                        className="w-full p-2 text-xs border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all" 
                        value={incomeForm.category} 
                        onChange={e=>setIncomeForm({...incomeForm, category:e.target.value})}
                    >
                        {incomeCategories.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                    
                    <button 
                        onClick={()=>addTransaction('income')} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1 mt-1"
                    >
                        {editingId ? <><Edit size={12}/> Salvar</> : <><DollarSign size={12}/> Adicionar</>}
                    </button>
                </div>
            </div>

        {/* FORMULÁRIO DE DESPESA (LAYOUT ESTÁVEL: CATEGORIA FIXA) */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-red-500 transition-colors">
            <h3 className="text-xs font-extrabold text-red-600 dark:text-red-400 uppercase mb-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Nova Despesa
            </h3>
            
            <div className="space-y-2">
                {/* LINHA 1: Descrição */}
                <input 
                    className="w-full p-2 text-xs border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all" 
                    placeholder="Descrição" 
                    value={expenseForm.description} 
                    onChange={e=>setExpenseForm({...expenseForm, description:e.target.value})}
                />
                
                {/* LINHA 2: Valor e Data */}
                <div className="flex gap-2">
                    <input 
                        className="flex-1 w-full p-2 text-xs border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all font-bold" 
                        type="text" 
                        placeholder="R$ 0,00" 
                        value={expenseForm.amount} 
                        onChange={(e) => handleCurrencyChange(e, setExpenseForm, expenseForm, 'amount')} 
                    />
                     <input 
                        className="w-28 p-2 text-xs border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all" 
                        type="date" 
                        value={expenseForm.date} 
                        onChange={e=>setExpenseForm({...expenseForm, date:e.target.value})}
                    />
                </div>

                {/* LINHA 3: Configurações de Parcela */}
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setExpenseForm({...expenseForm, isFixed: !expenseForm.isFixed, installments: '1', isInstallmentValue: false})}
                        disabled={!!editingId}
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all whitespace-nowrap ${expenseForm.isFixed ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}
                    >
                        {expenseForm.isFixed ? 'Fixa ✅' : 'Fixa?'}
                    </button>

                    {!expenseForm.isFixed && (
                        <>
                            <button
                                type="button"
                                onClick={() => setExpenseForm({...expenseForm, isInstallmentValue: !expenseForm.isInstallmentValue})}
                                disabled={!!editingId} 
                                className={`flex-1 px-2 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all whitespace-nowrap ${expenseForm.isInstallmentValue ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}
                            >
                                {expenseForm.isInstallmentValue ? 'Vr. Parcela' : 'Vr. Total'}
                            </button>
                            <input 
                                disabled={!!editingId} 
                                className="w-12 p-2 text-[10px] border rounded-lg text-center transition-colors outline-none focus:border-red-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                                placeholder="1x" 
                                maxLength={3}
                                value={expenseForm.installments} 
                                onChange={e => setExpenseForm({...expenseForm, installments: e.target.value.replace(/\D/g, '')})}
                            />
                        </>
                    )}
                </div>

                {/* LINHA 4: Forma de Pagamento e Categoria (SEMPRE LADO A LADO) */}
                <div className="grid grid-cols-2 gap-2">
                    <select 
                        className="w-full p-2 text-xs border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all" 
                        value={expenseForm.paymentMethod || 'Pix'} 
                        onChange={e=>setExpenseForm({...expenseForm, paymentMethod: e.target.value})}
                    >
                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    <select 
                        className="w-full p-2 text-xs border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all" 
                        value={expenseForm.category} 
                        onChange={e=>setExpenseForm({...expenseForm, category:e.target.value})}
                    >
                        {expenseCategories.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* LINHA 5: Cartão (SÓ APARECE SE FOR CRÉDITO) */}
                {expenseForm.paymentMethod === 'Crédito' && (
                     <select 
                        className="w-full p-2 text-xs border rounded-lg bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200 outline-none focus:ring-1 focus:ring-yellow-500 transition-all font-bold animate-fadeIn" 
                        value={expenseForm.card || ''} 
                        onChange={e=>setExpenseForm({...expenseForm, card: e.target.value})}
                    >
                        <option value="">Selecione o Cartão...</option>
                        {creditCards.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                )}
                
                <button 
                    onClick={()=>addTransaction('expense')} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1 mt-1"
                >
                    {editingId ? <><Edit size={12}/> Salvar</> : <><DollarSign size={12}/> Adicionar</>}
                </button>
            </div>
        </div>
      </div>

        {/* 3. COLUNA DIREITA: EXTRATO (65%) */}
        <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px] transition-colors">
                <h3 className="font-bold mb-6 flex justify-between items-center text-gray-800 dark:text-gray-100 text-lg">
                <span className="flex items-center gap-2"><List className="text-blue-500"/> Extrato de Movimentações</span>
                <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                    {formatMonthYear(currentDate)}
                </span>
                </h3>

        {/* BARRA DE FILTROS DINÂMICA */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Botão GERAL */}
            <button 
                onClick={() => setActiveFilter('Geral')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all whitespace-nowrap ${
                    activeFilter === 'Geral' 
                    ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-800 ring-2 ring-offset-1 ring-gray-800 dark:ring-white' 
                    : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                }`}
            >
                Geral
            </button>
    
            {/* Divisor */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            {/* Botões dos Cartões Reais */}
            {creditCards.map(card => (
                <button 
                    key={card.id}
                    onClick={() => setActiveFilter(card.name)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                        activeFilter === card.name 
                        ? `bg-gradient-to-r ${card.color || 'from-gray-700 to-gray-900'} text-white shadow-md ring-2 ring-offset-1 ring-gray-400` 
                        : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                    <CreditCard size={12}/> {card.name}
                </button>
            ))}
        </div>
                
                <div className="space-y-2">
                {transactions.filter(t => { 
                    // 1. Filtro de Data (Mantido)
                    const [y, m] = t.date.split('-'); 
                    const isSameMonth = (parseInt(m)-1)===currentDate.getMonth() && parseInt(y)===currentDate.getFullYear();
                    
                    // 2. Filtro de Cartão (NOVO)
                    // Se for 'Geral', aceita tudo. Se não, só aceita se o cartão for igual ao filtro.
                    const matchesCard = activeFilter === 'Geral' || t.card === activeFilter;

                    return isSameMonth && matchesCard;
                }).slice().reverse().map(t => (
                    <div key={t.id} className={`group flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 dark:border-gray-700/50 last:border-0 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all ${editingId === t.id ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800' : ''}`}>
                    
                    {/* Info Esquerda */}
                    <div className="flex items-start gap-3 mb-2 md:mb-0">
                        <div className={`p-2.5 rounded-lg ${t.type === 'receita' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {t.type === 'receita' ? <DollarSign size={18}/> : <CreditCard size={18}/>}
                        </div>
                        <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{t.description}</p>
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
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pl-12 md:pl-0">
                        <span className={`font-bold text-base whitespace-nowrap ${
                        (['Aporte', 'Resgate', 'Estorno'].includes(t.category)) 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : t.type === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                        {t.type === 'receita' ? '+' : '-'} R$ {Number(t.value).toFixed(2)}
                        </span>
                        
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        {t.installmentGroupId && (
                            <button 
                            onClick={() => setAnticipateModal({ show: true, transaction: t })} 
                            className="p-1.5 text-orange-400 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                            title="Antecipar"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
                            </button>
                        )}
                        <button onClick={()=>startEditing(t)} className="p-1.5 text-blue-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"><Edit size={16}/></button>
                        <button onClick={()=>removeTransaction(t.id)} className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        </div>
                    </div>
                    </div>
                ))}
                
                {transactions.filter(t => { 
                    const [y, m] = t.date.split('-'); 
                    return (parseInt(m)-1)===currentDate.getMonth() && parseInt(y)===currentDate.getFullYear() 
                }).length === 0 && (
                    <div className="text-center text-gray-400 dark:text-gray-500 py-20 flex flex-col items-center">
                    <List size={48} className="mb-3 opacity-20"/>
                    <p className="text-lg font-medium">Nenhum lançamento.</p>
                    <p className="text-sm opacity-60">Seus lançamentos aparecerão aqui.</p>
                    </div>
                )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}