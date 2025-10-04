import React from 'react';
import { Page } from './types';
import { DashboardIcon, HorseIcon, ClinicIcon, VaccinationIcon, RemindersIcon, PharmacyIcon, ProtocolsIcon, ReportsIcon, FeedingIcon, MedicalRecordsIcon, ManagementIcon } from './components/icons';

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
    icon: <DashboardIcon className="w-5 h-5 ml-3" />,
  },
  {
    id: 'horses',
    label: 'سجلات الخيول',
    icon: <HorseIcon className="w-5 h-5 ml-3" />,
  },
  {
    title: 'السجلات الطبية',
    icon: <MedicalRecordsIcon className="w-5 h-5 ml-3" />,
    items: [
      {
        id: 'clinic',
        label: 'دفتر العيادة',
        icon: <ClinicIcon className="w-5 h-5 ml-3" />,
      },
      {
        id: 'vaccinations',
        label: 'التحصينات والتجريعات',
        icon: <VaccinationIcon className="w-5 h-5 ml-3" />,
      },
      {
        id: 'pharmacy',
        label: 'الصيدلية',
        icon: <PharmacyIcon className="w-5 h-5 ml-3" />,
      },
    ]
  },
  {
    title: 'الإدارة والمتابعة',
    icon: <ManagementIcon className="w-5 h-5 ml-3" />,
    items: [
       {
        id: 'reminders',
        label: 'المتابعات والتذكيرات',
        icon: <RemindersIcon className="w-5 h-5 ml-3" />,
      },
      {
        id: 'feeding',
        label: 'نظام العلائق',
        icon: <FeedingIcon className="w-5 h-5 ml-3" />,
      },
    ]
  },
  {
    id: 'protocols',
    label: 'بروتوكولات العلاج',
    icon: <ProtocolsIcon className="w-5 h-5 ml-3" />,
  },
  {
    id: 'reports',
    label: 'التقارير والإحصائيات',
    icon: <ReportsIcon className="w-5 h-5 ml-3" />,
  },
];

// Flattened list for easier lookup
export const NAV_ITEMS: NavItem[] = NAV_STRUCTURE.flatMap(item => 'items' in item ? item.items : [item]);