
import React, { useState, useMemo, useEffect } from 'react';
import { Horse, Medication, MedicalRecordEntry, TreatmentProtocol } from '../types';
import { PlusIcon, XMarkIcon, HorseIcon, PencilIcon, TrashIcon, CheckIcon, PrintIcon, ShieldIcon } from '../components/icons';
import DateInput from '../components/DateInput';

type ClinicLogEntry = { horseName: string; horseNumber?: string; horseId: string } & MedicalRecordEntry;

interface ClinicPageProps {
  horses: Horse[];
  medications: Medication[];
  clinicLog: ClinicLogEntry[];
  protocols: TreatmentProtocol[];
  onAddEntry: (entry: Omit<MedicalRecordEntry, 'id'>, horseId: string, horseName: string, horseNumber: string, addToHistory: boolean) => void;
  onEditEntry: (entry: ClinicLogEntry, addToHistory: boolean) => void;
  onDeleteEntry: (entryId: string, horseId: string) => void;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  setGlobalBattalionFilter: (battalion: Horse['battalion'] | 'الكل') => void;
}

const AddEntryModal: React.FC<{
  horses: Horse[];
  protocols: TreatmentProtocol[];
  onClose: () => void;
  onAddEntry: (entry: Omit<MedicalRecordEntry, 'id'>, horseId: string, horseName: string, horseNumber: string, addToHistory: boolean) => void;
  initialData?: Partial<ClinicLogEntry>;
}> = ({ horses, protocols, onClose, onAddEntry, initialData }) => {
    const [selectedHorseId, setSelectedHorseId] = useState<string>(initialData?.horseId || '');
    const [horseSearch, setHorseSearch] = useState(initialData ? `${initialData.horseName} (${initialData.horseNumber || ''})` : '');
    const [showHorseList, setShowHorseList] = useState(false);
    
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || '');
    const [treatment, setTreatment] = useState(initialData?.treatment || '');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [status, setStatus] = useState<MedicalRecordEntry['status']>(initialData?.status || 'monitoring');
    const [recoveryDate, setRecoveryDate] = useState(initialData?.recoveryDate || '');
    const [addToMedicalHistory, setAddToMedicalHistory] = useState(initialData ? (initialData.isPermanent === true) : true);
    const [isUpdate, setIsUpdate] = useState(!!initialData);
    const [followUpDate, setFollowUpDate] = useState(initialData?.followUpDate || '');
    const [followUpNotes, setFollowUpNotes] = useState(initialData?.followUpNotes || '');
    
    const [suggestedProtocols, setSuggestedProtocols] = useState<TreatmentProtocol[]>([]);
    const selectedHorse = useMemo(() => horses.find(h => h.id === selectedHorseId), [selectedHorseId, horses]);
    
    useEffect(() => {
        if (diagnosis.trim()) {
            const lowerDiagnosis = diagnosis.toLowerCase();
            setSuggestedProtocols(protocols.filter(p => p.diagnosisName.toLowerCase().includes(lowerDiagnosis)));
        } else { setSuggestedProtocols([]); }
    }, [diagnosis, protocols]);

    const filteredHorses = useMemo(() => {
        if (!horseSearch) return horses;
        const lowercasedSearch = horseSearch.toLowerCase();
        return horses.filter(h => h.name.toLowerCase().includes(lowercasedSearch) || h.number.includes(lowercasedSearch));
    }, [horseSearch, horses]);
    
    const handleSelectHorse = (horse: Horse) => {
        setSelectedHorseId(horse.id);
        setHorseSearch(`${horse.name} (${horse.number})`);
        setShowHorseList(false);
    };

    const handleApplyProtocol = (protocol: TreatmentProtocol) => {
        setDiagnosis(protocol.diagnosisName);
        setTreatment(protocol.treatmentTemplate);
        setSuggestedProtocols([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHorse) { alert('يرجى اختيار حصان من القائمة.'); return; }
        const entryData: Omit<MedicalRecordEntry, 'id'> = {
            date, diagnosis, treatment, notes, status,
            isPermanent: addToMedicalHistory,
            ...(status === 'recovered' && recoveryDate && { recoveryDate }),
            ...(followUpDate && { followUpDate }),
            ...(followUpNotes && { followUpNotes })
        };
        onAddEntry(entryData, selectedHorseId, selectedHorse.name, selectedHorse.number, addToMedicalHistory);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <HorseIcon className="w-8 h-8 text-amber-500" />
                        {isUpdate ? 'تحديث الحالة اليومي' : 'تسجيل حالة جديدة'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                           <label className="block mb-2 font-bold text-gray-400 text-sm">اختر الحصان</label>
                           <input 
                                type="text" 
                                value={horseSearch} 
                                onChange={(e) => { setHorseSearch(e.target.value); setSelectedHorseId(''); setShowHorseList(true); }} 
                                onFocus={() => setShowHorseList(true)} 
                                onBlur={() => setTimeout(() => setShowHorseList(false), 200)} 
                                placeholder="ابحث بالاسم أو الرقم..." 
                                className={`w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold focus:border-amber-500 outline-none transition-all shadow-inner ${isUpdate ? 'opacity-50' : ''}`} 
                                required={!selectedHorseId} 
                                readOnly={isUpdate}
                           />
                           {showHorseList && (
                                <ul className="absolute z-20 w-full bg-gray-900 border border-gray-700 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-2xl">
                                    {filteredHorses.length > 0 ? filteredHorses.map(h => (
                                        <li key={h.id} onMouseDown={() => handleSelectHorse(h)} className="p-4 hover:bg-amber-500/10 cursor-pointer text-gray-200 border-b border-gray-800 last:border-0"><div className="font-bold">{h.name}</div><div className="text-xs text-gray-500">رقم: {h.number} | {h.battalion}</div></li>
                                    )) : (<li className="p-4 text-gray-500 text-center">لا توجد نتائج</li>)}
                                </ul>
                           )}
                        </div>
                         <div><label className="block mb-2 font-bold text-gray-400 text-sm">الكتيبة</label><input value={selectedHorse?.battalion || 'يتم التحديد تلقائياً...'} className="w-full p-4 border border-gray-700 rounded-xl bg-gray-900/50 text-gray-500 font-bold" readOnly /></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div><label className="block mb-2 font-bold text-gray-400 text-sm">تاريخ دخول الحالة</label><DateInput value={date} onChange={setDate} required /></div>
                        <div>
                           <label className="block mb-2 font-bold text-gray-400 text-sm">حالة الحصان</label>
                           <select value={status} onChange={e => setStatus(e.target.value as MedicalRecordEntry['status'])} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold outline-none focus:border-amber-500 transition-all" required>
                                <option value="monitoring">متابعة (تحت العلاج)</option>
                                <option value="recovered">شفاء</option>
                                <option value="healthy">سليم</option>
                           </select>
                        </div>
                    </div>
                    {status === 'recovered' && (<div className="animate-fade-in"><label className="block mb-2 font-bold text-blue-400 text-sm">تاريخ الشفاء (اختياري)</label><DateInput value={recoveryDate} onChange={setRecoveryDate} /></div>)}
                    <div className="relative">
                        <label className="block mb-2 font-bold text-gray-400 text-sm">التشخيص</label>
                        <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="اكتب التشخيص هنا..." rows={2} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold focus:border-amber-500 outline-none transition-all shadow-inner" required></textarea>
                         {suggestedProtocols.length > 0 && (
                            <ul className="absolute z-10 w-full bg-gray-900 border border-gray-700 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-2xl">
                                {suggestedProtocols.map(p => (
                                    <li key={p.id} onMouseDown={() => handleApplyProtocol(p)} className="p-4 hover:bg-amber-500/10 cursor-pointer text-gray-200 border-b border-gray-800 last:border-0">تطبيق بروتوكول: <span className="font-bold text-amber-500">{p.diagnosisName}</span></li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div><label className="block mb-2 font-bold text-gray-400 text-sm">العلاج الموصوف</label><textarea value={treatment} onChange={e => setTreatment(e.target.value)} placeholder="الأدوية والجرعات..." rows={3} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold focus:border-amber-500 outline-none transition-all shadow-inner"></textarea></div>
                    <div className="bg-gray-900/50 p-6 rounded-2xl space-y-4 border border-gray-700/50">
                        <h4 className="font-black text-amber-500 text-xs uppercase tracking-widest">متابعة لاحقة (اختياري)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block mb-2 text-xs font-bold text-gray-500 uppercase">موعد المتابعة القادم</label><DateInput value={followUpDate} onChange={setFollowUpDate} inputClassName="p-3" /></div>
                            <div className="md:col-span-2"><label className="block mb-2 text-xs font-bold text-gray-500 uppercase">ملاحظات للمراجعة</label><input value={followUpNotes} onChange={e => setFollowUpNotes(e.target.value)} placeholder="إعادة فحص، غيار جروح..." className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white shadow-inner"/></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                        <label className="relative flex items-center cursor-pointer">
                            <input type="checkbox" checked={addToMedicalHistory} onChange={e => setAddToMedicalHistory(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-200">إضافة إلى السجل الطبي الدائم للحصان</span>
                            {isUpdate && <span className="text-[10px] text-amber-500/70 font-bold">يفضل تركها غير مفعلة للتحديثات اليومية</span>}
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className={`w-full py-4 ${isUpdate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'} text-white font-black rounded-2xl shadow-lg transition-all text-lg`}>
                            {isUpdate ? 'حفظ التحديث اليومي' : 'تسجيل الحالة في الدفتر'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditEntryModal: React.FC<{
  entry: ClinicLogEntry;
  horses: Horse[];
  onClose: () => void;
  onEditEntry: (entry: ClinicLogEntry, addToHistory: boolean) => void;
}> = ({ entry, horses, onClose, onEditEntry }) => {
    const horseDetails = useMemo(() => horses.find(h => h.id === entry.horseId), [horses, entry.horseId]);
    const displayNum = entry.horseNumber || horseDetails?.number || '---';

    const [formData, setFormData] = useState({ ...entry, horseNumber: displayNum, recoveryDate: entry.recoveryDate || '', followUpDate: entry.followUpDate || '', followUpNotes: entry.followUpNotes || '' });
    
    // تصحيح: دلوقت بيقرأ حالة isPermanent الحقيقية من السجل الممرر (entry)
    const [addToMedicalHistory, setAddToMedicalHistory] = useState(entry.isPermanent === true);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { const { name, value } = e.target; setFormData(prev => ({...prev, [name]: value})); };
    useEffect(() => { if(formData.status !== 'recovered') setFormData(prev => ({...prev, recoveryDate: ''})); }, [formData.status]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit: ClinicLogEntry = { ...formData } as any;
        if (!dataToSubmit.followUpDate) delete dataToSubmit.followUpDate;
        if (!dataToSubmit.followUpNotes) delete dataToSubmit.followUpNotes;
        if (!dataToSubmit.recoveryDate) delete dataToSubmit.recoveryDate;
        onEditEntry(dataToSubmit, addToMedicalHistory);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-white">تعديل سجل الحالة</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 font-bold text-gray-400 text-sm">الحصان</label>
                        <div className="w-full p-4 border border-gray-700 rounded-xl bg-gray-900/50 text-amber-500 font-black">
                            {formData.horseName} <span className="text-gray-500 font-mono text-xs mr-2">(#{displayNum})</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div><label className="block mb-2 font-bold text-gray-400 text-sm">تاريخ الدخول</label><DateInput value={formData.date} onChange={value => handleChange({target:{name:'date', value}} as any)} required /></div>
                        <div>
                           <label className="block mb-2 font-bold text-gray-400 text-sm">حالة الحصان</label>
                           <select name="status" value={formData.status} onChange={handleChange} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold outline-none focus:border-amber-500 transition-all" required>
                                <option value="monitoring">متابعة (تحت العلاج)</option>
                                <option value="recovered">شفاء</option>
                                <option value="healthy">سليم</option>
                           </select>
                        </div>
                    </div>
                    {formData.status === 'recovered' && (<div className="animate-fade-in"><label className="block mb-2 font-bold text-blue-400 text-sm">تاريخ الشفاء (اختياري)</label><DateInput value={formData.recoveryDate} onChange={value => handleChange({target:{name:'recoveryDate', value}} as any)} /></div>)}
                    <div><label className="block mb-2 font-bold text-gray-400 text-sm">التشخيص</label><textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} rows={2} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold focus:border-amber-500 outline-none transition-all shadow-inner" required></textarea></div>
                    <div><label className="block mb-2 font-bold text-gray-400 text-sm">العلاج</label><textarea name="treatment" value={formData.treatment} onChange={handleChange} rows={3} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold focus:border-amber-500 outline-none transition-all shadow-inner"></textarea></div>
                    <div className="bg-gray-900/50 p-6 rounded-2xl space-y-4 border border-gray-700/50">
                        <h4 className="font-black text-amber-500 text-xs uppercase tracking-widest">تحديث المتابعة</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block mb-2 text-xs font-bold text-gray-500 uppercase">تاريخ المتابعة</label><DateInput value={formData.followUpDate} onChange={value => handleChange({target:{name:'followUpDate', value}} as any)} inputClassName="p-3"/></div>
                            <div className="md:col-span-2"><label className="block mb-2 text-xs font-bold text-gray-500 uppercase">ملاحظات المتابعة</label><input name="followUpNotes" value={formData.followUpNotes} onChange={handleChange} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white shadow-inner"/></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                        <label className="relative flex items-center cursor-pointer">
                            <input type="checkbox" checked={addToMedicalHistory} onChange={e => setAddToMedicalHistory(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                        <span className="text-sm font-bold text-gray-200">الإضافة للسجل الطبي الدائم للحصان</span>
                    </div>
                    <div className="pt-4"><button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg transition-all text-lg">حفظ التعديلات</button></div>
                </form>
            </div>
        </div>
    );
};

const ConfirmDeleteModal: React.FC<{
  entry: ClinicLogEntry;
  onClose: () => void;
  onConfirm: (entryId: string, horseId: string) => void;
}> = ({ entry, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-3xl shadow-2xl p-10 w-full max-md text-center border border-gray-700">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-500/10 mb-6"><TrashIcon className="h-10 w-10 text-red-500" /></div>
                <h3 className="text-2xl font-black text-gray-100 mb-2">تأكيد حذف السجل</h3>
                <p className="text-gray-400 text-sm leading-relaxed">سيتم حذف سجل حالة <span className="font-bold text-white">"{entry.horseName}"</span> نهائياً.</p>
                <div className="mt-10 flex gap-4">
                     <button type="button" onClick={() => { onConfirm(entry.id, entry.horseId); onClose(); }} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all">حذف نهائي</button>
                    <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-700 text-gray-300 font-bold rounded-2xl hover:bg-gray-600 transition-all">تراجع</button>
                </div>
            </div>
        </div>
    );
};

const ClinicPage: React.FC<ClinicPageProps> = ({ horses, clinicLog, protocols, onAddEntry, onEditEntry, onDeleteEntry, globalBattalionFilter, setGlobalBattalionFilter }) => {
  const [viewType, setViewType] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateEntryData, setUpdateEntryData] = useState<ClinicLogEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<ClinicLogEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<ClinicLogEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const BATTALIONS: Exclude<Horse['battalion'], 'الكل'>[] = ['الكتيبة الاولى', 'الكتيبة الثانية', 'الكتيبة الثالثة', 'نادي الفروسية'];
  
  const horseNumberMap = useMemo(() => {
    const map: Record<string, string> = {};
    horses.forEach(h => { map[h.id] = h.number; });
    return map;
  }, [horses]);

  const horsesForSelectedBattalion = useMemo(() => { if (globalBattalionFilter === 'الكل') return []; return horses.filter(h => h.battalion === globalBattalionFilter); }, [horses, globalBattalionFilter]);
  
  const filteredClinicLog = useMemo(() => {
    if (globalBattalionFilter === 'الكل') return [];
    const horseIdsInBattalion = new Set(horsesForSelectedBattalion.map(h => h.id));
    let logForBattalion = clinicLog.filter(entry => horseIdsInBattalion.has(entry.horseId));
    if (viewType === 'daily') {
        // تجميع السجلات حسب الحصان للوصول لأحدث حالة
        const horseLatestRecords: Record<string, ClinicLogEntry> = {};
        
        // فرز السجلات حسب التاريخ ثم وقت الإنشاء (الأحدث أولاً)
        const sortedLogs = [...logForBattalion].sort((a, b) => {
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        });

        // نمر على السجلات ونأخذ أحدث سجل لكل حصان بشرط أن يكون تاريخه <= التاريخ المختار
        sortedLogs.forEach(entry => {
            if (entry.date <= selectedDate && !horseLatestRecords[entry.horseId]) {
                horseLatestRecords[entry.horseId] = entry;
            }
        });

        // تصفية السجلات التي يجب أن تظهر في كشف اليوم
        logForBattalion = Object.values(horseLatestRecords).filter(entry => {
            // 1. يظهر إذا كان مسجلاً في نفس اليوم المختار
            if (entry.date === selectedDate) return true;
            
            // 2. يظهر إذا كانت حالته "متابعة" (حالة مستمرة من أيام سابقة)
            if (entry.status === 'monitoring') return true;
            
            // 3. يظهر إذا كان "شفاء" وتاريخ الشفاء هو اليوم المختار (حتى لو السجل قديم)
            if (entry.status === 'recovered' && entry.recoveryDate === selectedDate) return true;

            return false;
        });

        // حساب تاريخ الدخول الأصلي لكل حالة معروضة (لأغراض العرض فقط)
        logForBattalion = logForBattalion.map(entry => {
             const horseHistory = clinicLog
                .filter(e => e.horseId === entry.horseId && e.date <= entry.date)
                .sort((a, b) => a.date.localeCompare(b.date));
            
            let admissionDate = entry.date;
            for (let i = horseHistory.length - 1; i >= 0; i--) {
                const current = horseHistory[i];
                if (current.status === 'healthy') break;
                if (current.status === 'monitoring' || current.status === 'recovered') {
                    admissionDate = current.date;
                }
            }
            return { ...entry, originalAdmissionDate: admissionDate };
        });

        // ترتيب العرض: المتابعة أولاً، ثم الشفاء، ثم السليم
        logForBattalion.sort((a, b) => {
            const statusOrder: any = { monitoring: 0, recovered: 1, healthy: 2 };
            if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
            return b.date.localeCompare(a.date);
        });

    } else {
        // Logic for Monthly and Yearly Views (Grouping by Episode)
        
        // 1. Get all records for the battalion to trace history
        const allBattalionRecords = clinicLog
            .filter(e => horseIdsInBattalion.has(e.horseId))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ascending

        // 2. Group into Episodes
        const episodes: { records: ClinicLogEntry[], horseId: string }[] = [];
        const horseEpisodes: Record<string, typeof episodes[0]> = {};

        allBattalionRecords.forEach(entry => {
            let currentEp = horseEpisodes[entry.horseId];
            
            // تحديد ما إذا كان السجل يبدأ حلقة علاجية جديدة
            let isNew = true;
            if (currentEp) {
                const lastRecord = currentEp.records[currentEp.records.length - 1];
                
                // يستمر السجل في نفس الحلقة إذا:
                // 1. كان السجل السابق "متابعة"
                // 2. أو كان السجل الحالي "شفاء" والسابق "شفاء" (توحيد تحديثات الشفاء)
                // 3. أو كان السجل الحالي "سليم" (إغلاق الحلقة)
                if (lastRecord.status === 'monitoring') {
                    isNew = false;
                } else if (lastRecord.status === 'recovered' && (entry.status === 'recovered' || entry.status === 'healthy')) {
                    isNew = false;
                }
            }

            if (isNew) {
                currentEp = { records: [entry], horseId: entry.horseId };
                horseEpisodes[entry.horseId] = currentEp;
                episodes.push(currentEp);
            } else {
                currentEp.records.push(entry);
            }
        });

        // 3. Filter Episodes relevant to the selected period
        const relevantEpisodes = episodes.filter(ep => {
            // Check if ANY record in the episode falls in the selected period
            return ep.records.some(r => {
                const d = new Date(r.date);
                if (viewType === 'monthly') {
                    return (d.getMonth() + 1) === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
                } else {
                    return d.getFullYear() === parseInt(selectedYear);
                }
            });
        });

        // 4. Transform to Display Entries
        logForBattalion = relevantEpisodes.map(ep => {
            // Find the latest record that is WITHIN or BEFORE the selected period?
            // Actually, usually we want to show the latest status *within the selected period*.
            
            // Filter records in this episode that are within the selected period
            const recordsInPeriod = ep.records.filter(r => {
                const d = new Date(r.date);
                if (viewType === 'monthly') {
                    return (d.getMonth() + 1) === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
                } else {
                    return d.getFullYear() === parseInt(selectedYear);
                }
            });

            // If no records in period (shouldn't happen due to filter above), fallback to last
            const displayRecord = recordsInPeriod.length > 0 
                ? recordsInPeriod[recordsInPeriod.length - 1] 
                : ep.records[ep.records.length - 1];

            return {
                ...displayRecord,
                originalAdmissionDate: ep.records[0].date // First record of the episode
            };
        });

        logForBattalion.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return logForBattalion;
  }, [clinicLog, horsesForSelectedBattalion, globalBattalionFilter, viewType, selectedDate, selectedMonth, selectedYear]);

  const getRecordStatusBadge = (entry: ClinicLogEntry) => {
    const isPersistent = viewType === 'daily' && entry.date < selectedDate && entry.status !== 'recovered';
    switch (entry.status) {
        case 'healthy': return <span className="px-2 py-0.5 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 rounded-md">سليم</span>;
        case 'monitoring': return (
            <div className="flex flex-col gap-1">
                <span className="px-2 py-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md animate-pulse text-center">متابعة</span>
                {isPersistent && <span className="text-[8px] text-amber-500/60 font-black uppercase tracking-tighter text-center">عنبر العيادة</span>}
            </div>
        );
        case 'recovered': return <span className="px-2 py-0.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md">شفاء</span>;
        default: return null;
    }
  };

  if (globalBattalionFilter === 'الكل') {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="text-4xl font-black text-white mb-6">دفتر العيادة اليومي</h1>
        <p className="text-gray-400 mb-12 text-lg">يرجى تحديد كتيبة من الشريط العلوي لعرض وإدارة سجلات الحالات الخاصة بها.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {BATTALIONS.map(battalion => (
            <button key={battalion} onClick={() => setGlobalBattalionFilter(battalion)} className="group p-10 bg-gray-800 rounded-[2rem] shadow-xl hover:shadow-amber-500/10 hover:bg-gray-700 transition-all duration-500 transform hover:-translate-y-2 border border-gray-700 hover:border-amber-500/30"><div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><HorseIcon className="w-12 h-12 text-amber-400"/></div><h2 className="text-xl font-black text-white">{battalion}</h2></button>
          ))}
        </div>
      </div>
    );
  }
  const months = [{ name: 'يناير', value: '1' }, { name: 'فبراير', value: '2' }, { name: 'مارس', value: '3' }, { name: 'أبريل', value: '4' }, { name: 'مايو', value: '5' }, { name: 'يونيو', value: '6' }, { name: 'يوليو', value: '7' }, { name: 'أغسطس', value: '8' }, { name: 'سبتمبر', value: '9' }, { name: 'أكتوبر', value: '10' }, { name: 'نوفمبر', value: '11' }, { name: 'ديسمبر', value: '12' }];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - i));
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {isModalOpen && <AddEntryModal horses={horsesForSelectedBattalion} protocols={protocols} onClose={() => setIsModalOpen(false)} onAddEntry={onAddEntry} />}
      
      {updateEntryData && (
          <AddEntryModal 
            key={updateEntryData.id + selectedDate}
            horses={horses} 
            protocols={protocols} 
            onClose={() => setUpdateEntryData(null)} 
            onAddEntry={(entry, hId, hName, hNum) => {
                onAddEntry(entry, hId, hName, hNum, false);
            }}
            // نمرر البيانات الحالية كقيم افتراضية للتحديث
            initialData={{
                ...updateEntryData,
                date: selectedDate, // التحديث يكون بتاريخ اليوم المختار في الكشف
                isPermanent: false // التحديثات اليومية ليست دائمة افتراضياً
            }}
          />
      )}

      {editingEntry && <EditEntryModal entry={editingEntry} horses={horses} onClose={() => setEditingEntry(null)} onEditEntry={onEditEntry} />}
      {deletingEntry && <ConfirmDeleteModal entry={deletingEntry} onClose={() => setDeletingEntry(null)} onConfirm={onDeleteEntry} />}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div><h1 className="text-3xl font-black text-white flex items-center gap-3"><span className="w-2 h-10 bg-amber-500 rounded-full"></span>دفتر العيادة ({globalBattalionFilter})</h1><p className="text-gray-400 mt-2 font-medium">سجل الحالات المرضية النشطة وتاريخ العلاج.</p></div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all active:scale-95 no-print"><PlusIcon className="w-5 h-5 ml-2" />تسجيل حالة جديدة</button>
      </div>
      <div className="flex bg-gray-800/50 p-1.5 rounded-2xl no-print w-fit border border-gray-700/50">
        <button onClick={() => setViewType('daily')} className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${viewType === 'daily' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>كشف الأحوال اليومي</button>
        <button onClick={() => setViewType('monthly')} className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${viewType === 'monthly' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>الأرشيف الشهري</button>
        <button onClick={() => setViewType('yearly')} className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${viewType === 'yearly' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>الأرشيف السنوي</button>
      </div>
      <div className="bg-gray-800 p-6 rounded-[2rem] shadow-xl flex flex-wrap items-center gap-6 no-print border border-gray-700/50">
        {viewType === 'daily' && (<div className="flex items-center gap-4 w-full sm:w-auto"><label className="font-bold text-gray-400 text-sm whitespace-nowrap">تاريخ التقرير:</label><div className="w-full sm:w-64"><DateInput value={selectedDate} onChange={setSelectedDate} inputClassName="p-3" /></div></div>)}
        {viewType === 'monthly' && (<div className="flex flex-wrap items-center gap-6"><div className="flex items-center gap-3"><label className="text-gray-400 font-bold text-sm">الشهر:</label><select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold outline-none focus:border-amber-500 transition-all">{months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}</select></div><div className="flex items-center gap-3"><label className="text-gray-400 font-bold text-sm">السنة:</label><select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold outline-none focus:border-amber-500 transition-all">{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div></div>)}
        {viewType === 'yearly' && (<div className="flex items-center gap-3"><label className="text-gray-400 font-bold text-sm">السنة:</label><select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold outline-none focus:border-amber-500 transition-all">{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>)}
        <button onClick={() => window.print()} className="mr-auto px-6 py-3 bg-gray-700 text-gray-200 font-bold rounded-xl hover:bg-gray-600 transition-all flex items-center gap-2 border border-gray-600"><PrintIcon className="w-5 h-5" />طباعة السجل</button>
      </div>
       <div className="bg-gray-800 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-700/50">
        <div className="p-6 bg-gray-900/50 border-b border-gray-700/50 print:bg-white print:text-black flex justify-between items-center"><h2 className="text-xl font-black text-amber-500 print:text-black">{viewType === 'daily' && `كشف أحوال العيادة ليوم ${selectedDate}`} {viewType === 'monthly' && `سجل حالات شهر ${months.find(m => m.value === selectedMonth)?.name} ${selectedYear}`} {viewType === 'yearly' && `سجل حالات سنة ${selectedYear}`}</h2>{viewType === 'daily' && (<span className="text-xs font-bold text-gray-500 no-print">عدد الحالات: {filteredClinicLog.length}</span>)}</div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50 text-right">
            <thead className="bg-gray-900/30">
                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest"><th className="px-6 py-4">تاريخ الدخول</th><th className="px-6 py-4">اسم الحصان ورقمه</th><th className="px-6 py-4">التشخيص</th><th className="px-6 py-4 text-center">الموقف الحالي</th><th className="px-6 py-4">العلاج والملاحظات</th><th className="px-6 py-4 text-left no-print">إجراءات</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
                {filteredClinicLog.length > 0 ? filteredClinicLog.map((entry) => {
                    const horseNum = entry.horseNumber || horseNumberMap[entry.horseId] || '---';
                    return (
                        <tr key={entry.id} className="transition-colors group hover:bg-gray-700/20">
                            <td className="px-6 py-5 whitespace-nowrap text-xs font-mono text-gray-400">
                                {(entry as any).originalAdmissionDate || entry.date}
                                {entry.status === 'recovered' && (<span className="block text-[9px] text-blue-400 font-bold mt-1">شفاء: {entry.recoveryDate || entry.date}</span>)}
                                {entry.date !== ((entry as any).originalAdmissionDate || entry.date) && viewType === 'daily' && (
                                    <span className="block text-[9px] text-amber-500/70 mt-1">تحديث: {entry.date}</span>
                                )}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex flex-col leading-tight">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-black text-white">{entry.horseName}</span>
                                        {entry.isPermanent && <ShieldIcon className="w-3 h-3 text-amber-500" title="مسجل بالسجل الدائم" />}
                                    </div>
                                    <span className="text-[10px] font-mono text-amber-500/80">#{horseNum}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-300 font-bold">{entry.diagnosis}</td>
                            <td className="px-6 py-5 whitespace-nowrap text-center">{getRecordStatusBadge(entry)}</td>
                            <td className="px-6 py-5 text-xs text-gray-400 italic max-w-xs"><div className="truncate group-hover:whitespace-normal transition-all duration-500">{entry.treatment || '-'}{entry.notes && <p className="mt-1 text-gray-500 border-t border-gray-700/50 pt-1">ملاحظة: {entry.notes}</p>}</div></td>
                            <td className="px-6 py-5 whitespace-nowrap text-left no-print">
                                <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    {entry.status === 'monitoring' && (
                                        <button 
                                            onClick={() => setUpdateEntryData(entry)} 
                                            className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black"
                                            title={entry.date === selectedDate ? "إضافة تحديث آخر لليوم" : "إضافة تحديث يومي للعلاج"}
                                        >
                                            {entry.date === selectedDate ? "تحديث إضافي" : "تحديث اليوم"}
                                        </button>
                                    )}
                                    <button onClick={() => setEditingEntry(entry)} className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setDeletingEntry(entry)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </td>
                        </tr>
                    );
                }) : (<tr><td colSpan={6} className="text-center py-20 text-gray-500 font-bold">{viewType === 'daily' ? 'عنبر العيادة خالٍ تماماً..' : 'لا توجد سجلات مؤرشفة للفترة المختارة.'}</td></tr>)}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ClinicPage;
