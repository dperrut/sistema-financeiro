// --- COMPONENTE: VISÃO DO DASHBOARD (VERSÃO ULTRA COMPACTA) ---
import React, { useState, useEffect } from 'react';
import { Home, PieChart as PieIcon, TrendingUp, CreditCard, ArrowUpCircle, ArrowDownCircle, Wallet, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { ref, onValue } from 'firebase/database'; // NOVOS IMPORTS
import { db } from '../firebase'; // NOVO IMPORT

export default function DashboardView({ 
  currentUser, 
  totalPatrimony, accumulatedBalance, totalGoals, totalInvestments, 
  monthlyIncome, monthlyExpense, monthlyBalance, 
  pieData, barData, COLORS,
  invoiceTotal, nextInvoiceTotal,
  overdueList = [], // <--- Recebe a lista (padrão vazio)
  onNavigateToCard, // <--- Recebe a função de navegação // <--- NOVO: Recebe a quantidade de faturas atrasadas (padrão 0)
}) {

  const [showOverdueMenu, setShowOverdueMenu] = React.useState(false);
  // --- LÓGICA DE ORÇAMENTO INTELIGENTE ---
  const [budgetSettings, setBudgetSettings] = useState({ active: false, limits: {} });

  // 1. Busca configurações no Firebase
  useEffect(() => {
    if (currentUser?.familyId) {
      const settingsRef = ref(db, `families/${currentUser.familyId}/settings`);
      const unsubscribe = onValue(settingsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setBudgetSettings({
            active: data.showBudgetLimits || false,
            limits: data.budgetLimits || {}
          });
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  // 2. Calcula cores e status
  const getBudgetStatus = (categoryName, currentSpent) => {
    const limitPercent = budgetSettings.limits[categoryName] || 0;
    
    // Se não tiver limite ou modo desligado, retorna null
    if (!budgetSettings.active || limitPercent === 0) return null;

    // Calcula baseada na receita mensal
    const limitAmount = (monthlyIncome * limitPercent) / 100;
    const percentUsed = limitAmount > 0 ? (currentSpent / limitAmount) * 100 : 0;

    if (percentUsed >= 100) return { color: 'bg-red-500', text: 'text-red-500', status: 'critical', percent: percentUsed };
    if (percentUsed >= 75) return { color: 'bg-yellow-500', text: 'text-yellow-600', status: 'warning', percent: percentUsed };
    return { color: 'bg-green-500', text: 'text-green-500', status: 'ok', percent: percentUsed };
  };
  // Função para formatar dinheiro (R$ 1.000,00)
  const formatBRL = (value) => {
    return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6"> {/* Reduzi space-y-6 para 4 e pb-10 para 6 */}
      
      {/* 1. PAINEL FINANCEIRO UNIFICADO (COMPACTO) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        
        {/* PARTE SUPERIOR: 4 PILARES (Mais fino) */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800">
            {/* Item 1 - Patrimônio */}
            <div className="p-2 flex flex-col items-center justify-center relative group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
                    <Home size={12} className="text-blue-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Patrimônio</span>
                </div>
                <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100 leading-tight">
                    R$ {formatBRL(totalPatrimony)}
                </h2>
            </div>
            {/* Item 2 - Livre */}
            <div className="p-2 flex flex-col items-center justify-center relative group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
                    <Wallet size={12} className="text-green-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Livre</span>
                </div>
                <h2 className={`text-lg font-extrabold leading-tight ${accumulatedBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    R$ {formatBRL(accumulatedBalance)}
                </h2>
            </div>
            {/* Item 3 - Metas */}
            <div className="p-2 flex flex-col items-center justify-center relative group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
                    <TrendingUp size={12} className="text-purple-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Metas</span>
                </div>
                <h2 className="text-lg font-extrabold text-purple-600 dark:text-purple-400 leading-tight">
                    R$ {formatBRL(totalGoals)}
                </h2>
            </div>
            {/* Item 4 - Investido */}
            <div className="p-2 flex flex-col items-center justify-center relative group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
                    <PieIcon size={12} className="text-blue-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Investido</span>
                </div>
                <h2 className="text-lg font-extrabold text-blue-600 dark:text-blue-400 leading-tight">
                    R$ {formatBRL(totalInvestments)}
                </h2>
            </div>
        </div>

        {/* PARTE INFERIOR: OPERAÇÃO (Lado a Lado) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">
            
            {/* ESQUERDA: CARTÕES (Agora Horizontal) */}
            <div className="p-3 relative overflow-hidden flex flex-col justify-center">
                <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] pointer-events-none">
                    <CreditCard size={80} />
                </div>
                
                {/* Título */}
                <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1.5">
                    <CreditCard size={12}/> Compromissos de Cartão
                </h3>
                
                {/* CONTAINER FLEX: LADO A LADO */}
                <div className="flex items-start gap-3 mt-1">
                    
                    {/* COLUNA 1: A PAGAR (50%) */}
                    <div className="flex-1 relative">
                        {overdueList.length > 0 && (
                             <span className="absolute -top-1 -right-1 flex h-2 w-2">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                             </span>
                        )}

                        {/* MENU FLUTUANTE */}
                        {showOverdueMenu && overdueList.length > 1 && (
                            <div className="absolute top-8 left-0 z-50 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-red-100 dark:border-red-900 w-48 p-1 animate-fadeIn">
                                <p className="text-[9px] font-bold text-gray-400 uppercase px-2 py-1 border-b border-gray-100 dark:border-gray-700">Escolha a fatura:</p>
                                {overdueList.map(item => (
                                    <button 
                                        key={item.id}
                                        onClick={() => onNavigateToCard(item.id)}
                                        className="w-full text-left px-2 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex justify-between items-center"
                                    >
                                        <span className="truncate max-w-[80px]">{item.name}</span>
                                        <span className="text-red-500 text-[10px]">R$ {formatBRL(item.amount)}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* TÍTULO CLICÁVEL */}
                        <button 
                            onClick={() => {
                                if (overdueList.length === 1) onNavigateToCard(overdueList[0].id);
                                else if (overdueList.length > 1) setShowOverdueMenu(!showOverdueMenu);
                            }}
                            className={`text-left w-full focus:outline-none ${overdueList.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <p className={`text-[9px] font-bold uppercase mb-0.5 transition-colors ${overdueList.length > 0 ? 'text-red-500 animate-pulse hover:text-red-600' : 'text-orange-500'}`}>
                                {overdueList.length > 0 ? `⚠️ Atrasado (${overdueList.length})` : 'A Pagar'}
                            </p>
                            
                            <p className={`text-lg font-bold leading-none ${overdueList.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>
                                R$ {formatBRL(invoiceTotal || 0)}
                            </p>
                        </button>
                        
                        {/* BARRA DE PROGRESSO */}
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${overdueList.length > 0 ? 'bg-red-500' : 'bg-orange-500'}`} 
                                style={{ width: '70%' }}
                            ></div>
                        </div>
                    </div>

                    {/* COLUNA 2: PRÓXIMAS (50%) - COM BORDA ESQUERDA PARA SEPARAR */}
                    <div className="flex-1 pl-3 border-l border-gray-100 dark:border-gray-700 relative">
                        <p className="text-[9px] font-bold text-blue-500 uppercase mb-0.5">Próximas Faturas</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-none">
                            R$ {formatBRL(nextInvoiceTotal || 0)}
                        </p>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: '40%' }}></div>
                        </div>
                    </div>

                </div>
            </div>

            {/* DIREITA: FLUXO (Compacto e Alinhado) */}
            <div className="p-3 relative flex flex-col justify-center">
                 <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                    <TrendingUp size={12}/> Fluxo
                </h3>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {/* Receita */}
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                             <ArrowUpCircle size={10} className="text-green-500"/> Entrou
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">R$ {formatBRL(monthlyIncome)}</span>
                    </div>

                    {/* Despesa */}
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                             <ArrowDownCircle size={10} className="text-red-500"/> Saiu
                        </span>
                        <span className="font-bold text-red-600 dark:text-red-400">R$ {formatBRL(monthlyExpense)}</span>
                    </div>

                    {/* Barra de Balanço */}
                    <div className="col-span-2 mt-1">
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden flex">
                            <div 
                                className={`h-full ${monthlyBalance >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                                style={{ width: `${Math.min((monthlyExpense / (monthlyIncome || 1)) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-0.5">
                            <span className="text-[9px] text-gray-400">Comprometimento</span>
                            <span className={`text-[9px] font-bold ${monthlyBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                Balanço: R$ {formatBRL(monthlyBalance)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. GRÁFICOS (Mantidos, mas agora devem subir bastante) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Gráfico 1 - Pizza (Híbrido) */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-64 flex flex-col">
          <div className="flex justify-between items-center mb-2">
             <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm flex items-center gap-2">
                <PieIcon size={14} className="text-blue-500"/> Distribuição
             </h3>
             {budgetSettings.active && (
                 <span className="text-[9px] bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold uppercase border border-purple-100 dark:border-purple-800">
                    Modo Orçamento
                 </span>
             )}
          </div>

          <div className="flex-1 w-full min-h-0 flex gap-4">
            {/* COLUNA ESQUERDA: LISTA INTELIGENTE (Condicional) */}
            {budgetSettings.active && pieData.length > 0 && (
                <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 border-r border-gray-100 dark:border-gray-700 border-dashed">
                    <table className="w-full">
                        <tbody>
                            {pieData.map((entry) => {
                                const status = getBudgetStatus(entry.name, entry.value);
                                return (
                                    <tr key={entry.name} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="py-1.5 align-middle">
                                            <div className="flex items-center gap-1.5">
                                                {status ? (
                                                    <div className={`w-2 h-2 rounded-full ${status.color} ${status.status === 'critical' ? 'animate-ping' : ''}`}></div>
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                                )}
                                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 truncate max-w-[70px]" title={entry.name}>
                                                    {entry.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-right py-1.5">
                                            {status ? (
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-[9px] font-black ${status.text}`}>
                                                        {status.percent.toFixed(0)}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* COLUNA DIREITA: GRÁFICO (Adaptável) */}
            <div className={`flex-1 min-h-0 ${budgetSettings.active ? 'w-1/2' : 'w-full'}`}>
                {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => {
                            const status = getBudgetStatus(entry.name, entry.value);
                            const isCritical = status?.status === 'critical';
                            return (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                    strokeWidth={0} 
                                    className={isCritical ? "animate-pulse opacity-80" : ""} 
                                />
                            );
                        })}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `R$ ${formatBRL(value)}`} />
                    {/* Esconde legenda no modo orçamento pois já tem a lista */}
                    {!budgetSettings.active && <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>}
                    </PieChart>
                </ResponsiveContainer>
                ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                    <PieIcon size={32} className="mb-1"/>
                    <span className="text-xs">Sem dados</span>
                </div>
                )}
            </div>
          </div>
        </div>

        {/* Gráfico 2 - Barras */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-64 flex flex-col">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-2 flex items-center gap-2">
            <TrendingUp size={14} className="text-green-500"/> Evolução (6 Meses)
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dy={5} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <RechartsTooltip formatter={(value) => `R$ ${formatBRL(value)}`} />
                <Bar dataKey="Receita" fill="#10B981" radius={[3, 3, 0, 0]} barSize={15} />
                <Bar dataKey="Despesa" fill="#EF4444" radius={[3, 3, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}