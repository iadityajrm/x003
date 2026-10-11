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
  FileText,
  UserCheck,
  UserPlus,
  Mail,
  KeyRound,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  getAllPropertiesList, 
  getPropertyBySlug, 
  saveProperty, 
  deleteProperty, 
  DEFAULT_SLUG 
} from '../../data/properties';
import { 
  getAllClients, 
  createClient, 
  updateClient, 
  deleteClient, 
  assignPropertyToClient, 
  removePropertyFromClient,
  getClientForProperty
} from '../../data/clients';
import { getStayStatus, setStayStatus } from '../../utils/stayState';
import { GuestStayStatus, PropertyData, ClientAccount } from '../../types';

interface AdminDashboardProps {
  onNavigateToGuest: (slug: string) => void;
  onNavigateToClientPortal: (slug?: string) => void;
}

type AdminViewTab = 'properties' | 'clients';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToGuest,
  onNavigateToClientPortal,
}) => {
  const [activeTab, setActiveTab] = useState<AdminViewTab>('properties');
  const [propertyList, setPropertyList] = useState(getAllPropertiesList);
  const [clients, setClients] = useState<ClientAccount[]>(getAllClients);
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

  // Property Modal States
  const [isCreatePropertyModalOpen, setIsCreatePropertyModalOpen] = useState(false);
  const [isEditPropertyModalOpen, setIsEditPropertyModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Client Modal States
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState<{
    id?: string;
    name: string;
    email: string;
    passcode: string;
    assignedPropertySlugs: string[];
  }>({
    name: '',
    email: '',
    passcode: 'host123',
    assignedPropertySlugs: [],
  });

  // Property Form State
  const [propertyFormData, setPropertyFormData] = useState({
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
    assignedClientId: '',
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Sync statuses, properties, & clients live
  useEffect(() => {
    const syncAll = () => {
      const list = getAllPropertiesList();
      setPropertyList(list);
      setClients(getAllClients());
      const res: Record<string, GuestStayStatus> = {};
      for (const p of list) {
        res[p.slug] = getStayStatus(p.slug);
      }
      setStatuses(res);
    };

    window.addEventListener('stay-status-change', syncAll);
    window.addEventListener('properties-updated', syncAll);
    window.addEventListener('clients-updated', syncAll);
    window.addEventListener('storage', syncAll);
    return () => {
      window.removeEventListener('stay-status-change', syncAll);
      window.removeEventListener('properties-updated', syncAll);
      window.removeEventListener('clients-updated', syncAll);
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
      setClients(getAllClients());
      const res: Record<string, GuestStayStatus> = {};
      for (const p of list) {
        res[p.slug] = getStayStatus(p.slug);
      }
      setStatuses(res);
      setIsRefreshing(false);
      showNotification('dwellio fleet and client accounts synchronized');
    }, 350);
  };

  // ==========================================
  // CLIENT MANAGEMENT HANDLERS
  // ==========================================
  const handleOpenCreateClientModal = () => {
    setClientFormData({
      name: '',
      email: '',
      passcode: 'host123',
      assignedPropertySlugs: [],
    });
    setIsCreateClientModalOpen(true);
  };

  const handleOpenEditClientModal = (client: ClientAccount) => {
    setClientFormData({
      id: client.id,
      name: client.name,
      email: client.email,
      passcode: client.passcode,
      assignedPropertySlugs: [...client.assignedPropertySlugs],
    });
    setIsEditClientModalOpen(true);
  };

  const handleSaveClientAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFormData.name.trim() || !clientFormData.email.trim()) {
      showNotification('Please enter client name and email');
      return;
    }

    if (clientFormData.id) {
      // Update
      const existing = clients.find(c => c.id === clientFormData.id);
      if (existing) {
        updateClient({
          ...existing,
          name: clientFormData.name.trim(),
          email: clientFormData.email.trim(),
          passcode: clientFormData.passcode.trim() || 'host123',
          assignedPropertySlugs: clientFormData.assignedPropertySlugs,
        });
        showNotification(`Client account "${clientFormData.name}" updated!`);
      }
      setIsEditClientModalOpen(false);
    } else {
      // Create
      const created = createClient({
        name: clientFormData.name.trim(),
        email: clientFormData.email.trim(),
        passcode: clientFormData.passcode.trim() || 'host123',
        assignedPropertySlugs: clientFormData.assignedPropertySlugs,
      });
      showNotification(`Created client account for "${created.name}" (${created.email})`);
      setIsCreateClientModalOpen(false);
    }

    setClients(getAllClients());
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (window.confirm(`Are you sure you want to delete client account "${clientName}"? Their assigned properties will become unassigned.`)) {
      deleteClient(clientId);
      setClients(getAllClients());
      showNotification(`Client account "${clientName}" deleted.`);
    }
  };

  const handleAssignPropertyToClient = (clientId: string, propertySlug: string) => {
    assignPropertyToClient(clientId, propertySlug);
    setClients(getAllClients());
    showNotification(`Assigned property to client!`);
  };

  const handleRemovePropertyFromClient = (clientId: string, propertySlug: string) => {
    removePropertyFromClient(clientId, propertySlug);
    setClients(getAllClients());
    showNotification(`Property removed from client.`);
  };

  // ==========================================
  // PROPERTY MANAGEMENT HANDLERS
  // ==========================================
  const handleOpenCreatePropertyModal = () => {
    setPropertyFormData({
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
      assignedClientId: clients.length > 0 ? clients[0].id : '',
    });
    setIsCreatePropertyModalOpen(true);
  };

  const handleOpenEditPropertyModal = (prop: PropertyData) => {
    const assignedClient = getClientForProperty(prop.slug);
    setPropertyFormData({
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
      assignedClientId: assignedClient ? assignedClient.id : '',
    });
    setIsEditPropertyModalOpen(true);
  };

  const handleSaveNewProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyFormData.name.trim()) return;

    const slug = (propertyFormData.slug.trim() || propertyFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'prop-' + Date.now();

    const newProperty: PropertyData = {
      slug,
      name: propertyFormData.name.trim(),
      tagline: propertyFormData.tagline.trim() || 'Luxury Vacation Home & Retreat',
      location: propertyFormData.location.trim() || 'Scenic Retreat',
      coordinates: {
        lat: 39.1677,
        lng: -120.1452,
        address: propertyFormData.location.trim() || 'Scenic Retreat',
      },
      heroImage: propertyFormData.heroImage.trim() || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      assistantName: `${propertyFormData.name.trim()} Assistant`,
      host: {
        name: propertyFormData.hostName.trim() || 'Host Care',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
        phone: propertyFormData.hostPhone.trim() || '+15551234567',
        phoneFormatted: propertyFormData.hostPhone.trim() || '(555) 123-4567',
        emergencyPhone: '(555) 911-0000',
        email: 'concierge@dwellio.com',
        responseTime: 'under 10 mins',
        superhost: true,
        rating: 4.95,
        reviewCount: 48,
      },
      wifi: {
        network: propertyFormData.wifiNetwork.trim() || 'Guest_WiFi',
        password: propertyFormData.wifiPassword.trim() || 'stayquiet2026',
        qrCodeText: `WIFI:T:WPA;S:${propertyFormData.wifiNetwork};P:${propertyFormData.wifiPassword};;`,
      },
      checkIn: {
        time: '4:00 PM',
        lockType: propertyFormData.lockType.trim() || 'Smart Keypad',
        accessCode: propertyFormData.accessCode.trim() || '*1234#',
        doorInstructions: [
          'Touch keypad to activate numbers.',
          `Enter code ${propertyFormData.accessCode.trim() || '*1234#'} followed by #.`,
          'Turn handle upon confirmation beep.',
        ],
        parkingInfo: 'Driveway parking available on site.',
        evCharger: 'Standard Level 2 EV charging available.',
        earlyCheckInPolicy: 'Available upon advance request.',
        emergencyKeybox: 'Lockbox located near side entrance.',
      },
      houseGuideText: propertyFormData.houseGuideText || '### House Guide\nEnjoy your stay and treat our home with care.',
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
          name: propertyFormData.hostName.trim() || 'Host',
          number: propertyFormData.hostPhone.trim() || '(555) 123-4567',
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

    // Assign to client if chosen
    if (propertyFormData.assignedClientId) {
      assignPropertyToClient(propertyFormData.assignedClientId, slug);
      setClients(getAllClients());
    }

    setPropertyList(getAllPropertiesList());
    setIsCreatePropertyModalOpen(false);
    setSelectedPropertySlug(slug);
    showNotification(`Property "${newProperty.name}" deployed to dwellio fleet!`);
  };

  const handleUpdateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = getPropertyBySlug(propertyFormData.slug);
    if (!existing) return;

    const updated: PropertyData = {
      ...existing,
      name: propertyFormData.name.trim() || existing.name,
      tagline: propertyFormData.tagline.trim() || existing.tagline,
      location: propertyFormData.location.trim() || existing.location,
      heroImage: propertyFormData.heroImage.trim() || existing.heroImage,
      host: {
        ...existing.host,
        name: propertyFormData.hostName.trim() || existing.host.name,
        phoneFormatted: propertyFormData.hostPhone.trim() || existing.host.phoneFormatted,
      },
      wifi: {
        ...existing.wifi,
        network: propertyFormData.wifiNetwork.trim() || existing.wifi.network,
        password: propertyFormData.wifiPassword.trim() || existing.wifi.password,
      },
      checkIn: {
        ...existing.checkIn,
        accessCode: propertyFormData.accessCode.trim() || existing.checkIn.accessCode,
        lockType: propertyFormData.lockType.trim() || existing.checkIn.lockType,
      },
      houseGuideText: propertyFormData.houseGuideText,
    };

    saveProperty(updated);

    // Update client assignment
    if (propertyFormData.assignedClientId) {
      // Remove from other clients first
      for (const c of clients) {
        if (c.id !== propertyFormData.assignedClientId && c.assignedPropertySlugs.includes(updated.slug)) {
          removePropertyFromClient(c.id, updated.slug);
        }
      }
      assignPropertyToClient(propertyFormData.assignedClientId, updated.slug);
    }
    setClients(getAllClients());

    setPropertyList(getAllPropertiesList());
    setIsEditPropertyModalOpen(false);
    showNotification(`Property "${updated.name}" updated!`);
  };

  const handleDeleteProperty = (slug: string) => {
    if (window.confirm(`Are you sure you want to decommission property "${slug}"?`)) {
      const ok = deleteProperty(slug);
      if (ok) {
        // Also remove from any client assignment
        for (const c of clients) {
          if (c.assignedPropertySlugs.includes(slug)) {
            removePropertyFromClient(c.id, slug);
          }
        }
        setClients(getAllClients());
        const updatedList = getAllPropertiesList();
        setPropertyList(updatedList);
        setSelectedPropertySlug(DEFAULT_SLUG);
        showNotification(`Property "${slug}" deleted.`);
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
          <div className="w-10 h-10 rounded-2xl bg-[#2A4436] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            d
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-bold tracking-tight text-[#1C1B18]">
                dwellio
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF2EC] text-[#2A4436]">
                Super Admin Console
              </span>
            </div>
            <p className="text-xs text-[#78756E]">Manage client accounts & property deployments</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5">
          {activeTab === 'clients' ? (
            <button
              onClick={handleOpenCreateClientModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-semibold shadow-soft-sm active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Client Account</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCreatePropertyModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-semibold shadow-soft-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Deploy Property</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#5C5A55] border border-black/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => onNavigateToClientPortal(selectedPropertySlug)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#2A4436] text-xs font-semibold border border-[#2A4436]/30 shadow-soft-sm transition-all"
            title="Open dwellio Client Portal (/client)"
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
              <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider">Properties Fleet</span>
              <div className="font-serif text-2xl font-bold text-[#1C1B18] mt-1">{totalDeployments} Stays</div>
              <span className="text-[11px] text-[#2A4436] flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> dwellio Live Engine
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center">
              <Building2 className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-soft-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider">Client Accounts</span>
              <div className="font-serif text-2xl font-bold text-[#1C1B18] mt-1">{clients.length} Clients</div>
              <span className="text-[11px] text-[#78756E] mt-1 block">
                Admin assigned only
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center">
              <Users className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-soft-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider">Active Guest Stays</span>
              <div className="font-serif text-2xl font-bold text-[#2A4436] mt-1">{checkedInCount} Checked In</div>
              <span className="text-[11px] text-[#78756E] mt-1 block">
                {checkedOutCount} Checked Out
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#7A684D] flex items-center justify-center">
              <Zap className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-soft-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider">Platform Security</span>
              <div className="font-mono text-sm font-bold text-[#1C1B18] mt-1">Admin Governed</div>
              <span className="text-[11px] text-[#2A4436] flex items-center gap-1 mt-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Self-signup disabled
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center">
              <Lock className="w-6 h-6 stroke-[1.8]" />
            </div>
          </div>
        </div>

        {/* View Switcher Tabs: Properties vs Clients */}
        <div className="flex items-center gap-2 border-b border-black/10 pb-2">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'properties'
                ? 'bg-[#2A4436] text-white shadow-soft-sm'
                : 'bg-white hover:bg-[#FAF8F5] text-[#5C5A55] border border-black/5'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Properties Fleet ({propertyList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-[#2A4436] text-white shadow-soft-sm'
                : 'bg-white hover:bg-[#FAF8F5] text-[#5C5A55] border border-black/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Client Accounts ({clients.length})</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: PROPERTIES FLEET TAB */}
        {/* ========================================================= */}
        {activeTab === 'properties' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left 2 Columns: Deployments Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/5 shadow-soft-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#1C1B18]">dwellio Properties Fleet</h2>
                    <p className="text-xs text-[#78756E]">Manage all properties and assign them to client accounts.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#78756E] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter properties..."
                        className="pl-9 pr-3 py-1.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436]"
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-black/5 text-[#78756E] uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Property</th>
                        <th className="py-2.5 px-3">Assigned Client</th>
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
                        const assignedClient = getClientForProperty(p.slug);

                        return (
                          <tr
                            key={p.slug}
                            onClick={() => setSelectedPropertySlug(p.slug)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#FAF8F5]' : 'hover:bg-black/[0.02]'
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="font-bold text-[#1C1B18] text-sm">{p.name}</div>
                              <div className="text-[11px] text-[#78756E]">{p.location}</div>
                            </td>
                            <td className="py-3 px-3">
                              {assignedClient ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EBF2EC] text-[#2A4436]">
                                  <UserCheck className="w-3 h-3" />
                                  <span>{assignedClient.name}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  Unassigned
                                </span>
                              )}
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
                                  handleOpenEditPropertyModal(prop);
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
                                    handleDeleteProperty(p.slug);
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
            </div>

            {/* Right Column: Inspector Panel */}
            <div className="space-y-4">
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/5 shadow-soft-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#78756E]">
                      Selected Property
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#1C1B18]">
                      {selectedProperty.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleOpenEditPropertyModal(selectedProperty)}
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

                {/* Assigned Client Card */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#78756E] block">
                    Assigned Client Account
                  </span>
                  {(() => {
                    const client = getClientForProperty(selectedProperty.slug);
                    if (client) {
                      return (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-[#1C1B18]">{client.name}</div>
                            <div className="text-[11px] text-[#78756E]">{client.email}</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF2EC] text-[#2A4436] font-bold">
                            Assigned
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div className="text-xs text-[#78756E] flex items-center justify-between">
                        <span>Not assigned to any client yet</span>
                        <button
                          onClick={() => handleOpenEditPropertyModal(selectedProperty)}
                          className="text-[#2A4436] font-semibold underline text-[11px]"
                        >
                          Assign now
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Quick Status Override */}
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
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5]">
                    <span className="text-[#78756E]">Lock Code:</span>
                    <span className="font-mono font-bold text-[#1C1B18]">{selectedProperty.checkIn.accessCode}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5]">
                    <span className="text-[#78756E]">Wi-Fi:</span>
                    <span className="font-mono font-bold text-[#1C1B18]">{selectedProperty.wifi.network}</span>
                  </div>
                </div>

                {/* Action Buttons */}
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
                    <span>Launch Guest App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CLIENT ACCOUNTS TAB (ADMIN GOVERNED ONLY) */}
        {/* ========================================================= */}
        {activeTab === 'clients' && (
          <div className="space-y-6 animate-fade-in">
            {/* Info Banner: Client Cannot Create Accounts */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#EBF2EC] border border-[#2A4436]/20 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-[#2A4436] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-[#2A4436] block">
                  Admin Exclusive Client Governance
                </span>
                <p className="text-xs text-[#2A4436]/90 mt-0.5 leading-relaxed">
                  Clients <strong>cannot</strong> create their own accounts or register. Only admins can create client accounts, assign properties, and remove properties. When clients log in at <code>/client</code>, they strictly only see and manage their assigned properties.
                </p>
              </div>
            </div>

            {/* Client Accounts Table / Cards */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/5 shadow-soft-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#1C1B18]">Client Host Accounts</h2>
                  <p className="text-xs text-[#78756E]">
                    Assign and remove properties for each client account.
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateClientModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-semibold shadow-soft-sm active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create Client Account</span>
                </button>
              </div>

              {/* Clients Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clients.map((client) => {
                  const assignedProps = client.assignedPropertySlugs
                    .map((slug) => getPropertyBySlug(slug))
                    .filter(Boolean);

                  // Unassigned properties that could be added to this client
                  const unassignedOrAvailableProps = propertyList.filter(
                    (p) => !client.assignedPropertySlugs.includes(p.slug)
                  );

                  return (
                    <div
                      key={client.id}
                      className="p-5 rounded-2xl bg-[#FAF8F5] border border-black/5 shadow-soft-sm space-y-4 flex flex-col justify-between"
                    >
                      {/* Client Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#EBF2EC] text-[#2A4436] font-bold text-sm flex items-center justify-center shrink-0">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-[#1C1B18]">{client.name}</h3>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#5C5A55] border border-black/5">
                                Client
                              </span>
                            </div>
                            <div className="text-xs text-[#78756E] mt-0.5 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{client.email}</span>
                            </div>
                          </div>
                        </div>

                        {/* Edit & Delete Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditClientModal(client)}
                            className="p-1.5 rounded-lg text-[#78756E] hover:text-[#1C1B18] hover:bg-black/5 transition-colors"
                            title="Edit Client"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            className="p-1.5 rounded-lg text-[#78756E] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Passcode display */}
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-black/5 text-xs">
                        <span className="text-[#78756E]">Login Passcode:</span>
                        <span className="font-mono font-bold text-[#1C1B18]">{client.passcode}</span>
                      </div>

                      {/* Assigned Properties Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#78756E]">
                            Assigned Properties ({client.assignedPropertySlugs.length})
                          </span>
                        </div>

                        {/* Property Pills with remove 'x' */}
                        <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                          {assignedProps.length === 0 ? (
                            <span className="text-xs text-[#78756E] italic">
                              No properties assigned yet. Add one below.
                            </span>
                          ) : (
                            assignedProps.map((prop) => (
                              <span
                                key={prop.slug}
                                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl bg-white border border-black/10 text-xs font-semibold text-[#1C1B18] shadow-soft-sm"
                              >
                                <span>{prop.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePropertyFromClient(client.id, prop.slug)}
                                  className="w-4 h-4 rounded-full hover:bg-rose-100 hover:text-rose-700 text-[#78756E] flex items-center justify-center transition-colors cursor-pointer"
                                  title={`Remove ${prop.name} from this client`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>

                        {/* Add Property Dropdown for this Client */}
                        {unassignedOrAvailableProps.length > 0 && (
                          <div className="pt-2 flex items-center gap-2">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignPropertyToClient(client.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              defaultValue=""
                              className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs text-[#1C1B18] font-medium focus:outline-none cursor-pointer"
                            >
                              <option value="" disabled>
                                + Assign Property to {client.name.split(' ')[0]}...
                              </option>
                              {unassignedOrAvailableProps.map((p) => (
                                <option key={p.slug} value={p.slug}>
                                  {p.name} ({p.location})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Footer: Open in Client Portal */}
                      <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                        <span className="text-[10px] text-[#78756E]">
                          Created: {client.createdAt}
                        </span>

                        <button
                          onClick={() => {
                            const firstProp = client.assignedPropertySlugs[0] || DEFAULT_SLUG;
                            onNavigateToClientPortal(firstProp);
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-[#2A4436] hover:underline"
                        >
                          <span>Log in as {client.name.split(' ')[0]}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: CREATE CLIENT ACCOUNT (ADMIN ONLY) */}
      {/* ========================================================= */}
      {(isCreateClientModalOpen || isEditClientModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-black/10 space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1C1B18]">
                  {isEditClientModalOpen ? 'Edit Client Account' : 'Create Client Account'}
                </h3>
                <p className="text-xs text-[#78756E] mt-0.5">
                  Clients cannot self-register; admins set up their login & properties.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreateClientModalOpen(false);
                  setIsEditClientModalOpen(false);
                }}
                className="p-1 rounded-xl hover:bg-black/5 text-[#78756E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClientAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Client Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientFormData.name}
                  onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins or Alpine Hospitality LLC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs font-medium text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Client Email (Login Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={clientFormData.email}
                  onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                  placeholder="e.g. sarah@dwellio.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                  Host Passcode
                </label>
                <input
                  type="text"
                  value={clientFormData.passcode}
                  onChange={(e) => setClientFormData({ ...clientFormData, passcode: e.target.value })}
                  placeholder="e.g. host123"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs font-mono font-bold text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                />
              </div>

              {/* Assign Initial Properties */}
              <div>
                <label className="block text-xs font-semibold text-[#1C1B18] mb-1.5">
                  Assign Properties to this Client
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-[#F6F4F0] border border-black/10">
                  {propertyList.map((p) => {
                    const isAssigned = clientFormData.assignedPropertySlugs.includes(p.slug);
                    return (
                      <label
                        key={p.slug}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-[#FAF8F5] cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setClientFormData({
                                ...clientFormData,
                                assignedPropertySlugs: [...clientFormData.assignedPropertySlugs, p.slug],
                              });
                            } else {
                              setClientFormData({
                                ...clientFormData,
                                assignedPropertySlugs: clientFormData.assignedPropertySlugs.filter(s => s !== p.slug),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded text-[#2A4436] accent-[#2A4436]"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-[#1C1B18] block">{p.name}</span>
                          <span className="text-[10px] text-[#78756E]">{p.location}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateClientModalOpen(false);
                    setIsEditClientModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#78756E] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-bold shadow-soft-sm active:scale-95 transition-all"
                >
                  {isEditClientModalOpen ? 'Save Changes' : 'Create Client Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DEPLOY PROPERTY (CREATE / EDIT) */}
      {/* ========================================================= */}
      {(isCreatePropertyModalOpen || isEditPropertyModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-black/10 space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1C1B18]">
                  {isEditPropertyModalOpen ? 'Edit Property' : 'Deploy New Property'}
                </h3>
                <p className="text-xs text-[#78756E] mt-0.5">
                  Configure property details and assign it to a client account.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreatePropertyModalOpen(false);
                  setIsEditPropertyModalOpen(false);
                }}
                className="p-1 rounded-xl hover:bg-black/5 text-[#78756E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditPropertyModalOpen ? handleUpdateProperty : handleSaveNewProperty} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                    Property Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={propertyFormData.name}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, name: e.target.value })}
                    placeholder="e.g. Pine Crest Villa"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs font-medium text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                    Assign to Client Account
                  </label>
                  <select
                    value={propertyFormData.assignedClientId}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, assignedClientId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs font-semibold text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  >
                    <option value="">-- Unassigned --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    disabled={isEditPropertyModalOpen}
                    value={propertyFormData.slug}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, slug: e.target.value })}
                    placeholder="e.g. pine-crest-villa"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs font-mono text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                    Location / Region
                  </label>
                  <input
                    type="text"
                    value={propertyFormData.location}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, location: e.target.value })}
                    placeholder="e.g. Blue Ridge, GA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={propertyFormData.tagline}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, tagline: e.target.value })}
                    placeholder="e.g. Mountain Views & Timber Hot Tub"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                    Wi-Fi Name
                  </label>
                  <input
                    type="text"
                    value={propertyFormData.wifiNetwork}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, wifiNetwork: e.target.value })}
                    placeholder="e.g. PineCrest_Guest"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                    Wi-Fi Password
                  </label>
                  <input
                    type="text"
                    value={propertyFormData.wifiPassword}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, wifiPassword: e.target.value })}
                    placeholder="e.g. mountaincabin2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                    Door Lock Access Code
                  </label>
                  <input
                    type="text"
                    value={propertyFormData.accessCode}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, accessCode: e.target.value })}
                    placeholder="e.g. *8821#"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs font-mono font-bold text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                    Host Phone
                  </label>
                  <input
                    type="text"
                    value={propertyFormData.hostPhone}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, hostPhone: e.target.value })}
                    placeholder="e.g. (555) 234-5678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1C1B18] mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={propertyFormData.heroImage}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, heroImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F4F0] border border-black/10 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatePropertyModalOpen(false);
                    setIsEditPropertyModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#78756E] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-bold shadow-soft-sm active:scale-95 transition-all"
                >
                  {isEditPropertyModalOpen ? 'Update Property' : 'Deploy Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
