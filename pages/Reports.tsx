
import React, { useMemo, useState } from 'react';
import { Horse, Medication, MedicalRecordEntry, MonthlyArchive } from '../types';
import { PrintIcon, TrashIcon, ReportsIcon } from '../components/icons';

interface ReportsPageProps {
  clinicLog: ({ horseName: string; horseId: string } & MedicalRecordEntry)[];
  horses: Horse[];
  medications: Medication[];
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  monthlyArchives: MonthlyArchive[];
  onAddArchive: (archive: Omit<MonthlyArchive, 'id'>) => Promise<void>;
  onDeleteArchive: (id: string) => Promise<void>;
  onUpdateArchive: (id: string, updatedData: Partial<MonthlyArchive>) => Promise<void>;
  onNavigateWithFilter: (filter: string) => void;
}

const BATTALIONS: string[] = ['الكتيبة الاولى', 'الكتيبة الثانية', 'الكتيبة الثالثة', 'نادي الفروسية'];

const ProgressBar: React.FC<{ label: string, value: number, max: number, color: string }> = ({ label, value, max, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-xs font-black uppercase tracking-wider">
            <span className="text-gray-200 print:text-black truncate max-w-[70%]">{label}</span>
            <span style={{color}} className="print:text-black font-mono text-sm">{value} حالة</span>
        </div>
        <div className="w-full bg-gray-900 print:bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner border border-gray-700/50 print:border-gray-300">
            <div className="h-full rounded-full transition-all duration-[1200ms] ease-out shadow-lg" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, backgroundColor: color }}></div>
        </div>
    </div>
);

const DonutChart: React.FC<{ data: { label: string, value: number, color: string }[] }> = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulativePercent = 0;
  if (total === 0) return (<div className="flex items-center justify-center h-64 w-64 rounded-full border-4 border-gray-800 border-dashed text-gray-600 font-bold">لا توجد بيانات</div>);
  return (
    <div className="relative w-64 h-64 mx-auto print:w-48 print:h-48">
      <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90 drop-shadow-2xl">
        {data.map((item, index) => {
          const percent = (item.value / total) * 100;
          const dashArray = `${percent} ${100 - percent}`;
          const dashOffset = -cumulativePercent;
          cumulativePercent += percent;
          return (<circle key={index} r="16" cx="16" cy="16" fill="transparent" stroke={item.color} strokeWidth="6" strokeDasharray={dashArray} strokeDashoffset={dashOffset} className="transition-all duration-[1500ms] ease-in-out hover:opacity-90" />);
        })}
        <circle r="11" cx="16" cy="16" fill="#1f2937" className="print:fill-white" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-4xl font-black text-white print:text-black tracking-tighter">{total}</span>
        <span className="text-[9px] font-black text-gray-500 print:text-gray-600 uppercase tracking-widest mt-1">إجمالي القوة</span>
      </div>
    </div>
  );
};

