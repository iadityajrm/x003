import React from 'react';
import { MoreHorizontal, Building2, Phone, ArrowLeft } from 'lucide-react';
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
  return (
    <header className="sticky top-0 z-30 w-full max-w-md mx-auto px-5 py-3.5 bg-[#F6F4F0]/90 backdrop-blur-md safe-top flex items-center justify-between transition-all">
      {/* Left: Property Identity & Navigation */}
      <button 
        onClick={onResetToHome}
        className="flex items-center gap-2.5 text-left group focus:outline-none"
        title="Tap to return to property dashboard"
      >
        {isChatMode && (
          <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-[#2A4436] group-hover:bg-[#2A4436] group-hover:text-white transition-all -ml-1">
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[17px] tracking-tight text-[#1C1B18] group-hover:text-[#2A4436] transition-colors leading-tight">
              {property.name}
            </span>
          </div>
          <span className="text-xs text-[#78756E] font-normal leading-tight mt-0.5">
            {isChatMode ? 'Guest assistant · Active chat' : 'Guest assistant'}
          </span>
        </div>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Overflow Menu Button matching screenshot */}
        <button
          onClick={onOpenMenu}
          className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 flex items-center justify-center text-[#3A3833] transition-all"
          title="Open property menu"
          aria-label="Open property menu"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
