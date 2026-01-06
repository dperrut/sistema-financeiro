import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Target, Plus, Trash2, LogOut, 
  Users, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Calendar, 
  AlertTriangle, PieChart as PieIcon, Filter, Edit, XCircle, Calculator, 
  Tag, Wallet, Key, UserPlus, List, CheckCircle 
} from 'lucide-react';

export default function App() {
  // ==================================================================================
  // 1. ESTADOS GERAIS E DADOS
  // ==================================================================================
  const [currentUser, setCurrentUser] = useState(null);
  
  // Login e Recuperação
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Navegação
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // *** NOVO: Controle das Sub-abas de Configurações ***
  const [configSubTab, setConfigSubTab] = useState('users_list'); // 'users_list', 'categories', 'add_user'

  // Dados do Sistema (Banco de Dados Local)
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Categorias (Separadas)
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  // Estados Temporários (Inputs de Categoria)
  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');

  // Controle de Datas e Filtros
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chartFilter, setChartFilter] = useState('todos');
  const [editingId, setEditingId] = useState(null);
  
  // Modais
  const [withdrawModal, setWithdrawModal] = useState({ show: false, goalId: null, goalName: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });

  // ==================================================================================
  // 2. FORMULÁRIOS
  // ==================================================================================
  
  // Formulário de Usuário (Novo/Edição)
  const [userForm, setUserForm] = useState({
    id: null,
    name: '',
    username: '', 
    email: '', 
    role: 'user' // 'admin' ou 'user'
  });

  const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [incomeForm, setIncomeForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    description: '', 
    amount: '', 
    category: '' 
  });
  
  const [expenseForm, setExpenseForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    description: '', 
    amount: '', 
    category: '', 
    paymentMethod: 'Cartão de Crédito', 
    installments: '1' 
  });

  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '' });

  // Cores para Gráficos
  const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#84CC16', '#14B8A6'];

  // ==================================================================================
  // 3. INICIALIZAÇÃO DO SISTEMA
  // ==================================================================================
  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = () => {
    try {
      // 1. Carregar Usuários
      const usersResult = localStorage.getItem('system_users');
      if (usersResult) {
        setUsers(JSON.parse(usersResult));
      } else {
        // Usuário Padrão Inicial
        const defaultUsers = [{ 
          id: 1,
          username: 'dperrut', 
          password: 'admin1234', 
          name: 'Diego', 
          email: 'diego@exemplo.com', 
          role: 'admin'
        }];
        localStorage.setItem('system_users', JSON.stringify(defaultUsers));
        setUsers(defaultUsers);
      }
      
      // 2. Carregar Transações
      const savedTrans = localStorage.getItem('system_transactions');
      if (savedTrans) setTransactions(JSON.parse(savedTrans));
      
      // 3. Carregar Metas
      const savedGoals = localStorage.getItem('system_goals');
      if (savedGoals) setGoals(JSON.parse(savedGoals));

      // 4. Carregar Categorias de Despesa
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

      // 5. Carregar Categorias de Receita
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

    } catch (error) {
      console.error("Erro ao inicializar:", error);
    }
  };

  // ==================================================================================
  // 4. LÓGICA DE NEGÓCIO (CRUDs)
  // ==================================================================================

  // --- Login / Logout ---
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find((u) => u.username === loginForm.username && u.password === loginForm.password);
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

  const factoryReset = () => {
    if (window.confirm("ATENÇÃO: Isso apagará TODOS os dados, usuários e configurações. Tem certeza?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // --- Gestão de Usuários (NOVO) ---
  const handleSaveUser = () => {
    // Validação
    if (!userForm.name || !userForm.username || !userForm.email) {
        return alert('Por favor, preencha Nome, Apelido e E-mail.');
    }

    // Verificar duplicidade de login (apenas para novos)
    if (!userForm.id) {
        const exists = users.find(u => u.username === userForm.username);
        if (exists) return alert('Este Apelido (Login) já está em uso.');
    }

    let updatedUsers;
    
    if (userForm.id) {
        // Editar Existente
        updatedUsers = users.map(u => u.id === userForm.id ? { ...u, ...userForm } : u);
        
        // Se eu editei meu próprio nome, atualiza o estado atual visualmente
        if (currentUser && currentUser.id === userForm.id) {
            setCurrentUser({ ...currentUser, ...userForm });
        }
        alert('Usuário atualizado com sucesso!');
    } else {
        // Criar Novo
        const newUser = {
            id: Date.now(),
            name: userForm.name,
            username: userForm.username,
            email: userForm.email,
            role: userForm.role,
            password: 'mudar321' // Senha Padrão
        };
        updatedUsers = [...users, newUser];
        alert(`Usuário criado! Senha padrão: mudar321`);
    }

    setUsers(updatedUsers);
    localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    
    // Limpar e voltar para lista
    setUserForm({ id: null, name: '', username: '', email: '', role: 'user' });
    setConfigSubTab('users_list');
  };

  const handleEditUser = (user) => {
      setUserForm({
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role || 'user'
      });
      setConfigSubTab('add_user'); // Redireciona para o formulário
  };

  const handleDeleteUser = (userId) => {
      if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
          const updatedUsers = users.filter(u => u.id !== userId);
          setUsers(updatedUsers);
          localStorage.setItem('system_users', JSON.stringify(updatedUsers));
      }
  };

  const changePassword = () => {
     if (currentUser.password !== changePasswordForm.currentPassword) return alert('Senha atual incorreta!');
     if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) return alert('As novas senhas não conferem!');
     
     const updatedUsers = users.map(u => u.username === currentUser.username ? { ...u, password: changePasswordForm.newPassword } : u);
     setUsers(updatedUsers);
     localStorage.setItem('system_users', JSON.stringify(updatedUsers));
     setCurrentUser({...currentUser, password: changePasswordForm.newPassword});
     setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
     alert('Senha alterada com sucesso!');
  };

  // --- Filtros de Data ---
  const handlePrevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  const handleNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };
  const formatMonthYear = (date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // --- Filtro de Transações ---
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const filteredTransactions = safeTransactions.filter(t => {
    if (!t.date) return false;
    const [yearStr, monthStr] = t.date.split('-');
    return (parseInt(monthStr) - 1) === currentDate.getMonth() && parseInt(yearStr) === currentDate.getFullYear();
  });

  // --- Cálculos ---
  const monthlyIncome = filteredTransactions.filter(t => t.type === 'receita').reduce((acc, curr) => acc + Number(curr.value), 0);
  const monthlyExpense = filteredTransactions.filter(t => t.type === 'despesa').reduce((acc, curr) => acc + Number(curr.value), 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;
  const accumulatedBalance = safeTransactions.filter(t => t.type === 'receita').reduce((a,c)=>a+Number(c.value),0) - safeTransactions.filter(t => t.type === 'despesa').reduce((a,c)=>a+Number(c.value),0);

  // --- Categorias ---
  const addExpenseCategory = () => { if (!newExpenseCat || expenseCategories.includes(newExpenseCat)) return; const updated = [...expenseCategories, newExpenseCat]; setExpenseCategories(updated); localStorage.setItem('system_categories', JSON.stringify(updated)); setNewExpenseCat(''); };
  const removeExpenseCategory = (cat) => { if (window.confirm(`Excluir categoria "${cat}"?`)) { const updated = expenseCategories.filter(c => c !== cat); setExpenseCategories(updated); localStorage.setItem('system_categories', JSON.stringify(updated)); if (expenseForm.category === cat) setExpenseForm({...expenseForm, category: updated[0] || ''}); } };
  const addIncomeCategory = () => { if (!newIncomeCat || incomeCategories.includes(newIncomeCat)) return; const updated = [...incomeCategories, newIncomeCat]; setIncomeCategories(updated); localStorage.setItem('system_income_categories', JSON.stringify(updated)); setNewIncomeCat(''); };
  const removeIncomeCategory = (cat) => { if (window.confirm(`Excluir categoria "${cat}"?`)) { const updated = incomeCategories.filter(c => c !== cat); setIncomeCategories(updated); localStorage.setItem('system_income_categories', JSON.stringify(updated)); if (incomeForm.category === cat) setIncomeForm({...incomeForm, category: updated[0] || ''}); } };

  // --- CRUD Transações ---
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
    if (!form.description || !form.amount) return alert('Preencha os dados obrigatórios!');
    const val = parseFloat(form.amount.toString().replace(',', '.'));
    if (isNaN(val)) return alert("Valor inválido");

    if (editingId) {
       // Editar
       const updated = safeTransactions.map(t => t.id === editingId ? { ...t, ...form, value: val } : t);
       setTransactions(updated); localStorage.setItem('system_transactions', JSON.stringify(updated));
       cancelEditing();
       alert("Lançamento atualizado com sucesso!");
       return;
    }

    // Adicionar (Com Lógica de Parcelamento)
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
        setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: expenseCategories[0] || 'Outros', paymentMethod: 'Cartão de Crédito', installments: '1' });
        alert(`${total} parcelas geradas com sucesso!`);
    } else {
       // Adicionar (Simples)
       const newItem = { id: Date.now(), ...form, type: type === 'income' ? 'receita' : 'despesa', value: val, createdBy: currentUser.name };
       const updated = [...safeTransactions, newItem];
       setTransactions(updated); localStorage.setItem('system_transactions', JSON.stringify(updated));
       if (type === 'income') setIncomeForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: incomeCategories[0] || 'Salário' });
       else setExpenseForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: expenseCategories[0] || 'Outros', paymentMethod: 'Cartão de Crédito', installments: '1' });
       alert('Lançamento adicionado!');
    }
  };

  const removeTransaction = (id) => {
    if(window.confirm("Deseja realmente apagar este lançamento?")) {
      const updated = safeTransactions.filter(t => t.id !== id);
      setTransactions(updated); localStorage.setItem('system_transactions', JSON.stringify(updated));
      if (editingId === id) cancelEditing();
    }
  };

  // --- CRUD Metas ---
  const calculateSmartGoal = (tVal, cVal, tDate) => {
    const today = new Date(); const target = new Date(tDate);
    const remaining = Number(tVal) - (Number(cVal) || 0);
    let m = (target.getFullYear() - today.getFullYear()) * 12; m -= today.getMonth(); m += target.getMonth();
    if (remaining <= 0) return { status: 'concluido', text: 'Meta atingida! 🎉', monthly: 0 };
    if (m <= 0) return { status: 'atrasado', text: 'Prazo vencido! ⏰', monthly: remaining };
    return { status: 'pendente', m, monthly: remaining / m, text: `Faltam ${m} meses` };
  };

  const addGoal = () => { if (!goalForm.name || !goalForm.targetAmount) return; const updated = [...goals, { id: Date.now(), ...goalForm, currentAmount: 0, createdBy: currentUser.name }]; setGoals(updated); localStorage.setItem('system_goals', JSON.stringify(updated)); setGoalForm({ name: '', targetAmount: '', targetDate: '', description: '' }); };
  const deleteGoal = (id) => { if(window.confirm("Apagar meta?")) { const updated = goals.filter(g => g.id !== id); setGoals(updated); localStorage.setItem('system_goals', JSON.stringify(updated)); }};
  const addValueToGoal = (id, vStr) => { const val = parseFloat(vStr); if (!val) return; const updatedG = goals.map(g => g.id === id ? { ...g, currentAmount: (g.currentAmount || 0) + val } : g); const goal = goals.find(g => g.id === id); const t = { id: Date.now(), type: 'despesa', description: `Investimento: ${goal.name}`, amount: vStr, value: val, category: 'Investimento/Meta', date: new Date().toISOString().split('T')[0], createdBy: currentUser.name }; setGoals(updatedG); setTransactions([...safeTransactions, t]); localStorage.setItem('system_goals', JSON.stringify(updatedG)); localStorage.setItem('system_transactions', JSON.stringify([...safeTransactions, t])); alert("Investimento realizado!"); };
  const confirmWithdraw = (e) => { e.preventDefault(); const val = parseFloat(withdrawForm.amount); const updatedG = goals.map(g => g.id === withdrawModal.goalId ? { ...g, currentAmount: g.currentAmount - val } : g); const t = { id: Date.now(), type: 'receita', description: `Resgate: ${withdrawModal.goalName}`, amount: withdrawForm.amount, value: val, category: 'Resgate Meta', date: new Date().toISOString().split('T')[0], createdBy: currentUser.name }; setGoals(updatedG); setTransactions([...safeTransactions, t]); localStorage.setItem('system_goals', JSON.stringify(updatedG)); localStorage.setItem('system_transactions', JSON.stringify([...safeTransactions, t])); setWithdrawModal({ show: false, goalId: null, goalName: '' }); alert("Resgate realizado!"); };

  // ==================================================================================
  // 5. COMPONENTES VISUAIS (RENDER)
  // ==================================================================================

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
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center"><div><p className="text-gray-500 text-xs uppercase">Entrou</p><p className="text-xl font-bold text-green-600">R$ {monthlyIncome.toFixed(2)}</p></div><TrendingUp className="text-green-500 opacity-50" size={24} /></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex justify-between items-center"><div><p className="text-gray-500 text-xs uppercase">Saiu</p><p className="text-xl font-bold text-red-600">R$ {monthlyExpense.toFixed(2)}</p></div><TrendingDown className="text-red-500 opacity-50" size={24} /></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center"><div><p className="text-gray-500 text-xs uppercase">Balanço</p><p className={`text-xl font-bold ${monthlyBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {monthlyBalance.toFixed(2)}</p></div><Calendar className="text-blue-500 opacity-50" size={24} /></div>
      </div>
    </div>
  );

  const renderExpenseChart = () => {
    const expenses = filteredTransactions.filter(t => t.type === 'despesa' && (chartFilter === 'todos' || t.createdBy === chartFilter));
    if(!expenses.length) return <div className="text-center text-gray-400 py-10">Sem despesas para exibir neste filtro.</div>;
    const totals = expenses.reduce((acc,curr) => { acc[curr.category] = (acc[curr.category]||0)+curr.value; return acc; }, {});
    const total = Object.values(totals).reduce((a,b)=>a+b,0);
    const data = Object.keys(totals).map((k,i) => ({name:k, value:totals[k], percent: total > 0 ? (totals[k]/total)*100 : 0, color: COLORS[i%COLORS.length]})).sort((a,b)=>b.value-a.value);
    let deg = 0; const grad = data.map(i => { const s=deg; const e=deg+(i.percent*3.6); deg=e; return `${i.color} ${s}deg ${e}deg`; }).join(', ');
    
    return (
      <div className="flex flex-col md:flex-row items-center justify-around h-64 md:h-auto">
        <div className="relative w-48 h-48 rounded-full shadow-lg mb-6 md:mb-0" style={{ background: `conic-gradient(${grad || '#eee 0deg 360deg'})` }}>
           <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
             <div className="text-center"><p className="text-xs text-gray-500">Total ({chartFilter})</p><p className="font-bold text-gray-800">R$ {total.toFixed(0)}</p></div>
           </div>
        </div>
        <div className="space-y-2 w-full md:w-auto overflow-y-auto max-h-48">
          {data.map(i => (
            <div key={i.name} className="flex items-center justify-between min-w-[200px] text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{background:i.color}}></div><span className="text-gray-700">{i.name}</span></div>
              <div className="flex gap-4"><span className="font-semibold">R$ {i.value.toFixed(2)}</span><span className="text-gray-400 text-xs w-8 text-right">{i.percent.toFixed(0)}%</span></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- TELA DE LOGIN ---
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
          <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">Minhas Finanças</h1>
          <p className="text-center text-gray-500 mb-8 text-sm">Controle inteligente para sua família.</p>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Login</label>
                <input className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50" placeholder="ex: dperrut" value={loginForm.username} onChange={e=>setLoginForm({...loginForm, username:e.target.value})}/>
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
      {/* MENU LATERAL */}
      <div className="w-64 bg-blue-900 text-white p-6 hidden md:flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Finanças</h1>
        <div className="flex-1 space-y-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 w-full p-3 rounded transition-colors ${activeTab === 'dashboard' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><TrendingUp size={20}/> <span>Dashboard</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex items-center gap-2 w-full p-3 rounded transition-colors ${activeTab === 'transactions' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><DollarSign size={20}/> <span>Lançamentos</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex items-center gap-2 w-full p-3 rounded transition-colors ${activeTab === 'goals' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><Target size={20}/> <span>Metas</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 w-full p-3 rounded transition-colors ${activeTab === 'settings' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}><Lock size={20}/> <span>Configurações</span></button>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 mt-auto pt-4 border-t border-blue-800 hover:text-white transition-colors"><LogOut size={20}/> <span>Sair</span></button>
      </div>

      {/* MENU MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50 shadow-lg">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-500'}`}><TrendingUp size={24}/><span className="text-[10px]">Visão</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center ${activeTab === 'transactions' ? 'text-blue-600' : 'text-gray-500'}`}><DollarSign size={24}/><span className="text-[10px]">Lançar</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center ${activeTab === 'goals' ? 'text-blue-600' : 'text-gray-500'}`}><Target size={24}/><span className="text-[10px]">Metas</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-500'}`}><Lock size={24}/><span className="text-[10px]">Config</span></button>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 flex flex-col overflow-hidden mb-16 md:mb-0">
        <header className="bg-white shadow p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold hidden md:block text-gray-800">
            {activeTab === 'dashboard' && 'Visão Geral'}
            {activeTab === 'transactions' && 'Fluxo de Caixa'}
            {activeTab === 'goals' && 'Metas Financeiras'}
            {activeTab === 'settings' && 'Configurações do Sistema'}
          </h2>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-gray-700">Olá, <strong>{currentUser.name}</strong></span>
            <button onClick={handleLogout} className="md:hidden text-red-500"><LogOut size={20}/></button>
          </div>
        </header>

        {(activeTab === 'dashboard' || activeTab === 'transactions') && (
          <div className="bg-blue-50 p-2 flex justify-center items-center shadow-inner">
             <button onClick={handlePrevMonth} className="p-1 bg-white rounded-full shadow hover:bg-gray-100 text-blue-800"><ChevronLeft size={20}/></button>
             <span className="mx-4 font-bold text-blue-900 capitalize text-lg">{formatMonthYear(currentDate)}</span>
             <button onClick={handleNextMonth} className="p-1 bg-white rounded-full shadow hover:bg-gray-100 text-blue-800"><ChevronRight size={20}/></button>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 md:p-8">
           
           {/* --- DASHBOARD (RESTAURADO) --- */}
           {activeTab === 'dashboard' && (
               <div className="space-y-6">
                   {renderSummaryCards()}
                   <div className="bg-white p-6 rounded-xl shadow-sm">
                       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                           <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2"><PieIcon size={20}/> Despesas por Categoria</h3>
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

           {/* --- LANÇAMENTOS (RESTAURADO) --- */}
           {activeTab === 'transactions' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 {/* No Desktop, mostra os cards pequenos aqui também */}
                 <div className="hidden md:block">{renderSummaryCards()}</div>
                 
                 {/* Form Receita */}
                 <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                    <h3 className="font-bold text-green-700 mb-4 flex items-center"><Plus size={20} className="mr-2"/> Nova Receita</h3>
                    <div className="space-y-3">
                        <input className="w-full p-2 border rounded" placeholder="Descrição" value={incomeForm.description} onChange={e=>setIncomeForm({...incomeForm, description:e.target.value})}/>
                        <input className="w-full p-2 border rounded" type="number" placeholder="Valor (R$)" value={incomeForm.amount} onChange={e=>setIncomeForm({...incomeForm, amount:e.target.value})}/>
                        <select className="w-full p-2 border rounded bg-white" value={incomeForm.category} onChange={e=>setIncomeForm({...incomeForm, category:e.target.value})}>
                            <option value="" disabled>Selecione uma Categoria</option>
                            {incomeCategories.map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                        <input className="w-full p-2 border rounded" type="date" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm, date:e.target.value})}/>
                        <button onClick={()=>addTransaction('income')} className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded font-bold transition-colors">Adicionar Receita</button>
                    </div>
                 </div>
                 
                 {/* Form Despesa */}
                 <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
                    <h3 className="font-bold text-red-700 mb-4 flex items-center"><TrendingDown size={20} className="mr-2"/> Nova Despesa</h3>
                    <div className="space-y-3">
                        <input className="w-full p-2 border rounded" placeholder="Descrição (Ex: Celular)" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description:e.target.value})}/>
                        <div className="flex gap-2">
                           <input className="w-2/3 p-2 border rounded font-bold" type="number" placeholder="Valor Total" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount:e.target.value})}/>
                           <div className="w-1/3 relative">
                              <input type="number" min="1" max="60" className="w-full p-2 border rounded text-center text-blue-600 font-bold" value={expenseForm.installments} onChange={e=>setExpenseForm({...expenseForm, installments:e.target.value})}/>
                              <span className="absolute right-2 top-2 text-xs text-gray-400 font-bold pointer-events-none">x</span>
                           </div>
                        </div>
                        <select className="w-full p-2 border rounded bg-white" value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category:e.target.value})}>
                            <option value="" disabled>Selecione uma Categoria</option>
                            {expenseCategories.map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                        <select className="w-full p-2 border rounded bg-white" value={expenseForm.paymentMethod} onChange={e=>setExpenseForm({...expenseForm, paymentMethod:e.target.value})}>
                            <option>Cartão de Crédito</option><option>PIX</option><option>Dinheiro</option><option>Compra Parcelada</option>
                        </select>
                        <button onClick={()=>addTransaction('expense')} className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded font-bold transition-colors">Adicionar Despesa</button>
                    </div>
                 </div>
               </div>
               
               {/* Lista de Transações */}
               <div className="bg-white p-4 rounded-xl shadow-sm h-fit max-h-[600px] overflow-y-auto">
                  <h3 className="font-bold mb-4 flex justify-between items-center text-gray-700">
                    Extrato
                    <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded text-gray-500">{formatMonthYear(currentDate)}</span>
                  </h3>
                  {filteredTransactions.slice().reverse().map(t => (
                     <div key={t.id} className={`flex justify-between items-center border-b p-3 transition-colors hover:bg-gray-50 ${editingId === t.id ? 'bg-orange-50 border-orange-200' : ''}`}>
                        <div className="overflow-hidden">
                           <p className="font-bold truncate pr-2 text-gray-800">
                              {t.description} {editingId === t.id && <span className="text-orange-500 text-xs font-bold">(Editando...)</span>}
                           </p>
                           <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              {t.date.split('-').reverse().join('/')} • <span className="bg-gray-100 px-1 rounded">{t.category || 'Geral'}</span> • <span className="font-semibold text-gray-600">{t.createdBy || 'Sistema'}</span>
                           </p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`font-bold whitespace-nowrap ${t.type==='receita'?'text-green-600':'text-red-600'}`}>
                             {t.type==='receita'?'+':'-'} R$ {Number(t.value).toFixed(2)}
                           </span>
                           <button onClick={()=>startEditing(t)} className="text-blue-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors" title="Editar"><Edit size={16}/></button>
                           <button onClick={()=>removeTransaction(t.id)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors" title="Excluir"><Trash2 size={16}/></button>
                        </div>
                     </div>
                  ))}
                  {filteredTransactions.length === 0 && <div className="text-center text-gray-400 py-10 flex flex-col items-center"><List size={40} className="mb-2 opacity-20"/><p>Nenhum lançamento neste mês.</p></div>}
               </div>
             </div>
           )}

           {/* --- METAS (RESTAURADO EFEITO 3D) --- */}
           {activeTab === 'goals' && (
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold mb-4 text-purple-700 flex items-center gap-2"><Target size={20}/> Criar Nova Meta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input className="border p-2 rounded" placeholder="Nome (Ex: Viagem)" value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name:e.target.value})}/>
                      <input className="border p-2 rounded" placeholder="Valor Alvo (R$)" type="number" value={goalForm.targetAmount} onChange={e=>setGoalForm({...goalForm, targetAmount:e.target.value})}/>
                      <input className="border p-2 rounded" type="date" value={goalForm.targetDate} onChange={e=>setGoalForm({...goalForm, targetDate:e.target.value})}/>
                      <button onClick={addGoal} className="bg-purple-600 hover:bg-purple-700 text-white rounded font-bold transition-colors">Criar Meta</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(g => {
                      const info = calculateSmartGoal(g.targetAmount, g.currentAmount, g.targetDate);
                      const progress = Math.min(100, ((g.currentAmount||0)/g.targetAmount)*100);
                      return (
                        <div key={g.id} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 relative group transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-300">
                           <button onClick={()=>deleteGoal(g.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                           
                           <h4 className="font-bold text-lg text-gray-800 mb-1">{g.name}</h4>
                           <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">Criado por: {g.createdBy}</p>
                           
                           <div className="bg-purple-50 p-3 rounded-lg mb-4 border border-purple-100">
                               <div className="flex items-center gap-2 mb-1"><Calculator size={14} className="text-purple-600"/><span className="text-[10px] font-bold text-purple-700 uppercase">Planejamento</span></div>
                               <p className="text-sm text-gray-700">{info.text}</p>
                               {info.status === 'pendente' && <p className="text-sm font-bold text-purple-600 mt-1">Guardar R$ {info.monthly.toFixed(2)}/mês</p>}
                           </div>

                           <div className="flex justify-between items-end mb-2">
                               <span className="text-xl font-bold text-gray-700">R$ {(g.currentAmount||0).toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ {g.targetAmount}</span></span>
                               <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{progress.toFixed(0)}%</span>
                           </div>
                           <div className="w-full bg-gray-200 h-2 rounded-full mb-6 overflow-hidden">
                               <div className="bg-purple-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{width: `${progress}%`}}></div>
                           </div>
                           
                           <div className="flex gap-2 border-t pt-4">
                              <button onClick={()=>{const v=prompt('Valor a investir:'); addValueToGoal(g.id, v)}} className="flex-1 bg-green-100 text-green-700 text-xs py-2 rounded-lg font-bold hover:bg-green-200 transition-colors">Investir</button>
                              <button onClick={()=>{setWithdrawModal({show:true, goalId:g.id, goalName:g.name})}} className="flex-1 bg-red-100 text-red-700 text-xs py-2 rounded-lg font-bold hover:bg-red-200 transition-colors">Resgatar</button>
                           </div>
                        </div>
                      )
                    })}
                </div>
                {/* Modal de Saque */}
                {withdrawModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
                            <h3 className="text-xl font-bold text-red-600 mb-4">Resgatar da Meta</h3>
                            <p className="text-sm text-gray-600 mb-4">Você está retirando dinheiro de: <strong>{withdrawModal.goalName}</strong></p>
                            <form onSubmit={confirmWithdraw}>
                                <input type="number" step="0.01" onWheel={blockWheel} className="w-full p-3 border rounded-lg mb-4 text-lg font-bold" placeholder="R$ 0,00" value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} autoFocus />
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setWithdrawModal({ show: false, goalId: null, goalName: '' })} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold">Cancelar</button>
                                    <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold">Confirmar Saque</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
             </div>
           )}

           {/* --- CONFIGURAÇÕES (CORRIGIDO PARA PERMITIR EDIÇÃO) --- */}
           {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-6">
                 
                 {/* MENU DE NAVEGAÇÃO INTERNA */}
                 <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
                    <button onClick={()=>setConfigSubTab('users_list')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${configSubTab==='users_list' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                        <Users size={18}/> Quem usa este App
                    </button>
                    
                    <button onClick={()=>setConfigSubTab('categories')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${configSubTab==='categories' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                        <List size={18}/> Categorias
                    </button>

                    {/* Botão Novo Usuário */}
                    {(currentUser.role === 'admin' || configSubTab === 'add_user') && (
                        <button 
                            onClick={() => { 
                                setUserForm({ id: null, name: '', username: '', email: '', role: 'user' }); 
                                setConfigSubTab('add_user'); 
                            }} 
                            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${configSubTab==='add_user' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-50'} ${currentUser.role !== 'admin' && configSubTab !== 'add_user' ? 'hidden' : ''}`}
                        >
                            <UserPlus size={18}/> {userForm.id ? 'Editando Usuário' : 'Cadastrar Usuário'}
                        </button>
                    )}
                 </div>

                 {/* 1. LISTA DE USUÁRIOS */}
                 {configSubTab === 'users_list' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2"><Users size={20}/> Usuários Cadastrados</h3>
                        <div className="space-y-3">
                            {users.map(u => (
                                <div key={u.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shadow-sm">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">{u.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">
                                                @{u.username} • 
                                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'}`}>
                                                    {u.role === 'admin' ? 'Administrador' : 'Usuário Padrão'}
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Botões de Ação - AGORA SEMPRE VISÍVEIS PARA O PRÓPRIO USUÁRIO */}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEditUser(u)} 
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold shadow-md"
                                            title="Clique aqui para editar seus dados"
                                        >
                                            <Edit size={16}/> Editar
                                        </button>

                                        {/* Excluir (Só Admin pode ver o botão de excluir OUTROS) */}
                                        {currentUser.role === 'admin' && u.id !== currentUser.id && (
                                            <button 
                                                onClick={() => handleDeleteUser(u.id)} 
                                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={20}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}

                 {/* 2. CATEGORIAS */}
                 {configSubTab === 'categories' && (
                    <div className="space-y-6">
                        {/* Despesas */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-red-700"><Tag size={20}/> Categorias de Despesa</h3>
                            <div className="flex gap-2 mb-6">
                                <input className="flex-1 border p-2 rounded-lg" placeholder="Nova Categoria" value={newExpenseCat} onChange={e=>setNewExpenseCat(e.target.value)}/>
                                <button onClick={addExpenseCategory} className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-lg font-bold transition-colors">Adicionar</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {expenseCategories.map(c => (
                                    <span key={c} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2 text-gray-700 shadow-sm">
                                        {c} <button onClick={()=>removeExpenseCategory(c)} className="text-red-300 hover:text-red-600 font-bold ml-1 transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* Receitas */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-green-700"><Wallet size={20}/> Categorias de Receita</h3>
                            <div className="flex gap-2 mb-6">
                                <input className="flex-1 border p-2 rounded-lg" placeholder="Nova Categoria" value={newIncomeCat} onChange={e=>setNewIncomeCat(e.target.value)}/>
                                <button onClick={addIncomeCategory} className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-lg font-bold transition-colors">Adicionar</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {incomeCategories.map(c => (
                                    <span key={c} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2 text-gray-700 shadow-sm">
                                        {c} <button onClick={()=>removeIncomeCategory(c)} className="text-red-300 hover:text-red-600 font-bold ml-1 transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                 )}

                 {/* 3. CADASTRO / EDIÇÃO DE USUÁRIO */}
                 {configSubTab === 'add_user' && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-2">
                            {userForm.id ? <Edit size={24} className="text-blue-600"/> : <UserPlus size={24} className="text-blue-600"/>}
                            {userForm.id ? 'Editando Usuário' : 'Novo Cadastro'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                                <input 
                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                    placeholder="Ex: Diego Perrut" 
                                    value={userForm.name} 
                                    onChange={e=>setUserForm({...userForm, name:e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Apelido (Login)</label>
                                <input 
                                    className={`w-full border p-3 rounded-lg outline-none transition-all ${userForm.id ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-blue-500'}`}
                                    placeholder="Ex: dperrut" 
                                    value={userForm.username} 
                                    onChange={e=>setUserForm({...userForm, username:e.target.value})}
                                    disabled={userForm.id !== null} // <--- A CORREÇÃO ESTÁ AQUI (Só trava se tiver ID)
                                />
                                {/* Mensagem de ajuda condicional */}
                                {userForm.id ? (
                                    <p className="text-[10px] text-gray-400 mt-1">O login não pode ser alterado após criado.</p>
                                ) : (
                                    <p className="text-[10px] text-blue-400 mt-1">Crie um login único para acesso.</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                                <input 
                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                    value={userForm.email} 
                                    onChange={e=>setUserForm({...userForm, email:e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nível de Acesso (Cargo)</label>
                                <select 
                                    className="w-full border p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer border-blue-200" 
                                    value={userForm.role} 
                                    onChange={e=>setUserForm({...userForm, role:e.target.value})}
                                >
                                    <option value="user">Usuário Comum</option>
                                    <option value="admin">Administrador</option>
                                </select>
                                <p className="text-[10px] text-blue-500 mt-1 font-bold">⚠️ Selecione "Administrador" para ter acesso total.</p>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button onClick={() => setConfigSubTab('users_list')} className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg font-bold">Cancelar</button>
                            <button onClick={handleSaveUser} className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold shadow-md flex items-center gap-2">
                                <CheckCircle size={18}/> Salvar Alterações
                            </button>
                        </div>
                    </div>
                 )}

                 {/* Alterar Senha */}
                 <div className="bg-white p-6 rounded-xl shadow-sm mt-8 border-t-4 border-gray-300">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700"><Key size={20}/> Alterar Minha Senha</h3>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input className="border p-2 rounded-lg flex-1" type="password" placeholder="Senha Atual" value={changePasswordForm.currentPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, currentPassword:e.target.value})}/>
                        <input className="border p-2 rounded-lg flex-1" type="password" placeholder="Nova Senha" value={changePasswordForm.newPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, newPassword:e.target.value})}/>
                        <input className="border p-2 rounded-lg flex-1" type="password" placeholder="Confirmar Nova" value={changePasswordForm.confirmPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, confirmPassword:e.target.value})}/>
                        <button onClick={changePassword} className="bg-gray-800 text-white px-6 rounded-lg font-bold hover:bg-black transition-colors">Atualizar</button>
                    </div>
                 </div>

                 {/* Reset */}
                 {currentUser.role === 'admin' && (
                    <div className="mt-12 pt-8 border-t border-gray-200 text-center opacity-60 hover:opacity-100 transition-opacity">
                        <button onClick={factoryReset} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center justify-center gap-2 mx-auto border border-red-200 px-4 py-2 rounded">
                            <AlertTriangle size={16}/> Resetar Sistema
                        </button>
                    </div>
                 )}
              </div>
           )}
        </div>
      </div>
    </div>
  );
}