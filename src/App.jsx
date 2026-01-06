import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Plus, Trash2, LogOut, Users, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';

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

  // --- Controle de Mês ---
  const [currentDate, setCurrentDate] = useState(new Date()); 
  
  // Controle de Saque de Metas
  const [withdrawModal, setWithdrawModal] = useState({ show: false, goalId: null, goalName: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });

  // Formulários
  const [userManagementForm, setUserManagementForm] = useState({ username: '', name: '', email: '' });
  const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  // CORREÇÃO: Removemos o 'type' inicial daqui para não causar conflito
  const [incomeForm, setIncomeForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '' });
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: 'Alimentação', paymentMethod: 'PIX' });
  
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '' });

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
    } catch (error) {
      console.error("Erro ao inicializar:", error);
    }
  };

  // --- Reset de Emergência ---
  const factoryReset = () => {
    if (window.confirm("Isso apagará TODOS os lançamentos para corrigir o erro de cálculo. Confirmar?")) {
      localStorage.removeItem(`transactions_${currentUser.username}`);
      localStorage.removeItem(`goals_${currentUser.username}`);
      setTransactions([]);
      setGoals([]);
      alert("Sistema limpo e corrigido!");
    }
  };

  // --- Lógica de Login e Logout ---
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === loginForm.username && u.password === loginForm.password
    );
    if (user) {
      setCurrentUser(user);
      const savedTrans = localStorage.getItem(`transactions_${user.username}`);
      const savedGoals = localStorage.getItem(`goals_${user.username}`);
      if (savedTrans) setTransactions(JSON.parse(savedTrans));
      else setTransactions([]);
      if (savedGoals) setGoals(JSON.parse(savedGoals));
      else setGoals([]);
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
    const userFound = users.find(u => u.email === resetEmail);
    if (userFound) {
      alert(`[SIMULAÇÃO]\nPara: ${userFound.email}\nLink: http://recuperar-senha/user=${userFound.username}`);
      setShowForgotPassword(false);
      setResetEmail('');
    } else {
      alert('E-mail não encontrado.');
    }
  };

  // --- Lógica de Filtro de Mês ---
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

  // FILTRO ROBUSTO (Baseado em String para evitar erro de fuso horário)
  const filteredTransactions = transactions.filter(t => {
    if (!t.date) return false;
    // t.date é "2026-01-05"
    const [yearStr, monthStr] = t.date.split('-'); // Separa "2026" e "01"
    
    const transYear = parseInt(yearStr);
    const transMonth = parseInt(monthStr) - 1; // Mês em JS começa em 0 (Jan = 0)
    
    return transMonth === currentDate.getMonth() && transYear === currentDate.getFullYear();
  });

  // --- Cálculos Matemáticos ---
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((acc, curr) => acc + Number(curr.value), 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((acc, curr) => acc + Number(curr.value), 0);

  const balance = totalIncome - totalExpense;


  // --- CRUD ---
  const createUser = () => {
    if (!userManagementForm.username || !userManagementForm.name || !userManagementForm.email) return alert('Preencha tudo!');
    if (users.find(u => u.username === userManagementForm.username)) return alert('Usuário já existe!');
    
    const newUser = { ...userManagementForm, password: 'mudar321', isAdmin: false, createdAt: new Date().toISOString() };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    setUserManagementForm({ username: '', name: '', email: '' });
    alert('Usuário criado! Senha: mudar321');
  };

  const deleteUser = (usernameToDelete) => {
    if (window.confirm('Excluir usuário?')) {
      const updatedUsers = users.filter(u => u.username !== usernameToDelete);
      setUsers(updatedUsers);
      localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    }
  };

  const changePassword = () => {
    if (currentUser.password !== changePasswordForm.currentPassword) return alert('Senha atual errada!');
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) return alert('Novas senhas não conferem!');
    
    const updatedUsers = users.map(u => u.username === currentUser.username ? { ...u, password: changePasswordForm.newPassword } : u);
    setUsers(updatedUsers);
    localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    setCurrentUser({ ...currentUser, password: changePasswordForm.newPassword });
    setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Senha alterada!');
  };

  // --- CORREÇÃO PRINCIPAL AQUI ---
  const addTransaction = (type) => {
    const form = type === 'income' ? incomeForm : expenseForm;
    if (!form.description || !form.amount) return alert('Preencha os dados!');
    
    // Converte virgula para ponto se o usuario digitou errado
    const sanitizedAmount = form.amount.toString().replace(',', '.');
    const numericAmount = parseFloat(sanitizedAmount);

    if (isNaN(numericAmount)) return alert("Valor inválido");

    const newTransaction = {
      id: Date.now(),
      ...form, // Espalha os dados do form primeiro
      type: type === 'income' ? 'receita' : 'despesa', // DEPOIS define o tipo (Garante que nada sobrescreve)
      value: numericAmount
    };
    
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${currentUser.username}`, JSON.stringify(updatedTransactions));
    
    if (type === 'income') setIncomeForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '' });
    else setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: 'Alimentação', paymentMethod: 'PIX' });
    alert('Lançamento adicionado!');
  };

  const removeTransaction = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem(`transactions_${currentUser.username}`, JSON.stringify(updated));
  };

  const addGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount) return;
    const newGoal = { id: Date.now(), ...goalForm, currentAmount: 0 };
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${currentUser.username}`, JSON.stringify(updatedGoals));
    setGoalForm({ name: '', targetAmount: '', targetDate: '', description: '' });
  };

  const deleteGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    localStorage.setItem(`goals_${currentUser.username}`, JSON.stringify(updated));
  };

  const addValueToGoal = (id, valueStr) => {
    const value = parseFloat(valueStr);
    if (!value || value <= 0) return alert("Valor inválido!");

    const updatedGoals = goals.map(g => g.id === id ? { ...g, currentAmount: (g.currentAmount || 0) + value } : g);
    const goalName = goals.find(g => g.id === id).name;
    
    const newTransaction = {
      id: Date.now(),
      type: 'despesa',
      description: `Investimento: ${goalName}`,
      amount: valueStr,
      value: value, 
      category: 'Investimento/Meta',
      paymentMethod: 'Transferência',
      date: new Date().toISOString().split('T')[0]
    };

    setGoals(updatedGoals);
    setTransactions([...transactions, newTransaction]);
    localStorage.setItem(`goals_${currentUser.username}`, JSON.stringify(updatedGoals));
    localStorage.setItem(`transactions_${currentUser.username}`, JSON.stringify([...transactions, newTransaction]));
    alert(`R$ ${value.toFixed(2)} transferidos para a meta.`);
  };

  const confirmWithdraw = (e) => {
    e.preventDefault();
    const value = parseFloat(withdrawForm.amount);
    if (!value || value <= 0 || !withdrawForm.reason) return alert("Verifique valor e justificativa!");

    const goal = goals.find(g => g.id === withdrawModal.goalId);
    if (value > (goal.currentAmount || 0)) return alert("Saldo insuficiente!");

    const updatedGoals = goals.map(g => g.id === withdrawModal.goalId ? { ...g, currentAmount: g.currentAmount - value } : g);
    const newTransaction = {
      id: Date.now(),
      type: 'receita',
      description: `Resgate: ${goal.name} - ${withdrawForm.reason}`,
      amount: withdrawForm.amount,
      value: value,
      category: 'Resgate de Meta',
      date: new Date().toISOString().split('T')[0]
    };

    setGoals(updatedGoals);
    setTransactions([...transactions, newTransaction]);
    localStorage.setItem(`goals_${currentUser.username}`, JSON.stringify(updatedGoals));
    localStorage.setItem(`transactions_${currentUser.username}`, JSON.stringify([...transactions, newTransaction]));
    setWithdrawModal({ show: false, goalId: null, goalName: '' });
    alert("Resgate realizado!");
  };

  const SummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Receitas ({formatMonthYear(currentDate)})</p>
          <p className="text-xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</p>
        </div>
        <TrendingUp className="text-green-500" size={24} />
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Despesas ({formatMonthYear(currentDate)})</p>
          <p className="text-xl font-bold text-red-600">R$ {totalExpense.toFixed(2)}</p>
        </div>
        <TrendingDown className="text-red-500" size={24} />
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Saldo ({formatMonthYear(currentDate)})</p>
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {balance.toFixed(2)}</p>
        </div>
        <DollarSign className="text-blue-500" size={24} />
      </div>
    </div>
  );

  if (!currentUser) {
    if (showForgotPassword) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md w-96">
            <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Recuperar Senha</h1>
            <p className="text-sm text-gray-600 mb-4 text-center">Digite seu e-mail cadastrado.</p>
            <form onSubmit={handleResetRequest}>
              <input type="email" placeholder="E-mail" required className="w-full p-2 border rounded mb-4" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-2">Enviar Link</button>
              <button type="button" onClick={() => setShowForgotPassword(false)} className="w-full bg-gray-300 text-gray-700 p-2 rounded">Voltar</button>
            </form>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Minhas Finanças</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Usuário</label>
              <input type="text" className="w-full p-2 border rounded" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} />
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} className="w-full p-2 border rounded pr-10" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                <button type="button" className="absolute right-2 top-2 text-gray-500" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
              <div className="text-right mt-2">
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-blue-600 hover:underline">Esqueci minha senha</button>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-blue-900 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Finanças App</h1>
        <div className="flex-1 space-y-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'dashboard' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><TrendingUp size={20} /> <span>Dashboard</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'transactions' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><DollarSign size={20} /> <span>Lançamentos</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'goals' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><Target size={20} /> <span>Metas</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'settings' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><Lock size={20} /> <span>Alterar Senha</span></button>
          {currentUser.isAdmin && <button onClick={() => setActiveTab('admin')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'admin' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><Users size={20} /> <span>Administração</span></button>}
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-2 text-red-300 hover:text-red-100 mt-auto pt-4 border-t border-blue-800"><LogOut size={20} /> <span>Sair</span></button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {activeTab === 'dashboard' && 'Visão Geral'}
            {activeTab === 'transactions' && 'Lançamentos e Fluxo'}
            {activeTab === 'goals' && 'Metas Financeiras'}
            {activeTab === 'settings' && 'Segurança e Configurações'}
            {activeTab === 'admin' && 'Administração do Sistema'}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Olá, <strong>{currentUser.name}</strong></span>
          </div>
        </header>

        {(activeTab === 'dashboard' || activeTab === 'transactions') && (
          <div className="bg-blue-100 p-3 flex justify-center items-center shadow-inner">
             <button onClick={handlePrevMonth} className="p-2 bg-white rounded-full shadow hover:bg-gray-50 text-blue-800"><ChevronLeft size={24}/></button>
             <div className="mx-6 flex items-center space-x-2">
                <Calendar className="text-blue-800" size={24}/>
                <span className="text-xl font-bold text-blue-900 capitalize">{formatMonthYear(currentDate)}</span>
             </div>
             <button onClick={handleNextMonth} className="p-2 bg-white rounded-full shadow hover:bg-gray-50 text-blue-800"><ChevronRight size={24}/></button>
          </div>
        )}

        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <SummaryCards />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <SummaryCards />
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-green-600 flex items-center"><Plus size={20} className="mr-2"/> Nova Receita</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Descrição" className="w-full p-2 border rounded" value={incomeForm.description} onChange={e=>setIncomeForm({...incomeForm, description: e.target.value})} />
                    <input type="number" placeholder="Valor (R$)" className="w-full p-2 border rounded" value={incomeForm.amount} onChange={e=>setIncomeForm({...incomeForm, amount: e.target.value})} />
                    <input type="date" className="w-full p-2 border rounded" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm, date: e.target.value})} />
                    <button onClick={() => addTransaction('income')} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Adicionar Receita</button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center"><TrendingDown size={20} className="mr-2"/> Nova Despesa</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Descrição" className="w-full p-2 border rounded" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description: e.target.value})} />
                    <input type="number" placeholder="Valor (R$)" className="w-full p-2 border rounded" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount: e.target.value})} />
                    <select className="w-full p-2 border rounded" value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category: e.target.value})}>
                      <option>Alimentação</option><option>Transporte</option><option>Moradia</option><option>Lazer</option><option>Saúde</option><option>Outros</option>
                    </select>
                    <button onClick={() => addTransaction('expense')} className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700">Adicionar Despesa</button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
                <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
                  <span>Extrato Detalhado</span>
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">{formatMonthYear(currentDate)}</span>
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredTransactions.slice().reverse().map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{t.description}</p>
                        <p className="text-xs text-gray-500">{t.date} • {t.type === 'receita' ? 'Receita' : t.category}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`font-bold ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'receita' ? '+' : '-'} R$ {Number(t.value).toFixed(2)}
                        </span>
                        <button onClick={() => removeTransaction(t.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                  {filteredTransactions.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum lançamento neste mês.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6 relative">
              {withdrawModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                    <h3 className="text-xl font-bold text-red-600 mb-4">Resgatar da Meta</h3>
                    <p className="text-sm text-gray-600 mb-4">Meta: <strong>{withdrawModal.goalName}</strong></p>
                    <form onSubmit={confirmWithdraw}>
                      <input type="number" className="w-full p-2 border rounded mb-3" value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} placeholder="Valor (R$)" />
                      <textarea className="w-full p-2 border rounded mb-4" rows="3" placeholder="Justificativa..." value={withdrawForm.reason} onChange={e => setWithdrawForm({...withdrawForm, reason: e.target.value})}></textarea>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setWithdrawModal({ show: false, goalId: null, goalName: '' })} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">Confirmar</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Criar Nova Meta</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="Nome" className="p-2 border rounded" value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name: e.target.value})} />
                  <input type="number" placeholder="Valor Alvo" className="p-2 border rounded" value={goalForm.targetAmount} onChange={e=>setGoalForm({...goalForm, targetAmount: e.target.value})} />
                  <input type="date" className="p-2 border rounded" value={goalForm.targetDate} onChange={e=>setGoalForm({...goalForm, targetDate: e.target.value})} />
                  <button onClick={addGoal} className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 font-bold">+ Criar Meta</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(g => {
                  const progress = Math.min(100, ((g.currentAmount || 0) / g.targetAmount) * 100);
                  return (
                    <div key={g.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                      <button onClick={() => deleteGoal(g.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                      <h4 className="font-bold text-lg mb-1 text-gray-800">{g.name}</h4>
                      <p className="text-sm text-gray-500 mb-4">Meta: R$ {parseFloat(g.targetAmount).toFixed(2)}</p>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-bold text-purple-600">R$ {(g.currentAmount || 0).toFixed(2)}</span>
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden"><div className="bg-purple-600 h-3 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div></div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2 mb-2">
                            <input type="number" placeholder="R$" className="w-1/2 p-1 border rounded text-sm" id={`input-goal-${g.id}`}/>
                            <button onClick={() => { const input = document.getElementById(`input-goal-${g.id}`); addValueToGoal(g.id, input.value); input.value = ''; }} className="w-1/2 bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium">Depositar</button>
                        </div>
                        <button onClick={() => setWithdrawModal({ show: true, goalId: g.id, goalName: g.name })} className="w-full bg-red-50 text-red-600 px-3 py-1 rounded text-sm font-medium border border-red-100">Resgatar (Emergência)</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">Configurações de Conta</h2>
                <div className="space-y-4">
                  <input type="password" placeholder="Senha Atual" className="w-full p-2 border rounded" value={changePasswordForm.currentPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, currentPassword: e.target.value})} />
                  <input type="password" placeholder="Nova Senha" className="w-full p-2 border rounded" value={changePasswordForm.newPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, newPassword: e.target.value})} />
                  <input type="password" placeholder="Confirmar" className="w-full p-2 border rounded" value={changePasswordForm.confirmPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, confirmPassword: e.target.value})} />
                  <button onClick={changePassword} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Atualizar Senha</button>
                </div>
              </div>
              <div className="bg-red-50 p-8 rounded-xl border border-red-200">
                <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2"><AlertTriangle size={24}/> Zona de Perigo</h3>
                <p className="text-sm text-red-600 mb-4">Isso limpará os lançamentos para corrigir qualquer erro de cálculo acumulado.</p>
                <button onClick={factoryReset} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full font-bold">ZERAR SISTEMA</button>
              </div>
            </div>
          )}
          
          {activeTab === 'admin' && currentUser.isAdmin && (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-6">Painel Administrativo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Novo Usuário</h3>
                  <div className="space-y-4">
                    <input type="text" placeholder="Nome" className="w-full p-2 border rounded" value={userManagementForm.name} onChange={(e) => setUserManagementForm({...userManagementForm, name: e.target.value})} />
                    <input type="text" placeholder="Login" className="w-full p-2 border rounded" value={userManagementForm.username} onChange={(e) => setUserManagementForm({...userManagementForm, username: e.target.value})} />
                    <input type="email" placeholder="E-mail" className="w-full p-2 border rounded" value={userManagementForm.email} onChange={(e) => setUserManagementForm({...userManagementForm, email: e.target.value})} />
                    <button onClick={createUser} className="bg-green-600 text-white px-4 py-2 rounded w-full">Criar Usuário</button>
                    <p className="text-xs text-gray-500 text-center mt-2">Senha padrão: <strong>mudar321</strong></p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Existentes</h3>
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