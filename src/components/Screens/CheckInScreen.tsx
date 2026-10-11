import React, { useState } from 'react';
import { KeyRound, Copy, Check, Car, Zap, ShieldAlert, MessageSquare } from 'lucide-react';
import { PropertyData } from '../../types';
import { ScreenHeader } from './ScreenHeader';

interface CheckInScreenProps {
  property: PropertyData;
  onBack: () => void;
  onAskAI: (prompt: string) => void;
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({
  property,
  onBack,
  onAskAI,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(property.checkIn.accessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto animate-screen-in pb-32">
      <ScreenHeader
        title="Getting Inside"
        subtitle={`${property.name} · Check-in Guide`}
        onBack={onBack}
      />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Keypad Code Highlight Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#2A4436]/20 shadow-soft-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#2A4436] uppercase tracking-wider">Keypad Access Code</span>
            <div className="text-2xl font-extrabold text-[#1C1B18] font-mono tracking-wider mt-1 select-all">
              {property.checkIn.accessCode}
            </div>
            <span className="text-xs text-[#78756E] mt-0.5 block">{property.checkIn.lockType}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Door Photo */}
        {property.doorImage && (
          <div className="rounded-2xl overflow-hidden shadow-soft-sm border border-black/5">
            <img
              src={property.doorImage}
              alt="Door entry view"
              className="w-full h-44 object-cover"
            />
          </div>
        )}

        {/* Step-by-Step Entry Guide */}
        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-sm space-y-3">
          <h3 className="text-xs font-bold text-[#1C1B18] uppercase tracking-wider">How to unlock the door</h3>
          <div className="space-y-2 text-xs text-[#3D3B36]">
            {property.checkIn.doorInstructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#EBF2EC] text-[#2A4436] font-bold text-[11px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Parking & EV Charging */}
        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-sm space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <Car className="w-4 h-4 text-[#2A4436] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#1C1B18] block">Parking Instructions:</span>
              <p className="text-[#5C5A55] leading-relaxed mt-0.5">{property.checkIn.parkingInfo}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-2 border-t border-black/5">
            <Zap className="w-4 h-4 text-[#2A4436] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#1C1B18] block">EV Charger:</span>
              <p className="text-[#5C5A55] leading-relaxed mt-0.5">{property.checkIn.evCharger}</p>
            </div>
          </div>
        </div>

        {/* Emergency Backup Keybox */}
        <div className="p-3.5 rounded-2xl bg-white border border-black/5 shadow-soft-sm flex items-start gap-2.5 text-xs">
          <ShieldAlert className="w-4 h-4 text-[#9E5A3F] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#1C1B18] block">Physical Keybox Backup:</span>
            <p className="text-[#78756E] mt-0.5">{property.checkIn.emergencyKeybox}</p>
          </div>
        </div>

        {/* Ask Assistant button */}
        <button
          onClick={() => onAskAI("The door lock is not opening or keypad is unresponsive. What should I do?")}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#2A4436] border border-black/5 shadow-soft-sm transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Need lock help? Ask Assistant</span>
        </button>
      </div>
    </div>
  );
};
