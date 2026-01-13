// --- COMPONENTE: TELA DE METAS COM CÁLCULO DE APORTE MENSAL INTELIGENTE ---
import React from 'react';
import { Target, DollarSign, Upload, Trash2, Calendar } from 'lucide-react';

export default function GoalsView({ 
  goalForm, setGoalForm, addGoal, goals, 
  addValueToTarget, deleteGoal, setWithdrawModal,
  handleCurrencyChange // <--- Faltava essa vírgula e esse nome aqui!
}) {

  // --- FUNÇÃO DE MESTRE: CALCULA QUANTO POUPAR POR MÊS ---
  const calculateMonthlySuggested = (targetAmount, currentAmount, targetDate) => {
    if (!targetDate) return null;

    const today = new Date();
    const target = new Date(targetDate);
    
    // Calcula a diferença em meses
    const diffAnos = target.getFullYear() - today.getFullYear();
    const diffMeses = target.getMonth() - today.getMonth();
    let mesesRestantes = (diffAnos * 12) + diffMeses;

    // Se a meta for para o mês atual, consideramos 1 mês para não dividir por zero
    if (mesesRestantes <= 0) mesesRestantes = 1;

    const targetClean = typeof targetAmount === 'string' ? parseFloat(targetAmount.replace(/\./g, '').replace(',', '.') || 0) : targetAmount;
    const valorRestante = targetClean - currentAmount;
    
    if (valorRestante <= 0) return 0; // Meta já atingida

    return valorRestante / mesesRestantes;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* FORMULÁRIO DE NOVA META REFINADO */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-purple-100">
        <h3 className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-2">
          <Target size={14} className="text-purple-600"/> Crie sua próxima meta
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-11 gap-2">
          {/* Nome da Meta */}
          <div className="md:col-span-4">
            <input 
              className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-purple-400" 
              placeholder="Nome da Meta (Ex: Viagem)" 
              value={goalForm.name} 
              onChange={e=>setGoalForm({...goalForm, name:e.target.value})}
            />
          </div>
          {/* Valor */}
          <div className="md:col-span-3">
            <input 
              type="text" // <--- MUDANÇA AQUI
              className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-purple-400" 
              placeholder="Quanto precisa? (R$)" 
              value={goalForm.targetAmount} 
              onChange={e => handleCurrencyChange(e, setGoalForm, goalForm, 'targetAmount')} // <--- MUDANÇA AQUI
            />
          </div>
          {/* Campo de Data com Rótulo Explicativo */}
          <div className="md:col-span-2 relative">
            <label className="absolute -top-2 left-2 bg-white px-1 text-[9px] font-bold text-purple-400">Data para Resgate</label>
            <input 
              type="date" 
              className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-purple-400 cursor-pointer" 
              value={goalForm.targetDate} 
              onChange={e=>setGoalForm({...goalForm, targetDate:e.target.value})}
            />
          </div>
          {/* Botão */}
          <div className="md:col-span-2">
            <button 
              onClick={addGoal} 
              className="w-full bg-purple-600 text-white p-2 text-sm rounded-lg font-bold hover:bg-purple-700 shadow-sm transition-all active:scale-95"
            >
              Criar Meta
            </button>
          </div>
        </div>
      </div>

      {/* LISTA DE CARDS DE METAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {goals.map(g => {
          const targetClean = typeof g.targetAmount === 'string' ? parseFloat(g.targetAmount.replace(/\./g, '').replace(',', '.') || 0) : g.targetAmount;
          const percent = targetClean > 0 ? Math.min((g.currentAmount / targetClean) * 100, 100) : 0;
          const mensalSugestao = calculateMonthlySuggested(g.targetAmount, g.currentAmount, g.targetDate);

          return (
            <div key={g.id} className="bg-white rounded-xl p-4 shadow-sm border border-purple-100 flex flex-col justify-between h-full hover:shadow-md transition-all">
              <div className="space-y-3">
                {/* Título e Sugestão */}
                <div>
                  <h4 className="font-bold text-gray-800 text-sm leading-tight truncate" title={g.name}>{g.name}</h4>
                  
                  {mensalSugestao > 0 && percent < 100 ? (
                    <div className="mt-1 bg-purple-50 p-1.5 rounded-lg border border-purple-100">
                      <p className="text-[9px] text-purple-700 font-bold uppercase flex items-center gap-1">
                        <Calendar size={10}/> Sugestão p/ mês
                      </p>
                      <p className="text-xs font-bold text-purple-900">R$ {mensalSugestao.toFixed(2)}</p>
                    </div>
                  ) : percent >= 100 ? (
                    <div className="mt-1 bg-green-50 p-1.5 rounded-lg border border-green-100">
                      <p className="text-[10px] font-bold text-green-700 text-center">🎉 Concluída!</p>
                    </div>
                  ) : null}
                </div>

                {/* Valores e Barra de Progresso */}
                <div className="space-y-1">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">Acumulado</span>
                    <span className="text-xl font-bold text-purple-700 leading-none">R$ {parseFloat(g.currentAmount || 0).toFixed(2)}</span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-2">
                    <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{width: `${percent}%`}}></div>
                  </div>

                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>{percent.toFixed(0)}%</span>
                    <span className="text-right">Alvo: R$ {g.targetAmount}</span>
                  </div>
                </div>

                {/* Data Alvo com seu descritivo sugerido */}
                {g.targetDate && (
                  <div className="bg-gray-50 p-1.5 rounded-md border border-gray-100 text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Previsão de Resgate</p>
                    <p className="text-[11px] font-bold text-gray-600">{g.targetDate.split('-').reverse().join('/')}</p>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 mt-3 border-t border-gray-50 space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={()=>addValueToTarget('goal', g.id)} className="flex items-center justify-center gap-1 text-[10px] bg-green-50 text-green-700 py-1.5 rounded-md font-bold border border-green-100 hover:bg-green-100 transition-colors">
                    <DollarSign size={12}/> Investir
                  </button>
                  <button onClick={()=>setWithdrawModal({show:true, type:'goal', id:g.id, name:g.name})} className="flex items-center justify-center gap-1 text-[10px] bg-blue-50 text-blue-700 py-1.5 rounded-md font-bold border border-blue-100 hover:bg-blue-100 transition-colors">
                    <Upload size={12}/> Resgatar
                  </button>
                </div>
                <button onClick={()=>deleteGoal(g.id)} className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 py-1 rounded-md font-bold hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={12}/> Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}