import { MapPin, Mail, Phone, Languages, GraduationCap, FolderGit2, Award, Briefcase } from 'lucide-react';
import type { Profile, SectionSetting } from '@/types';

interface AboutProps {
  profile: Profile | null;
  section: SectionSetting | undefined;
}

export function About({ profile, section }: AboutProps) {
  if (!section?.visible) return null;

  const stats = [
    { label: 'Projects', value: profile?.projects_stat ?? 0, icon: FolderGit2 },
    { label: 'Certificates', value: profile?.certificates_stat ?? 0, icon: Award },
    { label: 'Internships', value: profile?.internships_stat ?? 0, icon: Briefcase },
  ];

  const infoItems = [
    { icon: MapPin, label: 'Location', value: profile?.location },
    { icon: Mail, label: 'Email', value: profile?.email },
    { icon: Phone, label: 'Phone', value: profile?.phone },
    { icon: Languages, label: 'Languages', value: profile?.languages },
    { icon: GraduationCap, label: 'Degree', value: profile?.degree },
  ].filter((i) => i.value);

  return (
    <section id="about" className="section-pad relative">
      <div className="container-max">
        <SectionHeading title={section.title} subtitle={section.subtitle} />

        <div className="grid gap-10 lg:grid-cols-5 mt-12">
          {/* Left: Info card */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 card-glow">
              <h3 className="text-base font-semibold text-white mb-5">Personal Information</h3>
              <div className="space-y-4">
                {infoItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm text-slate-200 truncate">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: About text */}
          <div className="lg:col-span-3">
            <div className="space-y-5">
              <div className="text-slate-300 leading-relaxed">
                {profile?.about_paragraph_1}
              </div>
              <div className="text-slate-400 leading-relaxed">
                {profile?.about_paragraph_2}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="glass rounded-xl p-4 text-center">
                    <Icon className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
                    <p className="text-2xl font-bold text-white">{stat.value}+</p>
                    <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({ title, subtitle, center = true }: { title: string; subtitle?: string | null; center?: boolean }) {
  return (
    <div className={`mb-4 ${center ? 'text-center' : ''}`}>
      <h2 className="text-3xl font-bold text-white sm:text-4xl text-balance">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
      <div className={`mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 ${center ? 'mx-auto' : ''}`} />
    </div>
  );
}
