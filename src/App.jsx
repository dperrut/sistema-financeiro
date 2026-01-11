import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';

// --- IMPORTAÇÃO DE COMPONENTES CUSTOMIZADOS (CRIADOS NA FASE 2) ---
import SummaryCards from './components/SummaryCards';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import GoalsView from './components/GoalsView';
import InvestmentsView from './components/InvestmentsView';
import SettingsView from './components/SettingsView';
import Toast from './components/Toast';

// --- IMPORTAÇÕES DO FIREBASE ---
import { auth, db } from './firebase'; 
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { 
    ref, set, push, remove, onValue, update, get 
} from 'firebase/database';

export default function App() {
  // ==================================================================================
  // 1. ESTADOS GERAIS
  // ==================================================================================
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); 
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '', pin: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [familyName, setFamilyName] = useState('Minha Família');
  const [familyPin, setFamilyPin] = useState(''); 
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState(['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros']);
  const [incomeCategories, setIncomeCategories] = useState(['Salário', 'Extra', 'Investimento', 'Presente', 'Outros']);
  const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#84CC16', '#14B8A6'];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };
  const [withdrawModal, setWithdrawModal] = useState({ show: false, type: '', id: null, name: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });
  const [incomeForm, setIncomeForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: '' });
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: '', paymentMethod: 'Cartão de Crédito', installments: '1' });
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '' });
  const [investmentForm, setInvestmentForm] = useState({ name: '', type: 'Renda Fixa', currentAmount: '' });
  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [joinFamilyForm, setJoinFamilyForm] = useState({ familyId: '', pin: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // --- FUNÇÕES DE FORMATAÇÃO (FASE 3) ---
  const formatMonthYear = (date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handleCurrencyChange = (e, setter, form, field) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (Number(value) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    setter({ ...form, [field]: value });
  };

  // ==================================================================================
  // 2. CONEXÃO COM A NUVEM E SINCRONIZAÇÃO
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
              setFamilyPin(data.pin || '0000'); 
              if (data.transactions) setTransactions(Object.values(data.transactions)); else setTransactions([]);
              if (data.goals) setGoals(Object.values(data.goals)); else setGoals([]);
              if (data.investments) setInvestments(Object.values(data.investments)); else setInvestments([]);
              if (data.expenseCategories) setExpenseCategories(data.expenseCategories);
              if (data.incomeCategories) setIncomeCategories(data.incomeCategories);
          }
      });
  };

  // ==================================================================================
  // 3. LÓGICA DE AÇÃO (FUNÇÕES QUE VOCÊ CRIOU)
  // ==================================================================================

  const handleAuth = async (e) => {
    e.preventDefault();

    // Validação simples de preenchimento
    if (!loginForm.email || !loginForm.password) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        if (authMode === 'login') {
            // Lógica de Login
            await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
        } else if (authMode === 'register') {
            // 1. Cria o usuário no Firebase Auth
            const userCred = await createUserWithEmailAndPassword(auth, loginForm.email, loginForm.password);
            const uid = userCred.user.uid;

            // 2. Prepara a criação da nova família no Realtime Database
            const familyRef = push(ref(db, 'families'));
            const familyId = familyRef.key;
            const firstName = loginForm.name.split(' ')[0];
            const nomeFamilia = `Família ${firstName}`;

            // 3. Salva os dados da Família
            await set(familyRef, {
                id: familyId,
                name: nomeFamilia,
                pin: loginForm.pin,
                createdBy: uid,
                members: { [uid]: loginForm.name },
                expenseCategories, // Assume-se que estas variáveis existam no escopo
                incomeCategories    // Assume-se que estas variáveis existam no escopo
            });

            // 4. Salva os dados do Usuário (vinculando ao familyId)
            await set(ref(db, `users/${uid}`), {
                name: loginForm.name,
                email: loginForm.email,
                familyId: familyId,
                role: 'admin' // Definindo o criador como admin por padrão
            });

            // 5. Atualiza o perfil do usuário no Auth (displayName)
            await updateProfile(userCred.user, { displayName: loginForm.name });
            
            alert("Conta e Família criadas com sucesso!");
        }
    } catch (error) {
        console.error("Erro na autenticação:", error);
        
        // Tratamento de erros amigável
        let mensagemErro = "Ocorreu um erro inesperado.";
        if (error.code === 'auth/email-already-in-use') mensagemErro = "Este e-mail já está em uso.";
        if (error.code === 'auth/weak-password') mensagemErro = "A senha deve ter pelo menos 6 caracteres.";
        if (error.code === 'auth/invalid-email') mensagemErro = "E-mail inválido.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            mensagemErro = "E-mail ou senha incorretos.";
        }

        alert(mensagemErro);
    }
};

  const handleLogout = () => { 
      setLoginForm({ email: '', password: '', name: '', pin: '' });
      setAuthMode('login');
      signOut(auth); 
  };

  const handleEditPin = async () => {
      const newPin = prompt("Digite o novo PIN:");
      if (newPin) await update(ref(db, `families/${currentUser.familyId}`), { pin: newPin });
  };

  const handleJoinFamily = async () => {
      const targetFamilyId = joinFamilyForm.familyId.trim();
      const familySnapshot = await get(ref(db, `families/${targetFamilyId}`));
      if (familySnapshot.exists()) {
          const familyData = familySnapshot.val();
          if (String(familyData.pin) === String(joinFamilyForm.pin)) {
              await update(ref(db, `users/${currentUser.uid}`), { familyId: targetFamilyId });
              window.location.reload();
          } else { alert("PIN incorreto"); }
      }
  };

  const addTransaction = (type) => {
    try {
      const isExpense = type === 'expense' || type === 'despesa';
      const form = isExpense ? expenseForm : incomeForm;
      
      if (!form.description || !form.amount) return alert('Preencha os dados.');
      
      const val = parseFloat(form.amount.toString().replace(/\./g, '').replace(',', '.'));
      if (isNaN(val) || val <= 0) return alert("Valor inválido.");
      
      const fid = currentUser.familyId;
      const id = Date.now().toString();
      const metaData = { createdBy: currentUser.uid, authorName: currentUser.name || 'Membro' };

      // Salvando no Firebase
      set(ref(db, `families/${fid}/transactions/${id}`), { 
        id, 
        type: isExpense ? 'despesa' : 'receita', 
        description: form.description, 
        amount: form.amount, 
        value: val, 
        date: form.date, 
        category: form.category || (isExpense ? expenseCategories[0] : incomeCategories[0]),
        paymentMethod: isExpense ? (form.paymentMethod || 'Cartão de Crédito') : null, 
        ...metaData 
      }).then(() => {
        // --- AQUI ESTÁ A CORREÇÃO: LIMPANDO OS CAMPOS ---
        if (isExpense) {
          setExpenseForm({ 
            date: new Date().toISOString().split('T')[0], 
            description: '', 
            amount: '', 
            category: expenseCategories[0], 
            paymentMethod: 'Cartão de Crédito', 
            installments: '1' 
          });
          showToast("Despesa adicionada!", "success");
        } else {
          setIncomeForm({ 
            date: new Date().toISOString().split('T')[0], 
            description: '', 
            amount: '', 
            category: incomeCategories[0] 
          });
          showToast("Receita adicionada!", "success");
        }
      });
    } catch { 
      showToast("Erro ao salvar", "error"); 
    }
  };

  const removeTransaction = (id) => { remove(ref(db, `families/${currentUser.familyId}/transactions/${id}`)); };

  const startEditing = (t) => { setEditingId(t.id); setActiveTab('transactions'); };

  const addGoal = async () => {
    // TRAVA DE SEGURANÇA: Verifica se os campos principais estão vazios
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.targetDate) {
      alert("⚠️ Por favor, preencha o nome, o valor alvo e a data da meta!");
      return;
    }

    const id = Date.now().toString();
    const newGoal = {
      ...goalForm,
      id,
      currentAmount: 0,
      createdAt: new Date().toISOString()
    };
    
    await set(ref(db, `families/${currentUser.familyId}/goals/${id}`), newGoal);
    setGoalForm({ name: '', targetAmount: '', targetDate: '', description: '' });
    alert("🎯 Meta criada com sucesso!");
  };

  const deleteGoal = async (id) => {
    const metaParaDeletar = goals.find(g => g.id === id);
    if (!metaParaDeletar) return;

    const saldoExistente = parseFloat(metaParaDeletar.currentAmount || 0);

    if (saldoExistente > 0) {
      const confirmar = window.confirm(
        `Esta meta possui R$ ${saldoExistente.toFixed(2)} acumulados. Ao excluir, este valor será transferido para o seu Saldo Livre. Deseja continuar?`
      );
      if (confirmar) {
        // Transfere o saldo para transações antes de deletar
        const transId = Date.now().toString();
        await set(ref(db, `families/${currentUser.familyId}/transactions/${transId}`), {
          id: transId,
          type: 'receita',
          description: `Estorno (Exclusão de Meta): ${metaParaDeletar.name}`,
          amount: saldoExistente.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          value: saldoExistente,
          date: new Date().toISOString().split('T')[0],
          category: 'Estorno',
          createdBy: currentUser.uid,
          authorName: currentUser.name
        });
        await remove(ref(db, `families/${currentUser.familyId}/goals/${id}`));
        alert("Meta excluída e saldo transferido para o Saldo Livre.");
      }
    } else {
      if (window.confirm("Tem certeza que deseja excluir esta meta?")) {
        await remove(ref(db, `families/${currentUser.familyId}/goals/${id}`));
      }
    }
  };

  const addInvestment = async () => {
    // TRAVA DE SEGURANÇA
    if (!investmentForm.name || !investmentForm.targetAmount || !investmentForm.targetDate) {
      alert("⚠️ Por favor, preencha todos os campos do investimento!");
      return;
    }

    const id = Date.now().toString();
    const newInv = {
      ...investmentForm,
      id,
      currentAmount: 0,
      createdAt: new Date().toISOString()
    };
    
    await set(ref(db, `families/${currentUser.familyId}/investments/${id}`), newInv);
    setInvestmentForm({ name: '', targetAmount: '', targetDate: '' });
    alert("💰 Investimento registrado!");
  };

  const deleteInvestment = async (id) => {
    const invParaDeletar = investments.find(i => i.id === id);
    if (!invParaDeletar) return;

    const saldoExistente = parseFloat(invParaDeletar.currentAmount || 0);

    if (saldoExistente > 0) {
      const confirmar = window.confirm(
        `Este investimento possui R$ ${saldoExistente.toFixed(2)} acumulados. Ao excluir, este valor será transferido para o seu Saldo Livre. Deseja continuar?`
      );
      if (confirmar) {
        const transId = Date.now().toString();
        await set(ref(db, `families/${currentUser.familyId}/transactions/${transId}`), {
          id: transId,
          type: 'receita',
          description: `Estorno (Exclusão de Invest.): ${invParaDeletar.name}`,
          amount: saldoExistente.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          value: saldoExistente,
          date: new Date().toISOString().split('T')[0],
          category: 'Estorno',
          createdBy: currentUser.uid,
          authorName: currentUser.name
        });
        await remove(ref(db, `families/${currentUser.familyId}/investments/${id}`));
        alert("Investimento excluído e saldo transferido para o Saldo Livre.");
      }
    } else {
      if (window.confirm("Tem certeza que deseja excluir este investimento?")) {
        await remove(ref(db, `families/${currentUser.familyId}/investments/${id}`));
      }
    }
  };

  const addValueToTarget = async (type, id, vStr) => {
      const val = parseFloat(vStr.toString().replace(/\./g, '').replace(',', '.'));
      if (isNaN(val) || val <= 0) return;

      const path = type === 'goal' ? 'goals' : 'investments';
      const list = type === 'goal' ? goals : investments;
      const item = list.find(i => i.id === id);

      // 1. Aumenta o valor dentro da Meta/Investimento
      await update(ref(db, `families/${currentUser.familyId}/${path}/${id}`), { 
        currentAmount: (item.currentAmount || 0) + val 
      });

      // 2. Registra uma "Saída" no Saldo Livre (Categoria: Aporte)
      const transId = Date.now().toString();
      await set(ref(db, `families/${currentUser.familyId}/transactions/${transId}`), {
        id: transId,
        type: 'despesa', // Tipo despesa para subtrair do Saldo Livre
        description: `Aporte: ${item.name}`,
        amount: val.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        value: val,
        date: new Date().toISOString().split('T')[0],
        category: 'Aporte', // Categoria especial para identificarmos depois
        createdBy: currentUser.uid,
        authorName: currentUser.name
      });
  };

  const confirmWithdraw = async (e) => {
      e.preventDefault();
      const val = parseFloat(withdrawForm.amount.toString().replace(/\./g, '').replace(',', '.'));
      const path = withdrawModal.type === 'goal' ? 'goals' : 'investments';
      const list = withdrawModal.type === 'goal' ? goals : investments;
      const item = list.find(i => i.id === withdrawModal.id);

      if (!item) return;

      // Verificação de meta não batida ou data antecipada (apenas para metas)
      if (withdrawModal.type === 'goal') {
        const hoje = new Date();
        const dataMeta = new Date(item.targetDate);
        const metaNaoBatida = val > (item.currentAmount || 0);
        const dataAntecipada = dataMeta > hoje;

        if (metaNaoBatida || dataAntecipada) {
          const confirmar = window.confirm(
            "Atenção: Esta meta ainda não foi atingida ou o prazo de resgate não chegou. Deseja realmente resgatar este valor?"
          );
          if (!confirmar) return;
        }
      }

      // 1. Atualiza o valor na Meta/Investimento (diminui o saldo lá)
      await update(ref(db, `families/${currentUser.familyId}/${path}/${withdrawModal.id}`), { 
        currentAmount: (item.currentAmount || 0) - val 
      });

      // 2. Cria uma transação automática para o Saldo Livre
      const transId = Date.now().toString();
      await set(ref(db, `families/${currentUser.familyId}/transactions/${transId}`), {
        id: transId,
        type: 'receita',
        description: `Resgate: ${item.name}`,
        amount: val.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        value: val,
        date: new Date().toISOString().split('T')[0],
        category: 'Resgate',
        createdBy: currentUser.uid,
        authorName: currentUser.name
      });

      alert(`Sucesso! O valor de R$ ${val.toFixed(2)} já está disponível em seu Saldo Livre.`);
      setWithdrawModal({ show: false });
      setWithdrawForm({ amount: '', reason: '' });
  };

  const handleAddCategory = (type, value) => {
      const path = type === 'expense' ? 'expenseCategories' : 'incomeCategories';
      const newList = type === 'expense' ? [...expenseCategories, value] : [...incomeCategories, value];
      set(ref(db, `families/${currentUser.familyId}/${path}`), newList);
  };

  const handleRemoveCategory = (type, value) => {
      const path = type === 'expense' ? 'expenseCategories' : 'incomeCategories';
      const newList = (type === 'expense' ? expenseCategories : incomeCategories).filter(c => c !== value);
      set(ref(db, `families/${currentUser.familyId}/${path}`), newList);
  };

  const resetAllData = () => { if(window.confirm("Zerar tudo?")) set(ref(db, `families/${currentUser.familyId}`), { name: familyName, pin: familyPin }); };

  // --- FUNÇÃO DE EXPORTAÇÃO (ADICIONADA) ---
  const handleExportData = () => {
    try {
      const data = { 
        familyName, familyPin, transactions, goals, 
        investments, incomeCategories, expenseCategories 
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${familyName}.json`;
      
      document.body.appendChild(link); // Adiciona o link temporariamente
      link.click();
      document.body.removeChild(link); // Remove após o clique
      URL.revokeObjectURL(url); // Limpa a memória do navegador
      
      // Notificação de Sucesso
      if (typeof showToast === 'function') {
          showToast("Backup exportado com sucesso!", "success");
      } else {
          alert("Backup exportado com sucesso!");
      }

    } catch (error) { // <--- ADICIONADO O (error) AQUI PARA DEFINIR A VARIÁVEL
      // Se algo der errado, avisamos o usuário
      if (typeof showToast === 'function') {
          showToast("Erro ao exportar backup", "error");
      } else {
          alert("Erro ao exportar backup");
      }
      console.error("Erro na exportação:", error); 
    }
  };

  // --- FUNÇÃO: IMPORTAR BACKUP (JSON) PARA O FIREBASE (FASE 3) ---
  const importDataToFirebase = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validação: o arquivo tem estrutura de backup?
        if (!data.transactions && !data.goals && !data.investments) {
          throw new Error('Arquivo de backup inválido.');
        }

        if (window.confirm(`Deseja restaurar o backup da "${data.familyName || 'Família'}"? Isso substituirá seus dados atuais.`)) {
          const fid = currentUser.familyId;
          const updates = {};
          
          // Converte arrays do JSON em objetos para o Firebase
          if (data.transactions) {
            const tObj = {};
            data.transactions.forEach(t => { tObj[t.id] = t; });
            updates['transactions'] = tObj;
          }
          if (data.goals) {
            const gObj = {};
            data.goals.forEach(g => { gObj[g.id] = g; });
            updates['goals'] = gObj;
          }
          if (data.investments) {
            const iObj = {};
            data.investments.forEach(i => { iObj[i.id] = i; });
            updates['investments'] = iObj;
          }

          // Categorias
          if (data.incomeCategories) updates['incomeCategories'] = data.incomeCategories;
          if (data.expenseCategories) updates['expenseCategories'] = data.expenseCategories;
          if (data.familyName) updates['name'] = data.familyName;
          if (data.familyPin) updates['pin'] = data.familyPin;

          // Envia para o Firebase
          await update(ref(db, `families/${fid}`), updates);
          
          showToast("Dados restaurados com sucesso!", "success");
        }
      } catch (err) {
        console.error(err);
        showToast("Falha ao importar: arquivo inválido.", "error");
      }
    };
    reader.readAsText(file);
  };

  // --- CÁLCULOS OTIMIZADOS COM USEMEMO (ADICIONADO) ---
  const totals = React.useMemo(() => {
    const currentMonthTrans = transactions.filter(t => {
      if (!t.date) return false;
      const [y, m] = t.date.split('-');
      return (parseInt(m) - 1) === currentDate.getMonth() && parseInt(y) === currentDate.getFullYear();
    });

    // RECEITA REAL: Ignora o que é apenas dinheiro voltando de metas (Resgate/Estorno)
    const inc = currentMonthTrans
      .filter(t => t.type === 'receita' && t.category !== 'Resgate' && t.category !== 'Estorno')
      .reduce((acc, c) => acc + Number(c.value), 0);

    // DESPESA REAL: Ignora o que é apenas dinheiro indo para metas (Aporte)
    const exp = currentMonthTrans
      .filter(t => t.type === 'despesa' && t.category !== 'Aporte')
      .reduce((acc, c) => acc + Number(c.value), 0);

    // SALDO DISPONÍVEL (LIVRE): Aqui entra a matemática pura de todas as transações
    const accBalance = transactions.reduce((acc, c) => 
      c.type === 'receita' ? acc + Number(c.value) : acc - Number(c.value), 0);

    const goalsTotal = goals.reduce((acc, c) => acc + (Number(c.currentAmount) || 0), 0);
    const investTotal = investments.reduce((acc, c) => acc + (Number(c.currentAmount) || 0), 0);

    // GRÁFICO DE PIZZA: Mostra apenas gastos de consumo (ignora aportes)
    const expensesByCategory = currentMonthTrans
      .filter(t => t.type === 'despesa' && t.category !== 'Aporte')
      .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + Number(curr.value);
        return acc;
      }, {});

    const pData = Object.keys(expensesByCategory).map(key => ({ name: key, value: expensesByCategory[key] }));

    // GRÁFICO DE BARRAS (Histórico): Também usa a lógica de Receita/Despesa Real
    const bData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' });
      const yearLabel = d.getFullYear();
      
      const monthTrans = transactions.filter(t => {
        if (!t.date) return false;
        const [y, m] = t.date.split('-');
        return (parseInt(m) - 1) === d.getMonth() && parseInt(y) === d.getFullYear();
      });

      const monthInc = monthTrans
        .filter(t => t.type === 'receita' && t.category !== 'Resgate' && t.category !== 'Estorno')
        .reduce((acc, c) => acc + Number(c.value), 0);
      const monthExp = monthTrans
        .filter(t => t.type === 'despesa' && t.category !== 'Aporte')
        .reduce((acc, c) => acc + Number(c.value), 0);

      return { name: `${monthLabel}/${yearLabel}`, Receita: monthInc, Despesa: monthExp };
    });

    return { 
      monthlyIncome: inc, 
      monthlyExpense: exp, 
      monthlyBalance: inc - exp, 
      accumulatedBalance: accBalance, 
      totalGoals: goalsTotal, 
      totalInvestments: investTotal, 
      totalPatrimony: accBalance + goalsTotal + investTotal, 
      pieData: pData, 
      barData: bData 
    };
  }, [transactions, goals, investments, currentDate]);

  const { monthlyIncome, monthlyExpense, monthlyBalance, accumulatedBalance, totalGoals, totalInvestments, totalPatrimony, pieData, barData } = totals;

  if (loading) return <div className="h-screen flex items-center justify-center bg-blue-900 text-white">Carregando...</div>;

  // TELA DE LOGIN (CASO NÃO LOGADO)
  if (!currentUser) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            {authMode === 'login' ? 'Bem-vindo de volta' : 'Criar Conta Familiar'}
          </h2>
          <p className="text-slate-500 mt-2">
            {authMode === 'login' ? 'Acesse suas finanças agora' : 'Comece a organizar sua economia hoje'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Campo E-mail */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input 
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              type="email" 
              placeholder="exemplo@email.com" 
              value={loginForm.email} 
              onChange={e => setLoginForm({...loginForm, email: e.target.value})} 
              required
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <div className="relative">
              <input 
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={loginForm.password} 
                onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          {/* Campos Extras para Registro */}
          {authMode === 'register' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <hr className="border-slate-100 my-2" />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Seu Nome Completo</label>
                <input 
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  type="text" 
                  placeholder="Como quer ser chamado?" 
                  value={loginForm.name} 
                  onChange={e => setLoginForm({...loginForm, name: e.target.value})} 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 text-blue-800">Definir PIN da Família (4 dígitos)</label>
                <div className="relative">
                  <input 
                    className="w-full p-3 border-2 border-blue-100 bg-blue-50/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-center text-lg tracking-[0.5em]" 
                    type={showPin ? "text" : "password"} 
                    maxLength="4"
                    placeholder="0000" 
                    value={loginForm.pin} 
                    onChange={e => setLoginForm({...loginForm, pin: e.target.value})} 
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPin ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic text-center">* Use este PIN para convidar membros para sua família.</p>
              </div>
            </div>
          )}

          {/* Botão Principal */}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all mt-6">
            {authMode === 'login' ? 'Entrar na Conta' : 'Criar Minha Família'}
          </button>

          {/* Alternar entre Login/Registro */}
          <button 
            type="button" 
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
            className="w-full mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors text-center block"
          >
            {authMode === 'login' ? 'Não tem conta? Cadastre sua família' : 'Já tem uma conta? Faça Login'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} familyName={familyName} />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
            <Header activeTab={activeTab} familyName={familyName} currentUser={currentUser} />

            {(activeTab === 'dashboard' || activeTab === 'transactions') && (
                <div className="bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm">
                    <button onClick={() => {const d = new Date(currentDate); d.setMonth(d.getMonth()-1); setCurrentDate(d)}} className="p-2 bg-gray-50 rounded-full"><ChevronLeft size={20}/></button>
                    <span className="font-bold text-gray-700 capitalize">{formatMonthYear(currentDate)}</span>
                    <button onClick={() => {const d = new Date(currentDate); d.setMonth(d.getMonth()+1); setCurrentDate(d)}} className="p-2 bg-gray-50 rounded-full"><ChevronRight size={20}/></button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                {activeTab === 'dashboard' && (
                    <DashboardView totalPatrimony={totalPatrimony} accumulatedBalance={accumulatedBalance} totalGoals={totalGoals} totalInvestments={totalInvestments} monthlyIncome={monthlyIncome} monthlyExpense={monthlyExpense} monthlyBalance={monthlyBalance} pieData={pieData} barData={barData} COLORS={COLORS} />
                )}

            {activeTab === 'transactions' && (
                <TransactionsView 
                accumulatedBalance={accumulatedBalance}
                totalPatrimony={totalPatrimony}
                totalGoals={totalGoals}
                totalInvestments={totalInvestments}
                monthlyIncome={monthlyIncome}
                monthlyExpense={monthlyExpense}
                monthlyBalance={monthlyBalance}
                editingId={editingId}
                setEditingId={setEditingId}
                incomeForm={incomeForm}
                setIncomeForm={setIncomeForm}
                expenseForm={expenseForm}
                setExpenseForm={setExpenseForm}
                addTransaction={addTransaction}
                startEditing={startEditing}
                removeTransaction={removeTransaction}
                incomeCategories={incomeCategories}
                expenseCategories={expenseCategories}
                transactions={transactions}
                currentDate={currentDate}
                formatMonthYear={formatMonthYear}
                currentUser={currentUser}
                handleCurrencyChange={handleCurrencyChange} // <--- LINHA ADICIONADA
                />
            )}

            {activeTab === 'goals' && (
                <GoalsView 
                    goalForm={goalForm}
                    setGoalForm={setGoalForm}
                    addGoal={addGoal}
                    goals={goals}
                    addValueToTarget={addValueToTarget}
                    deleteGoal={deleteGoal}
                    setWithdrawModal={setWithdrawModal}
                    handleCurrencyChange={handleCurrencyChange} // <--- LINHA ADICIONADA
                />
            )}

            {activeTab === 'investments' && (
                <InvestmentsView 
                    investmentForm={investmentForm}
                    setInvestmentForm={setInvestmentForm}
                    addInvestment={addInvestment}
                    investments={investments}
                    addValueToTarget={addValueToTarget}
                    deleteInvestment={deleteInvestment}
                    setWithdrawModal={setWithdrawModal}
                    handleCurrencyChange={handleCurrencyChange} // <--- LINHA ADICIONADA
                />
            )}

                {activeTab === 'settings' && (
                    <SettingsView 
                        currentUser={currentUser} 
                        familyPin={familyPin} 
                        handleEditPin={handleEditPin}
                        joinFamilyForm={joinFamilyForm} 
                        setJoinFamilyForm={setJoinFamilyForm} 
                        handleJoinFamily={handleJoinFamily}
                        newIncomeCat={newIncomeCat} 
                        setNewIncomeCat={setNewIncomeCat} 
                        handleAddCategory={handleAddCategory} 
                        incomeCategories={incomeCategories} 
                        handleRemoveCategory={handleRemoveCategory}
                        newExpenseCat={newExpenseCat} 
                        setNewExpenseCat={setNewExpenseCat} 
                        expenseCategories={expenseCategories}
                        
                        // LINHA CORRIGIDA AQUI:
                        importDataToFirebase={importDataToFirebase} 
                        
                        resetAllData={resetAllData} 
                        handleExportData={handleExportData}
                    />
                )}

                {withdrawModal.show && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                            <h3 className="font-bold text-red-600 mb-4">Resgatar de {withdrawModal.name}</h3>
                            <form onSubmit={confirmWithdraw}>
                                <input type="number" step="0.01" className="w-full p-3 border rounded mb-4" placeholder="Valor" value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} autoFocus />
                                <div className="flex justify-end gap-2"><button type="button" onClick={() => setWithdrawModal({ show: false })} className="px-4 py-2 bg-gray-200 rounded font-bold">Cancelar</button><button className="px-4 py-2 bg-red-600 text-white rounded font-bold">Confirmar</button></div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            {/* --- SISTEMA DE NOTIFICAÇÕES TOAST (FASE 3) --- */}
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ ...toast, show: false })} 
          />
        )}
        </main>
    </div>
  );
}