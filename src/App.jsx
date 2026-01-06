import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Plus, Trash2, LogOut, Users, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Calendar, AlertTriangle, PieChart as PieIcon, Filter, Edit, XCircle, Calculator, Tag, Wallet, Key } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Login e Recuperação
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false); // ESTADO RESTAURADO

  // Dados do Sistema
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);
  
  // --- Categorias ---
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');

  // --- Filtros ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chartFilter, setChartFilter] = useState('todos');
  const [editingId, setEditingId] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState({ show: false, goalId: null, goalName: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });

  // Formulários
  const [userManagementForm, setUserManagementForm] = useState({ username: '', name: '', email: '' });
  const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [incomeForm, setIncomeForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: '' });
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: '', paymentMethod: 'Cartão de Crédito', installments: '1' });
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

      const savedExpCats = localStorage.getItem('system_categories');
      if (savedExpCats) {
        const parsed = JSON.parse(savedExpCats);
        setExpenseCategories(parsed);
        setExpenseForm(prev => ({ ...prev, category: parsed[0] || 'Outros' }));
      } else {
        const defaults = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'];
        localStorage.setItem('system_categories', JSON.stringify(defaults));
        setExpenseCategories(defaults);
        setExpenseForm(prev => ({ ...prev, category: defaults[0] }));
      }

      const savedIncCats = localStorage.getItem('system_income_categories');
      if (savedIncCats) {
        const parsed = JSON.parse(savedIncCats);
        setIncomeCategories(parsed);
        setIncomeForm(prev => ({ ...prev, category: parsed[0] || 'Salário' }));
      } else {
        const defaults = ['Salário', 'Extra', 'Investimento', 'Presente', 'Outros'];
        localStorage.setItem('system_income_categories', JSON.stringify(defaults));
        setIncomeCategories(defaults);
        setIncomeForm(prev => ({ ...prev, category: defaults[0] }));
      }
    } catch (error) { console.error("Erro init:", error); }
  };

  const handleLogin = (e) => { e.preventDefault(); const user = users.find((u) => u.username === loginForm.username && u.password === loginForm.password); if (user) setCurrentUser(user); else alert('Erro login'); };
  const handleLogout = () => { setCurrentUser(null); setLoginForm({ username: '', password: '' }); setActiveTab('dashboard'); };
  const factoryReset = () => { if (window.confirm("Apagar TUDO?")) { localStorage.clear(); window.location.reload(); } };

  // Categories
  const addExpenseCategory = () => { if (!newExpenseCat || expenseCategories.includes(newExpenseCat)) return; const updated = [...expenseCategories, newExpenseCat]; setExpenseCategories(updated); localStorage.setItem('system_categories', JSON.stringify(updated)); setNewExpenseCat(''); };
  const removeExpenseCategory = (cat) => { if (window.confirm(`Excluir ${cat}?`)) { const updated = expenseCategories.filter(c => c !== cat); setExpenseCategories(updated); localStorage.setItem('system_categories', JSON.stringify(updated)); if (expenseForm.category === cat) setExpenseForm({...expenseForm, category: updated[0] || ''}); } };
  const addIncomeCategory = () => { if (!newIncomeCat || incomeCategories.includes(newIncomeCat)) return; const updated = [...incomeCategories, newIncomeCat]; setIncomeCategories(updated); localStorage.setItem('system_income_categories', JSON.stringify(updated)); setNewIncomeCat(''); };
  const removeIncomeCategory = (cat) => { if (window.confirm(`Excluir ${cat}?`)) { const updated = incomeCategories.filter(c => c !== cat); setIncomeCategories(updated); localStorage.setItem('system_income_categories', JSON.stringify(updated)); if (incomeForm.category === cat) setIncomeForm({...incomeForm, category: updated[0] || ''}); } };

  // Filtros
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
    if (t.type === 'receita') {
        setIncomeForm({ date: t.date, description: t.description, amount: t.value.toFixed(2), category: t.category || incomeCategories[0] });
    } else {
        setExpenseForm({ date: t.date, description: t.description, amount: t.value.toFixed(2), category: t.category, paymentMethod: t.paymentMethod || 'PIX', installments: '1' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditing = () => {
    setEditingId(null);
    setIncomeForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: incomeCategories[0] || 'Salário' });
    setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: expenseCategories[0] || 'Outros', paymentMethod: 'Cartão de Crédito', installments: '1' });
  };

  const addTransaction = (type) => {
    const form = type === 'income' ? incomeForm : expenseForm;
    if (!form.description || !form.amount) return alert('Preencha!');
    const val = parseFloat(form.amount.toString().replace(',', '.'));
    if (isNaN(val)) return alert("Valor inválido");

    if (editingId) {
       const updated = safeTransactions.map(t => t.id === editingId ? { ...t, ...form, value: val } : t);
       setTransactions(updated); localStorage.setItem('system_transactions', JSON.stringify(updated));
       cancelEditing();
       alert("Atualizado!");
       return;
    }

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
                id: Date.now() + i, ...form, type: 'despesa', description: `${form.description} (${i+1}/${total})`, amount: parcVal.toFixed(2), value: parcVal, date: dateStr, createdBy: currentUser.name
            });
        }
        const updated = [...safeTransactions, ...newTrans];
        setTransactions(updated); localStorage.setItem('system_transactions', JSON.stringify(updated));
        setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: expenseCategories[0] || 'Outros', paymentMethod: 'Cartão de Crédito', installments: '1' });
        alert(`${total} parcelas de R$ ${parcVal.toFixed(2)} criadas!`);
    } else {
       const newItem = { id: Date.now(), ...form, type: type === 'income' ? 'receita' : 'despesa', value: val, createdBy: currentUser.name };
       const updated = [...safeTransactions, newItem];
       setTransactions(updated); localStorage.setItem('system_transactions', JSON.stringify(updated));
       if (type === 'income') setIncomeForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: incomeCategories[0] || 'Salário' });
       else setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: expenseCategories[0] || 'Outros', paymentMethod: 'Cartão de Crédito', installments: '1' });
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
    <div className="space-y-4 mb-4">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-4 rounded-xl shadow-lg text-white flex justify-between items-center transform hover:scale-[1.01] transition-transform">
        <div><p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Saldo Total Acumulado</p><h2 className="text-2xl font-bold">R$ {accumulatedBalance.toFixed(2)}</h2></div>
        <div className="bg-white bg-opacity-20 p-2 rounded-full"><DollarSign size={24} className="text-white" /></div>
      </div>
      <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wide">Desempenho de {formatMonthYear(currentDate)}</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-green-500 flex flex-col md:flex-row justify-between items-center"><div><p className="text-gray-500 text-[10px] uppercase">Entrou</p><p className="text-lg font-bold text-green-600">R$ {monthlyIncome.toFixed(2)}</p></div><TrendingUp className="text-green-500 opacity-50" size={20} /></div>
        <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-red-500 flex flex-col md:flex-row justify-between items-center"><div><p className="text-gray-500 text-[10px] uppercase">Saiu</p><p className="text-lg font-bold text-red-600">R$ {monthlyExpense.toFixed(2)}</p></div><TrendingDown className="text-red-500 opacity-50" size={20} /></div>
        <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-blue-500 flex flex-col md:flex-row justify-between items-center"><div><p className="text-gray-500 text-[10px] uppercase">Balanço</p><p className={`text-lg font-bold ${monthlyBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {monthlyBalance.toFixed(2)}</p></div><Calendar className="text-blue-500 opacity-50" size={20} /></div>
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
      <div className="flex flex-col md:flex-row items-center justify-around h-64 md:h-auto">
        <div className="relative w-40 h-40 rounded-full shadow-lg mb-4 md:mb-0" style={{ background: `conic-gradient(${grad || '#eee 0deg 360deg'})` }}><div className="absolute inset-3 bg-white rounded-full flex items-center justify-center"><div className="text-center"><p className="text-[10px] text-gray-500">Total</p><p className="font-bold text-sm text-gray-800">R$ {total.toFixed(0)}</p></div></div></div>
        <div className="space-y-1 w-full md:w-auto overflow-y-auto max-h-48">{data.map(i => (<div key={i.name} className="flex items-center justify-between min-w-[180px] text-xs"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:i.color}}></div><span>{i.name}</span></div><div className="flex gap-2"><span className="font-semibold">R$ {i.value.toFixed(2)}</span><span className="text-gray-400 text-[10px] w-6 text-right">{i.percent.toFixed(0)}%</span></div></div>))}</div>
      </div>
    );
  };

  // --- TELA LOGIN (NOVO DESIGN) ---
  if (!currentUser) {
    if (showForgotPassword) return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
          <h1 className="text-xl font-bold mb-4 text-gray-800">Recuperar Acesso</h1>
          <p className="text-sm text-gray-500 mb-6">Entre em contato com o administrador (Diego) para resetar sua senha.</p>
          <button onClick={()=>setShowForgotPassword(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-bold hover:bg-gray-300">Voltar</button>
        </div>
      </div>
    );
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm">
          <div className="flex justify-center mb-6"><div className="bg-blue-100 p-4 rounded-full"><DollarSign size={40} className="text-blue-600"/></div></div>
          <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">Bem-vindo</h1>
          <p className="text-center text-gray-500 mb-8 text-sm">Gerencie suas finanças com inteligência.</p>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Usuário</label>
                <input className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50" placeholder="ex: diego" value={loginForm.username} onChange={e=>setLoginForm({...loginForm, username:e.target.value})}/>
            </div>
            <div className="mb-6 relative">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Senha</label>
                <div className="relative">
                    <input className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50" type={showPassword ? "text" : "password"} placeholder="••••••" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})}/>
                    <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
                <div className="text-right mt-2"><button type="button" onClick={()=>setShowForgotPassword(true)} className="text-xs text-blue-500 hover:underline">Esqueci minha senha</button></div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transform hover:-translate-y-1 transition-all">Entrar no Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-blue-900 text-white p-6 hidden md:flex flex-col"><h1 className="text-2xl font-bold mb-8">Finanças</h1><div className="flex-1 space-y-4"><button onClick={()=>setActiveTab('dashboard')} className="flex items-center gap-2 w-full p-3 rounded hover:bg-blue-800"><TrendingUp size={20}/> Dashboard</button><button onClick={()=>setActiveTab('transactions')} className="flex items-center gap-2 w-full p-3 rounded hover:bg-blue-800"><DollarSign size={20}/> Lançamentos</button><button onClick={()=>setActiveTab('goals')} className="flex items-center gap-2 w-full p-3 rounded hover:bg-blue-800"><Target size={20}/> Metas</button><button onClick={()=>setActiveTab('settings')} className="flex items-center gap-2 w-full p-3 rounded hover:bg-blue-800"><Lock size={20}/> Config</button></div><button onClick={handleLogout} className="flex items-center gap-2 text-red-300 mt-auto pt-4 border-t border-blue-800"><LogOut size={20}/> Sair</button></div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50"><button onClick={()=>setActiveTab('dashboard')} className="text-blue-600"><TrendingUp/></button><button onClick={()=>setActiveTab('transactions')}><DollarSign/></button><button onClick={()=>setActiveTab('goals')}><Target/></button><button onClick={()=>setActiveTab('settings')}><Lock/></button></div>
      <div className="flex-1 flex flex-col overflow-hidden mb-16 md:mb-0">
        <header className="bg-white shadow p-4 flex justify-between items-center z-10"><h2 className="text-xl font-bold hidden md:block">Finanças Pessoais</h2><div className="flex items-center gap-4 ml-auto"><span>{currentUser.name}</span><button onClick={handleLogout} className="md:hidden text-red-500"><LogOut/></button></div></header>
        {(activeTab === 'dashboard' || activeTab === 'transactions') && <div className="bg-blue-50 p-2 flex justify-center items-center shadow-inner"><button onClick={handlePrevMonth} className="p-1 bg-white rounded-full shadow text-blue-800"><ChevronLeft/></button><span className="mx-4 font-bold text-blue-900 capitalize">{formatMonthYear(currentDate)}</span><button onClick={handleNextMonth} className="p-1 bg-white rounded-full shadow text-blue-800"><ChevronRight/></button></div>}
        <div className="flex-1 overflow-auto p-4 md:p-8">
           {/* DASHBOARD COMPACTO */}
           {activeTab === 'dashboard' && (
               <div className="space-y-4">
                   {renderSummaryCards()}
                   <div className="bg-white p-4 rounded shadow">
                       <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                           <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2"><PieIcon size={20}/> Despesas</h3>
                           <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                               <Filter size={16} className="text-gray-500 ml-2"/>
                               <select className="bg-transparent text-sm font-medium text-gray-700 p-1 focus:outline-none cursor-pointer" value={chartFilter} onChange={(e) => setChartFilter(e.target.value)}>
                                   <option value="todos">Todos os Usuários</option>
                                   {users.map(u => <option key={u.username} value={u.name}>{u.name}</option>)}
                               </select>
                           </div>
                       </div>
                       {renderExpenseChart()}
                   </div>
               </div>
           )}

           {activeTab === 'transactions' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div className="hidden md:block">{renderSummaryCards()}</div>
                 <div className="bg-white p-4 rounded shadow border-l-4 border-green-500"><h3 className="font-bold text-green-700 mb-2">Receita</h3><input className="w-full mb-2 p-2 border rounded" placeholder="Descrição" value={incomeForm.description} onChange={e=>setIncomeForm({...incomeForm, description:e.target.value})}/><input className="w-full mb-2 p-2 border rounded" type="number" placeholder="Valor" value={incomeForm.amount} onChange={e=>setIncomeForm({...incomeForm, amount:e.target.value})}/><select className="w-full mb-2 p-2 border rounded bg-white" value={incomeForm.category} onChange={e=>setIncomeForm({...incomeForm, category:e.target.value})}>{incomeCategories.map(c=><option key={c} value={c}>{c}</option>)}</select><input className="w-full mb-2 p-2 border rounded" type="date" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm, date:e.target.value})}/><button onClick={()=>addTransaction('income')} className="w-full bg-green-600 text-white p-2 rounded">Salvar</button></div>
                 <div className="bg-white p-4 rounded shadow border-l-4 border-red-500"><h3 className="font-bold text-red-700 mb-2">Despesa</h3><input className="w-full mb-2 p-2 border rounded" placeholder="Descrição" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description:e.target.value})}/><div className="flex gap-2 mb-2"><input className="w-2/3 p-2 border rounded font-bold" type="number" placeholder="Valor Total" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount:e.target.value})}/><div className="w-1/3 relative"><input type="number" min="1" max="60" className="w-full p-2 border rounded text-center text-blue-600 font-bold" value={expenseForm.installments} onChange={e=>setExpenseForm({...expenseForm, installments:e.target.value})}/><span className="absolute right-2 top-2 text-xs text-gray-400 font-bold pointer-events-none">x</span></div></div><select className="w-full mb-2 p-2 border rounded bg-white" value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category:e.target.value})}>{expenseCategories.map(c=><option key={c} value={c}>{c}</option>)}</select><select className="w-full mb-2 p-2 border rounded bg-white" value={expenseForm.paymentMethod} onChange={e=>setExpenseForm({...expenseForm, paymentMethod:e.target.value})}><option>Cartão de Crédito</option><option>PIX</option><option>Dinheiro</option><option>Compra Parcelada</option></select><button onClick={()=>addTransaction('expense')} className="w-full bg-red-600 text-white p-2 rounded">Salvar Despesa</button></div>
               </div>
               <div className="bg-white p-4 rounded shadow h-fit max-h-[600px] overflow-y-auto"><h3 className="font-bold mb-4 flex justify-between">Extrato <span className="text-xs font-normal bg-gray-100 p-1 rounded text-gray-500">{formatMonthYear(currentDate)}</span></h3>{filteredTransactions.slice().reverse().map(t => (<div key={t.id} className={`flex justify-between items-center border-b p-3 ${editingId === t.id ? 'bg-orange-50' : ''}`}><div className="overflow-hidden"><p className="font-bold truncate pr-2">{t.description} {editingId === t.id && <span className="text-orange-500 text-xs">(Editando)</span>}</p><p className="text-xs text-gray-600 flex items-center gap-1 mt-1">{t.date.split('-').reverse().join('/')} • {t.category || 'Geral'} • <span className="font-semibold">{t.createdBy || 'Sistema'}</span></p></div><div className="flex items-center gap-3"><span className={`font-bold ${t.type==='receita'?'text-green-600':'text-red-600'}`}>{t.type==='receita'?'+':'-'} R$ {Number(t.value).toFixed(2)}</span><button onClick={()=>startEditing(t)} className="text-blue-500 hover:text-blue-700"><Edit size={16}/></button><button onClick={()=>removeTransaction(t.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button></div></div>))}</div>
             </div>
           )}

           {/* METAS 3D */}
           {activeTab === 'goals' && (
             <div className="space-y-6">
                <div className="bg-white p-4 rounded shadow"><h3 className="font-bold mb-2">Nova Meta</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><input className="border p-2 rounded" placeholder="Nome" value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name:e.target.value})}/><input className="border p-2 rounded" placeholder="Valor Alvo" type="number" value={goalForm.targetAmount} onChange={e=>setGoalForm({...goalForm, targetAmount:e.target.value})}/><input className="border p-2 rounded" type="date" value={goalForm.targetDate} onChange={e=>setGoalForm({...goalForm, targetDate:e.target.value})}/><button onClick={addGoal} className="bg-purple-600 text-white rounded font-bold">Criar</button></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(g => {
                      const info = calculateSmartGoal(g.targetAmount, g.currentAmount, g.targetDate);
                      return (
                        <div key={g.id} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 relative group transform hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                           <button onClick={()=>deleteGoal(g.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                           <h4 className="font-bold text-lg text-gray-800">{g.name}</h4>
                           <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">Responsável: {g.createdBy}</p>
                           <div className="bg-purple-50 p-3 rounded-lg mb-4 border border-purple-100"><div className="flex items-center gap-2 mb-1"><Calculator size={14} className="text-purple-600"/><span className="text-[10px] font-bold text-purple-700 uppercase">Status</span></div><p className="text-sm text-gray-700">{info.text}</p>{info.status === 'pendente' && <p className="text-sm font-bold text-purple-600 mt-1">Meta: Guardar R$ {info.monthly.toFixed(2)}/mês</p>}</div>
                           <div className="flex justify-between items-end mb-2"><span className="text-xl font-bold text-gray-700">R$ {(g.currentAmount||0).toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ {g.targetAmount}</span></span><span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{Math.min(100, ((g.currentAmount||0)/g.targetAmount)*100).toFixed(0)}%</span></div>
                           <div className="w-full bg-gray-200 h-2 rounded-full mb-4 overflow-hidden"><div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{width: `${Math.min(100, ((g.currentAmount||0)/g.targetAmount)*100)}%`}}></div></div>
                           <div className="flex gap-2 border-t pt-4"><button onClick={()=>{const v=prompt('Valor:'); addValueToGoal(g.id, v)}} className="flex-1 bg-green-100 text-green-700 text-xs py-2 rounded font-bold hover:bg-green-200">Investir</button><button onClick={()=>{setWithdrawModal({show:true, goalId:g.id, goalName:g.name})}} className="flex-1 bg-red-100 text-red-700 text-xs py-2 rounded font-bold hover:bg-red-200">Resgatar</button></div>
                        </div>
                      )
                    })}
                </div>
             </div>
           )}

           {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6">
                 {/* LISTA DE USUÁRIOS RESTAURADA AQUI */}
                 <div className="bg-white p-6 rounded shadow">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={20} className="text-blue-500"/> Quem usa este App</h3>
                    <div className="space-y-2">
                        {users.map(u => (
                            <div key={u.username} className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-100">
                                <div className="bg-blue-100 p-2 rounded-full"><Users size={16} className="text-blue-600"/></div>
                                <div><p className="font-bold text-sm text-gray-700">{u.name}</p><p className="text-xs text-gray-400">@{u.username}</p></div>
                            </div>
                        ))}
                    </div>
                 </div>

                 <div className="bg-white p-6 rounded shadow border-l-4 border-red-500"><h3 className="font-bold mb-4 flex items-center gap-2"><Tag size={20} className="text-red-500"/> Categorias de Despesa</h3><div className="flex gap-2 mb-4"><input className="flex-1 border p-2 rounded" placeholder="Nova (Ex: Mercado)" value={newExpenseCat} onChange={e=>setNewExpenseCat(e.target.value)}/><button onClick={addExpenseCategory} className="bg-red-600 text-white px-4 rounded font-bold">Add</button></div><div className="flex flex-wrap gap-2">{expenseCategories.map(c=><span key={c} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">{c}<button onClick={()=>removeExpenseCategory(c)} className="text-red-400 font-bold hover:text-red-600">×</button></span>)}</div></div>
                 <div className="bg-white p-6 rounded shadow border-l-4 border-green-500"><h3 className="font-bold mb-4 flex items-center gap-2"><Wallet size={20} className="text-green-500"/> Categorias de Receita</h3><div className="flex gap-2 mb-4"><input className="flex-1 border p-2 rounded" placeholder="Nova (Ex: Freela)" value={newIncomeCat} onChange={e=>setNewIncomeCat(e.target.value)}/><button onClick={addIncomeCategory} className="bg-green-600 text-white px-4 rounded font-bold">Add</button></div><div className="flex flex-wrap gap-2">{incomeCategories.map(c=><span key={c} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">{c}<button onClick={()=>removeIncomeCategory(c)} className="text-red-400 font-bold hover:text-red-600">×</button></span>)}</div></div>
                 
                 {/* CONFIG CONTA */}
                 <div className="bg-white p-6 rounded shadow"><h3 className="font-bold mb-4 flex items-center gap-2"><Key size={20}/> Alterar Senha</h3><input className="w-full border p-2 mb-2 rounded" type="password" placeholder="Senha Atual" value={changePasswordForm.currentPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, currentPassword:e.target.value})}/><input className="w-full border p-2 mb-2 rounded" type="password" placeholder="Nova Senha" value={changePasswordForm.newPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, newPassword:e.target.value})}/><button onClick={changePassword} className="bg-blue-600 text-white w-full p-2 rounded font-bold">Atualizar</button></div>
              </div>
           )}
           {activeTab === 'admin' && currentUser.isAdmin && <div className="bg-white p-6 rounded shadow"><h3 className="font-bold mb-4">Gerenciar Usuários (Admin)</h3>{users.map(u=><div key={u.username} className="flex justify-between border-b p-2"><span>{u.name} ({u.username})</span>{u.username!=='dperrut' && <button onClick={()=>deleteUser(u.username)} className="text-red-500"><Trash2 size={16}/></button>}</div>)}<div className="mt-6"><h4 className="font-bold mb-2">Adicionar Novo</h4><input className="w-full border p-2 mb-2 rounded" placeholder="Nome" value={userManagementForm.name} onChange={e=>setUserManagementForm({...userManagementForm, name:e.target.value})}/><input className="w-full border p-2 mb-2 rounded" placeholder="Login" value={userManagementForm.username} onChange={e=>setUserManagementForm({...userManagementForm, username:e.target.value})}/><button onClick={createUser} className="bg-green-600 text-white w-full p-2 rounded">Criar</button></div></div>}
        </div>
      </div>
    </div>
  );
}