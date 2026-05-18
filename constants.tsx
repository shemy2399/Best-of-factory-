
import React from 'react';
import { Page } from './types';
import { DashboardIcon, HorseIcon, ClinicIcon, VaccinationIcon, RemindersIcon, PharmacyIcon, ProtocolsIcon, ReportsIcon, FeedingIcon, MedicalRecordsIcon, ManagementIcon, BreedingIcon, UsersIcon } from './components/icons';

// Simple fallback for Nursing Icon since we are not changing icons.tsx
const NursingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582" />
    </svg>
);

export interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

export interface NavItemGroup {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

export const NAV_STRUCTURE: (NavItem | NavItemGroup)[] = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    icon: <DashboardIcon />,
  },
  {
    id: 'horses',
    label: 'سجلات الخيول',
    icon: <HorseIcon />,
  },
  {
    title: 'السجلات الطبية',
    icon: <MedicalRecordsIcon />,
    items: [
      {
        id: 'clinic',
        label: 'دفتر العيادة',
        icon: <ClinicIcon />,
      },
      {
        id: 'vaccinations',
        label: 'التحصينات والتجريعات',
        icon: <VaccinationIcon />,
      },
      {
        id: 'pharmacy',
        label: 'الصيدلية',
        icon: <PharmacyIcon />,
      },
    ]
  },
  {
    title: 'الإدارة والمتابعة',
    icon: <ManagementIcon />,
    items: [
       {
        id: 'reminders',
        label: 'المتابعات والتذكيرات',
        icon: <RemindersIcon />,
      },
      {
        id: 'feeding',
        label: 'نظام العلائق',
        icon: <FeedingIcon />,
      },
       {
        id: 'breeding',
        label: 'الأفراس العشار',
        icon: <BreedingIcon />,
      },
      {
        id: 'nursing',
        label: 'الأفراس المرضعة',
        icon: <NursingIcon />,
      },
      {
        id: 'breedingReminders',
        label: 'التشبيه',
        icon: <BreedingIcon />,
      },
      {
        id: 'dataArchiving',
        label: 'حفظ البيانات',
        icon: <ManagementIcon />,
      },
    ]
  },
  {
    id: 'protocols',
    label: 'بروتوكولات العلاج',
    icon: <ProtocolsIcon />,
  },
  {
    id: 'reports',
    label: 'التقارير والإحصائيات',
    icon: <ReportsIcon />,
  },
  {
    id: 'admins',
    label: 'إدارة المستخدمين',
    icon: <UsersIcon />,
  },
];

// Flattened list for easier lookup
export const NAV_ITEMS: NavItem[] = NAV_STRUCTURE.flatMap(item => 'items' in item ? item.items : [item]);
