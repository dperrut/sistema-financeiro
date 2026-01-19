import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, ArrowUpCircle, ArrowDownCircle
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [familyName, setFamilyName] = useState('Minha Família');
  const [familyPin, setFamilyPin] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  // --- NOVO: ESTADO DOS CARTÕES DE CRÉDITO ---
  const [creditCards, setCreditCards] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState(['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros']);
  const [incomeCategories, setIncomeCategories] = useState(['Salário', 'Extra', 'Investimento', 'Presente', 'Outros']);
  const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#84CC16', '#14B8A6'];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };
  // --- NOVO SISTEMA DE MODAL UNIFICADO ---
  const [transactionModal, setTransactionModal] = useState({
    show: false, action: '', type: '', id: null, name: ''
  });
  const [transactionForm, setTransactionForm] = useState({ amount: '' });

// --- LÓGICA DO MODO ESCURO (DARK MODE PERSISTENTE) ---
  const [darkMode, setDarkMode] = useState(() => {
    // Ao iniciar, busca se já existe preferência salva
    const saved = localStorage.getItem('finances_theme');
    return saved === 'dark';
  });
  
  // Estado para o Modal de Antecipação (MANTIDO AQUI!)
  const [anticipateModal, setAnticipateModal] = useState({ show: false, transaction: null });
  const [anticipateCount, setAnticipateCount] = useState(1);

  // Efeito que aplica a classe E SALVA a preferência
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('finances_theme', 'dark'); // Salva 'dark'
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('finances_theme', 'light'); // Salva 'light'
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // Função auxiliar para abrir o modal (usada pelos filhos)
  const [withdrawModal, setWithdrawModal] = useState({ show: false, type: '', id: null, name: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', reason: '' });
  const [incomeForm, setIncomeForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: '' });
  const [expenseForm, setExpenseForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    description: '', 
    amount: '', 
    category: '', 
    paymentMethod: 'Cartão de Crédito', 
    installments: '1', 
    isInstallmentValue: false,
    isFixed: false // <--- CAMPO NOVO AQUI
  });
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '' });
  const [investmentForm, setInvestmentForm] = useState({ name: '', initialAmount: '' });
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
            if (profile.familyId) {
              listenToFamilyData(profile.familyId);
              checkRecurrences(profile.familyId); // <--- ROBÔ ACORDA AQUI
            }
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
        if (data.creditCards) setCreditCards(Object.values(data.creditCards)); else setCreditCards([]);        
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

  // --- FUNÇÃO ADD TRANSACTION TURBINADA COM PARCELAMENTO ---
  // --- FUNÇÃO ADD TRANSACTION TURBINADA COM PARCELAMENTO E CHECKBOX ---
  const addTransaction = async (type) => {
    try {
      const isExpense = type === 'expense' || type === 'despesa';
      const form = isExpense ? expenseForm : incomeForm;
      
      if (!form.description || !form.amount) return alert('Preencha os dados.');
      
      // Valor digitado (pode ser total ou parcela, depende do checkbox)
      const inputVal = parseFloat(form.amount.toString().replace(/\./g, '').replace(',', '.'));
      if (isNaN(inputVal) || inputVal <= 0) return alert("Valor inválido.");
      
      const fid = currentUser.familyId;
      const metaData = { createdBy: currentUser.uid, authorName: currentUser.name || 'Membro' };
      
      const installmentsStr = form.installments ? form.installments.toString() : '1';
      const numInstallments = isExpense ? (parseInt(installmentsStr) || 1) : 1;

      // --- CENÁRIO 1: EDIÇÃO OU PARCELA ÚNICA ---
      // --- CENÁRIO 1: EDIÇÃO, PARCELA ÚNICA OU DESPESA FIXA ---
      if (editingId || numInstallments === 1 || form.isFixed) {
        const id = editingId || Date.now().toString();
        
        const transactionData = { 
          id, 
          type: isExpense ? 'despesa' : 'receita', 
          description: form.description, 
          amount: form.amount, 
          value: inputVal, 
          date: form.date, 
          category: form.category || (isExpense ? expenseCategories[0] : incomeCategories[0]),
          paymentMethod: isExpense ? (form.paymentMethod || 'Cartão de Crédito') : null, 
          installments: isExpense && !form.isFixed ? installmentsStr : null, // Se for fixa, não tem "1x"
          isFixed: form.isFixed || false, // Marca no histórico que é fixa
          ...metaData 
        };

        // 1. Salva a transação atual (Extrato de hoje)
        await set(ref(db, `families/${fid}/transactions/${id}`), transactionData);

        // 2. SE FOR UMA NOVA DESPESA FIXA (e não estamos editando uma antiga)
        // Cria o "Contrato de Recorrência" para o futuro
        if (form.isFixed && !editingId) {
          const recurrenceId = `rec_${id}`;
          const recurrenceData = {
            id: recurrenceId,
            description: form.description,
            amount: form.amount,
            value: inputVal,
            category: transactionData.category,
            paymentMethod: transactionData.paymentMethod,
            day: parseInt(form.date.split('-')[2]), // Salva o dia do vencimento (ex: dia 10)
            lastProcessedDate: form.date, // Marca que o mês atual já foi lançado
            active: true,
            createdAt: new Date().toISOString()
          };
          await set(ref(db, `families/${fid}/recurrences/${recurrenceId}`), recurrenceData);
          showToast("Recorrência automática criada!", "success");
        }

        finishTransaction(isExpense);
      }
      // --- CENÁRIO 2: DESPESA PARCELADA AUTOMÁTICA ---
      else {
        const groupId = Date.now().toString();
        const baseDate = new Date(form.date + 'T12:00:00');
        const updates = {};

        // CÁLCULO MÁGICO DO VALOR
        let baseInstallmentValue = 0;
        let remainder = 0;

        if (form.isInstallmentValue) {
          // OPÇÃO A: Valor digitado É A PARCELA (Ex: 85,71)
          baseInstallmentValue = inputVal;
          remainder = 0; // Não tem sobra, todas são iguais
        } else {
          // OPÇÃO B: Valor digitado É O TOTAL (Ex: 600,00)
          baseInstallmentValue = Math.floor((inputVal / numInstallments) * 100) / 100;
          remainder = Math.round((inputVal - (baseInstallmentValue * numInstallments)) * 100) / 100;
        }

        for (let i = 0; i < numInstallments; i++) {
          const parcelId = (parseInt(groupId) + i).toString();
          
          // Data: Avança mês a mês
          const parcelDate = new Date(baseDate);
          parcelDate.setMonth(baseDate.getMonth() + i);
          const dateStr = parcelDate.toISOString().split('T')[0];

          // Se for a última e tiver sobra de centavos (apenas no modo Total), soma aqui
          const isLast = i === numInstallments - 1;
          const thisParcelValue = isLast ? (baseInstallmentValue + remainder) : baseInstallmentValue;
          
          const amountStr = thisParcelValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          const transactionData = {
            id: parcelId,
            type: 'despesa',
            description: `${form.description} (${i + 1}/${numInstallments})`,
            amount: amountStr,
            value: thisParcelValue,
            date: dateStr,
            category: form.category || expenseCategories[0],
            paymentMethod: form.paymentMethod || 'Cartão de Crédito',
            installments: installmentsStr,
            installmentGroupId: groupId,
            installmentIndex: i + 1,
            ...metaData
          };

          updates[`families/${fid}/transactions/${parcelId}`] = transactionData;
        }

        await update(ref(db), updates);
        finishTransaction(isExpense);
      }
    } catch (error) { 
      console.error(error);
      showToast("Erro ao salvar", "error"); 
    }
  };

  // Atualize também o finishTransaction para limpar o checkbox
  const finishTransaction = (isExpense) => {
    if (isExpense) {
      setExpenseForm({ 
        date: new Date().toISOString().split('T')[0], description: '', amount: '', 
        category: expenseCategories[0], paymentMethod: 'Cartão de Crédito', installments: '1',
        isInstallmentValue: false,
        isFixed: false // <--- RESETANDO AQUI TAMBÉM
      });
      showToast(editingId ? "Despesa atualizada!" : "Despesa parcelada lançada!", "success");
    } else {
      setIncomeForm({ 
        date: new Date().toISOString().split('T')[0], description: '', amount: '', 
        category: incomeCategories[0] 
      });
      showToast(editingId ? "Receita atualizada!" : "Receita adicionada!", "success");
    }
    setEditingId(null);
  };

  const removeTransaction = (id) => { 
    if (window.confirm("Tem certeza que deseja excluir este lançamento?")) {
      remove(ref(db, `families/${currentUser.familyId}/transactions/${id}`)); 
      showToast("Lançamento excluído.", "success");
    }
  };

  const startEditing = (t) => { 
    setEditingId(t.id); 
    setActiveTab('transactions');
    
    // Preenche o formulário correto com os dados do item clicado
    if (t.type === 'receita') {
      setIncomeForm({
        date: t.date,
        description: t.description,
        amount: t.amount, // Mantém a string formatada se possível, ou usa o valor
        category: t.category
      });
    } else {
      setExpenseForm({
        date: t.date,
        description: t.description,
        amount: t.amount,
        category: t.category,
        paymentMethod: t.paymentMethod || 'Cartão de Crédito',
        installments: t.installments || '1'
      });
    }
  };

  const addGoal = async () => {
    // TRAVA DE SEGURANÇA: Verifica se os campos principais estão vazios
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.targetDate) {
      alert("⚠️ Por favor, preencha o nome, o valor alvo e a data da meta!");
      return;
    }

    const id = Date.now().toString();
    const cleanAmount = parseFloat(goalForm.targetAmount.toString().replace(/\./g, '').replace(',', '.') || 0);
    const newGoal = {
      ...goalForm,
      targetAmount: cleanAmount,
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
    // 1. Limpamos a máscara para calcular (Ex: "1.000,00" vira 1000)
    const initialVal = parseFloat(investmentForm.initialAmount?.toString().replace(/\./g, '').replace(',', '.') || 0);

    // 2. Trava de segurança atualizada: não precisamos mais de data ou meta
    if (!investmentForm.name || initialVal <= 0) {
      alert("⚠️ Informe o nome do ativo e o valor que está investindo hoje!");
      return;
    }

    const id = Date.now().toString();

    // 3. O investimento já nasce com o dinheiro dentro (currentAmount)
    const newInv = {
      id,
      name: investmentForm.name,
      currentAmount: initialVal,
      createdAt: new Date().toISOString()
    };

    await set(ref(db, `families/${currentUser.familyId}/investments/${id}`), newInv);

    // 4. Geramos a saída automática do Saldo Livre (Aporte)
    const transId = (Date.now() + 1).toString();
    await set(ref(db, `families/${currentUser.familyId}/transactions/${transId}`), {
      id: transId,
      type: 'despesa',
      description: `Aporte Inicial: ${investmentForm.name}`,
      amount: investmentForm.initialAmount,
      value: initialVal,
      date: new Date().toISOString().split('T')[0],
      category: 'Aporte',
      createdBy: currentUser.uid,
      authorName: currentUser.name
    });

    // 5. Limpa os campos
    setInvestmentForm({ name: '', initialAmount: '' });
    alert("💰 Investimento registrado e saldo atualizado!");
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

  // --- NOVA FUNÇÃO CENTRALIZADA (APORTE E RESGATE) ---
  const handleConfirmTransaction = async (e) => {
    e.preventDefault();
    const val = parseFloat(transactionForm.amount.toString().replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    const { action, type, id, name } = transactionModal;
    const path = type === 'goal' ? 'goals' : 'investments';
    const list = type === 'goal' ? goals : investments;
    const item = list.find(i => i.id === id);

    if (!item) return;

    // LÓGICA DE RESGATE (WITHDRAW)
    if (action === 'withdraw') {
      const hoje = new Date();
      const dataMeta = item.targetDate ? new Date(item.targetDate) : null;
      const metaNaoBatida = type === 'goal' && val > (item.currentAmount || 0);
      const dataAntecipada = type === 'goal' && dataMeta && dataMeta > hoje;

      if (metaNaoBatida || dataAntecipada) {
        if (!window.confirm("Atenção: Meta não atingida ou prazo não chegou. Resgatar mesmo assim?")) return;
      }
      if (val > (item.currentAmount || 0)) return alert("Saldo insuficiente.");

      await update(ref(db, `families/${currentUser.familyId}/${path}/${id}`), {
        currentAmount: (item.currentAmount || 0) - val
      });

      const transId = Date.now().toString();
      await set(ref(db, `families/${currentUser.familyId}/transactions/${transId}`), {
        id: transId,
        type: 'receita',
        description: `Resgate: ${name}`,
        amount: transactionForm.amount,
        value: val,
        date: new Date().toISOString().split('T')[0],
        category: 'Resgate',
        createdBy: currentUser.uid,
        authorName: currentUser.name
      });
      showToast(`Resgate de R$ ${val.toFixed(2)} realizado!`, "success");
    }

    // LÓGICA DE APORTE (DEPOSIT)
    else if (action === 'deposit') {
      await update(ref(db, `families/${currentUser.familyId}/${path}/${id}`), {
        currentAmount: (item.currentAmount || 0) + val
      });

      const transId = Date.now().toString();
      await set(ref(db, `families/${currentUser.familyId}/transactions/${transId}`), {
        id: transId,
        type: 'despesa',
        description: `Aporte: ${name}`,
        amount: transactionForm.amount,
        value: val,
        date: new Date().toISOString().split('T')[0],
        category: 'Aporte',
        createdBy: currentUser.uid,
        authorName: currentUser.name
      });
      showToast(`Aporte de R$ ${val.toFixed(2)} realizado!`, "success");
    }
    setTransactionModal({ show: false, action: '', type: '', id: null, name: '' });
    setTransactionForm({ amount: '' });
  };

  // --- FUNÇÃO QUE FALTAVA: CONFIRMAR RESGATE (MODAL ANTIGO) ---
  const handleWithdrawConfirm = async () => {
    const val = parseFloat(withdrawForm.amount.toString().replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0) return alert("Valor inválido");

    const { id, type, name } = withdrawModal;
    const path = type === 'goal' ? 'goals' : 'investments';
    const list = type === 'goal' ? goals : investments;
    const item = list.find(i => i.id === id);

    if (!item) return;

    if (val > (item.currentAmount || 0)) return alert("Saldo insuficiente na meta/investimento.");

    // 1. Deduz o valor da Meta/Investimento
    await update(ref(db, `families/${currentUser.familyId}/${path}/${id}`), { 
      currentAmount: (item.currentAmount || 0) - val 
    });

    // 2. Cria a transação de entrada (Resgate)
    const transId = Date.now().toString();
    await set(ref(db, `families/${currentUser.familyId}/transactions/${transId}`), {
      id: transId,
      type: 'receita',
      description: `Resgate: ${name}`,
      amount: withdrawForm.amount,
      value: val,
      date: new Date().toISOString().split('T')[0],
      category: 'Resgate',
      createdBy: currentUser.uid,
      authorName: currentUser.name
    });

    showToast(`Resgate de R$ ${val.toFixed(2)} realizado!`, "success");
    
    // 3. Fecha o modal e limpa
    setWithdrawModal({ show: false, type: '', id: null, name: '' });
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

  const resetAllData = () => { if (window.confirm("Zerar tudo?")) set(ref(db, `families/${currentUser.familyId}`), { name: familyName, pin: familyPin }); };

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

  // --- FUNÇÃO INTELIGENTE: ANTECIPAÇÃO DE PARCELAS ---
  const handleAnticipateConfirm = async () => {
    const { transaction } = anticipateModal;
    const count = parseInt(anticipateCount);
    
    if (!transaction || count <= 0) return;
    
    const groupId = transaction.installmentGroupId;
    const currentIdx = parseInt(transaction.installmentIndex);

    // 1. Busca todas as parcelas desse grupo
    const allInstallments = transactions.filter(t => t.installmentGroupId === groupId);
    
    // 2. Separa as FUTURAS (que têm índice maior que a atual)
    const futureInstallments = allInstallments
      .filter(t => parseInt(t.installmentIndex) > currentIdx)
      .sort((a, b) => parseInt(a.installmentIndex) - parseInt(b.installmentIndex));

    if (futureInstallments.length < count) {
      alert("Não existem tantas parcelas futuras para antecipar.");
      return;
    }

    const updates = {};
    const targetDateStr = transaction.date; // A data para onde elas vêm (mês da parcela atual)
    
    // Data base para recalcular o restante da fila (Mês seguinte ao atual)
    const baseDateForShift = new Date(targetDateStr + 'T12:00:00');
    baseDateForShift.setMonth(baseDateForShift.getMonth() + 1); // Começa do próximo mês

    // 3. PROCESSAMENTO
    // A) Parcelas que serão ANTECIPADAS (Trazidas para hoje)
    for (let i = 0; i < count; i++) {
      const t = futureInstallments[i];
      updates[`families/${currentUser.familyId}/transactions/${t.id}/date`] = targetDateStr;
      updates[`families/${currentUser.familyId}/transactions/${t.id}/description`] = t.description.includes('(Antecipado)') ? t.description : `${t.description} (Antecipado)`;
    }

    // B) Parcelas RESTANTES (A fila anda!)
    // Elas devem ocupar os meses subsequentes, preenchendo o buraco
    for (let i = count; i < futureInstallments.length; i++) {
      const t = futureInstallments[i];
      
      // Calcula a nova data sequencial
      const newDate = new Date(baseDateForShift);
      newDate.setMonth(baseDateForShift.getMonth() + (i - count)); // Desloca baseado em quantas sobraram
      
      updates[`families/${currentUser.familyId}/transactions/${t.id}/date`] = newDate.toISOString().split('T')[0];
    }

    try {
      await update(ref(db), updates);
      showToast(`${count} parcelas antecipadas com sucesso!`, "success");
      setAnticipateModal({ show: false, transaction: null });
      setAnticipateCount(1);
    } catch (error) {
      console.error(error);
      showToast("Erro ao antecipar parcelas.", "error");
    }
  };

  // --- ROBÔ DE RECORRÊNCIA (COM RASTREADOR 🤖) ---
  const checkRecurrences = async (fid) => {
    console.log("🤖 [1/5] ROBÔ ACORDOU! Verificando família:", fid);
    
    try {
      const recRef = ref(db, `families/${fid}/recurrences`);
      const snapshot = await get(recRef);
      
      if (!snapshot.exists()) {
        console.warn("🤖 [FALHA] Nenhuma recorrência encontrada no banco de dados.");
        return;
      }
      
      const recurrences = snapshot.val();
      console.log("🤖 [2/5] Recorrências encontradas:", recurrences);
      
      const updates = {};
      let count = 0;
      const today = new Date();
      console.log("🤖 [3/5] Data de hoje para comparação:", today);

      Object.values(recurrences).forEach(rec => {
        if (!rec.active) {
            console.log(`🤖 Ignorando recorrência inativa: ${rec.description}`);
            return;
        }

        console.log(`🤖 [4/5] Analisando conta: ${rec.description} | Último lançamento: ${rec.lastProcessedDate}`);

        let lastDate = new Date(rec.lastProcessedDate + 'T12:00:00');
        
        for (let i = 0; i < 12; i++) {
          const nextDate = new Date(lastDate);
          nextDate.setMonth(nextDate.getMonth() + 1);
          nextDate.setDate(rec.day);

          console.log(`   -> Testando data alvo: ${nextDate.toISOString().split('T')[0]}...`);

          if (nextDate <= today) {
            console.log("      ✅ VENCEU! Criando lançamento...");
            
            const newId = Date.now().toString() + Math.random().toString().slice(2, 5);
            const dateStr = nextDate.toISOString().split('T')[0];

            updates[`families/${fid}/transactions/${newId}`] = {
              id: newId,
              type: 'despesa',
              description: rec.description,
              amount: rec.amount,
              value: rec.value,
              date: dateStr,
              category: rec.category,
              paymentMethod: rec.paymentMethod,
              isFixed: true,
              recurrenceId: rec.id,
              createdBy: 'system',
              authorName: 'Recorrência'
            };

            updates[`families/${fid}/recurrences/${rec.id}/lastProcessedDate`] = dateStr;
            
            lastDate = nextDate;
            count++;
          } else {
            console.log("      ❌ AINDA NÃO VENCEU. Parando por aqui.");
            break;
          }
        }
      });

      if (count > 0) {
        console.log(`🤖 [5/5] Salvando ${count} novas transações no banco...`);
        await update(ref(db), updates);
        showToast(`${count} contas fixas lançadas automaticamente!`, "success");
      } else {
        console.log("🤖 [5/5] Nada para lançar hoje.");
      }

    } catch (error) {
      console.error("🔥 ERRO CRÍTICO NO ROBÔ:", error);
    }
  };

  // --- CÁLCULOS OTIMIZADOS COM USEMEMO (ADICIONADO) ---
  // --- CÁLCULOS OTIMIZADOS (COM MATEMÁTICA DE CARTÃO) ---
  const totals = React.useMemo(() => {
    // 1. Definições de Data
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // 2. Totais de Fatura (Calculados dinamicamente)
    let invoiceTotal = 0;
    let nextInvoiceTotal = 0;

    // Varre transações para somar Faturas e separar gastos do cartão
    transactions.forEach(t => {
      // Se for Despesa no Crédito (e não for Aporte)
      if (t.type === 'despesa' && t.paymentMethod === 'Cartão de Crédito' && t.category !== 'Aporte') {
        // Tenta achar o cartão vinculado ou usa o primeiro disponível como padrão
        const card = (t.cardId && creditCards.find(c => c.id === t.cardId)) || (creditCards.length > 0 ? creditCards[0] : null);
        const closingDay = card ? parseInt(card.closingDay) : 1; // Dia 1 se não tiver cartão

        const tDate = new Date(t.date + 'T12:00:00');
        const invoiceClosingDate = new Date(currentYear, currentMonth, closingDay);
        const prevInvoiceClosingDate = new Date(currentYear, currentMonth - 1, closingDay);
        const nextInvoiceClosingDate = new Date(currentYear, currentMonth + 1, closingDay);

        // Lógica de Fatura:
        if (tDate > prevInvoiceClosingDate && tDate <= invoiceClosingDate) {
          invoiceTotal += Number(t.value); // Fatura Atual
        } else if (tDate > invoiceClosingDate && tDate <= nextInvoiceClosingDate) {
          nextInvoiceTotal += Number(t.value); // Próxima Fatura
        }
      }
    });

    // 3. Filtrar Transações do Mês (Para os Gráficos e Totais Mensais)
    const currentMonthTrans = transactions.filter(t => {
      if (!t.date) return false;
      const [y, m] = t.date.split('-');
      return (parseInt(m) - 1) === currentMonth && parseInt(y) === currentYear;
    });

    const inc = currentMonthTrans
      .filter(t => t.type === 'receita' && t.category !== 'Resgate' && t.category !== 'Estorno')
      .reduce((acc, c) => acc + Number(c.value), 0);

    const exp = currentMonthTrans
      .filter(t => t.type === 'despesa' && t.category !== 'Aporte')
      .reduce((acc, c) => acc + Number(c.value), 0);

    // 4. SALDO LIVRE (REAL): O Pulo do Gato 🐈
    // Desconta tudo, MENOS o que foi gasto no Crédito (pois isso vira dívida de fatura, não saída de caixa imediata)
    const todayStr = new Date().toISOString().split('T')[0];
    
    const accBalance = transactions
      .filter(t => t.date <= todayStr)
      .reduce((acc, c) => {
        if (c.type === 'receita') return acc + Number(c.value);
        // Só subtrai se NÃO for cartão de crédito
        if (c.type === 'despesa' && c.paymentMethod !== 'Cartão de Crédito') return acc - Number(c.value);
        return acc;
      }, 0);

    const goalsTotal = goals.reduce((acc, c) => acc + (Number(c.currentAmount) || 0), 0);
    const investTotal = investments.reduce((acc, c) => acc + (Number(c.currentAmount) || 0), 0);

    // Gráficos
    const expensesByCategory = currentMonthTrans
      .filter(t => t.type === 'despesa' && t.category !== 'Aporte')
      .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + Number(curr.value);
        return acc;
      }, {});
    const pData = Object.keys(expensesByCategory).map(key => ({ name: key, value: expensesByCategory[key] }));

    const bData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
      const monthTrans = transactions.filter(t => {
        if (!t.date) return false;
        const [y, m] = t.date.split('-');
        return (parseInt(m) - 1) === d.getMonth() && parseInt(y) === d.getFullYear();
      });
      const mInc = monthTrans.filter(t => t.type === 'receita' && t.category !== 'Resgate').reduce((acc, c) => acc + Number(c.value), 0);
      const mExp = monthTrans.filter(t => t.type === 'despesa' && t.category !== 'Aporte').reduce((acc, c) => acc + Number(c.value), 0);
      return { 
        name: d.toLocaleDateString('pt-BR', { month: 'short' }) + '/' + d.getFullYear(), 
        Receita: mInc, 
        Despesa: mExp 
      };
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
      barData: bData,
      invoiceTotal,      // <--- NOVO
      nextInvoiceTotal   // <--- NOVO
    };
  }, [transactions, goals, investments, currentDate, creditCards]); // <--- Dependências Atualizadas

  const { monthlyIncome, monthlyExpense, monthlyBalance, accumulatedBalance, totalGoals, totalInvestments, totalPatrimony, pieData, barData, invoiceTotal, nextInvoiceTotal } = totals;

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
              onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
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
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
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
                  onChange={e => setLoginForm({ ...loginForm, name: e.target.value })}
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
                    onChange={e => setLoginForm({ ...loginForm, pin: e.target.value })}
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
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-300'} relative`}>
      
      {/* Passamos o estado 'isOpen' e a função 'setIsOpen' para a Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
        familyName={familyName}
        isOpen={isSidebarOpen}       // <--- NOVO
        setIsOpen={setIsSidebarOpen} // <--- NOVO
      />

      <main className="flex-1 flex flex-col h-screen ov
      erflow-hidden relative w-full">
        <Header
          activeTab={activeTab}
          familyName={familyName}
          currentUser={currentUser}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} // <--- NOVO (Botão Menu)
        />

        {(activeTab === 'dashboard' || activeTab === 'transactions') && (
          // CONTAINER EXTERNO: Ajustado para alinhar com o Dashboard (md:px-8 e max-w-7xl)
          //<div className="px-4 mt-6 mb-1 md:px-8">
          <div className="px-4 mt-6 mb-0.1 md:pr-10 md:pl-7">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 md:p-3 flex justify-between items-center transition-colors duration-300 border border-gray-100 dark:border-gray-700">

                {/* Botão Esquerda */}
                <button
                  onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d) }}
                  className="p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Texto do Mês (Com um destaque de cor sutil) */}
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500 dark:text-blue-400 mb-0.5" />
                  <span className="font-bold text-gray-700 dark:text-gray-100 capitalize text-lg">
                    {formatMonthYear(currentDate)}
                  </span>
                </div>

                {/* Botão Direita */}
                <button
                  onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d) }}
                  className="p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto p-4 pb-24 md:p-8 transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-300'}`}>
          {activeTab === 'dashboard' && (
            <DashboardView 
              totalPatrimony={totalPatrimony} 
              accumulatedBalance={accumulatedBalance} 
              totalGoals={totalGoals} 
              totalInvestments={totalInvestments} 
              monthlyIncome={monthlyIncome} 
              monthlyExpense={monthlyExpense} 
              monthlyBalance={monthlyBalance} 
              pieData={pieData} 
              barData={barData} 
              COLORS={COLORS}
              invoiceTotal={invoiceTotal}          // <--- NOVO
              nextInvoiceTotal={nextInvoiceTotal}  // <--- NOVO
            />
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
              handleCurrencyChange={handleCurrencyChange}
              setAnticipateModal={setAnticipateModal}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsView
              goalForm={goalForm}
              setGoalForm={setGoalForm}
              addGoal={addGoal}
              goals={goals}
              addValueToTarget={addValueToTarget} // <--- Adicionado
              deleteGoal={deleteGoal}
              setWithdrawModal={setWithdrawModal} // <--- Adicionado
              handleCurrencyChange={handleCurrencyChange}
            />
          )}

          {activeTab === 'investments' && (
            <InvestmentsView
              investmentForm={investmentForm}
              setInvestmentForm={setInvestmentForm}
              addInvestment={addInvestment}
              investments={investments}
              addValueToTarget={addValueToTarget} // <--- Adicionado
              deleteInvestment={deleteInvestment}
              setWithdrawModal={setWithdrawModal} // <--- Adicionado
              handleCurrencyChange={handleCurrencyChange}
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

          {/* MODAL DE RESGATE */}
          {withdrawModal.show && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Resgatar de: {withdrawModal.name}</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Valor do Resgate</label>
                    <input
                      autoFocus
                      type="text"
                      className="w-full text-2xl font-bold text-gray-800 dark:text-white border-b-2 border-blue-500 bg-transparent outline-none py-2"
                      placeholder="R$ 0,00"
                      value={withdrawForm.amount}
                      onChange={(e) => handleCurrencyChange(e, setWithdrawForm, withdrawForm, 'amount')}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setWithdrawModal({ show: false, type: null, id: null, name: '' })}
                      className="flex-1 py-3 text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleWithdrawConfirm}
                      className="flex-1 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- O NOVO MODAL UNIFICADO E FORMATADO --- */}
          {transactionModal.show && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">

                <div className="flex justify-between items-start mb-4">
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${transactionModal.action === 'withdraw' ? 'text-red-600' : 'text-green-600'}`}>
                    {transactionModal.action === 'withdraw' ? <ArrowDownCircle size={24} /> : <ArrowUpCircle size={24} />}
                    {transactionModal.action === 'withdraw' ? 'Resgatar Valor' : 'Novo Aporte'}
                  </h3>
                  <button onClick={() => setTransactionModal({ ...transactionModal, show: false })} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {transactionModal.action === 'withdraw' ? 'Retirar dinheiro de:' : 'Adicionar dinheiro em:'} <br />
                  <span className="font-bold text-gray-800 text-base">{transactionModal.name}</span>
                </p>

                <form onSubmit={handleConfirmTransaction}>
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor da Transação</label>
                    <input
                      type="text"
                      className={`w-full p-3 border-2 rounded-xl text-xl font-bold outline-none focus:ring-4 transition-all ${transactionModal.action === 'withdraw' ? 'border-red-100 text-red-700 focus:border-red-500 focus:ring-red-500/20' : 'border-green-100 text-green-700 focus:border-green-500 focus:ring-green-500/20'}`}
                      placeholder="R$ 0,00"
                      value={transactionForm.amount}
                      onChange={e => handleCurrencyChange(e, setTransactionForm, transactionForm, 'amount')}
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setTransactionModal({ ...transactionModal, show: false })} className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancelar</button>
                    <button className={`px-6 py-3 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 ${transactionModal.action === 'withdraw' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}>
                      Confirmar
                    </button>
                  </div>
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

        {/* MODAL DE ANTECIPAÇÃO DE PARCELAS */}
        {anticipateModal.show && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 scale-100 animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                ⏩ Antecipar Parcelas
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Quantas parcelas futuras você deseja trazer para o mês atual (<strong>{formatMonthYear(new Date(anticipateModal.transaction.date))}</strong>)?
                <br/><span className="text-xs italic mt-1 block text-orange-600">Isso encurtará o final da sua dívida.</span>
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <button 
                  onClick={() => setAnticipateCount(c => Math.max(1, c - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 font-bold hover:bg-gray-200 transition-colors"
                >-</button>
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 w-12 text-center">{anticipateCount}</span>
                <button 
                  onClick={() => setAnticipateCount(c => c + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 font-bold hover:bg-gray-200 transition-colors"
                >+</button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setAnticipateModal({ show: false, transaction: null })}
                  className="flex-1 py-3 text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >Cancelar</button>
                <button 
                  onClick={handleAnticipateConfirm}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                >Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}