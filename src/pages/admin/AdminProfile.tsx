import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/services/data';
import { useToast } from '@/components/ui/Toast';
import { PageHeader, Card, SaveButton } from '@/components/admin/AdminUI';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import type { Profile } from '@/types';

export function AdminProfile() {
  const { success, error } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('profile').select('*').maybeSingle().then(({ data }) => {
      setProfile(data as Profile | null);
      setLoading(false);
    });
  }, []);

  const update = (field: keyof Profile, value: string | number) => {
    setProfile((p) => p ? { ...p, [field]: value } : p);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error: err } = await supabase.from('profile').update({
        name: profile.name,
        professional_title: profile.professional_title,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        languages: profile.languages,
        degree: profile.degree,
        resume_url: profile.resume_url,
        profile_photo_url: profile.profile_photo_url,
        hero_description: profile.hero_description,
        about_paragraph_1: profile.about_paragraph_1,
        about_paragraph_2: profile.about_paragraph_2,
        projects_stat: profile.projects_stat,
        certificates_stat: profile.certificates_stat,
        internships_stat: profile.internships_stat,
        hero_roles: profile.hero_roles,
      }).eq('id', profile.id);

      if (err) throw err;
      await logActivity('Updated profile', 'profile', profile.id);
      success('Profile saved and published live');
    } catch (e) {
      error(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-slate-400 text-sm">Loading profile...</div>;
  if (!profile) return <div className="py-8 text-rose-400 text-sm">No profile found. Please seed the database.</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Profile & Bio"
        description="Your personal information, hero section, and about content."
        action={<SaveButton onSave={handleSave} saving={saving} label="Save & Publish" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile photo */}
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-white mb-4">Profile Photo</h3>
          <ImageUploader
            bucket={STORAGE_BUCKETS.profile as unknown as keyof typeof STORAGE_BUCKETS}
            currentUrl={profile.profile_photo_url}
            onUpload={(url) => update('profile_photo_url', url)}
            onRemove={() => update('profile_photo_url', '')}
            label="Photo"
            aspectRatio="square"
          />
        </Card>

        {/* Basic info */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Basic Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Full Name</label>
              <input className="input-field" value={profile.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Professional Title</label>
              <input className="input-field" value={profile.professional_title} onChange={(e) => update('professional_title', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Location</label>
              <input className="input-field" value={profile.location} onChange={(e) => update('location', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Email</label>
              <input className="input-field" type="email" value={profile.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Phone</label>
              <input className="input-field" value={profile.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Languages</label>
              <input className="input-field" value={profile.languages} onChange={(e) => update('languages', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Degree</label>
              <input className="input-field" value={profile.degree} onChange={(e) => update('degree', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Resume URL</label>
              <input className="input-field" value={profile.resume_url ?? ''} onChange={(e) => update('resume_url', e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </Card>
      </div>

      {/* Hero section */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">Hero Section</h3>
        <div className="space-y-4">
          <div>
            <label className="label-field">Hero Roles (pipe-separated, rotates on the site)</label>
            <input className="input-field" value={profile.hero_roles} onChange={(e) => update('hero_roles', e.target.value)} placeholder="Role One|Role Two|Role Three" />
          </div>
          <div>
            <label className="label-field">Hero Description</label>
            <textarea className="input-field min-h-[100px] resize-y" value={profile.hero_description} onChange={(e) => update('hero_description', e.target.value)} />
          </div>
        </div>
      </Card>

      {/* About section */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">About Section</h3>
        <div className="space-y-4">
          <div>
            <label className="label-field">About Paragraph 1</label>
            <textarea className="input-field min-h-[120px] resize-y" value={profile.about_paragraph_1} onChange={(e) => update('about_paragraph_1', e.target.value)} />
          </div>
          <div>
            <label className="label-field">About Paragraph 2</label>
            <textarea className="input-field min-h-[120px] resize-y" value={profile.about_paragraph_2} onChange={(e) => update('about_paragraph_2', e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">Statistics</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label-field">Projects Stat</label>
            <input className="input-field" type="number" value={profile.projects_stat} onChange={(e) => update('projects_stat', Number(e.target.value))} />
          </div>
          <div>
            <label className="label-field">Certificates Stat</label>
            <input className="input-field" type="number" value={profile.certificates_stat} onChange={(e) => update('certificates_stat', Number(e.target.value))} />
          </div>
          <div>
            <label className="label-field">Internships Stat</label>
            <input className="input-field" type="number" value={profile.internships_stat} onChange={(e) => update('internships_stat', Number(e.target.value))} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <SaveButton onSave={handleSave} saving={saving} label="Save & Publish" />
      </div>
    </div>
  );
}
