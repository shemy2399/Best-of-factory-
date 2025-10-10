import React from 'react';
import { Page } from './types';
import { DashboardIcon, HorseIcon, ClinicIcon, VaccinationIcon, RemindersIcon, PharmacyIcon, ProtocolsIcon, ReportsIcon, FeedingIcon, MedicalRecordsIcon, ManagementIcon, BreedingIcon } from './components/icons';

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
];

// Flattened list for easier lookup
export const NAV_ITEMS: NavItem[] = NAV_STRUCTURE.flatMap(item => 'items' in item ? item.items : [item]);