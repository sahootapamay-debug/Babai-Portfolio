import { useState } from 'react';
import { Award, ExternalLink, X } from 'lucide-react';
import type { Certificate, SectionSetting } from '@/types';
import { getIcon } from '@/utils/icons';
import { SectionHeading } from './About';

interface CertificatesProps {
  certificates: Certificate[];
  section: SectionSetting | undefined;
}

export function Certificates({ certificates, section }: CertificatesProps) {
  const [lightbox, setLightbox] = useState<Certificate | null>(null);

  if (!section?.visible) return null;

  const visible = certificates.filter((c) => c.visible).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section id="certificates" className="section-pad relative">
      <div className="container-max">
        <SectionHeading title={section.title} subtitle={section.subtitle} />

        {visible.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No certificates yet.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((cert) => {
              const Icon = getIcon(cert.icon);
              return (
                <div
                  key={cert.id}
                  className="group glass rounded-2xl overflow-hidden card-glow transition-all hover:border-white/20 hover:shadow-xl hover:shadow-pink-500/10"
                >
                  {/* Image / gradient header */}
                  <button
                    onClick={() => cert.image_url && setLightbox(cert)}
                    className={`relative block w-full aspect-video overflow-hidden bg-gradient-to-br ${cert.gradient}`}
                    aria-label={`View ${cert.name}`}
                  >
                    {cert.image_url ? (
                      <img
                        src={cert.image_url}
                        alt={cert.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/80">
                        <Icon className="w-12 h-12" />
                      </div>
                    )}
                    {cert.image_url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-medium">
                          Click to view
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start gap-2 mb-2">
                      <Award className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white line-clamp-1">{cert.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{cert.issuer} · {cert.year}</p>
                      </div>
                    </div>
                    {cert.certificate_url && (
                      <a
                        href={cert.certificate_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Certificate
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && lightbox.image_url && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.image_url} alt={lightbox.name} className="w-full rounded-2xl border border-white/10" />
            <div className="mt-4 text-center">
              <h3 className="text-base font-semibold text-white">{lightbox.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{lightbox.issuer} · {lightbox.year}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
