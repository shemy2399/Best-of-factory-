
import React, { useState, useMemo, useEffect } from 'react';
import { Horse, Medication, MedicalRecordEntry, TreatmentProtocol } from '../types';
// Removed non-existent CalendarIcon import
import { PlusIcon, XMarkIcon, HorseIcon, PencilIcon, TrashIcon } from '../components/icons';
import DateInput from '../components/DateInput';

type ClinicLogEntry = { horseName: string; horseId: string } & MedicalRecordEntry;

interface ClinicPageProps {
  horses: Horse[];
  medications: Medication[];
  clinicLog: ClinicLogEntry[];
  protocols: TreatmentProtocol[];
  onAddEntry: (entry: Omit<MedicalRecordEntry, 'id'>, horseId: string, horseName: string, addToHistory: boolean) => void;
  onEditEntry: (entry: ClinicLogEntry) => void;
  onDeleteEntry: (entryId: string, horseId: string) => void;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  setGlobalBattalionFilter: (battalion: Horse['battalion'] | 'الكل') => void;
}

const AddEntryModal: React.FC<{
  horses: Horse[];
  protocols: TreatmentProtocol[];
  onClose: () => void;
  onAddEntry: (entry: Omit<MedicalRecordEntry, 'id'>, horseId: string, horseName: string, addToHistory: boolean) => void;
}> = ({ horses, protocols, onClose, onAddEntry }) => {
    const [selectedHorseId, setSelectedHorseId] = useState<string>('');
    const [horseSearch, setHorseSearch] = useState('');
    const [showHorseList, setShowHorseList] = useState(false);
    
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<MedicalRecordEntry['status']>('sick');
    const [recoveryDate, setRecoveryDate] = useState('');
    const [addToMedicalHistory, setAddToMedicalHistory] = useState(true);
    const [followUpDate, setFollowUpDate] = useState('');
    const [followUpNotes, setFollowUpNotes] = useState('');
    
    const [suggestedProtocols, setSuggestedProtocols] = useState<TreatmentProtocol[]>([]);

    const selectedHorse = useMemo(() => horses.find(h => h.id === selectedHorseId), [selectedHorseId, horses]);
    
    useEffect(() => {
        if (diagnosis.trim()) {
            const lowerDiagnosis = diagnosis.toLowerCase();
            setSuggestedProtocols(
                protocols.filter(p => p.diagnosisName.toLowerCase().includes(lowerDiagnosis))
            );
        } else {
            setSuggestedProtocols([]);
        }
    }, [diagnosis, protocols]);

    const filteredHorses = useMemo(() => {
        if (!horseSearch) return horses;
        const lowercasedSearch = horseSearch.toLowerCase();
        return horses.filter(h =>
            h.name.toLowerCase().includes(lowercasedSearch) ||
            h.number.includes(lowercasedSearch)
        );
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
        if (!selectedHorse) {
            alert('يرجى اختيار حصان من القائمة.');
            return;
        }

        if (status === 'recovered' && !recoveryDate) {
            alert('يرجى تحديد تاريخ الشفاء.');
            return;
        }

        const entryData: Omit<MedicalRecordEntry, 'id'> = {
            date,
            diagnosis,
            treatment,
            notes,
            status,
            ...(status === 'recovered' && { recoveryDate }),
            ...(followUpDate && { followUpDate }),
            ...(followUpNotes && { followUpNotes })
        };

        onAddEntry(entryData, selectedHorseId, selectedHorse.name, addToMedicalHistory);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">تسجيل حالة جديدة</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                           <label className="block mb-2 font-medium text-gray-300">اختر الحصان</label>
                           <input 
                             type="text"
                             value={horseSearch}
                             onChange={(e) => {
                                 setHorseSearch(e.target.value);
                                 setSelectedHorseId('');
                                 setShowHorseList(true);
                             }}
                             onFocus={() => setShowHorseList(true)}
                             onBlur={() => setTimeout(() => setShowHorseList(false), 200)}
                             placeholder="ابحث بالاسم أو الرقم..."
                             className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                             required={!selectedHorseId}
                           />
                           {showHorseList && (
                                <ul className="absolute z-20 w-full bg-gray-900 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {filteredHorses.length > 0 ? filteredHorses.map(h => (
                                        <li 
                                            key={h.id} 
                                            onMouseDown={() => handleSelectHorse(h)}
                                            className="p-3 hover:bg-amber-500/20 cursor-pointer text-gray-200"
                                        >
                                            {h.name} ({h.number})
                                        </li>
                                    )) : (
                                        <li className="p-3 text-gray-400">لا توجد نتائج</li>
                                    )}
                                </ul>
                           )}
                        </div>
                         <div>
                            <label className="block mb-2 font-medium text-gray-400">الكتيبة</label>
                            <input value={selectedHorse?.battalion || '...'} className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900/50 text-gray-300" readOnly />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block mb-2 font-medium text-gray-300">تاريخ دخول الحالة</label>
                            <DateInput value={date} onChange={setDate} required />
                        </div>
                        <div>
                           <label className="block mb-2 font-medium text-gray-300">حالة الحصان</label>
                           <select value={status} onChange={e => setStatus(e.target.value as MedicalRecordEntry['status'])} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg" required>
                                <option value="sick">مريض</option>
                                <option value="monitoring">متابعة</option>
                                <option value="recovered">شفاء</option>
                                <option value="healthy">سليم</option>
                           </select>
                        </div>
                    </div>
                    {status === 'recovered' && (
                        <div>
                            <label className="block mb-2 font-medium text-gray-300">تاريخ الشفاء</label>
                            <DateInput value={recoveryDate} onChange={setRecoveryDate} required />
                        </div>
                    )}
                    <div className="relative">
                        <label className="block mb-2 font-medium text-gray-300">التشخيص</label>
                        <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="مثال: عرج، مغص، جرح قطعي..." rows={2} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg" required></textarea>
                         {suggestedProtocols.length > 0 && (
                            <ul className="absolute z-10 w-full bg-gray-900 border border-gray-600 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {suggestedProtocols.map(p => (
                                    <li key={p.id} onMouseDown={() => handleApplyProtocol(p)} className="p-3 hover:bg-amber-500/20 cursor-pointer text-gray-200">
                                        تطبيق بروتوكول: <span className="font-bold">{p.diagnosisName}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-gray-300">العلاج</label>
                        <textarea value={treatment} onChange={e => setTreatment(e.target.value)} placeholder="اكتب العلاج الموصوف والجرعات..." rows={3} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"></textarea>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-gray-300">التوصيات</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="مثال: راحة لمدة 3 أيام، متابعة يومية..." rows={3} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"></textarea>
                    </div>
                     <div className="p-4 bg-gray-900/50 rounded-lg space-y-4">
                        <h4 className="font-bold text-amber-400">إضافة متابعة (اختياري)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">تاريخ المتابعة</label>
                                <DateInput value={followUpDate} onChange={setFollowUpDate} inputClassName="p-2" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-gray-300">ملاحظات المتابعة</label>
                                <input value={followUpNotes} onChange={e => setFollowUpNotes(e.target.value)} placeholder="مثال: إعادة فحص، إزالة الغرز..." className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                            </div>
                        </div>
                    </div>
                     <div className="flex items-center pt-2">
                        <input id="addToHistory" type="checkbox" checked={addToMedicalHistory} onChange={e => setAddToMedicalHistory(e.target.checked)} className="w-4 h-4 text-amber-500 bg-gray-600 border-gray-500 rounded"/>
                        <label htmlFor="addToHistory" className="mr-2 text-sm font-medium text-gray-200">إضافة إلى السجل الطبي الدائم للحصان</label>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600">تسجيل الحالة</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditEntryModal: React.FC<{
  entry: ClinicLogEntry;
  onClose: () => void;
  onEditEntry: (entry: ClinicLogEntry) => void;
}> = ({ entry, onClose, onEditEntry }) => {
    const [formData, setFormData] = useState({ 
        ...entry, 
        recoveryDate: entry.recoveryDate || '',
        followUpDate: entry.followUpDate || '',
        followUpNotes: entry.followUpNotes || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    useEffect(() => {
        if(formData.status !== 'recovered') {
            setFormData(prev => ({...prev, recoveryDate: ''}));
        }
    }, [formData.status]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.status === 'recovered' && !formData.recoveryDate) {
            alert('يرجى تحديد تاريخ الشفاء.');
            return;
        }
        
        const dataToSubmit: ClinicLogEntry = { ...formData };
        if (!dataToSubmit.followUpDate) delete dataToSubmit.followUpDate;
        if (!dataToSubmit.followUpNotes) delete dataToSubmit.followUpNotes;
        if (!dataToSubmit.recoveryDate) delete dataToSubmit.recoveryDate;

        onEditEntry(dataToSubmit);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">تعديل سجل حالة</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block mb-2 font-medium text-gray-400">الحصان</label>
                        <input value={formData.horseName} className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900/50 text-gray-300" readOnly />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block mb-2 font-medium text-gray-300">تاريخ دخول الحالة</label>
                            <DateInput value={formData.date} onChange={value => handleChange({target:{name:'date', value}} as any)} required />
                        </div>
                        <div>
                           <label className="block mb-2 font-medium text-gray-300">حالة الحصان</label>
                           <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg" required>
                                <option value="sick">مريض</option>
                                <option value="monitoring">متابعة</option>
                                <option value="recovered">شفاء</option>
                                <option value="healthy">سليم</option>
                           </select>
                        </div>
                    </div>
                    {formData.status === 'recovered' && (
                        <div>
                            <label className="block mb-2 font-medium text-gray-300">تاريخ الشفاء</label>
                            <DateInput value={formData.recoveryDate} onChange={value => handleChange({target:{name:'recoveryDate', value}} as any)} required />
                        </div>
                    )}
                    <div>
                        <label className="block mb-2 font-medium text-gray-300">التشخيص</label>
                        <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} rows={2} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg" required></textarea>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-gray-300">العلاج</label>
                        <textarea name="treatment" value={formData.treatment} onChange={handleChange} rows={3} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"></textarea>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium text-gray-300">التوصيات</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"></textarea>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg space-y-4">
                        <h4 className="font-bold text-amber-400">تعديل المتابعة</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">تاريخ المتابعة</label>
                                <DateInput value={formData.followUpDate} onChange={value => handleChange({target:{name:'followUpDate', value}} as any)} inputClassName="p-2"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-gray-300">ملاحظات المتابعة</label>
                                <input name="followUpNotes" value={formData.followUpNotes} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600">حفظ التعديلات</button>
                    </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-700">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
                    <TrashIcon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-100 mt-5">تأكيد الحذف</h3>
                <p className="text-gray-400 mt-2">
                    هل أنت متأكد من حذف سجل حالة <span className="font-bold text-gray-200">{entry.horseName}</span> بتاريخ <span className="font-bold text-gray-200">{entry.date}</span>؟<br/>
                    لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                     <button
                        type="button"
                        onClick={() => { onConfirm(entry.id, entry.horseId); onClose(); }}
                        className="px-8 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                    >
                        نعم، قم بالحذف
                    </button>
                    <button type="button" onClick={onClose} className="px-8 py-2 bg-gray-600 text-gray-100 font-semibold rounded-lg hover:bg-gray-500">
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

const ClinicPage: React.FC<ClinicPageProps> = ({ horses, clinicLog, protocols, onAddEntry, onEditEntry, onDeleteEntry, globalBattalionFilter, setGlobalBattalionFilter }) => {
  const [viewType, setViewType] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ClinicLogEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<ClinicLogEntry | null>(null);
  
  // Date Filters
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

  const BATTALIONS: Exclude<Horse['battalion'], 'الكل'>[] = ['الكتيبة الاولى', 'الكتيبة الثانية', 'الكتيبة الثالثة', 'نادي الفروسية'];
  
  const horsesForSelectedBattalion = useMemo(() => {
    if (globalBattalionFilter === 'الكل') return [];
    return horses.filter(h => h.battalion === globalBattalionFilter);
  }, [horses, globalBattalionFilter]);

  const filteredClinicLog = useMemo(() => {
    if (globalBattalionFilter === 'الكل') return [];
    const horseIdsInBattalion = new Set(horsesForSelectedBattalion.map(h => h.id));
    let logForBattalion = clinicLog.filter(entry => horseIdsInBattalion.has(entry.horseId));

    if (viewType === 'daily') {
        logForBattalion = logForBattalion.filter(entry => entry.date === selectedDate);
    } else if (viewType === 'monthly') {
        logForBattalion = logForBattalion.filter(entry => {
            const d = new Date(entry.date);
            return (d.getMonth() + 1) === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
        });
    } else if (viewType === 'yearly') {
        logForBattalion = logForBattalion.filter(entry => {
            const d = new Date(entry.date);
            return d.getFullYear() === parseInt(selectedYear);
        });
    }
    
    return logForBattalion.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [clinicLog, horsesForSelectedBattalion, globalBattalionFilter, viewType, selectedDate, selectedMonth, selectedYear]);

  const getRecordStatusBadge = (status: MedicalRecordEntry['status']) => {
    switch (status) {
        case 'healthy': return <span className="px-2 py-0.5 text-xs font-medium text-green-300 bg-green-500/20 rounded-full">سليم</span>;
        case 'monitoring': return <span className="px-2 py-0.5 text-xs font-medium text-yellow-300 bg-yellow-500/20 rounded-full">متابعة</span>;
        case 'sick': return <span className="px-2 py-0.5 text-xs font-medium text-red-300 bg-red-500/20 rounded-full">مريض</span>;
        case 'recovered': return <span className="px-2 py-0.5 text-xs font-medium text-blue-300 bg-blue-500/20 rounded-full">شفاء</span>;
        default: return null;
    }
  };

  if (globalBattalionFilter === 'الكل') {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">دفتر العيادة اليومي</h1>
        <p className="text-gray-400 mb-10 text-lg">يرجى تحديد كتيبة من الشريط العلوي لعرض دفترها.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BATTALIONS.map(battalion => (
            <button key={battalion} onClick={() => setGlobalBattalionFilter(battalion)} className="p-8 bg-gray-700 rounded-xl shadow-lg hover:shadow-amber-500/10 hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1">
              <HorseIcon className="w-16 h-16 mx-auto text-amber-400 mb-4"/>
              <h2 className="text-xl font-bold text-white">{battalion}</h2>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const months = [
    { name: 'يناير', value: '1' }, { name: 'فبراير', value: '2' }, { name: 'مارس', value: '3' },
    { name: 'أبريل', value: '4' }, { name: 'مايو', value: '5' }, { name: 'يونيو', value: '6' },
    { name: 'يوليو', value: '7' }, { name: 'أغسطس', value: '8' }, { name: 'سبتمبر', value: '9' },
    { name: 'أكتوبر', value: '10' }, { name: 'نوفمبر', value: '11' }, { name: 'ديسمبر', value: '12' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

  return (
    <div className="space-y-6">
      {isModalOpen && <AddEntryModal horses={horsesForSelectedBattalion} protocols={protocols} onClose={() => setIsModalOpen(false)} onAddEntry={onAddEntry} />}
      {editingEntry && <EditEntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} onEditEntry={onEditEntry} />}
      {deletingEntry && <ConfirmDeleteModal entry={deletingEntry} onClose={() => setDeletingEntry(null)} onConfirm={onDeleteEntry} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">دفتر العيادة ({globalBattalionFilter})</h1>
          <p className="text-gray-400 mt-2">تسجيل الحالات اليومية ومتابعتها للكتيبة المحددة.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto no-print">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 shadow-md">
            <PlusIcon className="w-5 h-5 ml-2" />
            تسجيل حالة جديدة
          </button>
        </div>
      </div>

      {/* View Selector Tabs */}
      <div className="flex border-b border-gray-700 no-print">
        <button onClick={() => setViewType('daily')} className={`px-6 py-3 font-bold transition-all ${viewType === 'daily' ? 'text-amber-400 border-b-2 border-amber-400 bg-gray-700/30' : 'text-gray-400 hover:text-gray-200'}`}>سجل يومي</button>
        <button onClick={() => setViewType('monthly')} className={`px-6 py-3 font-bold transition-all ${viewType === 'monthly' ? 'text-amber-400 border-b-2 border-amber-400 bg-gray-700/30' : 'text-gray-400 hover:text-gray-200'}`}>سجل شهري</button>
        <button onClick={() => setViewType('yearly')} className={`px-6 py-3 font-bold transition-all ${viewType === 'yearly' ? 'text-amber-400 border-b-2 border-amber-400 bg-gray-700/30' : 'text-gray-400 hover:text-gray-200'}`}>سجل سنوي</button>
      </div>

      {/* Filters UI */}
      <div className="bg-gray-700 p-4 rounded-xl shadow-lg flex flex-wrap items-center gap-6 no-print">
        {viewType === 'daily' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="font-medium text-gray-300 whitespace-nowrap">تاريخ اليوم:</label>
                <div className="w-full sm:w-64">
                    <DateInput value={selectedDate} onChange={setSelectedDate} inputClassName="p-2" />
                </div>
            </div>
        )}
        {viewType === 'monthly' && (
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-gray-300">الشهر:</label>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="p-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                        {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-gray-300">السنة:</label>
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="p-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
        )}
        {viewType === 'yearly' && (
            <div className="flex items-center gap-3">
                <label className="text-gray-300">اختر السنة:</label>
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="p-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        )}
        
        {/* Print Button for specific view */}
        <div className="mr-auto">
             <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                 طباعة {viewType === 'daily' ? 'اليومي' : viewType === 'monthly' ? 'الشهري' : 'السنوي'}
             </button>
        </div>
      </div>

       <div className="bg-gray-700 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-900/50 border-b border-gray-600 print:bg-white print:text-black print:border-black">
            <h2 className="text-lg font-bold text-amber-400 print:text-black">
                {viewType === 'daily' && `سجل يوم ${selectedDate}`}
                {viewType === 'monthly' && `سجل شهر ${months.find(m => m.value === selectedMonth)?.name} ${selectedYear}`}
                {viewType === 'yearly' && `سجل سنة ${selectedYear}`}
            </h2>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600 print:divide-black">
            <thead className="bg-gray-900/50 print:bg-gray-100">
                <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase print:text-black">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase print:text-black">اسم الحصان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase print:text-black">التشخيص</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase print:text-black">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase print:text-black">العلاج</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase no-print">الإجراءات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-600 print:divide-black">
                {filteredClinicLog.length > 0 ? filteredClinicLog.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-600/50 transition-colors print:bg-white print:text-black">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 print:text-black">{entry.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 print:text-black">{entry.horseName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 print:text-black">{entry.diagnosis}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getRecordStatusBadge(entry.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 print:text-black">{entry.treatment || 'لا يوجد'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse no-print">
                    <button onClick={() => setEditingEntry(entry)} className="text-gray-400 hover:text-gray-200 p-2 rounded-md hover:bg-gray-800/50" aria-label={`تعديل ${entry.horseName}`}><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => setDeletingEntry(entry)} className="text-red-500 hover:text-red-400 p-2 rounded-md hover:bg-gray-800/50" aria-label={`حذف ${entry.horseName}`}><TrashIcon className="w-5 h-5"/></button>
                    </td>
                </tr>
                )) : (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                    لا توجد حالات مسجلة للفترة المختارة.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ClinicPage;
