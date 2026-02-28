
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy, deleteField, getDocs, where, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './services/firebase'; 
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { Page, Horse, Medication, MedicalRecordEntry, FeedingScheduleEntry, TreatmentProtocol, Vaccination, AppNotification, MonthlyArchive, AdminUser } from './types';
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
import BreedingPage from './pages/Breeding';
import NursingPage from './pages/Nursing';
import AdminManagement from './pages/AdminManagement';
import { KeyIcon } from './components/icons';

// --- Modals Components ---

const AdminSecurityModal: React.FC<{ onClose: () => void; onSuccess: () => void; message?: string; targetCode: string }> = ({ onClose, onSuccess, message, targetCode }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === targetCode) {
            onSuccess();
        } else {
            setError(true);
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-sm border border-amber-500/30 text-center">
                <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                    <KeyIcon className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">منطقة محمية</h2>
                <p className="text-gray-400 text-sm mb-6">{message || "يرجى إدخال رمز الحماية المخصص لهذا القسم"}</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="password" 
                        autoFocus
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(false); }}
                        placeholder="••••"
                        className={`w-full p-4 bg-gray-900 border ${error ? 'border-red-500 animate-shake' : 'border-gray-700'} rounded-xl text-center text-2xl tracking-[0.5em] text-white focus:border-amber-500 outline-none transition-all`}
                    />
                    {error && <p className="text-red-500 text-xs">رمز الحماية غير صحيح</p>}
                    
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors">دخول</button>
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold rounded-xl transition-colors">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('isAuthenticated') === 'true');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
      const stored = sessionStorage.getItem('currentUserData');
      return stored ? JSON.parse(stored) : null;
  });
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingPage, setPendingPage] = useState<Page | null>(null);
  const [securityTargetCode, setSecurityTargetCode] = useState<string>('');
  const [activePage, setActivePage] = useState<Page>('dashboard');
  
  const [globalBattalionFilter, setGlobalBattalionFilter] = useState<Horse['battalion'] | 'الكل'>(() => {
      const stored = sessionStorage.getItem('currentUserData');
      if (stored) {
          const user = JSON.parse(stored) as AdminUser;
          if (user.assignedBattalion && user.assignedBattalion !== 'الكل') return user.assignedBattalion;
      }
      return 'الكل';
  });

  useEffect(() => {
      if (currentUser) {
          const liveData = admins.find(a => a.id === currentUser.id);
          if (liveData) {
              const currentRestricted = liveData.assignedBattalion && liveData.assignedBattalion !== 'الكل';
              if (currentRestricted && globalBattalionFilter !== liveData.assignedBattalion) {
                  setGlobalBattalionFilter(liveData.assignedBattalion as any);
                  const updatedUser = { ...currentUser, assignedBattalion: liveData.assignedBattalion };
                  sessionStorage.setItem('currentUserData', JSON.stringify(updatedUser));
              }
          }
      }
  }, [admins, currentUser, globalBattalionFilter]);
  
  const [horseSearchFilter, setHorseSearchFilter] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(!!document.fullscreenElement);

  const [horses, setHorses] = useState<Horse[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [clinicLog, setClinicLog] = useState<({ horseName: string; horseNumber: string; horseId: string } & MedicalRecordEntry)[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [feedingSchedules, setFeedingSchedules] = useState<FeedingScheduleEntry[]>([]);
  const [protocols, setProtocols] = useState<TreatmentProtocol[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [monthlyArchives, setMonthlyArchives] = useState<MonthlyArchive[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const unsubAdmins = onSnapshot(query(collection(db, "admins"), orderBy("createdAt", "asc")), (s) => {
        const adminsData = s.docs.map(d => ({id: d.id, ...d.data()}) as AdminUser);
        setAdmins(adminsData);
        setIsInitialLoading(false);
        
        // If no admins exist, we might want to create a default one or just let the user know
        if (s.empty && !isAuthenticated) {
            console.log("No admins found in database.");
        }
    }, (error) => {
        console.error("Firebase Admins Error:", error);
        setIsInitialLoading(false);
    });
    const unsubHorses = onSnapshot(query(collection(db, "horses"), orderBy("createdAt", "desc")), (s) => setHorses(s.docs.map(d => ({id: d.id, ...d.data()}) as any)), (err) => console.error("Horses Error:", err));
    const unsubClinic = onSnapshot(query(collection(db, "clinicLog"), orderBy("date", "desc")), (s) => setClinicLog(s.docs.map(d => ({id: d.id, ...d.data()}) as any)), (err) => console.error("Clinic Error:", err));
    const unsubNotifications = onSnapshot(query(collection(db, "notifications"), orderBy("createdAt", "desc")), (s) => setNotifications(s.docs.map(d => ({id: d.id, ...d.data()}) as any)), (err) => console.error("Notifications Error:", err));
    const unsubArchives = onSnapshot(query(collection(db, "monthlyArchives"), orderBy("createdAt", "desc")), (s) => setMonthlyArchives(s.docs.map(d => ({id: d.id, ...d.data()}) as any)), (err) => console.error("Archives Error:", err));
    const unsubMeds = onSnapshot(query(collection(db, "medications"), orderBy("createdAt", "desc")), (s) => setMedications(s.docs.map(d => ({id: d.id, ...d.data()}) as any)), (err) => console.error("Meds Error:", err));
    const unsubVacc = onSnapshot(query(collection(db, "vaccinations"), orderBy("date", "desc")), (s) => setVaccinations(s.docs.map(d => ({id: d.id, ...d.data()}) as any)), (err) => console.error("Vacc Error:", err));
    const unsubFeeding = onSnapshot(query(collection(db, "feedingSchedules")), (s) => setFeedingSchedules(s.docs.map(d => ({id: d.id, ...d.data()}) as any)), (err) => console.error("Feeding Error:", err));
    const unsubProtocols = onSnapshot(query(collection(db, "protocols")), (s) => setProtocols(s.docs.map(d => ({id: d.id, ...d.data()}) as any)), (err) => console.error("Protocols Error:", err));

    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
        unsubAdmins(); unsubHorses(); unsubClinic(); unsubNotifications(); unsubArchives(); unsubMeds(); unsubVacc(); unsubFeeding(); unsubProtocols();
        document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentUser && admins.length > 0) {
        const freshUser = admins.find(a => a.id === currentUser.id);
        if (freshUser) {
            const freshStr = JSON.stringify(freshUser);
            const currentStr = JSON.stringify(currentUser);
            if (freshStr !== currentStr) {
                setCurrentUser(freshUser);
                sessionStorage.setItem('currentUserData', freshStr);
            }
        }
    }
  }, [admins, isAuthenticated, currentUser]);

  /**
   * دالة المزامنة الذكية المحدثة: 
   * تضمن توافق حالة الحصان في "سجلات الخيول" مع "دفتر العيادة".
   */
  const syncHorseMasterStatus = useCallback(async (horseId: string, forcedStatus?: MedicalRecordEntry['status']) => {
    try {
        let newMasterStatus: Horse['status'] = 'healthy';
        
        if (forcedStatus) {
            if (forcedStatus === 'monitoring') newMasterStatus = 'monitoring';
            else newMasterStatus = 'healthy'; 
        } else {
            const q = query(
                collection(db, "clinicLog"),
                where("horseId", "==", horseId),
                orderBy("date", "desc"),
                orderBy("createdAt", "desc"),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const latestEntry = snapshot.docs[0].data() as MedicalRecordEntry;
                if (latestEntry.status === 'monitoring') newMasterStatus = 'monitoring';
                else newMasterStatus = 'healthy';
            }
        }

        // تحديث حالة الحصان فقط
        await updateDoc(doc(db, "horses", horseId), { 
            status: newMasterStatus
        });
    } catch (err) {
        console.error("Error syncing horse status:", err);
    }
  }, []);

  /**
   * دالة مزامنة السجل الطبي الدائم:
   * عند تسجيل شفاء حصان في دفتر العيادة (حتى لو تحديث يومي)، 
   * نقوم بتحديث حالة "الدخول" الأصلية في السجل الدائم لتصبح "شفاء".
   */
  const syncPermanentMedicalHistory = useCallback(async (horseId: string, status: MedicalRecordEntry['status'], recoveryDate?: string) => {
    if (status === 'monitoring') return;

    try {
        // البحث عن السجلات الدائمة لهذا الحصان (استعلام بسيط لتجنب مشاكل الفهارس المركبة)
        const q = query(
            collection(db, "clinicLog"),
            where("horseId", "==", horseId)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            // تصفية السجلات الدائمة وترتيبها يدوياً
            const permanentEntries = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as any))
                .filter(d => d.isPermanent === true)
                .sort((a, b) => b.date.localeCompare(a.date));

            // البحث عن آخر حالة "متابعة" لتحديثها إلى "شفاء"
            const latestMonitoring = permanentEntries.find(d => d.status === 'monitoring');
            if (latestMonitoring) {
                await updateDoc(doc(db, "clinicLog", latestMonitoring.id), { 
                    status: 'recovered',
                    recoveryDate: recoveryDate || new Date().toISOString().split('T')[0],
                    updatedAt: serverTimestamp()
                });
            }
        }
    } catch (err) {
        console.error("Error syncing permanent medical history:", err);
    }
  }, []);

  const handleCreateNotification = useCallback(async (message: string, type: AppNotification['type']) => {
    const cleanUser = currentUser?.username || 'نظام';
    await addDoc(collection(db, "notifications"), { 
        message: String(message).substring(0, 150), 
        type, 
        createdAt: new Date().toISOString(),
        createdBy: cleanUser 
    });
  }, [currentUser]);

  const handleLoginSuccess = (user: AdminUser) => {
      setIsAuthenticated(true);
      setCurrentUser(user);
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('currentUserData', JSON.stringify(user));
      setGlobalBattalionFilter(user.assignedBattalion && user.assignedBattalion !== 'الكل' ? user.assignedBattalion : 'الكل');
  };

  const handleNavigate = (page: Page) => {
      if (page === 'admins') {
          setPendingPage('admins');
          setSecurityTargetCode('100675');
          setShowSecurityModal(true);
          return;
      }
      const protection = currentUser?.protectedPages?.find(p => p.pageId === page);
      if (protection) {
          setPendingPage(page);
          setSecurityTargetCode(protection.accessCode);
          setShowSecurityModal(true);
          return;
      }
      setActivePage(page);
      setIsSidebarOpen(false);
  };

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }, []);

  const handleAddHorse = useCallback(async (data: any) => {
    await addDoc(collection(db, "horses"), { ...data, medicalHistory: [], createdAt: new Date().toISOString(), status: 'healthy' });
    handleCreateNotification(`إدراج حصان جديد: ${data.name}`, 'horse');
  }, [handleCreateNotification]);

  const handleEditHorse = useCallback(async (h: Horse) => {
    const { id, ...data } = h;
    const updateData: any = { ...data };
    if (!updateData.lactation) updateData.lactation = deleteField();
    if (!updateData.pregnancy) updateData.pregnancy = deleteField();
    await updateDoc(doc(db, "horses", id), updateData);
    handleCreateNotification(`تحديث سجل الحصان: ${h.name}`, 'horse');
  }, [handleCreateNotification]);

  const handleDeleteHorse = useCallback(async (id: string) => {
      const horse = horses.find(h => h.id === id);
      await deleteDoc(doc(db, "horses", id));
      handleCreateNotification(`حذف الحصان ${horse?.name || '---'} من القوة`, 'horse');
  }, [horses, handleCreateNotification]);

  const activePageLabel = useMemo(() => NAV_ITEMS.find(item => item.id === activePage)?.label || 'لوحة التحكم', [activePage]);

  if (isInitialLoading && !isAuthenticated) return <div className="h-screen bg-gray-900 flex items-center justify-center text-white font-black animate-pulse">جاري التحميل...</div>;
  if (!isAuthenticated) return <LoginPage onLoginSuccess={handleLoginSuccess} admins={admins} />;

  return (
    <div className="flex h-screen bg-gray-900" dir="rtl">
      <Sidebar 
        activePage={activePage} setActivePage={handleNavigate} onDeleteAllData={() => {}} onExportData={() => {}} onChangeSecurityCode={() => {}} onChangeLoginPassword={() => handleNavigate('admins')} onShowTechnicalGuide={() => {}} onLogout={() => { setIsAuthenticated(false); sessionStorage.clear(); setCurrentUser(null); }} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isFullScreen={isFullScreen} toggleFullScreen={toggleFullScreen} globalBattalionFilter={globalBattalionFilter} setGlobalBattalionFilter={setGlobalBattalionFilter} currentUser={currentUser}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar 
            activePage={activePage} activePageLabel={activePageLabel} globalBattalionFilter={globalBattalionFilter} setGlobalBattalionFilter={setGlobalBattalionFilter} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isFullScreen={isFullScreen} toggleFullScreen={toggleFullScreen} notifications={notifications} onDismissNotification={(id) => deleteDoc(doc(db, "notifications", id))} currentUser={currentUser?.username || null} isBattalionRestricted={!!(currentUser?.assignedBattalion && currentUser.assignedBattalion !== 'الكل')}
        />
        <main className="flex-1 p-4 overflow-y-auto bg-gray-900 custom-scrollbar">
          {(() => {
            switch(activePage) {
              case 'dashboard': 
                return <Dashboard horses={horses} medications={medications} clinicLog={clinicLog} globalBattalionFilter={globalBattalionFilter} setActivePage={handleNavigate} />;
              case 'horses': 
                return <HorsesPage horses={horses} vaccinations={vaccinations} clinicLog={clinicLog} onAddHorse={handleAddHorse} onEditHorse={handleEditHorse} onDeleteHorse={handleDeleteHorse} globalBattalionFilter={globalBattalionFilter} initialSearchTerm={horseSearchFilter} currentUser={currentUser} />;
              case 'clinic': 
                return <ClinicPage 
                    horses={horses} medications={medications} clinicLog={clinicLog} protocols={protocols} 
                    onAddEntry={async (entry, hId, hName, hNum, addHist) => { 
                        try {
                            await addDoc(collection(db, "clinicLog"), { ...entry, horseName: hName, horseNumber: hNum, horseId: hId, createdAt: serverTimestamp(), isPermanent: addHist }); 
                            handleCreateNotification(`حالة عيادة: ${hName}`, 'clinic'); 
                            await syncHorseMasterStatus(hId, entry.status);
                            await syncPermanentMedicalHistory(hId, entry.status, entry.recoveryDate);
                        } catch (err) {
                            console.error("Error adding clinic entry:", err);
                            alert("حدث خطأ أثناء حفظ السجل.");
                        }
                    }} 
                    onEditEntry={async (upd, addHist) => { 
                        try {
                            const {id, horseId, horseName, horseNumber, ...data} = upd; 
                            await updateDoc(doc(db, "clinicLog", id), { ...data, isPermanent: addHist, updatedAt: serverTimestamp() }); 
                            await syncHorseMasterStatus(horseId, upd.status);
                            await syncPermanentMedicalHistory(horseId, upd.status, upd.recoveryDate);
                        } catch (err) {
                            console.error("Error editing clinic entry:", err);
                            alert("حدث خطأ أثناء تحديث السجل.");
                        }
                    }} 
                    onDeleteEntry={async (id, horseId) => {
                        try {
                            await deleteDoc(doc(db, "clinicLog", id));
                            await syncHorseMasterStatus(horseId);
                        } catch (err) {
                            console.error("Error deleting clinic entry:", err);
                        }
                    }} 
                    globalBattalionFilter={globalBattalionFilter} setGlobalBattalionFilter={setGlobalBattalionFilter} 
                />;
              case 'pharmacy': 
                return <PharmacyPage medications={medications} onAddMedication={async (m) => addDoc(collection(db, "medications"), {...m, createdAt: new Date().toISOString()})} onEditMedication={async (m) => { const {id, ...data} = m; updateDoc(doc(db, "medications", id), data); }} onDeleteMedication={async (id) => deleteDoc(doc(db, "medications", id))} globalBattalionFilter={globalBattalionFilter} setGlobalBattalionFilter={setGlobalBattalionFilter} />;
              case 'vaccinations': 
                return <VaccinationsPage horses={horses} vaccinations={vaccinations} onAddVaccination={async (v) => addDoc(collection(db, "vaccinations"), {...v, createdAt: new Date().toISOString()})} onEditVaccination={async (v) => { const {id, ...data} = v; updateDoc(doc(db, "vaccinations", id), data); }} onDeleteVaccination={async (id) => deleteDoc(doc(db, "vaccinations", id))} globalBattalionFilter={globalBattalionFilter} setGlobalBattalionFilter={setGlobalBattalionFilter} />;
              case 'feeding': 
                return <FeedingPage feedingSchedules={feedingSchedules} onAddFeedingSchedule={async (s) => addDoc(collection(db, "feedingSchedules"), s)} onEditFeedingSchedule={async (s) => { const {id, ...data} = s; updateDoc(doc(db, "feedingSchedules", id), data); }} onDeleteFeedingSchedule={async (id) => deleteDoc(doc(db, "feedingSchedules", id))} globalBattalionFilter={globalBattalionFilter} setGlobalBattalionFilter={setGlobalBattalionFilter} />;
              case 'reminders': 
                return <RemindersPage clinicLog={clinicLog} horses={horses} vaccinations={vaccinations} globalBattalionFilter={globalBattalionFilter} onCompleteReminder={async (r) => { if(r.type === 'clinic') { await updateDoc(doc(db, "clinicLog", r.id), { followUpDate: deleteField() }); } else { await updateDoc(doc(db, "vaccinations", r.id), { nextDueDate: deleteField() }); } handleCreateNotification(`تم تنفيذ: ${r.details}`, 'system'); }} />;
              case 'protocols': 
                return <ProtocolsPage protocols={protocols} onAddProtocol={async (p) => addDoc(collection(db, "protocols"), p)} onEditProtocol={async (p) => { const {id, ...data} = p; updateDoc(doc(db, "protocols", id), data); }} onDeleteProtocol={async (id) => deleteDoc(doc(db, "protocols", id))} />;
              case 'reports': 
                return <ReportsPage clinicLog={clinicLog} horses={horses} medications={medications} globalBattalionFilter={globalBattalionFilter} monthlyArchives={monthlyArchives} onAddArchive={async (a) => { await addDoc(collection(db, "monthlyArchives"), a); }} onDeleteArchive={async (id) => deleteDoc(doc(db, "monthlyArchives", id))} onUpdateArchive={async (id, data) => updateDoc(doc(db, "monthlyArchives", id), data)} onNavigateWithFilter={(filter) => { setHorseSearchFilter(filter); handleNavigate('horses'); }} />;
              case 'breeding': 
                return <BreedingPage horses={horses} onRecordBirth={async (id) => updateDoc(doc(db, "horses", id), { pregnancy: deleteField() })} globalBattalionFilter={globalBattalionFilter} />;
              case 'nursing': 
                return <NursingPage horses={horses} onRecordWeaning={async (id) => updateDoc(doc(db, "horses", id), { lactation: deleteField() })} globalBattalionFilter={globalBattalionFilter} />;
              case 'admins': 
                return <AdminManagement 
                    admins={admins} 
                    onAddAdmin={async (a) => {
                        try {
                            await addDoc(collection(db, "admins"), {...a, createdAt: new Date().toISOString()});
                            handleCreateNotification(`إضافة مستخدم جديد: ${a.username}`, 'system');
                        } catch (err) {
                            console.error("Error adding admin:", err);
                            alert("حدث خطأ أثناء إضافة المستخدم.");
                        }
                    }} 
                    onEditAdmin={async (a) => { 
                        try {
                            const {id, ...data} = a; 
                            await updateDoc(doc(db, "admins", id), data); 
                            handleCreateNotification(`تحديث صلاحيات: ${a.username}`, 'system');
                        } catch (err) {
                            console.error("Error editing admin:", err);
                            alert("حدث خطأ أثناء تحديث البيانات.");
                        }
                    }} 
                    onDeleteAdmin={async (id) => {
                        try {
                            await deleteDoc(doc(db, "admins", id));
                        } catch (err) {
                            console.error("Error deleting admin:", err);
                        }
                    }} 
                />;
              default: 
                return <Dashboard horses={horses} medications={medications} clinicLog={clinicLog} globalBattalionFilter={globalBattalionFilter} setActivePage={handleNavigate} />;
            }
          })()}
        </main>
      </div>
      {showSecurityModal && <AdminSecurityModal onClose={() => { setShowSecurityModal(false); setPendingPage(null); }} onSuccess={() => { setShowSecurityModal(false); if(pendingPage) setActivePage(pendingPage); }} targetCode={securityTargetCode} message={pendingPage && pendingPage !== 'admins' ? "هذا القسم محمي برمز خاص" : undefined} />}
    </div>
  );
};

export default App;
