import React from 'react';
import { Horse, Page } from '../types';
import { MenuIcon, FullScreenIcon, ExitFullScreenIcon } from './icons';

interface TopBarProps {
  activePage: Page;
  activePageLabel: string;
  globalBattalionFilter: Horse['battalion'] | 'الكل';
  setGlobalBattalionFilter: (battalion: Horse['battalion'] | 'الكل') => void;
  toggleSidebar: () => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
}

const BATTALIONS: (Horse['battalion'] | 'الكل')[] = ['الكل', 'الكتيبة الاولى', 'الكتيبة الثانية', 'الكتيبة الثالثة', 'نادي الفروسية'];

const TopBar: React.FC<TopBarProps> = ({ activePage, activePageLabel, globalBattalionFilter, setGlobalBattalionFilter, toggleSidebar, isFullScreen, toggleFullScreen }) => {
  return (
    <header className="bg-gray-900 p-4 shadow-md flex justify-between items-center border-b border-gray-700 no-print relative">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden text-gray-300 hover:text-white">
            <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-white">{activePageLabel}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
            <label htmlFor="battalion-filter" className="text-sm font-medium text-gray-400">
            عرض بيانات:
            </label>
            <select
            id="battalion-filter"
            value={globalBattalionFilter}
            onChange={(e) => setGlobalBattalionFilter(e.target.value as Horse['battalion'] | 'الكل')}
            className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-amber-500 focus:border-amber-500"
            aria-label="فلتر الكتيبة الشامل"
            >
            {BATTALIONS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
        </div>

        {/* Shemy Watermark - visible only on dashboard */}
        {activePage === 'dashboard' && (
          <div className="pointer-events-none">
             <div className="w-9 h-9 flex items-center justify-center rounded-full border border-dashed border-amber-500/30 transform rotate-12">
                  <span className="font-serif italic text-xs text-amber-500/40">
                      shemy
                  </span>
              </div>
          </div>
        )}

        <button onClick={toggleFullScreen} className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-700">
            {isFullScreen ? <ExitFullScreenIcon className="w-5 h-5" /> : <FullScreenIcon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export default TopBar;