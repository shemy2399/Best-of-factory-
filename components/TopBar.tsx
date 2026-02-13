
import React, { useState, useRef, useEffect } from 'react';
import { Horse, Page, AppNotification } from '../types';
import { MenuIcon, FullScreenIcon, ExitFullScreenIcon, BellIcon, XMarkIcon, CheckIcon, UserCircleIcon, HorseIcon } from './icons';

interface TopBarProps {
  activePage: Page;
  activePageLabel: string;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  setGlobalBattalionFilter: (battalion: Horse['battalion'] | 'الكل') => void;
  toggleSidebar: () => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  isCloudConnected?: boolean;
  notifications: AppNotification[];
  onDismissNotification: (id: string) => void;
  currentUser: string | null;
  isBattalionRestricted: boolean;
}

const BATTALIONS: (Horse['battalion'] | 'الكل')[] = ['الكل', 'الكتيبة الاولى', 'الكتيبة الثانية', 'الكتيبة الثالثة', 'نادي الفروسية'];

const TopBar: React.FC<TopBarProps> = ({ 
    activePageLabel, 
    globalBattalionFilter, 
    setGlobalBattalionFilter, 
    toggleSidebar, 
    isFullScreen, 
    toggleFullScreen, 
    isCloudConnected = true,
    notifications,
    onDismissNotification,
    currentUser,
    isBattalionRestricted
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setShowNotifications(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-gray-900 p-5 shadow-2xl flex justify-between items-center border-b border-gray-700/50 no-print relative z-50">
      {/* اليمين: الهوية والصفحة */}
      <div className="flex items-center gap-6">
        <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white transition-all transform active:scale-90">
            <MenuIcon className="w-8 h-8" />
        </button>
        <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">{activePageLabel}</h1>
            <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                    {isCloudConnected ? 'Cloud Stream Active' : 'Offline Storage Mode'}
                </span>
            </div>
        </div>
      </div>
      
      {/* اليسار: البروفايل والأدوات */}
      <div className="flex items-center gap-4 md:gap-8">
        
        {/* منتقي الكتائب بتصميم الـ Select الفاخر */}
        <div className={`hidden lg:flex items-center gap-3 bg-gray-800/80 border border-gray-700 rounded-2xl px-5 py-2.5 shadow-2xl transition-all duration-500 ${isBattalionRestricted ? 'opacity-70 grayscale' : 'hover:border-amber-500/50 group'}`}>
            <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                <HorseIcon className="w-4 h-4 text-amber-500 group-hover:scale-125 transition-transform" />
            </div>
            <div className="flex flex-col">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Active Unit</span>
                {isBattalionRestricted ? (
                     <div className="text-xs font-black text-gray-100 p-0 min-w-[120px] cursor-not-allowed flex items-center gap-1">
                         {globalBattalionFilter}
                     </div>
                ) : (
                    <select
                        value={globalBattalionFilter}
                        onChange={(e) => setGlobalBattalionFilter(e.target.value as Horse['battalion'] | 'الكل')}
                        className="bg-transparent border-none text-xs font-black text-gray-100 focus:ring-0 outline-none cursor-pointer p-0 min-w-[120px]"
                    >
                        {BATTALIONS.map(b => <option key={b} value={b} className="bg-gray-900 text-white font-bold">{b}</option>)}
                    </select>
                )}
            </div>
        </div>

        {/* معلومات الضابط */}
        <div className="flex items-center gap-4 bg-gray-800/40 px-5 py-2.5 rounded-2xl border border-amber-500/10 shadow-inner">
            <div className="flex flex-col items-end leading-none">
                <span className="text-[8px] text-amber-500/70 font-black uppercase tracking-widest mb-1">Authenticated Officer</span>
                <span className="text-xs font-black text-white tracking-tight">{currentUser || 'طبيب الخيالة'}</span>
            </div>
            <div className="bg-amber-500 p-1 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <UserCircleIcon className="w-8 h-8 text-gray-900" />
            </div>
        </div>

        {/* الإشعارات والأدوات */}
        <div className="flex items-center gap-2 border-r border-gray-700/50 pr-4 mr-2">
            <div className="relative" ref={notificationRef}>
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-gray-400 hover:text-white p-3 rounded-2xl hover:bg-gray-800 transition-all relative border border-transparent hover:border-gray-700 shadow-xl"
                >
                    <BellIcon className="w-7 h-7" />
                    {notifications.length > 0 && (
                        <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ring-4 ring-gray-900 shadow-2xl animate-bounce">
                            {notifications.length}
                        </span>
                    )}
                </button>

                {showNotifications && (
                    <div className="absolute left-0 mt-6 w-96 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in text-right z-[60]">
                        <div className="p-6 bg-gray-800/40 border-b border-gray-700/50 flex justify-between items-center">
                            <h3 className="font-black text-white text-base tracking-tighter">مركز العمليات والتنبيهات</h3>
                            <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-white bg-gray-700/30 p-2 rounded-xl transition-all">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                <ul className="divide-y divide-gray-800/50">
                                    {notifications.map(n => (
                                        <li key={n.id} className="p-4 hover:bg-gray-800/30 transition-all group border-r-4 border-transparent hover:border-amber-500">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm text-gray-200 leading-snug font-bold">{n.message}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-gray-500 font-black">{new Date(n.createdAt).toLocaleTimeString('ar-EG')}</span>
                                                        <span className="text-[10px] text-gray-600">•</span>
                                                        <span className="text-[8px] font-black text-amber-500/70 uppercase tracking-widest">
                                                            {n.createdBy || 'SYSTEM'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDismissNotification(n.id);
                                                    }}
                                                    className="mt-1 p-2 bg-gray-800 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all border border-gray-700 hover:border-green-500/30 shadow-sm"
                                                    title="تحديد كمقروء (إزالة)"
                                                >
                                                    <CheckIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-20 text-center text-gray-600">
                                    <BellIcon className="w-16 h-16 mx-auto mb-6 opacity-5" />
                                    <p className="font-black tracking-widest text-sm uppercase">No Intelligence Alerts</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <button 
                onClick={toggleFullScreen} 
                className="hidden xs:flex text-gray-400 hover:text-white p-3 rounded-2xl hover:bg-gray-800 transition-all border border-transparent hover:border-gray-700"
                title="Toggle Combat View"
            >
                {isFullScreen ? <ExitFullScreenIcon className="w-7 h-7" /> : <FullScreenIcon className="w-7 h-7" />}
            </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
