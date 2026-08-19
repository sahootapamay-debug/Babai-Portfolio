import { useState, useEffect } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import type { NavigationItem, Profile } from '@/types';

interface NavbarProps {
  navigation: NavigationItem[];
  profile: Profile | null;
  logoText: string;
}

export function Navbar({ navigation, profile, logoText }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const visibleNav = navigation.filter((n) => n.visible).sort((a, b) => a.sort_order - b.sort_order);

  const scrollTo = (sectionId: string) => {
    setMobileOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container-max flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <button onClick={() => scrollTo('home')} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-sm font-bold text-white transition-transform group-hover:scale-105">
              {logoText || 'AM'}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-slate-200">
              {profile?.name ?? 'Akash Mondal'}
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {visibleNav.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.section_id)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white hover:bg-white/5"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTo('contact')}
              className="hidden sm:inline-flex btn-primary !py-2 !px-4 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Get in Touch
            </button>
            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="lg:hidden rounded-lg p-2 text-slate-300 hover:bg-white/5"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-72 glass-strong p-6 pt-20 animate-[slideIn_0.2s_ease-out]">
            <div className="space-y-1">
              {visibleNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.section_id)}
                  className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
