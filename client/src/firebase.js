import firebase from "@firebase/app";
import "@firebase/firestore";
import "@firebase/auth";
/*import 'firebase/firestore'
import 'firebase/auth'
import { initializeApp } from 'firebase/app';*/

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDy7thFE18W7S23EuALfyuWkhWlB3Qvduo",
    authDomain: "react-chess-670e8.firebaseapp.com",
    projectId: "react-chess-670e8",
    storageBucket: "react-chess-670e8.appspot.com",
    messagingSenderId: "1045705232091",
    appId: "1:1045705232091:web:6603b950d2f6c5550846fe"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export const db = firebase.firestore();
  export const auth = firebase.auth();