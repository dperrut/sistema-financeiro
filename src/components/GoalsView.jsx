// --- COMPONENTE: TELA DE METAS COM CÁLCULO DE APORTE MENSAL INTELIGENTE ---
import React from 'react';
import { Target, DollarSign, Upload, Trash2, Calendar } from 'lucide-react';

export default function GoalsView({ 
  goalForm, setGoalForm, addGoal, goals, 
  addValueToTarget, deleteGoal, setWithdrawModal 
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

    const valorRestante = targetAmount - currentAmount;
    
    if (valorRestante <= 0) return 0; // Meta já atingida

    return valorRestante / mesesRestantes;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* FORMULÁRIO DE NOVA META */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-50">
        <h3 className="text-lg font-bold text-purple-800 mb-6 flex items-center gap-2 border-b pb-2">
          <Target className="text-purple-600"/> Planejar Nova Conquista
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Nome da Meta</label>
            <input className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" placeholder="Ex: Viagem..." value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name:e.target.value})}/>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Quanto precisa? (R$)</label>
            <input type="number" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" placeholder="0,00" value={goalForm.targetAmount} onChange={e=>setGoalForm({...goalForm, targetAmount:e.target.value})}/>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Data Alvo</label>
            <input type="date" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" value={goalForm.targetDate} onChange={e=>setGoalForm({...goalForm, targetDate:e.target.value})}/>
          </div>
          <div className="md:col-span-2 flex items-end">
            <button onClick={addGoal} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md transition-all">Criar</button>
          </div>
        </div>
      </div>

      {/* LISTA DE CARDS DE METAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map(g => {
          const percent = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
          const mensalSugestao = calculateMonthlySuggested(g.targetAmount, g.currentAmount, g.targetDate);

          return (
            <div key={g.id} className="bg-white rounded-2xl p-6 shadow-md border-b-4 border-purple-500 flex flex-col justify-between h-full hover:shadow-xl transition-all">
              <div>
                <div className="mb-4">
                  <h4 className="font-bold text-gray-800 text-xl leading-tight">{g.name}</h4>
                  
                  {/* --- MENSAGEM DE CONSULTORIA FINANCEIRA --- */}
                  {mensalSugestao > 0 && percent < 100 ? (
                    <div className="mt-2 bg-purple-50 p-2 rounded-lg border border-purple-100">
                      <p className="text-[10px] text-purple-700 font-bold uppercase flex items-center gap-1">
                        <Calendar size={12}/> Sugestão de Aporte
                      </p>
                      <p className="text-sm font-bold text-purple-900">R$ {mensalSugestao.toFixed(2)} / mês</p>
                    </div>
                  ) : percent >= 100 ? (
                    <div className="mt-2 bg-green-50 p-2 rounded-lg border border-green-100">
                      <p className="text-xs font-bold text-green-700 text-center">🎉 Meta Atingida!</p>
                    </div>
                  ) : null}
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-purple-700">R$ {parseFloat(g.currentAmount || 0).toFixed(2)}</span>
                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-1 mt-2">
                    <span>{percent.toFixed(0)}% concluído</span>
                    <span>Alvo: R$ {g.targetAmount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-purple-500 h-3 rounded-full transition-all duration-1000" style={{width: `${percent}%`}}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>addValueToTarget('goal', g.id, prompt('Valor para investir:'))} className="flex items-center justify-center gap-1 text-xs bg-green-50 text-green-700 py-2.5 rounded-lg font-bold border border-green-200"><DollarSign size={14}/> Investir</button>
                  <button onClick={()=>setWithdrawModal({show:true, type:'goal', id:g.id, name:g.name})} className="flex items-center justify-center gap-1 text-xs bg-blue-50 text-blue-700 py-2.5 rounded-lg font-bold border border-blue-200"><Upload size={14}/> Resgatar</button>
                </div>
                <button onClick={()=>deleteGoal(g.id)} className="w-full flex items-center justify-center gap-1 text-xs text-red-500 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"><Trash2 size={14}/> Excluir Meta</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}