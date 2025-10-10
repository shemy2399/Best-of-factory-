import React, { useMemo, useState } from 'react';
import { Horse } from '../types';
import { BreedingIcon, CheckIcon } from '../components/icons';

interface BreedingPageProps {
  horses: Horse[];
  onRecordBirth: (horseId: string) => void;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
}

const ConfirmBirthModal: React.FC<{
  horse: Horse;
  onClose: () => void;
  onConfirm: (horseId: string) => void;
}> = ({ horse, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-700">
                <h3 className="text-xl font-bold text-gray-100 mt-5">تسجيل الولادة</h3>
                <p className="text-gray-400 mt-2">
                    هل أنت متأكد من تسجيل ولادة الفرس <span className="font-bold text-gray-200">{horse.name}</span>؟
                    <br/>
                    سيتم إزالتها من قائمة الأفراس العشار.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                     <button
                        type="button"
                        onClick={() => onConfirm(horse.id)}
                        className="px-8 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                        نعم، تأكيد الولادة
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


const BreedingPage: React.FC<BreedingPageProps> = ({ horses, onRecordBirth, globalBattalionFilter }) => {
    const [confirmingBirthHorse, setConfirmingBirthHorse] = useState<Horse | null>(null);

    const pregnantMares = useMemo(() => {
        const mares = horses.filter(h => !!h.pregnancy);
        const filtered = globalBattalionFilter === 'الكل'
            ? mares
            : mares.filter(h => h.battalion === globalBattalionFilter);
        
        return filtered.sort((a, b) => 
            new Date(a.pregnancy!.expectedDueDate).getTime() - new Date(b.pregnancy!.expectedDueDate).getTime()
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
            {confirmingBirthHorse && (
                <ConfirmBirthModal 
                    horse={confirmingBirthHorse}
                    onClose={() => setConfirmingBirthHorse(null)}
                    onConfirm={(horseId) => {
                        onRecordBirth(horseId);
                        setConfirmingBirthHorse(null);
                    }}
                />
            )}
            <div>
                <h1 className="text-3xl font-bold text-white">الأفراس العشار</h1>
                <p className="text-gray-400 mt-2">قائمة متابعة للأفراس الحوامل وتواريخ الولادة المتوقعة.</p>
            </div>
            
            {pregnantMares.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pregnantMares.map(mare => {
                        const daysPregnant = calculateDays(mare.pregnancy!.conceptionDate, today);
                        const daysUntilDue = calculateDays(today, mare.pregnancy!.expectedDueDate);
                        const isOverdue = daysUntilDue < 0;

                        return (
                            <div key={mare.id} className="bg-gray-700 rounded-xl shadow-lg p-5 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{mare.name} ({mare.number})</h2>
                                            <p className="text-sm text-gray-400">{mare.battalion}</p>
                                        </div>
                                        {isOverdue && <span className="px-2 py-1 text-xs font-medium text-red-300 bg-red-500/20 rounded-full">متأخرة</span>}
                                    </div>
                                    <div className="mt-4 space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">تاريخ التلقيح:</span>
                                            <span className="font-medium text-gray-200">{mare.pregnancy!.conceptionDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">الولادة المتوقعة:</span>
                                            <span className="font-bold text-amber-400">{mare.pregnancy!.expectedDueDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">أيام الحمل:</span>
                                            <span className="font-medium text-gray-200">{daysPregnant} يوم</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">متبقي على الولادة:</span>
                                            <span className="font-medium text-gray-200">{isOverdue ? `متأخرة ${Math.abs(daysUntilDue)} يوم` : `${daysUntilDue} يوم`}</span>
                                        </div>
                                        {mare.pregnancy!.notes && (
                                            <div className="pt-2">
                                                <p className="text-gray-400">ملاحظات:</p>
                                                <p className="text-gray-200 bg-gray-800 p-2 rounded-md mt-1">{mare.pregnancy!.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-5 pt-4 border-t border-gray-600 flex justify-end">
                                    <button 
                                        onClick={() => setConfirmingBirthHorse(mare)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-200 bg-green-500/20 rounded-lg hover:bg-green-500/40 transition-colors"
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                        تسجيل الولادة
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-700 rounded-xl shadow-lg">
                    <BreedingIcon className="w-16 h-16 mx-auto text-gray-500 mb-4"/>
                    <h3 className="text-xl text-gray-300 font-semibold">لا توجد أفراس عشار مسجلة</h3>
                    <p className="text-gray-400 mt-2">
                        يمكنك تحديد فرس كـ"عشار" من خلال تعديل بياناتها في صفحة سجلات الخيول.
                    </p>
                </div>
            )}
        </div>
    );
};

export default BreedingPage;
