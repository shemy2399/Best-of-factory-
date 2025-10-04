// services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuGOZls7yh0gEtU3aOS7PHZXCBAbp0kK0",
  authDomain: "khayala-app-c45c2.firebaseapp.com",
  projectId: "khayala-app-c45c2",
  storageBucket: "khayala-app-c45c2.appspot.com",
  messagingSenderId: "577681399281",
  appId: "1:577681399281:web:f36ee70c8899405ba23850",
  measurementId: "G-YKYYHJ8JVP"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
