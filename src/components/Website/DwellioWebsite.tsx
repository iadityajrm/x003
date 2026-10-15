import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Wifi,
  Gamepad2,
  Compass,
  FileText,
  Smartphone,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  Zap,
  Lock,
  Heart,
  QrCode,
  Building,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import { PROPERTIES } from '../../data/properties';
import { PropertyData } from '../../types';

interface DwellioWebsiteProps {
  onLaunchDemo: (slug?: string) => void;
  onOpenClientPortal: () => void;
  onOpenAdmin: () => void;
}

export const DwellioWebsite: React.FC<DwellioWebsiteProps> = ({
  onLaunchDemo,
  onOpenClientPortal,
  onOpenAdmin,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [selectedDemoSlug, setSelectedDemoSlug] = useState('cedar-house');

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dwellio_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dwellio_theme', 'light');
    }
  };

  const sampleQuestions = [
    "What's the Wi-Fi network and password?",
    "How do I turn on the outdoor cedar hot tub?",
    "Where are extra firewood and blankets located?",
    "What are the best coffee shops nearby?"
  ];

  const [activeSampleIndex, setActiveSampleIndex] = useState(0);

  const sampleAnswers = [
    "You're connected to Cedar_Guest (Password: tahoepinecones!). You can also scan the instant QR code in the Wi-Fi tab!",
    "The hot tub is preheated to 102°F on the back deck. Lift the insulated cover with the hydraulic arm, and press 'JETS 1' on the Balboa panel for bubble hydrotherapy!",
    "Firewood is stacked on the side porch beneath the waterproof cover. Extra wool blankets are stored in the cedar chest in the living room.",
    "Host Favorite: 'Tahoe House Bakery & Cafe' is 4 mins down West Lake Blvd (their Cinnamon Rolls & Swiss Roast are top-tier!). Check Recommendations for more spots."
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0D0C0A] text-[#1E1D1A] dark:text-[#EDEAE4] transition-colors selection:bg-[#2A4436]/20 selection:text-[#1E1D1A]">
      
      {/* ─── STICKY NAVIGATION HEADER ─── */}
      <header className="sticky top-0 z-50 bg-[#F7F5F0]/90 dark:bg-[#0D0C0A]/90 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo */}
          <a
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-[#2A4436] dark:bg-[#345946] flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#E6AF2E]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#1C1B18] dark:text-white">
                  dwellio
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#2A4436]/10 dark:bg-[#2A4436]/40 text-[#2A4436] dark:text-[#78A88E]">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-[#78756E] dark:text-neutral-400 font-medium -mt-1 hidden sm:inline">
                Smart Guest Concierge
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5C5A55] dark:text-neutral-300">
            <a href="#features" className="hover:text-[#2A4436] dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-[#2A4436] dark:hover:text-white transition-colors">
              Live Demo
            </a>
            <a href="#security" className="hover:text-[#2A4436] dark:hover:text-white transition-colors">
              Security
            </a>
            <a href="#how-it-works" className="hover:text-[#2A4436] dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#faq" className="hover:text-[#2A4436] dark:hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark / Light Theme"
              className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#5C5A55] dark:text-neutral-300 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>

            {/* Host Sign In */}
            <button
              onClick={onOpenClientPortal}
              className="hidden sm:inline-flex text-xs font-semibold px-3.5 py-2 rounded-xl text-[#5C5A55] dark:text-neutral-300 hover:text-[#1C1B18] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Host Portal
            </button>

            {/* Launch Demo CTA */}
            <button
              onClick={() => onLaunchDemo(selectedDemoSlug)}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white text-xs sm:text-sm font-semibold shadow-soft-sm hover:shadow-soft-card active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Live Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-[#2A4436]/10 to-[#9E5A3F]/10 blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF2EC] dark:bg-[#2A4436]/40 border border-[#2A4436]/20 text-[#2A4436] dark:text-[#78A88E] text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation Vacation Rental Hospitality</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1B18] dark:text-white leading-[1.12]">
                Meet <span className="text-[#2A4436] dark:text-[#78A88E]">Dwellio AI</span> — The 24/7 Smart Guest Concierge.
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-[#5C5A55] dark:text-neutral-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Replace bulky 30-page manuals and late-night guest calls with <strong className="font-semibold text-[#1C1B18] dark:text-white">Dwellio Chat</strong>. An instant, conversational AI assistant right inside your guest’s mobile browser. Zero app downloads, verified security, instant Wi-Fi, and bulletproof offline fallbacks.
              </p>

              {/* Hero Call to Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4">
                <button
                  onClick={() => onLaunchDemo(selectedDemoSlug)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#2A4436] hover:bg-[#1E3328] text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#2A4436]/20 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#E6AF2E]" />
                  <span>Launch Interactive Live Demo</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={onOpenClientPortal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-white/10 hover:bg-[#FAF8F5] dark:hover:bg-white/15 text-[#1C1B18] dark:text-white font-semibold text-sm sm:text-base border border-black/10 dark:border-white/15 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Building className="w-4 h-4 text-[#9E5A3F]" />
                  <span>Open Host Portal</span>
                </button>
              </div>

              {/* Trust Micro-Metrics */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-black/10 dark:border-white/10 text-left max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-serif text-[#1C1B18] dark:text-white">0</div>
                  <div className="text-[11px] sm:text-xs text-[#78756E] dark:text-neutral-400">App Downloads</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-serif text-[#2A4436] dark:text-[#78A88E]">24/7</div>
                  <div className="text-[11px] sm:text-xs text-[#78756E] dark:text-neutral-400">Instant AI Chat</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-serif text-[#9E5A3F]">100%</div>
                  <div className="text-[11px] sm:text-xs text-[#78756E] dark:text-neutral-400">Fail-Safe Backup</div>
                </div>
              </div>

            </div>

            {/* Right Live Interactive Mini-Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl bg-[#F6F4F0] dark:bg-[#151412] p-4 sm:p-5 shadow-2xl border border-black/10 dark:border-white/10 relative">
                
                {/* Mockup Top Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src="/aspfp.png"
                        alt="Dwellio AI Assistant"
                        className="w-9 h-9 rounded-full object-cover border border-[#2A4436]/30 shadow-sm"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#151412]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1C1B18] dark:text-white flex items-center gap-1">
                        <span>Dwellio AI Assistant</span>
                        <Sparkles className="w-3 h-3 text-[#2A4436] dark:text-[#78A88E]" />
                      </div>
                      <div className="text-[10px] text-[#78756E] dark:text-neutral-400">
                        Cedar House Stay (Lake Tahoe)
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onLaunchDemo('cedar-house')}
                    className="text-[11px] font-semibold text-[#2A4436] dark:text-[#78A88E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full App</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Simulated Dynamic Chat Area */}
                <div className="py-4 space-y-3">
                  
                  {/* Assistant Intro Bubble */}
                  <div className="flex items-start gap-2">
                    <img
                      src="/aspfp.png"
                      alt="Dwellio"
                      className="w-6 h-6 rounded-full shrink-0 mt-0.5"
                    />
                    <div className="p-3 rounded-2xl rounded-tl-sm bg-white dark:bg-[#1E1D1A] border border-black/5 dark:border-white/10 text-xs text-[#1C1B18] dark:text-neutral-200 shadow-soft-sm">
                      Welcome to Cedar House! Tap any query below or ask anything about your stay:
                    </div>
                  </div>

                  {/* Sample Prompt Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSampleIndex(idx)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all text-left cursor-pointer ${
                          activeSampleIndex === idx
                            ? 'bg-[#2A4436] text-white border-[#2A4436]'
                            : 'bg-white dark:bg-[#1E1D1A] text-[#5C5A55] dark:text-neutral-300 border-black/5 dark:border-white/10 hover:border-[#2A4436]/40'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Active Question & Answer Bubble */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-end">
                      <div className="p-2.5 rounded-2xl rounded-tr-sm bg-[#2A4436] text-white text-xs max-w-[85%] font-medium shadow-sm">
                        {sampleQuestions[activeSampleIndex]}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <img
                        src="/aspfp.png"
                        alt="Dwellio"
                        className="w-6 h-6 rounded-full shrink-0 mt-0.5"
                      />
                      <div className="p-3 rounded-2xl rounded-tl-sm bg-[#EBF2EC] dark:bg-[#1D2B22] border border-[#2A4436]/20 text-xs text-[#1C1B18] dark:text-neutral-100 shadow-soft-sm leading-relaxed">
                        {sampleAnswers[activeSampleIndex]}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mockup Bottom Launcher */}
                <div className="pt-2">
                  <button
                    onClick={() => onLaunchDemo('olive1d')}
                    className="w-full py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-[#FAF8F5] dark:hover:bg-white/15 border border-black/10 dark:border-white/15 text-xs font-bold text-[#1C1B18] dark:text-white flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Test Full Guest Experience Live</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2A4436] dark:text-[#78A88E]" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── LIVE DEMO SELECTOR SECTION ─── */}
      <section id="demo" className="py-16 bg-white dark:bg-[#12110F] border-y border-black/[0.06] dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2A4436] dark:text-[#78A88E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Guest Demo</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1B18] dark:text-white">
              Try Dwellio AI as a Guest Right Now
            </h2>
            <p className="text-sm sm:text-base text-[#5C5A55] dark:text-neutral-400">
              Select one of our live properties to experience the frictionless mobile web app that your guests will see when scanning your welcome card.
            </p>
          </div>

          {/* Property Cards Selection */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(PROPERTIES).map((prop: PropertyData) => {
              const isSelected = selectedDemoSlug === prop.slug;
              return (
                <div
                  key={prop.slug}
                  onClick={() => setSelectedDemoSlug(prop.slug)}
                  className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#F6F4F0] dark:bg-[#1A1916] border-[#2A4436] dark:border-[#78A88E] shadow-soft-card ring-2 ring-[#2A4436]/20'
                      : 'bg-white dark:bg-[#151412] border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#5C5A55] dark:text-neutral-300">
                        {prop.location}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#2A4436] dark:text-[#78A88E]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#1C1B18] dark:text-white">
                      {prop.name}
                    </h3>

                    <p className="text-xs text-[#78756E] dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {prop.tagline}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] text-[#5C5A55] dark:text-neutral-400">
                      <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
                        Wi-Fi: {prop.wifi.network}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
                        Host: {prop.host.name}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLaunchDemo(prop.slug);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A4436] dark:text-[#78A88E] hover:underline"
                    >
                      <span>Open Demo</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-[#78756E] dark:text-neutral-400">
                      /stay/{prop.slug}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Launch Selected Demo Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => onLaunchDemo(selectedDemoSlug)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#2A4436] hover:bg-[#1E3328] text-white font-semibold text-sm shadow-soft-sm hover:shadow-soft-card transition-all cursor-pointer"
            >
              <span>Launch Live Assistant for {PROPERTIES[selectedDemoSlug]?.name || 'Selected Property'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ─── CORE FEATURES GRID (SEO KEYWORDS EMBEDDED) ─── */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2A4436] dark:text-[#78A88E]">
            <Zap className="w-3.5 h-3.5" />
            <span>Built for Modern Stays</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1B18] dark:text-white">
            Everything Your Guests & Operations Need
          </h2>
          <p className="text-sm sm:text-base text-[#5C5A55] dark:text-neutral-400">
            Dwellio AI replaces confusing paper binders and messaging headaches with smart, tailored hospitality software.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Feature 1: Dwellio Chat AI Assistant */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151412] border border-black/5 dark:border-white/10 shadow-soft-sm hover:shadow-soft-card transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#EBF2EC] dark:bg-[#2A4436]/40 flex items-center justify-center text-[#2A4436] dark:text-[#78A88E]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C1B18] dark:text-white">
              Dwellio Chat & AI Concierge
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5A55] dark:text-neutral-400 leading-relaxed">
              Powered by advanced Google Gemini models, <strong className="text-[#1C1B18] dark:text-white">Dwellio AI</strong> answers guest questions with conversational nuance, knows exact house rules, appliance instructions, and host-curated hidden gems.
            </p>
            <div className="pt-2 text-xs font-semibold text-[#2A4436] dark:text-[#78A88E] flex items-center gap-1">
              <span>Understands photos & custom instructions</span>
            </div>
          </div>

          {/* Feature 2: Phone-Verified Keypad & Lockbox Security */}
          <div id="security" className="p-6 rounded-2xl bg-white dark:bg-[#151412] border border-black/5 dark:border-white/10 shadow-soft-sm hover:shadow-soft-card transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F8ECE8] dark:bg-[#9E5A3F]/30 flex items-center justify-center text-[#9E5A3F]">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C1B18] dark:text-white">
              Phone-Verified Door Security
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5A55] dark:text-neutral-400 leading-relaxed">
              Never expose smart lock passcodes or physical keybox combinations publicly. Guests must verify their registered phone number before keypad codes are revealed.
            </p>
            <div className="pt-2 text-xs font-semibold text-[#9E5A3F] flex items-center gap-1">
              <span>Managed right from the Host Dashboard</span>
            </div>
          </div>

          {/* Feature 3: Bulletproof Offline Fallback Engine */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151412] border border-black/5 dark:border-white/10 shadow-soft-sm hover:shadow-soft-card transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FFF6E5] dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C1B18] dark:text-white">
              Fail-Safe Dynamic Backup
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5A55] dark:text-neutral-400 leading-relaxed">
              If an API limit triggers or network connection wavers, Dwellio’s smart dynamic offline engine immediately steps in to parse and answer key codes, Wi-Fi, check-in, parking, and rules.
            </p>
            <div className="pt-2 text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <span>Zero guest disruption, guaranteed</span>
            </div>
          </div>

          {/* Feature 4: Pass-and-Play Cabin Games */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151412] border border-black/5 dark:border-white/10 shadow-soft-sm hover:shadow-soft-card transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F6EEFA] dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C1B18] dark:text-white">
              Cabin Play & Party Games
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5A55] dark:text-neutral-400 leading-relaxed">
              Delight your guests on rainy afternoons and late fireside evenings with built-in pass-and-play party games: Truth or Dare and Never Have I Ever with Clean and Spicy modes.
            </p>
            <div className="pt-2 text-xs font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1">
              <span>Turns 4-star stays into 5-star reviews</span>
            </div>
          </div>

          {/* Feature 5: One-Touch Wi-Fi QR & Doorstep GPS */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151412] border border-black/5 dark:border-white/10 shadow-soft-sm hover:shadow-soft-card transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#EBF2EC] dark:bg-[#2A4436]/40 flex items-center justify-center text-[#2A4436] dark:text-[#78A88E]">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C1B18] dark:text-white">
              One-Touch Wi-Fi & GPS
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5A55] dark:text-neutral-400 leading-relaxed">
              Instant Wi-Fi connection QR code plus one-tap navigation to Apple Maps and Google Maps that lands guests directly at your driveway, avoiding lost calls.
            </p>
            <div className="pt-2 text-xs font-semibold text-[#2A4436] dark:text-[#78A88E] flex items-center gap-1">
              <span>One-tap copy for SSID and passwords</span>
            </div>
          </div>

          {/* Feature 6: Host Dashboard & Clean Printable PDF */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151412] border border-black/5 dark:border-white/10 shadow-soft-sm hover:shadow-soft-card transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F8ECE8] dark:bg-[#9E5A3F]/30 flex items-center justify-center text-[#9E5A3F]">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C1B18] dark:text-white">
              Host Portal & Safe QR PDF
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5A55] dark:text-neutral-400 leading-relaxed">
              Update check-in dates, guest phone numbers, and AI guidance in real-time. Generate printable welcome cards containing only property branding and QR code without exposing secrets.
            </p>
            <div className="pt-2 text-xs font-semibold text-[#9E5A3F] flex items-center gap-1">
              <span>Print once, update anywhere</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── HOW IT WORKS (STEP BY STEP) ─── */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-[#12110F] border-y border-black/[0.06] dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2A4436] dark:text-[#78A88E]">
              <Clock className="w-3.5 h-3.5" />
              <span>Simplicity First</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1B18] dark:text-white">
              How Dwellio Works in 4 Steps
            </h2>
            <p className="text-sm sm:text-base text-[#5C5A55] dark:text-neutral-400">
              Setting up takes 5 minutes. No coding, no complicated setup, and zero friction for guests.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="relative space-y-3 p-5 rounded-2xl bg-[#F6F4F0] dark:bg-[#1A1916] border border-black/5 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#2A4436] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-serif text-base font-bold text-[#1C1B18] dark:text-white">
                Add Property & Guide
              </h3>
              <p className="text-xs text-[#5C5A55] dark:text-neutral-400 leading-relaxed">
                Enter your Wi-Fi, parking rules, check-in codes, and custom host instructions in the Dwellio Host Portal.
              </p>
            </div>

            <div className="relative space-y-3 p-5 rounded-2xl bg-[#F6F4F0] dark:bg-[#1A1916] border border-black/5 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#2A4436] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-serif text-base font-bold text-[#1C1B18] dark:text-white">
                Print QR Welcome Card
              </h3>
              <p className="text-xs text-[#5C5A55] dark:text-neutral-400 leading-relaxed">
                Generate our elegant, minimalist PDF sign. Frame it by the entrance or kitchen island for guests to scan.
              </p>
            </div>

            <div className="relative space-y-3 p-5 rounded-2xl bg-[#F6F4F0] dark:bg-[#1A1916] border border-black/5 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#2A4436] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-serif text-base font-bold text-[#1C1B18] dark:text-white">
                Guest Scans to Open
              </h3>
              <p className="text-xs text-[#5C5A55] dark:text-neutral-400 leading-relaxed">
                Guests point their camera at the code. The web app instantly opens in Safari or Chrome without any app store download.
              </p>
            </div>

            <div className="relative space-y-3 p-5 rounded-2xl bg-[#F6F4F0] dark:bg-[#1A1916] border border-black/5 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#2A4436] text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-serif text-base font-bold text-[#1C1B18] dark:text-white">
                Dwellio AI Handles Rest
              </h3>
              <p className="text-xs text-[#5C5A55] dark:text-neutral-400 leading-relaxed">
                Dwellio Chat handles queries 24/7, verifies guest identity for lock codes, and gives host-grade local tips.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── SEO-RICH FAQ ACCORDION SECTION ─── */}
      <section id="faq" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2A4436] dark:text-[#78A88E]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1B18] dark:text-white">
            Frequently Asked Questions about Dwellio AI & Dwellio Chat
          </h2>
          <p className="text-sm sm:text-base text-[#5C5A55] dark:text-neutral-400">
            Everything you need to know about setting up Dwellio for your vacation rental, Airbnb, or boutique retreat.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          
          <details className="group rounded-2xl bg-white dark:bg-[#151412] p-5 sm:p-6 border border-black/5 dark:border-white/10 shadow-soft-sm open:border-[#2A4436]/40 transition-all cursor-pointer">
            <summary className="font-serif text-lg font-bold text-[#1C1B18] dark:text-white flex items-center justify-between list-none">
              <span>What is Dwellio AI and how does Dwellio Chat help hosts?</span>
              <ChevronRight className="w-5 h-5 text-[#78756E] group-open:rotate-90 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="mt-3.5 text-xs sm:text-sm text-[#5C5A55] dark:text-neutral-300 leading-relaxed">
              <strong>Dwellio AI</strong> is an intelligent digital guest concierge designed specifically for short-term vacation rentals, Airbnb properties, and boutique stays. Through <strong>Dwellio Chat</strong>, guests can ask questions 24/7 using natural conversation (e.g., “How do I turn on the sauna?”, “Where is extra coffee?”, or “What are the quiet hours?”). It cuts repetitive host messaging by up to 80% while elevating the guest experience to a five-star hospitality standard.
            </p>
          </details>

          <details className="group rounded-2xl bg-white dark:bg-[#151412] p-5 sm:p-6 border border-black/5 dark:border-white/10 shadow-soft-sm open:border-[#2A4436]/40 transition-all cursor-pointer">
            <summary className="font-serif text-lg font-bold text-[#1C1B18] dark:text-white flex items-center justify-between list-none">
              <span>Do guests need to install an app from the Apple App Store or Google Play?</span>
              <ChevronRight className="w-5 h-5 text-[#78756E] group-open:rotate-90 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="mt-3.5 text-xs sm:text-sm text-[#5C5A55] dark:text-neutral-300 leading-relaxed">
              No! Guests hate downloading new apps for a 3-night stay. Dwellio is built as a lightweight, progressive mobile web application. Guests simply point their iPhone or Android camera at your custom welcome QR card and the entire experience opens immediately in their default browser.
            </p>
          </details>

          <details className="group rounded-2xl bg-white dark:bg-[#151412] p-5 sm:p-6 border border-black/5 dark:border-white/10 shadow-soft-sm open:border-[#2A4436]/40 transition-all cursor-pointer">
            <summary className="font-serif text-lg font-bold text-[#1C1B18] dark:text-white flex items-center justify-between list-none">
              <span>How does Dwellio keep lockbox and smart lock door codes safe?</span>
              <ChevronRight className="w-5 h-5 text-[#78756E] group-open:rotate-90 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="mt-3.5 text-xs sm:text-sm text-[#5C5A55] dark:text-neutral-300 leading-relaxed">
              Dwellio keeps sensitive security codes hidden by default. In the “Getting inside & Check-in” screen, guests must verify the primary phone number on the booking reservation before keypad and keybox combinations are revealed. Furthermore, our printable QR PDF welcome card deliberately excludes passcodes so physical security is never compromised.
            </p>
          </details>

          <details className="group rounded-2xl bg-white dark:bg-[#151412] p-5 sm:p-6 border border-black/5 dark:border-white/10 shadow-soft-sm open:border-[#2A4436]/40 transition-all cursor-pointer">
            <summary className="font-serif text-lg font-bold text-[#1C1B18] dark:text-white flex items-center justify-between list-none">
              <span>What happens if the AI server has an outage or rate limit?</span>
              <ChevronRight className="w-5 h-5 text-[#78756E] group-open:rotate-90 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="mt-3.5 text-xs sm:text-sm text-[#5C5A55] dark:text-neutral-300 leading-relaxed">
              Dwellio includes a smart, fail-safe offline fallback engine. If the remote AI model encounters network latency, rate limits, or API errors, Dwellio immediately analyzes the guest’s query locally against all registered property records (Wi-Fi, parking, check-out time, trash disposal, host phone number) and delivers an instant accurate answer seamlessly.
            </p>
          </details>

          <details className="group rounded-2xl bg-white dark:bg-[#151412] p-5 sm:p-6 border border-black/5 dark:border-white/10 shadow-soft-sm open:border-[#2A4436]/40 transition-all cursor-pointer">
            <summary className="font-serif text-lg font-bold text-[#1C1B18] dark:text-white flex items-center justify-between list-none">
              <span>Can hosts customize AI instructions specific to their unique property?</span>
              <ChevronRight className="w-5 h-5 text-[#78756E] group-open:rotate-90 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="mt-3.5 text-xs sm:text-sm text-[#5C5A55] dark:text-neutral-300 leading-relaxed">
              Yes! In the Dwellio Host Portal, hosts can input custom AI guidelines—such as “Remind guests to latch the bear gate”, “Tell guests the pilot light on the fireplace is behind the brass valve”, or “Always recommend the blueberry pancakes at Meadow Cafe”. Dwellio AI automatically prioritizes these host rules during conversations.
            </p>
          </details>

        </div>
      </section>

      {/* ─── CALL TO ACTION BANNER ─── */}
      <section className="py-16 sm:py-24 bg-[#2A4436] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#E6AF2E]" />
            <span>Ready for effortless hosting?</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            Elevate Your Property with Dwellio AI Today
          </h2>

          <p className="text-sm sm:text-base text-neutral-200 max-w-xl mx-auto leading-relaxed">
            Test the live guest demo or open your property host dashboard to start delighting your travelers in under 5 minutes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onLaunchDemo(selectedDemoSlug)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#2A4436] font-bold text-sm sm:text-base shadow-xl hover:bg-[#FAF8F5] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#E6AF2E]" />
              <span>Launch Live Demo Now</span>
            </button>

            <button
              onClick={onOpenClientPortal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#1E3328] hover:bg-[#182B21] text-white font-bold text-sm sm:text-base border border-white/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Building className="w-4 h-4 text-[#9E5A3F]" />
              <span>Sign In to Host Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── SEO FOOTER WITH RICH BACKLINKS & KEYWORDS ─── */}
      <footer className="py-14 bg-[#151412] text-neutral-400 text-xs border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold text-white tracking-tight">
                  dwellio
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#2A4436] text-[#78A88E]">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                The smart conversational guest concierge for vacation rentals, Airbnb hosts, boutique cabins, and luxury villas.
              </p>
              <p className="text-[10px] text-neutral-500">
                © {new Date().getFullYear()} Dwellio AI. All rights reserved.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-2.5">
              <div className="text-white font-semibold text-xs uppercase tracking-wider">
                Live Demonstrations
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={() => onLaunchDemo('cedar-house')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Cedar House Demo (Tahoe)
                  </button>
                </li>
                <li>
                  <button onClick={() => onLaunchDemo('pine-crest-villa')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Pine Crest Villa Demo (Blue Ridge)
                  </button>
                </li>
                <li>
                  <button onClick={() => onLaunchDemo('seaside-haven')} className="hover:text-white transition-colors cursor-pointer text-left">
                    Seaside Haven Demo (Carmel)
                  </button>
                </li>
              </ul>
            </div>

            {/* Host Tools & Navigation */}
            <div className="space-y-2.5">
              <div className="text-white font-semibold text-xs uppercase tracking-wider">
                Management Portals
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={onOpenClientPortal} className="hover:text-white transition-colors cursor-pointer text-left">
                    Property Host Portal (/client)
                  </button>
                </li>
                <li>
                  <button onClick={onOpenAdmin} className="hover:text-white transition-colors cursor-pointer text-left">
                    Admin Management Console (/admin)
                  </button>
                </li>
                <li>
                  <a href="#security" className="hover:text-white transition-colors">
                    Lockbox & Keypad Security
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Dwellio AI FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* SEO Keyword Cloud for Google Indexing */}
            <div className="space-y-2.5">
              <div className="text-white font-semibold text-xs uppercase tracking-wider">
                Topics & Keywords
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300">dwellio</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300">dwellio ai</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300">dwellio chat</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300">airbnb ai assistant</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300">vacation rental concierge</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300">digital house manual</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300">smart lock guest code</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300">qr guest guide</span>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-white/5 text-center text-[10px] text-neutral-500">
            Dwellio AI Concierge • Designed with Newsreader serif and Plus Jakarta Sans • Fast, secure, and offline-resilient.
          </div>

        </div>
      </footer>

    </div>
  );
};
