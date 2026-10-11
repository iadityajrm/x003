import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Wifi, 
  Home, 
  MapPin, 
  MessageSquare, 
  ArrowRight,
  Gamepad2,
  CheckCircle2,
  LogOut,
  LogIn,
  AlertCircle,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { PropertyData, GuestStayStatus } from '../types';
import { getStayStatus, setStayStatus } from '../utils/stayState';

interface HomeHeroProps {
  property: PropertyData;
  onOpenQuickModal: (modal: 'wifi' | 'checkin' | 'guide' | 'host' | 'recommendations' | 'play') => void;
  onStartChatWithPrompt: (promptText: string) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  property,
  onOpenQuickModal,
  onStartChatWithPrompt,
}) => {
  // Stay Status State synced with localStorage & host dashboard
  const [stayStatus, setLocalStayStatus] = useState<GuestStayStatus>(() => getStayStatus(property.slug));
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    targetStatus: GuestStayStatus;
    title: string;
    message: string;
  }>({
    isOpen: false,
    targetStatus: 'checked_in',
    title: '',
    message: '',
  });

  useEffect(() => {
    setLocalStayStatus(getStayStatus(property.slug));
    const handleStatusChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ slug: string; status: GuestStayStatus }>;
      if (customEvent.detail && customEvent.detail.slug === property.slug) {
        setLocalStayStatus(customEvent.detail.status);
      }
    };
    window.addEventListener('stay-status-change', handleStatusChange);
    return () => window.removeEventListener('stay-status-change', handleStatusChange);
  }, [property.slug]);

  const handleRequestCheckIn = () => {
    setConfirmDialog({
      isOpen: true,
      targetStatus: 'checked_in',
      title: 'Confirm Check-In',
      message: `The host (${property.host.name}) will be notified that you have arrived and checked into ${property.name}.`,
    });
  };

  const handleRequestCheckOut = () => {
    setConfirmDialog({
      isOpen: true,
      targetStatus: 'checked_out',
      title: 'Confirm Check-Out',
      message: `The host (${property.host.name}) and housekeeping team will be notified that you have checked out of ${property.name}.`,
    });
  };

  const handleConfirmStateChange = () => {
    setStayStatus(property.slug, confirmDialog.targetStatus);
    setLocalStayStatus(confirmDialog.targetStatus);
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Determine dynamic greeting based on current local hour
  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour >= 5 && currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good afternoon';
  }

  return (
    <div className="relative flex flex-col w-full max-w-md mx-auto px-5 pt-3 pb-32 z-10 space-y-3.5 sm:space-y-4">
      {/* Editorial Headline & Subtitle matching reference */}
      <div className="pt-2 pb-1 text-left">
        <h1 className="font-serif text-[38px] sm:text-[42px] font-bold text-[#1C1B18] tracking-tight leading-[1.1]">
          {greeting}
        </h1>
        <p className="text-[15px] text-[#5C5A55] font-normal mt-1 leading-snug">
          Your stay, made easy.
        </p>
      </div>

      {/* Guest Stay Status Banner & Quick Action (Check In / Check Out) */}
      <div className="bg-white rounded-[24px] p-4 shadow-soft-card border border-black/[0.03] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            stayStatus === 'checked_in'
              ? 'bg-[#EBF2EC] text-[#2A4436]'
              : stayStatus === 'checked_out'
              ? 'bg-[#F4EFE6] text-[#7A684D]'
              : 'bg-[#F6F4F0] text-[#5C5A55]'
          }`}>
            {stayStatus === 'checked_in' ? (
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            ) : stayStatus === 'checked_out' ? (
              <LogOut className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <LogIn className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#78756E] uppercase tracking-wider block">Stay Status</span>
            <div className="text-sm font-bold text-[#1C1B18] capitalize">
              {stayStatus === 'checked_in' ? 'Checked In' : stayStatus === 'checked_out' ? 'Checked Out' : 'Not Checked In'}
            </div>
          </div>
        </div>

        <div>
          {stayStatus === 'not_checked_in' && (
            <button
              onClick={handleRequestCheckIn}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Check In</span>
            </button>
          )}

          {stayStatus === 'checked_in' && (
            <button
              onClick={handleRequestCheckOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9E5A3F] hover:bg-[#864A32] text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Check Out</span>
            </button>
          )}

          {stayStatus === 'checked_out' && (
            <button
              onClick={handleRequestCheckIn}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[#5C5A55] text-xs font-semibold transition-colors"
            >
              <span>Re-Check In</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Featured Hero Widget: Getting inside */}
      <div className="bg-white rounded-[26px] p-4 sm:p-5 shadow-soft-card border border-black/[0.03] flex items-center justify-between gap-3 sm:gap-4 transition-all hover:shadow-soft-lg">
        {/* Left Column */}
        <div className="flex-1 flex flex-col justify-between min-h-[135px]">
          <div>
            <div className="w-11 h-11 rounded-full bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center mb-2.5">
              <KeyRound className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 className="font-bold text-base sm:text-lg text-[#1C1B18] leading-tight">
              Getting inside
            </h2>
            <p className="text-xs sm:text-sm text-[#78756E] mt-0.5">
              Keypad code: <strong className="text-[#1C1B18] font-mono">{property.checkIn.accessCode}</strong>
            </p>
          </div>

          <button
            onClick={() => onOpenQuickModal('checkin')}
            className="inline-flex items-center justify-center gap-2 bg-[#2A4436] hover:bg-[#20362B] active:scale-[0.98] text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm w-fit mt-3"
          >
            <span>View instructions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Column: Door photo */}
        <div 
          onClick={() => onOpenQuickModal('checkin')}
          className="w-28 sm:w-32 h-36 sm:h-40 rounded-2xl overflow-hidden shrink-0 cursor-pointer group shadow-sm border border-black/5"
        >
          <img
            src={property.doorImage || property.heroImage}
            alt="Front door entry"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* 2. Side-by-side Row: Wi-Fi & House Guide */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {/* Wi-Fi Card */}
        <div
          onClick={() => onOpenQuickModal('wifi')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenQuickModal('wifi'); }}
          className="bg-white rounded-[24px] p-4 shadow-soft-card border border-black/[0.03] flex flex-col justify-between min-h-[118px] cursor-pointer hover:shadow-soft-lg active:scale-[0.98] transition-all text-left group select-none"
        >
          <div className="w-11 h-11 rounded-full bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Wifi className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[#1C1B18]">
              <h3 className="font-bold text-sm sm:text-base group-hover:text-[#2A4436] transition-colors">
                Wi-Fi
              </h3>
              <ArrowRight className="w-4 h-4 text-[#78756E] group-hover:text-[#2A4436] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#78756E] font-medium mt-0.5 truncate">
              {property.wifi.network}
            </p>
          </div>
        </div>

        {/* Play Card */}
        <div
          onClick={() => onOpenQuickModal('play')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenQuickModal('play'); }}
          className="bg-white rounded-[24px] p-4 shadow-soft-card border border-black/[0.03] flex flex-col justify-between min-h-[118px] cursor-pointer hover:shadow-soft-lg active:scale-[0.98] transition-all text-left group select-none"
        >
          <div className="w-11 h-11 rounded-full bg-[#F7EBE4] text-[#9E5A3F] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[#1C1B18]">
              <h3 className="font-bold text-sm sm:text-base group-hover:text-[#9E5A3F] transition-colors">
                Play
              </h3>
              <ArrowRight className="w-4 h-4 text-[#78756E] group-hover:text-[#9E5A3F] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#78756E] font-medium mt-0.5">
              4 Intensities
            </p>
          </div>
        </div>
      </div>

      {/* 3. Side-by-side Row: Local Recommendations & Return Home */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {/* Local Recommendations Card */}
        <div 
          onClick={() => onOpenQuickModal('recommendations')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenQuickModal('recommendations'); }}
          className="bg-white rounded-[24px] p-4 shadow-soft-card border border-black/[0.03] flex flex-col justify-between min-h-[118px] cursor-pointer hover:shadow-soft-lg active:scale-[0.98] transition-all text-left group select-none"
        >
          <div className="w-11 h-11 rounded-full bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[#1C1B18]">
              <h3 className="font-bold text-sm sm:text-base group-hover:text-[#2A4436] transition-colors leading-tight">
                Recommendations
              </h3>
              <ArrowRight className="w-4 h-4 text-[#78756E] group-hover:text-[#2A4436] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </div>
            <p className="text-xs text-[#78756E] font-medium mt-0.5 truncate">
              {property.recommendations.length} curated spots
            </p>
          </div>
        </div>

        {/* Return Home Card */}
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${property.coordinates?.lat || 39.1677},${property.coordinates?.lng || -120.1452}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-[24px] p-4 shadow-soft-card border border-black/[0.03] flex flex-col justify-between min-h-[118px] cursor-pointer hover:shadow-soft-lg active:scale-[0.98] transition-all text-left group select-none relative"
          title={`Get directions back to ${property.name}`}
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Navigation className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="w-2 h-2 rounded-full bg-[#2A4436] animate-pulse mr-1" />
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[#1C1B18]">
              <h3 className="font-bold text-sm sm:text-base group-hover:text-[#2A4436] transition-colors leading-tight">
                Return Home
              </h3>
              <ExternalLink className="w-3.5 h-3.5 text-[#78756E] group-hover:text-[#2A4436] transition-all shrink-0 ml-1" />
            </div>
            <p className="text-xs text-[#78756E] font-medium mt-0.5 truncate">
              Way to Home · Maps
            </p>
          </div>
        </a>
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-black/10 space-y-4 text-left safe-bottom">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1C1B18]">{confirmDialog.title}</h3>
                <span className="text-[11px] text-[#78756E] font-medium">Host notification confirmation</span>
              </div>
            </div>

            <p className="text-xs text-[#5C5A55] leading-relaxed">
              {confirmDialog.message}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="py-2.5 px-4 rounded-xl bg-[#F6F4F0] hover:bg-[#ECE8E1] text-xs font-semibold text-[#5C5A55] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStateChange}
                className="py-2.5 px-4 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                Confirm & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
