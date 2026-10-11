import React, { useState } from 'react';
import { Phone, PhoneCall, Copy, Check } from 'lucide-react';
import { PropertyData } from '../../types';
import { ScreenHeader } from './ScreenHeader';

interface EmergencyCallScreenProps {
  property: PropertyData;
  onBack: () => void;
}

export const EmergencyCallScreen: React.FC<EmergencyCallScreenProps> = ({
  property,
  onBack,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (number: string, idx: number) => {
    navigator.clipboard.writeText(number);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto animate-screen-in pb-32">
      <ScreenHeader
        title="Emergency & Urgent Help"
        subtitle={`On-call numbers for ${property.name}`}
        onBack={onBack}
      />

      <div className="p-4 sm:p-5 space-y-3.5">
        {property.emergencyContacts.map((contact, idx) => {
          const is911 = contact.number === '911';

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-sm space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#78756E]">
                    {contact.label}
                  </span>
                  <h3 className="font-bold text-sm text-[#1C1B18]">{contact.name}</h3>
                </div>
                <span className="font-mono text-sm font-bold text-[#2A4436]">{contact.number}</span>
              </div>

              <p className="text-xs text-[#5C5A55]">{contact.description}</p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${contact.number.replace(/[^\d+]/g, '')}`}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all text-center ${
                    is911
                      ? 'bg-rose-700 hover:bg-rose-800 text-white'
                      : 'bg-[#2A4436] hover:bg-[#20362B] text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>

                <button
                  onClick={() => handleCopy(contact.number, idx)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#F6F4F0] hover:bg-[#ECE8E1] text-xs font-semibold text-[#1C1B18] border border-black/5 transition-all active:scale-95"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#2A4436]" />
                      <span className="text-[#2A4436]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#78756E]" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
