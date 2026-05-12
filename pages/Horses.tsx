
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Horse, Vaccination, MedicalRecordEntry, AdminUser } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, HorseIcon, EyeIcon, BreedingIcon, CheckIcon, ClinicIcon, VaccinationIcon, MedicalRecordsIcon } from '../components/icons'; 
import DateInput from '../components/DateInput';

type ClinicLogEntry = { horseName: string; horseId: string; horseNumber?: string } & MedicalRecordEntry;

interface HorsesPageProps {
  horses: Horse[];
  vaccinations: Vaccination[];
  clinicLog: ClinicLogEntry[];
  onAddHorse: (horse: any) => void;
  onEditHorse: (horse: Horse) => void;
  onDeleteHorse: (horseId: string) => void;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  initialSearchTerm?: string;
  currentUser?: AdminUser | null;
}

const BATTALIONS: Horse['battalion'][] = ['الكتيبة الاولى', 'الكتيبة الثانية', 'الكتيبة الثالثة', 'نادي الفروسية'];

// --- Components ---
const InfoBadge = React.memo(({ label, color, className = "" }: { label: string, color: string, className?: string }) => (
    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-[6px] text-[10px] font-bold border tracking-wide whitespace-nowrap shadow-sm bg-opacity-10 ${color} ${className}`}>
        {label}
    </span>
));

const StatusBadge = React.memo(({ status }: { status: string }) => {
  const s = (status || 'healthy').toLowerCase();
  const config: any = {
    healthy: { text: 'سليم', classes: 'text-green-400 bg-green-500/10 border-green-500/20' },
    monitoring: { text: 'متابعة', classes: 'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse' },
  };
  const c = config[s] || config.healthy;
  return (
    <div className={`px-2 py-1 rounded-md border ${c.classes} flex items-center justify-center gap-1.5 font-bold text-[10px] w-20 mx-auto`}>
      <div className={`w-1.5 h-1.5 rounded-full bg-current`}></div>
      {c.text}
    </div>
  );
});

// --- Row Component ---
const HorseRow = React.memo(({ horse, effectiveStatus, onView, onEdit, onDelete }: { 
    horse: Horse, 
    effectiveStatus: string,
    onView: (h: Horse) => void, 
    onEdit: (h: Horse) => void, 
    onDelete: (id: string) => void 
}) => {
    const gender = horse.gender || '';
    const isFemale = gender.includes('انثى');

    return (
        <tr className="hover:bg-gray-800/50 transition-colors group border-b border-gray-700/50 last:border-0">
            <td className="px-4 py-3 align-middle w-24">
                <span className="font-mono font-black text-amber-500 bg-gray-900 px-2 py-1 rounded text-sm shadow-sm block text-center border border-gray-700">
                    {horse.number}
                </span>
            </td>
            <td className="px-4 py-3 align-middle">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base ml-1">{horse.name}</span>
                         <InfoBadge 
                            label={gender} 
                            color={isFemale ? 'text-pink-300 bg-pink-500 border-pink-500/20' : 'text-cyan-300 bg-cyan-500 border-cyan-500/20'} 
                        />
                         {horse.pregnancy && (
                            <InfoBadge label="عشار" color="text-white bg-pink-600 border-pink-500 shadow-pink-500/20" />
                        )}
                        {horse.lactation && (
                             <InfoBadge label="مرضعة" color="text-white bg-blue-600 border-blue-500 shadow-blue-500/20" />
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 opacity-80">
                        <span className="text-[10px] text-gray-500 font-bold bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">{horse.battalion}</span>
                        {horse.breed && (
                            <span className="text-[10px] text-indigo-300 bg-indigo-900/20 px-1.5 py-0.5 rounded border border-indigo-500/20">{horse.breed}</span>
                        )}
                         {horse.color && (
                            <span className="text-[10px] text-gray-300 bg-gray-700/50 px-1.5 py-0.5 rounded border border-gray-600/50">{horse.color}</span>
                        )}
                        {horse.rasan && (
                            <span className="text-[10px] text-amber-500/80 bg-amber-900/10 px-1.5 py-0.5 rounded border border-amber-500/10">{horse.rasan}</span>
                        )}
                        {horse.fatherName && (
                            <span className="text-[10px] text-blue-300 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/20">الأب: {horse.fatherName}</span>
                        )}
                        {horse.motherName && (
                            <span className="text-[10px] text-pink-300 bg-pink-900/20 px-1.5 py-0.5 rounded border border-pink-500/20">الأم: {horse.motherName}</span>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 align-middle text-center w-32">
                <StatusBadge status={effectiveStatus} />
            </td>
            <td className="px-4 py-3 align-middle text-left w-40">
                <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onView(horse)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="الملف الطبي الكامل">
                        <EyeIcon className="w-4 h-4"/>
                    </button>
                    <button onClick={() => onEdit(horse)} className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors" title="تعديل">
                        <PencilIcon className="w-4 h-4"/>
                    </button>
                    <button onClick={() => onDelete(horse.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="حذف">
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                </div>
            </td>
        </tr>
    );
});

// --- Full Medical Record Modal ---
const HorseViewModal = ({ horse, vaccinations, clinicLog, onClose }: { horse: Horse; vaccinations: Vaccination[]; clinicLog: ClinicLogEntry[]; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'clinic' | 'vaccines' | 'deworming'>('info');
  
  // تجميع كافة السجلات الطبية من دفتر العيادة للحصان المحدد
  // الفلترة هنا تعرض فقط الحالات التي تم وضع علامة "دائم" عليها (isPermanent === true)
  const fullMedicalHistory = useMemo(() => {
      return clinicLog
        .filter(entry => entry.horseId === horse.id && entry.isPermanent === true)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [clinicLog, horse.id]);

  const horseVaccinations = useMemo(() => vaccinations.filter(v => v.horseId === horse.id && v.type === 'vaccination').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [vaccinations, horse.id]);
  const horseDeworming = useMemo(() => vaccinations.filter(v => v.horseId === horse.id && v.type === 'deworming').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [vaccinations, horse.id]);

  return (
  <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex justify-center items-center z-[70] p-4 text-right">
    <div className="bg-gray-900 rounded-[2rem] border border-gray-800 w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
      <div className="relative h-28 bg-gradient-to-l from-amber-900/20 to-gray-900 flex items-center justify-between px-8 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-6">
              <div className="p-3 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg">
                  <HorseIcon className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                  <h2 className="text-3xl font-black text-white">{horse.name}</h2>
                  <div className="flex gap-3 mt-1 text-sm">
                     <span className="text-amber-500 font-mono font-bold">#{horse.number}</span>
                     <span className="text-gray-500">|</span>
                     <span className="text-gray-400">{horse.battalion}</span>
                  </div>
              </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/5">
              <XMarkIcon className="w-6 h-6" />
          </button>
      </div>
      <div className="flex bg-gray-800 border-b border-gray-700 px-6 pt-4 shrink-0 overflow-x-auto">
          <button onClick={() => setActiveTab('info')} className={`pb-4 px-6 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'info' ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-400 hover:text-white'}`}>
              <HorseIcon className="w-5 h-5" />
              البيانات الأساسية
          </button>
          <button onClick={() => setActiveTab('clinic')} className={`pb-4 px-6 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'clinic' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-white'}`}>
              <ClinicIcon className="w-5 h-5" />
              السجل الطبي الدائم ({fullMedicalHistory.length})
          </button>
          <button onClick={() => setActiveTab('vaccines')} className={`pb-4 px-6 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'vaccines' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400 hover:text-white'}`}>
              <VaccinationIcon className="w-5 h-5" />
              التحصينات ({horseVaccinations.length})
          </button>
          <button onClick={() => setActiveTab('deworming')} className={`pb-4 px-6 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'deworming' ? 'border-purple-500 text-purple-500' : 'border-transparent text-gray-400 hover:text-white'}`}>
              <MedicalRecordsIcon className="w-5 h-5" />
              التجريعات ({horseDeworming.length})
          </button>
      </div>
      <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-900">
          {activeTab === 'info' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">الرسن</p>
                        <p className="text-lg font-bold text-white truncate">{horse.rasan || '-'}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">السلالة</p>
                        <p className="text-lg font-bold text-white truncate">{horse.breed || '-'}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">الجنس</p>
                        <p className="text-lg font-bold text-amber-500">{horse.gender || '-'}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">اللون</p>
                        <p className="text-lg font-bold text-white">{horse.color || '-'}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">تاريخ الميلاد</p>
                        <p className="text-lg font-bold text-white">{horse.dateOfBirth || '-'}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Microchip</p>
                        <p className="text-lg font-mono font-bold text-cyan-400">{horse.microchipNumber || '-'}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">الاب</p>
                        <p className="text-lg font-bold text-white truncate">{horse.fatherName || '-'}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">الام</p>
                        <p className="text-lg font-bold text-white truncate">{horse.motherName || '-'}</p>
                    </div>
                </div>
                {(horse.pregnancy || horse.lactation) && (
                    <div className="bg-gray-800/30 p-5 rounded-2xl border border-gray-700">
                        <h3 className="text-sm font-bold text-pink-400 mb-3 flex items-center gap-2">
                            <BreedingIcon className="w-4 h-4" />
                            الحالة الإنجابية
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {horse.pregnancy && (
                                <div className="bg-pink-500/10 p-3 rounded-xl border border-pink-500/20">
                                    <p className="text-xs text-pink-300 font-bold mb-1">عشار (حامل)</p>
                                    <p className="text-sm text-gray-300">تاريخ التلقيح: {horse.pregnancy.conceptionDate}</p>
                                    <p className="text-sm text-gray-300">الولادة المتوقعة: <span className="text-white font-bold">{horse.pregnancy.expectedDueDate}</span></p>
                                    {horse.pregnancy.notes && <p className="text-xs text-gray-400 mt-1 italic">"{horse.pregnancy.notes}"</p>}
                                </div>
                            )}
                            {horse.lactation && (
                                <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                                    <p className="text-xs text-blue-300 font-bold mb-1">مرضعة</p>
                                    <p className="text-sm text-gray-300">المهر: <span className="text-white font-bold">{horse.lactation.foalName}</span></p>
                                    <p className="text-sm text-gray-300">الفطام المتوقع: {horse.lactation.expectedWeaningDate}</p>
                                    {horse.lactation.notes && <p className="text-xs text-gray-400 mt-1 italic">"{horse.lactation.notes}"</p>}
                                </div>
                            )}
                        </div>
                    </div>
                )}
              </div>
          )}
          {activeTab === 'clinic' && (
              <div className="animate-fade-in">
                  {fullMedicalHistory.length > 0 ? (
                      <div className="space-y-4">
                          {fullMedicalHistory.map((record, idx) => (
                              <div key={idx} className="bg-gray-800 p-5 rounded-xl border-r-4 border-blue-500 shadow-md">
                                  <div className="flex justify-between items-start mb-2">
                                      <h3 className="text-lg font-bold text-white">{record.diagnosis}</h3>
                                      <span className="text-sm font-mono text-gray-400 bg-gray-900 px-2 py-1 rounded">{record.date}</span>
                                  </div>
                                  <div className="space-y-2 text-sm text-gray-300">
                                      <p><span className="text-gray-500 font-bold">العلاج:</span> {record.treatment}</p>
                                      {record.notes && <p><span className="text-gray-500 font-bold">ملاحظات:</span> {record.notes}</p>}
                                      <div className="pt-2 flex items-center gap-2">
                                          <span className="text-xs font-bold text-gray-500">الحالة:</span>
                                          {record.status === 'monitoring' ? 
                                              <span className="text-amber-400 text-xs bg-amber-900/30 px-2 py-0.5 rounded animate-pulse">تحت المتابعة</span> : 
                                              <span className="text-green-400 text-xs bg-green-900/30 px-2 py-0.5 rounded">شفاء ({record.recoveryDate || record.date})</span>
                                          }
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-20 text-gray-500">
                          <ClinicIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p>لا توجد سجلات طبية "دائمة" لهذا الحصان.</p>
                          <p className="text-xs mt-2">يمكنك إضافة حالات من دفتر العيادة بتفعيل خيار "الإضافة للسجل الدائم".</p>
                      </div>
                  )}
              </div>
          )}
          {activeTab === 'vaccines' && (
              <div className="animate-fade-in">
                  {horseVaccinations.length > 0 ? (
                      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                          <table className="w-full text-right">
                              <thead className="bg-gray-700/50 text-gray-400 text-xs font-bold uppercase">
                                  <tr>
                                      <th className="px-6 py-3">التاريخ</th>
                                      <th className="px-6 py-3">اسم المنتج / التحصين</th>
                                      <th className="px-6 py-3">الميعاد القادم</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-700 text-sm">
                                  {horseVaccinations.map((v, idx) => (
                                      <tr key={idx} className="hover:bg-gray-700/30">
                                          <td className="px-6 py-4 font-mono text-gray-300">{v.date}</td>
                                          <td className="px-6 py-4 font-bold text-green-400">{v.productName}</td>
                                          <td className="px-6 py-4">
                                              {v.nextDueDate ? (
                                                  <span className="bg-gray-900 text-gray-300 px-2 py-1 rounded font-mono text-xs border border-gray-600">{v.nextDueDate}</span>
                                              ) : '-'}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  ) : (
                      <div className="text-center py-20 text-gray-500">
                          <VaccinationIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p>لا توجد تحصينات مسجلة.</p>
                      </div>
                  )}
              </div>
          )}
          {activeTab === 'deworming' && (
              <div className="animate-fade-in">
                  {horseDeworming.length > 0 ? (
                      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                          <table className="w-full text-right">
                              <thead className="bg-gray-700/50 text-gray-400 text-xs font-bold uppercase">
                                  <tr>
                                      <th className="px-6 py-3">التاريخ</th>
                                      <th className="px-6 py-3">اسم المنتج / المادة الفعالة</th>
                                      <th className="px-6 py-3">الميعاد القادم</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-700 text-sm">
                                  {horseDeworming.map((v, idx) => (
                                      <tr key={idx} className="hover:bg-gray-700/30">
                                          <td className="px-6 py-4 font-mono text-gray-300">{v.date}</td>
                                          <td className="px-6 py-4 font-bold text-purple-400">{v.productName}</td>
                                          <td className="px-6 py-4">
                                              {v.nextDueDate ? (
                                                  <span className="bg-gray-900 text-gray-300 px-2 py-1 rounded font-mono text-xs border border-gray-600">{v.nextDueDate}</span>
                                              ) : '-'}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  ) : (
                      <div className="text-center py-20 text-gray-500">
                          <MedicalRecordsIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p>لا توجد تجريعات مسجلة.</p>
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  </div>
  );
};

const ConfirmDeleteHorseModal: React.FC<{
  horse: Horse;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ horse, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[80] p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center border border-gray-700">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-6">
                    <TrashIcon className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">تأكيد حذف الحصان</h3>
                <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                    هل أنت متأكد من رغبتك في حذف الحصان <span className="font-bold text-white block mt-1 text-lg">"{horse.name}"</span>
                    <span className="block mt-1 text-xs text-red-400">سيتم حذف جميع السجلات المرتبطة به.</span>
                </p>
                <div className="mt-8 flex gap-3">
                    <button type="button" onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">نعم، حذف</button>
                    <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-700 text-gray-300 font-bold rounded-xl hover:bg-gray-600 transition-all">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

const HorseFormModal = ({ horse, onClose, onSave }: { horse?: Horse; onClose: () => void; onSave: (data: any) => void }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'reproduction'>('basic');
  const [formData, setFormData] = useState({
    name: horse?.name || '',
    number: horse?.number || '',
    rasan: horse?.rasan || '',
    breed: horse?.breed || 'خيول عربية أصيلة',
    gender: horse?.gender || 'ذكر',
    color: horse?.color || '',
    dateOfBirth: horse?.dateOfBirth || '',
    battalion: horse?.battalion || 'الكتيبة الاولى',
    microchipNumber: horse?.microchipNumber || '',
    status: horse?.status || 'healthy',
    fatherName: horse?.fatherName || '',
    motherName: horse?.motherName || ''
  });
  const [isPregnant, setIsPregnant] = useState(!!horse?.pregnancy);
  const [pregnancyData, setPregnancyData] = useState({ conceptionDate: horse?.pregnancy?.conceptionDate || '', expectedDueDate: horse?.pregnancy?.expectedDueDate || '', notes: horse?.pregnancy?.notes || '' });
  const [isNursing, setIsNursing] = useState(!!horse?.lactation);
  const [nursingData, setNursingData] = useState({ foalName: horse?.lactation?.foalName || '', foalId: horse?.lactation?.foalId || '', startDate: horse?.lactation?.startDate || '', expectedWeaningDate: horse?.lactation?.expectedWeaningDate || '', notes: horse?.lactation?.notes || '' });
  
  const isFemale = formData.gender.includes('انثى');

  const calculateDate = useCallback((baseDate: string, daysToAdd: number = 0, monthsToAdd: number = 0) => {
      if (!baseDate) return '';
      const date = new Date(baseDate);
      if (isNaN(date.getTime())) return '';
      if (daysToAdd) date.setDate(date.getDate() + daysToAdd);
      if (monthsToAdd) date.setMonth(date.getMonth() + monthsToAdd);
      try { return date.toISOString().split('T')[0]; } catch (e) { return ''; }
  }, []);

  useEffect(() => {
      if (pregnancyData.conceptionDate) {
          const newDueDate = calculateDate(pregnancyData.conceptionDate, 340, 0);
          if (newDueDate) {
              setPregnancyData(prev => { if (prev.expectedDueDate === newDueDate) return prev; return { ...prev, expectedDueDate: newDueDate }; });
          }
      }
  }, [pregnancyData.conceptionDate, calculateDate]);

  useEffect(() => {
      if (nursingData.startDate) {
          const newWeaningDate = calculateDate(nursingData.startDate, 0, 6);
          if (newWeaningDate) {
             setNursingData(prev => { if (prev.expectedWeaningDate === newWeaningDate) return prev; return { ...prev, expectedWeaningDate: newWeaningDate }; });
          }
      }
  }, [nursingData.startDate, calculateDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: any = { ...formData };
    if (isFemale && isPregnant) finalData.pregnancy = pregnancyData; else finalData.pregnancy = null; 
    if (isFemale && isNursing) finalData.lactation = nursingData; else finalData.lactation = null;
    onSave(horse ? { ...horse, ...finalData } : finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-[60] p-4 text-right">
      <div className="bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-2xl border border-gray-800 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-800 bg-gray-900">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20"><HorseIcon className="w-6 h-6 text-amber-500" /></div>
              {horse ? 'تحديث بيانات الحصان' : 'تسجيل حصان جديد'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6" /></button>
          </div>
          <div className="flex gap-2 p-1 bg-gray-800 rounded-xl overflow-x-auto">
            <button onClick={() => setActiveTab('basic')} className={`flex-1 min-w-[100px] py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'basic' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>البيانات الأساسية</button>
            <button onClick={() => setActiveTab('details')} className={`flex-1 min-w-[100px] py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'details' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>النسب واللون</button>
            {isFemale && (<button onClick={() => setActiveTab('reproduction')} className={`flex-1 min-w-[100px] py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'reproduction' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>الحالة الإنجابية</button>)}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeTab === 'basic' && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500">الاسم العسكري</label>
                    <input autoFocus value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white font-bold focus:border-amber-500 outline-none" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500">الرقم العسكري</label>
                    <input value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-amber-500 font-mono font-bold focus:border-amber-500 outline-none" required />
                  </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500">الجنس</label>
                <div className="grid grid-cols-4 gap-2">
                    {['ذكر', 'انثى', 'مهر ذكر', 'مهرة انثى'].map(opt => (
                        <button key={opt} type="button" onClick={() => setFormData({...formData, gender: opt as any})}
                            className={`py-3 rounded-xl border font-bold text-xs transition-all ${formData.gender === opt ? 'bg-amber-500 border-amber-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                            {opt}
                        </button>
                    ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500">الكتيبة / الوحدة</label>
                <select value={formData.battalion} onChange={e => setFormData({...formData, battalion: e.target.value as any})} className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white font-bold outline-none">
                    {BATTALIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500">الرسن</label>
                <input value={formData.rasan} onChange={e => setFormData({...formData, rasan: e.target.value})} className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white font-bold outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500">الأب</label>
                    <input value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white font-bold outline-none" placeholder="اختياري" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500">الأم</label>
                    <input value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white font-bold outline-none" placeholder="اختياري" />
                  </div>
              </div>
            </div>
          )}
          {activeTab === 'details' && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500">السلالة (Breed)</label>
                <input value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white font-bold outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500">اللون</label>
                    <input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white font-bold outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500">تاريخ الميلاد</label>
                    <DateInput value={formData.dateOfBirth} onChange={val => setFormData({...formData, dateOfBirth: val})} />
                  </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500">رقم الميكروشيب</label>
                <input value={formData.microchipNumber} onChange={e => setFormData({...formData, microchipNumber: e.target.value})} className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-cyan-400 font-mono font-bold outline-none" />
              </div>
            </div>
          )}
          {activeTab === 'reproduction' && isFemale && (
              <div className="space-y-8 animate-fade-in">
                  <div className={`p-4 rounded-2xl border transition-colors ${isPregnant ? 'bg-pink-500/5 border-pink-500/30' : 'bg-gray-800 border-gray-700'}`}>
                      <label className="flex items-center gap-3 cursor-pointer mb-4">
                          <div className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${isPregnant ? 'bg-pink-500 border-pink-500' : 'border-gray-500'}`}>{isPregnant && <CheckIcon className="w-4 h-4 text-white" />}</div>
                          <input type="checkbox" className="hidden" checked={isPregnant} onChange={e => setIsPregnant(e.target.checked)} />
                          <span className={`font-bold ${isPregnant ? 'text-pink-400' : 'text-gray-400'}`}>الفرس عشار (حامل)</span>
                      </label>
                      {isPregnant && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2 border-r-2 border-pink-500/20 mr-1">
                              <div className="space-y-1.5"><label className="text-xs font-black text-gray-500">تاريخ التلقيح</label><DateInput value={pregnancyData.conceptionDate} onChange={val => setPregnancyData(prev => ({...prev, conceptionDate: val}))} required={isPregnant} /></div>
                              <div className="space-y-1.5"><label className="text-xs font-black text-gray-500">تاريخ الولادة المتوقع</label><DateInput value={pregnancyData.expectedDueDate} onChange={val => setPregnancyData(prev => ({...prev, expectedDueDate: val}))} required={isPregnant} /></div>
                              <div className="col-span-full space-y-1.5"><label className="text-xs font-black text-gray-500">ملاحظات الحمل</label><input value={pregnancyData.notes} onChange={e => setPregnancyData({...pregnancyData, notes: e.target.value})} className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white" /></div>
                          </div>
                      )}
                  </div>
                  <div className={`p-4 rounded-2xl border transition-colors ${isNursing ? 'bg-blue-500/5 border-blue-500/30' : 'bg-gray-800 border-gray-700'}`}>
                      <label className="flex items-center gap-3 cursor-pointer mb-4">
                          <div className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${isNursing ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>{isNursing && <CheckIcon className="w-4 h-4 text-white" />}</div>
                          <input type="checkbox" className="hidden" checked={isNursing} onChange={e => setIsNursing(e.target.checked)} />
                          <span className={`font-bold ${isNursing ? 'text-blue-400' : 'text-gray-400'}`}>الفرس مرضعة</span>
                      </label>
                      {isNursing && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2 border-r-2 border-blue-500/20 mr-1">
                              <div className="space-y-1.5 col-span-full"><label className="text-xs font-black text-gray-500">اسم المهر</label><input value={nursingData.foalName} onChange={e => setNursingData({...nursingData, foalName: e.target.value})} className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white font-bold" required={isNursing} /></div>
                              <div className="space-y-1.5"><label className="text-xs font-black text-gray-500">تاريخ الولادة</label><DateInput value={nursingData.startDate} onChange={val => setNursingData(prev => ({...prev, startDate: val}))} required={isNursing} /></div>
                              <div className="space-y-1.5"><label className="text-xs font-black text-gray-500">تاريخ الفطام المتوقع</label><DateInput value={nursingData.expectedWeaningDate} onChange={val => setNursingData(prev => ({...prev, expectedWeaningDate: val}))} required={isNursing} /></div>
                          </div>
                      )}
                  </div>
              </div>
          )}
        </form>
        <div className="p-4 bg-gray-900 border-t border-gray-800"><button onClick={handleSubmit} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all text-lg">{horse ? 'حفظ التعديلات' : 'إضافة للقوة'}</button></div>
      </div>
    </div>
  );
};

// --- Main Page ---
const HorsesPage: React.FC<HorsesPageProps> = ({ horses, vaccinations, clinicLog, onAddHorse, onEditHorse, onDeleteHorse, globalBattalionFilter, initialSearchTerm, currentUser }) => {
  const [displaySearch, setDisplaySearch] = useState(initialSearchTerm || '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearchTerm || '');
  const [yearFilter, setYearFilter] = useState<string>('الكل');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [viewingHorse, setViewingHorse] = useState<Horse | null>(null);
  const [deletingHorse, setDeletingHorse] = useState<Horse | null>(null);
  
  useEffect(() => { const handler = setTimeout(() => { setDebouncedSearch(displaySearch); }, 300); return () => clearTimeout(handler); }, [displaySearch]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    horses.forEach(h => {
        if (h.dateOfBirth) {
            const match = h.dateOfBirth.match(/\b\d{4}\b/);
            if (match) years.add(match[0]);
        }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [horses]);

  const effectiveStatuses = useMemo(() => {
    const map: Record<string, 'healthy' | 'monitoring'> = {};
    const today = new Date().toISOString().split('T')[0];

    horses.forEach(horse => {
        const horseEntries = clinicLog.filter(e => e.horseId === horse.id).sort((a, b) => {
            const dateComp = b.date.localeCompare(a.date);
            if (dateComp !== 0) return dateComp;
            return (b as any).createdAt?.seconds - (a as any).createdAt?.seconds;
        });

        if (horseEntries.length === 0) {
            map[horse.id] = horse.status || 'healthy';
        } else {
            const latest = horseEntries[0];
            if (latest.status === 'monitoring') {
                map[horse.id] = 'monitoring';
            } else if (latest.status === 'recovered') {
                const rDate = latest.recoveryDate || latest.date;
                if (today > rDate) {
                    map[horse.id] = 'healthy';
                } else {
                    map[horse.id] = 'monitoring';
                }
            } else {
                map[horse.id] = 'healthy';
            }
        }
    });
    return map;
  }, [horses, clinicLog]);

  const filteredHorses = useMemo(() => {
    if (!horses) return [];
    const filter = debouncedSearch.toLowerCase().trim();
    let list = globalBattalionFilter === 'الكل' ? horses : horses.filter(h => h.battalion === globalBattalionFilter);
    
    if (yearFilter !== 'الكل') {
        list = list.filter(h => {
            if (!h.dateOfBirth) return false;
            // Check for YYYY-MM-DD or DD/MM/YYYY or just YYYY
            return h.dateOfBirth.includes(yearFilter);
        });
    }

    if (filter) {
        if (filter === '(غير محدد)') {
            list = list.filter(h => !h.rasan || h.rasan.trim() === '');
        } else {
            list = list.filter(h => 
                (h.name || '').toLowerCase().includes(filter) || 
                (h.number || '').includes(filter) || 
                (h.rasan || '').toLowerCase().includes(filter) || 
                (h.breed || '').toLowerCase().includes(filter) ||
                (h.fatherName || '').toLowerCase().includes(filter) ||
                (h.motherName || '').toLowerCase().includes(filter)
            );
        }
    }
    return list;
  }, [horses, globalBattalionFilter, debouncedSearch, yearFilter]);

  const handleEdit = useCallback((h: Horse) => setEditingHorse(h), []);
  const handleView = useCallback((h: Horse) => setViewingHorse(h), []);
  const handleDeleteClick = useCallback((h: Horse) => setDeletingHorse(h), []);
  const confirmDelete = () => { if (deletingHorse) { onDeleteHorse(deletingHorse.id); setDeletingHorse(null); } };

  return (
    <div className="space-y-6 pb-20 text-right">
      {isAddModalOpen && <HorseFormModal onClose={() => setIsAddModalOpen(false)} onSave={onAddHorse} />}
      {editingHorse && <HorseFormModal horse={editingHorse} onClose={() => setEditingHorse(null)} onSave={onEditHorse} />}
      {viewingHorse && <HorseViewModal horse={viewingHorse} clinicLog={clinicLog} vaccinations={vaccinations} onClose={() => setViewingHorse(null)} />}
      {deletingHorse && <ConfirmDeleteHorseModal horse={deletingHorse} onClose={() => setDeletingHorse(null)} onConfirm={confirmDelete} />}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3"><HorseIcon className="w-8 h-8 text-amber-500" />سجلات الخيول</h1>
          <p className="text-gray-400 mt-1 font-medium text-sm">قاعدة البيانات المركزية لخيول الوحدة.</p>
        </div>
        {!currentUser?.hideAddHorseButton && (
          <button onClick={() => setIsAddModalOpen(true)} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center gap-2 active:scale-95"><PlusIcon className="w-5 h-5" />إضافة حصان جديد</button>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <input 
            type="text" 
            placeholder="بحث شامل (الاسم، الرقم، الرسن...)" 
            value={displaySearch} 
            onChange={(e) => setDisplaySearch(e.target.value)} 
            className="w-full p-5 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-amber-500 outline-none transition-all shadow-lg text-lg font-bold" 
          />
        </div>
        <div className="w-full md:w-48">
          <select 
            value={yearFilter} 
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full p-5 bg-gray-800 border border-gray-700 rounded-2xl text-white font-bold focus:border-amber-500 outline-none transition-all shadow-lg appearance-none cursor-pointer"
          >
            <option value="الكل">سنة الميلاد (الكل)</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-gray-800 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 text-right">
            <thead className="bg-gray-900/50">
                <tr className="text-xs font-black text-gray-400 uppercase tracking-widest"><th className="px-4 py-4">الرقم</th><th className="px-4 py-4 w-1/2">بيانات الحصان</th><th className="px-4 py-4 text-center">الموقف الصحي</th><th className="px-4 py-4 text-left">إجراءات</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
                {filteredHorses.length > 0 ? filteredHorses.map((horse) => (
                    <HorseRow 
                        key={horse.id} 
                        horse={horse} 
                        effectiveStatus={effectiveStatuses[horse.id] || 'healthy'}
                        onView={handleView} 
                        onEdit={handleEdit} 
                        onDelete={() => handleDeleteClick(horse)} 
                    />
                )) : (<tr><td colSpan={4} className="text-center py-10 text-gray-500">لا توجد نتائج مطابقة.</td></tr>)}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default HorsesPage;
