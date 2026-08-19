import { GraduationCap, Briefcase } from 'lucide-react';
import type { Education, Experience, SectionSetting } from '@/types';
import { SectionHeading } from './About';

interface TimelineProps {
  items: Education[] | Experience[];
  section: SectionSetting | undefined;
  type: 'education' | 'experience';
}

export function Timeline({ items, section, type }: TimelineProps) {
  if (!section?.visible) return null;

  const visible = items.filter((i) => i.visible).sort((a, b) => a.sort_order - b.sort_order);
  const Icon = type === 'education' ? GraduationCap : Briefcase;

  return (
    <section id={type === 'education' ? 'education' : 'experience'} className="section-pad relative">
      <div className="container-max">
        <SectionHeading title={section.title} subtitle={section.subtitle} />

        <div className="mt-12 max-w-3xl mx-auto">
          {visible.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No entries yet.</p>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-pink-500/20 to-transparent sm:-translate-x-px" />

              <div className="space-y-8">
                {visible.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`relative flex gap-6 sm:gap-0 ${idx % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                  >
                    {/* Dot */}
                    <div className="absolute left-4 sm:left-1/2 top-2 -translate-x-1/2 z-10">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 ring-4 ring-[#0a0a0f]">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Card */}
                    <div className={`ml-14 sm:ml-0 sm:w-1/2 ${idx % 2 === 0 ? 'sm:pr-10 sm:text-right' : 'sm:pl-10'}`}>
                      <div className="glass rounded-2xl p-5 card-glow animate-fade-up">
                        <span className="inline-block rounded-full bg-indigo-500/10 px-3 py-0.5 text-xs font-medium text-indigo-400 mb-2">
                          {item.year}
                        </span>
                        <h3 className="text-base font-semibold text-white">{item.title}</h3>
                        <p className="text-sm text-slate-400 mt-0.5">{item.organization}</p>
                        {item.tags && (
                          <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-wider">{item.tags}</p>
                        )}
                        {item.description && (
                          <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Spacer for other half */}
                    <div className="hidden sm:block sm:w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
