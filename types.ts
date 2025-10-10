// types.ts

export type Page = 'dashboard' | 'horses' | 'clinic' | 'vaccinations' | 'pharmacy' | 'feeding' | 'reports' | 'reminders' | 'protocols' | 'breeding';

// يمثل كل دواء في الصيدلية
export interface Medication {
  id: string;
  name: string;
  quantity: number; // الكمية المتبقية
  unit: string;
  expiryDate: string;
  battalion: 'الكتيبة الاولى' | 'الكتيبة الثانية' | 'الكتيبة الثالثة' | 'نادي الفروسية';
  createdAt: string;
}

// يمثل إدخالاً واحداً في السجل الطبي للحصان (زيارة للعيادة)
export interface MedicalRecordEntry {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  status: 'healthy' | 'monitoring' | 'sick' | 'recovered';
  recoveryDate?: string;
  followUpDate?: string; // For the new reminders system
  followUpNotes?: string; // For the new reminders system
}

// يمثل سجل تحصين أو تجريع
export interface Vaccination {
  id: string;
  horseId: string;
  horseName: string;
  type: 'vaccination' | 'deworming'; // النوع
  productName: string; // اسم المنتج
  date: string;
  createdAt: string;
  nextDueDate?: string; // تاريخ الموعد القادم
}

// يمثل الملف الكامل للحصان
export interface Horse {
  id: string;
  number: string; // رقم الحصان
  name: string;
  dateOfBirth: string;
  breed: string; // النوع أو السلالة
  color: string;
  battalion: 'الكتيبة الاولى' | 'الكتيبة الثانية' | 'الكتيبة الثالثة' | 'نادي الفروسية';
  status: 'healthy' | 'monitoring' | 'sick';
  medicalHistory: MedicalRecordEntry[];
  createdAt: string;
  pregnancy?: {
    conceptionDate: string;
    expectedDueDate: string;
    notes?: string;
  };
}

// يمثل إدخالاً واحداً في جدول التغذية
export interface FeedingScheduleEntry {
  id:string;
  battalion: Horse['battalion'];
  category: string; // Changed: Schedule is now a user-defined string category
  time: string;
  feedDetails: string;
}

// يمثل قالب علاج جاهز
export interface TreatmentProtocol {
  id: string;
  diagnosisName: string;
  treatmentTemplate: string;
}