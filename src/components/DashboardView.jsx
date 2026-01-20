// --- COMPONENTE: VISÃO DO DASHBOARD (VERSÃO ULTRA COMPACTA) ---
import React from 'react';
import { Home, PieChart as PieIcon, TrendingUp, CreditCard, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardView({ 
  totalPatrimony, accumulatedBalance, totalGoals, totalInvestments, 
  monthlyIncome, monthlyExpense, monthlyBalance, 
  pieData, barData, COLORS,
  invoiceTotal, nextInvoiceTotal 
}) {
  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6"> {/* Reduzi space-y-6 para 4 e pb-10 para 6 */}
      
      {/* 1. PAINEL FINANCEIRO UNIFICADO (COMPACTO) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        
        {/* PARTE SUPERIOR: 4 PILARES (Mais fino) */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800">
            {/* Item 1 */}
            <div className="p-2 flex flex-col items-center justify-center relative group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
                    <Home size={12} className="text-blue-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Patrimônio</span>
                </div>
                <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100 leading-tight">
                    R$ {totalPatrimony.toFixed(2)}
                </h2>
            </div>
            {/* Item 2 */}
            <div className="p-2 flex flex-col items-center justify-center relative group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
                    <Wallet size={12} className="text-green-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Livre</span>
                </div>
                <h2 className={`text-lg font-extrabold leading-tight ${accumulatedBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    R$ {accumulatedBalance.toFixed(2)}
                </h2>
            </div>
            {/* Item 3 */}
            <div className="p-2 flex flex-col items-center justify-center relative group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
                    <TrendingUp size={12} className="text-purple-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Metas</span>
                </div>
                <h2 className="text-lg font-extrabold text-purple-600 dark:text-purple-400 leading-tight">
                    R$ {totalGoals.toFixed(2)}
                </h2>
            </div>
            {/* Item 4 */}
            <div className="p-2 flex flex-col items-center justify-center relative group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
                    <PieIcon size={12} className="text-blue-500" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Investido</span>
                </div>
                <h2 className="text-lg font-extrabold text-blue-600 dark:text-blue-400 leading-tight">
                    R$ {totalInvestments.toFixed(2)}
                </h2>
            </div>
        </div>

        {/* PARTE INFERIOR: OPERAÇÃO (Compactada) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">
            
            {/* ESQUERDA: CARTÕES (Padding reduzido p-3) */}
            <div className="p-3 relative overflow-hidden flex flex-col justify-center">
                {/* Ícone de fundo reduzido para não atrapalhar */}
                <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] pointer-events-none">
                    <CreditCard size={80} />
                </div>
                
                <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                    <CreditCard size={12}/> Compromissos de Cartão
                </h3>
                
                <div className="flex gap-4 items-center">
                    {/* Atual */}
                    <div className="flex-1">
                        <p className="text-[9px] font-bold text-orange-500 uppercase mb-0.5">Vence Agora</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-none">R$ {(invoiceTotal || 0).toFixed(2)}</p>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full" style={{ width: '70%' }}></div>
                        </div>
                    </div>
                    {/* Divisor */}
                    <div className="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
                    {/* Próxima */}
                    <div className="flex-1">
                        <p className="text-[9px] font-bold text-blue-500 uppercase mb-0.5">Próximas Faturas</p>
                        <p className="text-lg font-bold text-gray-400 dark:text-gray-500 leading-none">R$ {(nextInvoiceTotal || 0).toFixed(2)}</p>
                         <div className="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-blue-300 h-full rounded-full" style={{ width: '30%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DIREITA: FLUXO (Padding reduzido p-3 e gap apertado) */}
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
                        <span className="font-bold text-green-600 dark:text-green-400">R$ {monthlyIncome.toFixed(2)}</span>
                    </div>

                    {/* Despesa */}
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                             <ArrowDownCircle size={10} className="text-red-500"/> Saiu
                        </span>
                        <span className="font-bold text-red-600 dark:text-red-400">R$ {monthlyExpense.toFixed(2)}</span>
                    </div>

                    {/* Barra de Balanço (Ocupa as 2 colunas) */}
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
                                Balanço: R$ {monthlyBalance.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. GRÁFICOS (Mantidos, mas agora devem subir bastante) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Gap reduzido para 4 */}
        
        {/* Gráfico 1 */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-64 flex flex-col"> {/* Altura h-64 (256px) para economizar */}
          <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-2 flex items-center gap-2">
            <PieIcon size={14} className="text-blue-500"/> Distribuição
          </h3>
          <div className="flex-1 w-full min-h-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                  <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
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

        {/* Gráfico 2 */}
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
                <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
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