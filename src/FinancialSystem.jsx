import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Plus, Trash2, LogOut, Users, Lock, Eye, EyeOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FinancialControlSystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [userManagementForm, setUserManagementForm] = useState({
    username: '',
    password: '',
    name: ''
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
      loadUserData(currentUser);
    }
  }, [currentUser]);

  // CORREÇÃO: Usando localStorage ao invés de window.storage
  const initializeSystem = () => {
    try {
      const storedUsers = localStorage.getItem('system_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
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
      // Carregar dados imediatamente ao logar
      loadUserData(user);
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

  // CORREÇÃO: Removido async/await e usado localStorage
  const loadUserData = (user) => {
    try {
      const transKey = 'transactions_' + user.username;
      const goalsKey = 'goals_' + user.username;
      
      const storedTrans = localStorage.getItem(transKey);
      const storedGoals = localStorage.getItem(goalsKey);
      
      if (storedTrans) setTransactions(JSON.parse(storedTrans));
      else setTransactions([]);
      
      if (storedGoals) setGoals(JSON.parse(storedGoals));
      else setGoals([]);
      
    } catch (error) {
      console.log('Iniciando com dados vazios');
      setTransactions([]);
      setGoals([]);
    }
  };

  // CORREÇÃO: Removido async/await e usado localStorage
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
    if (!userManagementForm.username || !userManagementForm.password || !userManagementForm.name) {
      alert('Preencha todos os campos!');
      return;
    }

    if (users.find(u => u.username === userManagementForm.username)) {
      alert('Este usuário já existe!');
      return;
    }

    const newUser = {
      username: userManagementForm.username,
      password: userManagementForm.password,
      name: userManagementForm.name,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    setUserManagementForm({ username: '', password: '', name: '' });
    alert('Usuário criado com sucesso!');
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

  // --- RENDERIZAÇÃO ---

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Sistema Financeiro</h1>
            <p className="text-gray-600 mt-2">Faça login para continuar</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                placeholder="Digite seu usuário"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="Digite sua senha"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Entrar
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Usuário padrão: <strong>dperrut</strong></p>
            <p>Senha padrão: <strong>admin1234</strong></p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="w-7 h-7" />
                Sistema Financeiro
              </h1>
              <p className="text-blue-100 text-sm mt-1">Olá, {currentUser.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {['dashboard', 'income', 'expense', 'goals', 'history', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={'px-6 py-4 font-medium whitespace-nowrap capitalize ' + (activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600')}
              >
                {tab === 'income' ? 'Receitas' : tab === 'expense' ? 'Despesas' : tab === 'goals' ? 'Metas' : tab === 'history' ? 'Histórico' : tab === 'settings' ? 'Configurações' : tab}
              </button>
            ))}
            {currentUser.isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={'px-6 py-4 font-medium whitespace-nowrap ' + (activeTab === 'admin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600')}
              >
                Administração
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-500 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-sm opacity-90">Saldo Atual</h3>
                <p className="text-3xl font-bold mt-2">{formatCurrency(metrics.balance)}</p>
              </div>
              <div className="bg-green-500 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-sm opacity-90">Receitas (Mês)</h3>
                <p className="text-3xl font-bold mt-2">{formatCurrency(metrics.monthlyIncome)}</p>
              </div>
              <div className="bg-red-500 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-sm opacity-90">Despesas (Mês)</h3>
                <p className="text-3xl font-bold mt-2">{formatCurrency(metrics.monthlyExpenses)}</p>
              </div>
              <div className="bg-purple-500 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-sm opacity-90">Taxa de Economia</h3>
                <p className="text-3xl font-bold mt-2">{metrics.savingsRate}%</p>
              </div>
            </div>

            {goals.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">Progresso das Metas</h3>
                <div className="space-y-4">
                  {goals.map(goal => {
                    const progress = calculateGoalProgress(goal);
                    return (
                      <div key={goal.id} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{goal.name}</h4>
                            <p className="text-sm text-gray-600">{goal.description}</p>
                          </div>
                          <span className={'px-3 py-1 rounded-full text-sm h-fit ' + (progress.onTrack ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                            {progress.onTrack ? '✓ No caminho' : '⚠ Atenção'}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso: {progress.progress.toFixed(1)}%</span>
                            <span>{formatCurrency(progress.currentBalance)} / {formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={'h-3 rounded-full ' + (progress.onTrack ? 'bg-green-500' : 'bg-red-500')}
                              style={{ width: Math.min(100, progress.progress) + '%' }}
                            />
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>Faltam: <strong>{formatCurrency(progress.remainingAmount)}</strong></div>
                            <div>Meses restantes: <strong>{progress.monthsRemaining}</strong></div>
                            <div>Economizar/mês: <strong className="text-blue-600">{formatCurrency(progress.monthlySavingsNeeded)}</strong></div>
                          </div>
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
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              Adicionar Receita
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Data</label>
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={incomeForm.type}
                  onChange={(e) => setIncomeForm({...incomeForm, type: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option>Salário</option>
                  <option>Freelance</option>
                  <option>Investimentos</option>
                  <option>Bônus</option>
                  <option>Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <input
                  type="text"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
                  placeholder="Ex: Salário de Janeiro"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={addIncome}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar Receita
              </button>
            </div>
          </div>
        )}

        {activeTab === 'expense' && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-red-500" />
              Adicionar Despesa
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Data</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option>Alimentação</option>
                  <option>Transporte</option>
                  <option>Moradia</option>
                  <option>Lazer</option>
                  <option>Educação</option>
                  <option>Saúde</option>
                  <option>Vestuário</option>
                  <option>Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
                <select
                  value={expenseForm.paymentMethod}
                  onChange={(e) => setExpenseForm({...expenseForm, paymentMethod: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option>PIX</option>
                  <option>Cartão de Crédito</option>
                  <option>Cartão de Débito</option>
                  <option>Dinheiro</option>
                  <option>Transferência</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  placeholder="Ex: Supermercado"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={addExpense}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar Despesa
              </button>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-500" />
                Adicionar Meta
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Meta</label>
                  <input
                    type="text"
                    value={goalForm.name}
                    onChange={(e) => setGoalForm({...goalForm, name: e.target.value})}
                    placeholder="Ex: Viagem para Europa"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalForm.targetAmount}
                    onChange={(e) => setGoalForm({...goalForm, targetAmount: e.target.value})}
                    placeholder="5000.00"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data Alvo</label>
                  <input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm({...goalForm, targetDate: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
                  <textarea
                    value={goalForm.description}
                    onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                    placeholder="Detalhes sobre sua meta..."
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <button
                  onClick={addGoal}
                  className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Meta
                </button>
              </div>
            </div>

            {goals.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold mb-4">Minhas Metas</h3>
                <div className="space-y-4">
                  {goals.map(goal => (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{goal.name}</h4>
                          <p className="text-sm text-gray-600">{goal.description}</p>
                          <p className="text-sm mt-2">Meta: {formatCurrency(goal.targetAmount)}</p>
                          <p className="text-sm">Data: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Histórico de Transações</h2>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>Nenhuma transação registrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Descrição</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Categoria</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Valor</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[...transactions].reverse().map(trans => (
                      <tr key={trans.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {new Date(trans.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={'px-2 py-1 rounded text-xs ' + (trans.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                            {trans.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{trans.description}</td>
                        <td className="px-4 py-3 text-sm">{trans.category}</td>
                        <td className={'px-4 py-3 text-sm text-right font-medium ' + (trans.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                          {trans.type === 'income' ? '+' : '-'} {formatCurrency(trans.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => deleteTransaction(trans.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 inline" />
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

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-gray-600" />
              Alterar Senha
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Senha Atual</label>
                <input
                  type="password"
                  value={changePasswordForm.currentPassword}
                  onChange={(e) => setChangePasswordForm({...changePasswordForm, currentPassword: e.target.value})}
                  placeholder="Digite sua senha atual"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nova Senha</label>
                <input
                  type="password"
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm({...changePasswordForm, newPassword: e.target.value})}
                  placeholder="Digite a nova senha (mín. 6 caracteres)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) => setChangePasswordForm({...changePasswordForm, confirmPassword: e.target.value})}
                  placeholder="Digite a nova senha novamente"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={changePassword}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600"
              >
                Alterar Senha
              </button>
            </div>
          </div>
        )}

        {activeTab === 'admin' && currentUser.isAdmin && (
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Criar Novo Usuário
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={userManagementForm.name}
                    onChange={(e) => setUserManagementForm({...userManagementForm, name: e.target.value})}
                    placeholder="Ex: João Silva"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nome de Usuário</label>
                  <input
                    type="text"
                    value={userManagementForm.username}
                    onChange={(e) => setUserManagementForm({...userManagementForm, username: e.target.value})}
                    placeholder="Ex: joaosilva"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Senha</label>
                  <input
                    type="password"
                    value={userManagementForm.password}
                    onChange={(e) => setUserManagementForm({...userManagementForm, password: e.target.value})}
                    placeholder="Senha do novo usuário"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <button
                  onClick={createUser}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Criar Usuário
                </button>
              </div>
            </div>

            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold mb-4">Usuários Cadastrados</h3>
              <div className="space-y-3">
                {users.map(user => (
                  <div key={user.username} className="flex justify-between items-center border rounded-lg p-4">
                    <div>
                      <h4 className="font-semibold">{user.name}</h4>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      {user.isAdmin && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">Admin</span>}
                    </div>
                    {user.username !== 'dperrut' && (
                      <button
                        onClick={() => deleteUser(user.username)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialControlSystem;