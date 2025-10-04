import React, { useState } from 'react';
import { NAV_STRUCTURE, NavItem, NavItemGroup } from '../constants';
import { Page } from '../types';
import { KeyIcon, UserCircleIcon, LogoutIcon } from './icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onDeleteAllData: () => void;
  onChangeSecurityCode: () => void;
  onChangeLoginPassword: () => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavButton: React.FC<{ item: NavItem, isActive: boolean, onClick: () => void, isSubItem?: boolean }> = ({ item, isActive, onClick, isSubItem = false }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full ${isSubItem ? 'py-2.5 px-3' : 'p-3'} my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-amber-500 text-white shadow-md'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        {item.icon}
        <span className={`mr-4 ${isSubItem ? 'text-sm' : 'font-medium'}`}>{item.label}</span>
    </button>
);

const GroupButton: React.FC<{ item: NavItemGroup, isOpen: boolean, onClick: () => void }> = ({ item, isOpen, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-between w-full p-3 my-1 font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
    >
        <div className="flex items-center">
            {item.icon}
            <span className="mr-4">{item.title}</span>
        </div>
        <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onDeleteAllData, onChangeSecurityCode, onChangeLoginPassword, onLogout, isOpen, setIsOpen }) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const sidebarClasses = `
    bg-gray-900 text-white flex flex-col shadow-lg no-print
    fixed inset-y-0 right-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    md:relative md:translate-x-0 md:w-64
  `;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      <div id="sidebar" className={sidebarClasses}>
        <div className="p-6 text-center border-b border-gray-700">
          <h1 className="text-4xl font-bold text-amber-400">خياله</h1>
          <p className="text-sm text-gray-400">مساعد طبيب الخيالة</p>
        </div>
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul>
              {NAV_STRUCTURE.map((navItem) => {
                  if ('title' in navItem) {
                      const isGroupOpen = openGroups[navItem.title];
                      return (
                          <li key={navItem.title}>
                             <GroupButton item={navItem} isOpen={isGroupOpen} onClick={() => toggleGroup(navItem.title)} />
                              {isGroupOpen && (
                                  <ul className="pl-4 border-r-2 border-gray-700/50 mr-2">
                                      {navItem.items.map(item => (
                                          <li key={item.id}>
                                              <NavButton item={item} isActive={activePage === item.id} onClick={() => setActivePage(item.id)} isSubItem={true} />
                                          </li>
                                      ))}
                                  </ul>
                              )}
                          </li>
                      );
                  } else {
                      return (
                          <li key={navItem.id}>
                              <NavButton item={navItem} isActive={activePage === navItem.id} onClick={() => setActivePage(navItem.id)} />
                          </li>
                      );
                  }
              })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700 space-y-2 text-center">
           <div>
              <p className="text-xs text-gray-500">وزارة الداخلية المصرية</p>
              <p className="text-xs text-gray-500">كلية الشرطة - قطاع الخيالة</p>
           </div>
           <div className="flex flex-col gap-2">
              <button
                  onClick={onChangeLoginPassword}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-amber-300 bg-amber-900/40 rounded-lg hover:bg-amber-800/60 border border-amber-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500"
                  aria-label="تغيير بيانات الدخول"
              >
                  <UserCircleIcon className="w-4 h-4 ml-2" />
                  تغيير بيانات الدخول
              </button>
              <button
                  onClick={onChangeSecurityCode}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-amber-300 bg-amber-900/40 rounded-lg hover:bg-amber-800/60 border border-amber-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500"
                  aria-label="تغيير رمز الحماية"
              >
                  <KeyIcon className="w-4 h-4 ml-2" />
                  تغيير رمز الحماية
              </button>
              <button
                  onClick={onDeleteAllData}
                  className="w-full px-4 py-2 text-sm font-medium text-red-300 bg-red-900/40 rounded-lg hover:bg-red-800/60 border border-red-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
                  aria-label="حذف جميع بيانات البرنامج"
              >
                  حذف جميع البيانات
              </button>
              <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center mt-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/60 rounded-lg hover:bg-gray-600/80 border border-gray-600/80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500"
                  aria-label="تسجيل الخروج"
              >
                  <LogoutIcon className="w-4 h-4 ml-2" />
                  تسجيل الخروج
              </button>
           </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;