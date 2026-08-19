import { useEffect, useState } from 'react';
import { Download, FolderGit2, Mail, MessageCircle, Linkedin, Github } from 'lucide-react';
import type { Profile, SocialLinks } from '@/types';

interface HeroProps {
  profile: Profile | null;
  socialLinks: SocialLinks | null;
}

export function Hero({ profile, socialLinks }: HeroProps) {
  const roles = profile?.hero_roles?.split('|').filter(Boolean) ?? [];
  const [roleIdx, setRoleIdx] = useState(0);

  useEffect(() => {
    if (roles.length <= 1) return;
    const interval = setInterval(() => {
      setRoleIdx((i) => (i + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[140px] animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[140px] animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[100px]" />

      <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Text */}
          <div className="animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Available for opportunities
            </div>

            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl text-balance">
              Hi, I'm <span className="gradient-text">{profile?.name ?? 'Akash Mondal'}</span>
            </h1>

            <div className="mt-3 flex items-center gap-2 text-xl text-slate-300 sm:text-2xl">
              <span>{profile?.professional_title ?? 'BBA Finance & Banking'}</span>
            </div>

            {roles.length > 0 && (
              <div className="mt-2 h-8 overflow-hidden">
                <p key={roleIdx} className="animate-[fadeUp_0.4s_ease-out] text-lg font-medium gradient-text-cyan">
                  {roles[roleIdx]}
                </p>
              </div>
            )}

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 text-balance">
              {profile?.hero_description}
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={() => scrollTo('projects')} className="btn-primary">
                <FolderGit2 className="w-4 h-4" /> View Projects
              </button>
              <button onClick={() => scrollTo('contact')} className="btn-secondary">
                <Mail className="w-4 h-4" /> Contact Me
              </button>
              {profile?.resume_url && (
                <a href={profile.resume_url} target="_blank" rel="noreferrer" className="btn-secondary">
                  <Download className="w-4 h-4" /> Resume
                </a>
              )}
            </div>

            {/* Social icons */}
            <div className="mt-8 flex items-center gap-3">
              {socialLinks?.linkedin_url && (
                <SocialIcon href={socialLinks.linkedin_url} icon={Linkedin} label="LinkedIn" />
              )}
              {socialLinks?.whatsapp_number && (
                <SocialIcon
                  href={`https://wa.me/${socialLinks.whatsapp_number}?text=${encodeURIComponent('Hello Akash, I found your portfolio and would like to discuss...')}`}
                  icon={MessageCircle}
                  label="WhatsApp"
                />
              )}
              {socialLinks?.github_url && (
                <SocialIcon href={socialLinks.github_url} icon={Github} label="GitHub" />
              )}
              {socialLinks?.email && (
                <SocialIcon href={`mailto:${socialLinks.email}`} icon={Mail} label="Email" />
              )}
            </div>
          </div>

          {/* Right: Profile photo */}
          <div className="flex justify-center lg:justify-end animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-pink-500/20 blur-3xl animate-float" />
              <div className="relative h-64 w-64 sm:h-80 sm:w-80 rounded-full border-4 border-white/10 overflow-hidden card-glow">
                {profile?.profile_photo_url ? (
                  <img src={profile.profile_photo_url} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-pink-500/20">
                    <span className="text-6xl font-bold gradient-text">
                      {profile?.name?.[0] ?? 'A'}
                    </span>
                  </div>
                )}
              </div>
              {/* Decorative ring */}
              <div className="absolute inset-0 -m-4 rounded-full border border-white/5 animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/10 p-1.5">
            <div className="h-2 w-1 rounded-full bg-slate-400 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialIcon({ href, icon: Icon, label }: { href: string; icon: typeof Mail; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white hover:scale-105"
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}

