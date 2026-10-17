import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeHero } from './components/HomeHero';
import { ChatView } from './components/ChatView';
import { MessageComposer } from './components/MessageComposer';

// Full Screen Views
import { WifiScreen } from './components/Screens/WifiScreen';
import { CheckInScreen } from './components/Screens/CheckInScreen';
import { HouseGuideScreen } from './components/Screens/HouseGuideScreen';
import { HostContactScreen } from './components/Screens/HostContactScreen';
import { RecommendationsScreen } from './components/Screens/RecommendationsScreen';
import { EmergencyCallScreen } from './components/Screens/EmergencyCallScreen';
import { PropertySwitcherScreen } from './components/Screens/PropertySwitcherScreen';
import { MenuScreen } from './components/Screens/MenuScreen';
import { PlayScreen } from './components/Screens/PlayScreen';
import { ImagePreviewModal } from './components/Modals/ImagePreviewModal';

// Host & Admin Dashboards
import { ClientDashboard } from './components/Client/ClientDashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';

import { DwellioWebsite } from './components/Website/DwellioWebsite';

import { DEFAULT_SLUG, getPropertyBySlug } from './data/properties';
import { PropertyData, ChatMessage } from './types';
import { generateAssistantResponse } from './utils/aiResponse';

export type AppScreen = 
  | 'home' 
  | 'chat' 
  | 'wifi' 
  | 'checkin' 
  | 'guide' 
  | 'host' 
  | 'recommendations' 
  | 'call' 
  | 'switcher' 
  | 'play' 
  | 'menu';

type ViewMode = 'website' | 'guest' | 'client' | 'admin';

