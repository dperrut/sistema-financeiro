import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Plus, Trash2, LogOut, Users, Lock, Eye, EyeOff } from 'lucide-react';

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
  
  // Formulários Internos
  const [userManagementForm, setUserManagementForm] = useState({
    username: '',
    name: '',
    email: '' 
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

  // --- Lógica de Login e Logout ---
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === loginForm.username && u.password === loginForm.password
    );
    if (user) {
      setCurrentUser(user);
      // Carregar dados específicos do usuário (simulado)
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
      alert(`[SIMULAÇÃO DE E-MAIL]\n\nPara: ${userFound.email}\nAssunto: Alteração de Senha\n\nOlá ${userFound.name},\nClique aqui para alterar sua senha: http://recuperar-senha/user=${userFound.username}`);
      setShowForgotPassword(false);
      setResetEmail('');
    } else {
      alert('Este e-mail não consta no nosso cadastro.');
    }
  };

  // --- Lógica de CRUD (Usuários) ---
  const createUser = () => {
    if (!userManagementForm.username || !userManagementForm.name || !userManagementForm.email) {
      alert('Preencha todos os campos!');
      return;
    }

    if (users.find(u => u.username === userManagementForm.username)) {
      alert('Este usuário já existe!');
      return;
    }

    const newUser = {
      username: userManagementForm.username,
      password: 'mudar321', // Senha Fixa
      name: userManagementForm.name,
      email: userManagementForm.email,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    setUserManagementForm({ username: '', name: '', email: '' });
    alert('Usuário criado! A senha padrão é: mudar321');
  };

  const deleteUser = (usernameToDelete) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      const updatedUsers = users.filter(u => u.username !== usernameToDelete);
      setUsers(updatedUsers);
      localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    }
  };

  const changePassword = () => {
    if (currentUser.password !== changePasswordForm.currentPassword) {
      alert('Senha atual incorreta!');
      return;
    }
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      alert('As novas senhas não conferem!');
      return;
    }
    
    const updatedUsers = users.map(u => {
      if (u.username === currentUser.username) {
        return { ...u, password: changePasswordForm.newPassword };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    setCurrentUser({ ...currentUser, password: changePasswordForm.newPassword });
    setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Senha alterada com sucesso!');
  };

  // --- Lógica Financeira ---
  const addTransaction = (type) => {
    const form = type === 'income' ? incomeForm : expenseForm;
    if (!form.description || !form.amount) {
      alert('Preencha descrição e valor!');
      return;
    }
    
    const newTransaction = {
      id: Date.now(),
      type: type === 'income' ? 'receita' : 'despesa',
      ...form,
      value: parseFloat(form.amount)
    };
    
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${currentUser.username}`, JSON.stringify(updatedTransactions));
    
    if (type === 'income') {
      setIncomeForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'Salário' });
    } else {
      setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: 'Alimentação', paymentMethod: 'PIX' });
    }
    alert(`${type === 'income' ? 'Receita' : 'Despesa'} adicionada!`);
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

  // Cálculos
  const totalIncome = transactions.filter(t => t.type === 'receita').reduce((acc, curr) => acc + curr.value, 0);
  const totalExpense = transactions.filter(t => t.type === 'despesa').reduce((acc, curr) => acc + curr.value, 0);
  const balance = totalIncome - totalExpense;

  // --- RENDERIZAÇÃO ---

  // Tela de Login / Recuperação
  if (!currentUser) {
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

  // Tela Principal (Logado)
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Finanças App</h1>
        <div className="flex-1 space-y-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'dashboard' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
            <TrendingUp size={20} /> <span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('transactions')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'transactions' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
            <DollarSign size={20} /> <span>Lançamentos</span>
          </button>
          <button onClick={() => setActiveTab('goals')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'goals' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
            <Target size={20} /> <span>Metas</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'settings' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
            <Lock size={20} /> <span>Alterar Senha</span>
          </button>
          {currentUser.isAdmin && (
            <button onClick={() => setActiveTab('admin')} className={`flex items-center space-x-2 w-full p-3 rounded ${activeTab === 'admin' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
              <Users size={20} /> <span>Administração</span>
            </button>
          )}
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-2 text-red-300 hover:text-red-100 mt-auto pt-4 border-t border-blue-800">
          <LogOut size={20} /> <span>Sair</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'dashboard' && 'Visão Geral'}
            {activeTab === 'transactions' && 'Lançamentos'}
            {activeTab === 'goals' && 'Metas Financeiras'}
            {activeTab === 'settings' && 'Segurança'}
            {activeTab === 'admin' && 'Administração do Sistema'}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Olá, <strong>{currentUser.name}</strong></span>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Receitas</p>
                    <p className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="text-green-500" size={32} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Despesas</p>
                    <p className="text-2xl font-bold text-red-600">R$ {totalExpense.toFixed(2)}</p>
                  </div>
                  <TrendingDown className="text-red-500" size={32} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Saldo Atual</p>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      R$ {balance.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="text-blue-500" size={32} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-green-600 flex items-center"><Plus size={20} className="mr-2"/> Nova Receita</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Descrição (ex: Salário)" className="w-full p-2 border rounded" value={incomeForm.description} onChange={e=>setIncomeForm({...incomeForm, description: e.target.value})} />
                  <input type="number" placeholder="Valor (R$)" className="w-full p-2 border rounded" value={incomeForm.amount} onChange={e=>setIncomeForm({...incomeForm, amount: e.target.value})} />
                  <input type="date" className="w-full p-2 border rounded" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm, date: e.target.value})} />
                  <button onClick={() => addTransaction('income')} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Adicionar Receita</button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center"><TrendingDown size={20} className="mr-2"/> Nova Despesa</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Descrição (ex: Supermercado)" className="w-full p-2 border rounded" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description: e.target.value})} />
                  <input type="number" placeholder="Valor (R$)" className="w-full p-2 border rounded" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount: e.target.value})} />
                  <select className="w-full p-2 border rounded" value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category: e.target.value})}>
                    <option>Alimentação</option><option>Transporte</option><option>Moradia</option><option>Lazer</option><option>Saúde</option><option>Outros</option>
                  </select>
                  <button onClick={() => addTransaction('expense')} className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700">Adicionar Despesa</button>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
              <h3 className="text-lg font-semibold mb-4">Últimos Lançamentos</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {transactions.slice().reverse().map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-gray-500">{t.date} • {t.type === 'receita' ? t.type : t.category}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'receita' ? '+' : '-'} R$ {t.value.toFixed(2)}
                      </span>
                      <button onClick={() => removeTransaction(t.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum lançamento ainda.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Nova Meta</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Nome da Meta" className="p-2 border rounded" value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name: e.target.value})} />
                <input type="number" placeholder="Valor Alvo (R$)" className="p-2 border rounded" value={goalForm.targetAmount} onChange={e=>setGoalForm({...goalForm, targetAmount: e.target.value})} />
                <input type="date" className="p-2 border rounded" value={goalForm.targetDate} onChange={e=>setGoalForm({...goalForm, targetDate: e.target.value})} />
                <button onClick={addGoal} className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Criar Meta</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map(g => (
                <div key={g.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                  <button onClick={() => deleteGoal(g.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                  <h4 className="font-bold text-lg mb-2">{g.name}</h4>
                  <p className="text-3xl font-bold text-purple-600 mb-2">R$ {parseFloat(g.targetAmount).toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mb-4">Alvo: {g.targetDate}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{width: '0%'}}></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">0% concluído</p>
                </div>
              ))}
            </div>
          </div>
        )}

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lado Esquerdo: Formulário de Criação */}
              <div>
                <h3 className="font-semibold mb-4">Novo Usuário</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    className="w-full p-2 border rounded"
                    value={userManagementForm.name}
                    onChange={(e) => setUserManagementForm({...userManagementForm, name: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Login (Usuário)"
                    className="w-full p-2 border rounded"
                    value={userManagementForm.username}
                    onChange={(e) => setUserManagementForm({...userManagementForm, username: e.target.value})}
                  />
                  <input
                    type="email"
                    placeholder="E-mail do Usuário"
                    className="w-full p-2 border rounded"
                    value={userManagementForm.email}
                    onChange={(e) => setUserManagementForm({...userManagementForm, email: e.target.value})}
                  />
                  <button onClick={createUser} className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700 font-medium">
                    Criar Usuário
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">Senha padrão será: <strong>mudar321</strong></p>
                </div>
              </div>

              {/* Lado Direito: Lista de Usuários */}
              <div>
                <h3 className="font-semibold mb-4">Usuários Existentes</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {users.map(u => (
                    <div key={u.username} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                      <div>
                        <p className="font-medium text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                      {u.username !== 'dperrut' && (
                        <button onClick={() => deleteUser(u.username)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors" title="Excluir Usuário">
                          <Trash2 size={18}/>
                        </button>
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