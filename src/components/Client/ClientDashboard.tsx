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
  Utensils,
  ShieldAlert,
  User
} from 'lucide-react';
import { PropertyData, Recommendation, GuestStayStatus, PropertyCoordinates, ClientAccount } from '../../types';
import { 
  getPropertyBySlug, 
  saveProperty, 
  getAllPropertiesList, 
  DEFAULT_SLUG 
} from '../../data/properties';
import { 
  getAllClients, 
  getClientById, 
  getClientByEmail 
} from '../../data/clients';
import { getStayStatus, setStayStatus } from '../../utils/stayState';
import { OsmLocationPicker } from '../Map/OsmLocationPicker';
import { fetchNearbyPlacesOSM } from '../../utils/osm';
import { GuestQrAndPdfSection } from './GuestQrAndPdfSection';
import { 
  getCurrentGuestBooking, 
  saveCurrentGuestBooking, 
  CurrentGuestBooking 
} from '../../utils/guestBookingState';

interface ClientDashboardProps {
  initialSlug?: string;
  onNavigateToGuest: (slug: string) => void;
  onNavigateToAdmin: () => void;
}

const AUTH_STORAGE_KEY = 'relay_client_portal_session_v2';
const LEGACY_AUTH_STORAGE_KEY = 'dwellio_client_portal_session_v2';

type MobileTab = 'status' | 'location' | 'guide' | 'places';

