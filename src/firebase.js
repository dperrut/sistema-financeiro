// src/firebase.js

// Importar as funções necessárias do SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importa sistema de Login
import { getDatabase } from "firebase/database"; // Importa Banco de Dados

// Sua configuração (Copiada do que você me mandou)
const firebaseConfig = {
  apiKey: "AIzaSyBTNIdcbDxNsDgI5u0o-csJU65lK16xdUo",
  authDomain: "gerenciador-financeiro-97d8f.firebaseapp.com",
  projectId: "gerenciador-financeiro-97d8f",
  storageBucket: "gerenciador-financeiro-97d8f.firebasestorage.app",
  messagingSenderId: "989350635860",
  appId: "1:989350635860:web:20953befcea333d7e700c1"
};

// 1. Inicializa o App
const app = initializeApp(firebaseConfig);

// 2. Inicializa e exporta a Autenticação (Login)
export const auth = getAuth(app);

// 3. Inicializa e exporta o Banco de Dados (Realtime Database)
export const db = getDatabase(app);