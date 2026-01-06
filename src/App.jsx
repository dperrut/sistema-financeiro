import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Plus, Trash2, LogOut, Users, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Calendar, AlertTriangle, PieChart as PieIcon, Filter, Edit, XCircle, Calculator } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Login e Recuperação
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Dados do Sistema
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);

  // --- Controle de Mês e Filtros ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chartFilter, setChartFilter] = useState('todos');
  
  // --- Controle de Edição ---
  const [editingId, setEditingId] = useState(null);
  
  // Controle de Saque de Metas
  const [withdrawModal, setWithdrawModal] = useState({ show: false, goalId: null, goalName: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });

  // Formulários
  const [userManagementForm, setUserManagementForm] = useState({ username: '', name: '', email: '' });
  const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [incomeForm, setIncomeForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '' });
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: 'Alimentação', paymentMethod: 'PIX' });
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '' });

  // Cores para o Gráfico
  const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

  // Inicialização
  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = () => {
    try {
      const usersResult = localStorage.getItem('system_users');
      if (usersResult) {
        setUsers(JSON.parse(usersResult));
      } else {
        const defaultUsers = [{
          username: 'dperrut',
          password: 'admin1234',
          name: 'Diego (Admin)',
          email: 'diego@exemplo.com',
          isAdmin: true,
          createdAt: new Date().toISOString()
        }];
        localStorage.setItem('system_users', JSON.stringify(defaultUsers));
        setUsers(defaultUsers);
      }
      
      const savedTrans = localStorage.getItem('system_transactions');
      const savedGoals = localStorage.getItem('system_goals');
      if (savedTrans) setTransactions(JSON.parse(savedTrans));
      if (savedGoals) setGoals(JSON.parse(savedGoals));

    } catch (error) {
      console.error("Erro ao inicializar:", error);
    }
  };

  // --- Login/Logout ---
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === loginForm.username && u.password === loginForm.password
    );
    if (user) {
      setCurrentUser(user);
    } else {
      alert('Usuário ou senha incorretos!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
    setActiveTab('dashboard');
  };

  const handleResetRequest = (e) => {
    e.preventDefault();
    alert('Função de e-mail simulada.');
    setShowForgotPassword(false);
  };

  // --- Reset ---
  const factoryReset = () => {
    if (window.confirm("Isso apagará TODOS os dados. Confirmar?")) {
      localStorage.removeItem('system_transactions');
      localStorage.removeItem('system_goals');
      setTransactions([]);
      setGoals([]);
      alert("Sistema limpo!");
    }
  };

  // --- Filtros e Datas ---
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const filteredTransactions = safeTransactions.filter(t => {
    if (!t.date) return false;
    const [yearStr, monthStr] = t.date.split('-');
    const transYear = parseInt(yearStr);
    const transMonth = parseInt(monthStr) - 1;
    return transMonth === currentDate.getMonth() && transYear === currentDate.getFullYear();
  });

  // --- Cálculos ---
  const monthlyIncome = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((acc, curr) => acc + Number(curr.value), 0);

  const monthlyExpense = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((acc, curr) => acc + Number(curr.value), 0);

  const monthlyBalance = monthlyIncome - monthlyExpense;

  const totalGlobalIncome = safeTransactions
    .filter(t => t.type === 'receita')
    .reduce((acc, curr) => acc + Number(curr.value), 0);
    
  const totalGlobalExpense = safeTransactions
    .filter(t => t.type === 'despesa')
    .reduce((acc, curr) => acc + Number(curr.value), 0);

  const accumulatedBalance = totalGlobalIncome - totalGlobalExpense;

  const calculateSmartGoal = (targetAmount, currentAmount, targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const remaining = Number(targetAmount) - (Number(currentAmount) || 0);
    let months = (target.getFullYear() - today.getFullYear()) * 12;
    months -= today.getMonth();
    months += target.getMonth();
    if (remaining <= 0) return { status: 'concluido', text: 'Meta atingida!', monthly: 0 };
    if (months <= 0) return { status: 'atrasado', text: 'Prazo vencido!', monthly: remaining };
    const monthly = remaining / months;
    return { status: 'pendente', months, monthly, text: `Faltam ${months} meses` };
  };

  // --- CRUD e Edição ---
  const blockWheel = (e) => e.target.blur();

  const startEditing = (transaction) => {
    setEditingId(transaction.id);
    if (transaction.type === 'receita') {
      setIncomeForm({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.value.toFixed(2)
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setExpenseForm({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.value.toFixed(2),
        category: transaction.category,
        paymentMethod: transaction.paymentMethod || 'PIX'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIncomeForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '' });
    setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: 'Alimentação', paymentMethod: 'PIX' });
  };

  const addTransaction = (type) => {
    const form = type === 'income' ? incomeForm : expenseForm;
    if (!form.description || !form.amount) return alert('Preencha os dados!');
    const sanitizedAmount = form.amount.toString().replace(',', '.');
    const numericAmount = parseFloat(sanitizedAmount);
    if (isNaN(numericAmount)) return alert("Valor inválido");

    if (editingId) {
       const updatedTransactions = safeTransactions.map(t => {
          if (t.id === editingId) {
             return { ...t, ...form, value: numericAmount };
          }
          return t;
       });
       setTransactions(updatedTransactions);
       localStorage.setItem('system_transactions', JSON.stringify(updatedTransactions));
       alert("Lançamento atualizado!");
       cancelEditing();
    } else {
       const newTransaction = {
          id: Date.now(),
          ...form,
          type: type === 'income' ? 'receita' : 'despesa',
          value: numericAmount,
          createdBy: currentUser.name
       };
       const updatedTransactions = [...safeTransactions, newTransaction];
       setTransactions(updatedTransactions);
       localStorage.setItem('system_transactions', JSON.stringify(updatedTransactions));
       
       if (type === 'income') setIncomeForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '' });
       else setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: 'Alimentação', paymentMethod: 'PIX' });
       alert('Lançamento adicionado!');
    }
  };

  const removeTransaction = (id) => {
    if(window.confirm("Apagar lançamento?")) {
      const updated = safeTransactions.filter(t => t.id !== id);
      setTransactions(updated);
      localStorage.setItem('system_transactions', JSON.stringify(updated));
      if (editingId === id) cancelEditing();
    }
  };

  const addGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount) return;
    const newGoal = { id: Date.now(), ...goalForm, currentAmount: 0, createdBy: currentUser.name };
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem('system_goals', JSON.stringify(updatedGoals));
    setGoalForm({ name: '', targetAmount: '', targetDate: '', description: '' });
  };

  const deleteGoal = (id) => {
    if(window.confirm("Apagar meta?")) {
      const updated = goals.filter(g => g.id !== id);
      setGoals(updated);
      localStorage.setItem('system_goals', JSON.stringify(updated));
    }
  };

  const addValueToGoal = (id, valueStr) => {
    const value = parseFloat(valueStr);
    if (!value || value <= 0) return alert("Valor inválido");
    const updatedGoals = goals.map(g => g.id === id ? { ...g, currentAmount: (g.currentAmount || 0) + value } : g);
    const goal = goals.find(g => g.id === id);
    const newTransaction = {
      id: Date.now(),
      type: 'despesa',
      description: `Investimento: ${goal.name}`,
      amount: valueStr,
      value: value, 
      category: 'Investimento/Meta',
      paymentMethod: 'Transferência',
      date: new Date().toISOString().split('T')[0],
      createdBy: currentUser.name
    };
    setGoals(updatedGoals);
    setTransactions([...safeTransactions, newTransaction]);
    localStorage.setItem('system_goals', JSON.stringify(updatedGoals));
    localStorage.setItem('system_transactions', JSON.stringify([...safeTransactions, newTransaction]));
    alert("Investido!");
  };

  const confirmWithdraw = (e) => {
    e.preventDefault();
    const value = parseFloat(withdrawForm.amount);
    const goal = goals.find(g => g.id === withdrawModal.goalId);
    if (!value || value > (goal.currentAmount || 0)) return alert("Saldo insuficiente ou inválido");
    
    const updatedGoals = goals.map(g => g.id === withdrawModal.goalId ? { ...g, currentAmount: g.currentAmount - value } : g);
    const newTransaction = {
      id: Date.now(),
      type: 'receita',
      description: `Resgate: ${goal.name}`,
      amount: withdrawForm.amount,
      value: value,
      category: 'Resgate de Meta',
      date: new Date().toISOString().split('T')[0],
      createdBy: currentUser.name
    };
    setGoals(updatedGoals);
    setTransactions([...safeTransactions, newTransaction]);
    localStorage.setItem('system_goals', JSON.stringify(updatedGoals));
    localStorage.setItem('system_transactions', JSON.stringify([...safeTransactions, newTransaction]));
    setWithdrawModal({ show: false, goalId: null, goalName: '' });
    alert("Resgatado!");
  };

  // --- CRUD USUÁRIOS ---
  const createUser = () => {
    if (!userManagementForm.username) return alert('Preencha os dados');
    const newUser = { ...userManagementForm, password: 'mudar321', isAdmin: false, createdAt: new Date().toISOString() };
    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem('system_users', JSON.stringify(updated));
    alert('Usuário criado!');
  };

  const deleteUser = (uname) => {
    if (window.confirm('Excluir?')) {
      const updated = users.filter(u => u.username !== uname);
      setUsers(updated);
      localStorage.setItem('system_users', JSON.stringify(updated));
    }
  };
  
  const changePassword = () => {
     if (currentUser.password !== changePasswordForm.currentPassword) return alert('Senha errada');
     const updated = users.map(u => u.username === currentUser.username ? { ...u, password: changePasswordForm.newPassword } : u);
     setUsers(updated);
     localStorage.setItem('system_users', JSON.stringify(updated));
     setCurrentUser({...currentUser, password: changePasswordForm.newPassword});
     alert('Senha alterada');
  };

  // --- FUNÇÕES DE RENDERIZAÇÃO ---
  const renderSummaryCards = () => (
    <div className="space-y-6 mb-6">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 rounded-xl shadow-lg text-white flex justify-between items-center transform hover:scale-[1.01] transition-transform">
        <div>
          <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Saldo Total Acumulado (Caixa)</p>
          <h2 className="text-3xl font-bold">R$ {accumulatedBalance.toFixed(2)}</h2>
        </div>
        <div className="bg-white bg-opacity-20 p-3 rounded-full"><DollarSign size={32} className="text-white" /></div>
      </div>

      <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide">Desempenho de {formatMonthYear(currentDate)}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
          <div><p className="text-gray-500 text-xs uppercase">Entrou</p><p className="text-xl font-bold text-green-600">R$ {monthlyIncome.toFixed(2)}</p></div>
          <TrendingUp className="text-green-500 opacity-50" size={24} />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex justify-between items-center">
          <div><p className="text-gray-500 text-xs uppercase">Saiu</p><p className="text-xl font-bold text-red-600">R$ {monthlyExpense.toFixed(2)}</p></div>
          <TrendingDown className="text-red-500 opacity-50" size={24} />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
          <div><p className="text-gray-500 text-xs uppercase">Balanço</p><p className={`text-xl font-bold ${monthlyBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {monthlyBalance.toFixed(2)}</p></div>
          <Calendar className="text-blue-500 opacity-50" size={24} />
        </div>
      </div>
    </div>
  );

  const renderExpenseChart = () => {
    const expenses = filteredTransactions.filter(t => {
       const isExpense = t.type === 'despesa';
       const matchesUser = chartFilter === 'todos' || t.createdBy === chartFilter;
       return isExpense && matchesUser;
    });

    if (expenses.length === 0) return <div className="text-center text-gray-400 py-10">Sem despesas para este filtro.</div>;

    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.value;
      return acc;
    }, {});

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const data = Object.keys(categoryTotals).map((cat, index) => ({
      name: cat,
      value: categoryTotals[cat],
      percent: total > 0 ? (categoryTotals[cat] / total) * 100 : 0,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    let currentDeg = 0;
    const gradientParts = data.map(item => {
      const start = currentDeg;
      const end = currentDeg + (item.percent * 3.6);
      currentDeg = end;
      return `${item.color} ${start}deg ${end}deg`;
    }).join(', ');

    return (
      <div className="flex flex-col md:flex-row items-center justify-around">
        <div className="relative w-48 h-48 rounded-full shadow-lg mb-6 md:mb-0" 
             style={{ background: `conic-gradient(${gradientParts || '#eee 0deg 360deg'})` }}>
           <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
             <div className="text-center">
               <p className="text-xs text-gray-500">Total ({chartFilter === 'todos' ? 'Todos' : chartFilter})</p>
               <p className="font-bold text-gray-800">R$ {total.toFixed(0)}</p>
             </div>
           </div>
        </div>
        <div className="space-y-2 w-full md:w-auto">
          {data.map(item => (
            <div key={item.name} className="flex items-center justify-between min-w-[200px] text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{background: item.color}}></div>
                <span className="text-gray-700">{item.name}</span>
              </div>
              <div className="flex gap-4">
                 <span className="font-semibold">R$ {item.value.toFixed(2)}</span>
                 <span className="text-gray-400 text-xs w-8 text-right">{item.percent.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- TELA PRINCIPAL ---
  if (!currentUser) {
    if (showForgotPassword) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4"><div className="bg-white p-8 rounded shadow w-full max-w-sm"><h1 className="text-2xl font-bold mb-4">Recuperar Senha</h1><button onClick={()=>setShowForgotPassword(false)} className="w-full bg-gray-200 p-2 rounded">Voltar</button></div></div>;
    }
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Minhas Finanças</h1>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Usuário" className="w-full p-2 border rounded mb-4" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} />
            <div className="relative mb-6">
                <input type={showPassword ? "text" : "password"} placeholder="Senha" className="w-full p-2 border rounded pr-10" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                <button type="button" className="absolute right-2 top-2 text-gray-500" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menu Desktop */}
      <div className="w-64 bg-blue-900 text-white p-6 flex flex-col hidden md:flex">
        <h1 className="text-2xl font-bold mb-8">Finanças App</h1>
        <div className="flex-1 space-y-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'dashboard' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><TrendingUp size={20} /> <span>Dashboard</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'transactions' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><DollarSign size={20} /> <span>Lançamentos</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'goals' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><Target size={20} /> <span>Metas</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'settings' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><Lock size={20} /> <span>Configurações</span></button>
          {currentUser.isAdmin && <button onClick={() => setActiveTab('admin')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'admin' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><Users size={20} /> <span>Administração</span></button>}
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-2 text-red-300 hover:text-red-100 mt-auto pt-4 border-t border-blue-800"><LogOut size={20} /> <span>Sair</span></button>
      </div>

      {/* Menu Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 text-gray-500 flex justify-around p-3 z-50 shadow-lg">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-blue-600' : ''}`}><TrendingUp size={24} /><span className="text-[10px]">Visão</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center ${activeTab === 'transactions' ? 'text-blue-600' : ''}`}><DollarSign size={24} /><span className="text-[10px]">Lançar</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center ${activeTab === 'goals' ? 'text-blue-600' : ''}`}><Target size={24} /><span className="text-[10px]">Metas</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center ${activeTab === 'settings' ? 'text-blue-600' : ''}`}><Lock size={24} /><span className="text-[10px]">Conta</span></button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden mb-16 md:mb-0">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800 hidden md:block">
            {activeTab === 'dashboard' && 'Visão Geral'}
            {activeTab === 'transactions' && 'Lançamentos e Fluxo'}
            {activeTab === 'goals' && 'Metas Financeiras'}
            {activeTab === 'settings' && 'Segurança e Configurações'}
            {activeTab === 'admin' && 'Administração do Sistema'}
          </h2>
          <div className="flex items-center space-x-4 ml-auto">
            <span className="text-gray-600 text-sm hidden md:inline">Olá, <strong>{currentUser.name}</strong></span>
            <button onClick={handleLogout} className="md:hidden text-red-500"><LogOut size={20}/></button>
          </div>
        </header>

        {(activeTab === 'dashboard' || activeTab === 'transactions') && (
          <div className="bg-blue-50 p-2 flex justify-center items-center shadow-inner">
             <button onClick={handlePrevMonth} className="p-1 bg-white rounded-full shadow hover:bg-gray-100 text-blue-800"><ChevronLeft size={20}/></button>
             <div className="mx-4 flex items-center space-x-2">
                <Calendar className="text-blue-800" size={18}/>
                <span className="text-lg font-bold text-blue-900 capitalize">{formatMonthYear(currentDate)}</span>
             </div>
             <button onClick={handleNextMonth} className="p-1 bg-white rounded-full shadow hover:bg-gray-100 text-blue-800"><ChevronRight size={20}/></button>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {renderSummaryCards()}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                  <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                    <PieIcon size={20}/> Para onde foi o dinheiro?
                  </h3>
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <Filter size={16} className="text-gray-500 ml-2"/>
                    <select className="bg-transparent text-sm font-medium text-gray-700 p-1 focus:outline-none cursor-pointer" value={chartFilter} onChange={(e) => setChartFilter(e.target.value)}>
                      <option value="todos">Todas as Despesas (Família)</option>
                      {users.map(u => (
                        <option key={u.username} value={u.name}>{u.name}</option>
                      ))}
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
                
                <div className={`bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-green-500 ${editingId && expenseForm.description ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h3 className="text-lg font-semibold mb-4 text-green-600 flex items-center justify-between">
                     <span className="flex items-center"><Plus size={20} className="mr-2"/> Receita</span>
                     {editingId && incomeForm.description && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Editando</span>}
                  </h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Descrição" className="w-full p-2 border rounded" value={incomeForm.description} onChange={e=>setIncomeForm({...incomeForm, description: e.target.value})} />
                    <input type="number" step="0.01" onWheel={blockWheel} placeholder="Valor (R$)" className="w-full p-2 border rounded" value={incomeForm.amount} onChange={e=>setIncomeForm({...incomeForm, amount: e.target.value})} />
                    <input type="date" className="w-full p-2 border rounded" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm, date: e.target.value})} />
                    
                    <div className="flex gap-2">
                      <button onClick={() => addTransaction('income')} className={`flex-1 text-white p-2 rounded font-bold ${editingId && incomeForm.description ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}>
                        {editingId && incomeForm.description ? 'Atualizar Receita' : 'Adicionar'}
                      </button>
                      {editingId && incomeForm.description && (
                        <button onClick={cancelEditing} className="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"><XCircle size={20}/></button>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-red-500 ${editingId && incomeForm.description ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center justify-between">
                     <span className="flex items-center"><TrendingDown size={20} className="mr-2"/> Despesa</span>
                     {editingId && expenseForm.description && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Editando</span>}
                  </h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Descrição" className="w-full p-2 border rounded" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description: e.target.value})} />
                    <input type="number" step="0.01" onWheel={blockWheel} placeholder="Valor (R$)" className="w-full p-2 border rounded" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount: e.target.value})} />
                    <select className="w-full p-2 border rounded bg-white" value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category: e.target.value})}>
                      <option>Alimentação</option><option>Transporte</option><option>Moradia</option><option>Lazer</option><option>Saúde</option><option>Educação</option><option>Outros</option>
                    </select>
                    
                    <div className="flex gap-2">
                      <button onClick={() => addTransaction('expense')} className={`flex-1 text-white p-2 rounded font-bold ${editingId && expenseForm.description ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-600 hover:bg-red-700'}`}>
                         {editingId && expenseForm.description ? 'Atualizar Despesa' : 'Adicionar'}
                      </button>
                      {editingId && expenseForm.description && (
                        <button onClick={cancelEditing} className="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"><XCircle size={20}/></button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm h-fit">
                <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
                  <span>Extrato</span>
                  <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">{formatMonthYear(currentDate)}</span>
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredTransactions.slice().reverse().map(t => (
                    <div key={t.id} className={`flex justify-between items-center p-3 border-b border-gray-50 hover:bg-gray-50 ${editingId === t.id ? 'bg-orange-50 border-orange-200' : ''}`}>
                      <div className="overflow-hidden">
                        <p className="font-medium truncate pr-2">{t.description} {editingId === t.id && <span className="text-xs text-orange-600 font-bold">(Editando...)</span>}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                           {t.date.split('-').reverse().join('/')} • {t.createdBy || 'Sistema'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`font-bold whitespace-nowrap ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'receita' ? '+' : '-'} {Number(t.value).toFixed(2)}
                        </span>
                        
                        <button onClick={() => startEditing(t)} className="text-blue-300 hover:text-blue-600" title="Editar"><Edit size={16}/></button>
                        <button onClick={() => removeTransaction(t.id)} className="text-gray-300 hover:text-red-500" title="Excluir"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                  {filteredTransactions.length === 0 && <p className="text-gray-400 text-center py-4 text-sm">Nada aqui ainda.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6 relative">
              {withdrawModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                    <h3 className="text-xl font-bold text-red-600 mb-4">Resgatar da Meta</h3>
                    <p className="text-sm text-gray-600 mb-4">Meta: <strong>{withdrawModal.goalName}</strong></p>
                    <form onSubmit={confirmWithdraw}>
                      <input type="number" step="0.01" onWheel={blockWheel} className="w-full p-2 border rounded mb-3" value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} placeholder="Valor (R$)" />
                      <textarea className="w-full p-2 border rounded mb-4" rows="3" placeholder="Justificativa..." value={withdrawForm.reason} onChange={e => setWithdrawForm({...withdrawForm, reason: e.target.value})}></textarea>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setWithdrawModal({ show: false, goalId: null, goalName: '' })} className="px-4 py-2 bg-gray-200 rounded text-sm">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded text-sm">Confirmar</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Criar Nova Meta</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input type="text" placeholder="Nome" className="p-2 border rounded" value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name: e.target.value})} />
                  <input type="number" step="0.01" onWheel={blockWheel} placeholder="Valor Alvo" className="p-2 border rounded" value={goalForm.targetAmount} onChange={e=>setGoalForm({...goalForm, targetAmount: e.target.value})} />
                  <input type="date" className="p-2 border rounded" value={goalForm.targetDate} onChange={e=>setGoalForm({...goalForm, targetDate: e.target.value})} />
                  <button onClick={addGoal} className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 font-bold">+ Criar</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(g => {
                  const progress = Math.min(100, ((g.currentAmount || 0) / g.targetAmount) * 100);
                  const smartInfo = calculateSmartGoal(g.targetAmount, g.currentAmount, g.targetDate);

                  return (
                    <div key={g.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group">
                      <button onClick={() => deleteGoal(g.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                      
                      <h4 className="font-bold text-lg mb-0 text-gray-800">{g.name}</h4>
                      <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wide">Por: {g.createdBy}</p>

                      <div className="bg-purple-50 p-3 rounded-lg mb-4 border border-purple-100">
                         <div className="flex items-center gap-2 mb-1">
                            <Calculator size={14} className="text-purple-600"/>
                            <span className="text-[10px] font-bold text-purple-700 uppercase">Planejamento</span>
                         </div>
                         <p className="text-sm text-gray-700">{smartInfo.text}</p>
                         {smartInfo.status === 'pendente' && (
                             <p className="text-lg font-bold text-purple-600">Guarde R$ {smartInfo.monthly.toFixed(2)}/mês</p>
                         )}
                      </div>

                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xl font-bold text-gray-700">R$ {(g.currentAmount || 0).toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ {parseFloat(g.targetAmount).toFixed(0)}</span></span>
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden"><div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div></div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2 mb-2">
                            <input type="number" step="0.01" onWheel={blockWheel} placeholder="R$" className="w-1/2 p-1 border rounded text-sm" id={`input-goal-${g.id}`}/>
                            <button onClick={() => { const input = document.getElementById(`input-goal-${g.id}`); addValueToGoal(g.id, input.value); input.value = ''; }} className="w-1/2 bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium">Depositar</button>
                        </div>
                        <button onClick={() => setWithdrawModal({ show: true, goalId: g.id, goalName: g.name })} className="w-full bg-red-50 text-red-600 px-3 py-1 rounded text-sm font-medium border border-red-100">Resgatar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">Configurações de Conta</h2>
                <div className="space-y-4">
                  <input type="password" placeholder="Senha Atual" className="w-full p-2 border rounded" value={changePasswordForm.currentPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, currentPassword: e.target.value})} />
                  <input type="password" placeholder="Nova Senha" className="w-full p-2 border rounded" value={changePasswordForm.newPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, newPassword: e.target.value})} />
                  <input type="password" placeholder="Confirmar" className="w-full p-2 border rounded" value={changePasswordForm.confirmPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, confirmPassword: e.target.value})} />
                  <button onClick={changePassword} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Atualizar Senha</button>
                </div>
              </div>
              
              {currentUser.isAdmin && (
                <div className="bg-red-50 p-4 md:p-8 rounded-xl border border-red-200 opacity-75 hover:opacity-100 transition-opacity">
                  <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2"><AlertTriangle size={24}/> Zona de Perigo (Admin)</h3>
                  <p className="text-sm text-red-600 mb-4">Cuidado: Apaga tudo para todos os usuários.</p>
                  <button onClick={factoryReset} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full font-bold">ZERAR SISTEMA COMPARTILHADO</button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'admin' && currentUser.isAdmin && (
            <div className="max-w-4xl mx-auto bg-white p-4 md:p-8 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-6">Painel Administrativo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Novo Usuário</h3>
                  <div className="space-y-4">
                    <input type="text" placeholder="Nome (Ex: Maria)" className="w-full p-2 border rounded" value={userManagementForm.name} onChange={(e) => setUserManagementForm({...userManagementForm, name: e.target.value})} />
                    <input type="text" placeholder="Login (Ex: maria)" className="w-full p-2 border rounded" value={userManagementForm.username} onChange={(e) => setUserManagementForm({...userManagementForm, username: e.target.value})} />
                    <input type="email" placeholder="E-mail" className="w-full p-2 border rounded" value={userManagementForm.email} onChange={(e) => setUserManagementForm({...userManagementForm, email: e.target.value})} />
                    <button onClick={createUser} className="bg-green-600 text-white px-4 py-2 rounded w-full">Criar Usuário</button>
                    <p className="text-xs text-gray-500 text-center mt-2">Senha padrão: <strong>mudar321</strong></p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Membros Ativos</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {users.map(u => (
                      <div key={u.username} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                        <div><p className="font-medium text-gray-800">{u.name}</p><p className="text-xs text-gray-500">@{u.username}</p></div>
                        {u.username !== 'dperrut' && <button onClick={() => deleteUser(u.username)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}