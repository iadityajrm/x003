import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Star, 
  Check, 
  Copy,
  Mail
} from 'lucide-react';
import { PropertyData } from '../../types';
import { ScreenHeader } from './ScreenHeader';

interface HostContactScreenProps {
  property: PropertyData;
  onBack: () => void;
}

export const HostContactScreen: React.FC<HostContactScreenProps> = ({
  property,
  onBack,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(property.host.phoneFormatted);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(property.host.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto animate-screen-in pb-32">
      <ScreenHeader
        title="Contact Host"
        subtitle={`Direct line to ${property.host.name}`}
        onBack={onBack}
      />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Host Profile Card */}
        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-card flex items-center gap-3.5">
          <img
            src={property.host.avatar}
            alt={property.host.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#2A4436]/30 shadow-sm shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#1C1B18] truncate">{property.host.name}</h3>
              {property.host.superhost && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#2A4436] bg-[#EBF2EC] border border-[#2A4436]/20 px-2 py-0.5 rounded-full shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  Superhost
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[#78756E] mt-1">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <strong className="text-[#1C1B18]">{property.host.rating}</strong>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#2A4436]" />
                <span>Responds {property.host.responseTime}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Direct Actions: Call & SMS */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={`tel:${property.host.phone}`}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white font-semibold text-xs shadow-sm active:scale-95 transition-all text-center"
          >
            <Phone className="w-4 h-4" />
            <span>Call Host Now</span>
          </a>

          <a
            href={`sms:${property.host.phone}`}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-black/10 text-[#1C1B18] font-semibold text-xs shadow-soft-sm active:scale-95 transition-all text-center"
          >
            <MessageSquare className="w-4 h-4 text-[#2A4436]" />
            <span>Send SMS / Text</span>
          </a>
        </div>

        {/* Direct Phone Number Card */}
        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-sm flex items-center justify-between text-xs">
          <div>
            <span className="text-[11px] font-semibold text-[#78756E] uppercase tracking-wider block">Phone Number</span>
            <strong className="text-sm text-[#1C1B18] font-mono mt-0.5 block">{property.host.phoneFormatted}</strong>
          </div>
          <button
            onClick={handleCopyPhone}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[#2A4436] font-semibold transition-all"
          >
            {copiedPhone ? <Check className="w-3.5 h-3.5 text-[#2A4436]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Direct Email Card */}
        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-sm flex items-center justify-between text-xs">
          <div>
            <span className="text-[11px] font-semibold text-[#78756E] uppercase tracking-wider block">Email Address</span>
            <strong className="text-xs text-[#1C1B18] font-mono mt-0.5 block truncate max-w-[200px]">{property.host.email}</strong>
          </div>
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[#2A4436] font-semibold transition-all"
          >
            {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#2A4436]" /> : <Mail className="w-3.5 h-3.5" />}
            <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Emergency Assistance Notice */}
        <div className="p-4 rounded-2xl bg-[#F6F4F0] border border-black/5 text-xs text-[#5C5A55] space-y-1">
          <span className="font-bold text-[#1C1B18] block">Urgent On-Property Needs</span>
          <p className="leading-relaxed">
            For urgent maintenance or lockout emergencies, you can reach {property.host.name} directly at {property.host.phoneFormatted} or dial 911 for emergency response.
          </p>
        </div>
      </div>
    </div>
  );
};
