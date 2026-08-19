import { useEffect, useState } from 'react';
import { Linkedin, Instagram, Twitter, Github, MessageCircle, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/services/data';
import { useToast } from '@/components/ui/Toast';
import { PageHeader, Card, SaveButton } from '@/components/admin/AdminUI';
import type { SocialLinks } from '@/types';

export function AdminSocial() {
  const { success, error } = useToast();
  const [data, setData] = useState<SocialLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('social_links').select('*').maybeSingle().then(({ data }) => {
      setData(data as SocialLinks | null);
      setLoading(false);
    });
  }, []);

  const update = (field: keyof SocialLinks, value: string) => {
    setData((d) => d ? { ...d, [field]: value } : d);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const { error: err } = await supabase.from('social_links').update({
        linkedin_url: data.linkedin_url,
        instagram_url: data.instagram_url,
        twitter_url: data.twitter_url,
        github_url: data.github_url,
        whatsapp_number: data.whatsapp_number,
        email: data.email,
      }).eq('id', data.id);
      if (err) throw err;
      await logActivity('Updated social links', 'social_links', data.id);
      success('Social links saved and published live');
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to save social links');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-slate-400 text-sm">Loading...</div>;
  if (!data) return <div className="py-8 text-rose-400 text-sm">No social links found.</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Social Links"
        description="Your social media and contact links shown across the portfolio."
        action={<SaveButton onSave={handleSave} saving={saving} label="Save & Publish" />}
      />

      <Card>
        <div className="space-y-4">
          <Field icon={Linkedin} label="LinkedIn URL" value={data.linkedin_url ?? ''} onChange={(v) => update('linkedin_url', v)} placeholder="https://linkedin.com/in/..." />
          <Field icon={Instagram} label="Instagram URL" value={data.instagram_url ?? ''} onChange={(v) => update('instagram_url', v)} placeholder="https://instagram.com/..." />
          <Field icon={Twitter} label="Twitter / X URL" value={data.twitter_url ?? ''} onChange={(v) => update('twitter_url', v)} placeholder="https://twitter.com/..." />
          <Field icon={Github} label="GitHub URL" value={data.github_url ?? ''} onChange={(v) => update('github_url', v)} placeholder="https://github.com/..." />
          <div>
            <label className="label-field">WhatsApp Number (digits only, with country code)</label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input className="input-field pl-10" value={data.whatsapp_number} onChange={(e) => update('whatsapp_number', e.target.value)} placeholder="919083347628" />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Links to https://wa.me/{data.whatsapp_number || '<number>'}</p>
          </div>
          <Field icon={Mail} label="Public Email" value={data.email} onChange={(v) => update('email', v)} placeholder="you@example.com" />
        </div>
      </Card>

      <div className="flex justify-end">
        <SaveButton onSave={handleSave} saving={saving} label="Save & Publish" />
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder }: {
  icon: typeof Mail; label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="label-field">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input className="input-field pl-10" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      </div>
    </div>
  );
}
