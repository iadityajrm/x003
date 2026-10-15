import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Compass,
  Wifi,
  Building2
} from 'lucide-react';
import { PROPERTIES } from '../../data/properties';
import { PropertyData } from '../../types';

interface DwellioWebsiteProps {
  onLaunchDemo: (slug?: string) => void;
  onOpenClientPortal: () => void;
  onOpenAdmin: () => void;
  isExiting?: boolean;
}

export const DwellioWebsite: React.FC<DwellioWebsiteProps> = ({
  onLaunchDemo,
  onOpenClientPortal,
  onOpenAdmin,
  isExiting = false,
}) => {
  const [selectedDemoSlug, setSelectedDemoSlug] = useState('cedar-house');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Enforce dark mode on landing page by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Scroll reveal observer: all elements with .reveal-from-top fade in from above on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        root: null,
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const elements = document.querySelectorAll('.reveal-from-top');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const propertiesList: PropertyData[] = Object.values(PROPERTIES);

  const features = [
    {
      title: 'Instant Assistance',
      description: 'Wi-Fi, climate control, and house instructions answered in seconds, 24/7.',
      icon: <Sparkles className="w-5 h-5 text-[#78A88E]" />,
    },
    {
      title: 'Verified Access',
      description: 'Smart lock codes and key instructions revealed only to confirmed guests.',
      icon: <ShieldCheck className="w-5 h-5 text-[#78A88E]" />,
    },
    {
      title: 'Curated Recommendations',
      description: 'Hand-picked cafes, scenic trails, and neighborhood dining favorites.',
      icon: <Compass className="w-5 h-5 text-[#78A88E]" />,
    },
    {
      title: 'Fail-Safe Offline Backup',
      description: 'Key property details remain accessible even during network interruptions.',
      icon: <Wifi className="w-5 h-5 text-[#78A88E]" />,
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
    <div
      className={`min-h-screen bg-[#0D0C0A] text-[#EDEAE4] selection:bg-[#2A4436]/40 transition-all ${
        isExiting ? 'animate-page-fade-out' : 'animate-page-fade-in'
      }`}
    >
      
      {/* ─── FLOATING PILL NAVIGATION (NO TOGGLE, FADES FROM ABOVE) ─── */}
      <div className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <header
          className="reveal-from-top pointer-events-auto w-full max-w-4xl bg-[#161513]/90 backdrop-blur-md rounded-full px-5 sm:px-6 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/[0.08] flex items-center justify-between"
          style={{ transitionDelay: '100ms' }}
        >
          {/* Brand Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            {/* Minimalist 4-dot geometric mark */}
            <div className="grid grid-cols-2 gap-0.5 p-1 text-[#78A88E]">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-white">
              dwellio
            </span>
          </a>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-400">
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#properties" className="hover:text-white transition-colors">
              Properties
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQs
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenClientPortal}
              className="hidden sm:inline-flex text-xs font-medium text-neutral-300 hover:text-white px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              Host Portal
            </button>

            <button
              onClick={() => onLaunchDemo(selectedDemoSlug)}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-[#2A4436] hover:bg-[#345946] text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Live Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      </div>

      {/* ─── HERO SECTION (DARK LUXURY ARCHITECTURE) ─── */}
      <section className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between pt-28 sm:pt-36 overflow-hidden">
        
        {/* Architectural Image with Dark Moody Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85"
            alt="Modern luxury residence"
            className="w-full h-full object-cover object-center brightness-90"
          />
          {/* Subtle dark gradient overlay preserving serene architectural sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D0C0A]/90 via-[#0D0C0A]/50 to-transparent" />
          
          {/* Smooth bottom fade into deep dark page background */}
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#0D0C0A] via-[#0D0C0A]/75 to-transparent" />
        </div>

        {/* Hero Content (Cascading fade in from above on load) */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6 pt-6 sm:pt-12">
          
          <h1
            className="reveal-from-top font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.12]"
            style={{ transitionDelay: '200ms' }}
          >
            Spaces worth coming home to.
          </h1>

          <p
            className="reveal-from-top text-sm sm:text-base lg:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed font-normal"
            style={{ transitionDelay: '350ms' }}
          >
            A refined digital guest guide and 24/7 intelligent concierge for vacation rentals. Thoughtfully crafted to give travelers everything they need without clutter.
          </p>

          {/* Hero CTAs */}
          <div
            className="reveal-from-top pt-2 flex flex-row items-center justify-center gap-3"
            style={{ transitionDelay: '500ms' }}
          >
            <button
              onClick={() => onLaunchDemo(selectedDemoSlug)}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-[#2A4436] hover:bg-[#345946] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#2A4436]/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Live Demo</span>
            </button>

            <button
              onClick={onOpenClientPortal}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-[#1A1916]/95 hover:bg-[#252420] text-white text-xs sm:text-sm font-semibold border border-white/15 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span>Host Portal</span>
            </button>
          </div>

        </div>

        {/* Bottom anchor */}
        <div className="relative z-10 pb-12" />

      </section>

      {/* ─── ABOUT & PHILOSOPHY (FADES IN FROM ABOVE ON SCROLL) ─── */}
      <section id="about" className="py-24 sm:py-32 max-w-5xl mx-auto px-6">
        <div className="reveal-from-top text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[11px] uppercase tracking-widest font-bold text-[#78A88E]">
            Effortless Hospitality
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
            Simple, calm, and always attentive.
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed pt-2">
            Guests should never spend their first evening searching for Wi-Fi passwords or deciphering appliance manuals. Dwellio brings clarity to every detail of the stay.
          </p>
        </div>

        {/* 4 Feature Cards (Fading in from above with staggered delays) */}
        <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="reveal-from-top p-8 sm:p-10 rounded-3xl bg-[#141311] border border-white/[0.08] shadow-[0_4px_25px_rgb(0,0,0,0.3)] space-y-4 hover:border-white/15 transition-all"
              style={{ transitionDelay: `${idx * 120}ms` }}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED RESIDENCES SHOWCASE (INTERACTIVE DEMO) ─── */}
      <section id="properties" className="py-24 bg-[#100F0E] border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="reveal-from-top flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#78A88E]">
                Featured Properties
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Experience Dwellio in action.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm">
              Tap any residence below to launch its live digital guest assistant.
            </p>
          </div>

          {/* Properties Grid (Fading in from above with staggered delays) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {propertiesList.map((prop, idx) => (
              <div
                key={prop.slug}
                onClick={() => onLaunchDemo(prop.slug)}
                className="reveal-from-top group rounded-3xl overflow-hidden bg-[#161513] border border-white/[0.08] shadow-sm hover:shadow-2xl hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between"
                style={{ transitionDelay: `${idx * 140}ms` }}
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-900 relative">
                    <img
                      src={prop.heroImage}
                      alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide text-white">
                      {prop.location}
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#78A88E] transition-colors">
                      {prop.name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {prop.tagline}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between text-xs font-semibold text-[#78A88E]">
                  <span>Launch Guest View</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── CLEAN FAQ ACCORDION (SMOOTH CSS GRID ANIMATION) ─── */}
      <section id="faq" className="py-24 sm:py-32 max-w-3xl mx-auto px-6">
        <div className="reveal-from-top text-center space-y-3 mb-14">
          <span className="text-[11px] uppercase tracking-widest font-bold text-[#78A88E]">
            Common Questions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Frequently Asked
          </h2>
        </div>

        <div className="divide-y divide-white/[0.08]">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="reveal-from-top py-6"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg font-bold text-white group-hover:text-[#78A88E] transition-colors pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-500 shrink-0 transition-transform duration-300 ease-out ${
                      isOpen ? 'rotate-180 text-[#78A88E]' : ''
                    }`}
                  />
                </button>
                
                {/* Smooth Height Expansion & Fade using CSS Grid */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 mt-3.5' : 'grid-rows-[0fr] opacity-0 mt-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed pr-6">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── MINIMALIST FOOTER ─── */}
      <footer className="reveal-from-top py-14 bg-[#0A0908] border-t border-white/[0.06] text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-white">
              dwellio
            </span>
            <span className="text-[11px] text-neutral-500">
              · The digital guest concierge
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium text-[11px] text-neutral-400">
            <button
              onClick={() => onLaunchDemo('cedar-house')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Demo
            </button>
            <button
              onClick={onOpenClientPortal}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Host Portal
            </button>
            <button
              onClick={onOpenAdmin}
              className="hover:text-white transition-colors cursor-pointer"
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
