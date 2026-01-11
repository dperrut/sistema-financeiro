// --- COMPONENTE: TELA DE INVESTIMENTOS (VERSÃO REFINADA) ---
import React from 'react';
import { TrendingUp, DollarSign, Upload, Trash2 } from 'lucide-react';

export default function InvestmentsView({ 
  investmentForm, setInvestmentForm, addInvestment, investments, 
  addValueToTarget, deleteInvestment, setWithdrawModal,
  handleCurrencyChange // <--- ADICIONADO: Prop para formatar moeda
}) {

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. FORMULÁRIO DE NOVO INVESTIMENTO COMPACTO */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100">
        <h3 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
          <TrendingUp size={14} className="text-blue-600"/> Crie sua próxima meta de investimento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-11 gap-2">
          {/* Nome */}
          <div className="md:col-span-4">
            <input 
              className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-blue-400" 
              placeholder="Ex: Tesouro Selic, CDB Inter..." 
              value={investmentForm.name || ''} 
              onChange={e=>setInvestmentForm({...investmentForm, name:e.target.value})}
            />
          </div>
          {/* Valor Alvo com Máscara de Moeda */}
          <div className="md:col-span-3">
            <input 
              type="text" // <--- ALTERADO: de number para text para a máscara funcionar
              className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-blue-400" 
              placeholder="Meta de Valor (R$)" 
              value={investmentForm.targetAmount || ''} 
              onChange={e => handleCurrencyChange(e, setInvestmentForm, investmentForm, 'targetAmount')}
            />
          </div>
          {/* Data Prevista */}
          <div className="md:col-span-2 relative">
            <label className="absolute -top-2 left-2 bg-white px-1 text-[9px] font-bold text-blue-400">Data de Resgate</label>
            <input 
              type="date" 
              className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-blue-400 cursor-pointer" 
              value={investmentForm.targetDate || ''} 
              onChange={e=>setInvestmentForm({...investmentForm, targetDate:e.target.value})}
            />
          </div>
          {/* Botão */}
          <div className="md:col-span-2">
            <button 
              onClick={addInvestment} 
              className="w-full bg-blue-600 text-white p-2 text-sm rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
            >
              Criar Invest.
            </button>
          </div>
        </div>
      </div>

      {/* 2. GRADE DE CARDS (4 COLUNAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {investments && investments.map(inv => {
          // --- LIMPEZA DE DADOS PARA CÁLCULO DE PORCENTAGEM ---
          const targetClean = parseFloat(inv.targetAmount?.toString().replace(/\./g, '').replace(',', '.') || 0);
          const currentClean = parseFloat(inv.currentAmount || 0);
          const percent = targetClean > 0 ? Math.min((currentClean / targetClean) * 100, 100) : 0;

          return (
            <div key={inv.id} className="bg-white rounded-xl p-4 shadow-sm border border-blue-50 flex flex-col justify-between h-full hover:shadow-md transition-all">
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm leading-tight truncate" title={inv.name}>{inv.name}</h4>
                  <div className="mt-1"><span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">Investimento</span></div>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">Saldo Atual</span>
                    <span className="text-xl font-bold text-blue-700">R$ {currentClean.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{width: `${percent}%`}}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>{percent.toFixed(0)}%</span>
                    <span>Alvo: R$ {inv.targetAmount}</span>
                  </div>
                </div>

                {inv.targetDate && (
                  <div className="bg-blue-50/50 p-1.5 rounded-md border border-blue-100 text-center">
                    <p className="text-[9px] text-blue-400 font-bold uppercase">Previsão de Resgate</p>
                    <p className="text-[11px] font-bold text-gray-600">{inv.targetDate.split('-').reverse().join('/')}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-gray-50 space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={()=>addValueToTarget('investment', inv.id, prompt('Valor para aportar:'))} className="text-[10px] bg-green-50 text-green-700 py-1.5 rounded-md font-bold border border-green-100 hover:bg-green-100 transition-colors">
                    <DollarSign size={12}/> Aportar
                  </button>
                  <button onClick={()=>setWithdrawModal({show:true, type:'investment', id:inv.id, name:inv.name})} className="text-[10px] bg-indigo-50 text-indigo-700 py-1.5 rounded-md font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors">
                    <Upload size={12}/> Resgatar
                  </button>
                </div>
                <button onClick={()=>deleteInvestment(inv.id)} className="w-full text-[10px] text-gray-400 py-1 font-bold hover:text-red-500 hover:bg-red-50 transition-colors rounded-md">
                  <Trash2 size={12} className="inline mr-1"/> Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}