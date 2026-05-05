
import React, { useMemo } from 'react';
import { Horse } from '../types';
import { BreedingIcon, HorseIcon } from '../components/icons';

interface BreedingRemindersProps {
  horses: Horse[];
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  onToggleMated: (id: string, isMated: boolean) => Promise<void>;
}

const BreedingReminders: React.FC<BreedingRemindersProps> = ({ horses, globalBattalionFilter, onToggleMated }) => {
  const [activeTab, setActiveTab] = React.useState<'notMated' | 'mated'>('notMated');
  
  const calculateAgeDetails = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  const allEligible = useMemo(() => {
    return horses
      .filter(h => h.dateOfBirth && (globalBattalionFilter === 'الكل' || h.battalion === globalBattalionFilter))
      .map(h => ({
        ...h,
        ageDetails: calculateAgeDetails(h.dateOfBirth)
      }))
      .filter(h => h.ageDetails.years >= 3)
      .sort((a, b) => {
        if (a.ageDetails.years !== b.ageDetails.years) return b.ageDetails.years - a.ageDetails.years;
        if (a.ageDetails.months !== b.ageDetails.months) return b.ageDetails.months - a.ageDetails.months;
        return b.ageDetails.days - a.ageDetails.days;
      });
  }, [horses, globalBattalionFilter]);

  const matedHorses = useMemo(() => allEligible.filter(h => h.isMated), [allEligible]);
  const notMatedHorses = useMemo(() => allEligible.filter(h => !h.isMated), [allEligible]);

  const currentList = activeTab === 'notMated' ? notMatedHorses : matedHorses;

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
            <BreedingIcon className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">التشبيه</h1>
            <p className="text-gray-400 mt-1">الخيول التي أتمت 3 سنوات فأكثر ومؤهلة للتشبيه</p>
          </div>
        </div>
        <div className="flex gap-2 bg-gray-900/50 p-1 rounded-xl border border-gray-700">
           <button 
             onClick={() => setActiveTab('notMated')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'notMated' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-gray-200'}`}
           >
             غير مشبهة ({notMatedHorses.length})
           </button>
           <button 
             onClick={() => setActiveTab('mated')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'mated' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-gray-400 hover:text-gray-200'}`}
           >
             مشبهة ({matedHorses.length})
           </button>
        </div>
      </div>

      {currentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-700">
          <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mb-4 text-gray-500">
             <HorseIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-300">لا يوجد خيول في هذا القسم</h3>
          <p className="text-gray-500 mt-2">
            {activeTab === 'notMated' ? 'لا توجد خيول غير مشبهة حالياً' : 'لم يتم إضافة أي خيول مشبهة بعد'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map(horse => (
            <div key={horse.id} className={`group relative bg-gray-800 border ${horse.isMated ? 'border-amber-500/30' : 'border-gray-700'} rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all hover:shadow-2xl hover:shadow-amber-500/10 active:scale-[0.98]`}>
               {/* Age Badge */}
               <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                  {horse.ageDetails.years} سنة
               </div>

               <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gray-700 rounded-2xl flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                       <HorseIcon className="w-8 h-8 text-gray-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div className="text-left">
                       <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">الرقم</span>
                       <span className="text-xl font-mono font-black text-gray-300">#{horse.number}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-1 group-hover:text-amber-400 transition-colors">{horse.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                     <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded border border-gray-600">{horse.rasan}</span>
                     <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded border border-gray-600">{horse.battalion}</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-700/50">
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-500">تاريخ الميلاد</span>
                       <span className="text-sm font-medium text-gray-300">{new Date(horse.dateOfBirth).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-500">العمر الدقيق</span>
                       <span className="text-sm font-medium text-amber-500">
                          {horse.ageDetails.years} سنة 
                          {horse.ageDetails.months > 0 && ` و ${horse.ageDetails.months} شهر`}
                       </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                     <button 
                       onClick={() => onToggleMated(horse.id, !horse.isMated)}
                       className={`flex-1 py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                         horse.isMated 
                           ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                           : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-amber-500/50 hover:text-amber-400'
                       }`}
                     >
                        <span className={`w-2 h-2 rounded-full ${horse.isMated ? 'bg-amber-500 animate-pulse' : 'bg-gray-600'}`}></span>
                        {horse.isMated ? 'إلغاء التشبيه' : 'تفعيل كـ مشبه'}
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BreedingReminders;
