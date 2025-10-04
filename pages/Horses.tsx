import React, { useState, useMemo } from 'react';
import { Horse, MedicalRecordEntry, Vaccination } from '../types';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, XMarkIcon } from '../components/icons';

interface HorsesPageProps {
  horses: Horse[];
  vaccinations: Vaccination[];
  onAddHorse: (horse: Omit<Horse, 'id' | 'medicalHistory' | 'status' | 'createdAt'>) => void;
  onEditHorse: (horse: Horse) => void;
  onDeleteHorse: (horseId: string) => void;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
}

const getStatusBadge = (status: Horse['status']) => {
  switch (status) {
    case 'healthy':
      return <span className="px-3 py-1 text-xs font-medium text-green-300 bg-green-500/20 rounded-full">سليم</span>;
    case 'monitoring':
      return <span className="px-3 py-1 text-xs font-medium text-yellow-300 bg-yellow-500/20 rounded-full">متابعة</span>;
    case 'sick':
      return <span className="px-3 py-1 text-xs font-medium text-red-300 bg-red-500/20 rounded-full">مريض</span>;
    default:
      return null;
  }
};

const AddHorseModal: React.FC<{ onClose: () => void, onAddHorse: (horse: Omit<Horse, 'id' | 'medicalHistory' | 'status' | 'createdAt'>) => void }> = ({ onClose, onAddHorse }) => {
    const [formData, setFormData] = useState({
        number: '',
        name: '',
        dateOfBirth: '',
        breed: '',
        color: '',
        battalion: 'الكتيبة الاولى' as Horse['battalion'],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddHorse(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">إضافة حصان جديد</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="number" value={formData.number} onChange={handleChange} placeholder="الرقم" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="الاسم" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                        <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} placeholder="تاريخ الميلاد" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                        <input name="breed" value={formData.breed} onChange={handleChange} placeholder="النوع / السلالة" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                        <input name="color" value={formData.color} onChange={handleChange} placeholder="اللون" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                        <select name="battalion" value={formData.battalion} onChange={handleChange} className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required>
                            <option>الكتيبة الاولى</option>
                            <option>الكتيبة الثانية</option>
                            <option>الكتيبة الثالثة</option>
                            <option>نادي الفروسية</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">إضافة</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditHorseModal: React.FC<{
  horse: Horse;
  onClose: () => void;
  onEditHorse: (horse: Horse) => void;
}> = ({ horse, onClose, onEditHorse }) => {
    const [formData, setFormData] = useState(horse);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onEditHorse(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">تعديل بيانات الحصان</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="number" value={formData.number} onChange={handleChange} placeholder="الرقم" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="الاسم" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                        <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} placeholder="تاريخ الميلاد" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                        <input name="breed" value={formData.breed} onChange={handleChange} placeholder="النوع / السلالة" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                        <input name="color" value={formData.color} onChange={handleChange} placeholder="اللون" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                        <select name="battalion" value={formData.battalion} onChange={handleChange} className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required>
                            <option>الكتيبة الاولى</option>
                            <option>الكتيبة الثانية</option>
                            <option>الكتيبة الثالثة</option>
                            <option>نادي الفروسية</option>
                        </select>
                         <select name="status" value={formData.status} onChange={handleChange} className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 md:col-span-2 focus:ring-amber-500 focus:border-amber-500" required>
                            <option value="healthy">سليم</option>
                            <option value="monitoring">متابعة</option>
                            <option value="sick">مريض</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">حفظ التعديلات</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const HorseDetailsModal: React.FC<{ horse: Horse; vaccinations: Vaccination[]; onClose: () => void }> = ({ horse, vaccinations, onClose }) => {
    const getRecordStatusBadge = (status: MedicalRecordEntry['status']) => {
        switch (status) {
            case 'healthy':
                return <span className="px-2 py-0.5 text-xs font-medium text-green-300 bg-green-500/20 rounded-full">سليم</span>;
            case 'monitoring':
                return <span className="px-2 py-0.5 text-xs font-medium text-yellow-300 bg-yellow-500/20 rounded-full">متابعة</span>;
            case 'sick':
                return <span className="px-2 py-0.5 text-xs font-medium text-red-300 bg-red-500/20 rounded-full">مريض</span>;
            case 'recovered':
                 return <span className="px-2 py-0.5 text-xs font-medium text-blue-300 bg-blue-500/20 rounded-full">شفاء</span>;
            default:
                return null;
        }
    };
    
    const clinicRecords = useMemo(() => {
        return [...horse.medicalHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [horse.medicalHistory]);

    const horseVaccinations = useMemo(() => {
        return vaccinations
            .filter(v => v.horseId === horse.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [horse.id, vaccinations]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h2 className="text-2xl font-bold text-white">السجل الكامل للحصان: {horse.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 mb-6">
                    <div><dt className="text-sm font-medium text-gray-400">الرقم</dt><dd className="mt-1 text-lg text-gray-100">{horse.number}</dd></div>
                    <div><dt className="text-sm font-medium text-gray-400">الاسم</dt><dd className="mt-1 text-lg text-gray-100">{horse.name}</dd></div>
                    <div><dt className="text-sm font-medium text-gray-400">تاريخ الميلاد</dt><dd className="mt-1 text-lg text-gray-100">{horse.dateOfBirth}</dd></div>
                    <div><dt className="text-sm font-medium text-gray-400">النوع</dt><dd className="mt-1 text-lg text-gray-100">{horse.breed}</dd></div>
                    <div><dt className="text-sm font-medium text-gray-400">اللون</dt><dd className="mt-1 text-lg text-gray-100">{horse.color}</dd></div>
                    <div><dt className="text-sm font-medium text-gray-400">الكتيبة</dt><dd className="mt-1 text-lg text-gray-100">{horse.battalion}</dd></div>
                     <div><dt className="text-sm font-medium text-gray-400">الحالة</dt><dd className="mt-1">{getStatusBadge(horse.status)}</dd></div>
                </div>
                
                {/* Clinic Records Section */}
                <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-xl font-bold text-amber-400 mb-4">دفتر العيادة</h3>
                    {clinicRecords.length > 0 ? (
                        <div className="space-y-4">
                            {clinicRecords.map(record => (
                                <div key={record.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-lg text-gray-100">{record.diagnosis}</h4>
                                            {record.status && getRecordStatusBadge(record.status)}
                                        </div>
                                        <p className="text-sm text-gray-400 font-mono">{record.date}</p>
                                    </div>
                                    
                                    {record.status === 'recovered' && record.recoveryDate && (
                                         <p className="text-sm text-blue-400 font-semibold mb-3">تاريخ الشفاء: {record.recoveryDate}</p>
                                    )}

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-300">العلاج الموصوف:</p>
                                            {record.treatment ? (
                                                 <p className="text-sm text-gray-200 mt-1 bg-gray-800 p-3 rounded border border-gray-600 whitespace-pre-wrap font-mono">{record.treatment}</p>
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-1 pr-4">لم يتم وصف علاج.</p>
                                            )}
                                        </div>
                                        {record.notes && (
                                            <div>
                                                 <p className="text-sm font-semibold text-gray-300">ملاحظات الطبيب:</p>
                                                 <p className="text-sm text-gray-200 mt-1 bg-gray-800 p-3 rounded border border-gray-600 whitespace-pre-wrap">{record.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">لا توجد سجلات في العيادة لهذا الحصان.</p>
                    )}
                </div>

                {/* Vaccinations & Deworming Section */}
                <div className="border-t border-gray-700 pt-4 mt-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">سجل التحصينات والتجريعات</h3>
                    {horseVaccinations.length > 0 ? (
                        <div className="space-y-3">
                            {horseVaccinations.map(vaccination => (
                                <div key={vaccination.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                    <div className="flex justify-between items-baseline">
                                        <div className="flex items-center gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-cyan-400">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            <h4 className="font-bold text-lg text-gray-100">{vaccination.productName}</h4>
                                            <span className="text-xs font-medium text-cyan-200 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                                                {vaccination.type === 'vaccination' ? 'تحصين' : 'تجريع'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 font-mono">{vaccination.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">لا توجد تحصينات أو تجريعات مسجلة لهذا الحصان.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ConfirmDeleteModal: React.FC<{
  horse: Horse;
  onClose: () => void;
  onConfirm: (horseId: string) => void;
}> = ({ horse, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-700">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
                    <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-100 mt-5">
                    تأكيد الحذف
                </h3>
                <p className="text-gray-400 mt-2">
                    هل أنت متأكد من رغبتك في حذف سجل الحصان <span className="font-bold text-gray-200">{horse.name}</span>؟<br/>
                    سيتم حذف السجل بالكامل ولا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                     <button
                        type="button"
                        onClick={() => onConfirm(horse.id)}
                        className="px-8 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        نعم، قم بالحذف
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


const SortableHeader: React.FC<{
    label: string;
    sortKey: keyof Horse;
    sortConfig: { key: keyof Horse; direction: string; } | null;
    requestSort: (key: keyof Horse) => void;
}> = ({ label, sortKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === sortKey;
    const directionIcon = isSorted ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '';

    return (
        <th 
            className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase cursor-pointer hover:bg-gray-800"
            onClick={() => requestSort(sortKey)}
        >
            <div className="flex items-center gap-2">
                <span>{label}</span>
                <span className="text-amber-400">{directionIcon}</span>
            </div>
        </th>
    );
};


const HorsesPage: React.FC<HorsesPageProps> = ({ horses, vaccinations, onAddHorse, onEditHorse, onDeleteHorse, globalBattalionFilter }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [viewingHorse, setViewingHorse] = useState<Horse | null>(null);
  const [deletingHorse, setDeletingHorse] = useState<Horse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Horse, direction: 'ascending' | 'descending' } | null>(null);

  const filteredHorses = useMemo(() => {
    let sortableHorses = globalBattalionFilter === 'الكل'
        ? [...horses]
        : [...horses.filter(h => h.battalion === globalBattalionFilter)];

    if (searchTerm.trim()) {
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        sortableHorses = sortableHorses.filter(horse =>
            horse.name.toLowerCase().includes(lowercasedFilter) ||
            horse.number.includes(lowercasedFilter)
        );
    }
    
    if (sortConfig !== null) {
        sortableHorses.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    return sortableHorses;
  }, [horses, globalBattalionFilter, searchTerm, sortConfig]);

  const requestSort = (key: keyof Horse) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleConfirmDelete = (horseId: string) => {
    onDeleteHorse(horseId);
    setDeletingHorse(null);
  };

  return (
    <div className="space-y-6">
       {isAddModalOpen && <AddHorseModal onClose={() => setIsAddModalOpen(false)} onAddHorse={onAddHorse} />}
       {editingHorse && <EditHorseModal horse={editingHorse} onClose={() => setEditingHorse(null)} onEditHorse={onEditHorse} />}
       {viewingHorse && <HorseDetailsModal horse={viewingHorse} vaccinations={vaccinations} onClose={() => setViewingHorse(null)} />}
       {deletingHorse && <ConfirmDeleteModal horse={deletingHorse} onClose={() => setDeletingHorse(null)} onConfirm={handleConfirmDelete} />}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">سجلات الخيول</h1>
          <p className="text-gray-400 mt-2">عرض وإدارة الملفات الطبية لجميع الخيول.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-md w-full sm:w-auto justify-center">
          <PlusIcon className="w-5 h-5 ml-2" />
          إضافة حصان جديد
        </button>
      </div>
      
      <div className="relative">
          <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500"
              aria-label="Search horses"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
          </div>
      </div>

      <div className="bg-gray-700 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-900/50">
                <tr>
                <SortableHeader label="الرقم" sortKey="number" sortConfig={sortConfig} requestSort={requestSort} />
                <SortableHeader label="الاسم" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                <SortableHeader label="الكتيبة" sortKey="battalion" sortConfig={sortConfig} requestSort={requestSort} />
                <SortableHeader label="الحالة" sortKey="status" sortConfig={sortConfig} requestSort={requestSort} />
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الإجراءات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
                {filteredHorses.map((horse) => (
                <tr key={horse.id} className="hover:bg-gray-600/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{horse.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{horse.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{horse.battalion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(horse.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                    <button onClick={() => setViewingHorse(horse)} className="text-blue-400 hover:text-blue-300 p-2 rounded-md hover:bg-gray-800/50">عرض السجل</button>
                    <button onClick={() => setEditingHorse(horse)} className="text-gray-400 hover:text-gray-200 p-2 rounded-md hover:bg-gray-800/50" aria-label={`تعديل ${horse.name}`}>
                        <PencilIcon className="w-5 h-5 inline-block"/>
                    </button>
                    <button onClick={() => setDeletingHorse(horse)} className="text-red-500 hover:text-red-400 p-2 rounded-md hover:bg-gray-800/50" aria-label={`حذف ${horse.name}`}>
                        <TrashIcon className="w-5 h-5 inline-block"/>
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default HorsesPage;