interface ClientSession {
  clientId: string;
  name: string;
  email: string;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  initialSlug = DEFAULT_SLUG,
  onNavigateToGuest,
  onNavigateToAdmin,
}) => {
  const [clients, setClients] = useState<ClientAccount[]>(getAllClients);
  const [propertyList, setPropertyList] = useState(getAllPropertiesList);

  // Sync clients and properties from storage live
  useEffect(() => {
    const handleSync = () => {
      setClients(getAllClients());
      setPropertyList(getAllPropertiesList());
    };
    window.addEventListener('clients-updated', handleSync);
    window.addEventListener('properties-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('clients-updated', handleSync);
      window.removeEventListener('properties-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Session authentication state (requires login if no active session stored)
  const [session, setSession] = useState<ClientSession | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(LEGACY_AUTH_STORAGE_KEY) ||
                     localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  // Client's Assigned Properties
  const currentClient = session ? clients.find((c) => c.id === session.clientId) || clients.find((c) => c.email === session.email) : null;
  const assignedSlugs = currentClient ? currentClient.assignedPropertySlugs : [];
  const clientProperties = propertyList.filter((p) => assignedSlugs.includes(p.slug));

  // Determine active property slug
  const [currentSlug, setCurrentSlug] = useState<string>(() => {
    if (assignedSlugs.length > 0) {
      if (assignedSlugs.includes(initialSlug)) return initialSlug;
      return assignedSlugs[0];
    }
    return initialSlug;
  });

  // When assigned properties or session changes, make sure currentSlug is valid
  useEffect(() => {
    if (assignedSlugs.length > 0 && !assignedSlugs.includes(currentSlug)) {
      setCurrentSlug(assignedSlugs[0]);
    }
  }, [assignedSlugs, currentSlug]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>(clients[0]?.email || 'sarah@relay.framewrklabs.com');
  const [passcode, setPasscode] = useState<string>('host123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

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

  // Dwellio AI Assistant Custom Instructions
  const [customAiInstructions, setCustomAiInstructions] = useState(property.customAiInstructions || '');

  // Recommendations (Sorted highest rating first)
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => {
    const list = [...(property.recommendations || [])];
    return list.sort((a, b) => b.rating - a.rating);
  });

  // Guest Stay Status
  const [stayStatus, setLocalStayStatus] = useState<GuestStayStatus>(() => getStayStatus(currentSlug));

  // Current Guest Reservation State (for phone-based door code verification)
  const [currentBooking, setCurrentBooking] = useState<CurrentGuestBooking | null>(() => getCurrentGuestBooking(currentSlug));
  const [guestPhone, setGuestPhone] = useState<string>(currentBooking?.guestPhone || '');
  const [guestName, setGuestName] = useState<string>(currentBooking?.guestName || '');
  const [guestDaysOfStay, setGuestDaysOfStay] = useState<string>(currentBooking?.daysOfStay ? String(currentBooking.daysOfStay) : '');

  // Active Mobile Tab
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
    setCustomAiInstructions(p.customAiInstructions || '');
    const recs = [...(p.recommendations || [])].sort((a, b) => b.rating - a.rating);
    setRecommendations(recs);
    setLocalStayStatus(getStayStatus(currentSlug));

    // Sync guest booking
    const b = getCurrentGuestBooking(currentSlug);
    setCurrentBooking(b);
    setGuestPhone(b?.guestPhone || '');
    setGuestName(b?.guestName || '');
    setGuestDaysOfStay(b?.daysOfStay ? String(b.daysOfStay) : '');
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

  // Auth Handlers (Neon Backend + Local Client sync)
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError('Please enter your client account email.');
      return;
    }
    setIsLoadingAuth(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/neon/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: loginEmail.trim(),
          password: passcode.trim(),
          role: 'client'
        })
      });
      const result = await res.json();
      if (result.ok && result.user) {
        const newSession: ClientSession = {
          clientId: result.user.id,
          name: result.user.name,
          email: result.user.email,
        };
        setSession(newSession);
        if (result.user.assignedPropertySlugs && result.user.assignedPropertySlugs.length > 0) {
          setCurrentSlug(result.user.assignedPropertySlugs[0]);
        }
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
        setLoginError(null);
        setIsLoadingAuth(false);
        showToast(`Signed in to Relay via Neon as ${result.user.name}`);
        return;
      } else if (result.error && !result.error.toLowerCase().includes('not found')) {
        setLoginError(result.error);
        setIsLoadingAuth(false);
        return;
      }
    } catch (err) {
      console.warn('Neon auth network issue, checking local credentials:', err);
    }

    // Local account fallback
    const matchedClient = getClientByEmail(loginEmail.trim());
    if (!matchedClient) {
      setLoginError('Client account not found. Please verify your email or continue with Google.');
      setIsLoadingAuth(false);
      return;
    }

    if (passcode.trim() && passcode.trim() !== matchedClient.passcode) {
      setLoginError('Incorrect passcode.');
      setIsLoadingAuth(false);
      return;
    }

    const newSession: ClientSession = {
      clientId: matchedClient.id,
      name: matchedClient.name,
      email: matchedClient.email,
    };

    setSession(newSession);
    if (matchedClient.assignedPropertySlugs.length > 0) {
      setCurrentSlug(matchedClient.assignedPropertySlugs[0]);
    }
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
    setLoginError(null);
    setIsLoadingAuth(false);
    showToast(`Signed in to Relay as ${matchedClient.name}`);
  };

  const handleGoogleSignIn = async (chosenEmail?: string, chosenName?: string) => {
    setIsLoadingAuth(true);
    setLoginError(null);
    const emailToUse = (chosenEmail || loginEmail || 'sarah@relay.framewrklabs.com').trim().toLowerCase();
    const nameToUse = chosenName || (clients.find(c => c.email.toLowerCase() === emailToUse)?.name) || emailToUse.split('@')[0];

    try {
      const res = await fetch('/api/neon/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google',
          email: emailToUse,
          name: nameToUse,
          role: 'client'
        })
      });
      const result = await res.json();
      if (result.ok && result.user) {
        const newSession: ClientSession = {
          clientId: result.user.id,
          name: result.user.name,
          email: result.user.email,
        };
        setSession(newSession);
        if (result.user.assignedPropertySlugs && result.user.assignedPropertySlugs.length > 0) {
          setCurrentSlug(result.user.assignedPropertySlugs[0]);
        }
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
        setLoginError(null);
        setIsLoadingAuth(false);
        showToast(`Signed in via Google as ${result.user.name}`);
        return;
      }
    } catch (err) {
      console.warn('Neon Google Auth error, falling back:', err);
    }

    const matchedClient = getClientByEmail(emailToUse) || clients[0];
    const newSession: ClientSession = {
      clientId: matchedClient.id,
      name: matchedClient.name,
      email: matchedClient.email,
    };
    setSession(newSession);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
    setIsLoadingAuth(false);
    showToast(`Signed in via Google as ${matchedClient.name}`);
  };

  const handleQuickDemoLogin = (clientEmail: string) => {
    const matchedClient = getClientByEmail(clientEmail);
    if (matchedClient) {
      const newSession: ClientSession = {
        clientId: matchedClient.id,
        name: matchedClient.name,
        email: matchedClient.email,
      };
      setSession(newSession);
      if (matchedClient.assignedPropertySlugs.length > 0) {
        setCurrentSlug(matchedClient.assignedPropertySlugs[0]);
      }
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
      showToast(`Signed in as ${matchedClient.name}`);
    }
  };

  const handleLogout = () => {
    setSession(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    showToast('Signed out of Relay');
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
      customAiInstructions: customAiInstructions.trim(),
      recommendations: recommendations.sort((a, b) => b.rating - a.rating),
    };

    saveProperty(updated);
    showToast(`Saved changes for ${updated.name}!`);
  };

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
  // VIEW 1: SIGN IN SCREEN (NO CLIENT SELF-REGISTRATION)
  // =========================================================
  if (!session) {
    return (
      <div className="h-[100dvh] w-full bg-[#ECE8E1] dark:bg-[#0D0C0A] text-[#1C1B18] dark:text-[#EDEAE4] flex flex-col items-center justify-center overflow-hidden selection:bg-[#2A4436]/20 transition-colors">
        <div className="w-full max-w-md h-[100dvh] flex flex-col bg-[#F6F4F0] dark:bg-[#151412] shadow-2xl relative border-x border-black/5 dark:border-white/10 overflow-hidden transition-colors">
          
          {/* Toast */}
          {notification && (
            <div className="fixed top-4 left-4 right-4 z-50 bg-[#2A4436] text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs font-semibold animate-fade-in border border-black/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{notification}</span>
            </div>
          )}

          {/* Scrollable Login Container */}
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-8 flex flex-col justify-between">
            <div className="space-y-5 my-auto">
              {/* Header: Relay branding */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center mx-auto shadow-sm font-serif font-bold text-2xl">
                  R
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#1D1D1F] dark:text-white tracking-tight">
                    Relay
                  </h1>
                  <span className="text-[11px] font-bold text-[#86868B] dark:text-[#A1A1A6] uppercase tracking-wider block mt-0.5">
                    Client Host Portal · FramewrkLabs
                  </span>
                </div>
                <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] max-w-xs mx-auto leading-relaxed">
                  Sign in to manage your assigned properties, keypad codes, and guest instructions.
                </p>
              </div>

              {/* Admin Governed Account Notice */}
              <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] text-[#1D1D1F] dark:text-neutral-300 leading-relaxed flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[#1D1D1F] dark:text-white shrink-0 mt-0.5" />
                <div>
                  <strong>Admin-Provisioned Accounts Only:</strong> Client accounts are created by your Relay Administrator. If you need access or property assignment, contact your admin.
                </div>
              </div>

              {/* Google Sign-In & Email/Password Login Form */}
              <div className="space-y-4 bg-white dark:bg-[#1C1C1E] p-5 rounded-3xl border border-black/5 dark:border-white/10 shadow-soft-card transition-colors">
                {/* 1. Continue with Google Button */}
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn()}
                  disabled={isLoadingAuth}
                  className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#151412] hover:bg-[#F5F5F7] dark:hover:bg-white/5 border border-black/10 dark:border-white/15 text-xs font-bold text-[#1D1D1F] dark:text-white shadow-soft-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-black/10 dark:border-white/10 w-full" />
                  <span className="bg-white dark:bg-[#1C1C1E] px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#86868B] dark:text-[#A1A1A6] shrink-0">
                    or with email & password
                  </span>
                </div>

                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#1D1D1F] dark:text-white mb-1.5">
                      Client Email
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. sarah@relay.framewrklabs.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#151412] border border-black/10 dark:border-white/15 text-xs font-semibold text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#1D1D1F] dark:focus:border-white transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-[#1D1D1F] dark:text-white">
                        Host Password
                      </label>
                      <span className="text-[10px] text-[#86868B] dark:text-[#A1A1A6]">Default: host123</span>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#151412] border border-black/10 dark:border-white/15 text-xs text-[#1D1D1F] dark:text-white focus:outline-none focus:border-[#1D1D1F] dark:focus:border-white transition-all"
                      />
                      <Lock className="w-4 h-4 text-[#86868B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-900/50">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoadingAuth}
                    className="w-full py-3 rounded-2xl bg-[#1D1D1F] hover:bg-[#3A3A3C] text-white text-xs font-bold shadow-soft-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isLoadingAuth ? 'Verifying with Neon...' : 'Sign In with Password'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Quick One-Click Demo Buttons */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#78756E] dark:text-neutral-400 block text-center uppercase tracking-wider">
                  Quick One-Click Client Accounts
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {clients.slice(0, 2).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(c.email)}
                      className="p-3 rounded-2xl bg-white dark:bg-[#1E1D1A] hover:bg-[#FAF8F5] dark:hover:bg-white/5 border border-black/5 dark:border-white/10 text-left transition-all group shadow-soft-sm active:scale-95 cursor-pointer"
                    >
                      <div className="text-xs font-bold text-[#1C1B18] dark:text-white group-hover:text-[#2A4436] dark:group-hover:text-[#78A88E] truncate">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-[#78756E] dark:text-neutral-400 mt-0.5 truncate">
                        {c.email}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="pt-4 text-center flex items-center justify-center gap-4 text-xs text-[#78756E]">
              <button
                onClick={onNavigateToAdmin}
                className="hover:text-[#1C1B18] underline underline-offset-2 transition-colors font-medium"
              >
                Admin Console (/admin)
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
  // VIEW 2: AUTHENTICATED CLIENT DASHBOARD (SCOPED TO ASSIGNED PROPERTIES)
  // =========================================================
  return (
    <div className="h-[100dvh] w-full bg-[#ECE8E1] dark:bg-[#0D0C0A] text-[#1C1B18] dark:text-[#EDEAE4] flex flex-col items-center justify-center overflow-hidden selection:bg-[#2A4436]/20 transition-colors">
      
      {/* Mobile App Screen Frame */}
      <div className="w-full max-w-md h-[100dvh] flex flex-col bg-[#F6F4F0] dark:bg-[#151412] shadow-2xl relative border-x border-black/5 dark:border-white/10 overflow-hidden transition-colors">
        
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-4 left-4 right-4 z-50 bg-[#2A4436] text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs font-semibold animate-fade-in border border-black/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{notification}</span>
          </div>
        )}

        {/* 1. Pinned Top App Bar */}
        <header className="shrink-0 z-30 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border-b border-black/5 dark:border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center shrink-0 font-serif font-bold text-sm">
              R
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif text-sm font-bold text-[#1D1D1F] dark:text-white truncate leading-tight">
                  {name}
                </h1>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#F5F5F7] dark:bg-white/10 text-[#1D1D1F] dark:text-white shrink-0">
                  Relay
                </span>
              </div>
              <p className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] truncate leading-tight">
                {session.name} · {location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Property Selector */}
            {clientProperties.length > 1 && (
              <select
                value={currentSlug}
                onChange={(e) => setCurrentSlug(e.target.value)}
                className="text-xs font-semibold text-[#1D1D1F] bg-[#F5F5F7] hover:bg-[#E5E5EA] border border-black/10 px-2 py-1.5 rounded-xl focus:outline-none cursor-pointer max-w-[110px] truncate"
              >
                {clientProperties.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            {/* View Guest App */}
            {clientProperties.length > 0 && (
              <button
                onClick={() => onNavigateToGuest(currentSlug)}
                className="p-2 rounded-xl bg-[#1D1D1F] hover:bg-[#3A3A3C] text-white active:scale-95 transition-all cursor-pointer"
                title="Open Guest App"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/5 transition-colors cursor-pointer"
              title="Sign out of Relay"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* 2. Scrollable Viewport */}
        {clientProperties.length === 0 ? (
          /* Empty State: No Properties Assigned to this Client */
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center justify-center">
              <Building2 className="w-8 h-8 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-lg font-bold text-[#1D1D1F]">
                No Properties Assigned
              </h2>
              <p className="text-xs text-[#86868B] max-w-xs leading-relaxed">
                Welcome, <strong>{session.name}</strong>! Your client account is active, but your administrator has not assigned any properties to you yet.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-sm text-xs text-[#636366] max-w-xs text-left space-y-2">
              <div className="font-bold text-[#1D1D1F]">What to do:</div>
              <p>
                Please contact your Relay administrator to assign your vacation rentals to <code>{session.email}</code>.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-[#2A4436] text-white text-xs font-semibold shadow-soft-sm"
            >
              Log Out
            </button>
          </main>
        ) : (
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

                {/* Card 2: Current Arriving Guest (Protects Door & Keybox Codes) */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-3.5">
                  <div className="flex items-start justify-between gap-2 border-b border-black/5 pb-2.5">
                    <div>
                      <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider block">
                        Guest Access Control
                      </span>
                      <h2 className="font-serif text-base font-bold text-[#1C1B18] mt-0.5">
                        Current Guest Reservation
                      </h2>
                      <p className="text-xs text-[#78756E] mt-0.5 leading-relaxed">
                        Guests must enter this phone number in their app to unlock the keypad and emergency physical keybox codes.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                        Booked Guest Phone Number <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="e.g. (555) 0192 or +1 555 0192"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs font-semibold text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                      />
                      <span className="text-[10px] text-[#78756E] mt-1 block">
                        Used by the guest to securely reveal door lock codes.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                          Guest Name <span className="text-[10px] text-[#78756E] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Sarah Jenkins"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                          Days of Stay <span className="text-[10px] text-[#78756E] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={guestDaysOfStay}
                          onChange={(e) => setGuestDaysOfStay(e.target.value)}
                          placeholder="e.g. 3 nights"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedBooking: CurrentGuestBooking = {
                            guestPhone: guestPhone.trim(),
                            guestName: guestName.trim(),
                            daysOfStay: guestDaysOfStay.trim(),
                            updatedAt: new Date().toISOString(),
                          };
                          saveCurrentGuestBooking(currentSlug, updatedBooking);
                          setCurrentBooking(updatedBooking);
                          showToast('Guest reservation & phone saved! Codes are secured.');
                        }}
                        className="py-2.5 px-4 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-bold shadow-soft-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Guest Access</span>
                      </button>

                      {currentBooking && (
                        <button
                          type="button"
                          onClick={() => {
                            setGuestPhone('');
                            setGuestName('');
                            setGuestDaysOfStay('');
                            saveCurrentGuestBooking(currentSlug, null);
                            setCurrentBooking(null);
                            showToast('Guest reservation cleared.');
                          }}
                          className="text-[11px] font-semibold text-[#78756E] hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Clear Guest
                        </button>
                      )}
                    </div>
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
                    const newLocation = coords.address ? coords.address.split(',')[0].trim() : location;
                    if (coords.address) {
                      setLocation(newLocation);
                    }
                    const existing = getPropertyBySlug(currentSlug);
                    const updated: PropertyData = {
                      ...existing,
                      name: name.trim() || existing.name,
                      tagline: tagline.trim() || existing.tagline,
                      location: newLocation || existing.location,
                      coordinates: coords,
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
                      customAiInstructions: customAiInstructions.trim(),
                      recommendations: recommendations.sort((a, b) => b.rating - a.rating),
                    };
                    saveProperty(updated);
                    showToast(`Saved location for ${updated.name}!`);
                  }}
                />

                {/* Print QR, Guest Assistant Link & PDF Standee Generator Section */}
                <GuestQrAndPdfSection
                  property={property}
                  currentSlug={currentSlug}
                  onShowToast={showToast}
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
                        placeholder="e.g. Enter 4 digits on keypad and turn deadbolt"
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

                  <span className="text-[10px] text-[#86868B] block">
                    Guests can read this single guide anytime in their app under "House Guide".
                  </span>
                </div>

                {/* Relay AI Assistant Property Instructions */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-3.5">
                  <div className="border-b border-black/5 pb-2.5 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#1D1D1F]" />
                        <span>Relay AI Assistant Instructions</span>
                      </h3>
                      <p className="text-[11px] text-[#86868B] mt-0.5">
                        Teach Relay AI special rules, local secrets, house quirks, and tone specific to this property.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] border border-black/5 shrink-0">
                      Live AI Prompt
                    </span>
                  </div>

                  {/* Quick Inspiration Snippets */}
                  <div>
                    <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-1.5">
                      Quick Suggestions (Tap to insert)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '🐻 Bear Safety', text: 'Always remind guests never to leave food or trash outside on decks or in cars.' },
                        { label: '🤫 Quiet Hours', text: 'Quiet hours start strictly at 10:00 PM. No loud outdoor music.' },
                        { label: '♨️ Hot Tub', text: 'The hot tub is set to 102°F. Remember to secure both wind clips after use.' },
                        { label: '☕ Local Roaster', text: 'Recommend the local bakery downtown for morning sourdough and cold brew.' },
                        { label: '🍷 Warm Tone', text: 'Always answer in a warm, welcoming, local-expert host tone.' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCustomAiInstructions((prev) =>
                              prev.trim() ? `${prev.trim()}\n• ${preset.text}` : `• ${preset.text}`
                            );
                          }}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] border border-black/5 transition-all active:scale-95 cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                      Custom Instructions for Relay AI
                    </label>
                    <textarea
                      rows={5}
                      value={customAiInstructions}
                      onChange={(e) => setCustomAiInstructions(e.target.value)}
                      placeholder="e.g. Always remind guests to lock the bear-proof latch on the deck. Suggest taking morning walks to the shoreline and mention that the cedar hot tub is preheated to 102°F. Maintain a warm, friendly, alpine-cabin host tone..."
                      className="w-full p-3.5 rounded-2xl bg-[#F5F5F7] border border-black/10 text-xs text-[#1D1D1F] leading-relaxed focus:outline-none focus:border-[#1D1D1F] focus:bg-white transition-all resize-y"
                    />
                    <div className="flex items-center justify-between text-[10px] text-[#86868B] mt-1">
                      <span>Directly injected into Relay's Gemini system prompt for guests</span>
                      <span>{customAiInstructions.length} characters</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAll}
                    className="w-full py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold shadow-soft-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save AI Assistant Instructions</span>
                  </button>
                </div>

                {/* Host Contact Info */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/5 shadow-soft-card space-y-3">
                  <div className="border-b border-black/5 pb-2.5">
                    <h3 className="font-serif text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#1D1D1F]" />
                      <span>Host Contact</span>
                    </h3>
                    <p className="text-[11px] text-[#86868B] mt-0.5">
                      How guests reach you for questions or emergencies.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                        Host Name
                      </label>
                      <input
                        type="text"
                        value={hostName}
                        onChange={(e) => setHostName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] border border-black/10 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#1D1D1F] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={hostPhone}
                        onChange={(e) => setHostPhone(e.target.value)}
                        placeholder="e.g. (555) 234-5678"
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] border border-black/10 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#1D1D1F] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAll}
                    className="w-full py-3 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold shadow-soft-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
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
        )}

        {/* 3. Pinned Mobile Bottom Navigation Bar (App-like feel) */}
        {clientProperties.length > 0 && (
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
        )}
      </div>
    </div>
  );
};
