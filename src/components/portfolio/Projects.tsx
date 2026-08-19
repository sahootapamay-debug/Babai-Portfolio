import { ExternalLink, Github, Star, FolderGit2 } from 'lucide-react';
import type { Project, SectionSetting } from '@/types';
import { SectionHeading } from './About';

interface ProjectsProps {
  projects: Project[];
  section: SectionSetting | undefined;
}

export function Projects({ projects, section }: ProjectsProps) {
  if (!section?.visible) return null;

  const visible = projects.filter((p) => p.visible).sort((a, b) => a.sort_order - b.sort_order);
  const featured = visible.filter((p) => p.featured);
  const regular = visible.filter((p) => !p.featured);

  return (
    <section id="projects" className="section-pad relative">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="container-max relative z-10">
        <SectionHeading title={section.title} subtitle={section.subtitle} />

        {visible.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No projects yet.</p>
        ) : (
          <div className="mt-12 space-y-6">
            {/* Featured projects */}
            {featured.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2">
                {featured.map((project) => (
                  <ProjectCard key={project.id} project={project} featured />
                ))}
              </div>
            )}

            {/* Regular projects */}
            {regular.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {regular.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project, featured }: { project: Project; featured?: boolean }) {
  const techs = project.technologies?.split(',').map((t) => t.trim()).filter(Boolean) ?? [];

  return (
    <div className={`group glass rounded-2xl overflow-hidden card-glow transition-all hover:border-white/20 hover:shadow-xl hover:shadow-indigo-500/10 ${
      featured ? 'sm:col-span-1' : ''
    }`}>
      {/* Image */}
      <div className={`overflow-hidden bg-white/5 ${featured ? 'aspect-video' : 'aspect-video'}`}>
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-pink-500/10">
            <FolderGit2 className="w-10 h-10 text-slate-600" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-white">{project.title}</h3>
          {project.featured && (
            <Star className="w-4 h-4 flex-shrink-0 text-amber-400 fill-amber-400" />
          )}
        </div>

        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{project.description ?? 'No description'}</p>

        {techs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {techs.slice(0, 4).map((tech) => (
              <span key={tech} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                {tech}
              </span>
            ))}
            {techs.length > 4 && (
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                +{techs.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-white/5 pt-3">
          {project.project_url && (
            <a href={project.project_url} target="_blank" rel="noreferrer" className="btn-ghost !px-2 !py-1.5 text-xs text-indigo-400 hover:text-indigo-300">
              <ExternalLink className="w-3.5 h-3.5" /> Live Demo
            </a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer" className="btn-ghost !px-2 !py-1.5 text-xs text-slate-400">
              <Github className="w-3.5 h-3.5" /> Code
            </a>
          )}
          {project.category && (
            <span className="ml-auto text-[10px] text-slate-500 uppercase tracking-wider">{project.category}</span>
          )}
        </div>
      </div>
    </div>
  );
}
