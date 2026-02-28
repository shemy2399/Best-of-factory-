
import React, { useState } from 'react';
import { NAV_STRUCTURE, NavItem, NavItemGroup } from '../constants';
import { Page, Horse, AdminUser } from '../types';
import { KeyIcon, LogoutIcon, FullScreenIcon, ExitFullScreenIcon, ShieldIcon } from './icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  setGlobalBattalionFilter: (battalion: Horse['battalion'] | 'الكل') => void;
  currentUser: AdminUser | null;
}

const NavButton: React.FC<{ item: NavItem, isActive: boolean, onClick: () => void, isSubItem?: boolean, isLocked?: boolean }> = ({ item, isActive, onClick, isSubItem = false, isLocked = false }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-between w-full ${isSubItem ? 'py-2.5 px-3' : 'p-3'} my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-amber-500 text-white shadow-md'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <div className="flex items-center">
            {/* FIX: Cast to ReactElement with SVGProps to allow className property */}
            {React.cloneElement(item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-5 h-5" })}
            <span className={`mr-3 whitespace-nowrap ${isSubItem ? 'text-sm' : 'font-medium'}`}>{item.label}</span>
        </div>
        {isLocked && <KeyIcon className="w-3 h-3 text-red-400 opacity-70" />}
    </button>
);

const GroupButton: React.FC<{ item: NavItemGroup, isOpen: boolean, onClick: () => void }> = ({ item, isOpen, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-between w-full p-3 my-1 font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
    >
        <div className="flex items-center">
            {/* FIX: Cast to ReactElement with SVGProps to allow className property */}
            {React.cloneElement(item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-5 h-5" })}
            <span className="mr-3">{item.title}</span>
        </div>
        <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ 
    activePage, setActivePage, onLogout, isOpen, setIsOpen,
    isFullScreen, toggleFullScreen, globalBattalionFilter, setGlobalBattalionFilter,
    currentUser
}) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };
  
  const BATTALIONS: (Horse['battalion'] | 'الكل')[] = ['الكل', 'الكتيبة الاولى', 'الكتيبة الثانية', 'الكتيبة الثالثة', 'نادي الفروسية'];

  const handleCycleBattalion = () => {
    // If user is restricted to a battalion, do nothing
    if (currentUser?.assignedBattalion && currentUser.assignedBattalion !== 'الكل') return;

    const currentIndex = BATTALIONS.indexOf(globalBattalionFilter);
    const nextIndex = (currentIndex + 1) % BATTALIONS.length;
    setGlobalBattalionFilter(BATTALIONS[nextIndex]);
  };

  const isRestrictedBattalion = currentUser?.assignedBattalion && currentUser.assignedBattalion !== 'الكل';

  const isPageLocked = (pageId: Page) => {
      return currentUser?.protectedPages?.some(p => p.pageId === pageId);
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
                                  <ul className="pl-4 border-r-2 border-gray-700/50 ml-2">
                                      {navItem.items.map(item => (
                                          <li key={item.id}>
                                              <NavButton 
                                                item={item} 
                                                isActive={activePage === item.id} 
                                                onClick={() => setActivePage(item.id)} 
                                                isSubItem={true}
                                                isLocked={isPageLocked(item.id)}
                                              />
                                          </li>
                                      ))}
                                  </ul>
                              )}
                          </li>
                      );
                  } else {
                      return (
                          <li key={navItem.id}>
                              <NavButton 
                                item={navItem} 
                                isActive={activePage === navItem.id} 
                                onClick={() => setActivePage(navItem.id)} 
                                isLocked={isPageLocked(navItem.id)}
                              />
                          </li>
                      );
                  }
              })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700 space-y-2 text-center">
            {/* Display Tools Section */}
            <div className="flex flex-col gap-2 pb-3 mb-2 border-b border-gray-700/50">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-right px-1">أدوات العرض السريع</p>
                <div className="grid grid-cols-2 gap-2">
                     <button
                        onClick={toggleFullScreen}
                        className={`flex items-center justify-center p-2 rounded-lg transition-all border ${isFullScreen ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
                        title={isFullScreen ? "خروج من وضع ملء الشاشة" : "وضع ملء الشاشة"}
                    >
                         {isFullScreen ? <ExitFullScreenIcon className="w-5 h-5" /> : <FullScreenIcon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={handleCycleBattalion}
                        disabled={!!isRestrictedBattalion}
                        className={`flex items-center justify-center p-2 rounded-lg border transition-all relative overflow-hidden group ${isRestrictedBattalion ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
                        title={isRestrictedBattalion ? 'تم تقييد الوصول لهذه الكتيبة' : `تغيير الوحدة (الحالية: ${globalBattalionFilter})`}
                    >
                        {isRestrictedBattalion ? <KeyIcon className="w-4 h-4 text-gray-500" /> : <ShieldIcon className="w-5 h-5" />}
                        {!isRestrictedBattalion && <span className="absolute inset-0 bg-amber-500/10 translate-y-full group-hover:translate-y-0 transition-transform"></span>}
                    </button>
                </div>
                <div className="text-center">
                     <span className="text-[10px] font-mono text-amber-500/80 bg-amber-900/10 px-2 py-0.5 rounded border border-amber-500/10 truncate block w-full">
                         {globalBattalionFilter}
                     </span>
                </div>
            </div>

           <div>
              <p className="text-xs text-gray-500">وزارة الداخلية المصرية</p>
              <p className="text-xs text-gray-500">كلية الشرطة - قطاع الخيالة</p>
              <div className="mt-2 pt-2 border-t border-gray-700/50">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-900/30 text-amber-500 border border-amber-500/20">
                  إصدار ثابت: Shemy 1
                </span>
              </div>
           </div>
           <div className="flex flex-col gap-2 pt-2">
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
