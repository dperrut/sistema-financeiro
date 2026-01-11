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
      try {
          if (authMode === 'login') {
              await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
          } else if (authMode === 'register') {
              const userCred = await createUserWithEmailAndPassword(auth, loginForm.email, loginForm.password);
              const uid = userCred.user.uid;
              const newFamilyRef = push(ref(db, 'families'));
              const familyId = newFamilyRef.key;
              let nomeFamilia = "Família " + loginForm.name.split(' ')[0];
              await set(newFamilyRef, { id: familyId, name: nomeFamilia, pin: loginForm.pin, createdBy: uid, members: { [uid]: loginForm.name }, expenseCategories, incomeCategories });
              await set(ref(db, `users/${uid}`), { name: loginForm.name, email: loginForm.email, familyId: familyId });
              await updateProfile(userCred.user, { displayName: loginForm.name });
          }
      } catch (error) { 
          alert("Erro: " + error.message); 
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

  const addGoal = () => {
      const id = Date.now();
      set(ref(db, `families/${currentUser.familyId}/goals/${id}`), { id, ...goalForm, currentAmount: 0 });
      setGoalForm({ name: '', targetAmount: '', targetDate: '', description: '' });
  };

  const deleteGoal = (id) => { remove(ref(db, `families/${currentUser.familyId}/goals/${id}`)); };

  const addInvestment = () => {
    if (!investmentForm.name || !investmentForm.currentAmount) return alert("Preencha o nome e o valor.");
    
    const startVal = parseFloat(investmentForm.currentAmount.toString().replace(/\./g, '').replace(',', '.'));
    const id = Date.now().toString();
    const fid = currentUser.familyId;

    const newInv = { 
      id, 
      name: investmentForm.name, 
      type: investmentForm.type, 
      currentAmount: startVal, 
      createdBy: currentUser.uid, 
      authorName: currentUser.name 
    };

    set(ref(db, `families/${fid}/investments/${id}`), newInv).then(() => {
      // --- CORREÇÃO: LIMPANDO O FORMULÁRIO ---
      setInvestmentForm({ name: '', type: 'Renda Fixa', currentAmount: '' });
      showToast("Investimento registrado!", "success");
    });
  };

  const deleteInvestment = (id) => { remove(ref(db, `families/${currentUser.familyId}/investments/${id}`)); };

  const addValueToTarget = (type, id, vStr) => {
      const val = parseFloat(vStr.toString().replace(/\./g, '').replace(',', '.'));
      const path = type === 'goal' ? 'goals' : 'investments';
      const list = type === 'goal' ? goals : investments;
      const item = list.find(i => i.id === id);
      update(ref(db, `families/${currentUser.familyId}/${path}/${id}`), { currentAmount: (item.currentAmount || 0) + val });
  };

  const confirmWithdraw = (e) => {
      e.preventDefault();
      const val = parseFloat(withdrawForm.amount.toString().replace(/\./g, '').replace(',', '.'));
      const path = withdrawModal.type === 'goal' ? 'goals' : 'investments';
      const list = withdrawModal.type === 'goal' ? goals : investments;
      const item = list.find(i => i.id === withdrawModal.id);
      update(ref(db, `families/${currentUser.familyId}/${path}/${withdrawModal.id}`), { currentAmount: (item.currentAmount || 0) - val });
      setWithdrawModal({ show: false });
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
    const inc = currentMonthTrans.filter(t => t.type === 'receita').reduce((acc, c) => acc + Number(c.value), 0);
    const exp = currentMonthTrans.filter(t => t.type === 'despesa').reduce((acc, c) => acc + Number(c.value), 0);
    const accBalance = transactions.reduce((acc, c) => c.type === 'receita' ? acc + Number(c.value) : acc - Number(c.value), 0);
    const goalsTotal = goals.reduce((acc, c) => acc + (Number(c.currentAmount) || 0), 0);
    const investTotal = investments.reduce((acc, c) => acc + (Number(c.currentAmount) || 0), 0);
    const expensesByCategory = currentMonthTrans.filter(t => t.type === 'despesa').reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + Number(curr.value);
        return acc;
    }, {});
    const pData = Object.keys(expensesByCategory).map(key => ({ name: key, value: expensesByCategory[key] }));
    const bData = []; // Lógica de histórico omitida por brevidade...
    return { monthlyIncome: inc, monthlyExpense: exp, monthlyBalance: inc - exp, accumulatedBalance: accBalance, totalGoals: goalsTotal, totalInvestments: investTotal, totalPatrimony: accBalance + goalsTotal + investTotal, pieData: pData, barData: bData };
  }, [transactions, goals, investments, currentDate]);

  const { monthlyIncome, monthlyExpense, monthlyBalance, accumulatedBalance, totalGoals, totalInvestments, totalPatrimony, pieData, barData } = totals;

  if (loading) return <div className="h-screen flex items-center justify-center bg-blue-900 text-white">Carregando...</div>;

  // TELA DE LOGIN (CASO NÃO LOGADO)
  if (!currentUser) return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4 text-white">
          <form onSubmit={handleAuth} className="bg-white p-8 rounded-xl text-gray-800 w-full max-w-sm">
              <h2 className="text-2xl font-bold mb-4">Acesso Familiar</h2>
              <input className="w-full p-2 border rounded mb-2" type="email" placeholder="E-mail" value={loginForm.email} onChange={e=>setLoginForm({...loginForm, email:e.target.value})} />
              <input className="w-full p-2 border rounded mb-4" type="password" placeholder="Senha" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})} />
              <button className="w-full bg-blue-600 text-white p-2 rounded font-bold">Entrar</button>
              <button type="button" onClick={() => setAuthMode('register')} className="w-full mt-2 text-sm text-blue-600">Criar nova conta</button>
          </form>
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