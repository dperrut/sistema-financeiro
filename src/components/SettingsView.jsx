// --- COMPONENTE: TELA DE CONFIGURAÇÕES (VERSÃO COMPACTA) ---
import React, { useState, useEffect } from 'react';
import { Users, Eye, Edit, LogIn, List, XCircle, Upload, AlertTriangle, Trash2, CreditCard, Calendar, Plus } from 'lucide-react';
import { ref, update, push, remove, onValue } from 'firebase/database';
import { db } from '../firebase';

export default function SettingsView({ 
  currentUser, familyPin, handleEditPin, 
  joinFamilyForm, setJoinFamilyForm, handleJoinFamily,
  newIncomeCat, setNewIncomeCat, handleAddCategory, incomeCategories, handleRemoveCategory,
  newExpenseCat, setNewExpenseCat, expenseCategories,
  importDataToFirebase, resetAllData, handleExportData
}) {

  // Cores disponíveis para os cartões (Tailwind classes)
  const CARD_COLORS = [
    "from-purple-600 to-indigo-600",   // Roxo (Nubank)
    "from-gray-800 to-black",          // Preto (Black/Carbon)
    "from-orange-500 to-red-500",      // Laranja (Inter)
    "from-blue-600 to-cyan-500",       // Azul (Caixa/Visa)
    "from-emerald-500 to-teal-600",    // Verde (Stone/Next)
    "from-red-600 to-rose-700",        // Vermelho (Santander)
    "from-yellow-500 to-amber-600",    // Dourado (Gold)
    "from-pink-500 to-rose-500"        // Rosa
  ];

// --- LÓGICA DE CARTÕES DE CRÉDITO (NOVO) ---
  const [creditCards, setCreditCards] = useState([]);
  // --- LÓGICA ATUALIZADA ---
  // --- LÓGICA ATUALIZADA ---
  const [newCard, setNewCard] = useState({ name: '', closingDay: '', dueDay: '', last4: '', holder: '' });
  const [editingCardId, setEditingCardId] = useState(null); // NOVO: Controla qual cartão está sendo editado

  // Função Unificada: Criar ou Editar
  const handleSaveCard = async () => {
    if (!newCard.name || !newCard.closingDay || !newCard.dueDay) return alert("Preencha os dados principais.");
    
    const close = parseInt(newCard.closingDay);
    const due = parseInt(newCard.dueDay);
    
    if (newCard.last4 && newCard.last4.length !== 4) return alert("Digite exatamente os 4 últimos dígitos.");
    if (close < 1 || close > 31 || due < 1 || due > 31) return alert("Dias inválidos.");

    try {
      if (editingCardId) {
        // MODO EDIÇÃO: Atualiza o existente
        await update(ref(db, `families/${currentUser.familyId}/creditCards/${editingCardId}`), { 
            name: newCard.name, 
            holder: newCard.holder || currentUser.name.split(' ')[0].toUpperCase(),
            closingDay: close, 
            dueDay: due,
            last4: newCard.last4 || '0000'
            // Nota: Não atualizamos a cor aqui para não resetar a preferência do usuário
        });
        setEditingCardId(null); // Sai do modo edição
        alert("Cartão atualizado com sucesso!");
      } else {
        // MODO CRIAÇÃO: Cria um novo
        const newCardRef = push(ref(db, `families/${currentUser.familyId}/creditCards`));
        await update(newCardRef, { 
            name: newCard.name, 
            holder: newCard.holder || currentUser.name.split(' ')[0].toUpperCase(), 
            closingDay: close, 
            dueDay: due,
            last4: newCard.last4 || '0000',
            color: CARD_COLORS[0] 
        });
      }
      // Limpa o formulário
      setNewCard({ name: '', closingDay: '', dueDay: '', last4: '', holder: '' });
    } catch (error) { console.error(error); alert("Erro ao salvar cartão."); }
  };

  // Função para preencher o formulário com os dados do cartão clicado
  const startEditingCard = (card) => {
    setNewCard({ 
        name: card.name, 
        closingDay: card.closingDay, 
        dueDay: card.dueDay, 
        last4: card.last4, 
        holder: card.holder 
    });
    setEditingCardId(card.id);
  };

  const cancelEditing = () => {
    setNewCard({ name: '', closingDay: '', dueDay: '', last4: '', holder: '' });
    setEditingCardId(null);
  };

  // Carrega os cartões ao iniciar
  useEffect(() => {
    if (currentUser?.familyId) {
      const cardsRef = ref(db, `families/${currentUser.familyId}/creditCards`);
      const unsubscribe = onValue(cardsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const cardsList = Object.entries(data).map(([key, val]) => ({ id: key, ...val }));
          setCreditCards(cardsList);
        } else {
          setCreditCards([]);
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleAddCard = async () => {
    if (!newCard.name || !newCard.closingDay || !newCard.dueDay) return alert("Preencha os dados principais.");
    
    const close = parseInt(newCard.closingDay);
    const due = parseInt(newCard.dueDay);
    
    if (newCard.last4 && newCard.last4.length !== 4) return alert("Digite exatamente os 4 últimos dígitos.");
    if (close < 1 || close > 31 || due < 1 || due > 31) return alert("Dias inválidos.");

    try {
      const newCardRef = push(ref(db, `families/${currentUser.familyId}/creditCards`));
      await update(newCardRef, { 
        name: newCard.name, 
        holder: newCard.holder || currentUser.name.split(' ')[0].toUpperCase(), // Usa o nome do usuário se não preencher
        closingDay: close, 
        dueDay: due,
        last4: newCard.last4 || '0000',
        color: CARD_COLORS[0] 
      });
      setNewCard({ name: '', closingDay: '', dueDay: '', last4: '', holder: '' });
    } catch (error) { console.error(error); alert("Erro ao salvar cartão."); }
  };

  const handleDeleteCard = async (id) => {
    if (window.confirm("Excluir este cartão?")) {
      await remove(ref(db, `families/${currentUser.familyId}/creditCards/${id}`));
    }
  };  

  const handleCycleColor = async (card) => {
    // 1. Descobre o índice da cor atual
    const currentIndex = CARD_COLORS.indexOf(card.color || CARD_COLORS[0]);
    
    // 2. Pega a próxima cor (se for a última, volta pra primeira)
    const nextIndex = (currentIndex + 1) % CARD_COLORS.length;
    const nextColor = CARD_COLORS[nextIndex];

    // 3. Atualiza no banco
    await update(ref(db, `families/${currentUser.familyId}/creditCards/${card.id}`), {
      color: nextColor
    });
  };

  return (
    // REDUZIDO: space-y-4 -> space-y-3 e pb-10 -> pb-4
    <div className="max-w-6xl mx-auto space-y-3 pb-4">
      
      {/* 1. SEÇÃO DE GESTÃO DE FAMÍLIA */}
      {/* REDUZIDO: gap-4 -> gap-3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* CARD: SUA FAMÍLIA ATUAL */}
        {/* REDUZIDO: p-4 -> p-3 */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-indigo-50 dark:border-indigo-900/30 flex flex-col justify-between transition-colors duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-300"><Users size={20}/></div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Sua Família</h3>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Dados de Acesso</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-600/50 flex-1">
              <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">ID Familiar</p>
              <p className="text-xs font-mono font-bold text-gray-700 dark:text-gray-200 select-all truncate">{currentUser.familyId}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-600/50 w-24 text-center">
              <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">PIN</p>
              <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={() => alert(`Seu PIN: ${familyPin}`)}>
                <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-200">****</span>
                <Eye size={12} className="text-gray-300 dark:text-gray-500"/>
                <button onClick={(e) => {e.stopPropagation(); handleEditPin();}} className="text-blue-500 ml-1"><Edit size={12}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* CARD: CONECTAR A OUTRA FAMÍLIA */}
        {/* REDUZIDO: p-4 -> p-3 */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between transition-colors duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-50 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-300"><LogIn size={20}/></div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Trocar de Família</h3>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <input 
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white text-xs outline-none transition-colors" 
                placeholder="ID da Família..." 
                value={joinFamilyForm.familyId} 
                onChange={e => setJoinFamilyForm({...joinFamilyForm, familyId: e.target.value})}
              />
            </div>
            <div className="w-16">
              <input 
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white text-xs text-center outline-none transition-colors" 
                placeholder="PIN" 
                maxLength={6} 
                value={joinFamilyForm.pin} 
                onChange={e => setJoinFamilyForm({...joinFamilyForm, pin: e.target.value})}
              />
            </div>
            <button onClick={handleJoinFamily} className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 dark:hover:bg-blue-600 text-xs transition-colors">Entrar</button>
          </div>
        </div>
      </div>

      {/* 1.5. GESTÃO DE CARTÕES DE CRÉDITO (VISUAL PREMIUM) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2 text-sm">
          <CreditCard size={18} className="text-purple-500"/> Meus Cartões
        </h3>
        
        {/* CARROSSEL DE CARTÕES (COMPACTO & COM TITULAR) */}
        <div className="flex overflow-x-auto gap-3 mb-6 pb-2 snap-x snap-mandatory px-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          
          {creditCards.map((card) => {
            const bgClass = card.color || CARD_COLORS[0]; 

            return (
              // REDUZI: min-w-[300px] -> 280px | h-48 -> h-40 | p-5 -> p-4
              <div key={card.id} className={`relative min-w-[280px] h-40 rounded-xl p-4 shadow-md text-white bg-gradient-to-br ${bgClass} flex flex-col justify-between transform transition-transform hover:scale-[1.01] snap-center group`}>
                
                {/* Topo: Nome do Banco e Ações */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-bold tracking-wider opacity-90 text-sm truncate w-36" title={card.name}>{card.name}</span>
                    {/* Exibe o TITULAR aqui ou embaixo */}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleCycleColor(card)} className="bg-white/20 p-1.5 rounded-full hover:bg-white/40 transition-colors" title="Mudar Cor">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-yellow-400 via-red-400 to-blue-400"></div>
                    </button>
                    {/* BOTÃO EDITAR ADICIONADO */}
                    <button onClick={() => startEditingCard(card)} className="bg-white/20 p-1.5 rounded-full hover:bg-blue-500/80 transition-colors" title="Editar Dados">
                      <Edit size={14} className="text-white"/>
                    </button>
                    <button onClick={() => handleDeleteCard(card.id)} className="bg-white/20 p-1.5 rounded-full hover:bg-red-500/80 transition-colors" title="Excluir">
                      <Trash2 size={14} className="text-white"/>
                    </button>
                  </div>
                </div>

                {/* Meio: Chip e Número */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 bg-yellow-400/80 rounded flex items-center justify-center border border-yellow-600/50 shadow-inner relative overflow-hidden">
                    <div className="w-full h-[1px] bg-yellow-600/50 absolute top-1/2 -translate-y-1/2"></div>
                    <div className="h-full w-[1px] bg-yellow-600/50 absolute left-1/2 -translate-x-1/2"></div>
                  </div>
                  {/* Ícone NFC */}
                  <div className="flex flex-col gap-0.5 items-start opacity-60">
                     <span className="w-2 h-2 rounded-full border-r-2 border-white/80"></span>
                     <span className="w-1.5 h-1.5 rounded-full border-r-2 border-white/80 -mt-1.5 ml-0.5"></span>
                  </div>
                  {/* Número */}
                  <div className="font-mono text-lg tracking-[0.15em] text-white/90 ml-auto">
                    •••• {card.last4 || '0000'}
                  </div>
                </div>

                {/* Base: Titular e Datas */}
                <div className="flex justify-between items-end text-[9px] uppercase font-bold text-white/80">
                  <div className="flex flex-col">
                    <span className="text-[7px] opacity-60 mb-0.5">Titular</span>
                    <span className="text-xs tracking-widest truncate max-w-[120px]">{card.holder || 'MEMBRO'}</span>
                  </div>
                  <div className="flex gap-3 text-right">
                    <div>
                      <span className="block text-[6px] opacity-60">Fecha</span>
                      <span className="text-xs">{card.closingDay}</span>
                    </div>
                    <div>
                      <span className="block text-[6px] opacity-60">Vence</span>
                      <span className="text-xs">{card.dueDay}</span>
                    </div>
                  </div>
                </div>
                
                {/* Brilho Decorativo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              </div>
            );
          })}
          
          {/* Placeholder Compacto */}
          {creditCards.length === 0 && (
            <div className="min-w-[280px] h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 text-sm flex-col gap-2 snap-center">
              <CreditCard size={32} className="opacity-30"/>
              <p className="text-xs opacity-70">Sua carteira está vazia.</p>
            </div>
          )}
        </div>

        {/* Formulário Novo Cartão (Layout Otimizado v3) */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase">Adicionar Novo Cartão</p>
          <div className="flex flex-col gap-2">
            
            {/* Linha 1: Titular e Final do Cartão */}
            <div className="flex gap-2">
              <div className="flex-[3]">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Nome do Titular</label>
                <input 
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-xs outline-none focus:border-purple-400 transition-colors uppercase" 
                  placeholder="Ex: JOAO SILVA" 
                  value={newCard.holder} 
                  onChange={e => setNewCard({...newCard, holder: e.target.value})} 
                />
              </div>
              <div className="flex-1 min-w-[80px]">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Últimos 4</label>
                <input 
                  type="text" 
                  maxLength="4" 
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-xs text-center outline-none focus:border-purple-400 transition-colors font-mono" 
                  placeholder="1234" 
                  value={newCard.last4} 
                  onChange={e => setNewCard({...newCard, last4: e.target.value.replace(/\D/g,'')})} 
                />
              </div>
            </div>

            {/* Linha 2: Nome do Cartão, Datas e Botão */}
            <div className="flex gap-2 items-end">
              <div className="flex-[2]">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Nome do Cartão</label>
                <input 
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-xs outline-none focus:border-purple-400 transition-colors" 
                  placeholder="Ex: Nubank" 
                  value={newCard.name} 
                  onChange={e => setNewCard({...newCard, name: e.target.value})} 
                />
              </div>
              
              <div className="w-20">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1 truncate" title="Data Fechamento">Fechamento</label>
                <select 
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-xs text-center outline-none focus:border-purple-400 transition-colors cursor-pointer"
                  value={newCard.closingDay} 
                  onChange={e => setNewCard({...newCard, closingDay: e.target.value})}
                >
                  <option value="">Dia</option>
                  {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="w-20">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1 truncate" title="Data Vencimento">Vencimento</label>
                <select 
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-xs text-center outline-none focus:border-purple-400 transition-colors cursor-pointer"
                  value={newCard.dueDay} 
                  onChange={e => setNewCard({...newCard, dueDay: e.target.value})}
                >
                  <option value="">Dia</option>
                  {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {editingCardId ? (
                // MODO EDIÇÃO: Botão de Salvar (Verde) e Cancelar (Cinza)
                <div className="flex gap-1">
                    <button 
                        onClick={cancelEditing} 
                        className="bg-gray-400 text-white h-[34px] w-[34px] rounded-lg flex items-center justify-center hover:bg-gray-500 transition-colors shadow-md active:scale-95 flex-shrink-0 mb-[1px]"
                        title="Cancelar Edição"
                    >
                        <XCircle size={20}/>
                    </button>
                    <button 
                        onClick={handleSaveCard} 
                        className="bg-green-600 text-white h-[34px] w-[34px] rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors shadow-md active:scale-95 flex-shrink-0 mb-[1px]"
                        title="Salvar Alterações"
                    >
                        <AlertTriangle size={18} className="rotate-180"/> {/* Ícone improvisado de check ou similar */}
                    </button>
                </div>
              ) : (
                // MODO CRIAÇÃO: Botão Normal (+)
                <button 
                    onClick={handleSaveCard} 
                    className="bg-purple-600 text-white h-[34px] w-[34px] rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors shadow-md active:scale-95 flex-shrink-0 mb-[1px]"
                    title="Adicionar Cartão"
                >
                    <Plus size={20}/>
                </button>
              )}
            </div>
          </div>
        </div>     
      </div>

      {/* 2. GESTÃO DE CATEGORIAS */}
      {/* REDUZIDO: p-5 -> p-3 */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2 text-sm">
          <List size={18} className="text-gray-500 dark:text-gray-400"/> Personalizar Categorias
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h4 className="font-bold text-green-700 dark:text-green-400 mb-2 text-[11px] uppercase tracking-widest">Receitas</h4>
            <div className="flex gap-2 mb-2">
              <input className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-gray-50 dark:bg-gray-700 dark:text-white outline-none transition-colors" placeholder="Nova..." value={newIncomeCat} onChange={e => setNewIncomeCat(e.target.value)} />
              <button onClick={() => handleAddCategory('income', newIncomeCat)} className="bg-green-600 dark:bg-green-700 text-white px-3 rounded-lg font-bold">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {incomeCategories.map(cat => (
                <span key={cat} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-[10px] font-bold border border-green-100 dark:border-green-800/30 flex items-center gap-1.5">
                  {cat}
                  <button onClick={() => handleRemoveCategory('income', cat)} className="text-green-300 hover:text-red-500"><XCircle size={10}/></button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 text-[11px] uppercase tracking-widest">Despesas</h4>
            <div className="flex gap-2 mb-2">
              <input className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-gray-50 dark:bg-gray-700 dark:text-white outline-none transition-colors" placeholder="Nova..." value={newExpenseCat} onChange={e => setNewExpenseCat(e.target.value)} />
              <button onClick={() => handleAddCategory('expense', newExpenseCat)} className="bg-red-600 dark:bg-red-700 text-white px-3 rounded-lg font-bold">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {expenseCategories.map(cat => (
                <span key={cat} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-[10px] font-bold border border-red-100 dark:border-red-800/30 flex items-center gap-1.5">
                  {cat}
                  <button onClick={() => handleRemoveCategory('expense', cat)} className="text-red-300 hover:text-red-500"><XCircle size={10}/></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MANUTENÇÃO (BACKUP E SEGURANÇA) */}
      {/* REDUZIDO: gap-4 -> gap-3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-70 hover:opacity-100 transition-opacity">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 flex flex-col gap-2 transition-colors">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Backup de Segurança</h4>
            <span className="text-[9px] bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 dark:text-gray-300 font-bold">JSON</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportData} className="flex-1 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 px-3 py-2 rounded-lg font-bold text-[10px] border border-blue-100 dark:border-blue-900/30 shadow-sm hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
              <Upload size={14} className="rotate-180"/> Exportar
            </button>
            <label className="flex-1 bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-300 px-3 py-2 rounded-lg cursor-pointer font-bold text-[10px] border border-orange-100 dark:border-orange-900/30 shadow-sm hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
              <Upload size={14}/> Importar
              <input type="file" accept=".json" onChange={importDataToFirebase} className="hidden" />
            </label>
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-dashed border-red-200 dark:border-red-900/30 flex items-center justify-between transition-colors">
          <div>
            <h4 className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1"><AlertTriangle size={12}/> Zona Crítica</h4>
            <p className="text-[10px] text-red-400 dark:text-red-500/80 font-medium">Apagar tudo</p>
          </div>
          <button onClick={resetAllData} className="text-red-600 dark:text-red-400 font-bold text-[10px] bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-all shadow-sm">
            Resetar App
          </button>
        </div>
      </div>
    </div>
  );
}