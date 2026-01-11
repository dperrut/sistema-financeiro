// src/firebase.js

// Importar as funções necessárias do SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importa sistema de Login
import { getDatabase } from "firebase/database"; // Importa Banco de Dados

// Sua configuração (Copiada do que você me mandou)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 1. Inicializa o App
const app = initializeApp(firebaseConfig);

// 2. Inicializa e exporta a Autenticação (Login)
export const auth = getAuth(app);

// 3. Inicializa e exporta o Banco de Dados (Realtime Database)
export const db = getDatabase(app);