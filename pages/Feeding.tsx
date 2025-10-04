import React, { useState, useMemo } from 'react';
import { FeedingScheduleEntry, Horse } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, FeedingIcon } from '../components/icons';

interface FeedingPageProps {
  feedingSchedules: FeedingScheduleEntry[];
  onAddFeedingSchedule: (schedule: Omit<FeedingScheduleEntry, 'id'>) => void;
  onEditFeedingSchedule: (schedule: FeedingScheduleEntry) => void;
  onDeleteFeedingSchedule: (scheduleId: string) => void;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  setGlobalBattalionFilter: (battalion: Horse['battalion'] | 'الكل') => void;
}

const AddFeedingScheduleModal: React.FC<{
  onClose: () => void;
  onAdd: (schedule: Omit<FeedingScheduleEntry, 'id'>) => void;
  battalion: Horse['battalion'];
  existingCategories: string[];
}> = ({ onClose, onAdd, battalion, existingCategories }) => {
  const [formData, setFormData] = useState({ category: '', time: '', feedDetails: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, battalion });
    onClose();
  };

  const datalistId = 'category-list';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">إضافة ميعاد علف جديد</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category" className="block mb-2 font-medium text-gray-300">اسم النظام / الفئة</label>
            <input 
              id="category"
              name="category" 
              list={datalistId}
              value={formData.category} 
              onChange={handleChange} 
              placeholder="مثال: نظام الخيل العامل، نظام الأمهار..." 
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
            <datalist id={datalistId}>
                {existingCategories.map(cat => <option key={cat} value={cat} />)}
            </datalist>
          </div>
          <input name="time" value={formData.time} onChange={handleChange} placeholder="الميعاد (مثال: 06:00 صباحًا)" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
          <textarea name="feedDetails" value={formData.feedDetails} onChange={handleChange} placeholder="تفاصيل العليقة (مثال: 2 كجم علف مركز + 3 كجم دريس)" rows={3} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">إضافة</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditFeedingScheduleModal: React.FC<{
  schedule: FeedingScheduleEntry;
  onClose: () => void;
  onEdit: (schedule: FeedingScheduleEntry) => void;
  existingCategories: string[];
}> = ({ schedule, onClose, onEdit, existingCategories }) => {
  const [formData, setFormData] = useState(schedule);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(formData);
    onClose();
  };
  
  const datalistId = 'edit-category-list';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">تعديل ميعاد علف</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category" className="block mb-2 font-medium text-gray-300">اسم النظام / الفئة</label>
            <input 
              id="category"
              name="category"
              list={datalistId}
              value={formData.category} 
              onChange={handleChange} 
              placeholder="مثال: نظام الخيل العامل، نظام الأمهار..." 
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
             <datalist id={datalistId}>
                {existingCategories.map(cat => <option key={cat} value={cat} />)}
            </datalist>
          </div>
          <input name="time" value={formData.time} onChange={handleChange} placeholder="الميعاد" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
          <textarea name="feedDetails" value={formData.feedDetails} onChange={handleChange} placeholder="تفاصيل العليقة" rows={3} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500" required />
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">حفظ التعديلات</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConfirmDeleteModal: React.FC<{
  item: { id: string; time: string };
  onClose: () => void;
  onConfirm: (itemId: string) => void;
}> = ({ item, onClose, onConfirm }) => {
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
                    هل أنت متأكد من رغبتك في حذف ميعاد العلف <span className="font-bold text-gray-200">{item.time}</span>؟
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

const FeedingPage: React.FC<FeedingPageProps> = ({
  feedingSchedules, onAddFeedingSchedule, onEditFeedingSchedule, onDeleteFeedingSchedule, globalBattalionFilter, setGlobalBattalionFilter
}) => {
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<FeedingScheduleEntry | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<FeedingScheduleEntry | null>(null);

  const BATTALIONS: Exclude<Horse['battalion'], 'الكل'>[] = ['الكتيبة الاولى', 'الكتيبة الثانية', 'الكتيبة الثالثة', 'نادي الفروسية'];

  const schedulesByCategory = useMemo((): Record<string, FeedingScheduleEntry[]> => {
    if (globalBattalionFilter === 'الكل') return {};
    const filtered = feedingSchedules.filter(s => s.battalion === globalBattalionFilter);
    
    // FIX: The initial value for reduce was `{}`, causing TypeScript to infer a narrow type.
    // Typing the accumulator `acc` correctly resolves this, ensuring `grouped` has the correct type
    // for subsequent operations like `.sort()` and `.map()`.
    const grouped = filtered.reduce((acc, schedule) => {
        const category = schedule.category || 'غير مصنف';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(schedule);
        return acc;
    }, {} as Record<string, FeedingScheduleEntry[]>);

    Object.values(grouped).forEach(schedules => {
        schedules.sort((a, b) => a.time.localeCompare(b.time, undefined, { numeric: true }));
    });

    return grouped;
  }, [feedingSchedules, globalBattalionFilter]);

  const existingCategories = useMemo(() => {
    if(globalBattalionFilter === 'الكل') return [];
    const categories = feedingSchedules
        .filter(s => s.battalion === globalBattalionFilter)
        .map(s => s.category);
    return [...new Set(categories)];
  }, [feedingSchedules, globalBattalionFilter]);

  if (globalBattalionFilter === 'الكل') {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">نظام العلائق والتغذية</h1>
        <p className="text-gray-400 mb-10 text-lg">يرجى تحديد كتيبة من الشريط العلوي لعرض جدول التغذية الخاص بها.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BATTALIONS.map(battalion => (
            <button 
              key={battalion} 
              onClick={() => setGlobalBattalionFilter(battalion)} 
              className="p-8 bg-gray-700 rounded-xl shadow-lg hover:shadow-amber-500/10 hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
              aria-label={`افتح نظام العلائق لـ ${battalion}`}
            >
              <FeedingIcon className="w-16 h-16 mx-auto text-amber-400 mb-4"/>
              <h2 className="text-xl font-bold text-white">{battalion}</h2>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAddScheduleModalOpen && <AddFeedingScheduleModal onClose={() => setIsAddScheduleModalOpen(false)} onAdd={onAddFeedingSchedule} battalion={globalBattalionFilter} existingCategories={existingCategories} />}
      {editingSchedule && <EditFeedingScheduleModal schedule={editingSchedule} onClose={() => setEditingSchedule(null)} onEdit={onEditFeedingSchedule} existingCategories={existingCategories} />}
      {deletingSchedule && <ConfirmDeleteModal item={deletingSchedule} onClose={() => setDeletingSchedule(null)} onConfirm={onDeleteFeedingSchedule} />}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">نظام العلائق</h1>
          <p className="text-gray-400 mt-2">إدارة مواعيد وتفاصيل العلف اليومي للكتيبة.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button onClick={() => setIsAddScheduleModalOpen(true)} className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-md">
            <PlusIcon className="w-5 h-5 ml-2" />
            إضافة ميعاد علف
          </button>
        </div>
      </div>
      
      {Object.keys(schedulesByCategory).length > 0 ? (
        (Object.entries(schedulesByCategory)).sort((a,b) => a[0].localeCompare(b[0])).map(([category, schedules]) => (
          <div key={category} className="bg-gray-700 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-900/50 p-4 border-b border-gray-600">
                <h2 className="text-xl font-bold text-amber-400">{category}</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-800/60">
                    <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase w-1/4">الميعاد</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase w-1/2">تفاصيل العليقة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase w-1/4">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                    {schedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-600/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{schedule.time}</td>
                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-300">{schedule.feedDetails}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                        <button onClick={() => setEditingSchedule(schedule)} className="text-gray-400 hover:text-gray-200 p-2 rounded-md hover:bg-gray-800/50" aria-label={`تعديل ميعاد ${schedule.time}`}>
                            <PencilIcon className="w-5 h-5 inline-block" />
                        </button>
                        <button onClick={() => setDeletingSchedule(schedule)} className="text-red-500 hover:text-red-400 p-2 rounded-md hover:bg-gray-800/50" aria-label={`حذف ميعاد ${schedule.time}`}>
                            <TrashIcon className="w-5 h-5 inline-block" />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16 bg-gray-700 rounded-xl shadow-lg">
            <h3 className="text-xl text-gray-300 font-semibold">لم يتم تسجيل أي أنظمة علائق</h3>
            <p className="text-gray-400 mt-2">انقر على "إضافة ميعاد علف" للبدء.</p>
        </div>
      )}
    </div>
  );
};

export default FeedingPage;