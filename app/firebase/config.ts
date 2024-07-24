// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCV2WMlUze9491cpsjOD9jpkm_gvGVQgm8",
  authDomain: "qrcode-f59c7.firebaseapp.com",
  projectId: "qrcode-f59c7",
  storageBucket: "qrcode-f59c7.appspot.com",
  messagingSenderId: "358804474216",
  appId: "1:358804474216:web:c44c5bf3fe83a0f98e6edd",
  measurementId: "G-Q8E5078JD3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth: any = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, auth, storage };
