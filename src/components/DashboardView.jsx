// --- COMPONENTE: VISÃO DO DASHBOARD (VERSÃO OTIMIZADA E COMPACTA) ---
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
    // space-y-4 mantém o respiro entre os grandes blocos
    <div className="space-y-4 max-w-6xl mx-auto">
      
      {/* 1. BANNER DE PATRIMÔNIO (ALTURA REDUZIDA PARA 90PX) */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-0 rounded-xl shadow-lg text-white grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-[90px]">
        {/* Lado Esquerdo: py-2 achata o conteúdo verticalmente */}
        <div className="py-2 px-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-blue-500/30 bg-blue-900/20">
          <div className="flex items-center gap-3 mb-0">
            <div className="bg-white/10 p-1 rounded-full"><Home size={18} className="text-white" /></div>
            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">Patrimônio Total</p>
          </div>
          <h2 className="text-2xl font-bold">R$ {totalPatrimony.toFixed(2)}</h2>
        </div>

        {/* Lado Direito: Detalhes */}
        <div className="grid grid-cols-3 divide-x divide-blue-500/30 bg-blue-800/10">
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-base font-bold text-white block">R$ {accumulatedBalance.toFixed(2)}</span>
            <span className="text-[10px] text-blue-200 uppercase font-bold">Livre</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-base font-bold text-white block">R$ {totalGoals.toFixed(2)}</span>
            <span className="text-[10px] text-blue-200 uppercase font-bold">Metas</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-base font-bold text-white block">R$ {totalInvestments.toFixed(2)}</span>
            <span className="text-[10px] text-blue-200 uppercase font-bold">Invest.</span>
          </div>
        </div>
      </div>

      {/* 2. CARDS DE RESUMO (O ESPAÇAMENTO INTERNO É AJUSTADO NO ARQUIVO SUMMARYCARDS.JSX) */}
      <SummaryCards income={monthlyIncome} expense={monthlyExpense} balance={monthlyBalance} />

      {/* 3. ÁREA DE GRÁFICOS (ALTURA REDUZIDA PARA H-52) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gráfico de Pizza */}
        <div className="bg-white py-2 px-4 rounded-xl shadow-sm h-52 flex flex-col">
          <h3 className="font-bold text-gray-700 mb-1 flex items-center gap-2 text-xs">
            <PieIcon size={14}/> Gastos por Categoria
          </h3>
          <div className="flex-1 w-full min-h-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                  <Legend verticalAlign="bottom" height={30} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300 text-[10px]">Sem gastos este mês</div>
            )}
          </div>
        </div>

        {/* Gráfico de Barras */}
        <div className="bg-white py-2 px-4 rounded-xl shadow-sm h-52 flex flex-col">
          <h3 className="font-bold text-gray-700 mb-1 flex items-center gap-2 text-xs">
            <TrendingUp size={14}/> Histórico (6 Meses)
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} cursor={{fill: '#f3f4f6'}} />
                <Legend iconSize={8} wrapperStyle={{fontSize: '9px'}}/>
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