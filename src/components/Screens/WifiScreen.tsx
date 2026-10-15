import React, { useState } from 'react';
import { Copy, Check, MessageSquare } from 'lucide-react';
import { PropertyData } from '../../types';
import { ScreenHeader } from './ScreenHeader';

interface WifiScreenProps {
  property: PropertyData;
  onBack: () => void;
  onAskAI: (prompt: string) => void;
}

export const WifiScreen: React.FC<WifiScreenProps> = ({
  property,
  onBack,
  onAskAI,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto animate-screen-in pb-32">
      <ScreenHeader
        title="Wi-Fi Network"
        subtitle={property.name}
        onBack={onBack}
      />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Network SSID Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1D1A] border border-black/5 dark:border-white/10 shadow-soft-sm flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-semibold text-[#78756E] dark:text-neutral-400 uppercase tracking-wider">Network Name (SSID)</span>
            <div className="text-base font-bold text-[#1C1B18] dark:text-white font-mono mt-0.5">{property.wifi.network}</div>
          </div>
          <button
            onClick={() => handleCopy(property.wifi.network, 'network')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F6F4F0] dark:bg-white/10 hover:bg-[#ECE8E1] dark:hover:bg-white/15 text-xs font-semibold text-[#2A4436] dark:text-[#78A88E] transition-all active:scale-95 cursor-pointer"
          >
            {copiedField === 'network' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2A4436] dark:text-[#78A88E]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Password Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1D1A] border border-[#2A4436]/20 dark:border-white/10 shadow-soft-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-[#2A4436] dark:text-[#78A88E] uppercase tracking-wider">Password</span>
            <div className="text-base font-bold text-[#1C1B18] dark:text-white font-mono mt-0.5 select-all">{property.wifi.password}</div>
          </div>
          <button
            onClick={() => handleCopy(property.wifi.password, 'password')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-xs font-semibold text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {copiedField === 'password' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Password</span>
              </>
            )}
          </button>
        </div>

        {/* QR Code Connect Visualizer */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1D1A] border border-black/5 dark:border-white/10 shadow-soft-card flex flex-col items-center text-center transition-colors">
          <div className="p-3 rounded-2xl bg-[#F6F4F0] dark:bg-white/10 text-[#1C1B18] dark:text-white mb-3 shadow-inner">
            <svg className="w-32 h-32" viewBox="0 0 100 100" fill="currentColor">
              <rect x="0" y="0" width="30" height="30" rx="4" fill="#2A4436" />
              <rect x="6" y="6" width="18" height="18" rx="2" fill="white" />
              <rect x="10" y="10" width="10" height="10" rx="1" fill="#2A4436" />

              <rect x="70" y="0" width="30" height="30" rx="4" fill="#2A4436" />
              <rect x="76" y="6" width="18" height="18" rx="2" fill="white" />
              <rect x="80" y="10" width="10" height="10" rx="1" fill="#2A4436" />

              <rect x="0" y="70" width="30" height="30" rx="4" fill="#2A4436" />
              <rect x="6" y="76" width="18" height="18" rx="2" fill="white" />
              <rect x="10" y="80" width="10" height="10" rx="1" fill="#2A4436" />

              <rect x="36" y="12" width="8" height="8" fill="#2A4436" />
              <rect x="48" y="18" width="8" height="8" fill="#2A4436" />
              <rect x="38" y="38" width="24" height="24" rx="3" fill="#2A4436" />
              <circle cx="50" cy="50" r="6" fill="white" />

              <rect x="12" y="44" width="12" height="6" fill="#2A4436" />
              <rect x="74" y="44" width="14" height="6" fill="#2A4436" />
              <rect x="42" y="72" width="16" height="8" fill="#2A4436" />
              <rect x="68" y="68" width="12" height="12" fill="#2A4436" />
              <rect x="84" y="84" width="8" height="8" fill="#2A4436" />
            </svg>
          </div>
          <span className="text-sm font-bold text-[#1C1B18] dark:text-white">Scan to Join Wi-Fi Instantly</span>
          <span className="text-xs text-[#78756E] dark:text-neutral-400 mt-0.5">Open your smartphone camera to connect</span>
        </div>

        {/* Ask Assistant Troubleshoot button */}
        <button
          onClick={() => onAskAI("Wi-Fi connection is not connecting. Can you help troubleshoot?")}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-[#1E1D1A] hover:bg-[#FAF8F5] dark:hover:bg-white/5 text-xs font-semibold text-[#2A4436] dark:text-[#78A88E] border border-black/5 dark:border-white/10 shadow-soft-sm transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Having connection issues? Ask Assistant</span>
        </button>
      </div>
    </div>
  );
};