const ReportsPage: React.FC<ReportsPageProps> = ({ clinicLog = [], horses = [], globalBattalionFilter, monthlyArchives = [], onAddArchive, onDeleteArchive, onNavigateWithFilter }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthYear = useMemo(() => new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }), []);
  
  const filteredHorses = useMemo(() => 
    globalBattalionFilter === 'الكل' ? horses : horses.filter(h => h.battalion === globalBattalionFilter)
  , [horses, globalBattalionFilter]);

  // حساب الموقف الصحي العام: المزامنة الدقيقة مع دفتر العيادة
  const stats = useMemo(() => {
    let monitoringCount = 0;
    let healthyCount = 0;

    filteredHorses.forEach(horse => {
        const horseEntries = clinicLog.filter(e => e.horseId === horse.id).sort((a, b) => {
            const dateComp = b.date.localeCompare(a.date);
            if (dateComp !== 0) return dateComp;
            return (b as any).createdAt?.seconds - (a as any).createdAt?.seconds;
        });

        if (horseEntries.length > 0) {
            const latest = horseEntries[0];
            const rDate = latest.recoveryDate || latest.date;
            // الحصان مريض إذا كانت الحالة "متابعة" أو "شفاء" وتاريخ الشفاء لم يأتِ بعد
            if (latest.status === 'monitoring' || !(todayStr > rDate)) {
                monitoringCount++;
            } else {
                healthyCount++;
            }
        } else {
            healthyCount++;
        }
    });

    return [
      { label: 'سليم فعلياً', value: healthyCount, color: '#10b981' }, 
      { label: 'تحت العلاج والمتابعة', value: monitoringCount, color: '#f59e0b' }, 
    ];
  }, [filteredHorses, clinicLog, todayStr]);

  // تحليل التشخيصات الفعلية (ديناميكي)
  const actualDiagnosisStats = useMemo(() => {
    const now = new Date();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = now.getFullYear().toString();
    const monthPrefix = `${currentYear}-${currentMonth}`;

    const horseIdsInScope = new Set(filteredHorses.map(h => h.id));
    const thisMonthLogs = clinicLog.filter(log => log.date && log.date.startsWith(monthPrefix) && horseIdsInScope.has(log.horseId));

    const counts: Record<string, number> = {};
    thisMonthLogs.forEach(log => {
      const diag = (log.diagnosis || 'تشخيص غير محدد').trim();
      counts[diag] = (counts[diag] || 0) + 1;
    });

    // تحويلها لمصفوفة مرتبة حسب الأكثر تكراراً
    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // عرض أفضل 6 تشخيصات

    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
    
    return {
        items: sorted.map((item, idx) => ({ ...item, color: colors[idx % colors.length] })),
        total: thisMonthLogs.length
    };
  }, [clinicLog, filteredHorses]);

  const handleArchiveMonth = async () => {
    if (globalBattalionFilter === 'الكل') { alert('يرجى اختيار كتيبة محددة للأرشفة'); return; }
    const archiveData: Omit<MonthlyArchive, 'id'> = { 
        monthLabel: currentMonthYear, 
        battalion: globalBattalionFilter, 
        totalCases: filteredHorses.length, 
        diagnoses: stats.map(s => ({ name: s.label, count: s.value })), 
        createdAt: new Date().toISOString() 
    };
    await onAddArchive(archiveData);
    alert('تمت أرشفة بيانات الشهر الحالي بنجاح');
  };

  const rasanDistribution = useMemo(() => { 
    const s: Record<string, number> = {}; 
    filteredHorses.forEach(h => { 
        let r = h.rasan?.trim() || '(غير محدد)'; 
        s[r] = (s[r] || 0) + 1; 
    }); 
    return Object.entries(s).sort((a, b) => b[1] - a[1]); 
  }, [filteredHorses]);

  return (
    <div className="space-y-10 text-white pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3"><ReportsIcon className="w-10 h-10 text-amber-500" />التقارير والإحصائيات</h1>
          <p className="text-gray-400 mt-2 font-medium">تحليل ذكي يعتمد على التشخيصات الفعلية في دفتر العيادة.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleArchiveMonth} className="px-6 py-3 bg-gray-800 text-amber-500 font-bold rounded-xl hover:bg-gray-700 border border-gray-700 shadow-lg transition-all">أرشفة بيانات الشهر</button>
          <button onClick={() => window.print()} className="flex items-center px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"><PrintIcon className="w-5 h-5 ml-2" />طباعة التقرير</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
          <div className="bg-gray-800 print:bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-700 print:border-black flex flex-col items-center relative overflow-hidden">
              <h2 className="text-xl font-black mb-8 self-start flex items-center gap-3 print:text-black uppercase tracking-tighter w-full border-b border-gray-700 pb-4"><span className="w-2 h-8 bg-amber-500 rounded-full"></span>الموقف الطبي العام</h2>
              <DonutChart data={stats} />
              <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                  {stats.map(s => (<div key={s.label} className="text-center p-3 bg-gray-900/50 print:bg-gray-50 rounded-xl border border-gray-700/50"><p className="text-[10px] text-gray-500 print:text-black font-black mb-1 uppercase tracking-wider">{s.label}</p><p className="text-2xl font-black print:text-black" style={{ color: s.color }}>{s.value}</p></div>))}
              </div>
          </div>
          <div className="bg-gray-800 print:bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-700 print:border-black relative overflow-hidden">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 print:text-black uppercase tracking-tighter w-full border-b border-gray-700 pb-4"><span className="w-2 h-8 bg-blue-500 rounded-full"></span>التشخيصات الفعلية (هذا الشهر)</h2>
              <div className="space-y-6">
                  {actualDiagnosisStats.items.length > 0 ? (
                      actualDiagnosisStats.items.map((diag, idx) => (
                          <ProgressBar 
                            key={idx} 
                            label={diag.name} 
                            value={diag.count} 
                            max={actualDiagnosisStats.total} 
                            color={diag.color} 
                          />
                      ))
                  ) : (
                      <div className="text-center py-10 text-gray-500 font-bold italic">لا توجد حالات مسجلة في هذا الشهر حتى الآن.</div>
                  )}
              </div>
              <div className="mt-8 pt-4 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500 text-center font-bold">إجمالي الحالات المسجلة (منذ بداية الشهر): {actualDiagnosisStats.total}</p>
              </div>
          </div>
      </div>

      <div className="bg-gray-800 print:bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-700 print:border-black">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 print:text-black uppercase tracking-tighter border-b border-gray-700 pb-4"><span className="w-2 h-8 bg-cyan-500 rounded-full"></span>توزيع القوة حسب الأرسان</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {rasanDistribution.map(([name, count]) => (<button key={name} onClick={() => onNavigateWithFilter(name)} className="bg-gray-900/50 print:bg-gray-50 p-5 rounded-2xl text-center border border-gray-700 hover:border-cyan-500 hover:bg-gray-700 transition-all group"><p className="text-[10px] text-gray-500 print:text-black font-black mb-2 group-hover:text-cyan-400 uppercase tracking-tighter truncate">{name}</p><p className="text-3xl font-black text-white print:text-black group-hover:text-white transition-colors">{count}</p></button>))}
          </div>
      </div>

      <div className="bg-gray-800 print:bg-white rounded-[2rem] shadow-2xl border border-gray-700 print:border-black overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-700 print:border-black bg-gray-900/30 print:bg-gray-100"><h2 className="text-lg font-black print:text-black flex items-center gap-3 uppercase tracking-tighter"><span className="w-2 h-6 bg-indigo-500 rounded-full"></span>تدقيق الموقف الطبي لكل كتيبة</h2></div>
          <div className="overflow-x-auto">
              <table className="min-w-full text-right">
                  <thead className="bg-gray-900/80 print:bg-gray-200 text-gray-400 print:text-black font-black uppercase tracking-widest text-[10px]">
                      <tr>
                          <th className="px-8 py-4">الوحدة</th>
                          <th className="px-8 py-4 text-center text-green-500">سليم فعلياً</th>
                          <th className="px-8 py-4 text-center text-amber-500">تحت المتابعة</th>
                          <th className="px-8 py-4 text-center bg-gray-800 print:bg-gray-300 text-white print:text-black">إجمالي القوة</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700 print:divide-black text-sm font-bold">
                      {BATTALIONS.map(bat => {
                          const bh = horses.filter(h => h.battalion === bat);
                          const activeInClinic = clinicLog.filter(e => {
                              const isHorseInBat = bh.some(h => h.id === e.horseId);
                              if (!isHorseInBat) return false;
                              const rDate = e.recoveryDate || e.date;
                              return e.status === 'monitoring' || !(todayStr > rDate);
                          });
                          
                          const uniqueActiveIds = new Set(activeInClinic.map(e => e.horseId));
                          const monitoringCount = uniqueActiveIds.size;
                          const healthyCount = bh.length - monitoringCount;

                          return (
                            <tr key={bat} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-8 py-4 text-white print:text-black">{bat}</td>
                                <td className="px-8 py-4 text-center text-green-400 print:text-black">{healthyCount}</td>
                                <td className="px-8 py-4 text-center text-amber-400 print:text-black">{monitoringCount}</td>
                                <td className="px-8 py-4 text-center bg-gray-900/20 print:bg-gray-100 text-white print:text-black">{bh.length}</td>
                            </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default ReportsPage;
