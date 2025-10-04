import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, setDoc, query, orderBy, getDocs, writeBatch, getDoc } from 'firebase/firestore';
import { db } from './services/firebase'; // Import the initialized Firestore instance
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { Page, Horse, Medication, MedicalRecordEntry, FeedingScheduleEntry, TreatmentProtocol, Vaccination } from './types';
import { NAV_ITEMS } from './constants';
import Dashboard from './pages/Dashboard';
import HorsesPage from './pages/Horses';
import ClinicPage from './pages/Clinic';
import PharmacyPage from './pages/Pharmacy';
import ReportsPage from './pages/Reports';
import FeedingPage from './pages/Feeding';
import RemindersPage from './pages/Reminders';
import ProtocolsPage from './pages/Protocols';
import VaccinationsPage from './pages/Vaccinations';
import LoginPage from './pages/LoginPage';


const ChangeLoginPasswordModal: React.FC<{
  onClose: () => void;
  onConfirm: (newUsername: string, newPass: string) => void;
}> = ({ onClose, onConfirm }) => {
    const MASTER_CODE = '230199';
    const [stage, setStage] = useState<'master' | 'new'>('master');
    const [masterCodeInput, setMasterCodeInput] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleMasterSubmit = () => {
        if (masterCodeInput === MASTER_CODE) {
            setStage('new');
            setError('');
        } else {
            setError('الرمز الرئيسي غير صحيح.');
        }
    };
    
    const handleNewCredsSubmit = () => {
        if (!newUsername.trim() || !newPassword.trim()) {
            setError('يجب ملء جميع الحقول.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError('كلمتا المرور غير متطابقتان.');
            return;
        }
        onConfirm(newUsername, newPassword);
        onClose();
    };
    
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        if(error) setError('');
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-700">
                <h3 className="text-xl font-bold text-gray-100 mt-5">
                    {stage === 'master' ? 'تغيير بيانات الدخول' : 'تعيين بيانات دخول جديدة'}
                </h3>
                {stage === 'master' ? (
                    <>
                        <p className="text-gray-400 mt-2">
                            لتغيير بيانات الدخول، يرجى إدخال الرمز الرئيسي الشامل.
                        </p>
                        <div className="mt-6">
                            <label htmlFor="master-code" className="block text-sm font-medium text-gray-300 mb-2">
                               الرمز الرئيسي:
                            </label>
                            <input
                                id="master-code"
                                type="password"
                                value={masterCodeInput}
                                onChange={handleInputChange(setMasterCodeInput)}
                                placeholder="******"
                                className="p-3 w-full text-center tracking-[0.5em] bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                autoComplete="off"
                            />
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </div>
                        <div className="mt-8 flex justify-center gap-4">
                            <button onClick={handleMasterSubmit} className="px-8 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700">متابعة</button>
                            <button onClick={onClose} className="px-8 py-2 bg-gray-600 text-gray-100 font-semibold rounded-lg hover:bg-gray-500">إلغاء</button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-gray-400 mt-2">
                           أدخل بيانات الدخول الجديدة.
                        </p>
                        <div className="mt-6 space-y-4">
                             <input
                                type="text"
                                value={newUsername}
                                onChange={handleInputChange(setNewUsername)}
                                placeholder="اسم المستخدم الجديد"
                                className="p-3 w-full bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                autoComplete="off"
                            />
                             <input
                                type="password"
                                value={newPassword}
                                onChange={handleInputChange(setNewPassword)}
                                placeholder="كلمة المرور الجديدة"
                                className="p-3 w-full bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                autoComplete="off"
                            />
                             <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={handleInputChange(setConfirmNewPassword)}
                                placeholder="تأكيد كلمة المرور"
                                className="p-3 w-full bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                autoComplete="off"
                            />
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </div>
                        <div className="mt-8 flex justify-center gap-4">
                            <button onClick={handleNewCredsSubmit} className="px-8 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">حفظ</button>
                            <button onClick={onClose} className="px-8 py-2 bg-gray-600 text-gray-100 font-semibold rounded-lg hover:bg-gray-500">إلغاء</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


const ChangeSecurityCodeModal: React.FC<{
  onClose: () => void;
  onConfirm: (newCode: string) => void;
}> = ({ onClose, onConfirm }) => {
    const MASTER_CODE = '230199';
    const [stage, setStage] = useState<'master' | 'new'>('master');
    const [masterCodeInput, setMasterCodeInput] = useState('');
    const [newCode, setNewCode] = useState('');
    const [confirmNewCode, setConfirmNewCode] = useState('');
    const [error, setError] = useState('');

    const handleMasterSubmit = () => {
        if (masterCodeInput === MASTER_CODE) {
            setStage('new');
            setError('');
        } else {
            setError('الرمز الرئيسي غير صحيح.');
        }
    };
    
    const handleNewCodeSubmit = () => {
        if (!/^\d{4}$/.test(newCode)) {
            setError('يجب أن يتكون الرمز الجديد من 4 أرقام.');
            return;
        }
        if (newCode !== confirmNewCode) {
            setError('الرمزان غير متطابقان.');
            return;
        }
        onConfirm(newCode);
        onClose();
    };
    
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        if(error) setError('');
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-700">
                <h3 className="text-xl font-bold text-gray-100 mt-5">
                    {stage === 'master' ? 'تغيير رمز الحماية' : 'تعيين رمز جديد'}
                </h3>
                {stage === 'master' ? (
                    <>
                        <p className="text-gray-400 mt-2">
                            لتغيير رمز حذف البيانات، يرجى إدخال الرمز الرئيسي.
                        </p>
                        <div className="mt-6">
                            <label htmlFor="master-code" className="block text-sm font-medium text-gray-300 mb-2">
                               الرمز الرئيسي:
                            </label>
                            <input
                                id="master-code"
                                type="password"
                                value={masterCodeInput}
                                onChange={handleInputChange(setMasterCodeInput)}
                                placeholder="******"
                                className="p-3 w-full text-center tracking-[0.5em] bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                autoComplete="off"
                            />
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </div>
                        <div className="mt-8 flex justify-center gap-4">
                            <button onClick={handleMasterSubmit} className="px-8 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">متابعة</button>
                            <button onClick={onClose} className="px-8 py-2 bg-gray-600 text-gray-100 font-semibold rounded-lg hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">إلغاء</button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-gray-400 mt-2">
                           أدخل رمز الحماية الجديد المكون من 4 أرقام.
                        </p>
                        <div className="mt-6 space-y-4">
                             <input
                                type="password"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                value={newCode}
                                onChange={handleInputChange(setNewCode)}
                                placeholder="الرمز الجديد"
                                className="p-3 w-full text-center tracking-[0.5em] bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                autoComplete="off"
                                maxLength={4}
                            />
                             <input
                                type="password"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                value={confirmNewCode}
                                onChange={handleInputChange(setConfirmNewCode)}
                                placeholder="تأكيد الرمز الجديد"
                                className="p-3 w-full text-center tracking-[0.5em] bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500"
                                autoComplete="off"
                                maxLength={4}
                            />
                            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        </div>
                        <div className="mt-8 flex justify-center gap-4">
                            <button onClick={handleNewCodeSubmit} className="px-8 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">حفظ</button>
                            <button onClick={onClose} className="px-8 py-2 bg-gray-600 text-gray-100 font-semibold rounded-lg hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">إلغاء</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const ConfirmDeleteAllDataModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
  correctCode: string;
}> = ({ onClose, onConfirm, correctCode }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleConfirmClick = () => {
        if (code === correctCode) {
            onConfirm();
        } else {
            setError('رمز الحماية غير صحيح. يرجى المحاولة مرة أخرى.');
        }
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value);
        if (error) {
            setError('');
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center border border-red-700">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
                    <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-100 mt-5">
                    تأكيد حذف جميع البيانات
                </h3>
                <p className="text-gray-400 mt-2">
                    سيتم حذف <span className="font-bold text-red-400">جميع</span> بيانات البرنامج بشكل نهائي.
                    <br/>
                    <strong className="text-red-300 mt-2 block">هذا الإجراء لا يمكن التراجع عنه.</strong>
                </p>
                
                <div className="mt-6">
                    <label htmlFor="security-code" className="block text-sm font-medium text-gray-300 mb-2">
                       لتأكيد، يرجى إدخال رمز الحماية:
                    </label>
                    <input
                        id="security-code"
                        type="password"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={code}
                        onChange={handleCodeChange}
                        placeholder="****"
                        className="p-3 w-full text-center tracking-[0.5em] bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500"
                        autoComplete="off"
                        maxLength={4}
                    />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>

                <div className="mt-8 flex justify-center gap-4">
                     <button
                        type="button"
                        onClick={handleConfirmClick}
                        className="px-8 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        نعم، أحذف كل شيء
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-2 bg-gray-600 text-gray-100 font-semibold rounded-lg hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('isAuthenticated') === 'true');
  const [loginCredentials, setLoginCredentials] = useState<{username: string, password: string} | null>(null);
  const [showChangeLoginModal, setShowChangeLoginModal] = useState(false);

  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [globalBattalionFilter, setGlobalBattalionFilter] = useState<Horse['battalion'] | 'الكل'>('الكل');

  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [showChangeCodeModal, setShowChangeCodeModal] = useState(false);
  const [securityCode, setSecurityCode] = useState('1827');
  
  const [horses, setHorses] = useState<Horse[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [clinicLog, setClinicLog] = useState<({ horseName: string; horseId: string } & MedicalRecordEntry)[]>([]);
  const [feedingSchedules, setFeedingSchedules] = useState<FeedingScheduleEntry[]>([]);
  const [treatmentProtocols, setTreatmentProtocols] = useState<TreatmentProtocol[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);

  // Responsive state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Fullscreen Handler
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  useEffect(() => {
    const credsRef = doc(db, "app_settings", "login");
    
    const setupLogin = async () => {
        try {
            const docSnap = await getDoc(credsRef);
            if (!docSnap.exists()) {
                const defaultCreds = { username: 'طبيب الخيالة', password: '100675' };
                try {
                    await setDoc(credsRef, defaultCreds);
                } catch (e) {
                    console.warn("Could not set default login credentials, probably offline.", e);
                }
                setLoginCredentials(defaultCreds);
            } else {
                setLoginCredentials(docSnap.data() as {username: string, password: string});
            }
        } catch(error) {
            console.error("Failed to get login credentials, falling back to defaults. Error:", error);
            const defaultCreds = { username: 'طبيب الخيالة', password: '100675' };
            setLoginCredentials(defaultCreds);
        }
    };
    
    setupLogin();

    const unsubscribe = onSnapshot(credsRef, (doc) => {
        if (doc.exists()) {
            setLoginCredentials(doc.data() as {username: string, password: string});
        }
    }, (error) => {
        console.error("Error on login snapshot listener:", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const settingsRef = doc(db, "app_settings", "security");
    
    const setupSecurityCode = async () => {
      try {
        const docSnap = await getDoc(settingsRef);
        if (!docSnap.exists()) {
          try {
              // If the document doesn't exist, create it with the default code
              await setDoc(settingsRef, { code: '1827' });
          } catch(e) {
              console.warn("Could not set default security code, probably offline.", e);
          }
          setSecurityCode('1827');
        } else {
          setSecurityCode(docSnap.data().code);
        }
      } catch (error) {
          console.error("Error setting up security code, falling back to default. Error:", error);
          setSecurityCode('1827'); // Fallback to default
      }
    };
    
    setupSecurityCode();

    // Listen for real-time updates
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
        if (doc.exists()) {
            setSecurityCode(doc.data().code);
        }
    }, (error) => {
        console.error("Error on security code snapshot listener:", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "horses"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHorses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Horse)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "medications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medication)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "clinicLog"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
       setClinicLog(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ({ horseName: string; horseId: string } & MedicalRecordEntry))));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "feedingSchedules"), orderBy("time"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
       setFeedingSchedules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedingScheduleEntry)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "treatmentProtocols"), orderBy("diagnosisName"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
       setTreatmentProtocols(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TreatmentProtocol)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "vaccinations"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setVaccinations(snapshot.docs.map(doc => {
            const data: any = doc.data();
            // Migration for old data structure for backward compatibility
            if (data.vaccineName && !data.productName) {
                data.productName = data.vaccineName;
                delete data.vaccineName;
            }
            // Assume old entries without a type are vaccinations
            if (!data.type) {
                data.type = 'vaccination';
            }
            return { id: doc.id, ...data } as Vaccination;
        }));
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
      sessionStorage.removeItem('isAuthenticated');
      setIsAuthenticated(false);
  };

  const requestDeleteAllData = () => {
    setShowConfirmDeleteAll(true);
  };

  const confirmDeleteAllData = async () => {
    setShowConfirmDeleteAll(false);
    try {
        const collectionsToDelete = ['horses', 'medications', 'clinicLog', 'feedingSchedules', 'treatmentProtocols', 'vaccinations'];
        const batch = writeBatch(db);

        for (const collectionName of collectionsToDelete) {
            const querySnapshot = await getDocs(collection(db, collectionName));
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
        }

        await batch.commit();
        alert('تم حذف جميع البيانات بنجاح.');
    } catch (error) {
        console.error("Error deleting all data: ", error);
        alert('حدث خطأ أثناء محاولة حذف البيانات.');
    }
  };

  const handleUpdateSecurityCode = async (newCode: string) => {
    try {
        const settingsRef = doc(db, "app_settings", "security");
        await updateDoc(settingsRef, { code: newCode });
        alert('تم تحديث رمز الحماية بنجاح.');
    } catch (error) {
        console.error("Error updating security code: ", error);
        alert('حدث خطأ أثناء تحديث الرمز.');
    }
  };
  
  const handleUpdateLoginCredentials = async (newUsername: string, newPass: string) => {
    try {
        const credsRef = doc(db, "app_settings", "login");
        await updateDoc(credsRef, { username: newUsername, password: newPass });
        alert('تم تحديث بيانات الدخول بنجاح.');
    } catch (error) {
        console.error("Error updating login credentials: ", error);
        alert('حدث خطأ أثناء تحديث بيانات الدخول.');
    }
  };

  const handleAddClinicEntry = async (entry: Omit<MedicalRecordEntry, 'id'>, horseId: string, horseName: string, addToHistory: boolean) => {
    const newDocRef = doc(collection(db, "clinicLog"));
    const logData = { ...entry, horseName, horseId, id: newDocRef.id };

    await setDoc(newDocRef, logData);

    const horseRef = doc(db, "horses", horseId);
    let updatedHorseData: Partial<Horse> = {};

    if (entry.status === 'recovered') {
      updatedHorseData.status = 'healthy';
    } else if (entry.status === 'sick' || entry.status === 'monitoring' || entry.status === 'healthy') {
      updatedHorseData.status = entry.status;
    }
    
    if (addToHistory) {
      const newEntryForHistory: MedicalRecordEntry = { id: newDocRef.id, ...entry };
      const targetHorse = horses.find(h => h.id === horseId);
      if (targetHorse) {
          updatedHorseData.medicalHistory = [newEntryForHistory, ...targetHorse.medicalHistory];
      }
    }
    
    if (Object.keys(updatedHorseData).length > 0) {
        await updateDoc(horseRef, updatedHorseData);
    }
  };
  
  const handleEditClinicEntry = async (updatedEntry: { horseName: string; horseId: string } & MedicalRecordEntry) => {
    const { id, horseId, horseName, ...dataToUpdate } = updatedEntry;
    
    const entryRef = doc(db, "clinicLog", id);
    const logDataToUpdate = { ...dataToUpdate, horseId, horseName };
    await updateDoc(entryRef, logDataToUpdate);

    const horseRef = doc(db, "horses", horseId);
    const targetHorse = horses.find(h => h.id === horseId);
    
    if (targetHorse) {
        let updatedHorseData: Partial<Horse> = {};
        
        if (dataToUpdate.status === 'recovered') {
            updatedHorseData.status = 'healthy';
        } else if (['sick', 'monitoring', 'healthy'].includes(dataToUpdate.status)) {
            updatedHorseData.status = dataToUpdate.status as 'sick' | 'monitoring' | 'healthy';
        }

        const historyIndex = targetHorse.medicalHistory.findIndex(rec => rec.id === id);
        if (historyIndex > -1) {
            const newHistory = [...targetHorse.medicalHistory];
            const historyEntry: MedicalRecordEntry = { id, ...dataToUpdate };
            newHistory[historyIndex] = historyEntry;
            updatedHorseData.medicalHistory = newHistory;
        }
        
        if (Object.keys(updatedHorseData).length > 0) {
            await updateDoc(horseRef, updatedHorseData);
        }
    }
  };

  const handleDeleteClinicEntry = async (entryId: string, horseId: string) => {
    await deleteDoc(doc(db, "clinicLog", entryId));

    const horseRef = doc(db, "horses", horseId);
    const targetHorse = horses.find(h => h.id === horseId);
    if (targetHorse) {
        const newHistory = targetHorse.medicalHistory.filter(rec => rec.id !== entryId);
        const latestRecord = newHistory.length > 0 ? newHistory[0] : null;
        let newStatus = 'healthy';
        if (latestRecord && (latestRecord.status === 'sick' || latestRecord.status === 'monitoring')) {
            newStatus = latestRecord.status;
        }

        await updateDoc(horseRef, { medicalHistory: newHistory, status: newStatus });
    }
  };

  const handleAddHorse = async (horseData: Omit<Horse, 'id' | 'medicalHistory' | 'status' | 'createdAt'>) => {
    await addDoc(collection(db, "horses"), {
      ...horseData, medicalHistory: [], status: 'healthy', createdAt: new Date().toISOString()
    });
  };

  const handleEditHorse = async (updatedHorse: Horse) => {
    const { id, ...dataToUpdate } = updatedHorse;
    await updateDoc(doc(db, "horses", id), dataToUpdate);
  };

  const handleDeleteHorse = async (horseId: string) => {
    await deleteDoc(doc(db, "horses", horseId));
  };
  
  const handleAddMedication = async (medication: Omit<Medication, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, "medications"), { ...medication, createdAt: new Date().toISOString() });
  };
  
  const handleEditMedication = async (updatedMedication: Medication) => {
    const { id, ...dataToUpdate } = updatedMedication;
    await updateDoc(doc(db, "medications", id), dataToUpdate);
  };
  
  const handleDeleteMedication = async (medicationId: string) => {
    await deleteDoc(doc(db, "medications", medicationId));
  };

  const handleAddFeedingSchedule = async (schedule: Omit<FeedingScheduleEntry, 'id'>) => {
    await addDoc(collection(db, "feedingSchedules"), schedule);
  };

  const handleEditFeedingSchedule = async (updatedSchedule: FeedingScheduleEntry) => {
    const { id, ...dataToUpdate } = updatedSchedule;
    await updateDoc(doc(db, "feedingSchedules", id), dataToUpdate);
  };

  const handleDeleteFeedingSchedule = async (scheduleId: string) => {
    await deleteDoc(doc(db, "feedingSchedules", scheduleId));
  };
  
  const handleAddProtocol = async (protocol: Omit<TreatmentProtocol, 'id'>) => {
    await addDoc(collection(db, "treatmentProtocols"), protocol);
  };
  const handleEditProtocol = async (updatedProtocol: TreatmentProtocol) => {
    const { id, ...dataToUpdate } = updatedProtocol;
    await updateDoc(doc(db, "treatmentProtocols", id), dataToUpdate);
  };
  const handleDeleteProtocol = async (protocolId: string) => {
    await deleteDoc(doc(db, "treatmentProtocols", protocolId));
  };

  const handleAddVaccination = async (vaccinationData: Omit<Vaccination, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, "vaccinations"), {
      ...vaccinationData,
      createdAt: new Date().toISOString()
    });
  };
  const handleEditVaccination = async (updatedVaccination: Vaccination) => {
    const { id, ...dataToUpdate } = updatedVaccination;
    await updateDoc(doc(db, "vaccinations", id), dataToUpdate);
  };
  const handleDeleteVaccination = async (vaccinationId: string) => {
    await deleteDoc(doc(db, "vaccinations", vaccinationId));
  };

  const activePageLabel = NAV_ITEMS.find(item => item.id === activePage)?.label || 'لوحة التحكم';

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard horses={horses} medications={medications} clinicLog={clinicLog} globalBattalionFilter={globalBattalionFilter} setActivePage={setActivePage} />;
      case 'horses':
        return <HorsesPage horses={horses} vaccinations={vaccinations} onAddHorse={handleAddHorse} onEditHorse={handleEditHorse} onDeleteHorse={handleDeleteHorse} globalBattalionFilter={globalBattalionFilter} />;
      case 'clinic':
        return <ClinicPage 
                    horses={horses} 
                    medications={medications} 
                    clinicLog={clinicLog} 
                    protocols={treatmentProtocols}
                    onAddEntry={handleAddClinicEntry} 
                    onEditEntry={handleEditClinicEntry}
                    onDeleteEntry={handleDeleteClinicEntry}
                    globalBattalionFilter={globalBattalionFilter}
                    setGlobalBattalionFilter={setGlobalBattalionFilter}
                />;
      case 'vaccinations':
        return <VaccinationsPage 
                    horses={horses} 
                    vaccinations={vaccinations}
                    onAddVaccination={handleAddVaccination}
                    onEditVaccination={handleEditVaccination}
                    onDeleteVaccination={handleDeleteVaccination}
                    globalBattalionFilter={globalBattalionFilter}
                    setGlobalBattalionFilter={setGlobalBattalionFilter}
                />;
      case 'pharmacy':
        return <PharmacyPage 
                    medications={medications} 
                    onAddMedication={handleAddMedication} 
                    onEditMedication={handleEditMedication} 
                    onDeleteMedication={handleDeleteMedication} 
                    globalBattalionFilter={globalBattalionFilter}
                    setGlobalBattalionFilter={setGlobalBattalionFilter}
                />;
       case 'feeding':
        return <FeedingPage 
                    feedingSchedules={feedingSchedules} 
                    onAddFeedingSchedule={handleAddFeedingSchedule} 
                    onEditFeedingSchedule={handleEditFeedingSchedule} 
                    onDeleteFeedingSchedule={handleDeleteFeedingSchedule}
                    globalBattalionFilter={globalBattalionFilter}
                    setGlobalBattalionFilter={setGlobalBattalionFilter}
                />;
      case 'reports':
        return <ReportsPage clinicLog={clinicLog} horses={horses} medications={medications} globalBattalionFilter={globalBattalionFilter} />;
      case 'reminders':
        return <RemindersPage clinicLog={clinicLog} horses={horses} vaccinations={vaccinations} globalBattalionFilter={globalBattalionFilter}/>;
      case 'protocols':
        return <ProtocolsPage protocols={treatmentProtocols} onAddProtocol={handleAddProtocol} onEditProtocol={handleEditProtocol} onDeleteProtocol={handleDeleteProtocol} />;
      default:
        return <Dashboard horses={horses} medications={medications} clinicLog={clinicLog} globalBattalionFilter={globalBattalionFilter} setActivePage={setActivePage}/>;
    }
  };

  if (!loginCredentials) {
    return (
        <div className="flex h-screen bg-gray-900 justify-center items-center text-white text-xl">
            جاري تحميل البيانات...
        </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} correctCredentials={loginCredentials} />;
  }

  return (
    <div className="flex h-screen bg-gray-900" dir="rtl">
      <Sidebar 
        activePage={activePage} 
        setActivePage={(page) => {
          setActivePage(page);
          setIsSidebarOpen(false); // Close sidebar on mobile after navigation
        }}
        onDeleteAllData={requestDeleteAllData} 
        onChangeSecurityCode={() => setShowChangeCodeModal(true)} 
        onChangeLoginPassword={() => setShowChangeLoginModal(true)}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar 
            activePage={activePage}
            activePageLabel={activePageLabel}
            globalBattalionFilter={globalBattalionFilter}
            setGlobalBattalionFilter={setGlobalBattalionFilter}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isFullScreen={isFullScreen}
            toggleFullScreen={toggleFullScreen}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-800">
          {renderPage()}
        </main>
      </div>
      {showConfirmDeleteAll && (
        <ConfirmDeleteAllDataModal
          onClose={() => setShowConfirmDeleteAll(false)}
          onConfirm={confirmDeleteAllData}
          correctCode={securityCode}
        />
      )}
      {showChangeCodeModal && (
        <ChangeSecurityCodeModal
          onClose={() => setShowChangeCodeModal(false)}
          onConfirm={handleUpdateSecurityCode}
        />
      )}
      {showChangeLoginModal && (
        <ChangeLoginPasswordModal
          onClose={() => setShowChangeLoginModal(false)}
          onConfirm={handleUpdateLoginCredentials}
        />
      )}
    </div>
  );
};

export default App;