import React, { useMemo } from 'react';
import { Horse, Medication, MedicalRecordEntry } from '../types';
import { PrintIcon } from '../components/icons';

interface ReportsPageProps {
  clinicLog: ({ horseName: string; horseId: string } & MedicalRecordEntry)[];
  horses: Horse[];
  medications: Medication[];
  globalBattalionFilter: Horse['battalion'] | 'الكل';
}

const ReportsPage: React.FC<ReportsPageProps> = ({ clinicLog, horses, medications, globalBattalionFilter }) => {
  
  const handlePrint = () => {
    window.print();
  };
  
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


  const horseStatusCounts = useMemo(() => {
    return filteredHorses.reduce((acc, horse) => {
      acc[horse.status] = (acc[horse.status] || 0) + 1;
      return acc;
    }, {} as Record<Horse['status'], number>);
  }, [filteredHorses]);

  const lowStockMedications = useMemo(() => {
    return filteredMedications.filter(med => med.quantity < 10).sort((a,b) => a.quantity - b.quantity);
  }, [filteredMedications]);

  const casesByBattalion = useMemo(() => {
      const horseMap = new Map(horses.map(h => [h.id, h]));
      // FIX: The initial value of the reduce function was an empty object `{}`, which TypeScript infers as type `{}`,
      // preventing new properties from being added. Typing the accumulator `acc` correctly solves this.
      return filteredClinicLog.reduce((acc, entry) => {
          const horse = horseMap.get(entry.horseId);
          if (horse) {
              const battalion = horse.battalion;
              acc[battalion] = (acc[battalion] || 0) + 1;
          }
          return acc;
      }, {} as Record<string, number>);
  }, [filteredClinicLog, horses]);

  return (
    <div className="space-y-8 text-white" id="reports-page">
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
          <p className="text-gray-400 mt-2">نظرة شاملة على بيانات المنظومة قابلة للطباعة.</p>
        </div>
        <div id="print-button-container">
          <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-md">
            <PrintIcon className="w-5 h-5 ml-2" />
            طباعة التقرير
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold mb-4">حالة الخيول</h2>
              <ul className="space-y-2">
                  <li className="flex justify-between items-center"><span>سليم:</span> <span className="font-bold text-lg">{horseStatusCounts.healthy || 0}</span></li>
                  <li className="flex justify-between items-center"><span>متابعة:</span> <span className="font-bold text-lg">{horseStatusCounts.monitoring || 0}</span></li>
                  <li className="flex justify-between items-center"><span>مريض:</span> <span className="font-bold text-lg">{horseStatusCounts.sick || 0}</span></li>
                  <li className="flex justify-between items-center border-t border-gray-600 pt-2 mt-2"><strong>الإجمالي:</strong> <strong className="font-bold text-lg">{filteredHorses.length}</strong></li>
              </ul>
          </div>
          <div className="bg-gray-700 p-6 rounded-xl shadow-lg col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">حالات العيادة المسجلة حسب الكتيبة</h2>
              {filteredClinicLog.length > 0 ? (
                <ul className="space-y-2">
                  {(Object.entries(casesByBattalion)).map(([battalion, count]) => (
                      <li key={battalion} className="flex justify-between items-center"><span>{battalion}:</span> <span className="font-bold text-lg">{count}</span></li>
                  ))}
                  <li className="flex justify-between items-center border-t border-gray-600 pt-2 mt-2"><strong>الإجمالي:</strong> <strong className="font-bold text-lg">{filteredClinicLog.length}</strong></li>
                </ul>
              ) : (
                <p className="text-gray-400">لا توجد حالات مسجلة في العيادة.</p>
              )}
          </div>
      </div>
      
      <div className="bg-gray-700 rounded-xl shadow-lg overflow-hidden">
        <h2 className="text-xl font-bold p-6">أدوية قاربت على النفاد (أقل من 10 وحدات)</h2>
        {lowStockMedications.length > 0 ? (
          <table className="min-w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الدواء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الكتيبة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الكمية المتبقية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {lowStockMedications.map(med => (
                <tr key={med.id}>
                  <td className="px-6 py-4 font-medium">{med.name}</td>
                  <td className="px-6 py-4">{med.battalion}</td>
                  <td className="px-6 py-4 font-bold text-yellow-400">{med.quantity} {med.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 px-6 pb-6">لا توجد أدوية قاربت على النفاد.</p>
        )}
      </div>

      <div className="bg-gray-700 rounded-xl shadow-lg overflow-hidden">
        <h2 className="text-xl font-bold p-6">أحدث 10 حالات في سجل العيادة</h2>
        {filteredClinicLog.length > 0 ? (
          <table className="min-w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الحصان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">التشخيص</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredClinicLog.slice(0, 10).map(entry => (
                <tr key={entry.id}>
                  <td className="px-6 py-4">{entry.date}</td>
                  <td className="px-6 py-4 font-medium">{entry.horseName}</td>
                  <td className="px-6 py-4">{entry.diagnosis}</td>
                  <td className="px-6 py-4">{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 px-6 pb-6">لا توجد سجلات في العيادة.</p>
        )}
      </div>

       <style>{`
        @media print {
          body {
            background-color: white !important;
          }
          body * {
            visibility: hidden;
          }
          #reports-page, #reports-page * {
            visibility: visible;
          }
          #reports-page {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            margin: 2rem;
            color: black !important;
          }
          .text-white, .text-gray-100, .text-gray-200, .text-gray-300, .text-gray-400 { color: black !important; }
          .bg-gray-700 { background-color: #f3f4f6 !important; border: 1px solid #ddd; box-shadow: none !important; }
          .bg-gray-900\\/50 { background-color: #e5e7eb !important; }
          .divide-gray-600 > :not([hidden]) ~ :not([hidden]) { border-color: #ccc !important; }
          .text-yellow-400 { color: #92400e !important; }
          .border-gray-600 { border-color: #ccc !important; }
        }
      `}</style>

    </div>
  );
};

export default ReportsPage;