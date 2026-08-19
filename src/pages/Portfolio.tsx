import { useEffect } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Navbar } from '@/components/portfolio/Navbar';
import { Hero } from '@/components/portfolio/Hero';
import { About } from '@/components/portfolio/About';
import { Skills } from '@/components/portfolio/Skills';
import { Timeline } from '@/components/portfolio/Timeline';
import { Projects } from '@/components/portfolio/Projects';
import { Certificates } from '@/components/portfolio/Certificates';
import { Contact } from '@/components/portfolio/Contact';
import { Footer } from '@/components/portfolio/Footer';
import { FullPageLoader } from '@/components/ui/Loader';

export function Portfolio() {
  const { data, loading, error } = usePortfolio();

  // Update document head with SEO settings
  useEffect(() => {
    if (data?.seoSettings) {
      document.title = data.seoSettings.meta_title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', data.seoSettings.meta_description);
      else {
        const m = document.createElement('meta');
        m.name = 'description';
        m.content = data.seoSettings.meta_description;
        document.head.appendChild(m);
      }
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) keywords.setAttribute('content', data.seoSettings.keywords);
      else {
        const m = document.createElement('meta');
        m.name = 'keywords';
        m.content = data.seoSettings.keywords;
        document.head.appendChild(m);
      }
      // OG tags
      const setOg = (prop: string, content: string) => {
        let el = document.querySelector(`meta[property="${prop}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
        el.setAttribute('content', content);
      };
      setOg('og:title', data.seoSettings.meta_title);
      setOg('og:description', data.seoSettings.meta_description);
      if (data.seoSettings.og_image_url) setOg('og:image', data.seoSettings.og_image_url);
      // Favicon
      if (data.seoSettings.favicon_url) {
        let fav = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
        if (!fav) { fav = document.createElement('link'); fav.rel = 'icon'; document.head.appendChild(fav); }
        fav.href = data.seoSettings.favicon_url;
      }
    }
  }, [data?.seoSettings]);

  if (loading) return <FullPageLoader label="Loading portfolio..." />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
        <div className="text-center max-w-md">
          <div className="mb-4 mx-auto w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <span className="text-2xl">!</span>
          </div>
          <h1 className="text-lg font-semibold text-white mb-2">Unable to load portfolio</h1>
          <p className="text-sm text-slate-400">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4">Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return <FullPageLoader label="Preparing portfolio..." />;

  const sectionMap = (key: string) => data.sectionSettings.find((s) => s.section_key === key);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 overflow-x-hidden">
      <Navbar
        navigation={data.navigation}
        profile={data.profile}
        logoText={data.siteSettings?.logo_text ?? 'AM'}
      />
      <Hero profile={data.profile} socialLinks={data.socialLinks} />
      <About profile={data.profile} section={sectionMap('about')} />
      <Skills skills={data.skills} section={sectionMap('skills')} />
      <Timeline items={data.education} section={sectionMap('education')} type="education" />
      <Timeline items={data.experience} section={sectionMap('experience')} type="experience" />
      <Projects projects={data.projects} section={sectionMap('projects')} />
      <Certificates certificates={data.certificates} section={sectionMap('certificates')} />
      <Contact contactSettings={data.contactSettings} socialLinks={data.socialLinks} />
      <Footer profile={data.profile} socialLinks={data.socialLinks} siteSettings={data.siteSettings} />
    </div>
  );
}
