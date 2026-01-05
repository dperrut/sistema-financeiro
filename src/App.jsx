import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Plus, Trash2, LogOut, Users, Lock, Eye, EyeOff } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  // --- Lógica de Recuperação de Senha ---
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleResetRequest = (e) => {
    e.preventDefault();
    const userFound = users.find(u => u.email === resetEmail);
    
    if (userFound) {
      alert(`[SIMULAÇÃO]\n\nPara: ${userFound.email}\nAssunto: Recuperar Senha\n\nOlá ${userFound.name}, use o link para resetar sua senha.`);
      setShowForgotPassword(false);
      setResetEmail('');
      setShowForgotPassword(false); // Volta para o login
    } else {
      alert('E-mail não encontrado.');
    }
  };
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [userManagementForm, setUserManagementForm] = useState({
    username: '',
    name: '',
    email: '' // Novo campo
  });
  
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [incomeForm, setIncomeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'Salário'
  });
  
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'Alimentação',
    paymentMethod: 'PIX'
  });
  
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    description: ''
  });

  useEffect(() => {
    initializeSystem();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  // --- FUNÇÕES DE SISTEMA (Corrigidas para localStorage) ---
  const initializeSystem = () => {
    try {
      const usersResult = localStorage.getItem('system_users');
      if (usersResult) {
        setUsers(JSON.parse(usersResult));
      } else {
        const defaultUsers = [{
          username: 'dperrut',
          password: 'admin1234',
          name: 'Administrador',
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

  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) {
      alert('Preencha usuário e senha!');
      return;
    }

    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    
    if (user) {
      setCurrentUser(user);
      setLoginForm({ username: '', password: '' });
      // alert('Bem-vindo, ' + user.name + '!'); // Removido para ficar mais fluido
    } else {
      alert('Usuário ou senha incorretos!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setTransactions([]);
    setGoals([]);
    setActiveTab('dashboard');
  };

  const loadUserData = () => {
    try {
      const transKey = 'transactions_' + currentUser.username;
      const goalsKey = 'goals_' + currentUser.username;
      
      const transResult = localStorage.getItem(transKey);
      const goalsResult = localStorage.getItem(goalsKey);
      
      if (transResult) {
        setTransactions(JSON.parse(transResult));
      } else {
        setTransactions([]);
      }
      
      if (goalsResult) {
        setGoals(JSON.parse(goalsResult));
      } else {
        setGoals([]);
      }
    } catch (error) {
      console.log('Iniciando com dados vazios');
      setTransactions([]);
      setGoals([]);
    }
  };

  const saveUserData = (newTrans, newGoals) => {
    try {
      const transKey = 'transactions_' + currentUser.username;
      const goalsKey = 'goals_' + currentUser.username;
      
      if (newTrans !== undefined) {
        localStorage.setItem(transKey, JSON.stringify(newTrans));
      }
      if (newGoals !== undefined) {
        localStorage.setItem(goalsKey, JSON.stringify(newGoals));
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const createUser = () => {
    // Validamos se tem Nome, Login e Email (não pedimos mais senha)
    if (!userManagementForm.username || !userManagementForm.name || !userManagementForm.email) {
      alert('Preencha todos os campos!');
      return;
    }

    // Verifica se usuário já existe
    if (users.find(u => u.username === userManagementForm.username)) {
      alert('Este usuário já existe!');
      return;
    }

    const newUser = {
      username: userManagementForm.username,
      password: 'mudar321', // SENHA PADRÃO FIXA
      name: userManagementForm.name,
      email: userManagementForm.email, // Salva o e-mail
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    
    // Limpa o formulário
    setUserManagementForm({ username: '', name: '', email: '' });
    alert('Usuário criado! A senha padrão é: mudar321');
  };

  const deleteUser = (username) => {
    if (username === 'dperrut') {
      alert('Não é possível excluir o usuário administrador!');
      return;
    }

    if (window.confirm('Deseja realmente excluir o usuário ' + username + '?')) {
      const updatedUsers = users.filter(u => u.username !== username);
      setUsers(updatedUsers);
      localStorage.setItem('system_users', JSON.stringify(updatedUsers));
      
      try {
        localStorage.removeItem('transactions_' + username);
        localStorage.removeItem('goals_' + username);
      } catch (error) {
        console.log('Dados removidos');
      }
      
      alert('Usuário excluído!');
    }
  };

  const changePassword = () => {
    if (!changePasswordForm.currentPassword || !changePasswordForm.newPassword || !changePasswordForm.confirmPassword) {
      alert('Preencha todos os campos!');
      return;
    }

    if (changePasswordForm.currentPassword !== currentUser.password) {
      alert('Senha atual incorreta!');
      return;
    }

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    if (changePasswordForm.newPassword.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres!');
      return;
    }

    const updatedUsers = users.map(u => 
      u.username === currentUser.username 
        ? { ...u, password: changePasswordForm.newPassword }
        : u
    );

    setUsers(updatedUsers);
    localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    
    const updatedCurrentUser = { ...currentUser, password: changePasswordForm.newPassword };
    setCurrentUser(updatedCurrentUser);
    
    setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Senha alterada com sucesso!');
  };

  const addIncome = () => {
    if (!incomeForm.amount || !incomeForm.description) {
      alert('Preencha todos os campos!');
      return;
    }
    
    const newTransaction = {
      id: Date.now(),
      type: 'income',
      date: incomeForm.date,
      description: incomeForm.description,
      amount: parseFloat(incomeForm.amount),
      category: incomeForm.type
    };
    
    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    saveUserData(updated, undefined);
    setIncomeForm({ 
      date: new Date().toISOString().split('T')[0], 
      description: '', 
      amount: '', 
      type: 'Salário' 
    });
    alert('Receita adicionada!');
  };

  const addExpense = () => {
    if (!expenseForm.amount || !expenseForm.description) {
      alert('Preencha todos os campos!');
      return;
    }
    
    const newTransaction = {
      id: Date.now(),
      type: 'expense',
      date: expenseForm.date,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      paymentMethod: expenseForm.paymentMethod
    };
    
    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    saveUserData(updated, undefined);
    setExpenseForm({ 
      date: new Date().toISOString().split('T')[0], 
      description: '', 
      amount: '', 
      category: 'Alimentação', 
      paymentMethod: 'PIX' 
    });
    alert('Despesa adicionada!');
  };

  const addGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.targetDate) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }
    
    const newGoal = {
      id: Date.now(),
      name: goalForm.name,
      targetAmount: parseFloat(goalForm.targetAmount),
      targetDate: goalForm.targetDate,
      description: goalForm.description,
      createdAt: new Date().toISOString()
    };
    
    const updated = [...goals, newGoal];
    setGoals(updated);
    saveUserData(undefined, updated);
    setGoalForm({ name: '', targetAmount: '', targetDate: '', description: '' });
    alert('Meta adicionada!');
  };

  const deleteTransaction = (id) => {
    if (window.confirm('Deseja realmente excluir?')) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      saveUserData(updated, undefined);
    }
  };

  const deleteGoal = (id) => {
    if (window.confirm('Deseja realmente excluir?')) {
      const updated = goals.filter(g => g.id !== id);
      setGoals(updated);
      saveUserData(undefined, updated);
    }
  };

  const calculateMetrics = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyTrans = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = monthlyTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    const monthlyBalance = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlyBalance / monthlyIncome) * 100).toFixed(1) : 0;
    
    return { monthlyIncome, monthlyExpenses, monthlyBalance, balance, savingsRate };
  };

  const calculateGoalProgress = (goal) => {
    const metrics = calculateMetrics();
    const currentBalance = metrics.balance;
    const progress = (currentBalance / goal.targetAmount) * 100;
    
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const monthsRemaining = Math.max(0, (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth()));
    
    const remainingAmount = Math.max(0, goal.targetAmount - currentBalance);
    const monthlySavingsNeeded = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount;
    const avgMonthlySavings = metrics.monthlyBalance;
    const onTrack = avgMonthlySavings >= monthlySavingsNeeded;
    
    return { 
      progress: Math.min(100, progress), 
      currentBalance, 
      remainingAmount, 
      monthsRemaining, 
      monthlySavingsNeeded, 
      avgMonthlySavings, 
      onTrack 
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const metrics = calculateMetrics();

  if (!currentUser) {
    // TELA DE RECUPERAÇÃO DE SENHA
    if (showForgotPassword) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md w-96">
            <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Recuperar Senha</h1>
            <p className="text-sm text-gray-600 mb-4 text-center">Digite seu e-mail para receber o link.</p>
            <form onSubmit={handleResetRequest}>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  required
                  className="w-full p-2 border rounded"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-2">
                Enviar Link
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
              >
                Voltar
              </button>
            </form>
          </div>
        </div>
      );
    }

    // TELA DE LOGIN NORMAL
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Sistema Financeiro</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Usuário</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-2 border rounded pr-10"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* LINK ESQUECI MINHA SENHA */}
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>

            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-full">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none">Minhas Finanças</h1>
                <p className="text-blue-200 text-xs mt-1">Olá, {currentUser.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-500/30 px-3 py-1.5 rounded-lg transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
        
        {/* Menu de Navegação Horizontal */}
        <div className="container mx-auto px-4 mt-2 overflow-x-auto pb-2">
          <div className="flex space-x-1">
             {[
               { id: 'dashboard', label: 'Dashboard', icon: null },
               { id: 'income', label: 'Receitas', icon: null },
               { id: 'expense', label: 'Despesas', icon: null },
               { id: 'goals', label: 'Metas', icon: null },
               { id: 'history', label: 'Histórico', icon: null },
               { id: 'settings', label: 'Configurações', icon: null },
             ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                    ? 'bg-gray-100 text-blue-900' 
                    : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
             ))}
             {currentUser.isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === 'admin' 
                    ? 'bg-gray-100 text-blue-900' 
                    : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  Administração
                </button>
             )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 mb-20">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-600 rounded-xl shadow-lg p-5 text-white">
                <h3 className="text-blue-100 text-sm font-medium mb-1">Saldo Atual</h3>
                <p className="text-3xl font-bold">{formatCurrency(metrics.balance)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Receitas (Mês)</h3>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(metrics.monthlyIncome)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Despesas (Mês)</h3>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(metrics.monthlyExpenses)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Economia</h3>
                <p className="text-2xl font-bold text-purple-600">{metrics.savingsRate}%</p>
              </div>
            </div>

            {goals.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" /> Progresso das Metas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map(goal => {
                    const progress = calculateGoalProgress(goal);
                    return (
                      <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{goal.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${progress.onTrack ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {progress.onTrack ? 'No Prazo' : 'Atenção'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                          <div
                            className={`h-2.5 rounded-full ${progress.onTrack ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min(100, progress.progress)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatCurrency(progress.currentBalance)}</span>
                          <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'income' && (
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              Nova Receita
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Descrição</label>
                <input
                  type="text"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
                  placeholder="Ex: Salário"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Data</label>
                    <input
                      type="date"
                      value={incomeForm.date}
                      onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Tipo</label>
                    <select
                      value={incomeForm.type}
                      onChange={(e) => setIncomeForm({...incomeForm, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      <option>Salário</option>
                      <option>Freelance</option>
                      <option>Investimentos</option>
                      <option>Outros</option>
                    </select>
                 </div>
              </div>
              <button
                onClick={addIncome}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-5 h-5" />
                Confirmar Receita
              </button>
            </div>
          </div>
        )}

        {activeTab === 'expense' && (
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <div className="bg-red-100 p-2 rounded-full">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              Nova Despesa
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Descrição</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  placeholder="Ex: Mercado"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Categoria</label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option>Alimentação</option>
                      <option>Transporte</option>
                      <option>Moradia</option>
                      <option>Lazer</option>
                      <option>Saúde</option>
                      <option>Outros</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Pagamento</label>
                    <select
                      value={expenseForm.paymentMethod}
                      onChange={(e) => setExpenseForm({...expenseForm, paymentMethod: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option>PIX</option>
                      <option>Cartão Crédito</option>
                      <option>Cartão Débito</option>
                      <option>Dinheiro</option>
                    </select>
                 </div>
              </div>
              <button
                onClick={addExpense}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-5 h-5" />
                Confirmar Despesa
              </button>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                  <Target className="w-6 h-6 text-purple-600" />
                  Nova Meta
               </h2>
               {/* Formulário de Metas simplificado */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                     <label className="text-sm font-medium text-gray-700">Nome da Meta</label>
                     <input type="text" value={goalForm.name} onChange={e => setGoalForm({...goalForm, name: e.target.value})} className="w-full mt-1 p-2 border rounded-lg" placeholder="Ex: Viagem" />
                  </div>
                  <div>
                     <label className="text-sm font-medium text-gray-700">Valor Alvo (R$)</label>
                     <input type="number" value={goalForm.targetAmount} onChange={e => setGoalForm({...goalForm, targetAmount: e.target.value})} className="w-full mt-1 p-2 border rounded-lg" />
                  </div>
                  <div>
                     <label className="text-sm font-medium text-gray-700">Data Limite</label>
                     <input type="date" value={goalForm.targetDate} onChange={e => setGoalForm({...goalForm, targetDate: e.target.value})} className="w-full mt-1 p-2 border rounded-lg" />
                  </div>
               </div>
               <button onClick={addGoal} className="w-full mt-6 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700">Criar Meta</button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
               <h2 className="text-xl font-bold text-gray-800">Histórico de Transações</h2>
            </div>
            
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                Nenhuma transação registrada ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                    <tr>
                      <th className="px-6 py-3 text-left">Data</th>
                      <th className="px-6 py-3 text-left">Descrição</th>
                      <th className="px-6 py-3 text-left">Categoria</th>
                      <th className="px-6 py-3 text-right">Valor</th>
                      <th className="px-6 py-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[...transactions].reverse().map(trans => (
                      <tr key={trans.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(trans.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{trans.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded text-xs ${trans.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {trans.category}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold text-right ${trans.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {trans.type === 'income' ? '+' : '-'} {formatCurrency(trans.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => deleteTransaction(trans.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Outras abas (Settings e Admin) seguem o mesmo padrão simplificado... */}
         {activeTab === 'settings' && (
           <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
             <h2 className="text-xl font-bold mb-4">Configurações de Conta</h2>
             <p className="text-gray-500 mb-6">Altere sua senha de acesso abaixo.</p>
             <div className="space-y-4">
               <input type="password" placeholder="Senha Atual" className="w-full p-2 border rounded" value={changePasswordForm.currentPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, currentPassword: e.target.value})} />
               <input type="password" placeholder="Nova Senha" className="w-full p-2 border rounded" value={changePasswordForm.newPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, newPassword: e.target.value})} />
               <input type="password" placeholder="Confirmar Nova Senha" className="w-full p-2 border rounded" value={changePasswordForm.confirmPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, confirmPassword: e.target.value})} />
               <button onClick={changePassword} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Atualizar Senha</button>
             </div>
           </div>
         )}
         
         {activeTab === 'admin' && currentUser.isAdmin && (
           <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
             <h2 className="text-xl font-bold mb-6">Painel Administrativo</h2>
             <div className="grid md:grid-cols-2 gap-8">
               <div>
                  <h3 className="font-semibold mb-4">Novo Usuário</h3>
                  <div className="space-y-3">
                     <input type="text" placeholder="Nome Completo" className="w-full p-2 border rounded" value={userManagementForm.name} onChange={e=>setUserManagementForm({...userManagementForm, name: e.target.value})} />

                     <input type="text" placeholder="Nome Completo"
                      className="w-full p-2 border rounded mb-2"
                      value={userManagementForm.name}
                      onChange={(e) => setUserManagementForm({...userManagementForm, name: e.target.value})}/>
                     <input
                      type="text" placeholder="Login (Usuário)"
                      className="w-full p-2 border rounded mb-2"
                      value={userManagementForm.username}
                      onChange={(e) => setUserManagementForm({...userManagementForm, username: e.target.value})}/>
                     <input type="email" placeholder="E-mail do Usuário"
                      className="w-full p-2 border rounded mb-4"
                      value={userManagementForm.email}
                      onChange={(e) => setUserManagementForm({...userManagementForm, email: e.target.value})}/>                   
                     <button onClick={createUser} className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700">Criar Usuário</button>
                  </div>
               </div>
               <div>
                  <h3 className="font-semibold mb-4">Usuários Existentes</h3>
                  <div className="space-y-2">
                     {users.map(u => (
                       <div key={u.username} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-gray-500">@{u.username}</p>
                          </div>
                          {u.username !== 'dperrut' && (
                             <button onClick={() => deleteUser(u.username)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                          )}
                       </div>
                     ))}
                  </div>
               </div>
             </div>
           </div>
         )}

      </div>
    </div>
  );
}