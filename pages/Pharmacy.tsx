
import React, { useState, useMemo, useEffect } from 'react';
import { Medication, Horse } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, PharmacyIcon } from '../components/icons';
import DateInput from '../components/DateInput';


interface PharmacyPageProps {
  medications: Medication[];
  onAddMedication: (medication: Omit<Medication, 'id' | 'createdAt'>) => void;
  onEditMedication: (medication: Medication) => void;
  onDeleteMedication: (medicationId: string) => void;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  setGlobalBattalionFilter: (battalion: Horse['battalion'] | 'الكل') => void;
}

// Medication Modals
const AddMedicationModal: React.FC<{
  onClose: () => void;
  onAddMedication: (medication: Omit<Medication, 'id' | 'createdAt'>) => void;
  battalion: Horse['battalion'];
}> = ({ onClose, onAddMedication, battalion }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: '',
    expiryDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity < 0) {
        alert("الكمية لا يمكن أن تكون سالبة.");
        return;
    }
    onAddMedication({ ...formData, battalion });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">إضافة دواء جديد لـ {battalion}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="اسم الدواء" className="p-3 w-full bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
          <input name="quantity" type="number" min="0" value={formData.quantity} onChange={handleChange} placeholder="الكمية" className="p-3 w-full bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
          <input name="unit" value={formData.unit} onChange={handleChange} placeholder="وحدة القياس (مثال: زجاجة، شريط)" className="p-3 w-full bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">تاريخ الصلاحية</label>
            <DateInput value={formData.expiryDate} onChange={value => setFormData({...formData, expiryDate: value})} required />
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2 bg-amber-500 font-semibold text-white rounded-lg hover:bg-amber-600 transition-colors">إضافة الدواء</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditMedicationModal: React.FC<{
  medication: Medication;
  onClose: () => void;
  onEditMedication: (medication: Medication) => void;
}> = ({ medication, onClose, onEditMedication }) => {
    const [formData, setFormData] = useState(medication);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.quantity < 0) {
            alert("الكمية لا يمكن أن تكون سالبة.");
            return;
        }
        onEditMedication(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">تعديل بيانات الدواء</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="اسم الدواء" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                    <input name="quantity" type="number" min="0" value={formData.quantity} onChange={handleChange} placeholder="الكمية" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                    <input name="unit" value={formData.unit} onChange={handleChange} placeholder="وحدة القياس" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
                     <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">تاريخ الصلاحية</label>
                        <DateInput value={formData.expiryDate} onChange={value => setFormData({...formData, expiryDate: value})} required />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">حفظ التعديلات</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmDeleteModal: React.FC<{
  item: { id: string; name: string };
  onClose: () => void;
  onConfirm: (itemId: string) => void;
  itemName: string;
  message: string;
}> = ({ item, onClose, onConfirm, itemName, message }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-700">
                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
                    <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-100 mt-5">تأكيد الحذف</h3>
                <p className="text-gray-400 mt-2">
                    {message} <span className="font-bold text-gray-200">{itemName}</span>؟
                </p>
                <div className="mt-8 flex justify-center gap-4">
                     <button
                        type="button"
                        onClick={() => onConfirm(item.id)}
                        className="px-8 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        نعم، قم بالحذف
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-2 bg-gray-600 text-gray-100 font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

const PharmacyPage: React.FC<PharmacyPageProps> = ({ 
  medications, onAddMedication, onEditMedication, onDeleteMedication, globalBattalionFilter, setGlobalBattalionFilter
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [deletingMedication, setDeletingMedication] = useState<Medication | null>(null);
  const [displaySearch, setDisplaySearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedSearch(displaySearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [displaySearch]);

  const BATTALIONS: Exclude<Horse['battalion'], 'الكل'>[] = ['الكتيبة الاولى', 'الكتيبة الثانية', 'الكتيبة الثالثة', 'نادي الفروسية'];

  const medicationsForSelectedBattalion = useMemo(() => {
    if (globalBattalionFilter === 'الكل') return [];
    return medications.filter(m => m.battalion === globalBattalionFilter);
  }, [medications, globalBattalionFilter]);

  const filteredMedications = useMemo(() => {
    if (!debouncedSearch.trim()) {
        return medicationsForSelectedBattalion;
    }
    const lowercasedFilter = debouncedSearch.toLowerCase().trim();
    return medicationsForSelectedBattalion.filter(med =>
        med.name.toLowerCase().includes(lowercasedFilter)
    );
  }, [medicationsForSelectedBattalion, debouncedSearch]);

  const handleQuantityChange = (medication: Medication, amount: number) => {
    const newQuantity = medication.quantity + amount;
    if (newQuantity < 0) return;
    onEditMedication({ ...medication, quantity: newQuantity });
  };

  const getStockBadge = (quantity: number) => {
    if (quantity < 10) {
        return <span className="px-3 py-1 text-xs font-medium text-red-300 bg-red-500/20 rounded-full">{quantity}</span>;
    }
    if (quantity < 25) {
        return <span className="px-3 py-1 text-xs font-medium text-yellow-300 bg-yellow-500/20 rounded-full">{quantity}</span>;
    }
    return <span className="px-3 py-1 text-xs font-medium text-green-300 bg-green-500/20 rounded-full">{quantity}</span>;
  };

  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const expiringSoonMedications = useMemo(() => {
    return medicationsForSelectedBattalion.filter(med => {
      const expiryDate = new Date(med.expiryDate);
      return expiryDate > today && expiryDate <= thirtyDaysFromNow;
    });
  }, [medicationsForSelectedBattalion, today, thirtyDaysFromNow]);


  if (globalBattalionFilter === 'الكل') {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">صيدلية الخيالة</h1>
        <p className="text-gray-400 mb-10 text-lg">يرجى تحديد كتيبة من الشريط العلوي لعرض صيدليتها.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BATTALIONS.map(battalion => (
            <button 
              key={battalion} 
              onClick={() => setGlobalBattalionFilter(battalion)} 
              className="p-8 bg-gray-700 rounded-xl shadow-lg hover:shadow-amber-500/10 hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
              aria-label={`افتح صيدلية ${battalion}`}
            >
              <PharmacyIcon className="w-16 h-16 mx-auto text-amber-400 mb-4"/>
              <h2 className="text-xl font-bold text-white">{battalion}</h2>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAddModalOpen && <AddMedicationModal onClose={() => setIsAddModalOpen(false)} onAddMedication={onAddMedication} battalion={globalBattalionFilter} />}
      {editingMedication && <EditMedicationModal medication={editingMedication} onClose={() => setEditingMedication(null)} onEditMedication={onEditMedication} />}
      {deletingMedication && (
        <ConfirmDeleteModal 
            item={deletingMedication}
            onClose={() => setDeletingMedication(null)} 
            onConfirm={onDeleteMedication}
            itemName={deletingMedication.name}
            message="هل أنت متأكد من رغبتك في حذف الدواء"
        />
      )}

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white">صيدلية</h1>
                <p className="text-gray-400 mt-2">إدارة مخزون الأدوية والكميات المتاحة.</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-md">
                <PlusIcon className="w-5 h-5 ml-2" />
                إضافة دواء جديد
            </button>
            </div>
        </div>

        {expiringSoonMedications.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-300 rounded-r-lg">
            <h3 className="font-bold">تنبيه انتهاء الصلاحية</h3>
            <p>الأدوية التالية ستنتهي صلاحيتها خلال 30 يومًا: {expiringSoonMedications.map(m => m.name).join('، ')}</p>
          </div>
        )}

      </div>
      
      <div className="relative">
          <input
              type="text"
              placeholder="ابحث عن دواء..."
              value={displaySearch}
              onChange={(e) => setDisplaySearch(e.target.value)}
              className="w-full p-3 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500"
              aria-label="Search medications"
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">اسم الدواء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الكمية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الوحدة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">تاريخ الصلاحية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الإجراءات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
                {filteredMedications.map((med) => {
                const expiryDate = new Date(med.expiryDate);
                const isExpired = expiryDate < today;
                const isExpiringSoon = expiryDate >= today && expiryDate <= thirtyDaysFromNow;
                let rowClass = 'hover:bg-gray-600/50';
                if (isExpired) rowClass = 'bg-red-500/10 hover:bg-red-500/20';
                if (isExpiringSoon) rowClass = 'bg-yellow-500/10 hover:bg-yellow-500/20';

                return (
                <tr key={med.id} className={`${rowClass} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{med.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleQuantityChange(med, -1)} disabled={med.quantity === 0} className="px-2 py-0.5 bg-gray-600 text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500">-</button>
                        {getStockBadge(med.quantity)}
                        <button onClick={() => handleQuantityChange(med, 1)} className="px-2 py-0.5 bg-gray-600 text-gray-200 rounded hover:bg-gray-500">+</button>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{med.unit}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isExpired ? 'text-red-400 font-bold' : 'text-gray-400'}`}>{med.expiryDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                    <button onClick={() => setEditingMedication(med)} className="text-gray-400 hover:text-gray-200 p-2 rounded-md hover:bg-gray-800/50" aria-label={`تعديل ${med.name}`}>
                        <PencilIcon className="w-5 h-5 inline-block"/>
                    </button>
                    <button onClick={() => setDeletingMedication(med)} className="text-red-500 hover:text-red-400 p-2 rounded-md hover:bg-gray-800/50" aria-label={`حذف ${med.name}`}>
                        <TrashIcon className="w-5 h-5 inline-block"/>
                    </button>
                    </td>
                </tr>
                )})}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default PharmacyPage;