export function App() {
  // 1. URL Path & Routing Parsing
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      if (path.startsWith('/admin')) return 'admin';
      if (path === '/client' || path === '/client/' || path.startsWith('/host')) return 'client';
      if (path.startsWith('/stay/') || path.startsWith('/client/')) return 'guest';
      if (path === '/demo' || path === '/demo/' || path.startsWith('/guest') || params.get('demo') === 'true' || params.get('stay')) return 'guest';
      if (path === '/' || path === '/about' || path === '/about/') return 'website';
    }
    return 'website';
  });

  const [currentSlug, setCurrentSlug] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/client/')) {
        return path.replace('/client/', '').replace(/\/$/, '') || DEFAULT_SLUG;
      }
      if (path === '/client' || path === '/client/') {
        return DEFAULT_SLUG;
      }
      if (path.startsWith('/stay/')) {
        return path.replace('/stay/', '').replace(/\/$/, '') || DEFAULT_SLUG;
      }
      if (path.startsWith('/host/')) {
        return path.replace('/host/', '').replace(/\/$/, '') || DEFAULT_SLUG;
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('stay')) return params.get('stay')!;
      if (params.get('client')) return params.get('client')!;
    }
    return DEFAULT_SLUG;
  });

  // Re-fetch property dynamically when properties are created or edited in Admin
  const [, setPropertiesRevision] = useState(0);
  useEffect(() => {
    const handlePropertiesUpdated = () => setPropertiesRevision((v) => v + 1);
    window.addEventListener('properties-updated', handlePropertiesUpdated);
    window.addEventListener('storage', handlePropertiesUpdated);
    return () => {
      window.removeEventListener('properties-updated', handlePropertiesUpdated);
      window.removeEventListener('storage', handlePropertiesUpdated);
    };
  }, []);

  const property: PropertyData = getPropertyBySlug(currentSlug);

  // 2. Mobile App Screen Navigation State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [previousScreen, setPreviousScreen] = useState<AppScreen>('home');
  const [draftText, setDraftText] = useState<string>('');

  // 3. Persistent Chat Messages for that Stay in localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`guest_chat_history_${currentSlug}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (err) {
        console.warn('Failed to load chat history from localStorage:', err);
      }
    }
    return [];
  });

  // Reload chat history whenever currentSlug changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`guest_chat_history_${currentSlug}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to reload chat history on slug change:', err);
    }
    setMessages([]);
  }, [currentSlug]);

  // Persist chat history whenever messages changes
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(`guest_chat_history_${currentSlug}`, JSON.stringify(messages));
      } else {
        localStorage.removeItem(`guest_chat_history_${currentSlug}`);
      }
    } catch (err) {
      console.warn('Failed to save chat history to localStorage:', err);
    }
  }, [messages, currentSlug]);

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState<boolean>(false);
  const mainScrollRef = React.useRef<HTMLElement>(null);

  const navigateTo = (screen: AppScreen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateBack = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsAnimatingOut(false);
      if (currentScreen === 'chat' || previousScreen === 'chat') {
        setCurrentScreen('home');
      } else if (previousScreen !== currentScreen) {
        setCurrentScreen(previousScreen);
      } else {
        setCurrentScreen('home');
      }
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, 200);
  };

  // Handle URL slug change
  const handleSelectProperty = (slug: string) => {
    setCurrentSlug(slug);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', `/client/${slug}`);
    }
    setCurrentScreen('home');
    setViewMode('guest');
  };

  const handleNavigateToGuest = (slug: string) => {
    setCurrentSlug(slug);
    setViewMode('guest');
    setCurrentScreen('home');
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', `/client/${slug}`);
    }
  };

  const handleNavigateToClientPortal = (slug?: string) => {
    if (slug) setCurrentSlug(slug);
    setViewMode('client');
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/client');
    }
  };

  const handleNavigateToAdmin = () => {
    setViewMode('admin');
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/admin');
    }
  };

  const [isPageExiting, setIsPageExiting] = useState<boolean>(false);

  // Sync theme between landing page (dark by default) and app (light by default)
  useEffect(() => {
    if (viewMode === 'website') {
      document.documentElement.classList.add('dark');
    } else {
      const savedTheme = localStorage.getItem('relay_guest_theme') || localStorage.getItem('dwellio_guest_theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [viewMode]);

  const handleLaunchDemo = (slug?: string) => {
    setIsPageExiting(true);
    setTimeout(() => {
      if (slug) {
        setCurrentSlug(slug);
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState({}, '', `/stay/${slug}`);
        }
      } else {
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState({}, '', '/demo');
        }
      }

      // App defaults to light mode unless explicitly set to dark
      const savedTheme = localStorage.getItem('relay_guest_theme') || localStorage.getItem('dwellio_guest_theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      setCurrentScreen('home');
      setViewMode('guest');
      setIsPageExiting(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, 280);
  };

  const handleBackToWebsite = () => {
    setIsPageExiting(true);
    setTimeout(() => {
      // Landing page is dark mode by default
      document.documentElement.classList.add('dark');
      setViewMode('website');
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({}, '', '/');
      }
      setIsPageExiting(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, 280);
  };

  // Listen to browser popstate (back/forward button)
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      if (path.startsWith('/admin')) {
        setViewMode('admin');
      } else if (path === '/client' || path === '/client/' || path.startsWith('/host')) {
        setViewMode('client');
      } else if (path.startsWith('/client/')) {
        setViewMode('guest');
        const slug = path.replace('/client/', '').replace(/\/$/, '') || DEFAULT_SLUG;
        setCurrentSlug(slug);
      } else if (path.startsWith('/stay/')) {
        setViewMode('guest');
        const slug = path.replace('/stay/', '').replace(/\/$/, '') || DEFAULT_SLUG;
        setCurrentSlug(slug);
      } else if (path === '/demo' || path === '/demo/' || params.get('demo') === 'true' || params.get('stay')) {
        setViewMode('guest');
        if (params.get('stay')) setCurrentSlug(params.get('stay')!);
      } else {
        setViewMode('website');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Send message handler (only switches to full-screen chat when sending)
  const handleSendMessage = async (
    text: string,
    image?: { url: string; caption: string },
    audio?: { url: string; duration: number }
  ) => {
    if (!text.trim() && !image && !audio) return;

    navigateTo('chat');

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'guest',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: image?.url,
      imageCaption: image?.caption,
      audioUrl: audio?.url,
      audioDuration: audio?.duration,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await generateAssistantResponse({
        messageText: text,
        property,
        image,
        isAudioMessage: !!audio,
      });

      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error('Error generating AI response:', err);
    } finally {
      setIsTyping(false);
    }
  };

  // Action Chip click handler in assistant bubbles
  const handleActionChipClick = (chip: { prompt: string; action?: string }) => {
    if (chip.action) {
      switch (chip.action) {
        case 'open_play':
          navigateTo('play');
          return;
        case 'open_wifi':
          navigateTo('wifi');
          return;
        case 'open_checkin':
          navigateTo('checkin');
          return;
        case 'open_guide':
          navigateTo('guide');
          return;
        case 'open_host':
          navigateTo('host');
          return;
        case 'open_call':
          navigateTo('call');
          return;
        case 'open_recommendations':
          navigateTo('recommendations');
          return;
      }
    }
    handleSendMessage(chip.prompt);
  };

  // Direct host call screen jump
  const handleSendHostMessage = () => {
    navigateTo('host');
  };

  // 1. RENDER WEBSITE MARKETING & SHOWCASE (Desktop & Mobile SEO site)
  if (viewMode === 'website') {
    return (
      <DwellioWebsite
        onLaunchDemo={handleLaunchDemo}
        onOpenClientPortal={handleNavigateToClientPortal}
        onOpenAdmin={handleNavigateToAdmin}
        isExiting={isPageExiting}
      />
    );
  }

  // 2. RENDER ADMIN DASHBOARD (Desktop View)
  if (viewMode === 'admin') {
    return (
      <AdminDashboard
        onNavigateToGuest={handleNavigateToGuest}
        onNavigateToClientPortal={handleNavigateToClientPortal}
      />
    );
  }

  // 3. RENDER CLIENT DASHBOARD (Client Portal with Login)
  if (viewMode === 'client') {
    return (
      <ClientDashboard
        initialSlug={currentSlug}
        onNavigateToGuest={handleNavigateToGuest}
        onNavigateToAdmin={handleNavigateToAdmin}
      />
    );
  }

  // 4. RENDER GUEST APP (Mobile-First Screen Router)
  const isHomeScreen = currentScreen === 'home';
  const showComposer = currentScreen !== 'play';

  return (
    <div className={`h-[100dvh] w-full bg-[#E5E5EA] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col items-center justify-center overflow-hidden selection:bg-black/10 selection:text-black relative transition-all ${
      isPageExiting ? 'animate-page-fade-out' : 'animate-page-fade-in'
    }`}>
      {/* Quick Website Switcher Pill for Desktop users previewing the live demo */}
      <div className="hidden lg:flex items-center gap-3 absolute top-5 left-6 z-40">
        <button
          onClick={handleBackToWebsite}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#1C1C1E]/90 hover:bg-white dark:hover:bg-[#2C2C2E] text-xs font-semibold text-[#1D1D1F] dark:text-white border border-black/10 dark:border-white/10 shadow-soft-sm backdrop-blur-md transition-all cursor-pointer"
        >
          <span>← Relay Website</span>
        </button>
        <span className="text-[11px] text-[#86868B] dark:text-neutral-400 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg">
          Live Guest Demo ({property.name})
        </span>
      </div>

      {/* Mobile App Screen Frame - fixed viewport height, never scrolls off screen */}
      <div className="w-full max-w-md h-[100dvh] flex flex-col bg-[#F5F5F7] dark:bg-[#000000] shadow-2xl relative border-x border-black/5 dark:border-white/10 overflow-hidden transition-colors">
        
        {/* Pinned Header (Permanently pinned at top of the frame, never scrolls away) */}
        {(isHomeScreen || currentScreen === 'chat') && (
          <div className="shrink-0 z-30 w-full bg-[#F5F5F7]/95 dark:bg-[#000000]/95 backdrop-blur-md">
            <Header
              property={property}
              onOpenCall={() => navigateTo('call')}
              onOpenMenu={() => navigateTo('menu')}
              onOpenPropertySwitcher={() => navigateTo('switcher')}
              onResetToHome={() => {
                if (currentScreen === 'chat') {
                  navigateBack();
                } else {
                  setCurrentScreen('home');
                }
              }}
              isChatMode={currentScreen === 'chat'}
            />
          </div>
        )}

        {/* Dynamic Screen View Router - Scrollable viewport inside the frame */}
        <main
          ref={mainScrollRef}
          className={`flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain relative ${
            isHomeScreen ? 'hero-ambient-header' : ''
          } ${isAnimatingOut ? 'animate-screen-out' : ''}`}
        >
          {currentScreen === 'home' && (
            <HomeHero
              property={property}
              onOpenQuickModal={(screen) => navigateTo(screen)}
              onStartChatWithPrompt={(prompt) => handleSendMessage(prompt)}
            />
          )}

          {currentScreen === 'chat' && (
            <ChatView
              messages={messages}
              property={property}
              isTyping={isTyping}
              onSendPrompt={(prompt) => handleSendMessage(prompt)}
              onActionChipClick={handleActionChipClick}
              onImageClick={(url) => setPreviewImageUrl(url)}
              onBackToHome={() => navigateTo('home')}
              onClearChat={() => {
                setMessages([]);
                navigateTo('home');
              }}
            />
          )}

          {currentScreen === 'wifi' && (
            <WifiScreen
              property={property}
              onBack={navigateBack}
              onAskAI={(prompt) => handleSendMessage(prompt)}
            />
          )}

          {currentScreen === 'checkin' && (
            <CheckInScreen
              property={property}
              onBack={navigateBack}
              onAskAI={(prompt) => handleSendMessage(prompt)}
            />
          )}

          {currentScreen === 'guide' && (
            <HouseGuideScreen
              property={property}
              onBack={navigateBack}
              onAskAI={(prompt) => handleSendMessage(prompt)}
            />
          )}

          {currentScreen === 'host' && (
            <HostContactScreen
              property={property}
              onBack={navigateBack}
            />
          )}

          {currentScreen === 'recommendations' && (
            <RecommendationsScreen
              property={property}
              onBack={navigateBack}
              onAskAI={(prompt) => handleSendMessage(prompt)}
            />
          )}

          {currentScreen === 'call' && (
            <EmergencyCallScreen
              property={property}
              onBack={navigateBack}
            />
          )}

          {currentScreen === 'switcher' && (
            <PropertySwitcherScreen
              currentSlug={currentSlug}
              onSelectProperty={handleSelectProperty}
              onBack={navigateBack}
            />
          )}

          {currentScreen === 'menu' && (
            <MenuScreen
              property={property}
              onSelectOption={(screen) => navigateTo(screen)}
              onBack={navigateBack}
              onOpenWebsite={handleBackToWebsite}
            />
          )}

          {currentScreen === 'play' && (
            <PlayScreen
              propertyName={property.name}
              onBack={navigateBack}
            />
          )}
        </main>

        {/* Fixed Rounded Pill Message Composer (Available across views, does not switch screen on focus) */}
        {showComposer && (
          <MessageComposer
            property={property}
            draftText={draftText}
            onDraftChange={setDraftText}
            onSendMessage={handleSendMessage}
            disabled={isTyping}
          />
        )}

        {/* Fullscreen Photo Preview Modal */}
        <ImagePreviewModal
          imageUrl={previewImageUrl}
          onClose={() => setPreviewImageUrl(null)}
        />
      </div>
    </div>
  );
}

export default App;
