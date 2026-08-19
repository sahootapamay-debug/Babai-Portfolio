import { Heart, Linkedin, MessageCircle, Github, Mail, ArrowUp } from 'lucide-react';
import type { Profile, SocialLinks, SiteSettings } from '@/types';

interface FooterProps {
  profile: Profile | null;
  socialLinks: SocialLinks | null;
  siteSettings: SiteSettings | null;
}

export function Footer({ profile, socialLinks, siteSettings }: FooterProps) {
  const year = new Date().getFullYear();
  const name = profile?.name ?? 'Akash Mondal';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-white/5 py-12">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Logo */}
          <button onClick={scrollToTop} className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-sm font-bold text-white transition-transform group-hover:scale-105">
              {siteSettings?.logo_text ?? 'AM'}
            </div>
            <span className="text-sm font-semibold text-slate-200">{name}</span>
          </button>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socialLinks?.linkedin_url && (
              <a href={socialLinks.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:text-white hover:bg-white/10">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {socialLinks?.whatsapp_number && (
              <a href={`https://wa.me/${socialLinks.whatsapp_number}?text=${encodeURIComponent('Hello Akash, I found your portfolio and would like to discuss...')}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:text-white hover:bg-white/10">
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {socialLinks?.github_url && (
              <a href={socialLinks.github_url} target="_blank" rel="noreferrer" aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:text-white hover:bg-white/10">
                <Github className="w-4 h-4" />
              </a>
            )}
            {socialLinks?.email && (
              <a href={`mailto:${socialLinks.email}`} aria-label="Email" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:text-white hover:bg-white/10">
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Copyright */}
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            &copy; {year} {name}. Made with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> and React.
          </p>

          {/* Back to top */}
          <button onClick={scrollToTop} className="btn-ghost text-xs">
            <ArrowUp className="w-3.5 h-3.5" /> Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
