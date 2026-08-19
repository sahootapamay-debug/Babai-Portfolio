import { useEffect, useRef } from 'react';
import type { Skill, SectionSetting } from '@/types';
import { getIcon } from '@/utils/icons';
import { SectionHeading } from './About';

interface SkillsProps {
  skills: Skill[];
  section: SectionSetting | undefined;
}

export function Skills({ skills, section }: SkillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleSkills = skills.filter((s) => s.visible);
  const groups = Array.from(new Set(visibleSkills.map((s) => s.group_name)));

  // Animate progress bars when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-bar');
          }
        });
      },
      { threshold: 0.2 },
    );

    containerRef.current?.querySelectorAll('[data-bar]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [groups]);

  if (!section?.visible) return null;

  return (
    <section id="skills" className="section-pad relative">
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="container-max relative z-10">
        <SectionHeading title={section.title} subtitle={section.subtitle} />

        <div ref={containerRef} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const groupSkills = visibleSkills.filter((s) => s.group_name === group).sort((a, b) => a.sort_order - b.sort_order);
            return (
              <div key={group} className="glass rounded-2xl p-6 card-glow">
                <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                  <span className="h-1 w-4 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" />
                  {group}
                </h3>
                <div className="space-y-4">
                  {groupSkills.map((skill) => {
                    const Icon = getIcon(skill.icon);
                    return (
                      <div key={skill.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm text-slate-300">{skill.name}</span>
                          </div>
                          <span className="text-xs font-medium text-slate-400">{skill.level}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                          <div
                            data-bar
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-1000"
                            style={{ width: '0%', '--target-width': `${skill.level}%` } as React.CSSProperties}
                            ref={(el) => {
                              if (el) {
                                setTimeout(() => { el.style.width = `${skill.level}%`; }, 100);
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
