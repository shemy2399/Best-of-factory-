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

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; description: string;}> = ({ title, value, icon, description }) => (
  <div className="bg-gray-700 p-6 rounded-xl shadow-lg flex items-center space-x-4 space-x-reverse h-full hover:bg-gray-600/50 transition-colors">
    <div className="bg-gray-800 p-4 rounded-full">
      {icon}
    </div>
    <div>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
      <p className="text-gray-400 text-sm mt-1">{description}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ horses, medications, clinicLog, globalBattalionFilter, setActivePage }) => {

  const filteredData = useMemo(() => {
    if (globalBattalionFilter === 'الكل') {
        return { filteredHorses: horses, filteredMedications: medications, filteredClinicLog: clinicLog };
    }
    const filteredHorses = horses.filter(h => h.battalion === globalBattalionFilter);
    const filteredMedications = medications.filter(m => m.battalion === globalBattalionFilter);
    const horseIdsInBattalion = new Set(filteredHorses.map(h => h.id));
    const filteredClinicLog = clinicLog.filter(entry => horseIdsInBattalion.has(entry.horseId));
    return { filteredHorses, filteredMedications, filteredClinicLog };
  }, [horses, medications, clinicLog, globalBattalionFilter]);

  const { filteredHorses, filteredMedications, filteredClinicLog } = filteredData;

  const totalHorses = filteredHorses.length;
  const monitoringCases = filteredHorses.filter(h => h.status === 'monitoring' || h.status === 'sick').length;
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

      if (expiryDate < today) {
        status = 'expired';
      } else if (expiryDate <= sixtyDaysFromNow) {
        status = 'expiring_soon';
      }

      if (status) {
        if (!alerts[med.battalion]) {
          alerts[med.battalion] = [];
        }
        alerts[med.battalion].push({
          name: med.name,
          expiryDate: med.expiryDate,
          status: status,
        });
      }
    });
    
    for (const battalion in alerts) {
        alerts[battalion].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }

    return alerts;
  }, [filteredMedications]);
  
  const pageTitle = globalBattalionFilter === 'الكل' ? 'لوحة التحكم الشاملة' : `لوحة تحكم: ${globalBattalionFilter}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">{pageTitle}</h1>
        <p className="text-gray-400 mt-2">نظرة عامة حية على عمليات قطاع الخيالة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button onClick={() => setActivePage('horses')} className="text-right w-full"><StatCard title="أصل القوة" value={totalHorses} icon={<HorseIcon className="w-8 h-8 text-amber-400"/>} description="إجمالي الخيول المسجلة"/></button>
        <button onClick={() => setActivePage('horses')} className="text-right w-full"><StatCard title="حالات المتابعة" value={monitoringCases} icon={<ClinicIcon className="w-8 h-8 text-amber-400"/>} description="خيول مريضة أو تحت الملاحظة"/></button>
        <button onClick={() => setActivePage('pharmacy')} className="text-right w-full"><StatCard title="نواقص المخزون" value={lowStockMeds} icon={<PharmacyIcon className="w-8 h-8 text-amber-400"/>} description="أصناف دوائية على وشك النفاد" /></button>
      </div>
      
       {globalBattalionFilter !== 'الكل' && (
        <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">تنبيهات انتهاء صلاحية الأدوية (60 يومًا)</h2>
          {Object.keys(expiryAlerts).length > 0 ? (
            <div className="space-y-6">
              {(Object.entries(expiryAlerts) as [string, { name: string; expiryDate: string; status: 'expired' | 'expiring_soon' }[]][]).map(([battalion, meds]) => (
                <div key={battalion}>
                  <h3 className="font-semibold text-amber-400 border-b border-gray-600 pb-2 mb-3">{battalion}</h3>
                  <ul className="space-y-2">
                    {meds.map((med, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-200">{med.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">{med.expiryDate}</span>
                          {med.status === 'expired' ? (
                            <span className="px-2 py-0.5 text-xs font-medium text-red-300 bg-red-500/20 rounded-full">منتهي الصلاحية</span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium text-yellow-300 bg-yellow-500/20 rounded-full">قارب على الانتهاء</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
               <p className="text-gray-400">لا توجد أدوية منتهية الصلاحية أو قاربت على الانتهاء في هذه الصيدلية.</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">أحدث الحالات المسجلة في العيادة</h2>
        {filteredClinicLog.length > 0 ? (
          <ul className="divide-y divide-gray-600">
            {filteredClinicLog.slice(0, 5).map((entry) => (
              <li key={entry.id} className="py-4">
                <p className="font-semibold text-gray-100">{entry.horseName} - <span className="font-normal text-gray-300">{entry.diagnosis}</span></p>
                <p className="text-sm text-gray-400 mt-1">التاريخ: {entry.date}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">لا توجد سجلات في العيادة لهذه الكتيبة.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;