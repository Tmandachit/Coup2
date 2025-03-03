const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");

const firebaseConfig = {
    apiKey: "AIzaSyCKUY-UiuPK32VDVJM-E2_VDeZTAWyS4TY",
    authDomain: "coupgame-38eea.firebaseapp.com",
    projectId: "coupgame-38eea",
    storageBucket: "coupgame-38eea.appspot.com",
    messagingSenderId: "1029431512557",
    appId: "1:1029431512557:web:b7aa963891d466436f2be4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

module.exports = { db, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };

