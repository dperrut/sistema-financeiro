// --- COMPONENTE: TELA DE CARTEIRA DE INVESTIMENTOS ---
import React from 'react';
import { Briefcase, TrendingUp, DollarSign, XCircle, Trash2 } from 'lucide-react';

export default function InvestmentsView({ 
  investmentForm, setInvestmentForm, addInvestment, 
  investments, addValueToTarget, deleteInvestment, setWithdrawModal 
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* FORMULÁRIO DE NOVO INVESTIMENTO */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50">
        <h3 className="text-lg font-bold text-indigo-800 mb-6 flex items-center gap-2 border-b pb-2">
          <Briefcase className="text-indigo-600"/> Novo Investimento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Nome do Ativo</label>
            <input 
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" 
              placeholder="Ex: CDB Nubank, Ações Petrobras..." 
              value={investmentForm.name} 
              onChange={e=>setInvestmentForm({...investmentForm, name:e.target.value})}
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Tipo</label>
            <select 
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none"
              value={investmentForm.type} 
              onChange={e=>setInvestmentForm({...investmentForm, type:e.target.value})}
            >
              <option>Renda Fixa</option>
              <option>Ações / Bolsa</option>
              <option>Fundos Imobiliários</option>
              <option>Criptomoedas</option>
              <option>Poupança</option>
              <option>Outros</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Início (R$)</label>
            <input 
              type="number" 
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" 
              placeholder="0,00" 
              value={investmentForm.currentAmount} 
              onChange={e=>setInvestmentForm({...investmentForm, currentAmount:e.target.value})}
            />
          </div>
          
          <div className="md:col-span-2 flex items-end">
            <button 
              onClick={addInvestment} 
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all"
            >
              Criar
            </button>
          </div>
        </div>
      </div>

      {/* LISTA DE ATIVOS DA CARTEIRA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {investments.map(i => (
          <div key={i.id} className="bg-white rounded-2xl p-6 shadow-md border-b-4 border-indigo-500 flex flex-col justify-between h-full hover:shadow-xl transition-all relative">
            
            {/* Botão de Excluir no topo */}
            <button onClick={()=>deleteInvestment(i.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 size={18}/>
            </button>
            
            <div className="mb-4">
              <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md mb-2">
                {i.type || 'Renda Fixa'}
              </span>
              <h4 className="font-bold text-gray-800 text-xl leading-tight truncate pr-6">{i.name}</h4>
            </div>
            
            <div className="mb-6">
              <p className="text-xs text-gray-400 font-medium mb-1">Saldo Atual</p>
              <span className="text-3xl font-bold text-indigo-700 tracking-tight">
                R$ {parseFloat(i.currentAmount || 0).toFixed(2)}
              </span>
              <p className="mt-4 text-[10px] text-gray-400 uppercase font-bold">Por: {i.authorName}</p>
            </div>

            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={()=>addValueToTarget('investment', i.id, prompt('Valor do Aporte (R$):'))} className="flex items-center justify-center gap-1 text-xs bg-green-50 text-green-700 py-2.5 rounded-lg font-bold border border-green-200">
                  <TrendingUp size={14}/> Aportar
                </button>
                <button onClick={()=>setWithdrawModal({show:true, type:'investment', id:i.id, name:i.name})} className="flex items-center justify-center gap-1 text-xs bg-blue-50 text-blue-700 py-2.5 rounded-lg font-bold border border-blue-200">
                  <DollarSign size={14}/> Resgatar
                </button>
              </div>
              <button onClick={()=>deleteInvestment(i.id)} className="w-full flex items-center justify-center gap-1 text-xs text-red-400 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors">
                <XCircle size={14}/> Encerrar Posição
              </button>
            </div>
          </div>
        ))}
        
        {investments.length === 0 && (
          <div className="col-span-1 md:col-span-3 py-16 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl">
            <Briefcase size={64} className="mb-4 opacity-20"/>
            <p className="text-lg font-medium text-gray-400">Carteira vazia.</p>
          </div>
        )}
      </div>
    </div>
  );
}