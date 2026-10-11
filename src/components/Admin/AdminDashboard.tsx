import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Activity, 
  Users, 
  Server, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  Sparkles,
  QrCode,
  Lock,
  Wifi,
  Phone,
  FileText
} from 'lucide-react';
import { 
  getAllPropertiesList, 
  getPropertyBySlug, 
  saveProperty, 
  deleteProperty, 
  DEFAULT_SLUG 
} from '../../data/properties';
import { getStayStatus, setStayStatus } from '../../utils/stayState';
import { GuestStayStatus, PropertyData } from '../../types';

interface AdminDashboardProps {
  onNavigateToGuest: (slug: string) => void;
  onNavigateToClientPortal: (slug?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToGuest,
  onNavigateToClientPortal,
}) => {
  const [propertyList, setPropertyList] = useState(getAllPropertiesList);
  const [statuses, setStatuses] = useState<Record<string, GuestStayStatus>>(() => {
    const list = getAllPropertiesList();
    const res: Record<string, GuestStayStatus> = {};
    for (const p of list) {
      res[p.slug] = getStayStatus(p.slug);
    }
    return res;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertySlug, setSelectedPropertySlug] = useState<string>('cedar-house');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Property Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    location: '',
    tagline: '',
    hostName: '',
    hostPhone: '',
    wifiNetwork: '',
    wifiPassword: '',
    accessCode: '',
    lockType: 'Smart Keypad',
    houseGuideText: '',
    heroImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Sync statuses & properties live
  useEffect(() => {
    const syncAll = () => {
      const list = getAllPropertiesList();
      setPropertyList(list);
      const res: Record<string, GuestStayStatus> = {};
      for (const p of list) {
        res[p.slug] = getStayStatus(p.slug);
      }
      setStatuses(res);
    };

    window.addEventListener('stay-status-change', syncAll);
    window.addEventListener('properties-updated', syncAll);
    window.addEventListener('storage', syncAll);
    return () => {
      window.removeEventListener('stay-status-change', syncAll);
      window.removeEventListener('properties-updated', syncAll);
      window.removeEventListener('storage', syncAll);
    };
  }, []);

  const handleManualStatusToggle = (slug: string, newStatus: GuestStayStatus) => {
    setStayStatus(slug, newStatus);
    setStatuses(prev => ({ ...prev, [slug]: newStatus }));
    showNotification(`Status updated to "${newStatus.replace(/_/g, ' ')}" for ${slug}`);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const list = getAllPropertiesList();
      setPropertyList(list);
      const res: Record<string, GuestStayStatus> = {};
      for (const p of list) {
        res[p.slug] = getStayStatus(p.slug);
      }
      setStatuses(res);
      setIsRefreshing(false);
      showNotification('Fleet status synchronized with local storage');
    }, 350);
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      slug: '',
      location: '',
      tagline: '',
      hostName: 'Sarah Jenkins',
      hostPhone: '(555) 123-4567',
      wifiNetwork: 'Guest_WiFi',
      wifiPassword: 'welcome2026!',
      accessCode: '*1234#',
      lockType: 'Smart Keypad',
      houseGuideText: '### Welcome to your stay!\nFeel free to enjoy the amenities and contact us if you need anything.',
      heroImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (prop: PropertyData) => {
    setFormData({
      name: prop.name,
      slug: prop.slug,
      location: prop.location,
      tagline: prop.tagline,
      hostName: prop.host.name,
      hostPhone: prop.host.phoneFormatted,
      wifiNetwork: prop.wifi.network,
      wifiPassword: prop.wifi.password,
      accessCode: prop.checkIn.accessCode,
      lockType: prop.checkIn.lockType,
      houseGuideText: prop.houseGuideText,
      heroImage: prop.heroImage,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const slug = (formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'client-' + Date.now();

    const newProperty: PropertyData = {
      slug,
      name: formData.name.trim(),
      tagline: formData.tagline.trim() || 'Luxury Vacation Home & Retreat',
      location: formData.location.trim() || 'Scenic Retreat',
      coordinates: {
        lat: 39.1677,
        lng: -120.1452,
        address: formData.location.trim() || 'Scenic Retreat',
      },
      heroImage: formData.heroImage.trim() || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      assistantName: `${formData.name.trim()} Assistant`,
      host: {
        name: formData.hostName.trim() || 'Host Care',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
        phone: formData.hostPhone.trim() || '+15551234567',
        phoneFormatted: formData.hostPhone.trim() || '(555) 123-4567',
        emergencyPhone: '(555) 911-0000',
        email: 'concierge@rental.com',
        responseTime: 'under 10 mins',
        superhost: true,
        rating: 4.95,
        reviewCount: 48,
      },
      wifi: {
        network: formData.wifiNetwork.trim() || 'Guest_WiFi',
        password: formData.wifiPassword.trim() || 'stayquiet2026',
        qrCodeText: `WIFI:T:WPA;S:${formData.wifiNetwork};P:${formData.wifiPassword};;`,
      },
      checkIn: {
        time: '4:00 PM',
        lockType: formData.lockType.trim() || 'Smart Keypad',
        accessCode: formData.accessCode.trim() || '*1234#',
        doorInstructions: [
          'Touch keypad to activate numbers.',
          `Enter code ${formData.accessCode.trim() || '*1234#'} followed by #.`,
          'Turn handle upon confirmation beep.',
        ],
        parkingInfo: 'Driveway parking available on site.',
        evCharger: 'Standard Level 2 EV charging available.',
        earlyCheckInPolicy: 'Available upon advance request.',
        emergencyKeybox: 'Lockbox located near side entrance.',
      },
      houseGuideText: formData.houseGuideText || '### House Guide\nEnjoy your stay and treat our home with care.',
      recommendations: [
        {
          id: 'rec-1',
          category: 'coffee',
          name: 'Local Roasters & Bakery',
          type: 'Artisan Coffee & Pastries',
          distance: '5 mins drive',
          address: 'Downtown Main St',
          description: 'Top-rated neighborhood coffee spot with fresh morning pastries.',
          rating: 4.9,
          highlight: 'House blend espresso and cinnamon buns.',
        }
      ],
      houseRules: [
        'Quiet hours from 10:00 PM to 8:00 AM.',
        'No smoking inside premises.',
        'Please turn off lights and AC when leaving.'
      ],
      emergencyContacts: [
        {
          label: 'Primary Host',
          name: formData.hostName.trim() || 'Host',
          number: formData.hostPhone.trim() || '(555) 123-4567',
          description: 'Direct phone & text assistance.'
        },
        {
          label: 'Emergency',
          name: 'Emergency Services',
          number: '911',
          description: 'Police, Fire, Ambulance'
        }
      ]
    };

    saveProperty(newProperty);
    const updatedList = getAllPropertiesList();
    setPropertyList(updatedList);
    setSelectedPropertySlug(slug);
    setIsCreateModalOpen(false);
    showNotification(`New client "${newProperty.name}" created and synced at /client/${slug}!`);
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = getPropertyBySlug(formData.slug);
    if (!existing) return;

    const updated: PropertyData = {
      ...existing,
      name: formData.name.trim() || existing.name,
      location: formData.location.trim() || existing.location,
      tagline: formData.tagline.trim() || existing.tagline,
      heroImage: formData.heroImage.trim() || existing.heroImage,
      host: {
        ...existing.host,
        name: formData.hostName.trim() || existing.host.name,
        phoneFormatted: formData.hostPhone.trim() || existing.host.phoneFormatted,
      },
      wifi: {
        ...existing.wifi,
        network: formData.wifiNetwork.trim() || existing.wifi.network,
        password: formData.wifiPassword.trim() || existing.wifi.password,
      },
      checkIn: {
        ...existing.checkIn,
        accessCode: formData.accessCode.trim() || existing.checkIn.accessCode,
        lockType: formData.lockType.trim() || existing.checkIn.lockType,
      },
      houseGuideText: formData.houseGuideText || existing.houseGuideText,
    };

    saveProperty(updated);
    const updatedList = getAllPropertiesList();
    setPropertyList(updatedList);
    setIsEditModalOpen(false);
    showNotification(`Client "${updated.name}" updated successfully!`);
  };

  const handleDeleteClient = (slug: string) => {
    if (slug === DEFAULT_SLUG) {
      alert('The primary default property (Cedar House) cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete client deployment "${slug}"?`)) {
      const ok = deleteProperty(slug);
      if (ok) {
        const updatedList = getAllPropertiesList();
        setPropertyList(updatedList);
        setSelectedPropertySlug(DEFAULT_SLUG);
        showNotification(`Client "${slug}" deleted from registry.`);
      }
    }
  };

  const totalDeployments = propertyList.length;
  const checkedInCount = Object.values(statuses).filter(s => s === 'checked_in').length;
  const checkedOutCount = Object.values(statuses).filter(s => s === 'checked_out').length;

  const filteredProperties = propertyList.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProperty = getPropertyBySlug(selectedPropertySlug);

  return (
    <div className="min-h-screen bg-[#F6F4F0] text-[#1C1B18] font-sans antialiased selection:bg-[#2A4436]/20 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#2A4436] text-white px-4 py-2.5 rounded-2xl shadow-soft-lg flex items-center gap-2 text-xs font-semibold animate-fade-in border border-black/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Desktop Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-base font-bold tracking-tight text-[#1C1B18]">
                Rental AI Fleet Operations
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF2EC] text-[#2A4436]">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-[#78756E]">Multi-tenant property management & live AI guest assistant telemetry</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-semibold shadow-soft-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Client</span>
          </button>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#5C5A55] border border-black/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Fleet</span>
          </button>

          <button
            onClick={() => onNavigateToClientPortal(selectedPropertySlug)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#2A4436] text-xs font-semibold border border-[#2A4436]/30 shadow-soft-sm transition-all"
            title="Open Client Host Dashboard (/client)"
          >
            <span>Client Portal (/client)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-soft-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider">Total Properties</span>
              <div className="font-serif text-2xl font-bold text-[#1C1B18] mt-1">{totalDeployments} Clients</div>
              <span className="text-[11px] text-[#2A4436] flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Real-time localStorage Sync
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center">
              <Building2 className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-soft-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider">Active Guest Stays</span>
              <div className="font-serif text-2xl font-bold text-[#2A4436] mt-1">{checkedInCount} Checked In</div>
              <span className="text-[11px] text-[#78756E] mt-1 block">
                {checkedOutCount} Checked Out today
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center">
              <Users className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-soft-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider">Backend AI Model</span>
              <div className="font-mono text-sm sm:text-base font-bold text-[#1C1B18] mt-1">gemini-3.1-flash-lite</div>
              <span className="text-[11px] text-[#2A4436] flex items-center gap-1 mt-1 font-medium">
                <Zap className="w-3.5 h-3.5" /> High-speed streaming
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#7A684D] flex items-center justify-center">
              <Zap className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-soft-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider">Client Facing Route</span>
              <div className="font-mono text-base font-bold text-[#1C1B18] mt-1">/client</div>
              <span className="text-[11px] text-[#78756E] mt-1 block">
                Host Portal with Login Active
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center">
              <Server className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Deployments Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/5 shadow-soft-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#1C1B18]">Managed Client Properties</h2>
                  <p className="text-xs text-[#78756E]">All active properties, accessible at /client/:slug and /stay/:slug</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#78756E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search property..."
                      className="bg-[#F6F4F0] border border-black/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1C1B18] placeholder-[#78756E] focus:outline-none focus:border-[#2A4436] focus:bg-white w-48"
                    />
                  </div>
                  <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-semibold transition-all shrink-0"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[#78756E] border-b border-black/5 uppercase tracking-wider font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Property</th>
                      <th className="py-2.5 px-3">URL Slug</th>
                      <th className="py-2.5 px-3">Stay Status</th>
                      <th className="py-2.5 px-3">Lock Code</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredProperties.map((p) => {
                      const prop = getPropertyBySlug(p.slug);
                      const currentStatus = statuses[p.slug] || 'not_checked_in';
                      const isSelected = selectedPropertySlug === p.slug;

                      return (
                        <tr
                          key={p.slug}
                          onClick={() => setSelectedPropertySlug(p.slug)}
                          className={`hover:bg-[#FAF8F5] cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#F6F4F0]/80 border-l-2 border-[#2A4436]' : ''
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#1C1B18]">{prop.name}</div>
                            <div className="text-[#78756E] text-[11px]">{prop.location}</div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[#2A4436] font-medium">
                            /client/{p.slug}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              currentStatus === 'checked_in'
                                ? 'bg-[#EBF2EC] text-[#2A4436]'
                                : currentStatus === 'checked_out'
                                ? 'bg-[#F4EFE6] text-[#7A684D]'
                                : 'bg-black/5 text-[#78756E]'
                            }`}>
                              ● {currentStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[#1C1B18]">
                            {prop.checkIn.accessCode}
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToGuest(p.slug);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[#1C1B18] text-[11px] font-semibold transition-colors"
                              title="Open Guest Assistant"
                            >
                              Guest App ↗
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(prop);
                              }}
                              className="px-2 py-1 rounded-lg bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[#5C5A55] text-[11px] font-medium transition-colors"
                              title="Edit Property"
                            >
                              <Edit3 className="w-3 h-3 inline" />
                            </button>
                            {p.slug !== DEFAULT_SLUG && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClient(p.slug);
                                daylight:
                                  handleDeleteClient(p.slug);
                                }}
                                className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-medium transition-colors"
                                title="Delete Property"
                              >
                                <Trash2 className="w-3 h-3 inline" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Fleet Status & Telemetry */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/5 shadow-soft-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#2A4436]" />
                  <h3 className="font-serif text-sm font-bold text-[#1C1B18]">Concierge Telemetry & Gateway Status</h3>
                </div>
                <span className="text-[10px] font-bold text-[#2A4436] bg-[#EBF2EC] px-2.5 py-0.5 rounded-full">
                  All Systems Operational
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/5 space-y-1">
                  <span className="text-[10px] font-bold text-[#78756E] uppercase">AI Model</span>
                  <div className="font-mono font-bold text-[#1C1B18]">gemini-3.1-flash-lite</div>
                  <span className="text-[11px] text-[#2A4436]">Response Time ~380ms</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/5 space-y-1">
                  <span className="text-[10px] font-bold text-[#78756E] uppercase">Client Portal</span>
                  <div className="font-mono font-bold text-[#1C1B18]">/client</div>
                  <span className="text-[11px] text-[#78756E]">Authentication Guard Active</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/5 space-y-1">
                  <span className="text-[10px] font-bold text-[#78756E] uppercase">Fleet Persistence</span>
                  <div className="font-mono font-bold text-[#1C1B18]">localStorage v2.5</div>
                  <span className="text-[11px] text-[#2A4436]">Reactive Event Bus Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Property Details Panel */}
          <div className="space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/5 shadow-soft-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#78756E]">
                    Inspector Panel
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1C1B18]">
                    {selectedProperty.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleOpenEditModal(selectedProperty)}
                  className="p-1.5 rounded-xl bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[#2A4436] transition-colors"
                  title="Edit details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Cover Photo */}
              <div className="relative rounded-2xl overflow-hidden h-36 border border-black/5">
                <img
                  src={selectedProperty.heroImage}
                  alt={selectedProperty.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                  <span className="text-xs font-mono font-semibold text-white">
                    /client/{selectedProperty.slug}
                  </span>
                </div>
              </div>

              {/* Status Manager for this property */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#78756E] block">
                  Quick Stay Status Override
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleManualStatusToggle(selectedProperty.slug, 'not_checked_in')}
                    className={`py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      statuses[selectedProperty.slug] === 'not_checked_in'
                        ? 'bg-[#1C1B18] text-white shadow-sm'
                        : 'bg-white hover:bg-[#ECE8E1] text-[#78756E] border border-black/5'
                    }`}
                  >
                    Awaiting
                  </button>
                  <button
                    onClick={() => handleManualStatusToggle(selectedProperty.slug, 'checked_in')}
                    className={`py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      statuses[selectedProperty.slug] === 'checked_in'
                        ? 'bg-[#2A4436] text-white shadow-sm'
                        : 'bg-white hover:bg-[#ECE8E1] text-[#2A4436] border border-black/5'
                    }`}
                  >
                    Checked In
                  </button>
                  <button
                    onClick={() => handleManualStatusToggle(selectedProperty.slug, 'checked_out')}
                    className={`py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      statuses[selectedProperty.slug] === 'checked_out'
                        ? 'bg-[#7A684D] text-white shadow-sm'
                        : 'bg-white hover:bg-[#ECE8E1] text-[#7A684D] border border-black/5'
                    }`}
                  >
                    Checked Out
                  </button>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5]">
                  <span className="text-[#78756E]">Lock Access Code:</span>
                  <span className="font-mono font-bold text-[#1C1B18]">{selectedProperty.checkIn.accessCode}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5]">
                  <span className="text-[#78756E]">Wi-Fi Network:</span>
                  <span className="font-mono font-bold text-[#1C1B18]">{selectedProperty.wifi.network}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5]">
                  <span className="text-[#78756E]">Host Contact:</span>
                  <span className="font-medium text-[#1C1B18]">{selectedProperty.host.name} ({selectedProperty.host.phoneFormatted})</span>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-black/5">
                <button
                  onClick={() => onNavigateToClientPortal(selectedProperty.slug)}
                  className="w-full py-2.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-semibold shadow-soft-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Open in Client Portal (/client)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onNavigateToGuest(selectedProperty.slug)}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-black/10 text-xs font-semibold text-[#1C1B18] shadow-soft-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Launch Guest App (/client/{selectedProperty.slug})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE NEW CLIENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#78756E]">Super Admin</span>
                <h3 className="font-serif text-lg font-bold text-[#1C1B18]">Deploy New Client Property</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-[#78756E] hover:text-[#1C1B18] hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewClient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Property Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setFormData(prev => ({ ...prev, name: val, slug: prev.slug || autoSlug }));
                    }}
                    placeholder="e.g. Silver Lake Chalet"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">URL Slug *</label>
                  <div className="flex items-center">
                    <span className="bg-[#FAF8F5] text-[#78756E] px-2.5 py-2 rounded-l-xl border border-r-0 border-black/10 font-mono">/client/</span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="silver-lake-chalet"
                      className="w-full px-3 py-2 rounded-r-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] font-mono focus:outline-none focus:border-[#2A4436] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Mammoth Lakes, CA"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="e.g. Alpine Spa Cabin"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Host Name</label>
                  <input
                    type="text"
                    value={formData.hostName}
                    onChange={(e) => setFormData(prev => ({ ...prev, hostName: e.target.value }))}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Host Phone</label>
                  <input
                    type="text"
                    value={formData.hostPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, hostPhone: e.target.value }))}
                    placeholder="e.g. (555) 123-4567"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Wi-Fi Network (SSID)</label>
                  <input
                    type="text"
                    value={formData.wifiNetwork}
                    onChange={(e) => setFormData(prev => ({ ...prev, wifiNetwork: e.target.value }))}
                    placeholder="e.g. Chalet_Guest"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] font-mono focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Wi-Fi Password</label>
                  <input
                    type="text"
                    value={formData.wifiPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, wifiPassword: e.target.value }))}
                    placeholder="e.g. mountainpines!"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] font-mono focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Door Access Code</label>
                  <input
                    type="text"
                    value={formData.accessCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessCode: e.target.value }))}
                    placeholder="e.g. *4829#"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] font-mono focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Lock System Type</label>
                  <input
                    type="text"
                    value={formData.lockType}
                    onChange={(e) => setFormData(prev => ({ ...prev, lockType: e.target.value }))}
                    placeholder="e.g. August Smart Keypad"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1C1B18] font-semibold mb-1">House Guide / Manual</label>
                <textarea
                  rows={3}
                  value={formData.houseGuideText}
                  onChange={(e) => setFormData(prev => ({ ...prev, houseGuideText: e.target.value }))}
                  placeholder="Appliance instructions, hot tub guidelines, trash policy..."
                  className="w-full p-3 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white resize-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[#78756E] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white font-bold shadow-soft-sm"
                >
                  Deploy Client Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLIENT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#78756E]">Edit Client</span>
                <h3 className="font-serif text-lg font-bold text-[#1C1B18]">Update Property Details</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-xl text-[#78756E] hover:text-[#1C1B18] hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Property Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1C1B18] font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Host Name</label>
                  <input
                    type="text"
                    value={formData.hostName}
                    onChange={(e) => setFormData(prev => ({ ...prev, hostName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Host Phone</label>
                  <input
                    type="text"
                    value={formData.hostPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, hostPhone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Wi-Fi Network</label>
                  <input
                    type="text"
                    value={formData.wifiNetwork}
                    onChange={(e) => setFormData(prev => ({ ...prev, wifiNetwork: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] font-mono focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Wi-Fi Password</label>
                  <input
                    type="text"
                    value={formData.wifiPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, wifiPassword: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] font-mono focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Access Code</label>
                  <input
                    type="text"
                    value={formData.accessCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessCode: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] font-mono focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#1C1B18] font-semibold mb-1">Lock Type</label>
                  <input
                    type="text"
                    value={formData.lockType}
                    onChange={(e) => setFormData(prev => ({ ...prev, lockType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1C1B18] font-semibold mb-1">House Guide / Manual</label>
                <textarea
                  rows={3}
                  value={formData.houseGuideText}
                  onChange={(e) => setFormData(prev => ({ ...prev, houseGuideText: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-[#F6F4F0] border border-black/10 text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white resize-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[#78756E] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white font-bold shadow-soft-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
