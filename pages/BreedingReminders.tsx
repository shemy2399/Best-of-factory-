
import React, { useMemo } from 'react';
import { Horse } from '../types';
import { BreedingIcon, HorseIcon } from '../components/icons';

interface BreedingRemindersProps {
  horses: Horse[];
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  onToggleMated: (id: string, isMated: boolean) => Promise<void>;
}

interface HorseCardProps {
  horse: Horse & { ageDetails: { years: number; months: number; days: number } };
  onToggleMated: (id: string, isMated: boolean) => Promise<void>;
  selectedMonth?: number;
  selectedYear?: number;
}

const HorseCard: React.FC<HorseCardProps> = ({ horse, onToggleMated, selectedMonth, selectedYear }) => {
  const birthDate = horse.dateOfBirth ? new Date(horse.dateOfBirth) : null;
  const birthYear = birthDate ? birthDate.getFullYear() : 0;
  const birthMonth = birthDate ? birthDate.getMonth() : 0;
  const reachesThreeYear = birthYear + 3;
  
  const isTurningThreeThisMonth = selectedYear !== undefined && selectedMonth !== undefined && selectedYear === reachesThreeYear && selectedMonth === birthMonth;
  const isOverdue = selectedYear !== undefined && selectedMonth !== undefined && (selectedYear > reachesThreeYear || (selectedYear === reachesThreeYear && selectedMonth > birthMonth));

  return (
    <div className={`group relative bg-gray-800 border ${horse.isMated ? 'border-amber-500/30' : 'border-gray-700'} rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all hover:shadow-2xl hover:shadow-amber-500/10 active:scale-[0.98]`}>
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

        <div className="space-y-3 pt-4 border-t border-gray-700/50 text-right">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">تاريخ الميلاد</span>
            <span className="text-sm font-medium text-gray-350">{birthDate ? birthDate.toLocaleDateString('ar-EG') : '---'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-405">العمر الدقيق</span>
            <span className="text-sm font-medium text-amber-500">
              {horse.ageDetails.years} سنة 
              {horse.ageDetails.months > 0 && ` و ${horse.ageDetails.months} شهر`}
            </span>
          </div>

          {isTurningThreeThisMonth && (
            <div className="mt-2 text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1.5 rounded border border-green-500/20 text-center animate-pulse">
              🎉 يبلغ السن القانوني (3 سنوات) هذا الشهر!
            </div>
          )}
          {isOverdue && (
            <div className={`mt-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1.5 rounded border border-amber-500/20 text-center`}>
              ⚠️ متأخر عن التشبيه (بلغ السن منذ {selectedYear - reachesThreeYear} سنة)
            </div>
          )}
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
  );
};

const BreedingReminders: React.FC<BreedingRemindersProps> = ({ horses, globalBattalionFilter, onToggleMated }) => {
  const [activeTab, setActiveTab ] = React.useState<'notMated' | 'mated' | 'monthly'>('notMated');
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  
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

  const monthlyGroups = useMemo(() => {
    const months: Record<number, typeof allEligible> = {};
    // Initialize all months
    for (let i = 0; i < 12; i++) months[i] = [];

    // ONLY show UNMATED horses in the monthly schedule, as they are the ones "due"
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const candidates = horses
      .filter(h => h.dateOfBirth && !h.isMated && !h.isArchived && (globalBattalionFilter === 'الكل' || h.battalion === globalBattalionFilter))
      .map(h => ({
        ...h,
        ageDetails: calculateAgeDetails(h.dateOfBirth)
      }))
      .filter(h => {
        const birthDate = new Date(h.dateOfBirth);
        const birthYear = birthDate.getFullYear();
        
        // A horse turns 3 or is older in the selectedYear
        const yearsDiff = selectedYear - birthYear;
        return yearsDiff >= 3;
      });

    candidates.forEach(h => {
      const birthMonth = new Date(h.dateOfBirth).getMonth();
      months[birthMonth].push(h);
    });

    const monthsList = [];
    for (let i = 0; i < 12; i++) {
      monthsList.push({
        index: i,
        name: new Intl.DateTimeFormat('ar-EG', { month: 'long' }).format(new Date(2024, i, 1)),
        isCurrentMonth: i === currentMonth && selectedYear === currentYear,
        horses: months[i].sort((a, b) => b.ageDetails.years - a.ageDetails.years)
      });
    }

    return monthsList;
  }, [horses, globalBattalionFilter, selectedYear]);

  const currentList = activeTab === 'monthly' ? [] : (activeTab === 'notMated' ? notMatedHorses : matedHorses);

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
        <div className="flex gap-2 bg-gray-900/50 p-1 rounded-xl border border-gray-700 overflow-x-auto max-w-full">
           <button 
             onClick={() => setActiveTab('notMated')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'notMated' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-gray-200'}`}
           >
             غير مشبهة ({notMatedHorses.length})
           </button>
           <button 
             onClick={() => setActiveTab('mated')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'mated' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-gray-400 hover:text-gray-200'}`}
           >
             مشبهة ({matedHorses.length})
           </button>
           <button 
             onClick={() => setActiveTab('monthly')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'monthly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-gray-200'}`}
           >
             الجدول الشهري
           </button>
        </div>
      </div>

      {activeTab === 'monthly' ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Month & Year Selective Navigation */}
          <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-gray-800 pb-6">
              <div>
                <h3 className="text-xl font-extrabold text-white">جدول التنبؤات والتشبيه السنوي</h3>
                <p className="text-gray-400 text-xs mt-1">اختر الشهر والسنة لاستكشاف الخيول التي تبلغ السن القانوني للتشبيه (3 سنوات) في ذلك الوقت</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Year Navigation */}
                <div className="flex items-center gap-2 bg-gray-950 px-4 py-2.5 rounded-xl border border-gray-800 shrink-0">
                  <span className="text-xs font-bold text-gray-400">السنة المستهدفة:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedYear(prev => prev - 1)}
                      className="p-1 px-2.5 bg-gray-800 border border-gray-700 hover:border-amber-500 rounded-lg text-gray-300 hover:text-white transition-all text-xs font-extrabold"
                      title="السنة السابقة"
                    >
                      -1
                    </button>
                    <span className="text-sm font-black text-amber-500 min-w-12 text-center select-none">
                      {selectedYear}
                    </span>
                    <button
                      onClick={() => setSelectedYear(prev => prev + 1)}
                      className="p-1 px-2.5 bg-gray-800 border border-gray-700 hover:border-amber-500 rounded-lg text-gray-300 hover:text-white transition-all text-xs font-extrabold"
                      title="السنة التالية"
                    >
                      +1
                    </button>
                  </div>
                </div>

                {/* Previous / Next Month buttons */}
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      setSelectedMonth(prev => {
                        if (prev === 0) {
                          setSelectedYear(y => y - 1);
                          return 11;
                        }
                        return prev - 1;
                      });
                    }}
                    className="p-2 bg-gray-800 border border-gray-700 hover:border-amber-500/50 rounded-xl text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1.5 text-xs font-bold px-4"
                    title="الشهر السابق"
                  >
                    <span>الشهر السابق</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-amber-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  
                  <span className="text-sm font-black text-white min-w-28 text-center bg-gray-950 px-4 py-2.5 rounded-xl border border-gray-800">
                    {monthlyGroups[selectedMonth]?.name}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedMonth(prev => {
                        if (prev === 11) {
                          setSelectedYear(y => y + 1);
                          return 0;
                        }
                        return prev + 1;
                      });
                    }}
                    className="p-2 bg-gray-800 border border-gray-700 hover:border-amber-500/50 rounded-xl text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1.5 text-xs font-bold px-4"
                    title="الشهر التالي"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-amber-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    <span>الشهر التالي</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Gorgeous Month Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
              {monthlyGroups.map((group) => {
                const isSelected = selectedMonth === group.index;
                const count = group.horses.length;
                return (
                  <button
                    key={group.index}
                    onClick={() => setSelectedMonth(group.index)}
                    className={`relative p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between items-center group ${
                      isSelected
                        ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20 md:scale-[1.04] z-10'
                        : 'bg-gray-800/30 border-gray-800/80 text-gray-400 hover:border-gray-750 hover:text-gray-200 hover:bg-gray-800/60'
                    }`}
                  >
                    {/* Month index inside year */}
                    <span className={`text-[9px] font-mono mb-1 ${isSelected ? 'text-amber-200' : 'text-gray-500 group-hover:text-gray-400'}`}>
                      {group.index + 1}
                    </span>
                    {/* Month Name */}
                    <span className="text-xs font-black tracking-tight mb-2">
                      {group.name}
                    </span>
                    {/* Badge */}
                    <div className="flex items-center gap-1">
                      {count > 0 ? (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black leading-none ${
                          isSelected 
                            ? 'bg-white text-amber-600 font-extrabold shadow-sm shadow-amber-900/10' 
                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
                        }`}>
                          {count}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-650 font-medium">0</span>
                      )}
                    </div>

                    {/* Today marker */}
                    {group.isCurrentMonth && (
                      <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`} title="الشهر الحالي"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Under selected month section: Active Horse Cards */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="px-5 py-2.5 rounded-xl border border-gray-700 flex items-center gap-3 shadow-md bg-gray-800 text-white font-black text-sm">
                <span>كشف الخيول لشهر: {monthlyGroups[selectedMonth]?.name} ({selectedYear})</span>
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-md text-xs font-bold font-mono">
                  {monthlyGroups[selectedMonth]?.horses.length} خيل جاهز
                </span>
                {selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear() && (
                  <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded animate-pulse">
                     الشهر الحالي
                  </span>
                )}
              </div>
              <div className="h-px flex-1 bg-gray-700/50"></div>
            </div>

            {monthlyGroups[selectedMonth]?.horses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 bg-gray-800/10 rounded-3xl border border-dashed border-gray-700">
                <div className="p-4 bg-gray-800/40 rounded-full border border-gray-700 shadow-sm text-gray-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-amber-500/70">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-gray-300">لا يوجد خيول في ميعاد التشبيه لهذا الشهر</h3>
                <p className="text-gray-500 text-xs mt-2 text-center max-w-md">
                   لا توجد أي فرس مؤهلة (تبلغ 3 سنوات) لم يسبق تشبيهها مسجلة في شهر {monthlyGroups[selectedMonth]?.name} لعام {selectedYear}. يمكنك تصفح بقية شهور السنة والسنوات من خلال الأزرار أعلاه لمتابعة مواقيت بقية خيول القوة البديلة.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {monthlyGroups[selectedMonth]?.horses.map(horse => (
                  <HorseCard 
                    key={horse.id} 
                    horse={horse} 
                    onToggleMated={onToggleMated} 
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
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
            <HorseCard key={horse.id} horse={horse} onToggleMated={onToggleMated} />
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default BreedingReminders;
