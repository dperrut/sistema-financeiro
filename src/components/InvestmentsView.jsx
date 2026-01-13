// --- COMPONENTE: TELA DE INVESTIMENTOS (VERSÃO SIMPLIFICADA - APORTE INICIAL) ---
import React from 'react';
import { TrendingUp, DollarSign, Upload, Trash2, Wallet } from 'lucide-react';

export default function InvestmentsView({ 
  investmentForm, setInvestmentForm, addInvestment, investments, 
  addValueToTarget, deleteInvestment, setWithdrawModal,
  handleCurrencyChange 
}) {

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. NOVO FORMULÁRIO: FOCADO EM APORTE INICIAL */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100 border-l-4 border-l-blue-500">
        <h3 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
          <TrendingUp size={14} className="text-blue-600"/> Iniciar Novo Investimento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="md:col-span-6">
            <input 
              className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-blue-400" 
              placeholder="Nome do Ativo (Ex: Tesouro Selic, CDB Inter...)" 
              value={investmentForm.name || ''} 
              onChange={e=>setInvestmentForm({...investmentForm, name:e.target.value})}
            />
          </div>
          <div className="md:col-span-4">
            <input 
              type="text" 
              className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-blue-400" 
              placeholder="Valor do Aporte Inicial (R$)" 
              value={investmentForm.initialAmount || ''} // <--- MUDOU AQUI (initialAmount)
              onChange={e => handleCurrencyChange(e, setInvestmentForm, investmentForm, 'initialAmount')}
            />
          </div>
          <div className="md:col-span-2">
            <button 
              onClick={addInvestment} 
              className="w-full bg-blue-600 text-white p-2 text-sm rounded-lg font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
            >
              Criar Invest.
            </button>
          </div>
        </div>
      </div>

      {/* 2. GRADE DE CARDS (LIMPA E SEM BARRA DE PROGRESSO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {investments && investments.map(inv => (
          <div key={inv.id} className="bg-white rounded-xl p-4 shadow-sm border border-blue-50 flex flex-col justify-between h-full hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="max-w-[80%]">
                  <h4 className="font-bold text-gray-800 text-sm leading-tight truncate" title={inv.name}>{inv.name}</h4>
                  <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">Ativo Financeiro</span>
                </div>
                <div className="bg-blue-50 p-1.5 rounded-lg">
                  <Wallet size={16} className="text-blue-500" />
                </div>
              </div>

              {/* SALDO EM DESTAQUE */}
              <div className="flex flex-col bg-slate-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Saldo Acumulado</span>
                <span className="text-xl font-black text-blue-700">R$ {parseFloat(inv.currentAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* AÇÕES */}
            <div className="pt-3 mt-4 border-t border-gray-50 space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={()=>addValueToTarget('investment', inv.id)} className="flex items-center justify-center gap-1 text-[10px] bg-green-50 text-green-700 py-2 rounded-md font-bold border border-green-100">
                  <DollarSign size={12}/> Aportar
                </button>
                <button onClick={()=>setWithdrawModal({show:true, type:'investment', id:inv.id, name:inv.name})} className="flex items-center justify-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 py-2 rounded-md font-bold border border-indigo-100">
                  <Upload size={12}/> Resgatar
                </button>
              </div>
              <button onClick={()=>deleteInvestment(inv.id)} className="w-full text-[10px] text-gray-400 py-1 font-bold hover:text-red-500 transition-colors rounded-md">
                <Trash2 size={12} className="inline mr-1"/> Excluir Ativo
              </button>
            </div>
          </div>
        ))}

        {(!investments || investments.length === 0) && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <TrendingUp size={40} className="mx-auto text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">Nenhum investimento ativo.</p>
          </div>
        )}
      </div>
    </div>
  );
}