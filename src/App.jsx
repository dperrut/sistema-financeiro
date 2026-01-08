import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Target, Plus, Trash2, LogOut, 
  Users, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Calendar, 
  AlertTriangle, PieChart as PieIcon, Filter, Edit, XCircle, Calculator, 
  Tag, Wallet, Key, UserPlus, List, CheckCircle, Briefcase, Landmark,
  Download, Upload, CalendarClock 
} from 'lucide-react';

// --- IMPORTAÇÕES DO FIREBASE ---
import { auth, db } from './firebase'; // Conecta com o arquivo que criamos
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    updatePassword
} from 'firebase/auth';
import { 
    ref, 
    set, 
    push, 
    remove, 
    onValue, 
    update 
} from 'firebase/database';

export default function App() {
  // ==================================================================================
  // 1. ESTADOS GERAIS
  // ==================================================================================
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Para mostrar "Carregando..."
  
  // Login e Cadastro
  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'register'
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Navegação
  const [activeTab, setActiveTab] = useState('dashboard');
  const [configSubTab, setConfigSubTab] = useState('categories'); 

  // Dados do Sistema (Vindos da Nuvem)
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  
  // --- Despesas Fixas ---
  const [fixedExpenses, setFixedExpenses] = useState([]); 
  const [showFixedPanel, setShowFixedPanel] = useState(false);

  // Categorias
  const [expenseCategories, setExpenseCategories] = useState(['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros']);
  const [incomeCategories, setIncomeCategories] = useState(['Salário', 'Extra', 'Investimento', 'Presente', 'Outros']);

  // Inputs Temporários
  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');

  // Controle de Datas e Filtros
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  
  // Modais
  const [withdrawModal, setWithdrawModal] = useState({ show: false, type: '', id: null, name: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });

  // Helpers
  const formatMonthYear = (date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // ==================================================================================
  // 2. CONEXÃO COM A NUVEM (O Grande Segredo)
  // ==================================================================================
  
  // A. Monitorar se o usuário está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário logou! Vamos buscar os dados dele.
            setCurrentUser({
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'Usuário'
            });
            listenToUserData(user.uid);
        } else {
            // Usuário saiu
            setCurrentUser(null);
            setTransactions([]);
            setGoals([]);
            setInvestments([]);
            setFixedExpenses([]);
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // B. "Escutar" o Banco de Dados em Tempo Real
  const listenToUserData = (uid) => {
      // Onde os dados moram: users/ID_DO_USUARIO/
      const userRef = ref(db, `users/${uid}`);
      
      onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
              // Transforma objetos do Firebase em Arrays para o nosso código
              if (data.transactions) setTransactions(Object.values(data.transactions));
              else setTransactions([]);

              if (data.goals) setGoals(Object.values(data.goals));
              else setGoals([]);

              if (data.investments) setInvestments(Object.values(data.investments));
              else setInvestments([]);

              if (data.fixedExpenses) setFixedExpenses(Object.values(data.fixedExpenses));
              else setFixedExpenses([]);

              if (data.expenseCategories) setExpenseCategories(data.expenseCategories);
              if (data.incomeCategories) setIncomeCategories(data.incomeCategories);
          }
      });
  };

  // C. Robô de Automação (Agora olhando para dados da nuvem)
  useEffect(() => {
    if (!currentUser || fixedExpenses.length === 0) return;

    fixedExpenses.forEach(fixa => {
        if (!fixa.active) return;

        // Verifica se já existe lançamento neste mês
        const alreadyExists = transactions.some(t => {
            if (!t.date) return false;
            const [y, m] = t.date.split('-').map(Number);
            return (m - 1) === currentDate.getMonth() && 
                   y === currentDate.getFullYear() &&
                   t.description.includes(fixa.description) &&
                   t.paymentMethod === 'Automático';
        });

        if (!alreadyExists) {
            // Lança na Nuvem
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(fixa.day));
            const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            
            const newTrans = {
                id: Date.now() + Math.random(),
                type: 'despesa',
                description: `${fixa.description} (Auto)`,
                amount: fixa.amount,
                value: parseFloat(fixa.amount),
                category: fixa.category,
                date: dateStr,
                createdBy: 'Robô',
                paymentMethod: 'Automático'
            };
            
            // Salva direto no Firebase
            const transRef = ref(db, `users/${currentUser.uid}/transactions/${newTrans.id.toString().replace('.','')}`);
            set(transRef, newTrans);
        }
    });
  }, [currentDate, fixedExpenses, transactions, currentUser]);


  // ==================================================================================
  // 3. FORMULÁRIOS E ESTADOS VISUAIS
  // ==================================================================================
  
  const [changePasswordForm, setChangePasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [incomeForm, setIncomeForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: '' });
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: '', paymentMethod: 'Cartão de Crédito', installments: '1' });
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '' });
  const [investmentForm, setInvestmentForm] = useState({ name: '', type: 'Renda Fixa', currentAmount: '' });
  const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#84CC16', '#14B8A6'];


  // ==================================================================================
  // 4. LÓGICA DE AÇÃO (CRUDs - AGORA NA NUVEM)
  // ==================================================================================

  // --- Auth ---
  const handleAuth = async (e) => {
      e.preventDefault();
      try {
          if (authMode === 'login') {
              await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
          } else {
              // Registro (Novo Usuário)
              const userCred = await createUserWithEmailAndPassword(auth, loginForm.email, loginForm.password);
              await updateProfile(userCred.user, { displayName: loginForm.name });
              // Cria dados iniciais na nuvem
              set(ref(db, `users/${userCred.user.uid}/expenseCategories`), expenseCategories);
              set(ref(db, `users/${userCred.user.uid}/incomeCategories`), incomeCategories);
          }
      } catch (error) {
          alert("Erro: " + error.message);
      }
  };

  const handleLogout = () => {
      signOut(auth);
  };

  const handleChangePassword = async () => {
      if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) return alert("Senhas não conferem");
      try {
          await updatePassword(currentUser, changePasswordForm.newPassword);
          alert("Senha alterada! Faça login novamente.");
          handleLogout();
      } catch (error) {
          alert("Erro (Talvez precise relogar): " + error.message);
      }
  };


  // --- Transações ---
  const addTransaction = (type) => {
    const form = type === 'income' ? incomeForm : expenseForm;
    if (!form.description || !form.amount) return alert('Preencha os dados!');
    const val = parseFloat(form.amount.toString().replace(',', '.'));
    if (isNaN(val)) return alert("Valor inválido");

    const uid = currentUser.uid;
    const isExpense = type === 'expense' || type === 'despesa';

    // Edição
    if (editingId) {
       const transRef = ref(db, `users/${uid}/transactions/${editingId}`);
       // Preserva ID original, atualiza campos
       const original = transactions.find(t => t.id === editingId);
       update(transRef, { ...original, ...form, value: val }).then(() => {
           setEditingId(null);
           alert("Atualizado!");
       });
       return;
    }

    // Parcelas
    if (isExpense && form.installments && parseInt(form.installments) > 1) {
        const total = parseInt(form.installments);
        const parcVal = val / total;
        const [y, m, d] = form.date.split('-').map(Number);
        
        for (let i = 0; i < total; i++) {
            const dt = new Date(y, (m - 1) + i, d);
            const dateStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
            const id = Date.now() + i;
            set(ref(db, `users/${uid}/transactions/${id}`), {
                id: id, ...form, type: 'despesa',
                description: `${form.description} (${i+1}/${total})`,
                amount: parcVal.toFixed(2), value: parcVal, date: dateStr, createdBy: currentUser.name
            });
        }
        alert("Parcelas geradas!");
    } else {
       // Lançamento Único
       const id = Date.now();
       const newTrans = { id, ...form, type: type === 'income' ? 'receita' : 'despesa', value: val, createdBy: currentUser.name };
       set(ref(db, `users/${uid}/transactions/${id}`), newTrans);
       alert("Salvo na nuvem!");
    }
    
    // Reset forms
    if(type==='income') setIncomeForm({ ...incomeForm, description:'', amount:'' });
    else setExpenseForm({ ...expenseForm, description:'', amount:'' });
  };

  const removeTransaction = (id) => {
    if(window.confirm("Apagar?")) {
        remove(ref(db, `users/${currentUser.uid}/transactions/${id}`));
    }
  };

  const startEditing = (t) => {
    setEditingId(t.id); // No firebase o ID é a chave
    if (t.type === 'receita') setIncomeForm({ date: t.date, description: t.description, amount: t.value.toFixed(2), category: t.category });
    else setExpenseForm({ date: t.date, description: t.description, amount: t.value.toFixed(2), category: t.category, paymentMethod: t.paymentMethod, installments: '1' });
    window.scrollTo(0,0);
  };


  // --- Metas / Investimentos ---
  const addGoal = () => { 
      if (!goalForm.name) return;
      const id = Date.now();
      set(ref(db, `users/${currentUser.uid}/goals/${id}`), { id, ...goalForm, currentAmount: 0, createdBy: currentUser.name });
      setGoalForm({ name: '', targetAmount: '', targetDate: '', description: '' });
  };
  const deleteGoal = (id) => remove(ref(db, `users/${currentUser.uid}/goals/${id}`));

  const addInvestment = () => {
      if (!investmentForm.name) return;
      const startVal = parseFloat(investmentForm.currentAmount) || 0;
      const id = Date.now();
      
      const newInv = { id, name: investmentForm.name, type: investmentForm.type, currentAmount: startVal, createdBy: currentUser.name };
      set(ref(db, `users/${currentUser.uid}/investments/${id}`), newInv);

      if (startVal > 0) {
          const tId = Date.now() + 1;
          set(ref(db, `users/${currentUser.uid}/transactions/${tId}`), {
              id: tId, type: 'despesa', description: `Aporte Inicial: ${newInv.name}`,
              amount: startVal.toFixed(2), value: startVal, category: 'Investimento/Aporte',
              date: new Date().toISOString().split('T')[0], createdBy: currentUser.name
          });
      }
      setInvestmentForm({ name: '', type: 'Renda Fixa', currentAmount: '' });
  };
  const deleteInvestment = (id) => remove(ref(db, `users/${currentUser.uid}/investments/${id}`));


  // --- Aportes e Resgates ---
  const addValueToTarget = (type, id, vStr) => { 
      const val = parseFloat(vStr); if (!val) return;
      const path = type === 'goal' ? 'goals' : 'investments';
      
      // Busca item atual
      const item = (type === 'goal' ? goals : investments).find(i => i.id === id);
      if(!item) return;

      // Atualiza valor no objeto
      update(ref(db, `users/${currentUser.uid}/${path}/${id}`), { currentAmount: (item.currentAmount || 0) + val });

      // Cria transação
      const tId = Date.now();
      set(ref(db, `users/${currentUser.uid}/transactions/${tId}`), {
          id: tId, type: 'despesa', description: `Aporte: ${item.name}`,
          amount: vStr, value: val, category: 'Investimento/Aporte',
          date: new Date().toISOString().split('T')[0], createdBy: currentUser.name
      });
  };

  const confirmWithdraw = (e) => {
      e.preventDefault();
      const val = parseFloat(withdrawForm.amount);
      const { type, id, name } = withdrawModal;
      const path = type === 'goal' ? 'goals' : 'investments';
      const item = (type === 'goal' ? goals : investments).find(i => i.id === id);

      update(ref(db, `users/${currentUser.uid}/${path}/${id}`), { currentAmount: (item.currentAmount || 0) - val });

      const tId = Date.now();
      set(ref(db, `users/${currentUser.uid}/transactions/${tId}`), {
          id: tId, type: 'receita', description: `Resgate: ${name}`,
          amount: withdrawForm.amount, value: val, category: 'Resgate',
          date: new Date().toISOString().split('T')[0], createdBy: currentUser.name
      });

      setWithdrawModal({ show:false, type:'', id:null, name:'' });
      setWithdrawForm({ amount: '', reason: '' });
  };


  // --- Fixas e Categorias ---
  const saveFixedExpense = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const id = Date.now();
      const newFixa = { id, description: fd.get('desc'), amount: fd.get('amount'), day: fd.get('day'), category: fd.get('cat'), active: true };
      set(ref(db, `users/${currentUser.uid}/fixedExpenses/${id}`), newFixa);
      e.target.reset();
  };
  const toggleFixedActive = (f) => update(ref(db, `users/${currentUser.uid}/fixedExpenses/${f.id}`), { active: !f.active });
  const deleteFixedExpense = (id) => remove(ref(db, `users/${currentUser.uid}/fixedExpenses/${id}`));

  const addCat = (list, setList, val, type) => {
      if(!val) return;
      const updated = [...list, val];
      setList(updated);
      set(ref(db, `users/${currentUser.uid}/${type}`), updated);
  };
  
  // --- IMPORTAÇÃO DE BACKUP (JSON -> FIREBASE) ---
  const importDataToFirebase = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target.result);
              if (!data.transactions) throw new Error('Arquivo inválido.');
              
              if(window.confirm('Isso vai enviar seus dados antigos para a nuvem. Continuar?')) {
                  // Mapeia os dados do JSON antigo para o formato do Firebase
                  // (Transforma Array em Objeto indexado por ID para o Firebase gostar)
                  const updates = {};
                  
                  if (data.transactions) {
                      data.transactions.forEach(t => updates[`transactions/${t.id}`] = t);
                  }
                  if (data.goals) {
                      data.goals.forEach(g => updates[`goals/${g.id}`] = g);
                  }
                  if (data.investments) {
                      data.investments.forEach(i => updates[`investments/${i.id}`] = i);
                  }
                  if (data.fixedExpenses) {
                      data.fixedExpenses.forEach(f => updates[`fixedExpenses/${f.id}`] = f);
                  }
                  
                  // Envia tudo de uma vez
                  update(ref(db, `users/${currentUser.uid}`), updates)
                    .then(() => alert("Dados migrados para a nuvem com sucesso!"))
                    .catch(err => alert("Erro no envio: " + err.message));
              }
          } catch (err) {
              alert('Erro ao ler arquivo: ' + err.message);
          }
      };
      reader.readAsText(file);
  };
  
  // Função auxiliar de data
  const calculateSmartGoal = (tVal, cVal, tDate) => {
    const today = new Date(); const target = new Date(tDate);
    const remaining = Number(tVal) - (Number(cVal) || 0);
    let m = (target.getFullYear() - today.getFullYear()) * 12; m -= today.getMonth(); m += target.getMonth();
    if (remaining <= 0) return { status: 'concluido', text: 'Meta atingida! 🎉', monthly: 0 };
    if (m <= 0) return { status: 'atrasado', text: 'Prazo vencido! ⏰', monthly: remaining };
    return { status: 'pendente', m, monthly: remaining / m, text: `Faltam ${m} meses` };
  };

  // Cálculos de Totais
  const monthlyIncome = transactions.filter(t => {
      if(!t.date) return false;
      const [y, m] = t.date.split('-');
      return (parseInt(m)-1) === currentDate.getMonth() && parseInt(y) === currentDate.getFullYear() && t.type === 'receita' && !t.category.includes('Resgate');
  }).reduce((acc, c) => acc + Number(c.value), 0);

  const monthlyExpense = transactions.filter(t => {
      if(!t.date) return false;
      const [y, m] = t.date.split('-');
      return (parseInt(m)-1) === currentDate.getMonth() && parseInt(y) === currentDate.getFullYear() && t.type === 'despesa' && !t.category.includes('Investimento');
  }).reduce((acc, c) => acc + Number(c.value), 0);
  
  const monthlyBalance = monthlyIncome - monthlyExpense;

  const accumulatedBalance = transactions.filter(t=>t.date <= new Date().toISOString().split('T')[0]).reduce((acc, c) => c.type==='receita' ? acc+Number(c.value) : acc-Number(c.value), 0);
  const totalGoals = goals.reduce((acc, c) => acc + (Number(c.currentAmount)||0), 0);
  const totalInvestments = investments.reduce((acc, c) => acc + (Number(c.currentAmount)||0), 0);
  const totalPatrimony = accumulatedBalance + totalGoals + totalInvestments;


  // ==================================================================================
  // 5. TELA DE LOGIN / REGISTRO
  // ==================================================================================
  if (loading) return <div className="flex h-screen items-center justify-center bg-blue-900 text-white">Carregando Finanças...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm animate-fadeIn">
          <div className="flex justify-center mb-6"><div className="bg-blue-100 p-4 rounded-full"><DollarSign size={40} className="text-blue-600"/></div></div>
          <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">Minhas Finanças (Nuvem)</h1>
          <p className="text-center text-gray-500 mb-8 text-sm">{authMode === 'login' ? 'Faça login para acessar seus dados.' : 'Crie sua conta gratuita.'}</p>
          
          <form onSubmit={handleAuth}>
            {authMode === 'register' && (
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo</label>
                    <input className="w-full p-3 border rounded-lg bg-gray-50" placeholder="Seu nome" value={loginForm.name} onChange={e=>setLoginForm({...loginForm, name:e.target.value})} required/>
                </div>
            )}
            <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 mb-1">E-mail</label>
                <input className="w-full p-3 border rounded-lg bg-gray-50" type="email" placeholder="email@exemplo.com" value={loginForm.email} onChange={e=>setLoginForm({...loginForm, email:e.target.value})} required/>
            </div>
            <div className="mb-6 relative">
                <label className="block text-xs font-bold text-gray-700 mb-1">Senha</label>
                <input className="w-full p-3 border rounded-lg bg-gray-50" type={showPassword ? "text" : "password"} placeholder="******" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})} required/>
                <button type="button" className="absolute right-3 top-8 text-gray-400" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition-all">
                {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center border-t pt-4">
              <p className="text-sm text-gray-600">
                  {authMode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}
                  <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="ml-2 text-blue-600 font-bold hover:underline">
                      {authMode === 'login' ? 'Cadastre-se' : 'Fazer Login'}
                  </button>
              </p>
          </div>
        </div>
      </div>
    );
  }

  // ==================================================================================
  // 6. LAYOUT PRINCIPAL (DASHBOARD)
  // ==================================================================================
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* MENU DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-900 text-white shadow-xl z-20">
        <div className="p-6 flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg"><DollarSign className="text-blue-900" size={24}/></div>
            <h1 className="text-2xl font-bold">Finanças</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 py-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'dashboard' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><TrendingUp size={20}/> <span>Dashboard</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'transactions' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><DollarSign size={20}/> <span>Lançamentos</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'goals' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><Target size={20}/> <span>Metas</span></button>
          <button onClick={() => setActiveTab('investments')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'investments' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><Briefcase size={20}/> <span>Investimentos</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><Lock size={20}/> <span>Configurações</span></button>
        </nav>
        <div className="p-4 border-t border-blue-800">
            <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-600 hover:text-white text-red-300 transition-colors font-bold"><LogOut size={20}/> <span>Sair</span></button>
        </div>
      </aside>

      {/* MENU MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50 shadow-up safe-area-pb">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><TrendingUp size={22}/><span className="text-[10px] font-bold mt-1">Visão</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'transactions' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><DollarSign size={22}/><span className="text-[10px] font-bold mt-1">Lançar</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'goals' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><Target size={22}/><span className="text-[10px] font-bold mt-1">Metas</span></button>
          <button onClick={() => setActiveTab('investments')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'investments' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><Briefcase size={22}/><span className="text-[10px] font-bold mt-1">Investir</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><Lock size={22}/><span className="text-[10px] font-bold mt-1">Config</span></button>
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
         <header className="bg-white shadow-sm px-4 py-3 md:px-8 md:py-4 flex justify-between items-center z-10 sticky top-0">
             <h2 className="text-lg font-bold text-gray-800">
                {activeTab === 'dashboard' && 'Visão Geral'}
                {activeTab === 'transactions' && 'Fluxo de Caixa'}
                {activeTab === 'goals' && 'Metas'}
                {activeTab === 'investments' && 'Carteira'}
                {activeTab === 'settings' && 'Configurações'}
             </h2>
             <div className="flex items-center gap-3">
                 <div className="text-right hidden md:block">
                     <p className="text-sm font-bold text-gray-700">{currentUser.name}</p>
                     <p className="text-xs text-green-600 font-bold flex items-center gap-1 justify-end"><div className="w-2 h-2 rounded-full bg-green-500"></div> Online</p>
                 </div>
                 <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
                     {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                 </div>
             </div>
         </header>

         {(activeTab === 'dashboard' || activeTab === 'transactions') && (
          <div className="bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm z-0">
             <button onClick={() => {const d = new Date(currentDate); d.setMonth(d.getMonth()-1); setCurrentDate(d)}} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-blue-600"><ChevronLeft size={20}/></button>
             <span className="font-bold text-gray-700 capitalize text-sm flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> {formatMonthYear(currentDate)}</span>
             <button onClick={() => {const d = new Date(currentDate); d.setMonth(d.getMonth()+1); setCurrentDate(d)}} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-blue-600"><ChevronRight size={20}/></button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 bg-gray-50 scroll-smooth">
           
           {/* DASHBOARD */}
           {activeTab === 'dashboard' && (
               <div className="space-y-6 max-w-6xl mx-auto">
                   <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex justify-between items-start mb-4">
                            <div><p className="text-blue-200 text-xs font-bold uppercase mb-1">Patrimônio Total</p><h2 className="text-4xl font-bold">R$ {totalPatrimony.toFixed(2)}</h2></div>
                            <DollarSign size={32} className="text-white opacity-50" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-blue-600 pt-4 mt-2 text-sm">
                             <div><p className="text-blue-300 text-[10px] uppercase">Livre</p><p className="font-bold">R$ {accumulatedBalance.toFixed(2)}</p></div>
                             <div className="border-l border-blue-600 pl-4"><p className="text-blue-300 text-[10px] uppercase">Metas</p><p className="font-bold">R$ {totalGoals.toFixed(2)}</p></div>
                             <div className="border-l border-blue-600 pl-4"><p className="text-blue-300 text-[10px] uppercase">Investido</p><p className="font-bold">R$ {totalInvestments.toFixed(2)}</p></div>
                        </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between"><div><p className="text-xs text-gray-500 uppercase">Entrou</p><p className="text-xl font-bold text-green-600">R$ {monthlyIncome.toFixed(2)}</p></div><TrendingUp className="text-green-500 opacity-50"/></div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex justify-between"><div><p className="text-xs text-gray-500 uppercase">Saiu</p><p className="text-xl font-bold text-red-600">R$ {monthlyExpense.toFixed(2)}</p></div><TrendingDown className="text-red-500 opacity-50"/></div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between"><div><p className="text-xs text-gray-500 uppercase">Balanço</p><p className={`text-xl font-bold ${monthlyBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {monthlyBalance.toFixed(2)}</p></div><Calendar className="text-blue-500 opacity-50"/></div>
                   </div>
               </div>
           )}

           {/* LANÇAMENTOS */}
           {activeTab === 'transactions' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                <div className="space-y-6">
                    <button onClick={() => setShowFixedPanel(!showFixedPanel)} className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold border border-indigo-200 flex items-center justify-center gap-2">
                        {showFixedPanel ? <XCircle size={20}/> : <CalendarClock size={20}/>} {showFixedPanel ? 'Fechar' : 'Gerenciar Fixas'}
                    </button>
                    
                    {showFixedPanel && (
                        <div className="bg-white p-4 rounded-xl shadow border border-indigo-100">
                            <form onSubmit={saveFixedExpense} className="grid grid-cols-2 gap-2 mb-4">
                                <input name="desc" className="col-span-2 border p-2 rounded text-sm" placeholder="Nome (Ex: Aluguel)" required />
                                <input name="amount" type="number" step="0.01" className="border p-2 rounded text-sm" placeholder="R$" required />
                                <select name="day" className="border p-2 rounded text-sm bg-white" required><option value="">Dia</option>{[1,5,10,15,20,25,30].map(d=><option key={d} value={d}>{d}</option>)}</select>
                                <select name="cat" className="col-span-2 border p-2 rounded text-sm bg-white" required>{expenseCategories.map(c=><option key={c} value={c}>{c}</option>)}</select>
                                <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded font-bold text-sm">Adicionar</button>
                            </form>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {fixedExpenses.map(f => (
                                    <div key={f.id} className="flex justify-between items-center text-sm border-b pb-1">
                                        <div className="flex gap-2 items-center"><input type="checkbox" checked={f.active} onChange={()=>toggleFixedActive(f)} /><span>{f.description}</span></div>
                                        <button onClick={()=>deleteFixedExpense(f.id)} className="text-red-400"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                        <h3 className="font-bold text-green-700 mb-2">Nova Receita</h3>
                        <div className="space-y-2">
                            <input className="w-full p-2 border rounded" placeholder="Descrição" value={incomeForm.description} onChange={e=>setIncomeForm({...incomeForm, description:e.target.value})}/>
                            <div className="flex gap-2"><input className="w-full p-2 border rounded" type="number" placeholder="Valor" value={incomeForm.amount} onChange={e=>setIncomeForm({...incomeForm, amount:e.target.value})}/></div>
                            <select className="w-full p-2 border rounded bg-white" value={incomeForm.category} onChange={e=>setIncomeForm({...incomeForm, category:e.target.value})}>
                                <option value="" disabled>Categoria</option>{incomeCategories.map(c=><option key={c} value={c}>{c}</option>)}
                            </select>
                            <input className="w-full p-2 border rounded" type="date" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm, date:e.target.value})}/>
                            <button onClick={()=>addTransaction('income')} className="w-full bg-green-600 text-white p-2 rounded font-bold">Adicionar</button>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
                        <h3 className="font-bold text-red-700 mb-2">Nova Despesa</h3>
                        <div className="space-y-2">
                            <input className="w-full p-2 border rounded" placeholder="Descrição" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description:e.target.value})}/>
                            <div className="flex gap-2"><input className="w-2/3 p-2 border rounded" type="number" placeholder="Valor" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount:e.target.value})}/> <input className="w-1/3 p-2 border rounded" type="number" placeholder="Parc." value={expenseForm.installments} onChange={e=>setExpenseForm({...expenseForm, installments:e.target.value})}/></div>
                            <select className="w-full p-2 border rounded bg-white" value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category:e.target.value})}>
                                <option value="" disabled>Categoria</option>{expenseCategories.map(c=><option key={c} value={c}>{c}</option>)}
                            </select>
                            <button onClick={()=>addTransaction('expense')} className="w-full bg-red-600 text-white p-2 rounded font-bold">Adicionar</button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow h-fit max-h-[600px] overflow-y-auto">
                    {transactions.filter(t => { const [y, m] = t.date.split('-'); return (parseInt(m)-1)===currentDate.getMonth() && parseInt(y)===currentDate.getFullYear() }).slice().reverse().map(t => (
                        <div key={t.id} className="flex justify-between items-center border-b p-2">
                            <div>
                                <p className="font-bold text-sm">{t.description} {t.description.includes('(Auto)') && <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1 rounded">AUTO</span>}</p>
                                <p className="text-xs text-gray-500">{t.date.split('-').reverse().join('/')} • {t.category}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${t.type==='receita'?'text-green-600':'text-red-600'}`}>{t.type==='receita'?'+':'-'} R$ {Number(t.value).toFixed(2)}</span>
                                <button onClick={()=>startEditing(t)} className="text-blue-400"><Edit size={14}/></button>
                                <button onClick={()=>removeTransaction(t.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    ))}
                    {transactions.length === 0 && <div className="text-center text-gray-400 py-10">Vazio</div>}
                </div>
             </div>
           )}

           {/* OUTRAS ABAS (Simplificadas para caber na resposta - lógica completa acima) */}
           {activeTab === 'goals' && (
               <div className="bg-white p-6 rounded-xl shadow text-center">
                   <h3 className="text-xl font-bold mb-4">Suas Metas na Nuvem</h3>
                   <div className="flex gap-2 mb-4 justify-center">
                       <input className="border p-2 rounded" placeholder="Nome da Meta" value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name:e.target.value})}/>
                       <button onClick={addGoal} className="bg-purple-600 text-white px-4 rounded">Criar</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {goals.map(g => (
                           <div key={g.id} className="border p-4 rounded-xl relative">
                               <button onClick={()=>deleteGoal(g.id)} className="absolute top-2 right-2 text-red-300"><Trash2 size={14}/></button>
                               <h4 className="font-bold">{g.name}</h4>
                               <p className="text-2xl font-bold text-purple-600">R$ {g.currentAmount ? g.currentAmount.toFixed(2) : '0.00'}</p>
                               <div className="flex gap-2 mt-2">
                                   <button onClick={()=>addValueToTarget('goal', g.id, prompt('Valor:'))} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Investir</button>
                                   <button onClick={()=>setWithdrawModal({show:true, type:'goal', id:g.id, name:g.name})} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Resgatar</button>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

            {activeTab === 'investments' && (
               <div className="bg-white p-6 rounded-xl shadow text-center">
                   <h3 className="text-xl font-bold mb-4">Sua Carteira de Investimentos</h3>
                   <div className="flex gap-2 mb-4 justify-center">
                       <input className="border p-2 rounded" placeholder="Nome (Ex: CDB)" value={investmentForm.name} onChange={e=>setInvestmentForm({...investmentForm, name:e.target.value})}/>
                       <button onClick={addInvestment} className="bg-indigo-600 text-white px-4 rounded">Criar</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {investments.map(i => (
                           <div key={i.id} className="border p-4 rounded-xl relative bg-indigo-50">
                               <button onClick={()=>deleteInvestment(i.id)} className="absolute top-2 right-2 text-red-300"><Trash2 size={14}/></button>
                               <h4 className="font-bold">{i.name}</h4>
                               <p className="text-2xl font-bold text-indigo-700">R$ {i.currentAmount ? i.currentAmount.toFixed(2) : '0.00'}</p>
                               <div className="flex gap-2 mt-2">
                                   <button onClick={()=>addValueToTarget('investment', i.id, prompt('Valor:'))} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Aportar</button>
                                   <button onClick={()=>setWithdrawModal({show:true, type:'investment', id:i.id, name:i.name})} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Resgatar</button>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {activeTab === 'settings' && (
               <div className="max-w-2xl mx-auto space-y-6">
                   <div className="bg-white p-6 rounded-xl shadow border-l-4 border-orange-500">
                       <h3 className="font-bold mb-2 flex items-center gap-2"><Upload size={20}/> Migrar Dados Locais para Nuvem</h3>
                       <p className="text-sm text-gray-600 mb-4">Use o arquivo de backup que você baixou da versão antiga para popular sua nova conta na nuvem.</p>
                       <label className="bg-orange-100 text-orange-700 px-4 py-2 rounded cursor-pointer font-bold block text-center">
                           Selecionar Backup JSON
                           <input type="file" accept=".json" onChange={importDataToFirebase} className="hidden" />
                       </label>
                   </div>
                   
                   <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
                       <h3 className="font-bold mb-2">Alterar Senha</h3>
                       <input className="border p-2 w-full mb-2 rounded" type="password" placeholder="Nova Senha" value={changePasswordForm.newPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, newPassword:e.target.value})}/>
                       <input className="border p-2 w-full mb-2 rounded" type="password" placeholder="Confirmar Nova Senha" value={changePasswordForm.confirmPassword} onChange={e=>setChangePasswordForm({...changePasswordForm, confirmPassword:e.target.value})}/>
                       <button onClick={handleChangePassword} className="bg-blue-600 text-white px-4 py-2 rounded w-full font-bold">Atualizar Senha</button>
                   </div>
               </div>
           )}

           {withdrawModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                        <h3 className="font-bold text-red-600 mb-4">Resgatar de {withdrawModal.name}</h3>
                        <form onSubmit={confirmWithdraw}>
                            <input type="number" step="0.01" className="w-full p-3 border rounded mb-4 text-xl" placeholder="Valor" value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} autoFocus />
                            <div className="flex justify-end gap-2"><button type="button" onClick={() => setWithdrawModal({ show: false, type: '', id: null, name: '' })} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button><button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">Confirmar</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}