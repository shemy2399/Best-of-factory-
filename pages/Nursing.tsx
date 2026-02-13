
import React, { useMemo, useState } from 'react';
import { Horse } from '../types';
import { CheckIcon, XMarkIcon } from '../components/icons';

interface NursingPageProps {
  horses: Horse[];
  onRecordWeaning: (mareId: string) => void;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
}

const ConfirmWeaningModal: React.FC<{
  mare: Horse;
  onClose: () => void;
  onConfirm: (mareId: string) => void;
}> = ({ mare, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-700">
                <h3 className="text-xl font-bold text-gray-100 mt-5">تسجيل الفطام</h3>
                <p className="text-gray-400 mt-2">
                    هل أنت متأكد من تسجيل فطام المهر <span className="font-bold text-gray-200">{mare.lactation?.foalName}</span> من الفرس <span className="font-bold text-gray-200">{mare.name}</span>؟
                </p>
                <div className="mt-8 flex justify-center gap-4">
                     <button
                        type="button"
                        onClick={() => onConfirm(mare.id)}
                        className="px-8 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        نعم، تأكيد الفطام
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

const NursingPage: React.FC<NursingPageProps> = ({ horses, onRecordWeaning, globalBattalionFilter }) => {
    const [confirmingWeaningMare, setConfirmingWeaningMare] = useState<Horse | null>(null);

    const nursingMares = useMemo(() => {
        const mares = horses.filter(h => !!h.lactation);
        const filtered = globalBattalionFilter === 'الكل'
            ? mares
            : mares.filter(h => h.battalion === globalBattalionFilter);
        
        return filtered.sort((a, b) => 
            new Date(a.lactation!.expectedWeaningDate).getTime() - new Date(b.lactation!.expectedWeaningDate).getTime()
        );
    }, [horses, globalBattalionFilter]);

    const calculateDays = (dateStr1: string, dateStr2: string) => {
        const date1 = new Date(dateStr1);
        const date2 = new Date(dateStr2);
        date1.setUTCHours(0,0,0,0);
        date2.setUTCHours(0,0,0,0);
        const diffTime = date2.getTime() - date1.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            {confirmingWeaningMare && (
                <ConfirmWeaningModal 
                    mare={confirmingWeaningMare}
                    onClose={() => setConfirmingWeaningMare(null)}
                    onConfirm={(mareId) => {
                        onRecordWeaning(mareId);
                        setConfirmingWeaningMare(null);
                    }}
                />
            )}
            <div>
                <h1 className="text-3xl font-bold text-white">الأفراس المرضعة</h1>
                <p className="text-gray-400 mt-2">سجل لمتابعة الأفراس الوالدة والمربوطة بمهر (مدة الرضاعة وموعد الفطام).</p>
            </div>
            
            {nursingMares.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nursingMares.map(mare => {
                        const daysLactating = calculateDays(mare.lactation!.startDate, today);
                        const daysUntilWeaning = calculateDays(today, mare.lactation!.expectedWeaningDate);
                        const isWeaningDue = daysUntilWeaning <= 0;

                        return (
                            <div key={mare.id} className="bg-gray-700 rounded-xl shadow-lg p-5 flex flex-col justify-between border-t-4 border-cyan-500">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{mare.name} ({mare.number})</h2>
                                            <p className="text-sm text-gray-400">{mare.battalion}</p>
                                        </div>
                                        {isWeaningDue && <span className="px-2 py-1 text-xs font-medium text-amber-300 bg-amber-500/20 rounded-full animate-pulse">موعد فطام</span>}
                                    </div>
                                    <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                                        <p className="text-xs text-cyan-400 font-bold mb-1">المهر المربوط:</p>
                                        <p className="text-lg text-white font-bold">{mare.lactation!.foalName}</p>
                                    </div>
                                    <div className="mt-4 space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">تاريخ البدء (الولادة):</span>
                                            <span className="font-medium text-gray-200">{mare.lactation!.startDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">الفطام المتوقع:</span>
                                            <span className="font-bold text-cyan-400">{mare.lactation!.expectedWeaningDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">مدة الرضاعة المنقضية:</span>
                                            <span className="font-medium text-gray-200">{daysLactating} يوم ({Math.floor(daysLactating/30)} شهر)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">متبقي على الفطام:</span>
                                            <span className="font-medium text-gray-200">{isWeaningDue ? `مكتمل` : `${daysUntilWeaning} يوم`}</span>
                                        </div>
                                        {mare.lactation!.notes && (
                                            <div className="pt-2">
                                                <p className="text-gray-400">ملاحظات:</p>
                                                <p className="text-gray-200 bg-gray-800 p-2 rounded-md mt-1 italic">{mare.lactation!.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-5 pt-4 border-t border-gray-600 flex justify-end">
                                    <button 
                                        onClick={() => setConfirmingWeaningMare(mare)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-200 bg-blue-500/20 rounded-lg hover:bg-blue-500/40 transition-colors"
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                        تسجيل الفطام
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-700 rounded-xl shadow-lg">
                    <div className="w-16 h-16 mx-auto text-gray-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582" />
                        </svg>
                    </div>
                    <h3 className="text-xl text-gray-300 font-semibold">لا توجد أفراس مرضعة مسجلة حالياً</h3>
                    <p className="text-gray-400 mt-2">
                        يمكنك ربط الفرس بمهر وتحديد بيانات الرضاعة من خلال تعديل بيانات الفرس في صفحة سجلات الخيول.
                    </p>
                </div>
            )}
        </div>
    );
};

export default NursingPage;
