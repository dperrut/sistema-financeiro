import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Plus, Trash2, LogOut, Users, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Calendar, AlertTriangle, PieChart as PieIcon, Filter, Edit, XCircle, Calculator, Tag } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Login e Recuperação
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Dados do Sistema
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  // --- Filtros ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chartFilter, setChartFilter] = useState('todos');
  const [editingId, setEditingId] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState({ show: false, goalId: null, goalName: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });

  // Formulários
  const [userManagementForm, setUserManagementForm] = useState({ username: '', name: '', email: '' });
  const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [incomeForm, setIncomeForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '' });
  
  const [expenseForm, setExpenseForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    description: '', 
    amount: '', 
    category: '', 
    paymentMethod: 'Cartão de Crédito', 
    installments: '1' 
  });

  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '' });
  const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#84CC16', '#14B8A6'];

  useEffect(() => { initializeSystem(); }, []);

  const initializeSystem = () => {
    try {
      const usersResult = localStorage.getItem('system_users');
      if (usersResult) setUsers(JSON.parse(usersResult));
      else {
        const defaultUsers = [{ username: 'dperrut', password: 'admin1234', name: 'Diego (Admin)', email: 'diego@exemplo.com', isAdmin: true, createdAt: new Date().toISOString() }];
        localStorage.setItem('system_users', JSON.stringify(defaultUsers));
        setUsers(defaultUsers);
      }
      const savedTrans = localStorage.getItem('system_transactions');
      const savedGoals = localStorage.getItem('system_goals');
      if (savedTrans) setTransactions(JSON.parse(savedTrans));
      if (savedGoals) setGoals(JSON.parse(savedGoals));

      const savedCats = localStorage.getItem('system_categories');
      if (savedCats) {
        const parsedCats = JSON.parse(savedCats);
        setCategories(parsedCats);
        setExpenseForm(prev => ({ ...prev, category: parsedCats[0] || 'Outros' }));
      } else {
        const defaultCats = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'];
        localStorage.setItem('system_categories', JSON.stringify(defaultCats));
        setCategories(defaultCats);
        setExpenseForm(prev => ({ ...prev, category: defaultCats[0] }));
      }
    } catch (error) { console.error("Erro init:", error); }
  };

  const handleLogin = (e) => { e.preventDefault(); const user = users.find((u) => u.username === loginForm.username && u.password === loginForm.password); if (user) setCurrentUser(user); else alert('Erro login'); };
  const handleLogout = () => { setCurrentUser(null); setLoginForm({ username: '', password: '' }); setActiveTab('dashboard'); };
  
  const factoryReset = () => { if (window.confirm("Apagar TUDO?")) { localStorage.clear(); window.location.reload(); } };

  const addCategory = () => { if (!newCategory || categories.includes(newCategory)) return; const updated = [...categories, newCategory]; setCategories(updated); localStorage.setItem('system_categories', JSON.stringify(updated)); setNewCategory(''); };
  const removeCategory = (cat) => { if (window.confirm(`Excluir ${cat}?`)) { const updated = categories.filter(c => c !== cat); setCategories(updated); localStorage.setItem('system_categories', JSON.stringify(updated)); if (expenseForm.category === cat) setExpenseForm({...expenseForm, category: updated[0] || ''}); } };

  const handlePrevMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); };
  const handleNextMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); };
  const formatMonthYear = (date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const filteredTransactions = safeTransactions.filter(t => {
    if (!t.date) return false;
    const [y, m] = t.date.split('-');
    return (parseInt(m) - 1) === currentDate.getMonth() && parseInt(y) === currentDate.getFullYear();
  });

  const monthlyIncome = filteredTransactions.filter(t => t.type === 'receita').reduce((acc, curr) => acc + Number(curr.value), 0);
  const monthlyExpense = filteredTransactions.filter(t => t.type === 'despesa').reduce((acc, curr) => acc + Number(curr.value), 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;
  const accumulatedBalance = safeTransactions.filter(t => t.type === 'receita').reduce((a,c)=>a+Number(c.value),0) - safeTransactions.filter(t => t.type === 'despesa').reduce((a,c)=>a+Number(c.value),0);

  const blockWheel = (e) => e.target.blur();

  const startEditing = (t) => {
    setEditingId(t.id);
    if (t.type === 'receita') setIncomeForm({ date: t.date, description: t.description, amount: t.value.toFixed(2) });
    else setExpenseForm({ date: t.date, description: t.description, amount: t.value.toFixed(2), category: t.category, paymentMethod: t.paymentMethod || 'PIX', installments: '1' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditing = () => {
    setEditingId(null);
    setIncomeForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '' });
    setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: categories[0] || 'Outros', paymentMethod: 'Cartão de Crédito', installments: '1' });
  };

  const addTransaction = (type) => {
    const form = type === 'income' ? incomeForm : expenseForm;
    if (!form.description || !form.amount) return alert('Preencha!');
    const val = parseFloat(form.amount.toString().replace(',', '.'));
    if (isNaN(val)) return alert("Valor inválido");

    // Edição
    if (editingId) {
       const updated = safeTransactions.map(t => t.id === editingId ? { ...t, ...form, value: val } : t);
       setTransactions(updated); localStorage.setItem('system_transactions', JSON.stringify(updated));
       cancelEditing();
       alert("Atualizado!");
       return;
    }

    // Parcelamento
    const isExpense = type === 'expense' || type === 'despesa';
    if (isExpense && form.installments && parseInt(form.installments) > 1) {
        const total = parseInt(form.installments);
        const parcVal = val / total;
        const newTrans = [];
        const [y, m, d] = form.date.split('-').map(Number);
        
        for (let i = 0; i < total; i++) {
            const dt = new Date(y, (m - 1) + i, d);
            const dateStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
            newTrans.push({
                id: Date.now() + i,
                ...form,
                type: 'despesa',
                description: `${form.description} (${i+1}/${total})`,
                amount: parcVal.toFixed(2),
                value: parcVal,
                date: dateStr,
                createdBy: currentUser.name
            });
        }
        const updated = [...safeTransactions, ...newTrans];
        setTransactions(updated); localStorage.setItem('system_transactions', JSON.stringify(updated));
        setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: categories[0] || 'Outros', paymentMethod: 'Cartão de Crédito', installments: '1' });
        alert(`${total} parcelas de R$ ${parcVal.toFixed(2)} criadas!`);
    } else {
       // Normal
       const newItem = { id: Date.now(), ...form, type: type === 'income' ? 'receita' : 'despesa', value: val, createdBy: currentUser.name };
       const updated = [...safeTransactions, newItem];
       setTransactions(updated); localStorage.setItem('system_transactions', JSON.stringify(updated));
       if (type === 'income') setIncomeForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '' });
       else setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: categories[0] || 'Outros', paymentMethod: 'Cartão de Crédito', installments: '1' });
       alert('Adicionado!');
    }
  };

  const removeTransaction = (id) => { if(window.confirm("Apagar?")) { const updated = safeTransactions.filter(t => t.id !== id); setTransactions(updated); localStorage.setItem('system_transactions', JSON.stringify(updated)); if (editingId === id) cancelEditing(); }};

  // Metas e Users
  const calculateSmartGoal = (targetAmount, currentAmount, targetDate) => {
    const today = new Date(); const target = new Date(targetDate);
    const remaining = Number(targetAmount) - (Number(currentAmount) || 0);
    let months = (target.getFullYear() - today.getFullYear()) * 12; months -= today.getMonth(); months += target.getMonth();
    if (remaining <= 0) return { status: 'concluido', text: 'Meta atingida!', monthly: 0 };
    if (months <= 0) return { status: 'atrasado', text: 'Prazo vencido!', monthly: remaining };
    const monthly = remaining / months;
    return { status: 'pendente', months, monthly, text: `Faltam ${months} meses` };
  };
  const addGoal = () => { if (!goalForm.name || !goalForm.targetAmount) return; const updated = [...goals, { id: Date.now(), ...goalForm, currentAmount: 0, createdBy: currentUser.name }]; setGoals(updated); localStorage.setItem('system_goals', JSON.stringify(updated)); setGoalForm({ name: '', targetAmount: '', targetDate: '', description: '' }); };
  const deleteGoal = (id) => { if(window.confirm("Apagar?")) { const updated = goals.filter(g => g.id !== id); setGoals(updated); localStorage.setItem('system_goals', JSON.stringify(updated)); }};
  const addValueToGoal = (id, vStr) => { const val = parseFloat(vStr); if (!val) return; const updatedG = goals.map(g => g.id === id ? { ...g, currentAmount: (g.currentAmount || 0) + val } : g); const goal = goals.find(g => g.id === id); const t = { id: Date.now(), type: 'despesa', description: `Invest: ${goal.name}`, amount: vStr, value: val, category: 'Investimento/Meta', date: new Date().toISOString().split('T')[0], createdBy: currentUser.name }; setGoals(updatedG); setTransactions([...safeTransactions, t]); localStorage.setItem('system_goals', JSON.stringify(updatedG)); localStorage.setItem('system_transactions', JSON.stringify([...safeTransactions, t])); alert("Investido!"); };
  const confirmWithdraw = (e) => { e.preventDefault(); const val = parseFloat(withdrawForm.amount); const updatedG = goals.map(g => g.id === withdrawModal.goalId ? { ...g, currentAmount: g.currentAmount - val } : g); const t = { id: Date.now(), type: 'receita', description: `Resgate: ${withdrawModal.goalName}`, amount: withdrawForm.amount, value: val, category: 'Resgate Meta', date: new Date().toISOString().split('T')[0], createdBy: currentUser.name }; setGoals(updatedG); setTransactions([...safeTransactions, t]); localStorage.setItem('system_goals', JSON.stringify(updatedG)); localStorage.setItem('system_transactions', JSON.stringify([...safeTransactions, t])); setWithdrawModal({ show: false, goalId: null, goalName: '' }); };
  const createUser = () => { if (!userManagementForm.username) return; const updated = [...users, { ...userManagementForm, password: '123', isAdmin: false }]; setUsers(updated); localStorage.setItem('system_users', JSON.stringify(updated)); alert('Criado!'); };
  const deleteUser = (u) => { if (window.confirm('Excluir?')) { const updated = users.filter(user => user.username !== u); setUsers(updated); localStorage.setItem('system_users', JSON.stringify(updated)); }};
  const changePassword = () => { if (currentUser.password !== changePasswordForm.currentPassword) return alert('Senha errada'); const updated = users.map(u => u.username === currentUser.username ? { ...u, password: changePasswordForm.newPassword } : u); setUsers(updated); localStorage.setItem('system_users', JSON.stringify(updated)); setCurrentUser({...currentUser, password: changePasswordForm.newPassword}); alert('Senha alterada'); };

  const renderSummaryCards = () => (
    <div className="space-y-6 mb-6">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 rounded-xl shadow-lg text-white flex justify-between items-center transform hover:scale-[1.01] transition-transform">
        <div><p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Saldo Total Acumulado (Caixa)</p><h2 className="text-3xl font-bold">R$ {accumulatedBalance.toFixed(2)}</h2></div>
        <div className="bg-white bg-opacity-20 p-3 rounded-full"><DollarSign size={32} className="text-white" /></div>
      </div>
      <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide">Desempenho de {formatMonthYear(currentDate)}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center"><div><p className="text-gray-500 text-xs uppercase">Entrou</p><p className="text-xl font-bold text-green-600">R$ {monthlyIncome.toFixed(2)}</p></div><TrendingUp className="text-green-500 opacity-50" size={24} /></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex justify-between items-center"><div><p className="text-gray-500 text-xs uppercase">Saiu</p><p className="text-xl font-bold text-red-600">R$ {monthlyExpense.toFixed(2)}</p></div><TrendingDown className="text-red-500 opacity-50" size={24} /></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center"><div><p className="text-gray-500 text-xs uppercase">Balanço</p><p className={`text-xl font-bold ${monthlyBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {monthlyBalance.toFixed(2)}</p></div><Calendar className="text-blue-500 opacity-50" size={24} /></div>
      </div>
    </div>
  );

  const renderExpenseChart = () => {
    const expenses = filteredTransactions.filter(t => t.type === 'despesa' && (chartFilter === 'todos' || t.createdBy === chartFilter));
    if(!expenses.length) return <div className="text-center text-gray-400 py-10">Sem despesas.</div>;
    const totals = expenses.reduce((acc,curr) => { acc[curr.category] = (acc[curr.category]||0)+curr.value; return acc; }, {});
    const total = Object.values(totals).reduce((a,b)=>a+b,0);
    const data = Object.keys(totals).map((k,i) => ({name:k, value:totals[k], percent: total > 0 ? (totals[k]/total)*100 : 0, color: COLORS[i%COLORS.length]})).sort((a,b)=>b.value-a.value);
    let deg = 0; const grad = data.map(i => { const s=deg; const e=deg+(i.percent*3.6); deg=e; return `${i.color} ${s}deg ${e}deg`; }).join(', ');
    return (
      <div className="flex flex-col md:flex-row items-center justify-around">
        <div className="relative w-48 h-48 rounded-full shadow-lg mb-6 md:mb-0" style={{ background: `conic-gradient(${grad || '#eee 0deg 360deg'})` }}><div className="absolute inset-4 bg-white rounded-full flex items-center justify-center"><div className="text-center"><p className="text-xs text-gray-500">Total</p><p className="font-bold text-gray-800">R$ {total.toFixed(0)}</p></div></div></div>
        <div className="space-y-2 w-full md:w-auto">{data.map(i => (<div key={i.name} className="flex items-center justify-between min-w-[200px] text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{background:i.color}}></div><span>{i.name}</span></div><div className="font-bold">R$ {i.value.toFixed(2)} ({i.percent.toFixed(0)}%)</div></div>))}</div>
      </div>
    );
  };

  if (!currentUser) return <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4"><div className="bg-white p-8 rounded shadow w-full max-w-sm"><h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Login</h1><form onSubmit={handleLogin}><input className="w-full p-2 border rounded mb-4" placeholder="User" value={loginForm.username} onChange={e=>setLoginForm({...loginForm, username:e.target.value})}/><input className="w-full p-2 border rounded mb-6" type="password" placeholder="Pass" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})}/><button className="w-full bg-blue-600 text-white p-2 rounded">Entrar</button></form></div></div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-blue-900 text-white p-6 hidden md:flex flex-col"><h1 className="text-2xl font-bold mb-8">Finanças</h1><div className="flex-1 space-y-4"><button onClick={()=>setActiveTab('dashboard')} className="flex items-center gap-2 w-full p-3 rounded hover:bg-blue-800"><TrendingUp size={20}/> Dashboard</button><button onClick={()=>setActiveTab('transactions')} className="flex items-center gap-2 w-full p-3 rounded hover:bg-blue-800"><DollarSign size={20}/> Lançamentos</button><button onClick={()=>setActiveTab('goals')} className="flex items-center gap-2 w-full p-3 rounded hover:bg-blue-800"><Target size={20}/> Metas</button><button onClick={()=>setActiveTab('settings')} className="flex items-center gap-2 w-full p-3 rounded hover:bg-blue-800"><Lock size={20}/> Config</button></div><button onClick={handleLogout} className="flex items-center gap-2 text-red-300 mt-auto pt-4 border-t border-blue-800"><LogOut size={20}/> Sair</button></div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50"><button onClick={()=>setActiveTab('dashboard')} className="text-blue-600"><TrendingUp/></button><button onClick={()=>setActiveTab('transactions')}><DollarSign/></button><button onClick={()=>setActiveTab('goals')}><Target/></button><button onClick={()=>setActiveTab('settings')}><Lock/></button></div>
      <div className="flex-1 flex flex-col overflow-hidden mb-16 md:mb-0">
        <header className="bg-white shadow p-4 flex justify-between items-center z-10"><h2 className="text-xl font-bold hidden md:block">Finanças Pessoais</h2><div className="flex items-center gap-4 ml-auto"><span>{currentUser.name}</span><button onClick={handleLogout} className="md:hidden text-red-500"><LogOut/></button></div></header>
        {(activeTab === 'dashboard' || activeTab === 'transactions') && <div className="bg-blue-50 p-2 flex justify-center items-center shadow-inner"><button onClick={handlePrevMonth} className="p-1 bg-white rounded-full shadow text-blue-800"><ChevronLeft/></button><span className="mx-4 font-bold text-blue-900 capitalize">{formatMonthYear(currentDate)}</span><button onClick={handleNextMonth} className="p-1 bg-white rounded-full shadow text-blue-800"><ChevronRight/></button></div>}
        <div className="flex-1 overflow-auto p-4 md:p-8">
           {activeTab === 'dashboard' && <div className="space-y-6">{renderSummaryCards()}<div className="bg-white p-6 rounded shadow">{renderExpenseChart()}</div></div>}
           {activeTab === 'transactions' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div className="hidden md:block">{renderSummaryCards()}</div>
                 <div className="bg-white p-4 rounded shadow border-l-4 border-green-500"><h3 className="font-bold text-green-700 mb-2">Receita</h3><input className="w-full mb-2 p-2 border rounded" placeholder="Descrição" value={incomeForm.description} onChange={e=>setIncomeForm({...incomeForm, description:e.target.value})}/><input className="w-full mb-2 p-2 border rounded" type="number" placeholder="Valor" value={incomeForm.amount} onChange={e=>setIncomeForm({...incomeForm, amount:e.target.value})}/><input className="w-full mb-2 p-2 border rounded" type="date" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm, date:e.target.value})}/><button onClick={()=>addTransaction('income')} className="w-full bg-green-600 text-white p-2 rounded">Salvar</button></div>
                 
                 <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
                    <h3 className="font-bold text-red-700 mb-2">Despesa</h3>
                    <input className="w-full mb-2 p-2 border rounded" placeholder="Descrição" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description:e.target.value})}/>
                    <div className="flex gap-2 mb-2">
                       <input className="w-2/3 p-2 border rounded font-bold" type="number" placeholder="Valor Total" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount:e.target.value})}/>
                       <div className="w-1/3 relative"><input type="number" min="1" max="60" className="w-full p-2 border rounded text-center text-blue-600 font-bold" value={expenseForm.installments} onChange={e=>setExpenseForm({...expenseForm, installments:e.target.value})}/><span className="absolute right-2 top-2 text-xs text-gray-400 font-bold pointer-events-none">x</span></div>
                    </div>
                    <select className="w-full mb-2 p-2 border rounded bg-white" value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category:e.target.value})}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>
                    <select className="w-full mb-2 p-2 border rounded bg-white" value={expenseForm.paymentMethod} onChange={e=>setExpenseForm({...expenseForm, paymentMethod:e.target.value})}><option>Cartão de Crédito</option><option>PIX</option><option>Dinheiro</option><option>Compra Parcelada</option></select>
                    <button onClick={()=>addTransaction('expense')} className="w-full bg-red-600 text-white p-2 rounded">Salvar Despesa</button>
                 </div>
               </div>
               
               {/* LISTA RESTAURADA E MELHORADA AQUI */}
               <div className="bg-white p-4 rounded shadow h-fit max-h-[600px] overflow-y-auto">
                  <h3 className="font-bold mb-4 flex justify-between">
                    Extrato
                    <span className="text-xs font-normal bg-gray-100 p-1 rounded text-gray-500">{formatMonthYear(currentDate)}</span>
                  </h3>
                  {filteredTransactions.slice().reverse().map(t => (
                     <div key={t.id} className={`flex justify-between items-center border-b p-3 ${editingId === t.id ? 'bg-orange-50' : ''}`}>
                        <div className="overflow-hidden">
                           <p className="font-bold truncate pr-2">
                              {t.description} {editingId === t.id && <span className="text-orange-500 text-xs">(Editando)</span>}
                           </p>
                           {/* TEXTO ESCURECIDO E NOME DO USUÁRIO RESTAURADO */}
                           <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                              {t.date.split('-').reverse().join('/')} • {t.category || 'Geral'} • <span className="font-semibold">{t.createdBy || 'Sistema'}</span>
                           </p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`font-bold ${t.type==='receita'?'text-green-600':'text-red-600'}`}>
                             {t.type==='receita'?'+':'-'} R$ {Number(t.value).toFixed(2)}
                           </span>
                           {/* BOTÃO EDITAR VOLTOU! */}
                           <button onClick={()=>startEditing(t)} className="text-blue-500 hover:text-blue-700" title="Editar"><Edit size={16}/></button>
                           <button onClick={()=>removeTransaction(t.id)} className="text-gray-300 hover:text-red-500" title="Excluir"><Trash2 size={16}/></button>
                        </div>
                     </div>
                  ))}
                  {filteredTransactions.length === 0 && <p className="text-center text-gray-400 py-4">Sem lançamentos.</p>}
               </div>
             </div>
           )}
           {activeTab === 'goals' && (
             <div className="space-y-6">
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-bold mb-2">Nova Meta</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <input className="border p-2 rounded" placeholder="Nome" value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name:e.target.value})}/>
                      <input className="border p-2 rounded" placeholder="Valor Alvo" type="number" value={goalForm.targetAmount} onChange={e=>setGoalForm({...goalForm, targetAmount:e.target.value})}/>
                      <input className="border p-2 rounded" type="date" value={goalForm.targetDate} onChange={e=>setGoalForm({...goalForm, targetDate:e.target.value})}/>
                      <button onClick={addGoal} className="bg-purple-600 text-white rounded font-bold">Criar</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {goals.map(g => {
                      const info = calculateSmartGoal(g.targetAmount, g.currentAmount, g.targetDate);
                      return (
                        <div key={g.id} className="bg-white p-4 rounded shadow border border-purple-100 relative">
                           <button onClick={()=>deleteGoal(g.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                           <h4 className="font-bold">{g.name}</h4>
                           <p className="text-xs text-gray-600 mb-2">{info.text}</p>
                           <p className="text-xl font-bold text-purple-700">R$ {(g.currentAmount||0).toFixed(2)} <span className="text-xs text-gray-400">/ {g.targetAmount}</span></p>
                           <div className="w-full bg-gray-200 h-1 mt-2 mb-4 rounded"><div className="bg-purple-600 h-1 rounded" style={{width: `${Math.min(100, ((g.currentAmount||0)/g.targetAmount)*100)}%`}}></div></div>
                           <div className="flex gap-2">
                              <button onClick={()=>{const v=prompt('Valor:'); addValueToGoal(g.id, v)}} className="flex-1 bg-green-100 text-green-700 text-xs py-1 rounded">Investir</button>
                              <button onClick={()=>{setWithdrawModal({show:true, goalId:g.id, goalName:g.name})}} className="flex-1 bg-red-100 text-red-700 text-xs py-1 rounded">Resgatar</button>
                           </div>
                        </div>
                      )
                    })}
                </div>
             </div>
           )}
           {activeTab === 'settings' && (
              <div className="max-w-xl mx-auto space-y-6">
                 <div className="bg-white p-6 rounded shadow">
                    <h3 className="font-bold mb-4">Categorias</h3>
                    <div className="flex gap-2 mb-4"><input className="flex-1 border p-2 rounded" placeholder="Nova Categoria" value={newCategory} onChange={e=>setNewCategory(e.target.value)}/><button onClick={addCategory} className="bg-blue-600 text-white px-4 rounded">Add</button></div>
                    <div className="flex flex-wrap gap-2">{categories.map(c=><span key={c} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">{c}<button onClick={()=>removeCategory(c)} className="text-red-400 font-bold">×</button></span>)}</div>
                 </div>
                 {currentUser.isAdmin && <div className="bg-white p-6 rounded shadow"><h3 className="font-bold mb-4">Novo Usuário</h3><input className="w-full border p-2 mb-2 rounded" placeholder="Nome" value={userManagementForm.name} onChange={e=>setUserManagementForm({...userManagementForm, name:e.target.value})}/><input className="w-full border p-2 mb-2 rounded" placeholder="Login" value={userManagementForm.username} onChange={e=>setUserManagementForm({...userManagementForm, username:e.target.value})}/><button onClick={createUser} className="bg-green-600 text-white w-full p-2 rounded">Criar</button></div>}
              </div>
           )}
           {activeTab === 'admin' && currentUser.isAdmin && <div className="bg-white p-6 rounded shadow"><h3 className="font-bold mb-4">Usuários</h3>{users.map(u=><div key={u.username} className="flex justify-between border-b p-2"><span>{u.name} ({u.username})</span>{u.username!=='dperrut' && <button onClick={()=>deleteUser(u.username)} className="text-red-500"><Trash2 size={16}/></button>}</div>)}</div>}
        </div>
      </div>
    </div>
  );
}