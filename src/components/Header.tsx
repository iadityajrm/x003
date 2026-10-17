import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Building2, Phone, ArrowLeft, Sun, Moon } from 'lucide-react';
import { PropertyData } from '../types';

interface HeaderProps {
  property: PropertyData;
  onOpenCall: () => void;
  onOpenMenu: () => void;
  onOpenPropertySwitcher: () => void;
  onResetToHome?: () => void;
  isChatMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  property,
  onOpenCall,
  onOpenMenu,
  onOpenPropertySwitcher,
  onResetToHome,
  isChatMode,
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dwellio_guest_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dwellio_guest_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dwellio_guest_theme', 'light');
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isDark: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isDark === 'boolean') {
        setIsDark(customEvent.detail.isDark);
      }
    };
    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, [isDark]);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { isDark: nextDark } }));
  };

  return (
    <header className="sticky top-0 z-30 w-full max-w-md mx-auto px-5 py-3.5 bg-[#F5F5F7]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md safe-top flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] transition-colors">
      {/* Left: Property Identity & Navigation */}
      <button 
        onClick={onResetToHome}
        className="flex items-center gap-2.5 text-left group focus:outline-none"
        title={isChatMode ? "Back to property home" : "Property dashboard"}
      >
        {isChatMode && (
          <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#1D1D1F] dark:text-white group-hover:bg-[#1D1D1F] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all -ml-1">
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[18px] sm:text-[19px] tracking-tight text-[#1D1D1F] dark:text-white group-hover:text-[#636366] dark:group-hover:text-[#A1A1A6] transition-colors leading-tight">
              Relay
            </span>
          </div>
          <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] font-medium leading-tight mt-0.5">
            {isChatMode ? `${property.name} · Active chat` : property.name}
          </span>
        </div>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 flex items-center justify-center text-[#1D1D1F] dark:text-neutral-200 transition-all cursor-pointer"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-white stroke-[2.2]" />
          ) : (
            <Moon className="w-4 h-4 text-[#1D1D1F] stroke-[2.2]" />
          )}
        </button>

        {/* Overflow Menu Button */}
        <button
          onClick={onOpenMenu}
          className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 flex items-center justify-center text-[#1D1D1F] dark:text-neutral-200 transition-all cursor-pointer"
          title="Open property menu"
          aria-label="Open property menu"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
