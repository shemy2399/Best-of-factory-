import React, { useMemo } from 'react';
import { Horse, MedicalRecordEntry, Vaccination } from '../types';
import { RemindersIcon } from '../components/icons';

interface Reminder {
    type: 'clinic' | 'vaccination' | 'deworming';
    horseId: string;
    horseName: string;
    horseNumber: string;
    battalion: Horse['battalion'];
    dueDate: string;
    details: string; // e.g. "Follow-up for..." or "Next vaccination for..."
    notes?: string;
    originalDate?: string; // e.g. date of clinic visit or previous vaccination
}

interface RemindersPageProps {
  clinicLog: ({ horseName: string; horseId: string } & MedicalRecordEntry)[];
  horses: Horse[];
  vaccinations: Vaccination[];
  globalBattalionFilter: Horse['battalion'] | 'الكل';
}

const RemindersPage: React.FC<RemindersPageProps> = ({ clinicLog, horses, vaccinations, globalBattalionFilter }) => {
    
    const allReminders = useMemo((): Reminder[] => {
        const horseMap = new Map<string, Horse>(horses.map(h => [h.id, h]));
        const reminders: Reminder[] = [];

        // Clinic Follow-ups
        clinicLog.forEach(record => {
            if (record.followUpDate) {
                const horse = horseMap.get(record.horseId);
                if (horse) {
                    reminders.push({
                        type: 'clinic',
                        horseId: horse.id,
                        horseName: horse.name,
                        horseNumber: horse.number,
                        battalion: horse.battalion,
                        dueDate: record.followUpDate,
                        details: `متابعة لحالة: ${record.diagnosis}`,
                        notes: record.followUpNotes || '',
                        originalDate: record.date,
                    });
                }
            }
        });
        
        // Vaccination & Deworming Due Dates
        vaccinations.forEach(vacc => {
            if (vacc.nextDueDate) {
                const horse = horseMap.get(vacc.horseId);
                if (horse) {
                    reminders.push({
                        type: vacc.type,
                        horseId: horse.id,
                        horseName: horse.name,
                        horseNumber: horse.number,
                        battalion: horse.battalion,
                        dueDate: vacc.nextDueDate,
                        details: `${vacc.type === 'vaccination' ? 'التحصين' : 'التجريع'} القادم لـ: ${vacc.productName}`,
                        originalDate: vacc.date,
                    });
                }
            }
        });

        const sorted = reminders.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
        if (globalBattalionFilter === 'الكل') {
            return sorted;
        }
        return sorted.filter(r => r.battalion === globalBattalionFilter);

    }, [clinicLog, horses, vaccinations, globalBattalionFilter]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueReminders = allReminders.filter(r => new Date(r.dueDate) < today);
    const todayReminders = allReminders.filter(r => new Date(r.dueDate).getTime() === today.getTime());
    const upcomingReminders = allReminders.filter(r => new Date(r.dueDate) > today);

    const ReminderCard: React.FC<{ reminder: Reminder, category: 'overdue' | 'today' | 'upcoming' }> = ({ reminder, category }) => {
        let borderColor = 'border-gray-600';
        if (category === 'overdue') borderColor = 'border-red-500';
        if (category === 'today') borderColor = 'border-amber-500';
        
        const getOriginalDateText = () => {
            if (!reminder.originalDate) return '';
            if (reminder.type === 'clinic') {
                return `الحالة الأصلية بتاريخ ${reminder.originalDate}`;
            }
            const typeText = reminder.type === 'vaccination' ? 'التحصين' : 'التجريع';
            return `${typeText} السابق بتاريخ ${reminder.originalDate}`;
        };

        const getDueDateText = () => {
            if (reminder.type === 'clinic') return 'تاريخ المتابعة';
            const typeText = reminder.type === 'vaccination' ? 'التحصين' : 'التجريع';
            return `تاريخ ${typeText}`;
        }

        return (
            <div className={`bg-gray-800 p-4 rounded-lg border-l-4 ${borderColor} shadow-md`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-white">{reminder.horseName} ({reminder.horseNumber})</p>
                        <p className="text-sm text-gray-400">{reminder.battalion}</p>
                    </div>
                    <div className="text-left">
                         <p className="font-semibold text-gray-200">{reminder.dueDate}</p>
                         <p className="text-xs text-gray-500">{getDueDateText()}</p>
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700">
                    <p className="text-sm font-semibold text-gray-300">
                       {reminder.type === 'clinic' ? 'سبب المتابعة:' : 'تفاصيل:'}
                    </p>
                    <p className="text-sm text-gray-200 mt-1">{reminder.details}</p>

                    {reminder.originalDate && (
                        <p className="text-sm text-gray-500 mt-1">
                           {getOriginalDateText()}
                        </p>
                    )}
                    
                    {reminder.notes && (
                         <p className="text-sm text-amber-300 mt-2 bg-amber-500/10 p-2 rounded">{reminder.notes}</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">المتابعات والتذكيرات</h1>
                <p className="text-gray-400 mt-2">عرض جميع المتابعات الطبية والتحصينات والتجريعات المجدولة للخيول.</p>
            </div>
            
            {allReminders.length === 0 ? (
                 <div className="text-center py-16 bg-gray-700 rounded-xl shadow-lg">
                    <RemindersIcon className="w-16 h-16 mx-auto text-gray-500 mb-4"/>
                    <h3 className="text-xl text-gray-300 font-semibold">لا توجد متابعات أو مواعيد مجدولة</h3>
                    <p className="text-gray-400 mt-2">
                        {globalBattalionFilter === 'الكل'
                            ? 'لم يتم العثور على أي تذكيرات. يمكنك إضافتها من دفتر العيادة أو سجل التحصينات.'
                            : `لا توجد تذكيرات لهذه الكتيبة. يمكنك تحديد "الكل" من الفلتر العلوي لرؤية جميع التذكيرات.`
                        }
                    </p>
                </div>
            ) : (
            <div className="space-y-8">
                {overdueReminders.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-red-400 mb-4">متأخر ({overdueReminders.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {overdueReminders.map(r => <ReminderCard key={`${r.horseId}-${r.dueDate}-${r.details}`} reminder={r} category="overdue"/>)}
                        </div>
                    </section>
                )}
                 {todayReminders.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-amber-400 mb-4">اليوم ({todayReminders.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {todayReminders.map(r => <ReminderCard key={`${r.horseId}-${r.dueDate}-${r.details}`} reminder={r} category="today"/>)}
                        </div>
                    </section>
                )}
                 {upcomingReminders.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-gray-300 mb-4">قادم ({upcomingReminders.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingReminders.map(r => <ReminderCard key={`${r.horseId}-${r.dueDate}-${r.details}`} reminder={r} category="upcoming"/>)}
                        </div>
                    </section>
                )}
            </div>
            )}
        </div>
    );
};

export default RemindersPage;