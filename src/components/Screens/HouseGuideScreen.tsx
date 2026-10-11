import React from 'react';
import { BookOpen, MessageSquare } from 'lucide-react';
import { PropertyData } from '../../types';
import { ScreenHeader } from './ScreenHeader';

interface HouseGuideScreenProps {
  property: PropertyData;
  onBack: () => void;
  onAskAI: (prompt: string) => void;
}

export const HouseGuideScreen: React.FC<HouseGuideScreenProps> = ({
  property,
  onBack,
  onAskAI,
}) => {
  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto animate-screen-in pb-32">
      <ScreenHeader
        title="House Guide"
        subtitle={`${property.name} Instructions`}
        onBack={onBack}
      />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Single Long Text Widget */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/5 shadow-soft-card text-[#1C1B18] space-y-4 leading-relaxed">
          <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
            <div className="w-10 h-10 rounded-full bg-[#F7EBE4] text-[#9E5A3F] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1C1B18]">Property Manual</h2>
              <p className="text-xs text-[#78756E]">Complete amenities & house guidelines</p>
            </div>
          </div>

          {/* Formatted Guide Text */}
          <div className="text-xs sm:text-sm text-[#3D3B36] whitespace-pre-line font-sans leading-relaxed space-y-3">
            {property.houseGuideText}
          </div>
        </div>

        {/* Ask Assistant Troubleshoot Prompt */}
        <button
          onClick={() => onAskAI(`How does the heating and hot tub work at ${property.name}?`)}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#2A4436] border border-black/5 shadow-soft-sm transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Have questions about an appliance? Ask Assistant</span>
        </button>
      </div>
    </div>
  );
};
