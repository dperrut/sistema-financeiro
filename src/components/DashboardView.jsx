// --- COMPONENTE: VISÃO DO DASHBOARD (COM MODO ESCURO) ---
import React from 'react';
import { Home, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import SummaryCards from './SummaryCards';

export default function DashboardView({ 
  totalPatrimony, accumulatedBalance, totalGoals, totalInvestments, 
  monthlyIncome, monthlyExpense, monthlyBalance, 
  pieData, barData, COLORS 
}) {
  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      
      {/* 1. BANNER DE PATRIMÔNIO (ESTILO CARD PADRÃO) */}
      <div className="bg-white dark:bg-gray-800 p-0 rounded-xl shadow-lg shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-[90px] transition-colors duration-300">
        
        {/* Lado Esquerdo: Patrimônio Total */}
        <div className="py-2 px-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                <Home size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">Patrimônio Total</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">R$ {totalPatrimony.toFixed(2)}</h2>
        </div>

        {/* Lado Direito: Detalhes (Livre, Metas, Investimentos) */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
          
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-base font-bold text-gray-700 dark:text-gray-200 block">R$ {accumulatedBalance.toFixed(2)}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Livre</span>
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

      {/* 2. CARDS DE RESUMO (JÁ EDITAMOS O ARQUIVO SUMMARYCARDS PARA FICAR ESCURO) */}
      <SummaryCards income={monthlyIncome} expense={monthlyExpense} balance={monthlyBalance} />

      {/* 3. ÁREA DE GRÁFICOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Gráfico de Pizza - Agora fica cinza escuro no dark mode */}
        <div className="bg-white dark:bg-gray-800 py-2 px-4 rounded-xl shadow-sm h-52 flex flex-col transition-colors duration-300">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-1 flex items-center gap-2 text-xs">
            <PieIcon size={14}/> Gastos por Categoria
          </h3>
          <div className="flex-1 w-full min-h-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                  </Pie>
                  {/* Tooltip agora tem estilo escuro também */}
                  <RechartsTooltip 
                    formatter={(value) => `R$ ${value.toFixed(2)}`} 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', fontSize: '12px' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend verticalAlign="bottom" height={30} iconSize={8} wrapperStyle={{fontSize: '10px', color: '#9ca3af'}}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300 dark:text-gray-600 text-[10px]">Sem gastos este mês</div>
            )}
          </div>
        </div>

        {/* Gráfico de Barras - Agora fica cinza escuro no dark mode */}
        <div className="bg-white dark:bg-gray-800 py-2 px-4 rounded-xl shadow-sm h-52 flex flex-col transition-colors duration-300">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-1 flex items-center gap-2 text-xs">
            <TrendingUp size={14}/> Histórico (6 Meses)
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#9ca3af'}} />
                <RechartsTooltip 
                    formatter={(value) => `R$ ${value.toFixed(2)}`} 
                    cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', fontSize: '12px' }}
                />
                <Legend iconSize={8} wrapperStyle={{fontSize: '9px', color: '#9ca3af'}}/>
                <Bar dataKey="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesa" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}