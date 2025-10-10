import React, { useState, useMemo } from 'react';
import { Horse, Vaccination } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, VaccinationIcon } from '../components/icons';
import DateInput from '../components/DateInput';

interface VaccinationsPageProps {
  horses: Horse[];
  vaccinations: Vaccination[];
  onAddVaccination: (vaccination: Omit<Vaccination, 'id' | 'createdAt'>) => void;
  onEditVaccination: (vaccination: Vaccination) => void;
  onDeleteVaccination: (vaccinationId: string) => void;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  setGlobalBattalionFilter: (battalion: Horse['battalion'] | 'الكل') => void;
}

const AddVaccinationModal: React.FC<{
  horses: Horse[];
  onClose: () => void;
  onAdd: (vaccination: Omit<Vaccination, 'id' | 'createdAt'>) => void;
}> = ({ horses, onClose, onAdd }) => {
    const [selectedHorses, setSelectedHorses] = useState<Horse[]>([]);
    const [horseSearch, setHorseSearch] = useState('');
    const [showHorseList, setShowHorseList] = useState(false);
    
    const [type, setType] = useState<Vaccination['type']>('vaccination');
    const [productName, setProductName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [nextDuePeriod, setNextDuePeriod] = useState('0'); // '0' means no due date

    const availableHorsesToSelect = useMemo(() => {
        const selectedIds = new Set(selectedHorses.map(h => h.id));
        const filteredBySearch = horseSearch
            ? horses.filter(h =>
                h.name.toLowerCase().includes(horseSearch.toLowerCase()) ||
                h.number.includes(horseSearch.toLowerCase())
            )
            : horses;

        return filteredBySearch.filter(h => !selectedIds.has(h.id));
    }, [horseSearch, horses, selectedHorses]);


    const handleSelectHorse = (horse: Horse) => {
        setSelectedHorses(prev => [...prev, horse]);
        setHorseSearch('');
    };
    
    const handleRemoveHorse = (horseId: string) => {
        setSelectedHorses(prev => prev.filter(h => h.id !== horseId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedHorses.length === 0) {
            alert('يرجى اختيار حصان واحد على الأقل.');
            return;
        }

        const nextDueMonths = parseInt(nextDuePeriod, 10);
        let nextDueDate: string | undefined = undefined;
    
        if (nextDueMonths > 0) {
            const startDate = new Date(date);
            startDate.setUTCHours(12); // Avoid timezone issues
            startDate.setMonth(startDate.getMonth() + nextDueMonths);
            nextDueDate = startDate.toISOString().split('T')[0];
        }

        selectedHorses.forEach(horse => {
             onAdd({ horseId: horse.id, horseName: horse.name, type, productName, date, nextDueDate });
        });
       
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">تسجيل جديد</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block mb-2 font-medium text-gray-300">اختر الخيول</label>
                        <div className="flex flex-wrap gap-2 p-2 bg-gray-900/50 rounded-lg min-h-[48px] border border-gray-700">
                            {selectedHorses.length === 0 && <span className="text-gray-500 px-2 py-1">لم يتم تحديد أي خيول</span>}
                            {selectedHorses.map(horse => (
                                <div key={horse.id} className="flex items-center gap-2 bg-amber-500/20 text-amber-200 text-sm font-medium px-3 py-1 rounded-full animate-fade-in">
                                    <span>{horse.name} ({horse.number})</span>
                                    <button type="button" onClick={() => handleRemoveHorse(horse.id)} className="text-amber-400 hover:text-white rounded-full hover:bg-black/20">
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="relative mt-2">
                           <input 
                             type="text"
                             value={horseSearch}
                             onChange={(e) => setHorseSearch(e.target.value)}
                             onFocus={() => setShowHorseList(true)}
                             onBlur={() => setTimeout(() => setShowHorseList(false), 200)}
                             placeholder="ابحث بالاسم أو الرقم لإضافة حصان..."
                             className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500"
                           />
                           {showHorseList && availableHorsesToSelect.length > 0 && (
                                <ul className="absolute z-20 w-full bg-gray-900 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {availableHorsesToSelect.map(h => (
                                        <li 
                                            key={h.id} 
                                            onMouseDown={() => handleSelectHorse(h)}
                                            className="p-3 hover:bg-amber-500/20 cursor-pointer text-gray-200"
                                        >
                                            {h.name} ({h.number})
                                        </li>
                                    ))}
                                </ul>
                           )}
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block mb-2 font-medium text-gray-300">النوع</label>
                           <select value={type} onChange={e => setType(e.target.value as Vaccination['type'])} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200">
                               <option value="vaccination">تحصين</option>
                               <option value="deworming">تجريع</option>
                           </select>
                        </div>
                        <input name="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="اسم المنتج" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 self-end" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block mb-2 font-medium text-gray-300">تاريخ الإجراء</label>
                          <DateInput value={date} onChange={setDate} required />
                      </div>
                       <div>
                          <label className="block mb-2 font-medium text-gray-300">الموعد القادم (اختياري)</label>
                          <select 
                              value={nextDuePeriod} 
                              onChange={(e) => setNextDuePeriod(e.target.value)} 
                              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                          >
                              <option value="0">لا يوجد</option>
                              {Array.from({ length: 36 }, (_, i) => i + 1).map(months => (
                                  <option key={months} value={months}>
                                      بعد {months} {months === 1 ? 'شهر' : months === 2 ? 'شهرين' : (months >= 3 && months <= 10) ? 'أشهر' : 'شهرًا'}
                                  </option>
                              ))}
                          </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600">تسجيل</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditVaccinationModal: React.FC<{
  vaccination: Vaccination;
  onClose: () => void;
  onEdit: (vaccination: Vaccination) => void;
}> = ({ vaccination, onClose, onEdit }) => {
    
    const calculateMonthDiff = (startDateStr: string, endDateStr: string): number => {
      if (!startDateStr || !endDateStr) return 0;
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      const yearDiff = end.getFullYear() - start.getFullYear();
      const monthDiff = end.getMonth() - start.getMonth();
      const totalMonths = yearDiff * 12 + monthDiff;
      // Simple rounding for partial months
      const dayDiff = end.getDate() - start.getDate();
      if (dayDiff > 15) return totalMonths + 1;
      if (dayDiff < -15) return totalMonths -1;
      return totalMonths;
    };

    const initialPeriod = vaccination.nextDueDate ? calculateMonthDiff(vaccination.date, vaccination.nextDueDate) : 0;

    const [formData, setFormData] = useState(vaccination);
    const [nextDuePeriod, setNextDuePeriod] = useState(String(initialPeriod > 0 ? initialPeriod : 0));


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const nextDueMonths = parseInt(nextDuePeriod, 10);
        let nextDueDate: string | undefined = undefined;

        if (nextDueMonths > 0) {
            const startDate = new Date(formData.date);
            startDate.setUTCHours(12);
            startDate.setMonth(startDate.getMonth() + nextDueMonths);
            nextDueDate = startDate.toISOString().split('T')[0];
        }

        const finalData = { ...formData, nextDueDate };
        if (!finalData.nextDueDate) {
          delete (finalData as Partial<typeof finalData>).nextDueDate;
        }

        onEdit(finalData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">تعديل سجل</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200"><XMarkIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input value={formData.horseName} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-400" readOnly />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block mb-2 font-medium text-gray-300">النوع</label>
                           <select name="type" value={formData.type} onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200">
                               <option value="vaccination">تحصين</option>
                               <option value="deworming">تجريع</option>
                           </select>
                        </div>
                        <div className="self-end">
                            <label className="block mb-2 font-medium text-gray-300">اسم المنتج</label>
                            <input name="productName" value={formData.productName} onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200" required />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 font-medium text-gray-300">تاريخ الإجراء</label>
                          <DateInput value={formData.date} onChange={value => handleChange({target: {name: 'date', value}} as any)} required />
                        </div>
                         <div>
                          <label className="block mb-2 font-medium text-gray-300">الموعد القادم</label>
                          <select 
                              value={nextDuePeriod} 
                              onChange={(e) => setNextDuePeriod(e.target.value)} 
                              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                          >
                              <option value="0">لا يوجد</option>
                              {Array.from({ length: 36 }, (_, i) => i + 1).map(months => (
                                  <option key={months} value={months}>
                                      بعد {months} {months === 1 ? 'شهر' : months === 2 ? 'شهرين' : (months >= 3 && months <= 10) ? 'أشهر' : 'شهرًا'}
                                  </option>
                              ))}
                          </select>
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
  item: Vaccination;
  onClose: () => void;
  onConfirm: (itemId: string) => void;
}> = ({ item, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-700">
            <h3 className="text-xl font-bold text-gray-100 mt-5">تأكيد الحذف</h3>
            <p className="text-gray-400 mt-2">هل أنت متأكد من حذف سجل <span className="font-bold text-gray-200">{item.productName}</span> للحصان <span className="font-bold text-gray-200">{item.horseName}</span>؟</p>
            <div className="mt-8 flex justify-center gap-4">
                 <button type="button" onClick={() => onConfirm(item.id)} className="px-8 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">نعم، قم بالحذف</button>
                 <button type="button" onClick={onClose} className="px-8 py-2 bg-gray-600 text-gray-100 font-semibold rounded-lg hover:bg-gray-500">إلغاء</button>
            </div>
        </div>
    </div>
);


const VaccinationsPage: React.FC<VaccinationsPageProps> = ({ horses, vaccinations, onAddVaccination, onEditVaccination, onDeleteVaccination, globalBattalionFilter, setGlobalBattalionFilter }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
    const [deletingVaccination, setDeletingVaccination] = useState<Vaccination | null>(null);

    const BATTALIONS: Exclude<Horse['battalion'], 'الكل'>[] = ['الكتيبة الاولى', 'الكتيبة الثانية', 'الكتيبة الثالثة', 'نادي الفروسية'];

    const vaccinationsForSelectedBattalion = useMemo(() => {
        if (globalBattalionFilter === 'الكل') return [];
        const horseIdsInBattalion = new Set(horses.filter(h => h.battalion === globalBattalionFilter).map(h => h.id));
        return vaccinations.filter(v => horseIdsInBattalion.has(v.horseId));
    }, [vaccinations, horses, globalBattalionFilter]);

    const getDueDateBadge = (dueDateString?: string) => {
        if (!dueDateString) return <span className="text-gray-500">لا يوجد</span>;
        
        const dueDate = new Date(dueDateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        if (dueDate < today) {
            return <span className="px-2 py-1 text-xs font-medium text-red-300 bg-red-500/20 rounded-full">{dueDateString}</span>;
        }
        if (dueDate <= thirtyDaysFromNow) {
            return <span className="px-2 py-1 text-xs font-medium text-yellow-300 bg-yellow-500/20 rounded-full">{dueDateString}</span>;
        }
        return <span className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-500/20 rounded-full">{dueDateString}</span>;
    };

    if (globalBattalionFilter === 'الكل') {
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">سجل التحصينات والتجريعات</h1>
            <p className="text-gray-400 mb-10 text-lg">يرجى تحديد كتيبة من الشريط العلوي لعرض أو تسجيل السجلات.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BATTALIONS.map(battalion => (
                <button 
                  key={battalion} 
                  onClick={() => setGlobalBattalionFilter(battalion)} 
                  className="p-8 bg-gray-700 rounded-xl shadow-lg hover:shadow-amber-500/10 hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <VaccinationIcon className="w-16 h-16 mx-auto text-amber-400 mb-4"/>
                  <h2 className="text-xl font-bold text-white">{battalion}</h2>
                </button>
              ))}
            </div>
          </div>
        );
    }

    return (
        <div className="space-y-6">
            {isAddModalOpen && <AddVaccinationModal horses={horses.filter(h => h.battalion === globalBattalionFilter)} onClose={() => setIsAddModalOpen(false)} onAdd={onAddVaccination} />}
            {editingVaccination && <EditVaccinationModal vaccination={editingVaccination} onClose={() => setEditingVaccination(null)} onEdit={onEditVaccination} />}
            {deletingVaccination && <ConfirmDeleteModal item={deletingVaccination} onClose={() => setDeletingVaccination(null)} onConfirm={onDeleteVaccination} />}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">سجل التحصينات والتجريعات</h1>
                  <p className="text-gray-400 mt-2">إدارة سجلات التحصين والتجريع للخيول في الكتيبة المحددة.</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 shadow-md">
                    <PlusIcon className="w-5 h-5 ml-2" />
                    تسجيل جديد
                  </button>
                </div>
            </div>

            <div className="bg-gray-700 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-900/50">
                        <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">التاريخ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">اسم الحصان</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">النوع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">اسم المنتج</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الميعاد القادم</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                        {vaccinationsForSelectedBattalion.length > 0 ? vaccinationsForSelectedBattalion.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-600/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{v.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{v.horseName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${v.type === 'vaccination' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                    {v.type === 'vaccination' ? 'تحصين' : 'تجريع'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{v.productName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{getDueDateBadge(v.nextDueDate)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                            <button onClick={() => setEditingVaccination(v)} className="text-gray-400 hover:text-gray-200 p-2 rounded-md hover:bg-gray-800/50"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => setDeletingVaccination(v)} className="text-red-500 hover:text-red-400 p-2 rounded-md hover:bg-gray-800/50"><TrashIcon className="w-5 h-5"/></button>
                            </td>
                        </tr>
                        )) : (
                        <tr>
                            <td colSpan={6} className="text-center py-10 text-gray-400">
                            لا توجد سجلات لهذه الكتيبة.
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

export default VaccinationsPage;