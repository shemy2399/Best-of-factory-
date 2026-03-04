
import React, { useMemo } from 'react';
import { Horse, Medication, MedicalRecordEntry, Page } from '../types';
import { ReportsIcon, HorseIcon, PharmacyIcon, ClinicIcon } from '../components/icons';

interface DashboardProps {
  horses: Horse[];
  medications: Medication[];
  clinicLog: ({ horseName: string; horseId: string } & MedicalRecordEntry)[];
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  setActivePage: (page: Page) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; description: string; colorClass?: string; }> = ({ title, value, icon, description, colorClass = "text-white" }) => (
  <div className="bg-gray-700 p-6 rounded-xl shadow-lg flex items-center space-x-4 space-x-reverse h-full hover:bg-gray-600/50 transition-colors border border-gray-600/50">
    <div className="bg-gray-800 p-4 rounded-full shadow-inner">
      {icon}
    </div>
    <div>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className={`text-3xl font-black mt-1 ${colorClass}`}>{value}</p>
      <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-wider font-bold">{description}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ horses, medications, clinicLog, globalBattalionFilter, setActivePage }) => {

  const filteredData = useMemo<{
    filteredHorses: Horse[];
    filteredMedications: Medication[];
    filteredClinicLog: ({ horseName: string; horseId: string } & MedicalRecordEntry)[];
  }>(() => {
    if (globalBattalionFilter === 'الكل') {
        return { filteredHorses: horses, filteredMedications: medications, filteredClinicLog: clinicLog };
    }
    const filteredHorses = horses.filter(h => h.battalion === globalBattalionFilter);
    const filteredMedications = medications.filter(m => m.battalion === globalBattalionFilter);
    // Add explicit type to Set to prevent inference issues
    const horseIdsInBattalion = new Set<string>(filteredHorses.map(h => h.id));
    const filteredClinicLog = clinicLog.filter(entry => horseIdsInBattalion.has(entry.horseId));
    return { filteredHorses, filteredMedications, filteredClinicLog };
  }, [horses, medications, clinicLog, globalBattalionFilter]);

  const { filteredHorses, filteredMedications, filteredClinicLog } = filteredData;

  const healthStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    // Explicitly type the Set as Set<string> to avoid "unknown" type errors
    const horseIds = new Set<string>(filteredHorses.map(h => h.id));
    const activeMonitoringHorses = new Set<string>();

    // Explicitly type id as string to avoid parameter of type 'unknown' errors
    horseIds.forEach((id: string) => {
        const horseEntries = clinicLog.filter(e => e.horseId === id).sort((a, b) => {
            const dateComp = b.date.localeCompare(a.date);
            if (dateComp !== 0) return dateComp;
            const aTime = (a as any).createdAt?.seconds || (typeof (a as any).createdAt?.toMillis === 'function' ? (a as any).createdAt.toMillis() / 1000 : 0);
            const bTime = (b as any).createdAt?.seconds || (typeof (b as any).createdAt?.toMillis === 'function' ? (b as any).createdAt.toMillis() / 1000 : 0);
            return bTime - aTime;
        });

        if (horseEntries.length > 0) {
            const latest = horseEntries[0];
            if (latest.status === 'monitoring') {
                activeMonitoringHorses.add(id);
            } else if (latest.status === 'recovered') {
                const rDate = latest.recoveryDate || latest.date;
                // لا يزال تحت المتابعة إذا كان اليوم ليس بعد تاريخ الشفاء
                if (!(today > rDate)) {
                    activeMonitoringHorses.add(id);
                }
            }
        }
    });

    return { monitoring: activeMonitoringHorses.size };
  }, [filteredHorses, clinicLog]);

  const totalHorses = filteredHorses.length;
  const monitoringCases = healthStats.monitoring;
  const lowStockMeds = filteredMedications.filter(m => m.quantity < 10).length;

  const expiryAlerts = useMemo((): Record<string, { name: string; expiryDate: string; status: 'expired' | 'expiring_soon' }[]> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(today.getDate() + 60);
    const alerts: Record<string, { name: string; expiryDate: string; status: 'expired' | 'expiring_soon' }[]> = {};
    filteredMedications.forEach(med => {
      const expiryDate = new Date(med.expiryDate);
      let status: 'expired' | 'expiring_soon' | null = null;
      if (expiryDate < today) status = 'expired';
      else if (expiryDate <= sixtyDaysFromNow) status = 'expiring_soon';
      if (status) {
        if (!alerts[med.battalion]) alerts[med.battalion] = [];
        alerts[med.battalion].push({ name: med.name, expiryDate: med.expiryDate, status });
      }
    });
    return alerts;
  }, [filteredMedications]);
  
  const pageTitle = globalBattalionFilter === 'الكل' ? 'لوحة التحكم الشاملة' : `لوحة تحكم: ${globalBattalionFilter}`;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end border-b border-gray-700 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">{pageTitle}</h1>
          <p className="text-gray-400 mt-2 font-medium">مزامنة حية ومباشرة مع دفتر العيادة.</p>
        </div>
        <div className="text-left">
           <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-xs font-black uppercase tracking-widest">Clinic Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button onClick={() => setActivePage('horses')} className="text-right w-full transition-transform active:scale-95">
          <StatCard title="أصل القوة" value={totalHorses} icon={<HorseIcon className="w-8 h-8 text-amber-400"/>} description="إجمالي الخيول" />
        </button>
        <button onClick={() => setActivePage('clinic')} className="text-right w-full transition-transform active:scale-95">
          <StatCard title="تحت المتابعة" value={monitoringCases} icon={<ClinicIcon className="w-8 h-8 text-amber-500"/>} description="في عنبر العيادة" colorClass="text-amber-500" />
        </button>
        <button onClick={() => setActivePage('pharmacy')} className="text-right w-full transition-transform active:scale-95">
          <StatCard title="نواقص المخزون" value={lowStockMeds} icon={<PharmacyIcon className="w-8 h-8 text-cyan-400"/>} description="أدوية أوشكت على النفاد" colorClass="text-cyan-400" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-[2rem] shadow-xl border border-gray-700/50">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <ClinicIcon className="w-6 h-6 text-amber-500" />
                أحدث تقارير العيادة
            </h2>
            {filteredClinicLog.length > 0 ? (
                <div className="space-y-4">
                    {filteredClinicLog.slice(0, 4).map((entry) => (
                    <div key={entry.id} className="p-4 bg-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-amber-500/30 transition-all group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-black text-gray-100 group-hover:text-amber-400 transition-colors">{entry.horseName}</p>
                                <p className="text-sm text-gray-400 mt-1 font-bold">{entry.diagnosis}</p>
                            </div>
                            <span className="text-[10px] font-mono text-gray-500 bg-gray-800 px-2 py-1 rounded-lg border border-gray-700">{entry.date}</span>
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 font-bold italic">لا توجد سجلات عيادة حالياً.</p>
                </div>
            )}
        </div>

        <div className="bg-gray-800 p-6 rounded-[2rem] shadow-xl border border-gray-700/50">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <PharmacyIcon className="w-6 h-6 text-cyan-500" />
                تنبيهات انتهاء الصلاحية
            </h2>
            {Object.keys(expiryAlerts).length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {(Object.entries(expiryAlerts) as [string, { name: string; expiryDate: string; status: 'expired' | 'expiring_soon' }[]][]).map(([battalion, meds]) => (
                        <div key={battalion} className="space-y-2">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{battalion}</h3>
                            {meds.map((med, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-900/30 rounded-xl border border-gray-700/30">
                                    <span className="text-sm font-bold text-gray-200">{med.name}</span>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${med.status === 'expired' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {med.expiryDate}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 font-bold italic">جميع الأدوية صالحة.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
