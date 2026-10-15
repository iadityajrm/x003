import React from 'react';
import { ChevronLeft, ArrowLeft } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
  rightAction?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  rightAction,
}) => {
  return (
    <div className="sticky top-0 z-30 w-full bg-[#F6F4F0]/95 dark:bg-[#1A1916]/95 backdrop-blur-md px-4 py-3.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between safe-top transition-colors">
      {/* Left: Native back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[#2A4436] dark:text-[#78A88E] hover:text-[#20362B] dark:hover:text-emerald-300 active:scale-95 transition-all text-sm font-semibold group focus:outline-none -ml-1 py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
        aria-label="Go back"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
        <span>{backLabel}</span>
      </button>

      {/* Center: Title & optional subtitle */}
      <div className="flex flex-col items-center text-center px-2 min-w-0">
        <h1 className="font-bold text-base text-[#1C1B18] dark:text-white truncate leading-tight">
          {title}
        </h1>
        {subtitle && (
          <span className="text-[11px] text-[#78756E] dark:text-neutral-400 truncate leading-tight mt-0.5">
            {subtitle}
          </span>
        )}
      </div>

      {/* Right: Optional contextual action or empty spacer */}
      <div className="flex items-center justify-end min-w-[56px]">
        {rightAction || <div className="w-6" />}
      </div>
    </div>
  );
};
