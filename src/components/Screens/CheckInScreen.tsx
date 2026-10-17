import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Copy, 
  Check, 
  Car, 
  Zap, 
  ShieldAlert, 
  MessageSquare, 
  Lock, 
  Unlock, 
  PhoneCall, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { PropertyData } from '../../types';
import { ScreenHeader } from './ScreenHeader';
import { 
  isCodesUnlockedForGuest, 
  setCodesUnlockedForGuest, 
  verifyGuestPhoneNumber,
  getCurrentGuestBooking
} from '../../utils/guestBookingState';

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
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isCodesUnlockedForGuest(property.slug));
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [copiedKeypad, setCopiedKeypad] = useState(false);
  const [copiedKeybox, setCopiedKeybox] = useState(false);

  // Current booking info for helper cues
  const currentBooking = getCurrentGuestBooking(property.slug);

  useEffect(() => {
    setIsUnlocked(isCodesUnlockedForGuest(property.slug));
    const handleUnlockChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ slug: string; unlocked: boolean }>;
      if (customEvent.detail && customEvent.detail.slug === property.slug) {
        setIsUnlocked(customEvent.detail.unlocked);
      }
    };
    window.addEventListener('guest-codes-unlocked-changed', handleUnlockChange);
    return () => window.removeEventListener('guest-codes-unlocked-changed', handleUnlockChange);
  }, [property.slug]);

  const handleVerifyPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPhoneError(null);

    if (!phoneInput.trim()) {
      setPhoneError('Please enter the phone number used when booking.');
      return;
    }

    const isValid = verifyGuestPhoneNumber(
      property.slug,
      phoneInput.trim(),
      property.host.phone || property.host.phoneFormatted
    );

    if (isValid) {
      setCodesUnlockedForGuest(property.slug, true);
      setIsUnlocked(true);
      setPhoneError(null);
    } else {
      setPhoneError('Phone number does not match current reservation. Please check your reservation phone or contact your host.');
    }
  };

  const handleLockAgain = () => {
    setCodesUnlockedForGuest(property.slug, false);
    setIsUnlocked(false);
    setPhoneInput('');
    setPhoneError(null);
  };

  const handleCopyKeypad = () => {
    if (!isUnlocked) return;
    navigator.clipboard.writeText(property.checkIn.accessCode);
    setCopiedKeypad(true);
    setTimeout(() => setCopiedKeypad(false), 2000);
  };

  const handleCopyKeybox = () => {
    if (!isUnlocked) return;
    // Extract numbers or copy full keybox text
    navigator.clipboard.writeText(property.checkIn.emergencyKeybox);
    setCopiedKeybox(true);
    setTimeout(() => setCopiedKeybox(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto animate-screen-in pb-32">
      <ScreenHeader
        title="Getting Inside"
        subtitle={`${property.name} · Check-in Guide`}
        onBack={onBack}
      />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Verification Banner if Locked */}
        {!isUnlocked && (
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 shadow-soft-card space-y-3.5 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#1D1D1F] dark:text-white">
                  Guest Security Verification
                </h3>
                <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] leading-relaxed">
                  To protect guest security and privacy, enter the phone number linked to your reservation to reveal your door access and physical keybox codes.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyPhone} className="space-y-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] dark:text-white mb-1">
                  Booked Guest Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(e.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    placeholder="e.g. (555) 0192"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/15 dark:border-white/15 text-xs font-semibold text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#1D1D1F] dark:focus:border-white transition-all"
                  />
                </div>
              </div>

              {phoneError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-1.5 leading-snug">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{phoneError}</span>
                </div>
              )}

              {/* Demo Helper if booking registered */}
              {currentBooking?.guestPhone && (
                <div className="flex items-center justify-between text-[11px] text-[#86868B] dark:text-[#A1A1A6] px-1">
                  <span>Guest: <strong className="text-[#1D1D1F] dark:text-white">{currentBooking.guestName || 'Current Guest'}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneInput(currentBooking.guestPhone);
                      setPhoneError(null);
                    }}
                    className="text-[#1D1D1F] dark:text-white hover:underline font-semibold"
                  >
                    Use reservation phone
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#1D1D1F] hover:bg-[#3A3A3C] dark:bg-white dark:hover:bg-[#E5E5EA] text-white dark:text-black text-xs font-bold shadow-soft-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Verify & Reveal Codes</span>
              </button>
            </form>
          </div>
        )}

        {/* Unlocked Confirmation Pill */}
        {isUnlocked && (
          <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-xs text-[#1D1D1F] dark:text-white">
              <div className="w-6 h-6 rounded-full bg-[#1D1D1F] dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-semibold">Codes verified for your stay</span>
            </div>
            <button
              type="button"
              onClick={handleLockAgain}
              className="text-[11px] font-semibold text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white underline cursor-pointer"
            >
              Hide again
            </button>
          </div>
        )}

        {/* 1. Keypad Code Highlight Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 shadow-soft-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-[#1D1D1F] dark:text-white uppercase tracking-wider">Keypad Access Code</span>
            <div className="text-2xl font-extrabold text-[#1D1D1F] dark:text-white font-mono tracking-wider mt-1 select-all">
              {isUnlocked ? property.checkIn.accessCode : '••••••'}
            </div>
            <span className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-0.5 block">{property.checkIn.lockType}</span>
          </div>

          {isUnlocked ? (
            <button
              onClick={handleCopyKeypad}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D1D1F] hover:bg-[#3A3A3C] dark:bg-white dark:hover:bg-[#E5E5EA] text-white dark:text-black font-semibold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              {copiedKeypad ? (
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
          ) : (
            <div className="flex items-center gap-1 text-xs font-semibold text-[#86868B] dark:text-[#A1A1A6] bg-[#F5F5F7] dark:bg-white/10 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/10">
              <Lock className="w-3.5 h-3.5 text-[#636366] dark:text-[#A1A1A6]" />
              <span>Locked</span>
            </div>
          )}
        </div>

        {/* Door Photo */}
        {property.doorImage && (
          <div className="rounded-2xl overflow-hidden shadow-soft-sm border border-black/5 dark:border-white/10">
            <img
              src={property.doorImage}
              alt="Door entry view"
              className="w-full h-44 object-cover"
            />
          </div>
        )}

        {/* Step-by-Step Entry Guide */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-soft-sm space-y-3 transition-colors">
          <h3 className="text-xs font-bold text-[#1D1D1F] dark:text-white uppercase tracking-wider">How to unlock the door</h3>
          <div className="space-y-2 text-xs text-[#1D1D1F] dark:text-neutral-300">
            {property.checkIn.doorInstructions.map((step, idx) => {
              let displayStep = step;
              if (!isUnlocked && property.checkIn.accessCode) {
                displayStep = displayStep.replace(property.checkIn.accessCode, '[Code Hidden]');
              }
              return (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white font-bold text-[11px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{displayStep}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Parking & EV Charging */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-soft-sm space-y-2.5 text-xs transition-colors">
          <div className="flex items-start gap-2.5">
            <Car className="w-4 h-4 text-[#1D1D1F] dark:text-white shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#1D1D1F] dark:text-white block">Parking Instructions:</span>
              <p className="text-[#636366] dark:text-neutral-300 leading-relaxed mt-0.5">{property.checkIn.parkingInfo}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-2 border-t border-black/5 dark:border-white/10">
            <Zap className="w-4 h-4 text-[#1D1D1F] dark:text-white shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#1D1D1F] dark:text-white block">EV Charger:</span>
              <p className="text-[#636366] dark:text-neutral-300 leading-relaxed mt-0.5">{property.checkIn.evCharger}</p>
            </div>
          </div>
        </div>

        {/* 2. Emergency Backup Physical Keybox (Hidden until phone verification) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-soft-card space-y-2 text-xs transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#1D1D1F] dark:text-white shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1D1D1F] dark:text-white block">Physical Keybox Backup:</span>
                {isUnlocked ? (
                  <p className="text-[#636366] dark:text-neutral-300 mt-0.5 leading-relaxed font-mono font-medium">{property.checkIn.emergencyKeybox}</p>
                ) : (
                  <div className="mt-1 flex items-center gap-1.5 text-[#86868B] dark:text-[#A1A1A6]">
                    <span className="font-mono bg-[#F5F5F7] dark:bg-white/10 px-2 py-0.5 rounded text-[11px] text-[#1D1D1F] dark:text-white">••••••••••••••</span>
                    <span className="text-[11px]">(Verify phone number above to reveal code)</span>
                  </div>
                )}
              </div>
            </div>

            {isUnlocked && (
              <button
                type="button"
                onClick={handleCopyKeybox}
                className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-[#F5F5F7] dark:hover:bg-white/5 text-[#1D1D1F] dark:text-white shrink-0"
                title="Copy Keybox info"
              >
                {copiedKeybox ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Ask Assistant button */}
        <button
          onClick={() => onAskAI("The door lock is not opening or keypad is unresponsive. What should I do?")}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-xs font-semibold text-[#1D1D1F] dark:text-white border border-black/5 dark:border-white/10 shadow-soft-sm transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Need lock help? Ask Assistant</span>
        </button>
      </div>
    </div>
  );
};
