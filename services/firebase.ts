
// services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

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

// Enable Offline Persistence
// هذه الوظيفة تسمح للبرنامج بالعمل وحفظ البيانات حتى في حالة عدم وجود إنترنت
// وتتم المزامنة تلقائياً فور عودة الاتصال
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn("تنبيه: خاصية العمل بدون إنترنت تعمل في تبويب واحد فقط.");
    } else if (err.code === 'unimplemented') {
        // The current browser doesn't support all of the features required to enable persistence
        console.warn("تنبيه: المتصفح الحالي لا يدعم خاصية العمل بدون إنترنت بشكل كامل.");
    }
});

export { db };
