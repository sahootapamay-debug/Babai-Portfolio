import { useEffect, useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Linkedin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/services/data';
import { useToast } from '@/components/ui/Toast';
import { PageHeader, Card, SaveButton } from '@/components/admin/AdminUI';
import type { ContactSettings } from '@/types';

export function AdminContact() {
  const { success, error } = useToast();
  const [data, setData] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('contact_settings').select('*').maybeSingle().then(({ data }) => {
      setData(data as ContactSettings | null);
      setLoading(false);
    });
  }, []);

  const update = (field: keyof ContactSettings, value: string) => {
    setData((d) => d ? { ...d, [field]: value } : d);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const { error: err } = await supabase.from('contact_settings').update({
        heading: data.heading,
        description: data.description,
        email: data.email,
        phone: data.phone,
        whatsapp_number: data.whatsapp_number,
        linkedin_url: data.linkedin_url,
        location: data.location,
      }).eq('id', data.id);
      if (err) throw err;
      await logActivity('Updated contact settings', 'contact_settings', data.id);
      success('Contact settings saved and published live');
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to save contact settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-slate-400 text-sm">Loading...</div>;
  if (!data) return <div className="py-8 text-rose-400 text-sm">No contact settings found.</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Contact Settings"
        description="The heading, description, and details shown in the contact section."
        action={<SaveButton onSave={handleSave} saving={saving} label="Save & Publish" />}
      />

      <Card>
        <div className="space-y-4">
          <div>
            <label className="label-field">Heading</label>
            <input className="input-field" value={data.heading} onChange={(e) => update('heading', e.target.value)} />
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea className="input-field min-h-[100px] resize-y" value={data.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInline icon={Mail} label="Email" value={data.email} onChange={(v) => update('email', v)} />
            <FieldInline icon={Phone} label="Phone" value={data.phone} onChange={(v) => update('phone', v)} />
            <FieldInline icon={MessageCircle} label="WhatsApp Number" value={data.whatsapp_number} onChange={(v) => update('whatsapp_number', v)} />
            <FieldInline icon={MapPin} label="Location" value={data.location} onChange={(v) => update('location', v)} />
          </div>
          <FieldInline icon={Linkedin} label="LinkedIn URL" value={data.linkedin_url ?? ''} onChange={(v) => update('linkedin_url', v)} />
        </div>
      </Card>

      <div className="flex justify-end">
        <SaveButton onSave={handleSave} saving={saving} label="Save & Publish" />
      </div>
    </div>
  );
}

function FieldInline({ icon: Icon, label, value, onChange }: {
  icon: typeof Mail; label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label-field">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input className="input-field pl-10" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
