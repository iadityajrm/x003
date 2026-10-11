import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Wifi, 
  KeyRound, 
  BookOpen, 
  MapPin, 
  Phone, 
  Save, 
  CheckCircle2, 
  LogOut, 
  LogIn, 
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { PropertyData, GuestStayStatus, Recommendation } from '../../types';
import { PROPERTIES, getAllPropertiesList, getPropertyBySlug } from '../../data/properties';
import { getStayStatus, setStayStatus } from '../../utils/stayState';

interface HostDashboardProps {
  initialSlug: string;
  onNavigateToGuest: (slug: string) => void;
  onNavigateToAdmin: () => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  initialSlug,
  onNavigateToGuest,
  onNavigateToAdmin,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug);
  const property: PropertyData = getPropertyBySlug(selectedSlug);

  // Editable fields state
  const [wifiNetwork, setWifiNetwork] = useState(property.wifi.network);
  const [wifiPassword, setWifiPassword] = useState(property.wifi.password);
  const [accessCode, setAccessCode] = useState(property.checkIn.accessCode);
  const [parkingInfo, setParkingInfo] = useState(property.checkIn.parkingInfo);
  const [evCharger, setEvCharger] = useState(property.checkIn.evCharger);
  const [houseGuideText, setHouseGuideText] = useState(property.houseGuideText);
  const [hostPhone, setHostPhone] = useState(property.host.phoneFormatted);
  const [hostEmail, setHostEmail] = useState(property.host.email);

  // Guest Stay Status
  const [stayStatus, setLocalStayStatus] = useState<GuestStayStatus>(() => getStayStatus(selectedSlug));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'guide' | 'access' | 'wifi'>('status');

  // Sync state when slug changes
  useEffect(() => {
    const p = getPropertyBySlug(selectedSlug);
    setWifiNetwork(p.wifi.network);
    setWifiPassword(p.wifi.password);
    setAccessCode(p.checkIn.accessCode);
    setParkingInfo(p.checkIn.parkingInfo);
    setEvCharger(p.checkIn.evCharger);
    setHouseGuideText(p.houseGuideText);
    setHostPhone(p.host.phoneFormatted);
    setHostEmail(p.host.email);
    setLocalStayStatus(getStayStatus(selectedSlug));
  }, [selectedSlug]);

  useEffect(() => {
    const handleStatusChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ slug: string; status: GuestStayStatus }>;
      if (customEvent.detail && customEvent.detail.slug === selectedSlug) {
        setLocalStayStatus(customEvent.detail.status);
      }
    };
    window.addEventListener('stay-status-change', handleStatusChange);
    return () => window.removeEventListener('stay-status-change', handleStatusChange);
  }, [selectedSlug]);

  const handleToggleStatus = (newStatus: GuestStayStatus) => {
    setStayStatus(selectedSlug, newStatus);
    setLocalStayStatus(newStatus);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    // Update memory object
    const target = PROPERTIES[selectedSlug];
    if (target) {
      target.wifi.network = wifiNetwork;
      target.wifi.password = wifiPassword;
      target.checkIn.accessCode = accessCode;
      target.checkIn.parkingInfo = parkingInfo;
      target.checkIn.evCharger = evCharger;
      target.houseGuideText = houseGuideText;
      target.host.phoneFormatted = hostPhone;
      target.host.email = hostEmail;
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const propertyList = getAllPropertiesList();

  return (
    <div className="min-h-[100dvh] bg-[#ECE8E1] text-[#1C1B18] flex flex-col items-center justify-start selection:bg-[#2A4436]/20">
      {/* Mobile App Frame */}
      <div className="w-full max-w-md min-h-[100dvh] flex flex-col bg-[#F6F4F0] shadow-2xl relative border-x border-black/5 pb-12">
        {/* Host Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/5 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2A4436] text-white flex items-center justify-center font-bold text-xs">
              H
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif text-sm font-bold text-[#1C1B18]">Host Dashboard</h1>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#EBF2EC] text-[#2A4436]">
                  Live Control
                </span>
              </div>
              <p className="text-[11px] text-[#78756E]">{property.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onNavigateToAdmin}
              className="text-[11px] font-semibold text-[#5C5A55] hover:text-[#1C1B18] px-2.5 py-1 rounded-lg bg-[#F6F4F0] border border-black/5"
            >
              Admin Fleet
            </button>
            <button
              onClick={() => onNavigateToGuest(selectedSlug)}
              className="flex items-center gap-1 text-[11px] font-semibold text-white bg-[#2A4436] hover:bg-[#20362B] px-3 py-1.5 rounded-lg shadow-sm active:scale-95"
            >
              <span>Guest App</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* Property Selector Strip */}
        <div className="bg-[#FAF8F5] px-4 py-2.5 border-b border-black/5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider shrink-0">
            Property:
          </span>
          {propertyList.map((p) => (
            <button
              key={p.slug}
              onClick={() => setSelectedSlug(p.slug)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSlug === p.slug
                  ? 'bg-[#2A4436] text-white shadow-sm'
                  : 'bg-white text-[#5C5A55] border border-black/5'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-[#F6F4F0] border-b border-black/5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-2 rounded-xl text-center transition-all ${
              activeTab === 'status'
                ? 'bg-white text-[#2A4436] shadow-soft-sm font-bold'
                : 'text-[#78756E] hover:text-[#1C1B18]'
            }`}
          >
            Guest Status
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2 rounded-xl text-center transition-all ${
              activeTab === 'guide'
                ? 'bg-white text-[#2A4436] shadow-soft-sm font-bold'
                : 'text-[#78756E] hover:text-[#1C1B18]'
            }`}
          >
            House Guide
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`py-2 rounded-xl text-center transition-all ${
              activeTab === 'access'
                ? 'bg-white text-[#2A4436] shadow-soft-sm font-bold'
                : 'text-[#78756E] hover:text-[#1C1B18]'
            }`}
          >
            Check-In
          </button>
          <button
            onClick={() => setActiveTab('wifi')}
            className={`py-2 rounded-xl text-center transition-all ${
              activeTab === 'wifi'
                ? 'bg-white text-[#2A4436] shadow-soft-sm font-bold'
                : 'text-[#78756E] hover:text-[#1C1B18]'
            }`}
          >
            Wi-Fi
          </button>
        </div>

        {/* Content Area */}
        <main className="p-4 sm:p-5 space-y-4">
          {/* TAB 1: GUEST STAY STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-soft-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#78756E] uppercase tracking-wider">
                    Current Guest Status
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                    stayStatus === 'checked_in'
                      ? 'bg-[#EBF2EC] text-[#2A4436]'
                      : stayStatus === 'checked_out'
                      ? 'bg-[#F4EFE6] text-[#7A684D]'
                      : 'bg-black/5 text-[#78756E]'
                  }`}>
                    ● {stayStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-center py-4 space-y-1">
                  <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl ${
                    stayStatus === 'checked_in'
                      ? 'bg-[#EBF2EC] text-[#2A4436]'
                      : stayStatus === 'checked_out'
                      ? 'bg-[#F4EFE6] text-[#7A684D]'
                      : 'bg-[#F6F4F0] text-[#78756E]'
                  }`}>
                    {stayStatus === 'checked_in' ? '🏡' : stayStatus === 'checked_out' ? '👋' : '⏳'}
                  </div>
                  <h2 className="font-serif text-xl font-bold text-[#1C1B18]">
                    {stayStatus === 'checked_in'
                      ? 'Guests Checked In'
                      : stayStatus === 'checked_out'
                      ? 'Guests Checked Out'
                      : 'Awaiting Guest Arrival'}
                  </h2>
                  <p className="text-xs text-[#78756E]">
                    {stayStatus === 'checked_in'
                      ? 'Guests are currently on property. AI Assistant is answering inquiries.'
                      : stayStatus === 'checked_out'
                      ? 'Turnover alert sent to housekeeping. Property ready for inspection.'
                      : 'Property is prepared for incoming guests.'}
                  </p>
                </div>

                {/* Host Status Override Buttons */}
                <div className="pt-2 border-t border-black/5 space-y-2">
                  <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider block">
                    Host Status Override
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleToggleStatus('not_checked_in')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        stayStatus === 'not_checked_in'
                          ? 'bg-[#1C1B18] text-white border-transparent'
                          : 'bg-[#F6F4F0] text-[#5C5A55] border-black/5 hover:bg-[#ECE8E1]'
                      }`}
                    >
                      Not In
                    </button>
                    <button
                      onClick={() => handleToggleStatus('checked_in')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        stayStatus === 'checked_in'
                          ? 'bg-[#2A4436] text-white border-transparent'
                          : 'bg-[#F6F4F0] text-[#5C5A55] border-black/5 hover:bg-[#ECE8E1]'
                      }`}
                    >
                      Checked In
                    </button>
                    <button
                      onClick={() => handleToggleStatus('checked_out')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        stayStatus === 'checked_out'
                          ? 'bg-[#9E5A3F] text-white border-transparent'
                          : 'bg-[#F6F4F0] text-[#5C5A55] border-black/5 hover:bg-[#ECE8E1]'
                      }`}
                    >
                      Checked Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Host Contact Profile */}
              <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-sm space-y-3">
                <h3 className="text-xs font-bold text-[#1C1B18] uppercase tracking-wider">
                  Host Profile & Direct Numbers
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-[#78756E] block mb-1">Host Phone</label>
                    <input
                      type="text"
                      value={hostPhone}
                      onChange={(e) => setHostPhone(e.target.value)}
                      className="w-full bg-[#F6F4F0] border border-black/10 rounded-xl p-2.5 text-xs text-[#1C1B18] font-mono focus:outline-none focus:border-[#2A4436]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#78756E] block mb-1">Host Email</label>
                    <input
                      type="email"
                      value={hostEmail}
                      onChange={(e) => setHostEmail(e.target.value)}
                      className="w-full bg-[#F6F4F0] border border-black/10 rounded-xl p-2.5 text-xs text-[#1C1B18] font-mono focus:outline-none focus:border-[#2A4436]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOUSE GUIDE (SINGLE LONG TEXT WIDGET) */}
          {activeTab === 'guide' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-card space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1C1B18] uppercase tracking-wider block">
                    House Manual (Markdown Text Widget)
                  </label>
                  <span className="text-[11px] text-[#78756E]">Single-page guest guide</span>
                </div>

                <textarea
                  rows={14}
                  value={houseGuideText}
                  onChange={(e) => setHouseGuideText(e.target.value)}
                  className="w-full bg-[#F6F4F0] border border-black/10 rounded-xl p-3.5 text-xs text-[#1C1B18] font-mono leading-relaxed focus:outline-none focus:border-[#2A4436] resize-y"
                  placeholder="Enter complete markdown house instructions..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: CHECK-IN & DOOR ACCESS */}
          {activeTab === 'access' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-card space-y-3">
                <h3 className="text-xs font-bold text-[#1C1B18] uppercase tracking-wider">
                  Door Access & Parking
                </h3>

                <div>
                  <label className="text-[11px] font-semibold text-[#78756E] block mb-1">
                    Smart Deadbolt Code
                  </label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full bg-[#F6F4F0] border border-black/10 rounded-xl p-3 text-sm text-[#1C1B18] font-mono font-bold focus:outline-none focus:border-[#2A4436]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#78756E] block mb-1">
                    Parking Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={parkingInfo}
                    onChange={(e) => setParkingInfo(e.target.value)}
                    className="w-full bg-[#F6F4F0] border border-black/10 rounded-xl p-2.5 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#78756E] block mb-1">
                    EV Charger Details
                  </label>
                  <input
                    type="text"
                    value={evCharger}
                    onChange={(e) => setEvCharger(e.target.value)}
                    className="w-full bg-[#F6F4F0] border border-black/10 rounded-xl p-2.5 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WI-FI */}
          {activeTab === 'wifi' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-card space-y-3">
                <h3 className="text-xs font-bold text-[#1C1B18] uppercase tracking-wider">
                  Guest Wi-Fi Network
                </h3>

                <div>
                  <label className="text-[11px] font-semibold text-[#78756E] block mb-1">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiNetwork}
                    onChange={(e) => setWifiNetwork(e.target.value)}
                    className="w-full bg-[#F6F4F0] border border-black/10 rounded-xl p-3 text-sm text-[#1C1B18] font-mono font-bold focus:outline-none focus:border-[#2A4436]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#78756E] block mb-1">
                    Wi-Fi Password
                  </label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    className="w-full bg-[#F6F4F0] border border-black/10 rounded-xl p-3 text-sm text-[#1C1B18] font-mono font-bold focus:outline-none focus:border-[#2A4436]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSaveDetails}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#2A4436] hover:bg-[#20362B] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Changes</span>
            </button>
            {savedSuccess && (
              <p className="text-center text-xs font-bold text-[#2A4436] mt-2 animate-fade-in">
                ✓ Changes published successfully for {property.name}!
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
