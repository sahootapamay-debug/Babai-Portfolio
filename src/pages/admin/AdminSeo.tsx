import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/services/data';
import { useToast } from '@/components/ui/Toast';
import { PageHeader, Card, SaveButton } from '@/components/admin/AdminUI';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import type { SeoSettings } from '@/types';

export function AdminSeo() {
  const { success, error } = useToast();
  const [data, setData] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('seo_settings').select('*').maybeSingle().then(({ data }) => {
      setData(data as SeoSettings | null);
      setLoading(false);
    });
  }, []);

  const update = (field: keyof SeoSettings, value: string) => {
    setData((d) => d ? { ...d, [field]: value } : d);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const { error: err } = await supabase.from('seo_settings').update({
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        keywords: data.keywords,
        og_image_url: data.og_image_url,
        favicon_url: data.favicon_url,
      }).eq('id', data.id);
      if (err) throw err;
      await logActivity('Updated SEO settings', 'seo_settings', data.id);
      success('SEO settings saved');
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to save SEO settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-slate-400 text-sm">Loading...</div>;
  if (!data) return <div className="py-8 text-rose-400 text-sm">No SEO settings found.</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="SEO Settings"
        description="Control how your portfolio appears in search engines and social media."
        action={<SaveButton onSave={handleSave} saving={saving} />}
      />

      <Card>
        <div className="space-y-4">
          <div>
            <label className="label-field">Meta Title</label>
            <input className="input-field" value={data.meta_title} onChange={(e) => update('meta_title', e.target.value)} />
            <p className="mt-1 text-xs text-slate-500">{data.meta_title.length} characters (recommended: 50-60)</p>
          </div>
          <div>
            <label className="label-field">Meta Description</label>
            <textarea className="input-field min-h-[80px] resize-y" value={data.meta_description} onChange={(e) => update('meta_description', e.target.value)} />
            <p className="mt-1 text-xs text-slate-500">{data.meta_description.length} characters (recommended: 150-160)</p>
          </div>
          <div>
            <label className="label-field">Keywords (comma-separated)</label>
            <input className="input-field" value={data.keywords} onChange={(e) => update('keywords', e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">Social Share Image & Favicon</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <ImageUploader
            bucket={STORAGE_BUCKETS.siteAssets as unknown as keyof typeof STORAGE_BUCKETS}
            currentUrl={data.og_image_url}
            onUpload={(url) => update('og_image_url', url)}
            onRemove={() => update('og_image_url', '')}
            label="Open Graph Image (1200x630)"
            aspectRatio="video"
          />
          <ImageUploader
            bucket={STORAGE_BUCKETS.siteAssets as unknown as keyof typeof STORAGE_BUCKETS}
            currentUrl={data.favicon_url}
            onUpload={(url) => update('favicon_url', url)}
            onRemove={() => update('favicon_url', '')}
            label="Favicon"
            aspectRatio="square"
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <SaveButton onSave={handleSave} saving={saving} />
      </div>
    </div>
  );
}
