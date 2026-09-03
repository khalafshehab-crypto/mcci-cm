const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const fs = require("fs");

// We don't have the password for khalafshehab@gmail.com, so we can't test it via script!
