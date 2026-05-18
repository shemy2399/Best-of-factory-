
import React, { useState, useMemo } from 'react';
import { BirthRecord, WeaningRecord, Horse, MedicalRecordEntry } from '../types';
import { TrashIcon, CheckIcon } from '../components/icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

interface DataArchivingPageProps {
  birthRecords: BirthRecord[];
  weaningRecords: WeaningRecord[];
  horses: Horse[];
  clinicLog: MedicalRecordEntry[];
  onDeleteBirth: (id: string) => Promise<void>;
  onDeleteWeaning: (id: string) => Promise<void>;
  globalBattalionFilter: string;
}

const DataArchivingPage: React.FC<DataArchivingPageProps> = ({ 
  birthRecords, 
  weaningRecords, 
  horses,
  clinicLog,
  onDeleteBirth, 
  onDeleteWeaning, 
  globalBattalionFilter 
}) => {
  const [activeTab, setActiveTab] = useState<'births' | 'weaning'>('births');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

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

  const stats = useMemo(() => ({
    totalBirths: filteredBirths.length,
    totalWeaning: filteredWeaning.length
  }), [filteredBirths, filteredWeaning]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gray-800/40 p-6 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">إجمالي الولادات المؤرشفة</p>
          <p className="text-4xl font-black text-amber-500">{stats.totalBirths}</p>
        </div>
        <div className="bg-gray-800/40 p-6 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">إجمالي الفطام المؤرشف</p>
          <p className="text-4xl font-black text-blue-500">{stats.totalWeaning}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex bg-gray-800/50 p-1.5 rounded-2xl border border-gray-700 w-full md:w-fit">
          <button
            onClick={() => setActiveTab('births')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black transition-all duration-300 ${
              activeTab === 'births' 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            سجلات الولادات
          </button>
          <button
            onClick={() => setActiveTab('weaning')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black transition-all duration-300 ${
              activeTab === 'weaning' 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            سجلات الفطام
          </button>
        </div>

        <div className="relative w-full md:w-96 group">
          <input
            type="text"
            placeholder="بحث باسم الفرس أو المهر..."
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
                          <div className="flex justify-center">
                            <button 
                              onClick={() => {
                                if(window.confirm('هل أنت متأكد من حذف هذا السجل؟')) onDeleteBirth(rec.id);
                              }}
                              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
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
                  <th className="px-8 py-4">اسم الفرس</th>
                  <th className="px-8 py-4">اسم الفصيل</th>
                  <th className="px-8 py-4">تاريخ الفطام</th>
                  <th className="px-8 py-4">الكتيبة</th>
                  <th className="px-8 py-4">ملاحظات</th>
                  <th className="px-8 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-sm font-bold">
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
                          <div className="flex justify-center">
                            <button 
                              onClick={() => {
                                if(window.confirm('هل أنت متأكد من حذف هذا السجل؟')) onDeleteWeaning(rec.id);
                              }}
                              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
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
        )}
      </div>
    </div>
  );
};

export default DataArchivingPage;
