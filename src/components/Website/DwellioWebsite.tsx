import React, { useState } from 'react';
import {
  ArrowRight,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Compass,
  Wifi,
  Gamepad2,
  Building2
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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

  const propertiesList: PropertyData[] = Object.values(PROPERTIES);

  const features = [
    {
      title: 'Instant Assistance',
      description: 'Wi-Fi, climate control, and house instructions answered in seconds, 24/7.',
      icon: <Sparkles className="w-5 h-5 text-[#2A4436] dark:text-[#78A88E]" />,
    },
    {
      title: 'Verified Access',
      description: 'Smart lock codes and key instructions revealed only to confirmed guests.',
      icon: <ShieldCheck className="w-5 h-5 text-[#2A4436] dark:text-[#78A88E]" />,
    },
    {
      title: 'Curated Recommendations',
      description: 'Hand-picked cafes, scenic trails, and neighborhood dining favorites.',
      icon: <Compass className="w-5 h-5 text-[#2A4436] dark:text-[#78A88E]" />,
    },
    {
      title: 'Fail-Safe Offline Backup',
      description: 'Key property details remain accessible even during network interruptions.',
      icon: <Wifi className="w-5 h-5 text-[#2A4436] dark:text-[#78A88E]" />,
    },
  ];

  const faqs = [
    {
      q: 'Do guests need to install an app?',
      a: 'No app download is required. Guests simply scan a QR card placed in the home, and Dwellio opens instantly in any mobile browser.',
    },
    {
      q: 'How does Dwellio keep entry codes safe?',
      a: 'Lockbox and keypad access codes remain hidden until the guest verifies their booking phone number inside the digital guide.',
    },
    {
      q: 'Can hosts customize instructions for their home?',
      a: 'Yes. Through the host portal, you can customize check-in guidelines, appliance notes, trash days, and favorite local recommendations.',
    },
    {
      q: 'What happens if the internet goes down?',
      a: 'Dwellio features an offline fallback engine that answers essential property questions even without an active internet connection.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0D0C0A] text-[#1C1B18] dark:text-[#EDEAE4] transition-colors selection:bg-[#2A4436]/20">
      
      {/* ─── FLOATING PILL NAVIGATION ─── */}
      <div className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <header className="pointer-events-auto w-full max-w-4xl bg-white/90 dark:bg-[#181715]/90 backdrop-blur-md rounded-full px-4 sm:px-6 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between transition-all">
          
          {/* Brand Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            {/* Minimalist 4-dot icon inspired by reference */}
            <div className="grid grid-cols-2 gap-0.5 p-1 text-[#2A4436] dark:text-[#78A88E]">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-[#1C1B18] dark:text-white">
              dwellio
            </span>
          </a>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#68655F] dark:text-neutral-400">
            <a href="#about" className="hover:text-[#1C1B18] dark:hover:text-white transition-colors">
              About
            </a>
            <a href="#features" className="hover:text-[#1C1B18] dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#properties" className="hover:text-[#1C1B18] dark:hover:text-white transition-colors">
              Properties
            </a>
            <a href="#faq" className="hover:text-[#1C1B18] dark:hover:text-white transition-colors">
              FAQs
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#68655F] dark:text-neutral-300 transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            <button
              onClick={onOpenClientPortal}
              className="hidden sm:inline-flex text-xs font-medium text-[#68655F] dark:text-neutral-300 hover:text-[#1C1B18] dark:hover:text-white px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              Host Portal
            </button>

            <button
              onClick={() => onLaunchDemo(selectedDemoSlug)}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Live Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </header>
      </div>

      {/* ─── HERO SECTION (MATCHING REFERENCE COMPOSITION) ─── */}
      <section className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between pt-28 sm:pt-36 overflow-hidden">
        
        {/* Background Architectural Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85"
            alt="Modern luxury residence"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle natural sky gradient overlay on top for crisp typography */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/40 to-transparent dark:from-[#0D0C0A]/90 dark:via-[#0D0C0A]/50 dark:to-transparent" />
          
          {/* Smooth bottom fade into next section */}
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#FBFBF9] dark:from-[#0D0C0A] via-[#FBFBF9]/70 dark:via-[#0D0C0A]/70 to-transparent" />
        </div>

        {/* Hero Content (Clean, to the point, generous whitespace) */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6 pt-6 sm:pt-12">
          
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1C1B18] dark:text-white leading-[1.12]">
            Spaces worth coming home to.
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#4A4742] dark:text-neutral-200 max-w-2xl mx-auto leading-relaxed font-normal">
            A refined digital guest guide and 24/7 intelligent concierge for vacation rentals. Thoughtfully crafted to give travelers everything they need without clutter.
          </p>

          {/* Hero CTAs - Twin Rounded Pills matching reference */}
          <div className="pt-2 flex flex-row items-center justify-center gap-3">
            <button
              onClick={() => onLaunchDemo(selectedDemoSlug)}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-[#2A4436] hover:bg-[#1E3328] text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Live Demo</span>
            </button>

            <button
              onClick={onOpenClientPortal}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-white/95 dark:bg-[#1A1916]/95 hover:bg-white dark:hover:bg-[#222] text-[#1C1B18] dark:text-white text-xs sm:text-sm font-semibold border border-black/10 dark:border-white/15 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span>Host Portal</span>
            </button>
          </div>

        </div>

        {/* Bottom spacing anchor */}
        <div className="relative z-10 pb-12" />

      </section>

      {/* ─── ABOUT & PHILOSOPHY (MINIMAL & SPACED) ─── */}
      <section id="about" className="py-24 sm:py-32 max-w-5xl mx-auto px-6">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[11px] uppercase tracking-widest font-bold text-[#2A4436] dark:text-[#78A88E]">
            Effortless Hospitality
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C1B18] dark:text-white leading-tight">
            Simple, calm, and always attentive.
          </h2>
          <p className="text-sm sm:text-base text-[#68655F] dark:text-neutral-400 leading-relaxed pt-2">
            Guests should never spend their first evening searching for Wi-Fi passwords or deciphering appliance manuals. Dwellio brings clarity to every detail of the stay.
          </p>
        </div>

        {/* 4 Clean Feature Cards with generous spacing */}
        <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#151412] border border-black/[0.05] dark:border-white/[0.07] shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4 hover:border-black/10 dark:hover:border-white/15 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#F6F4F0] dark:bg-white/5 flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1B18] dark:text-white">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#68655F] dark:text-neutral-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CURATED PROPERTIES SHOWCASE (INTERACTIVE DEMO) ─── */}
      <section id="properties" className="py-24 bg-white dark:bg-[#12110F] border-y border-black/[0.04] dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#2A4436] dark:text-[#78A88E]">
                Featured Properties
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1B18] dark:text-white">
                Experience Dwellio in action.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#68655F] dark:text-neutral-400 max-w-sm">
              Tap any residence below to launch its live digital guest assistant.
            </p>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {propertiesList.map((prop) => (
              <div
                key={prop.slug}
                onClick={() => onLaunchDemo(prop.slug)}
                className="group rounded-3xl overflow-hidden bg-[#FBFBF9] dark:bg-[#161513] border border-black/[0.05] dark:border-white/[0.08] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 relative">
                    <img
                      src={prop.heroImage}
                      alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide text-[#1C1B18] dark:text-white">
                      {prop.location}
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="font-serif text-lg font-bold text-[#1C1B18] dark:text-white group-hover:text-[#2A4436] dark:group-hover:text-[#78A88E] transition-colors">
                      {prop.name}
                    </h3>
                    <p className="text-xs text-[#68655F] dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {prop.tagline}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between text-xs font-semibold text-[#2A4436] dark:text-[#78A88E]">
                  <span>Launch Guest View</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── CLEAN FAQ ACCORDION ─── */}
      <section id="faq" className="py-24 sm:py-32 max-w-3xl mx-auto px-6">
        <div className="text-center space-y-3 mb-14">
          <span className="text-[11px] uppercase tracking-widest font-bold text-[#2A4436] dark:text-[#78A88E]">
            Common Questions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1B18] dark:text-white">
            Frequently Asked
          </h2>
        </div>

        <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-6">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="font-serif text-lg font-bold text-[#1C1B18] dark:text-white group-hover:text-[#2A4436] dark:group-hover:text-[#78A88E] transition-colors pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8A8680] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#2A4436] dark:text-[#78A88E]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-[#68655F] dark:text-neutral-400 leading-relaxed pr-6">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── MINIMALIST FOOTER ─── */}
      <footer className="py-14 bg-white dark:bg-[#100F0E] border-t border-black/[0.05] dark:border-white/[0.06] text-xs text-[#8A8680]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-[#1C1B18] dark:text-white">
              dwellio
            </span>
            <span className="text-[11px] text-[#8A8680]">
              · The digital guest concierge
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium text-[11px] text-[#68655F] dark:text-neutral-400">
            <button
              onClick={() => onLaunchDemo('cedar-house')}
              className="hover:text-[#1C1B18] dark:hover:text-white transition-colors cursor-pointer"
            >
              Demo
            </button>
            <button
              onClick={onOpenClientPortal}
              className="hover:text-[#1C1B18] dark:hover:text-white transition-colors cursor-pointer"
            >
              Host Portal
            </button>
            <button
              onClick={onOpenAdmin}
              className="hover:text-[#1C1B18] dark:hover:text-white transition-colors cursor-pointer"
            >
              Admin
            </button>
          </div>

          <p className="text-[11px]">
            © {new Date().getFullYear()} Dwellio. All rights reserved.
          </p>

        </div>
      </footer>

    </div>
  );
};
