// --- COMPONENTE: NOTIFICAÇÃO MODERNA (TOAST) ---
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  // O toast fecha sozinho após 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className={`fixed bottom-20 md:bottom-10 right-4 ${bgColor} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideIn z-[100]`}>
      {type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
      <span className="font-bold text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={16}/>
      </button>
    </div>
  );
}