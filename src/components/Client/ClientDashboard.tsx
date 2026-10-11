import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Compass, 
  KeyRound, 
  Wifi, 
  Phone, 
  BookOpen, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Star, 
  Sparkles,
  Lock,
  LogOut,
  ChevronRight,
  Save,
  ArrowRight,
  RefreshCw,
  Home,
  Utensils
} from 'lucide-react';
import { PropertyData, Recommendation, GuestStayStatus, PropertyCoordinates } from '../../types';
import { 
  getPropertyBySlug, 
  saveProperty, 
  getAllPropertiesList, 
  DEFAULT_SLUG 
} from '../../data/properties';
import { getStayStatus, setStayStatus } from '../../utils/stayState';
import { OsmLocationPicker } from '../Map/OsmLocationPicker';
import { fetchNearbyPlacesOSM } from '../../utils/osm';

interface ClientDashboardProps {
  initialSlug?: string;
  onNavigateToGuest: (slug: string) => void;
  onNavigateToAdmin: () => void;
}

const AUTH_STORAGE_KEY = 'client_portal_auth_session';

type MobileTab = 'status' | 'location' | 'guide' | 'places';

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  initialSlug = DEFAULT_SLUG,
  onNavigateToGuest,
  onNavigateToAdmin,
}) => {
  // Session authentication state
  const [session, setSession] = useState<{ slug: string; hostName: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return null;
        }
      }
    }
    return { slug: initialSlug, hostName: 'Host' };
  });

  const [currentSlug, setCurrentSlug] = useState<string>(session ? session.slug : initialSlug);
  const [loginSlug, setLoginSlug] = useState<string>(initialSlug);
  const [passcode, setPasscode] = useState<string>('host123');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Load active property
  const property: PropertyData = getPropertyBySlug(currentSlug);

  // Form Fields - Simplified & Layman Terms
  const [name, setName] = useState(property.name);
  const [tagline, setTagline] = useState(property.tagline);
  const [location, setLocation] = useState(property.location);
  const [heroImage, setHeroImage] = useState(property.heroImage);
  const [coordinates, setCoordinates] = useState<PropertyCoordinates>(
    property.coordinates || { lat: 39.1677, lng: -120.1452, address: property.location }
  );

  // Host Contact
  const [hostName, setHostName] = useState(property.host.name);
  const [hostPhone, setHostPhone] = useState(property.host.phoneFormatted);
  const [hostEmail, setHostEmail] = useState(property.host.email);

  // Wi-Fi
  const [wifiNetwork, setWifiNetwork] = useState(property.wifi.network);
  const [wifiPassword, setWifiPassword] = useState(property.wifi.password);

  // Door Access
  const [accessCode, setAccessCode] = useState(property.checkIn.accessCode);
  const [doorInstruction, setDoorInstruction] = useState<string>(
    property.checkIn.doorInstructions && property.checkIn.doorInstructions.length > 0
      ? property.checkIn.doorInstructions[0]
      : 'Enter code on keypad and turn deadbolt.'
  );

  // House Guide (Single Long Text Widget)
  const [houseGuideText, setHouseGuideText] = useState(property.houseGuideText || '');

  // Recommendations (Sorted highest rating first)
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => {
    const list = [...(property.recommendations || [])];
    return list.sort((a, b) => b.rating - a.rating);
  });

  // Guest Stay Status
  const [stayStatus, setLocalStayStatus] = useState<GuestStayStatus>(() => getStayStatus(currentSlug));

  // Active Mobile Tab: 4 simple tabs
  const [activeTab, setActiveTab] = useState<MobileTab>('status');
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceType, setNewPlaceType] = useState('Restaurant');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');

  // Sync state when property slug changes
  useEffect(() => {
    const p = getPropertyBySlug(currentSlug);
    setName(p.name);
    setTagline(p.tagline);
    setLocation(p.location);
    setHeroImage(p.heroImage);
    setCoordinates(p.coordinates || { lat: 39.1677, lng: -120.1452, address: p.location });
    setHostName(p.host.name);
    setHostPhone(p.host.phoneFormatted);
    setHostEmail(p.host.email);
    setWifiNetwork(p.wifi.network);
    setWifiPassword(p.wifi.password);
    setAccessCode(p.checkIn.accessCode);
    setDoorInstruction(
      p.checkIn.doorInstructions && p.checkIn.doorInstructions.length > 0
        ? p.checkIn.doorInstructions[0]
        : 'Enter code on keypad and turn deadbolt.'
    );
    setHouseGuideText(p.houseGuideText || '');
    const recs = [...(p.recommendations || [])].sort((a, b) => b.rating - a.rating);
    setRecommendations(recs);
    setLocalStayStatus(getStayStatus(currentSlug));
  }, [currentSlug]);

  // Sync stay status listener
  useEffect(() => {
    const handleStatusChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ slug: string; status: GuestStayStatus }>;
      if (customEvent.detail && customEvent.detail.slug === currentSlug) {
        setLocalStayStatus(customEvent.detail.status);
      }
    };
    window.addEventListener('stay-status-change', handleStatusChange);
    return () => window.removeEventListener('stay-status-change', handleStatusChange);
  }, [currentSlug]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Auth Handlers
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginSlug) {
      setLoginError('Please select a property.');
      return;
    }
    const prop = getPropertyBySlug(loginSlug);
    const authSession = { slug: prop.slug, hostName: prop.host.name };
    setSession(authSession);
    setCurrentSlug(prop.slug);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    setLoginError(null);
    showToast(`Signed in as host for ${prop.name}`);
  };

  const handleQuickDemoLogin = (slug: string) => {
    setLoginSlug(slug);
    const prop = getPropertyBySlug(slug);
    const authSession = { slug: prop.slug, hostName: prop.host.name };
    setSession(authSession);
    setCurrentSlug(prop.slug);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
    showToast(`Signed in as ${prop.host.name} (${prop.name})`);
  };

  const handleLogout = () => {
    setSession(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    showToast('Signed out');
  };

  // Guest Stay Status Toggle
  const handleUpdateStayStatus = (newStatus: GuestStayStatus) => {
    setStayStatus(currentSlug, newStatus);
    setLocalStayStatus(newStatus);
    showToast(newStatus === 'checked_in' ? 'Marked as Guests Checked In' : 'Marked as Guests Checked Out');
  };

  // Find Places Nearby (Layman OSM query)
  const handleFindNearbyPlaces = async () => {
    setIsFetchingPlaces(true);
    showToast('Finding popular spots near your house pin...');
    try {
      const places = await fetchNearbyPlacesOSM(coordinates.lat, coordinates.lng);
      const sorted = places.sort((a, b) => b.rating - a.rating);
      setRecommendations(sorted);
      showToast(`Added ${sorted.length} spots sorted by rating!`);
    } catch (err) {
      showToast('Could not load nearby places. Please try again.');
    } finally {
      setIsFetchingPlaces(false);
    }
  };

  // Toggle Star on Recommendation
  const handleToggleStar = (recId: string) => {
    setRecommendations((prev) =>
      prev.map((rec) => {
        if (rec.id === recId) {
          const nextStar = !rec.isStarred;
          showToast(nextStar ? `★ Starred "${rec.name}" as Host Favorite` : `Unstarred "${rec.name}"`);
          return { ...rec, isStarred: nextStar };
        }
        return rec;
      })
    );
  };

  // Remove place
  const handleRemovePlace = (id: string) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
    showToast('Spot removed');
  };

  // Add custom place
  const handleAddCustomPlace = () => {
    if (!newPlaceName.trim()) return;
    const customRec: Recommendation = {
      id: 'custom-' + Date.now(),
      name: newPlaceName.trim(),
      category: 'dining',
      type: newPlaceType.trim() || 'Local Favorite',
      distance: 'Nearby',
      address: newPlaceAddress.trim() || 'Nearby',
      description: 'Personally recommended by your host.',
      highlight: 'Host favorite',
      rating: 5.0,
      isStarred: true,
    };
    const nextList = [customRec, ...recommendations].sort((a, b) => b.rating - a.rating);
    setRecommendations(nextList);
    setNewPlaceName('');
    setNewPlaceAddress('');
    setIsAddingPlace(false);
    showToast(`Added "${customRec.name}" to your recommendations!`);
  };

  // Save All Changes
  const handleSaveAll = () => {
    const existing = getPropertyBySlug(currentSlug);

    const updated: PropertyData = {
      ...existing,
      name: name.trim() || existing.name,
      tagline: tagline.trim() || existing.tagline,
      location: location.trim() || existing.location,
      coordinates,
      heroImage: heroImage.trim() || existing.heroImage,
      assistantName: `${name.trim()} Assistant`,
      host: {
        ...existing.host,
        name: hostName.trim() || existing.host.name,
        phoneFormatted: hostPhone.trim() || existing.host.phoneFormatted,
        email: hostEmail.trim() || existing.host.email,
      },
      wifi: {
        network: wifiNetwork.trim() || existing.wifi.network,
        password: wifiPassword.trim() || existing.wifi.password,
        qrCodeText: `WIFI:T:WPA;S:${wifiNetwork.trim()};P:${wifiPassword.trim()};;`,
      },
      checkIn: {
        ...existing.checkIn,
        accessCode: accessCode.trim() || existing.checkIn.accessCode,
        doorInstructions: [doorInstruction.trim() || 'Enter code on keypad and turn deadbolt.'],
      },
      houseGuideText: houseGuideText.trim(),
      recommendations: recommendations.sort((a, b) => b.rating - a.rating),
    };

    saveProperty(updated);
    showToast(`Saved changes for ${updated.name}!`);
  };

  const propertyList = getAllPropertiesList();
  const guestUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/client/${currentSlug}`;

  const copyGuestUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(guestUrl);
      setIsCopiedLink(true);
      showToast('Guest app link copied to clipboard!');
      setTimeout(() => setIsCopiedLink(false), 2500);
    }
  };

  // =========================================================
  // VIEW 1: SIGN IN SCREEN (MOBILE FIRST & CLEAN)
  // =========================================================
  if (!session) {
    return (
      <div className="h-[100dvh] w-full bg-[#ECE8E1] text-[#1C1B18] flex flex-col items-center justify-center overflow-hidden selection:bg-[#2A4436]/20">
        <div className="w-full max-w-md h-[100dvh] flex flex-col bg-[#F6F4F0] shadow-2xl relative border-x border-black/5 overflow-hidden">
          
          {/* Toast */}
          {notification && (
            <div className="fixed top-4 left-4 right-4 z-50 bg-[#2A4436] text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs font-semibold animate-fade-in border border-black/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{notification}</span>
            </div>
          )}

          {/* Scrollable Login Container */}
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-8 flex flex-col justify-between">
            <div className="space-y-6 my-auto">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center mx-auto shadow-sm">
                  <Building2 className="w-7 h-7 stroke-[1.8]" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-[#1C1B18] tracking-tight">
                  Host Dashboard
                </h1>
                <p className="text-xs text-[#78756E] max-w-xs mx-auto leading-relaxed">
                  Sign in to manage your house details, set your front door pin, and view your guest app.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 bg-white p-5 rounded-3xl border border-black/5 shadow-soft-card">
                <div>
                  <label className="block text-xs font-bold text-[#1C1B18] mb-1.5">
                    Select Your Property
                  </label>
                  <select
                    value={loginSlug}
                    onChange={(e) => setLoginSlug(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs font-semibold text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all cursor-pointer"
                  >
                    {propertyList.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#1C1B18]">
                      Host Passcode
                    </label>
                    <span className="text-[10px] text-[#78756E]">Demo: host123</span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter passcode..."
                      className="w-full px-3.5 py-3 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                    />
                    <Lock className="w-4 h-4 text-[#78756E] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-bold shadow-soft-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Sign In as Host</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick One-Click Demo Buttons */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#78756E] block text-center uppercase tracking-wider">
                  Quick Demo Access
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('cedar-house')}
                    className="p-3 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-black/5 text-left transition-all group shadow-soft-sm active:scale-95"
                  >
                    <div className="text-xs font-bold text-[#1C1B18] group-hover:text-[#2A4436]">
                      Cedar House
                    </div>
                    <div className="text-[10px] text-[#78756E] mt-0.5">Tahoe City · Sarah</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('pine-crest-villa')}
                    className="p-3 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-black/5 text-left transition-all group shadow-soft-sm active:scale-95"
                  >
                    <div className="text-xs font-bold text-[#1C1B18] group-hover:text-[#2A4436]">
                      Pine Crest
                    </div>
                    <div className="text-[10px] text-[#78756E] mt-0.5">Blue Ridge · David</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="pt-4 text-center flex items-center justify-center gap-4 text-xs text-[#78756E]">
              <button
                onClick={onNavigateToAdmin}
                className="hover:text-[#1C1B18] underline underline-offset-2 transition-colors"
              >
                Admin Console
              </button>
              <span>·</span>
              <button
                onClick={() => onNavigateToGuest(DEFAULT_SLUG)}
                className="hover:text-[#1C1B18] underline underline-offset-2 transition-colors"
              >
                Guest App
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW 2: AUTHENTICATED MOBILE-FOCUSED HOST DASHBOARD
  // =========================================================
  return (
    <div className="h-[100dvh] w-full bg-[#ECE8E1] text-[#1C1B18] flex flex-col items-center justify-center overflow-hidden selection:bg-[#2A4436]/20">
      
      {/* Mobile App Screen Frame */}
      <div className="w-full max-w-md h-[100dvh] flex flex-col bg-[#F6F4F0] shadow-2xl relative border-x border-black/5 overflow-hidden">
        
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-4 left-4 right-4 z-50 bg-[#2A4436] text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs font-semibold animate-fade-in border border-black/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{notification}</span>
          </div>
        )}

        {/* 1. Pinned Top App Bar */}
        <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif text-sm font-bold text-[#1C1B18] truncate leading-tight">
                  {name}
                </h1>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#EBF2EC] text-[#2A4436] shrink-0">
                  Host
                </span>
              </div>
              <p className="text-[11px] text-[#78756E] truncate leading-tight">
                {location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Property Selector */}
            <select
              value={currentSlug}
              onChange={(e) => {
                setCurrentSlug(e.target.value);
                const targetProp = getPropertyBySlug(e.target.value);
                const newSession = { slug: targetProp.slug, hostName: targetProp.host.name };
                setSession(newSession);
                sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
              }}
              className="text-xs font-semibold text-[#1C1B18] bg-[#F6F4F0] hover:bg-[#ECE8E1] border border-black/10 px-2 py-1.5 rounded-xl focus:outline-none cursor-pointer max-w-[110px] truncate"
            >
              {propertyList.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* View Guest App */}
            <button
              onClick={() => onNavigateToGuest(currentSlug)}
              className="p-2 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white active:scale-95 transition-all"
              title="Open Guest App"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#78756E] hover:text-[#1C1B18] hover:bg-black/5 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* 2. Scrollable Viewport (Never locks scrolling!) */}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 pb-28">

          {/* ========================================================= */}
          {/* TAB 1: GUEST STATUS & GUEST APP LINK */}
          {/* ========================================================= */}
          {activeTab === 'status' && (
            <div className="space-y-4 animate-fade-in">
              {/* Card 1: Are Guests Staying Right Now? */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-3.5">
                <div>
                  <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider block">
                    Guest Arrival Status
                  </span>
                  <h2 className="font-serif text-base font-bold text-[#1C1B18] mt-0.5">
                    Are guests currently staying?
                  </h2>
                  <p className="text-xs text-[#78756E] mt-0.5">
                    Switches your guest app between arrival welcome and checkout instructions.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateStayStatus('checked_in')}
                    className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      stayStatus === 'checked_in'
                        ? 'bg-[#EBF2EC] border-[#2A4436] shadow-soft-sm'
                        : 'bg-[#FAF8F5] border-black/5 hover:bg-[#F6F4F0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">🟢</span>
                      {stayStatus === 'checked_in' && <Check className="w-4 h-4 text-[#2A4436]" />}
                    </div>
                    <div className="font-bold text-xs text-[#1C1B18] mt-2">Checked In</div>
                    <div className="text-[11px] text-[#5C5A55] mt-0.5">Guests have arrived</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStayStatus('checked_out')}
                    className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      stayStatus === 'checked_out'
                        ? 'bg-[#F4EFE6] border-[#7A684D] shadow-soft-sm'
                        : 'bg-[#FAF8F5] border-black/5 hover:bg-[#F6F4F0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">👋</span>
                      {stayStatus === 'checked_out' && <Check className="w-4 h-4 text-[#7A684D]" />}
                    </div>
                    <div className="font-bold text-xs text-[#1C1B18] mt-2">Checked Out</div>
                    <div className="text-[11px] text-[#5C5A55] mt-0.5">House turnover</div>
                  </button>
                </div>
              </div>

              {/* Card 2: Guest App Share Link */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-3">
                <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider block">
                  Guest App Link
                </span>
                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-black/5 space-y-1">
                  <span className="text-[11px] text-[#78756E] block">Share this link with your arriving guests:</span>
                  <div className="font-mono text-xs font-semibold text-[#1C1B18] truncate">
                    {guestUrl}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={copyGuestUrl}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF8F5] border border-black/10 text-xs font-bold text-[#1C1B18] shadow-soft-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    {isCopiedLink ? <Check className="w-3.5 h-3.5 text-[#2A4436]" /> : <Copy className="w-3.5 h-3.5 text-[#78756E]" />}
                    <span>{isCopiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToGuest(currentSlug)}
                    className="py-2.5 px-3 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-bold shadow-soft-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Open App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 3: House Name & Photo */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-3.5">
                <div className="border-b border-black/5 pb-2.5">
                  <h3 className="font-serif text-sm font-bold text-[#1C1B18]">
                    Property Basics
                  </h3>
                  <p className="text-[11px] text-[#78756E] mt-0.5">
                    Basic information guests see in the app.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                      House Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Cedar House"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs font-semibold text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                      Short Description / Tagline
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Modern Alpine Chalet & Forest Spa"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                      Cover Photo URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={heroImage}
                        onChange={(e) => setHeroImage(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                      />
                      {heroImage && (
                        <img
                          src={heroImage}
                          alt="Cover"
                          className="w-10 h-10 rounded-xl object-cover border border-black/10 shrink-0"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="w-full py-3 rounded-2xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-bold shadow-soft-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Details</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: ADDRESS & FRONT DOOR PIN */}
          {/* ========================================================= */}
          {activeTab === 'location' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-2">
                <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider block">
                  Location Setup
                </span>
                <h2 className="font-serif text-base font-bold text-[#1C1B18]">
                  Address & Front Door Pin
                </h2>
                <p className="text-xs text-[#78756E] leading-relaxed">
                  Type your address and set the pin right at your front door. When guests are out exploring, the guest app's <strong>"Return Home"</strong> button gives them turn-by-turn directions back to this exact pin.
                </p>
              </div>

              {/* Simplified OsmLocationPicker */}
              <OsmLocationPicker
                coordinates={coordinates}
                propertyName={name}
                onChange={(coords) => {
                  setCoordinates(coords);
                  if (coords.address) {
                    setLocation(coords.address.split(',')[0]);
                  }
                }}
                onSave={(coords) => {
                  setCoordinates(coords);
                  if (coords.address) {
                    setLocation(coords.address.split(',')[0]);
                  }
                  handleSaveAll();
                }}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: WI-FI, KEYS & HOUSE GUIDE */}
          {/* ========================================================= */}
          {activeTab === 'guide' && (
            <div className="space-y-4 animate-fade-in">
              {/* Wi-Fi & Keypad Section */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-4">
                <div className="border-b border-black/5 pb-2.5">
                  <h3 className="font-serif text-sm font-bold text-[#1C1B18] flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#2A4436]" />
                    <span>Front Door & Wi-Fi</span>
                  </h3>
                  <p className="text-[11px] text-[#78756E] mt-0.5">
                    Essential codes guests need when they arrive.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                      Door Keypad Code
                    </label>
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="e.g. 4829"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs font-mono font-bold text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                      Door Instructions
                    </label>
                    <input
                      type="text"
                      value={doorInstruction}
                      onChange={(e) => setDoorInstruction(e.target.value)}
                      placeholder="e.g. Enter 4 digits on keypad and turn deadbolt clockwise"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="pt-2 border-t border-black/5 grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                        Wi-Fi Name
                      </label>
                      <input
                        type="text"
                        value={wifiNetwork}
                        onChange={(e) => setWifiNetwork(e.target.value)}
                        placeholder="Network Name"
                        className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                        Wi-Fi Password
                      </label>
                      <input
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* House Guide (Single Long Text Widget) */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-3">
                <div className="border-b border-black/5 pb-2.5">
                  <h3 className="font-serif text-sm font-bold text-[#1C1B18] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#2A4436]" />
                    <span>House Guide (Instructions)</span>
                  </h3>
                  <p className="text-[11px] text-[#78756E] mt-0.5">
                    A simple text guide shown to guests for trash, heating, rules, etc.
                  </p>
                </div>

                <textarea
                  rows={8}
                  value={houseGuideText}
                  onChange={(e) => setHouseGuideText(e.target.value)}
                  placeholder="Write your house rules, heating instructions, garbage day, and anything else guests should know..."
                  className="w-full p-3.5 rounded-2xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] leading-relaxed focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all resize-y"
                />

                <span className="text-[10px] text-[#78756E] block">
                  Guests can read this single guide anytime in their app under "House Guide".
                </span>
              </div>

              {/* Host Contact Info */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-3">
                <div className="border-b border-black/5 pb-2.5">
                  <h3 className="font-serif text-sm font-bold text-[#1C1B18] flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#2A4436]" />
                    <span>Host Contact</span>
                  </h3>
                  <p className="text-[11px] text-[#78756E] mt-0.5">
                    How guests reach you for questions or emergencies.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                      Host Name
                    </label>
                    <input
                      type="text"
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={hostPhone}
                      onChange={(e) => setHostPhone(e.target.value)}
                      placeholder="e.g. (555) 234-5678"
                      className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="w-full py-3 rounded-2xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-bold shadow-soft-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Guide & Wi-Fi</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: LOCAL RECOMMENDATIONS */}
          {/* ========================================================= */}
          {activeTab === 'places' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider block">
                    Guest Recommendations
                  </span>
                  <h2 className="font-serif text-base font-bold text-[#1C1B18] mt-0.5">
                    Nearby Food & Activities
                  </h2>
                  <p className="text-xs text-[#78756E] mt-0.5">
                    Automatically ranked by highest rating. Star places you personally recommend!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleFindNearbyPlaces}
                    disabled={isFetchingPlaces}
                    className="py-2.5 px-3 rounded-xl bg-[#EBF2EC] hover:bg-[#DCEDE0] text-[#2A4436] text-xs font-bold border border-[#2A4436]/20 shadow-soft-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingPlaces ? 'animate-spin' : ''}`} />
                    <span>{isFetchingPlaces ? 'Finding...' : 'Find Nearby Spots'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddingPlace(!isAddingPlace)}
                    className="py-2.5 px-3 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-bold shadow-soft-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Spot</span>
                  </button>
                </div>

                {/* Add Custom Spot Form */}
                {isAddingPlace && (
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/5 space-y-2.5 mt-2 animate-fade-in">
                    <span className="text-xs font-bold text-[#1C1B18] block">Add Favorite Spot</span>
                    <input
                      type="text"
                      value={newPlaceName}
                      onChange={(e) => setNewPlaceName(e.target.value)}
                      placeholder="Spot Name (e.g., West Shore Cafe)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs text-[#1C1B18] focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newPlaceType}
                        onChange={(e) => setNewPlaceType(e.target.value)}
                        placeholder="Type (e.g. Artisan Bakery)"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs text-[#1C1B18] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newPlaceAddress}
                        onChange={(e) => setNewPlaceAddress(e.target.value)}
                        placeholder="Distance (e.g. 5 mins walk)"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs text-[#1C1B18] focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingPlace(false)}
                        className="px-3 py-1.5 text-xs text-[#78756E] hover:text-[#1C1B18]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomPlace}
                        className="px-3 py-1.5 rounded-xl bg-[#2A4436] text-white text-xs font-bold shadow-soft-sm"
                      >
                        Add Spot
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Places List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider">
                    {recommendations.length} Recommended Places
                  </span>
                  <span className="text-[10px] text-[#78756E]">Highest rated first</span>
                </div>

                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-2xl bg-white border border-black/5 shadow-soft-sm space-y-1.5 hover:shadow-soft-card transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-xs text-[#1C1B18] truncate">
                            {rec.name}
                          </h4>
                          {rec.isStarred && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              ★ Host Pick
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#78756E] mt-0.5 truncate">
                          {rec.type} · {rec.distance}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Rating */}
                        <span className="text-xs font-bold text-[#1C1B18] bg-[#F6F4F0] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{rec.rating.toFixed(1)}</span>
                        </span>

                        {/* Star Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStar(rec.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            rec.isStarred
                              ? 'bg-amber-50 border-amber-200 text-amber-600'
                              : 'bg-[#F6F4F0] border-black/5 text-[#78756E] hover:text-[#1C1B18]'
                          }`}
                          title="Star as Host Favorite"
                        >
                          <Star className={`w-3.5 h-3.5 ${rec.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemovePlace(rec.id)}
                          className="p-1.5 rounded-lg text-[#78756E] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove spot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* 3. Pinned Mobile Bottom Navigation Bar (App-like feel) */}
        <nav className="shrink-0 bg-white/95 backdrop-blur-md border-t border-black/5 px-2 py-2 flex items-center justify-around z-30 safe-bottom">
          {[
            { id: 'status' as const, label: 'Status', icon: Home },
            { id: 'location' as const, label: 'Location', icon: MapPin },
            { id: 'guide' as const, label: 'Guide & Wi-Fi', icon: BookOpen },
            { id: 'places' as const, label: 'Places', icon: Utensils },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#2A4436] font-bold'
                    : 'text-[#78756E] font-medium hover:text-[#1C1B18]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#EBF2EC]' : ''
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                </div>
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
