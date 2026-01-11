import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Target, Trash2, LogOut, 
  Users, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Calendar, 
  Edit, XCircle, Briefcase, Upload, Home, List, AlertTriangle, PieChart as PieIcon,
  ArrowLeft, LogIn
} from 'lucide-react';

// --- IMPORTAÇÕES DE GRÁFICOS (Recharts) ---
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';

// --- IMPORTAÇÕES DO FIREBASE ---
import { auth, db } from './firebase'; 
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    updatePassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { 
    ref, 
    set, 
    push, 
    remove, 
    onValue, 
    update,
    get 
} from 'firebase/database';

export default function App() {
  // ==================================================================================
  // 1. ESTADOS GERAIS
  // ==================================================================================
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Login, Cadastro e Reset
  const [authMode, setAuthMode] = useState('login'); 
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '', pin: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Navegação
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dados do Sistema
  const [familyName, setFamilyName] = useState('Minha Família');
  const [familyPin, setFamilyPin] = useState(''); // Estado do PIN
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  
  // Categorias
  const [expenseCategories, setExpenseCategories] = useState(['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros']);
  const [incomeCategories, setIncomeCategories] = useState(['Salário', 'Extra', 'Investimento', 'Presente', 'Outros']);
  const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#84CC16', '#14B8A6'];

  // Controle de Datas e Filtros
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  
  // Modais
  const [withdrawModal, setWithdrawModal] = useState({ show: false, type: '', id: null, name: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });

  // Inputs Temporários
  const [incomeForm, setIncomeForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: '' });
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: '', paymentMethod: 'Cartão de Crédito', installments: '1' });
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '' });
  const [investmentForm, setInvestmentForm] = useState({ name: '', type: 'Renda Fixa', currentAmount: '' });
  const [changePasswordForm, setChangePasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  
  // Novos Estados para Categorias e Join
  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [joinFamilyForm, setJoinFamilyForm] = useState({ familyId: '', pin: '' });

  // Helpers
  const formatMonthYear = (date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // ==================================================================================
  // 2. CONEXÃO COM A NUVEM
  // ==================================================================================
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const profile = snapshot.val();
                    const userData = {
                        uid: user.uid,
                        email: user.email,
                        name: profile.name || user.displayName || 'Usuário',
                        familyId: profile.familyId
                    };
                    setCurrentUser(userData);
                    if (profile.familyId) listenToFamilyData(profile.familyId);
                } else {
                    setCurrentUser({ uid: user.uid, email: user.email, name: user.displayName });
                }
                setLoading(false);
            });
        } else {
            setCurrentUser(null);
            setTransactions([]);
            setGoals([]);
            setInvestments([]);
            setLoading(false);
        }
    });
    return () => unsubscribe();
  }, []);

  const listenToFamilyData = (familyId) => {
      const familyRef = ref(db, `families/${familyId}`);
      onValue(familyRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
              setFamilyName(data.name || 'Minha Família');
              setFamilyPin(data.pin || '0000'); // Lê o PIN do banco

              if (data.transactions) setTransactions(Object.values(data.transactions)); else setTransactions([]);
              if (data.goals) setGoals(Object.values(data.goals)); else setGoals([]);
              if (data.investments) setInvestments(Object.values(data.investments)); else setInvestments([]);
              if (data.expenseCategories) { setExpenseCategories(data.expenseCategories); setExpenseForm(prev => ({ ...prev, category: data.expenseCategories[0] })); }
              if (data.incomeCategories) { setIncomeCategories(data.incomeCategories); setIncomeForm(prev => ({ ...prev, category: data.incomeCategories[0] })); }
          }
      });
  };

  // ==================================================================================
  // 3. LÓGICA DE AÇÃO
  // ==================================================================================

  const handleForgotPassword = async (e) => {
      e.preventDefault();
      if (!loginForm.email) return alert("Digite seu e-mail para recuperar a senha.");
      try {
          await sendPasswordResetEmail(auth, loginForm.email);
          alert(`E-mail de recuperação enviado para: ${loginForm.email}\n\nVerifique sua caixa de entrada.`);
          setAuthMode('login');
      } catch (error) { alert("Erro ao enviar e-mail: " + error.message); }
  };

  const handleAuth = async (e) => {
      e.preventDefault();
      try {
          if (authMode === 'login') {
              await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
          } else if (authMode === 'register') {
              if (!loginForm.pin || loginForm.pin.length < 4) return alert("Crie um PIN de acesso com pelo menos 4 dígitos.");

              const userCred = await createUserWithEmailAndPassword(auth, loginForm.email, loginForm.password);
              const uid = userCred.user.uid;
              const newFamilyRef = push(ref(db, 'families'));
              const familyId = newFamilyRef.key;
              
              let nomeFamilia = "Família " + loginForm.name.split(' ')[0];
              if (loginForm.name.toLowerCase().includes('figueiredo')) nomeFamilia = "Família Figueiredo";

              await set(newFamilyRef, { 
                  id: familyId, 
                  name: nomeFamilia, 
                  pin: loginForm.pin,
                  createdBy: uid, 
                  members: { [uid]: loginForm.name }, 
                  expenseCategories, 
                  incomeCategories 
              });

              await set(ref(db, `users/${uid}`), { name: loginForm.name, email: loginForm.email, familyId: familyId });
              await updateProfile(userCred.user, { displayName: loginForm.name });
              window.location.reload();
          }
      } catch (error) { alert("Erro: " + error.message); }
  };

  const handleLogout = () => {
      setLoginForm({ email: '', password: '', name: '', pin: '' });
      setAuthMode('login');
      signOut(auth);
  };

  const handleChangePassword = async () => {
      if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) return alert("Senhas não conferem");
      try { await updatePassword(auth.currentUser, changePasswordForm.newPassword); alert("Senha alterada!"); handleLogout(); } catch (error) { alert("Erro: " + error.message); }
  };

  // --- FUNÇÃO PARA EDITAR O PIN (COM O LÁPIS) ---
  const handleEditPin = async () => {
      const newPin = prompt("Digite o novo PIN de acesso da Família (Mínimo 4 dígitos):");
      if (!newPin || newPin.length < 4) return alert("PIN inválido. Tente novamente.");
      try {
          await update(ref(db, `families/${currentUser.familyId}`), { pin: newPin });
          setFamilyPin(newPin);
          alert("PIN alterado com sucesso!");
      } catch (error) { alert("Erro ao salvar PIN: " + error.message); }
  };

  const handleJoinFamily = async () => {
      if (!joinFamilyForm.familyId || !joinFamilyForm.pin) return alert("Preencha o ID e o PIN.");
      const targetFamilyId = joinFamilyForm.familyId.trim();
      const inputPin = joinFamilyForm.pin.trim();

      try {
          const familySnapshot = await get(ref(db, `families/${targetFamilyId}`));
          if (!familySnapshot.exists()) return alert("Família não encontrada. Verifique o ID.");
          const familyData = familySnapshot.val();
          if (String(familyData.pin) !== String(inputPin)) return alert("PIN incorreto! Acesso negado.");

          if (window.confirm(`Entrar na "${familyData.name}"?`)) {
              const uid = currentUser.uid;
              await update(ref(db, `users/${uid}`), { familyId: targetFamilyId });
              await update(ref(db, `families/${targetFamilyId}/members`), { [uid]: currentUser.name });
              alert("Sucesso! Você agora faz parte desta família.");
              window.location.reload();
          }
      } catch (error) { alert("Erro ao entrar na família: " + error.message); }
  };

  const resetAllData = async () => {
      if (!window.confirm("ATENÇÃO! ⚠️\n\nIsso vai APAGAR TODOS os dados.\nTem certeza?")) return;
      try {
          const fid = currentUser.familyId;
          await remove(ref(db, `families/${fid}/transactions`));
          await remove(ref(db, `families/${fid}/goals`));
          await remove(ref(db, `families/${fid}/investments`));
          await remove(ref(db, `families/${fid}/fixedExpenses`));
          alert("Dados resetados.");
      } catch (error) { alert("Erro: " + error.message); }
  }

  const handleAddCategory = (type, value) => {
      if (!value) return;
      const isExpense = type === 'expense';
      const list = isExpense ? expenseCategories : incomeCategories;
      const path = isExpense ? 'expenseCategories' : 'incomeCategories';
      if (list.includes(value)) return alert("Categoria já existe!");
      const newList = [...list, value];
      if (isExpense) setExpenseCategories(newList); else setIncomeCategories(newList);
      set(ref(db, `families/${currentUser.familyId}/${path}`), newList);
      if (isExpense) setNewExpenseCat(''); else setNewIncomeCat('');
  };

  const handleRemoveCategory = (type, value) => {
      const isExpense = type === 'expense';
      const list = isExpense ? expenseCategories : incomeCategories;
      const path = isExpense ? 'expenseCategories' : 'incomeCategories';
      if (list.length <= 1) return alert("É necessário ter pelo menos uma categoria.");
      if (!window.confirm(`Excluir categoria "${value}"?`)) return;
      const newList = list.filter(c => c !== value);
      if (isExpense) setExpenseCategories(newList); else setIncomeCategories(newList);
      set(ref(db, `families/${currentUser.familyId}/${path}`), newList);
  };

  const addTransaction = (type) => {
    try {
        const isExpense = type === 'expense' || type === 'despesa';
        const form = type === 'income' ? incomeForm : expenseForm;
        if (!form.description || !form.amount) return alert('Preencha os dados.');
        const val = parseFloat(form.amount.toString().replace(',', '.'));
        if (isNaN(val) || val <= 0) return alert("Valor inválido.");
        if (!currentUser?.familyId) return alert("Erro: ID da Família não encontrado.");
        const fid = currentUser.familyId;
        let finalCategory = form.category;
        if (!finalCategory) finalCategory = isExpense ? (expenseCategories[0] || 'Geral') : (incomeCategories[0] || 'Geral');
        const metaData = { createdBy: currentUser.uid, authorName: currentUser.name || 'Membro' };

        if (editingId) {
           const safeId = String(editingId).replace(/\./g, '').replace(/[#$\[\]]/g, '');
           const original = transactions.find(t => t.id === editingId) || {};
           update(ref(db, `families/${fid}/transactions/${safeId}`), {
               ...original, id: safeId, description: form.description, amount: form.amount, value: val,
               category: finalCategory, date: form.date,
               paymentMethod: isExpense ? (form.paymentMethod || 'Cartão de Crédito') : null
           }).then(() => {
               setEditingId(null);
               if (type === 'income') setIncomeForm(prev => ({ ...prev, description: '', amount: '' }));
               else setExpenseForm(prev => ({ ...prev, description: '', amount: '', installments: '1' }));
               alert("Alterado!");
           });
           return;
        }

        if (isExpense && form.installments && parseInt(form.installments) > 1) {
            const total = parseInt(form.installments);
            const parcVal = val / total;
            const [y, m, d] = form.date.split('-').map(Number);
            for (let i = 0; i < total; i++) {
                const dt = new Date(y, (m - 1) + i, d);
                const dateStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
                const id = (Date.now() + i).toString();
                set(ref(db, `families/${fid}/transactions/${id}`), {
                    id, type: 'despesa', description: `${form.description} (${i+1}/${total})`,
                    amount: parcVal.toFixed(2), value: parcVal, date: dateStr, 
                    category: finalCategory, paymentMethod: form.paymentMethod || 'Cartão de Crédito', ...metaData
                });
            }
            setExpenseForm(prev => ({ ...prev, description: '', amount: '', installments: '1' }));
            alert(`${total} parcelas geradas!`);
        } else {
           const id = Date.now().toString();
           set(ref(db, `families/${fid}/transactions/${id}`), { 
               id, type: type === 'income' ? 'receita' : 'despesa', 
               description: form.description, amount: form.amount, value: val, 
               date: form.date, category: finalCategory,
               paymentMethod: isExpense ? (form.paymentMethod || 'Cartão de Crédito') : null, ...metaData 
           }).then(() => {
                if(type === 'income') setIncomeForm(prev => ({ ...prev, description: '', amount: '' }));
                else setExpenseForm(prev => ({ ...prev, description: '', amount: '', installments: '1' }));
           });
        }
    } catch (error) { alert("Erro: " + error.message); }
  };

  const removeTransaction = (id) => { if(window.confirm("Apagar?")) remove(ref(db, `families/${currentUser.familyId}/transactions/${id}`)); };

  const startEditing = (t) => {
    setEditingId(t.id);
    const valStr = t.value ? t.value.toFixed(2) : '';
    if (t.type === 'receita') setIncomeForm({ date: t.date, description: t.description, amount: valStr, category: t.category });
    else setExpenseForm({ date: t.date, description: t.description, amount: valStr, category: t.category, paymentMethod: t.paymentMethod, installments: '1' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addGoal = () => { 
      if (!goalForm.name) return;
      const id = Date.now();
      set(ref(db, `families/${currentUser.familyId}/goals/${id}`), { id, ...goalForm, currentAmount: 0, createdBy: currentUser.uid, authorName: currentUser.name });
      setGoalForm({ name: '', targetAmount: '', targetDate: '', description: '' });
  };
  
  const deleteGoal = (id) => {
      const goal = goals.find(g => g.id === id);
      if(!goal) return;
      if(window.confirm(`Deseja excluir a meta "${goal.name}"?\n\nSe houver saldo (R$ ${goal.currentAmount || 0}), ele será devolvido para a Conta Livre.`)) {
          const fid = currentUser.familyId;
          if (goal.currentAmount && goal.currentAmount > 0) {
              const tId = Date.now();
              set(ref(db, `families/${fid}/transactions/${tId}`), {
                  id: tId, type: 'receita', description: `Estorno de Meta: ${goal.name}`,
                  amount: goal.currentAmount.toFixed(2), value: parseFloat(goal.currentAmount), 
                  category: 'Resgate', date: new Date().toISOString().split('T')[0], 
                  createdBy: currentUser.uid, authorName: currentUser.name
              });
          }
          remove(ref(db, `families/${fid}/goals/${id}`));
      }
  };

  const addInvestment = () => {
      if (!investmentForm.name) return;
      const startVal = parseFloat(investmentForm.currentAmount) || 0;
      const id = Date.now();
      const newInv = { id, name: investmentForm.name, type: investmentForm.type, currentAmount: startVal, createdBy: currentUser.uid, authorName: currentUser.name };
      set(ref(db, `families/${currentUser.familyId}/investments/${id}`), newInv);
      if (startVal > 0) {
          const tId = Date.now() + 1;
          set(ref(db, `families/${currentUser.familyId}/transactions/${tId}`), {
              id: tId, type: 'despesa', description: `Aporte: ${newInv.name}`, amount: startVal.toFixed(2), value: startVal, category: 'Investimento/Aporte', date: new Date().toISOString().split('T')[0], createdBy: currentUser.uid, authorName: currentUser.name
          });
      }
      setInvestmentForm({ name: '', type: 'Renda Fixa', currentAmount: '' });
  };
  
  const deleteInvestment = (id) => {
      const investment = investments.find(i => i.id === id);
      if(!investment) return;
      if(window.confirm(`Deseja encerrar o investimento "${investment.name}"?\n\nO saldo atual (R$ ${investment.currentAmount || 0}) será devolvido para a Conta Livre.`)) {
          const fid = currentUser.familyId;
          if (investment.currentAmount && investment.currentAmount > 0) {
              const tId = Date.now();
              set(ref(db, `families/${fid}/transactions/${tId}`), {
                  id: tId, type: 'receita', description: `Resgate Final: ${investment.name}`,
                  amount: investment.currentAmount.toFixed(2), value: parseFloat(investment.currentAmount), 
                  category: 'Resgate', date: new Date().toISOString().split('T')[0], 
                  createdBy: currentUser.uid, authorName: currentUser.name
              });
          }
          remove(ref(db, `families/${fid}/investments/${id}`));
      }
  };

  const addValueToTarget = (type, id, vStr) => { 
      const val = parseFloat(vStr); if (!val) return;
      const fid = currentUser.familyId;
      const path = type === 'goal' ? 'goals' : 'investments';
      const item = (type === 'goal' ? goals : investments).find(i => i.id === id);
      if(!item) return;
      update(ref(db, `families/${fid}/${path}/${id}`), { currentAmount: (item.currentAmount || 0) + val });
      const tId = Date.now();
      set(ref(db, `families/${fid}/transactions/${tId}`), {
          id: tId, type: 'despesa', description: `Aporte: ${item.name}`, amount: vStr, value: val, category: 'Investimento/Aporte', date: new Date().toISOString().split('T')[0], createdBy: currentUser.uid, authorName: currentUser.name
      });
  };

  const confirmWithdraw = (e) => {
      e.preventDefault();
      const val = parseFloat(withdrawForm.amount);
      const { type, id, name } = withdrawModal;
      const fid = currentUser.familyId;
      const path = type === 'goal' ? 'goals' : 'investments';
      const item = (type === 'goal' ? goals : investments).find(i => i.id === id);
      update(ref(db, `families/${fid}/${path}/${id}`), { currentAmount: (item.currentAmount || 0) - val });
      const tId = Date.now();
      set(ref(db, `families/${fid}/transactions/${tId}`), {
          id: tId, type: 'receita', description: `Resgate: ${name}`, amount: withdrawForm.amount, value: val, category: 'Resgate', date: new Date().toISOString().split('T')[0], createdBy: currentUser.uid, authorName: currentUser.name
      });
      setWithdrawModal({ show:false, type:'', id:null, name:'' });
      setWithdrawForm({ amount: '', reason: '' });
  };

  const importDataToFirebase = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target.result);
              if (!data.transactions) throw new Error('Arquivo inválido.');
              if(window.confirm('Enviar backup?')) {
                  const updates = {};
                  const fid = currentUser.familyId;
                  const prep = (obj) => ({ ...obj, createdBy: currentUser.uid, authorName: currentUser.name });
                  if (data.transactions) data.transactions.forEach(t => updates[`transactions/${t.id}`] = prep(t));
                  if (data.goals) data.goals.forEach(g => updates[`goals/${g.id}`] = prep(g));
                  if (data.investments) data.investments.forEach(i => updates[`investments/${i.id}`] = prep(i));
                  update(ref(db, `families/${fid}`), updates).then(() => alert("Sucesso!"));
              }
          } catch (err) { alert('Erro: ' + err.message); }
      };
      reader.readAsText(file);
  };

  // --- CÁLCULOS ---
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

  const currentMonthExpenses = transactions.filter(t => {
      if(!t.date) return false;
      const [y, m] = t.date.split('-');
      return (parseInt(m)-1) === currentDate.getMonth() && parseInt(y) === currentDate.getFullYear() && (t.type === 'despesa' || t.type === 'expense');
  });
  const expensesByCategory = currentMonthExpenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.value);
      return acc;
  }, {});
  const pieData = Object.keys(expensesByCategory).map(key => ({ name: key, value: expensesByCategory[key] })).filter(i => i.value > 0);

  const getHistoryData = () => {
      const data = [];
      for (let i = 5; i >= 0; i--) {
          const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthName = d.toLocaleDateString('pt-BR', { month: 'short' });
          const y = d.getFullYear(); const m = d.getMonth();
          const monthTrans = transactions.filter(t => {
              if(!t.date) return false;
              const [ty, tm] = t.date.split('-').map(Number);
              return (tm-1) === m && ty === y;
          });
          const inc = monthTrans.filter(t => t.type === 'receita').reduce((a, b) => a + Number(b.value), 0);
          const exp = monthTrans.filter(t => t.type === 'despesa').reduce((a, b) => a + Number(b.value), 0);
          data.push({ name: monthName, Receita: inc, Despesa: exp });
      }
      return data;
  };
  const barData = getHistoryData();

  // ==================================================================================
  // 4. TELAS
  // ==================================================================================
  if (loading) return <div className="flex h-screen items-center justify-center bg-blue-900 text-white font-bold">Carregando...</div>;

  // --- TELA DE LOGIN / REGISTRO / RESET ---
  if (!currentUser) return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm animate-fadeIn">
          <div className="flex justify-center mb-6"><div className="bg-blue-100 p-4 rounded-full"><Home size={40} className="text-blue-600"/></div></div>
          <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">
              {authMode === 'reset' ? 'Recuperar Senha' : 'Finanças em Família'}
          </h1>
          <p className="text-center text-gray-500 mb-8 text-sm">
              {authMode === 'login' && 'Entre para gerenciar seu grupo.'}
              {authMode === 'register' && 'Crie um novo grupo familiar.'}
              {authMode === 'reset' && 'Digite seu e-mail para receber o link.'}
          </p>
          
          {authMode === 'reset' ? (
              <form onSubmit={handleForgotPassword}>
                  <div className="mb-6">
                      <label className="block text-xs font-bold text-gray-700 mb-1">E-mail Cadastrado</label>
                      <input className="w-full p-3 border rounded-lg bg-gray-50" type="email" placeholder="email@exemplo.com" value={loginForm.email} onChange={e=>setLoginForm({...loginForm, email:e.target.value})} required/>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition-all mb-4">Enviar Link de Recuperação</button>
                  <button type="button" onClick={() => setAuthMode('login')} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm"><ArrowLeft size={16}/> Voltar para Login</button>
              </form>
          ) : (
              <form onSubmit={handleAuth}>
                {authMode === 'register' && (
                    <>
                        <div className="mb-4"><label className="block text-xs font-bold text-gray-700 mb-1">Nome</label><input className="w-full p-3 border rounded-lg bg-gray-50" placeholder="Ex: Diego" value={loginForm.name} onChange={e=>setLoginForm({...loginForm, name:e.target.value})} required/></div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Crie um PIN da Família (Acesso)</label>
                            <input className="w-full p-3 border rounded-lg bg-gray-50 text-center tracking-widest font-mono text-lg" placeholder="0000" maxLength={6} value={loginForm.pin} onChange={e=>setLoginForm({...loginForm, pin:e.target.value})} required/>
                            <p className="text-[10px] text-gray-400 mt-1">Sua esposa/marido usará este PIN para entrar.</p>
                        </div>
                    </>
                )}
                <div className="mb-4"><label className="block text-xs font-bold text-gray-700 mb-1">E-mail</label><input className="w-full p-3 border rounded-lg bg-gray-50" type="email" placeholder="email@exemplo.com" value={loginForm.email} onChange={e=>setLoginForm({...loginForm, email:e.target.value})} required/></div>
                <div className="mb-6 relative">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Senha</label>
                    <input className="w-full p-3 border rounded-lg bg-gray-50" type={showPassword ? "text" : "password"} placeholder="******" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})} required/>
                    <button type="button" className="absolute right-3 top-8 text-gray-400" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                    {authMode === 'login' && <div className="text-right mt-2"><button type="button" onClick={()=>setAuthMode('reset')} className="text-xs text-blue-500 hover:underline">Esqueci minha senha</button></div>}
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition-all">{authMode === 'login' ? 'Entrar' : 'Criar Família'}</button>
                <div className="mt-6 text-center border-t pt-4"><p className="text-sm text-gray-600">{authMode === 'login' ? 'Novo por aqui?' : 'Já tem conta?'} <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="ml-2 text-blue-600 font-bold hover:underline">{authMode === 'login' ? 'Criar Conta' : 'Login'}</button></p></div>
              </form>
          )}
        </div>
      </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 bg-blue-900 text-white shadow-xl z-20">
        <div className="p-6 flex items-center gap-3"><div className="bg-white p-2 rounded-lg"><Home className="text-blue-900" size={24}/></div><div><h1 className="text-xl font-bold leading-tight">Finanças</h1><p className="text-[10px] text-blue-200 uppercase tracking-wider">{familyName}</p></div></div>
        <nav className="flex-1 px-4 space-y-2 py-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'dashboard' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><TrendingUp size={20}/> <span>Dashboard</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'transactions' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><DollarSign size={20}/> <span>Lançamentos</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'goals' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><Target size={20}/> <span>Metas</span></button>
          <button onClick={() => setActiveTab('investments')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'investments' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><Briefcase size={20}/> <span>Investimentos</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}><Lock size={20}/> <span>Configurações</span></button>
        </nav>
        <div className="p-4 border-t border-blue-800"><button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-600 hover:text-white text-red-300 transition-colors font-bold"><LogOut size={20}/> <span>Sair</span></button></div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50 shadow-up safe-area-pb">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><TrendingUp size={22}/><span className="text-[10px] font-bold mt-1">Visão</span></button>
          <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'transactions' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><DollarSign size={22}/><span className="text-[10px] font-bold mt-1">Lançar</span></button>
          <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'goals' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><Target size={22}/><span className="text-[10px] font-bold mt-1">Metas</span></button>
          <button onClick={() => setActiveTab('investments')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'investments' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><Briefcase size={22}/><span className="text-[10px] font-bold mt-1">Investir</span></button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><Lock size={22}/><span className="text-[10px] font-bold mt-1">Config</span></button>
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
         <header className="bg-white shadow-sm px-4 py-3 md:px-8 md:py-4 flex justify-between items-center z-10 sticky top-0">
             <div>
                <h2 className="text-lg font-bold text-gray-800">
                    {activeTab === 'dashboard' && 'Visão Geral'}
                    {activeTab === 'transactions' && 'Fluxo de Caixa'}
                    {activeTab === 'goals' && 'Metas'}
                    {activeTab === 'investments' && 'Carteira'}
                    {activeTab === 'settings' && 'Configurações'}
                </h2>
                <p className="text-xs text-gray-400 md:hidden">{familyName}</p>
             </div>
             <div className="flex items-center gap-3">
                 <div className="text-right hidden md:block"><p className="text-sm font-bold text-gray-700">{currentUser.name}</p><p className="text-xs text-blue-500 font-bold uppercase">{familyName}</p></div>
                 <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">{currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}</div>
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
           
           {/* DASHBOARD COMPACTO - 50/50 */}
           {activeTab === 'dashboard' && (
               <div className="space-y-4 max-w-6xl mx-auto">
                   
                   {/* Banner 50/50: Esquerda (Patrimônio) | Direita (Detalhes) */}
                   <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-0 rounded-xl shadow-lg text-white grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-[120px]">
                        
                        {/* Lado Esquerdo (50%) - Patrimônio Total */}
                        <div className="p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-blue-500/30 bg-blue-900/20">
                             <div className="flex items-center gap-3 mb-1">
                                <div className="bg-white/10 p-2 rounded-full"><Home size={20} className="text-white" /></div>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">Patrimônio Total</p>
                             </div>
                             <h2 className="text-3xl font-bold">R$ {totalPatrimony.toFixed(2)}</h2>
                        </div>

                        {/* Lado Direito (50%) - Detalhes Divididos */}
                        <div className="grid grid-cols-3 divide-x divide-blue-500/30 bg-blue-800/10">
                             <div className="flex flex-col items-center justify-center p-2 hover:bg-white/5 transition-colors">
                                 <span className="text-lg font-bold text-white block">R$ {accumulatedBalance.toFixed(2)}</span>
                                 <span className="text-[10px] text-blue-200 uppercase font-bold">Livre</span>
                             </div>
                             <div className="flex flex-col items-center justify-center p-2 hover:bg-white/5 transition-colors">
                                 <span className="text-lg font-bold text-white block">R$ {totalGoals.toFixed(2)}</span>
                                 <span className="text-[10px] text-blue-200 uppercase font-bold">Metas</span>
                             </div>
                             <div className="flex flex-col items-center justify-center p-2 hover:bg-white/5 transition-colors">
                                 <span className="text-lg font-bold text-white block">R$ {totalInvestments.toFixed(2)}</span>
                                 <span className="text-[10px] text-blue-200 uppercase font-bold">Invest.</span>
                             </div>
                        </div>
                   </div>

                   {/* Cards Resumo */}
                   <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-green-500">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Entrou</p>
                            <p className="text-lg font-bold text-green-600 truncate">R$ {monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-red-500">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Saiu</p>
                            <p className="text-lg font-bold text-red-600 truncate">R$ {monthlyExpense.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-blue-500">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Balanço</p>
                            <p className={`text-lg font-bold truncate ${monthlyBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {monthlyBalance.toFixed(2)}</p>
                        </div>
                   </div>

                   {/* Gráficos */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm h-64 flex flex-col">
                            <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm"><PieIcon size={16}/> Gastos por Categoria</h3>
                            <div className="flex-1 w-full min-h-0">
                                {pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                                            <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-300 text-xs">Sem gastos este mês</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm h-64 flex flex-col">
                            <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm"><TrendingUp size={16}/> Histórico (6 Meses)</h3>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                        <RechartsTooltip formatter={(value) => `R$ ${value.toFixed(2)}`} cursor={{fill: '#f3f4f6'}} />
                                        <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                                        <Bar dataKey="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Despesa" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                   </div>
               </div>
           )}

           {/* --- LANÇAMENTOS --- */}
           {activeTab === 'transactions' && (
             <div className="max-w-6xl mx-auto space-y-6">
                 {/* 1. RESUMO INVERTIDO (Livre na Esquerda 50%) */}
                 <div className="space-y-4">
                    <div className="bg-gray-800 text-white rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-[120px]">
                        
                        {/* Lado Esquerdo (50%) - Saldo Livre (Disponível) */}
                        <div className="p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-600 bg-gray-900/30">
                             <div className="flex items-center gap-3 mb-1">
                                <div className="bg-green-500/20 p-2 rounded-full"><DollarSign size={20} className="text-green-400" /></div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Disponível (Livre)</p>
                             </div>
                             <h2 className={`text-3xl font-bold ${accumulatedBalance >= 0 ? 'text-white' : 'text-red-300'}`}>R$ {accumulatedBalance.toFixed(2)}</h2>
                        </div>

                        {/* Lado Direito (50%) - Patrimônio e Outros */}
                        <div className="grid grid-cols-3 divide-x divide-gray-600 bg-gray-700/10">
                             <div className="flex flex-col items-center justify-center p-2">
                                 <span className="text-lg font-bold text-gray-200 block">R$ {totalPatrimony.toFixed(2)}</span>
                                 <span className="text-[10px] text-gray-500 uppercase font-bold">Total</span>
                             </div>
                             <div className="flex flex-col items-center justify-center p-2">
                                 <span className="text-lg font-bold text-gray-200 block">R$ {totalGoals.toFixed(2)}</span>
                                 <span className="text-[10px] text-gray-500 uppercase font-bold">Metas</span>
                             </div>
                             <div className="flex flex-col items-center justify-center p-2">
                                 <span className="text-lg font-bold text-gray-200 block">R$ {totalInvestments.toFixed(2)}</span>
                                 <span className="text-[10px] text-gray-500 uppercase font-bold">Invest.</span>
                             </div>
                        </div>
                    </div>

                    {/* Cards Mensais */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex flex-col justify-between">
                            <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">Entrou</p>
                            <p className="text-sm md:text-xl font-bold text-green-600 truncate">R$ {monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex flex-col justify-between">
                            <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">Saiu</p>
                            <p className="text-sm md:text-xl font-bold text-red-600 truncate">R$ {monthlyExpense.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex flex-col justify-between">
                            <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">Balanço</p>
                            <p className={`text-sm md:text-xl font-bold truncate ${monthlyBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {monthlyBalance.toFixed(2)}</p>
                        </div>
                    </div>
                 </div>

                 {/* 2. ÁREA DE LANÇAMENTOS E FORMULÁRIOS */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                            <h3 className="font-bold text-green-700 mb-2">Nova Receita</h3>
                            {editingId && (<div className="mb-2 bg-orange-100 text-orange-700 p-2 rounded text-center text-sm font-bold flex justify-between items-center cursor-pointer border border-orange-200" onClick={() => { setEditingId(null); setIncomeForm({ ...incomeForm, description: '', amount: '' }); }}><span>⚠️ Editando Receita...</span><span className="underline text-xs">Cancelar</span></div>)}
                            <div className="space-y-2">
                                <input className="w-full p-2 border rounded" placeholder="Descrição" value={incomeForm.description} onChange={e=>setIncomeForm({...incomeForm, description:e.target.value})}/>
                                <div className="flex gap-2"><input className="w-full p-2 border rounded" type="number" placeholder="Valor" value={incomeForm.amount} onChange={e=>setIncomeForm({...incomeForm, amount:e.target.value})}/></div>
                                <select className="w-full p-2 border rounded bg-white" value={incomeForm.category} onChange={e=>setIncomeForm({...incomeForm, category:e.target.value})}><option value="" disabled>Categoria</option>{incomeCategories.map(c=><option key={c} value={c}>{c}</option>)}</select>
                                <input className="w-full p-2 border rounded" type="date" value={incomeForm.date} onChange={e=>setIncomeForm({...incomeForm, date:e.target.value})}/>
                                <button onClick={()=>addTransaction('income')} className="w-full bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700 transition-colors">{editingId ? 'Salvar Alteração' : 'Adicionar Receita'}</button>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
                            <h3 className="font-bold text-red-700 mb-2">Nova Despesa</h3>
                            {editingId && (<div className="mb-2 bg-orange-100 text-orange-700 p-2 rounded text-center text-sm font-bold flex justify-between items-center cursor-pointer border border-orange-200" onClick={() => { setEditingId(null); setExpenseForm({ ...expenseForm, description: '', amount: '', installments: '1' }); }}><span>⚠️ Editando Despesa...</span><span className="underline text-xs">Cancelar</span></div>)}
                            <div className="space-y-2">
                                <input className="w-full p-2 border rounded" placeholder="Descrição (Ex: Mercado)" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description:e.target.value})}/>
                                <div className="flex gap-2"><input className="w-2/3 p-2 border rounded" type="number" placeholder="Valor" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount:e.target.value})}/> <input disabled={!!editingId} className={`w-1/3 p-2 border rounded ${editingId ? 'bg-gray-100 text-gray-400' : ''}`} type="number" placeholder="Parc." value={expenseForm.installments} onChange={e=>setExpenseForm({...expenseForm, installments:e.target.value})}/></div>
                                <select className="w-full p-2 border rounded bg-white" value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category:e.target.value})}><option value="" disabled>Categoria</option>{expenseCategories.map(c=><option key={c} value={c}>{c}</option>)}</select>
                                <button onClick={()=>addTransaction('expense')} className="w-full bg-red-600 text-white p-2 rounded font-bold hover:bg-red-700 transition-colors">{editingId ? 'Salvar Alteração' : 'Adicionar Despesa'}</button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow h-fit max-h-[600px] overflow-y-auto border border-gray-100">
                        <h3 className="font-bold mb-4 flex justify-between items-center text-gray-700">Extrato <span className="text-xs font-normal bg-gray-100 px-3 py-1 rounded-full text-gray-500 border">{formatMonthYear(currentDate)}</span></h3>
                        {transactions.filter(t => { const [y, m] = t.date.split('-'); return (parseInt(m)-1)===currentDate.getMonth() && parseInt(y)===currentDate.getFullYear() }).slice().reverse().map(t => {
                            // LÓGICA DE COR: 
                            // 1. Receita = Verde
                            // 2. Aporte/Investimento = Azul (Novo!)
                            // 3. Despesa Comum = Vermelho
                            const isInvestment = t.category.includes('Investimento') || t.category.includes('Aporte') || t.description.includes('Aporte');
                            const colorClass = t.type === 'receita' ? 'text-green-600' : (isInvestment ? 'text-blue-600' : 'text-red-600');
                            const sign = t.type === 'receita' ? '+' : '-';

                            return (
                                <div key={t.id} className={`flex justify-between items-center border-b border-gray-50 p-3 rounded-lg hover:bg-gray-50 transition-colors ${editingId === t.id ? 'bg-orange-50 border border-orange-200' : ''}`}>
                                    <div>
                                        <p className="font-bold text-sm flex items-center gap-1">
                                            {t.description} 
                                            {editingId === t.id && <span className="text-orange-500 text-[9px]">(Editando)</span>}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {t.date.split('-').reverse().join('/')} • {t.category} • <span className="text-indigo-500 font-medium">{t.authorName || 'Membro'}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold text-sm ${colorClass}`}>
                                            {sign} R$ {Number(t.value).toFixed(2)}
                                        </span>
                                        <button onClick={()=>startEditing(t)} className="text-blue-400 hover:text-blue-600 p-1"><Edit size={14}/></button><button onClick={()=>removeTransaction(t.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            );
                        })}
                        {transactions.length === 0 && <div className="text-center text-gray-400 py-10 flex flex-col items-center"><List size={40} className="mb-2 opacity-20"/><p>Nenhum lançamento.</p></div>}
                    </div>
                 </div>
             </div>
           )}

           {activeTab === 'goals' && (
               <div className="max-w-6xl mx-auto space-y-8">
                   
                   {/* --- FORMULÁRIO ESTILIZADO --- */}
                   <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-50">
                       <h3 className="text-lg font-bold text-purple-800 mb-6 flex items-center gap-2 border-b pb-2">
                           <Target className="text-purple-600"/> Planejar Nova Conquista
                       </h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                           {/* Nome da Meta */}
                           <div className="md:col-span-4">
                               <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Nome da Meta</label>
                               <input 
                                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 outline-none transition-all" 
                                   placeholder="Ex: Viagem, Carro Novo..." 
                                   value={goalForm.name} 
                                   onChange={e=>setGoalForm({...goalForm, name:e.target.value})}
                               />
                           </div>
                           
                           {/* Valor Alvo */}
                           <div className="md:col-span-3">
                               <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Quanto precisa? (R$)</label>
                               <input 
                                   type="number" 
                                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 outline-none" 
                                   placeholder="0,00" 
                                   value={goalForm.targetAmount} 
                                   onChange={e=>setGoalForm({...goalForm, targetAmount:e.target.value})}
                               />
                           </div>
                           
                           {/* Data Alvo */}
                           <div className="md:col-span-3">
                               <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Data Alvo</label>
                               <input 
                                   type="date" 
                                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-gray-50 outline-none text-gray-600" 
                                   value={goalForm.targetDate} 
                                   onChange={e=>setGoalForm({...goalForm, targetDate:e.target.value})}
                               />
                           </div>
                           
                           {/* Botão Criar */}
                           <div className="md:col-span-2 flex items-end">
                               <button 
                                   onClick={addGoal} 
                                   className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                               >
                                   Criar
                               </button>
                           </div>
                           
                           {/* Descrição */}
                           <div className="md:col-span-12">
                               <input 
                                   className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                                   placeholder="Descrição ou detalhes adicionais (Opcional)" 
                                   value={goalForm.description} 
                                   onChange={e=>setGoalForm({...goalForm, description:e.target.value})}
                               />
                           </div>
                       </div>
                   </div>

                   {/* --- LISTA DE METAS (CARDS COM BOTÕES) --- */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {goals.map(g => {
                           const percent = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
                           
                           return (
                               <div key={g.id} className="group bg-white rounded-2xl p-6 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-[0_10px_20px_rgba(0,0,0,0.08)] border-b-4 border-purple-500 flex flex-col justify-between h-full">
                                   
                                   {/* Conteúdo Principal */}
                                   <div>
                                       <div className="mb-4">
                                           <h4 className="font-bold text-gray-800 text-xl leading-tight">{g.name}</h4>
                                           <p className="text-sm text-gray-600 mt-1">{g.description || 'Sem descrição'}</p>
                                       </div>
                                       
                                       <div className="mb-6">
                                           <div className="flex justify-between items-end mb-2">
                                               <span className="text-3xl font-bold text-purple-700">
                                                   R$ {g.currentAmount ? parseFloat(g.currentAmount).toFixed(2) : '0.00'}
                                               </span>
                                           </div>
                                           <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                                <span>Progresso ({percent.toFixed(0)}%)</span>
                                                <span>Meta: R$ {g.targetAmount}</span>
                                           </div>
                                           
                                           <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border border-gray-300">
                                               <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{width: `${percent}%`}}></div>
                                           </div>
                                           
                                           <div className="flex justify-between mt-3 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                                               <span>{g.targetDate ? `Alvo: ${g.targetDate.split('-').reverse().join('/')}` : 'Sem prazo'}</span>
                                               <span>Por: {g.authorName || 'Membro'}</span>
                                           </div>
                                       </div>
                                   </div>

                                   {/* Área de Ações (Botões) */}
                                   <div className="pt-4 border-t border-gray-100 mt-2 space-y-2">
                                       <div className="grid grid-cols-2 gap-2">
                                           <button onClick={()=>addValueToTarget('goal', g.id, prompt('Valor para investir na meta:'))} className="flex items-center justify-center gap-1 text-xs bg-green-50 text-green-700 py-2.5 rounded-lg font-bold hover:bg-green-100 transition-colors border border-green-200 shadow-sm">
                                               <DollarSign size={14}/> Investir
                                           </button>
                                           <button onClick={()=>setWithdrawModal({show:true, type:'goal', id:g.id, name:g.name})} className="flex items-center justify-center gap-1 text-xs bg-blue-50 text-blue-700 py-2.5 rounded-lg font-bold hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm">
                                               <Upload size={14}/> Resgatar
                                           </button>
                                       </div>
                                       
                                       {/* Botão Excluir GRANDE e Visível */}
                                       <button onClick={()=>deleteGoal(g.id)} className="w-full flex items-center justify-center gap-1 text-xs text-red-500 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors border border-transparent hover:border-red-200">
                                           <Trash2 size={14}/> Excluir Meta (Devolver Saldo)
                                       </button>
                                   </div>
                               </div>
                           );
                       })}
                       
                       {goals.length === 0 && (
                           <div className="col-span-1 md:col-span-3 py-16 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl">
                               <Target size={64} className="mb-4 opacity-20"/>
                               <p className="text-lg font-medium text-gray-400">Nenhuma meta criada ainda.</p>
                               <p className="text-sm">Use o formulário acima para começar a planejar.</p>
                           </div>
                       )}
                   </div>
               </div>
           )}

            {activeTab === 'investments' && (
               <div className="max-w-6xl mx-auto space-y-8">
                   
                   {/* --- FORMULÁRIO DE INVESTIMENTO --- */}
                   <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50">
                       <h3 className="text-lg font-bold text-indigo-800 mb-6 flex items-center gap-2 border-b pb-2">
                           <Briefcase className="text-indigo-600"/> Novo Investimento
                       </h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                           {/* Nome */}
                           <div className="md:col-span-5">
                               <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Nome do Ativo</label>
                               <input 
                                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 outline-none transition-all" 
                                   placeholder="Ex: CDB Nubank, Ações Petrobras..." 
                                   value={investmentForm.name} 
                                   onChange={e=>setInvestmentForm({...investmentForm, name:e.target.value})}
                               />
                           </div>
                           
                           {/* Tipo */}
                           <div className="md:col-span-3">
                               <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Tipo</label>
                               <select 
                                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 outline-none"
                                   value={investmentForm.type} 
                                   onChange={e=>setInvestmentForm({...investmentForm, type:e.target.value})}
                               >
                                   <option>Renda Fixa</option>
                                   <option>Ações / Bolsa</option>
                                   <option>Fundos Imobiliários</option>
                                   <option>Criptomoedas</option>
                                   <option>Poupança</option>
                                   <option>Outros</option>
                               </select>
                           </div>

                           {/* Valor Inicial */}
                           <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Início (R$)</label>
                               <input 
                                   type="number" 
                                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 outline-none" 
                                   placeholder="0,00" 
                                   value={investmentForm.currentAmount} 
                                   onChange={e=>setInvestmentForm({...investmentForm, currentAmount:e.target.value})}
                               />
                           </div>
                           
                           {/* Botão Criar */}
                           <div className="md:col-span-2 flex items-end">
                               <button 
                                   onClick={addInvestment} 
                                   className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                               >
                                   Criar
                               </button>
                           </div>
                       </div>
                   </div>

                   {/* --- CARTEIRA DE INVESTIMENTOS --- */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {investments.map(i => (
                           <div key={i.id} className="group bg-white rounded-2xl p-6 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-[0_10px_20px_rgba(0,0,0,0.08)] border-b-4 border-indigo-500 flex flex-col justify-between h-full">
                               
                               {/* Botão Excluir Discreto */}
                               <button onClick={()=>deleteInvestment(i.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors bg-transparent p-1 rounded-full hover:bg-red-50" title="Encerrar Investimento">
                                   <Trash2 size={18}/>
                               </button>
                               
                               {/* Cabeçalho */}
                               <div className="mb-4 pr-8">
                                   <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2 border border-indigo-100">
                                       {i.type || 'Renda Fixa'}
                                   </span>
                                   <h4 className="font-bold text-gray-800 text-xl leading-tight truncate">{i.name}</h4>
                               </div>
                               
                               {/* Valor Principal */}
                               <div className="mb-6">
                                   <p className="text-xs text-gray-400 font-medium mb-1">Saldo Atual</p>
                                   <span className="text-3xl font-bold text-indigo-700 tracking-tight">
                                       R$ {i.currentAmount ? parseFloat(i.currentAmount).toFixed(2) : '0.00'}
                                   </span>
                                   
                                   <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex justify-between text-[10px] text-gray-400 uppercase font-bold">
                                       <span>Status: Ativo</span>
                                       <span>Por: {i.authorName || 'Membro'}</span>
                                   </div>
                               </div>

                               {/* Ações */}
                               <div className="pt-2 space-y-2">
                                   <div className="grid grid-cols-2 gap-2">
                                       <button onClick={()=>addValueToTarget('investment', i.id, prompt('Valor do Aporte (R$):'))} className="flex items-center justify-center gap-1 text-xs bg-green-50 text-green-700 py-2.5 rounded-lg font-bold hover:bg-green-100 transition-colors border border-green-200 shadow-sm">
                                           <TrendingUp size={14}/> Aportar
                                       </button>
                                       <button onClick={()=>setWithdrawModal({show:true, type:'investment', id:i.id, name:i.name})} className="flex items-center justify-center gap-1 text-xs bg-blue-50 text-blue-700 py-2.5 rounded-lg font-bold hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm">
                                           <DollarSign size={14}/> Resgatar
                                       </button>
                                   </div>
                                   
                                   {/* Botão Excluir GRANDE */}
                                   <button onClick={()=>deleteInvestment(i.id)} className="w-full flex items-center justify-center gap-1 text-xs text-red-400 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                                       <XCircle size={14}/> Encerrar Posição (Sacar Tudo)
                                   </button>
                               </div>
                           </div>
                       ))}
                       
                       {investments.length === 0 && (
                           <div className="col-span-1 md:col-span-3 py-16 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl">
                               <Briefcase size={64} className="mb-4 opacity-20"/>
                               <p className="text-lg font-medium text-gray-400">Carteira vazia.</p>
                               <p className="text-sm">Adicione seu primeiro investimento acima.</p>
                           </div>
                       )}
                   </div>
               </div>
           )}

           {activeTab === 'settings' && (
               <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-8">
                   
                   {/* --- 1. DADOS DA FAMÍLIA ATUAL (ID e PIN) --- */}
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 flex flex-col md:flex-row gap-6 items-center justify-between">
                       <div className="flex items-center gap-3">
                           <div className="bg-indigo-100 p-3 rounded-full text-indigo-600"><Users size={24}/></div>
                           <div>
                               <h3 className="font-bold text-indigo-900">Sua Família Atual</h3>
                               <p className="text-xs text-gray-500">Compartilhe estes dados com quem for acessar.</p>
                           </div>
                       </div>
                       
                       <div className="flex gap-4 w-full md:w-auto">
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1 text-center">
                               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">ID da Família</p>
                               <p className="text-sm font-mono font-bold text-gray-800 select-all">{currentUser.familyId}</p>
                           </div>
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 w-32 text-center relative group">
                               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">PIN de Acesso</p>
                               <div className="flex items-center justify-center gap-2">
                                   <div className="flex items-center gap-1 cursor-pointer" onClick={() => alert(`Seu PIN é: ${familyPin || '0000'}`)}>
                                       <p className="text-sm font-mono font-bold text-gray-800">****</p>
                                       <Eye size={14} className="text-gray-400"/>
                                   </div>
                                   <button onClick={handleEditPin} className="text-blue-500 hover:text-blue-700 ml-1" title="Alterar PIN">
                                       <Edit size={14}/>
                                   </button>
                               </div>
                           </div>
                       </div>
                   </div>

                   {/* --- 2. ENTRAR EM OUTRA FAMÍLIA --- */}
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                       <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                           <LogIn size={20} className="text-blue-600"/> Conectar a Outra Família
                       </h3>
                       <div className="flex flex-col md:flex-row gap-3 items-end">
                           <div className="w-full">
                               <label className="block text-xs font-bold text-gray-500 mb-1">ID da Família</label>
                               <input 
                                   className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm" 
                                   placeholder="Cole o ID aqui..."
                                   value={joinFamilyForm.familyId}
                                   onChange={e => setJoinFamilyForm({...joinFamilyForm, familyId: e.target.value})}
                               />
                           </div>
                           <div className="w-32">
                               <label className="block text-xs font-bold text-gray-500 mb-1">PIN</label>
                               <input 
                                   className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm text-center" 
                                   placeholder="0000"
                                   maxLength={6}
                                   value={joinFamilyForm.pin}
                                   onChange={e => setJoinFamilyForm({...joinFamilyForm, pin: e.target.value})}
                               />
                           </div>
                           <button onClick={handleJoinFamily} className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm whitespace-nowrap">
                               Entrar
                           </button>
                       </div>
                   </div>

                   {/* --- 3. GERENCIAMENTO DE CATEGORIAS --- */}
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                       <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                           <List size={20} className="text-gray-600"/> Personalizar Categorias
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div>
                               <h4 className="font-bold text-green-700 mb-3 text-sm">Categorias de Receitas</h4>
                               <div className="flex gap-2 mb-3">
                                   <input className="flex-1 p-2 border rounded-lg text-sm bg-gray-50" placeholder="Nova categoria..." value={newIncomeCat} onChange={e => setNewIncomeCat(e.target.value)} />
                                   <button onClick={() => handleAddCategory('income', newIncomeCat)} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700">+</button>
                               </div>
                               <div className="flex flex-wrap gap-2">{incomeCategories.map(cat => (<span key={cat} className="px-3 py-1 bg-green-50 text-green-800 rounded-full text-xs font-medium border border-green-100 flex items-center gap-2 group">{cat}<button onClick={() => handleRemoveCategory('income', cat)} className="text-green-400 hover:text-red-500"><XCircle size={12}/></button></span>))}</div>
                           </div>
                           <div>
                               <h4 className="font-bold text-red-700 mb-3 text-sm">Categorias de Despesas</h4>
                               <div className="flex gap-2 mb-3">
                                   <input className="flex-1 p-2 border rounded-lg text-sm bg-gray-50" placeholder="Nova categoria..." value={newExpenseCat} onChange={e => setNewExpenseCat(e.target.value)} />
                                   <button onClick={() => handleAddCategory('expense', newExpenseCat)} className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700">+</button>
                               </div>
                               <div className="flex flex-wrap gap-2">{expenseCategories.map(cat => (<span key={cat} className="px-3 py-1 bg-red-50 text-red-800 rounded-full text-xs font-medium border border-red-100 flex items-center gap-2 group">{cat}<button onClick={() => handleRemoveCategory('expense', cat)} className="text-red-400 hover:text-red-500"><XCircle size={12}/></button></span>))}</div>
                           </div>
                       </div>
                   </div>

                   {/* --- 4. ZONA DE PERIGO E DADOS --- */}
                   <div className="flex flex-col md:flex-row gap-4">
                       <div className="bg-white p-6 rounded-xl shadow border-l-4 border-orange-500 flex-1">
                           <h3 className="font-bold mb-2 flex items-center gap-2 text-sm"><Upload size={16}/> Migrar Dados Locais</h3>
                           <label className="bg-orange-50 text-orange-700 px-4 py-2 rounded cursor-pointer font-bold block text-center text-xs border border-orange-200 hover:bg-orange-100">Selecionar Backup JSON<input type="file" accept=".json" onChange={importDataToFirebase} className="hidden" /></label>
                       </div>
                       <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-600 flex-1">
                           <h3 className="font-bold mb-2 flex items-center gap-2 text-red-700 text-sm"><AlertTriangle size={16}/> Zona de Perigo</h3>
                           <button onClick={resetAllData} className="w-full bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all text-xs flex justify-center items-center gap-2"><Trash2 size={14}/> Resetar Tudo</button>
                       </div>
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