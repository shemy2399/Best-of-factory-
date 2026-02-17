
// types.ts

export type Page = 'dashboard' | 'horses' | 'clinic' | 'vaccinations' | 'pharmacy' | 'feeding' | 'reports' | 'reminders' | 'protocols' | 'breeding' | 'nursing' | 'admins';

export interface ProtectedPageAccess {
  pageId: Page;
  accessCode: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  createdAt: string;
  assignedBattalion?: 'الكتيبة الاولى' | 'الكتيبة الثانية' | 'الكتيبة الثالثة' | 'نادي الفروسية' | 'الكل';
  protectedPages?: ProtectedPageAccess[]; // قائمة بالصفحات المحمية مع رموزها الخاصة
}

export interface Medication {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  battalion: 'الكتيبة الاولى' | 'الكتيبة الثانية' | 'الكتيبة الثالثة' | 'نادي الفروسية';
  createdAt: string;
}

export interface MedicalRecordEntry {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  status: 'healthy' | 'monitoring' | 'recovered';
  recoveryDate?: string;
  followUpDate?: string;
  followUpNotes?: string;
}

export interface Vaccination {
  id: string;
  horseId: string;
  horseName: string;
  type: 'vaccination' | 'deworming';
  productName: string;
  date: string;
  createdAt: string;
  nextDueDate?: string;
}

export interface Horse {
  id: string;
  number: string;
  name: string;
  rasan: string;
  microchipNumber?: string;
  gender: 'ذكر' | 'انثى' | 'مهر ذكر' | 'مهرة انثى';
  dateOfBirth: string;
  breed: string;
  color: string;
  battalion: 'الكتيبة الاولى' | 'الكتيبة الثانية' | 'الكتيبة الثالثة' | 'نادي الفروسية';
  status: 'healthy' | 'monitoring';
  medicalHistory: MedicalRecordEntry[];
  createdAt: string;
  pregnancy?: {
    conceptionDate: string;
    expectedDueDate: string;
    notes?: string;
  };
  lactation?: {
    foalId: string;
    foalName: string;
    startDate: string;
    expectedWeaningDate: string;
    notes?: string;
  };
}

export interface FeedingScheduleEntry {
  id:string;
  battalion: Horse['battalion'];
  category: string;
  time: string;
  feedDetails: string;
}

export interface TreatmentProtocol {
  id: string;
  diagnosisName: string;
  treatmentTemplate: string;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'horse' | 'clinic' | 'pharmacy' | 'vaccination' | 'system';
  createdAt: string;
  createdBy: string;
}

// أرشيف الإحصائيات الشهرية
export interface MonthlyArchive {
  id: string;
  monthLabel: string; // مثال: "أكتوبر 2023"
  battalion: string;
  diagnoses: { name: string, count: number }[];
  totalCases: number;
  createdAt: string;
}
