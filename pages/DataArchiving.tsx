
import React, { useState, useMemo } from 'react';
import { BirthRecord, WeaningRecord, Horse, MedicalRecordEntry } from '../types';
import { TrashIcon, CheckIcon, EyeIcon, XMarkIcon, HorseIcon } from '../components/icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

interface DataArchivingPageProps {
  birthRecords: BirthRecord[];
  weaningRecords: WeaningRecord[];
  horses: Horse[];
  clinicLog: MedicalRecordEntry[];
  onDeleteBirth: (id: string) => Promise<void>;
  onDeleteWeaning: (id: string) => Promise<void>;
  onUnarchiveHorse?: (id: string) => Promise<void>;
  onDeleteArchivedHorse?: (id: string) => Promise<void>;
  globalBattalionFilter: string;
}

const DataArchivingPage: React.FC<DataArchivingPageProps> = ({ 
  birthRecords, 
  weaningRecords, 
  horses,
  clinicLog,
  onDeleteBirth, 
  onDeleteWeaning,
  onUnarchiveHorse,
  onDeleteArchivedHorse,
  globalBattalionFilter 
}) => {
  const [activeTab, setActiveTab] = useState<'births' | 'weaning' | 'archivedHorses'>('births');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [viewingDetail, setViewingDetail] = useState<{
    type: 'birth' | 'weaning' | 'archivedHorse';
    record: any;
  } | null>(null);

  const filteredBirths = useMemo(() => {
    return birthRecords
      .filter(r => globalBattalionFilter === 'الكل' || r.battalion === globalBattalionFilter)
      .filter(r => {
        const h = horses.find(h => h.id === r.mareId);
        const mNumber = r.mareNumber || h?.number || '';
        return r.mareName.includes(searchTerm) || 
               r.foalName.includes(searchTerm) || 
               mNumber.includes(searchTerm);
      })
      .sort((a, b) => b.birthDate.localeCompare(a.birthDate));
  }, [birthRecords, globalBattalionFilter, searchTerm, horses]);

  const filteredWeaning = useMemo(() => {
    return weaningRecords
      .filter(r => globalBattalionFilter === 'الكل' || r.battalion === globalBattalionFilter)
      .filter(r => {
        const h = horses.find(h => h.id === r.mareId);
        const mNumber = r.mareNumber || h?.number || '';
        return r.mareName.includes(searchTerm) || 
               r.foalName.includes(searchTerm) || 
               mNumber.includes(searchTerm);
      })
      .sort((a, b) => b.weaningDate.localeCompare(a.weaningDate));
  }, [weaningRecords, globalBattalionFilter, searchTerm, horses]);

  const filteredArchivedHorses = useMemo(() => {
    return horses
      .filter(h => h.isArchived)
      .filter(h => globalBattalionFilter === 'الكل' || h.battalion === globalBattalionFilter)
      .filter(h => {
        return (h.name || '').includes(searchTerm) || 
               (h.number || '').includes(searchTerm) || 
               (h.rasan || '').includes(searchTerm) ||
               (h.archiveReason || '').includes(searchTerm);
      })
      .sort((a, b) => {
        const atA = (a as any).archivedAt || '';
        const atB = (b as any).archivedAt || '';
        return atB.localeCompare(atA);
      });
  }, [horses, globalBattalionFilter, searchTerm]);

  const stats = useMemo(() => ({
    totalBirths: filteredBirths.length,
    totalWeaning: filteredWeaning.length,
    totalArchivedHorses: horses.filter(h => h.isArchived && (globalBattalionFilter === 'الكل' || h.battalion === globalBattalionFilter)).length
  }), [filteredBirths, filteredWeaning, horses, globalBattalionFilter]);

  const handleRetrieveOldData = async () => {
    if (!window.confirm('سيقوم النظام بالبحث في سجلات الخيول ودفتر العيادة عن أي عمليات ولادة أو فطام سابقة وإضافتها للأرشيف. هل تريد الاستمرار؟')) return;
    
    setIsMigrating(true);
    setMigrationStatus('جاري فحص السجلات...');
    let birthCount = 0;
    let weaningCount = 0;

    // دالة لتنظيف وحيد النص العربي للبحث
    const normalizeArabic = (text: string) => {
        return text.replace(/[أإآ]/g, 'ا')
                   .replace(/ة/g, 'ه')
                   .replace(/ى/g, 'ي')
                   .trim();
    };

    const birthTerms = ['ولاده', 'ولدت', 'وضعت', 'مهر', 'نتاج', 'birth'].map(normalizeArabic);
    const weaningTerms = ['فطام', 'فطم', 'weaning'].map(normalizeArabic);

    try {
      // 1. التفتيش في سجلات الخيول (للمواليد الجدد الذين لهم أم مسجلة)
      for (const horse of horses) {
        if (horse.motherName && horse.dateOfBirth) {
          // التأكد من عدم وجود سجل أرشيف مسبق لهذا المهر
          const exists = birthRecords.some(r => r.foalId === horse.id || (r.foalName === horse.name && r.birthDate === horse.dateOfBirth));
          if (!exists) {
            const mare = horses.find(h => normalizeArabic(h.name) === normalizeArabic(horse.motherName || ''));
            await addDoc(collection(db, "birthRecords"), {
              mareId: mare?.id || '',
              mareName: horse.motherName,
              mareNumber: mare?.number || '',
              foalId: horse.id,
              foalName: horse.name,
              birthDate: horse.dateOfBirth,
              battalion: horse.battalion,
              notes: 'سجل مسترجع تلقائياً من بيانات الخيول',
              createdAt: serverTimestamp()
            });
            birthCount++;
          }
        }
      }

      // 2. التفتيش في دفتر العيادة
      for (const entry of clinicLog) {
        const diag = normalizeArabic(entry.diagnosis || '');
        const note = normalizeArabic(entry.notes || '');
        
        const isBirth = birthTerms.some(term => diag.includes(term) || note.includes(term));
        const isWeaning = weaningTerms.some(term => diag.includes(term) || note.includes(term));

        if (isBirth) {
          const horseDetails = horses.find(h => h.id === entry.horseId);
          const horseName = (entry as any).horseName || horseDetails?.name || 'غير معروف';
          const exists = birthRecords.some(r => r.mareId === entry.horseId && r.birthDate === entry.date);
          
          if (!exists) {
            await addDoc(collection(db, "birthRecords"), {
              mareId: entry.horseId || '',
              mareName: horseName,
              mareNumber: horseDetails?.number || '',
              foalId: '',
              foalName: 'غير محدد (مسترجع من العيادة)',
              birthDate: entry.date,
              battalion: horseDetails?.battalion || 'غير محدد',
              notes: `مسترجع من عيادة: ${entry.diagnosis}`,
              createdAt: serverTimestamp()
            });
            birthCount++;
          }
        }

        if (isWeaning) {
          const horseDetails = horses.find(h => h.id === entry.horseId);
          const horseName = (entry as any).horseName || horseDetails?.name || 'غير معروف';
          const exists = weaningRecords.some(r => r.mareId === entry.horseId && r.weaningDate === entry.date);
          
          if (!exists) {
            await addDoc(collection(db, "weaningRecords"), {
              mareId: entry.horseId || '',
              mareName: horseName,
              mareNumber: horseDetails?.number || '',
              foalId: '',
              foalName: 'غير محدد (مسترجع من العيادة)',
              weaningDate: entry.date,
              lactationStartDate: '',
              battalion: horseDetails?.battalion || 'غير محدد',
              notes: `مسترجع من عيادة: ${entry.diagnosis}`,
              createdAt: serverTimestamp()
            });
            weaningCount++;
          }
        }
      }

      setMigrationStatus(`تم استرجاع ${birthCount} سجل ولادة و ${weaningCount} سجل فطام بنجاح.`);
      setTimeout(() => setMigrationStatus(null), 5000);
    } catch (err) {
      console.error('Migration Error:', err);
      setMigrationStatus('حدث خطأ أثناء استرجاع البيانات.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            أرشيف بيانات الإنتاج
          </h1>
          <p className="text-gray-400 mt-2 font-medium">سجلات تاريخية لعمليات الولادة والفطام</p>
        </div>
        <button
          onClick={handleRetrieveOldData}
          disabled={isMigrating}
          className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black transition-all ${
            isMigrating 
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95'
          }`}
        >
          <div className={`${isMigrating ? 'animate-spin' : ''}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </div>
          {isMigrating ? 'جاري الاسترجاع...' : 'استرجاع البيانات القديمة'}
        </button>
      </div>

      {migrationStatus && (
        <div className="bg-indigo-600/10 border border-indigo-600/30 p-4 rounded-xl flex items-center gap-3 text-indigo-400 font-bold animate-in zoom-in-95 duration-300">
          <CheckIcon className="w-5 h-5" />
          {migrationStatus}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gray-800/40 p-6 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">إجمالي الولادات المؤرشفة</p>
          <p className="text-4xl font-black text-amber-500">{stats.totalBirths}</p>
        </div>
        <div className="bg-gray-800/40 p-6 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">إجمالي الفطام المؤرشف</p>
          <p className="text-4xl font-black text-blue-500">{stats.totalWeaning}</p>
        </div>
        <div className="bg-gray-800/40 p-6 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">خيول خُرّجت من الكتايب</p>
          <p className="text-4xl font-black text-indigo-500">{stats.totalArchivedHorses}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex bg-gray-800/50 p-1.5 rounded-2xl border border-gray-700 w-full md:w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab('births')}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black transition-all duration-300 whitespace-nowrap ${
              activeTab === 'births' 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            سجلات الولادات
          </button>
          <button
            onClick={() => setActiveTab('weaning')}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black transition-all duration-300 whitespace-nowrap ${
              activeTab === 'weaning' 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            سجلات الفطام
          </button>
          <button
            onClick={() => setActiveTab('archivedHorses')}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black transition-all duration-300 whitespace-nowrap ${
              activeTab === 'archivedHorses' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            الخيول المستبعدة (الأرشيف)
          </button>
        </div>

        <div className="relative w-full md:w-96 group">
          <input
            type="text"
            placeholder="بحث بالاسم أو الرقم أو الرسن أو السبب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl py-3.5 pr-12 pl-4 text-white font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-700">
        {activeTab === 'births' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead className="bg-gray-900 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-8 py-4">اسم الفرس</th>
                  <th className="px-8 py-4">اسم المهر</th>
                  <th className="px-8 py-4">تاريخ الولادة</th>
                  <th className="px-8 py-4">الكتيبة</th>
                  <th className="px-8 py-4">ملاحظات</th>
                  <th className="px-8 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-sm font-bold">
                {filteredBirths.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-gray-500">لا يوجد سجلات ولادة حالياً</td>
                  </tr>
                ) : (
                  filteredBirths.map(rec => {
                    const horse = horses.find(h => h.id === rec.mareId);
                    const displayNum = rec.mareNumber || horse?.number;
                    return (
                      <tr key={rec.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="text-white font-black">{rec.mareName}</span>
                            {displayNum && <span className="text-gray-500 text-xs font-bold">رقم: {displayNum}</span>}
                          </div>
                        </td>
                        <td className="px-8 py-4 text-amber-500 font-black">{rec.foalName}</td>
                        <td className="px-8 py-4 text-gray-300">{rec.birthDate}</td>
                        <td className="px-8 py-4 text-gray-400">{rec.battalion}</td>
                        <td className="px-8 py-4 text-gray-500 italic max-w-xs truncate">{rec.notes || '-'}</td>
                        <td className="px-8 py-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => setViewingDetail({ type: 'birth', record: rec })}
                              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="عرض التفاصيل الكاملة"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                if(window.confirm('هل أنت متأكد من حذف هذا السجل؟')) onDeleteBirth(rec.id);
                              }}
                              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                              title="حذف"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'weaning' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead className="bg-gray-900 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-8 py-4">اسم الفرس</th>
                  <th className="px-8 py-4">اسم الفصيل</th>
                  <th className="px-8 py-4">تاريخ الفطام</th>
                  <th className="px-8 py-4">الكتيبة</th>
                  <th className="px-8 py-4">ملاحظات</th>
                  <th className="px-8 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-750 text-sm font-bold">
                {filteredWeaning.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-gray-500">لا يوجد سجلات فطام حالياً</td>
                  </tr>
                ) : (
                  filteredWeaning.map(rec => {
                    const horse = horses.find(h => h.id === rec.mareId);
                    const displayNum = rec.mareNumber || horse?.number;
                    return (
                      <tr key={rec.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="text-white font-black">{rec.mareName}</span>
                            {displayNum && <span className="text-gray-500 text-xs font-bold">رقم: {displayNum}</span>}
                          </div>
                        </td>
                        <td className="px-8 py-4 text-blue-400 font-black">{rec.foalName}</td>
                        <td className="px-8 py-4 text-gray-300">{rec.weaningDate}</td>
                        <td className="px-8 py-4 text-gray-400">{rec.battalion}</td>
                        <td className="px-8 py-4 text-gray-500 italic max-w-xs truncate">{rec.notes || '-'}</td>
                        <td className="px-8 py-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => setViewingDetail({ type: 'weaning', record: rec })}
                              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="عرض التفاصيل الكاملة"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                if(window.confirm('هل أنت متأكد من حذف هذا السجل؟')) onDeleteWeaning(rec.id);
                              }}
                              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                              title="حذف"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead className="bg-gray-900 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-8 py-4">بيانات الخيل</th>
                  <th className="px-8 py-4">الكتيبة الأصلية</th>
                  <th className="px-8 py-4">سبب الاستبعاد</th>
                  <th className="px-8 py-4">تاريخ الاستبعاد</th>
                  <th className="px-8 py-4">ملاحظات</th>
                  <th className="px-8 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-sm font-bold">
                {filteredArchivedHorses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-gray-500">لا توجد خيول مستبعدة حالياً</td>
                  </tr>
                ) : (
                  filteredArchivedHorses.map(horse => {
                    return (
                      <tr key={horse.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="text-white font-black">{horse.name}</span>
                            <span className="text-amber-500 font-bold text-xs font-mono">رقم: {horse.number || '---'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-gray-400">{horse.battalion}</td>
                        <td className="px-8 py-4 text-red-400 font-black">{horse.archiveReason || 'استبعاد'}</td>
                        <td className="px-8 py-4 text-gray-300">{(horse as any).archivedAt || '---'}</td>
                        <td className="px-8 py-4 text-gray-500 italic max-w-xs truncate">{horse.archiveNotes || '-'}</td>
                        <td className="px-8 py-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => setViewingDetail({ type: 'archivedHorse', record: horse })}
                              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="عرض التفاصيل والملف الطبي"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            {onUnarchiveHorse && (
                              <button 
                                onClick={() => {
                                  if(window.confirm(`هل أنت متأكد من إرجاع الحصان "${horse.name}" إلى الخدمة النشطة وقوة الكتايب؟`)) {
                                    onUnarchiveHorse(horse.id);
                                  }
                                }}
                                className="px-3 py-1 bg-green-600/20 hover:bg-green-600 text-green-300 hover:text-white rounded-lg transition-all text-xs border border-green-500/20 font-black"
                                title="إعادة لقوة الكتايب"
                              >
                                إعادة للقوة
                              </button>
                            )}
                            {onDeleteArchivedHorse && (
                              <button 
                                onClick={() => {
                                  if(window.confirm(`تنبيه: سيتم حذف الحصان "${horse.name}" وسجلاته نهائياً من النظام ولا يمكن التراجع. هل تريد الاستمرار؟`)) {
                                    onDeleteArchivedHorse(horse.id);
                                  }
                                }}
                                className="p-2 text-gray-550 hover:text-red-500 transition-colors"
                                title="حذف نهائي"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {viewingDetail && (
        <ArchiveDetailModal 
          type={viewingDetail.type}
          record={viewingDetail.record}
          horses={horses}
          clinicLog={clinicLog}
          onClose={() => setViewingDetail(null)}
        />
      )}
    </div>
  );
};

// --- Archive Detail Modal ---
const ArchiveDetailModal: React.FC<{
  type: 'birth' | 'weaning' | 'archivedHorse';
  record: any;
  horses: Horse[];
  clinicLog: MedicalRecordEntry[];
  onClose: () => void;
}> = ({ type, record, horses, clinicLog, onClose }) => {
  // Locate related horses
  const mare = type !== 'archivedHorse' 
    ? horses.find(h => h.id === record.mareId || h.name === record.mareName)
    : null;

  const foal = type !== 'archivedHorse'
    ? (record.foalId ? horses.find(h => h.id === record.foalId) : horses.find(h => h.name === record.foalName && h.motherName === record.mareName))
    : null;

  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return '---';
    try {
      const birthDate = new Date(birthDateStr);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
      }
      if (years === 0) {
        return `${months} شهر`;
      }
      return `${years} سنة و ${months} شهر`;
    } catch {
      return '---';
    }
  };

  // If archived horse
  const horse = type === 'archivedHorse' ? (record as Horse) : null;
  const horseClinicHistory = useMemo(() => {
    if (!horse) return [];
    return clinicLog
      .filter(entry => entry.horseId === horse.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [clinicLog, horse]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[100] p-4 text-right">
      <div className="bg-gray-900 rounded-[2rem] border border-gray-800 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-l from-indigo-950/30 to-gray-900 flex items-center justify-between px-8 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-4 animate-in slide-in-from-right-3">
            <div className={`p-3 rounded-2xl border shadow-lg ${
              type === 'birth' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
              type === 'weaning' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
              'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5m-3 0V18a2.25 2.25 0 002.25 2.25" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {type === 'birth' && 'تفاصيل سجل الولادة الأرشيـفي'}
                {type === 'weaning' && 'تفاصيل سجل الفطام الأرشيـفي'}
                {type === 'archivedHorse' && `ملف الخيل المستبعد: ${horse?.name}`}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                {type === 'birth' && `مهر: ${record.foalName} | الكتيبة: ${record.battalion}`}
                {type === 'weaning' && `مهر: ${record.foalName} | الكتيبة: ${record.battalion}`}
                {type === 'archivedHorse' && `رقم: ${horse?.number || '---'} | الكتيبة الأصلية: ${horse?.battalion}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/5">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

          {/* SECTION 1: Details grid based on type */}
          {type === 'birth' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-950/40 p-6 rounded-2xl border border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-amber-500 mb-4 border-b border-amber-500/10 pb-2">سجل الولادة</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">اسم الفرس الأم:</span><span className="text-white font-bold">{record.mareName}</span></div>
                    {record.mareNumber && <div className="flex justify-between"><span className="text-gray-400">رقم الفرس الأم:</span><span className="text-white font-mono font-bold">{record.mareNumber}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-400">اسم المهر المولود:</span><span className="text-amber-500 font-bold">{record.foalName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">تاريخ الولادة:</span><span className="text-white font-bold">{record.birthDate}</span></div>
                    {record.conceptionDate && <div className="flex justify-between"><span className="text-gray-400">تاريخ التلقيح/الحمل:</span><span className="text-white font-bold">{record.conceptionDate}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-400">الكتيبة:</span><span className="text-white font-bold">{record.battalion}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">ملاحظات الولادة:</span><span className="text-gray-300 font-bold">{record.notes || 'لا يوجد'}</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-4 border-b border-gray-800 pb-2">بيانات الأم والوليد الحالية</h3>
                  <div className="space-y-4">
                    {/* Mare current details */}
                    {mare ? (
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-800/80 text-xs space-y-2 text-right">
                        <p className="font-bold text-gray-300 flex items-center gap-1.5 justify-end"><span className="inline-block w-2.5 h-2.5 bg-pink-500 rounded-full"></span> ملف الأم بالمنظومة ({mare.name})</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-450">
                          <div>الرسن: <span className="text-white font-bold">{mare.rasan || 'غير محدد'}</span></div>
                          <div>السلالة: <span className="text-white font-bold">{mare.breed || 'غير محدد'}</span></div>
                          <div>اللون: <span className="text-white font-bold">{mare.color || 'غير محدد'}</span></div>
                          <div>الحالة: <span className="text-green-400 font-mono font-bold">{mare.status === 'healthy' ? 'سليم' : 'متابعة'}</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic bg-gray-900/20 p-3 rounded-xl border border-gray-800/50">ملف الفرس الأم غير موجود حالياً في قوة الكتايب (ربما حذفت)</div>
                    )}

                    {/* Foal current details */}
                    {foal ? (
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-800/80 text-xs space-y-2 text-right">
                        <p className="font-bold text-gray-300 flex items-center gap-1.5 justify-end"><span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-full"></span> ملف المهر الحالي ({foal.name})</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-450">
                          <div>الرقم: <span className="text-white font-mono font-bold">{foal.number || '---'}</span></div>
                          <div>الجنس: <span className="text-white font-bold">{foal.gender}</span></div>
                          <div>الرسن: <span className="text-white font-bold">{foal.rasan || 'غير محدد'}</span></div>
                          <div>العمر الحالي: <span className="text-amber-400 font-bold">{calculateAge(foal.dateOfBirth)}</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic bg-gray-900/20 p-3 rounded-xl border border-gray-800/50">المهر لم يسجل بعد خيلاً مستقلاً بقوة الكتايب أو تم حذفه</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === 'weaning' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-950/40 p-6 rounded-2xl border border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-blue-500 mb-4 border-b border-blue-500/10 pb-2">سجل الفطام</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">اسم الفرس الأم:</span><span className="text-white font-bold">{record.mareName}</span></div>
                    {record.mareNumber && <div className="flex justify-between"><span className="text-gray-400">رقم الفرس الأم:</span><span className="text-white font-mono font-bold">{record.mareNumber}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-400">اسم المهر/الفصيل المفطوم:</span><span className="text-blue-500 font-bold">{record.foalName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">تاريخ الفطام:</span><span className="text-white font-bold">{record.weaningDate}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">تاريخ بدء الرضاعة:</span><span className="text-white font-bold">{record.lactationStartDate || 'غير محدد'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">الكتيبة:</span><span className="text-white font-bold">{record.battalion}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">ملاحظات الفطام:</span><span className="text-gray-300 font-bold">{record.notes || 'لا يوجد'}</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-4 border-b border-gray-800 pb-2">بيانات الأم والفصيل الحالية</h3>
                  <div className="space-y-4">
                    {/* Mare current details */}
                    {mare ? (
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-800/80 text-xs space-y-2 text-right">
                        <p className="font-bold text-gray-300 flex items-center gap-1.5 justify-end"><span className="inline-block w-2.5 h-2.5 bg-pink-500 rounded-full"></span> ملف الأم بالمنظومة ({mare.name})</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-450">
                          <div>الرسن: <span className="text-white font-bold">{mare.rasan || 'غير محدد'}</span></div>
                          <div>السلالة: <span className="text-white font-bold">{mare.breed || 'غير محدد'}</span></div>
                          <div>اللون: <span className="text-white font-bold">{mare.color || 'غير محدد'}</span></div>
                          <div>الحالة: <span className="text-green-400 font-mono font-bold">{mare.status === 'healthy' ? 'سليم' : 'متابعة'}</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic bg-gray-900/20 p-3 rounded-xl border border-gray-800/50">ملف الفرس الأم غير موجود حالياً في قوة الكتايب</div>
                    )}

                    {/* Foal/Weaner current details */}
                    {foal ? (
                      <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-800/80 text-xs space-y-2 text-right">
                        <p className="font-bold text-gray-300 flex items-center gap-1.5 justify-end"><span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full"></span> ملف الفطيم الحالي بقوة الكتايب ({foal.name})</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-450">
                          <div>الرقم: <span className="text-white font-mono font-bold">{foal.number || '---'}</span></div>
                          <div>الجنس: <span className="text-white font-bold">{foal.gender}</span></div>
                          <div>الرسن: <span className="text-white font-bold">{foal.rasan || 'غير محدد'}</span></div>
                          <div>العمر الحالي: <span className="text-blue-400 font-bold">{calculateAge(foal.dateOfBirth)}</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic bg-gray-900/20 p-3 rounded-xl border border-gray-800/50">الفصيل لم يسجل بعد كخيل مستقر أو تم حذفه</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === 'archivedHorse' && horse && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Highlight exclusion card */}
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
                <h3 className="text-red-400 font-extrabold text-base mb-3 flex items-center gap-2 justify-end">
                  <span>بيانات الاستبعاد والأرشفة والسبب الفعلي</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm font-bold text-right">
                  <div>
                    <span className="text-gray-400 text-xs block mb-1">سبب الاستبعاد الفعلي:</span>
                    <span className="text-white text-base font-extrabold">{horse.archiveReason || 'غير محدد'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block mb-1">تاريخ الاستبعاد:</span>
                    <span className="text-amber-500 text-base font-extrabold">{(horse as any).archivedAt || 'غير محدد'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block mb-1">ملاحظات الاستبعاد الإضافية:</span>
                    <span className="text-gray-300 text-sm font-semibold italic">{horse.archiveNotes || 'لا توجد ملاحظات'}</span>
                  </div>
                </div>
              </div>

              {/* Basic and core details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-950/40 p-6 rounded-2xl border border-gray-800 text-right">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-4 border-b border-gray-800 pb-2">بيانات الخيل الأساسية</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">الاسم:</span><span className="text-white font-extrabold">{horse.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">الرقم المعتمد:</span><span className="text-amber-500 font-mono font-extrabold">{horse.number || '---'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">الرسن الحالي:</span><span className="text-white font-extrabold">{horse.rasan || 'غير محدد'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">رقم الشريحة (Microchip):</span><span className="text-white font-mono">{horse.microchipNumber || '---'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">الجنس:</span><span className="text-white">{horse.gender}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">السلالة:</span><span className="text-white">{horse.breed}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">اللون:</span><span className="text-white">{horse.color}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">الكتيبة الأصلية:</span><span className="text-white">{horse.battalion}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">تاريخ الميلاد:</span><span className="text-white">{horse.dateOfBirth}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">العمر الحالي لولا الاستبعاد:</span><span className="text-amber-400">{calculateAge(horse.dateOfBirth)}</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-4 border-b border-gray-800 pb-2">شجرة النسب والحالة الطبية</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-800/80 text-xs space-y-2">
                      <p className="font-bold text-gray-300">النسب والأبوين:</p>
                      <div className="grid grid-cols-2 gap-2 text-gray-400">
                        <div>الأب: <span className="text-white font-bold">{horse.fatherName || 'غير مسجل'}</span></div>
                        <div>الأم: <span className="text-white font-bold">{horse.motherName || 'غير مسجل'}</span></div>
                      </div>
                    </div>

                    <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800/80 text-xs space-y-2">
                      <p className="font-bold text-gray-300 mb-1">السجل المرضي المستبعد (دفتر العيادة الدائم):</p>
                      {horseClinicHistory.length === 0 ? (
                        <p className="text-gray-500 italic text-right mt-2">لا توجد حالات مسجلة له في سجل العيادة الدائم.</p>
                      ) : (
                        <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                          {horseClinicHistory.map((item) => (
                            <div key={item.id} className="border-r-2 border-amber-500/50 bg-gray-950/50 p-2 text-right">
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-amber-500 font-bold">{item.date}</span>
                                <span className="text-gray-400 text-[10px]">{item.status === 'recovered' ? 'شفي' : 'متابعة'}</span>
                              </div>
                              <p className="font-bold text-gray-200 text-xs">{item.diagnosis}</p>
                              {item.treatment && <p className="text-gray-400 text-[10px] mt-0.5">العلاج: {item.treatment}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="h-20 bg-gray-950 border-t border-gray-800 flex items-center justify-end px-8 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-800 text-gray-300 font-bold rounded-xl hover:bg-gray-700 transition-colors text-sm">
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};

export default DataArchivingPage;
