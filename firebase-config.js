// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
// Firestore'dan EK ALANLAR EKLENDİ
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";


// Firebase Config Objesi buraya geliyor (apiKey, authDomain, vs.)
const firebaseConfig = {
    // ... Sizin projenizin bilgileri burada olmalı ...
};


// Firebase Servislerini Başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app); 


// Gerekli tüm fonksiyonları ve servisleri dışa aktar
export { 
    app, 
    auth, 
    db, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    doc, 
    setDoc,
    getDoc,
    // YENİ EKLENEN Firestore Fonksiyonları:
    collection, 
    getDocs, 
    updateDoc 
};
