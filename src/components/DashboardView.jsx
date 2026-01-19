// --- COMPONENTE: VISÃO DO DASHBOARD (ATUALIZADO) ---
import React from 'react';
import { Home, PieChart as PieIcon, TrendingUp, CreditCard, CalendarClock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import SummaryCards from './SummaryCards';

export default function DashboardView({ 
  totalPatrimony, accumulatedBalance, totalGoals, totalInvestments, 
  monthlyIncome, monthlyExpense, monthlyBalance, 
  pieData, barData, COLORS,
  invoiceTotal, nextInvoiceTotal 
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. HERO: PATRIMÔNIO E SALDOS */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
            
            {/* Patrimônio Total */}
            <div className="p-6 flex flex-col items-center justify-center bg-blue-50/50 dark:bg-blue-900/10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300">
                        <Home size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patrimônio</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
                    R$ {totalPatrimony.toFixed(2)}
                </h2>
            </div>

            {/* Saldo Livre */}
            <div className="p-4 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gray-400 uppercase mb-1">Disponível (Livre)</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">R$ {accumulatedBalance.toFixed(2)}</span>
            </div>

            {/* Metas */}
            <div className="p-4 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gray-400 uppercase mb-1">Em Metas</span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">R$ {totalGoals.toFixed(2)}</span>
            </div>

            {/* Investimentos */}
            <div className="p-4 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-gray-400 uppercase mb-1">Investido</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">R$ {totalInvestments.toFixed(2)}</span>
            </div>
        </div>
      </div>

      {/* 2. ÁREA DE CARTÕES DE CRÉDITO (NOVO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Fatura Atual */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between relative overflow-hidden group hover:border-orange-200 transition-all">
              <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                  <CreditCard size={100} />
              </div>
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={16} className="text-orange-500"/>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Fatura Atual</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      R$ {(invoiceTotal || 0).toFixed(2)}
                  </h3>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-md w-fit">
                      Vence este mês
                  </p>
              </div>
          </div>

          {/* Próxima Fatura */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between relative overflow-hidden group hover:border-blue-200 transition-all">
              <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                  <CalendarClock size={100} />
              </div>
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <CalendarClock size={16} className="text-blue-500"/>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Próxima Fatura</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      R$ {(nextInvoiceTotal || 0).toFixed(2)}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md w-fit">
                      Estimativa Futura
                  </p>
              </div>
          </div>
      </div>

      {/* 3. FLUXO DE CAIXA MENSAL (SummaryCards) */}
      <SummaryCards income={monthlyIncome} expense={monthlyExpense} balance={monthlyBalance} />

      {/* 4. GRÁFICOS AMPLIADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gráfico de Pizza */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-96 flex flex-col">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <PieIcon size={18} className="text-blue-500"/> Distribuição de Gastos
          </h3>
          <div className="flex-1 w-full min-h-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => `R$ ${value.toFixed(2)}`} 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={10}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                <PieIcon size={48} className="mb-2 opacity-20"/>
                <span className="text-sm">Sem dados para o gráfico</span>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Barras */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-96 flex flex-col">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-500"/> Evolução (6 Meses)
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af'}} />
                <RechartsTooltip 
                    formatter={(value) => `R$ ${value.toFixed(2)}`} 
                    cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                />
                <Legend verticalAlign="top" align="right" iconSize={10} wrapperStyle={{paddingBottom: '20px'}}/>
                <Bar dataKey="Receita" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Despesa" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}