/*
# Portfolio CMS Schema — Akash Mondal

Creates the complete database for a portfolio CMS with:
- Public portfolio content tables (profile, skills, education, experience, projects, certificates, social links, contact, navigation, sections, site settings, SEO)
- Messages table (public can submit, only admin can read/manage)
- Admin activity logs (admin only)

Security model:
- Portfolio content tables: public SELECT (anon + authenticated), admin-only INSERT/UPDATE/DELETE (authenticated).
  The public portfolio must render without a sign-in, so anon MUST be able to read.
- messages: public INSERT (contact form), admin-only SELECT/UPDATE/DELETE.
- admin_activity_logs: admin-only everything.

Realtime is enabled via publication for all portfolio content tables + messages so the public portfolio
and admin inbox update live.
*/

-- ============================================================
-- site_settings (single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Akash Mondal',
  logo_text text NOT NULL DEFAULT 'AM',
  favicon_url text,
  primary_color text NOT NULL DEFAULT '#6366f1',
  secondary_color text NOT NULL DEFAULT '#ec4899',
  accent_color text NOT NULL DEFAULT '#22d3ee',
  dark_mode boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_site_settings" ON site_settings;
CREATE POLICY "admin_insert_site_settings" ON site_settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings" ON site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_site_settings" ON site_settings;
CREATE POLICY "admin_delete_site_settings" ON site_settings FOR DELETE TO authenticated USING (true);

-- ============================================================
-- profile (single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Akash Mondal',
  professional_title text NOT NULL DEFAULT 'BBA (Finance & Banking)',
  location text NOT NULL DEFAULT 'Kolkata, India',
  email text NOT NULL DEFAULT 'akashmondal1599@gmail.com',
  phone text NOT NULL DEFAULT '+91 9083347628',
  languages text NOT NULL DEFAULT 'English, Hindi, Bengali',
  degree text NOT NULL DEFAULT 'BBA (Finance & Banking)',
  resume_url text,
  profile_photo_url text,
  hero_description text NOT NULL DEFAULT 'BBA Finance & Banking student passionate about financial analysis, banking operations, and building a career in the finance industry.',
  about_paragraph_1 text NOT NULL DEFAULT 'I am a BBA Finance & Banking student at Brainware University with a strong foundation in financial analysis, accounting, and banking operations. I am passionate about understanding how financial markets work and applying that knowledge to real-world business challenges.',
  about_paragraph_2 text NOT NULL DEFAULT 'Through my academic journey and practical experience, I have developed skills in financial modeling, data analysis, and customer relationship management. I am eager to contribute my knowledge and continue learning in a dynamic professional environment.',
  projects_stat integer NOT NULL DEFAULT 12,
  certificates_stat integer NOT NULL DEFAULT 8,
  internships_stat integer NOT NULL DEFAULT 3,
  hero_roles text NOT NULL DEFAULT 'Finance & Banking Student|Financial Analyst Enthusiast|Aspiring Banking Professional',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_profile" ON profile;
CREATE POLICY "public_read_profile" ON profile FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_profile" ON profile;
CREATE POLICY "admin_insert_profile" ON profile FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_insert_profile" ON profile;
CREATE POLICY "admin_insert_profile" ON profile FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_profile" ON profile;
CREATE POLICY "admin_update_profile" ON profile FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_profile" ON profile;
CREATE POLICY "admin_delete_profile" ON profile FOR DELETE TO authenticated USING (true);

-- ============================================================
-- social_links (single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  linkedin_url text,
  instagram_url text,
  twitter_url text,
  github_url text,
  whatsapp_number text NOT NULL DEFAULT '919083347628',
  email text NOT NULL DEFAULT 'akashmondal1599@gmail.com',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_social_links" ON social_links;
CREATE POLICY "public_read_social_links" ON social_links FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_social_links" ON social_links;
CREATE POLICY "admin_insert_social_links" ON social_links FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_social_links" ON social_links;
CREATE POLICY "admin_update_social_links" ON social_links FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_social_links" ON social_links;
CREATE POLICY "admin_delete_social_links" ON social_links FOR DELETE TO authenticated USING (true);

-- ============================================================
-- skills
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL DEFAULT 'Technical',
  name text NOT NULL,
  icon text DEFAULT 'Code',
  level integer NOT NULL DEFAULT 80 CHECK (level >= 0 AND level <= 100),
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS skills_sort_idx ON skills(sort_order);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_skills" ON skills;
CREATE POLICY "public_read_skills" ON skills FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_skills" ON skills;
CREATE POLICY "admin_insert_skills" ON skills FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_skills" ON skills;
CREATE POLICY "admin_update_skills" ON skills FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_skills" ON skills;
CREATE POLICY "admin_delete_skills" ON skills FOR DELETE TO authenticated USING (true);

-- ============================================================
-- education
-- ============================================================
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL DEFAULT '2023 — 2026',
  title text NOT NULL,
  organization text NOT NULL,
  tags text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS education_sort_idx ON education(sort_order);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_education" ON education;
CREATE POLICY "public_read_education" ON education FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_education" ON education;
CREATE POLICY "admin_insert_education" ON education FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_education" ON education;
CREATE POLICY "admin_update_education" ON education FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_education" ON education;
CREATE POLICY "admin_delete_education" ON education FOR DELETE TO authenticated USING (true);

-- ============================================================
-- experience
-- ============================================================
CREATE TABLE IF NOT EXISTS experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL DEFAULT 'Summer 2026',
  title text NOT NULL,
  organization text NOT NULL,
  tags text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS experience_sort_idx ON experience(sort_order);

ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_experience" ON experience;
CREATE POLICY "public_read_experience" ON experience FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_experience" ON experience;
CREATE POLICY "admin_insert_experience" ON experience FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_experience" ON experience;
CREATE POLICY "admin_update_experience" ON experience FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_experience" ON experience;
CREATE POLICY "admin_delete_experience" ON experience FOR DELETE TO authenticated USING (true);

-- ============================================================
-- projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  technologies text,
  project_url text,
  github_url text,
  image_url text,
  category text DEFAULT 'Finance',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projects_sort_idx ON projects(sort_order);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_projects" ON projects;
CREATE POLICY "admin_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_projects" ON projects;
CREATE POLICY "admin_update_projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_projects" ON projects;
CREATE POLICY "admin_delete_projects" ON projects FOR DELETE TO authenticated USING (true);

-- ============================================================
-- certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuer text NOT NULL,
  year text NOT NULL,
  icon text DEFAULT 'Award',
  gradient text DEFAULT 'from-indigo-500 to-purple-500',
  certificate_url text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS certificates_sort_idx ON certificates(sort_order);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_certificates" ON certificates;
CREATE POLICY "public_read_certificates" ON certificates FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_certificates" ON certificates;
CREATE POLICY "admin_insert_certificates" ON certificates FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_certificates" ON certificates;
CREATE POLICY "admin_update_certificates" ON certificates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_certificates" ON certificates;
CREATE POLICY "admin_delete_certificates" ON certificates FOR DELETE TO authenticated USING (true);

-- ============================================================
-- contact_settings (single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heading text NOT NULL DEFAULT 'Let''s Work Together!',
  description text NOT NULL DEFAULT 'I''m always open to discussing finance opportunities, internships, collaborations, or just a friendly chat about the industry. Feel free to reach out!',
  email text NOT NULL DEFAULT 'akashmondal1599@gmail.com',
  phone text NOT NULL DEFAULT '+91 9083347628',
  whatsapp_number text NOT NULL DEFAULT '919083347628',
  linkedin_url text,
  location text NOT NULL DEFAULT 'Kolkata, India',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_contact_settings" ON contact_settings;
CREATE POLICY "public_read_contact_settings" ON contact_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_contact_settings" ON contact_settings;
CREATE POLICY "admin_insert_contact_settings" ON contact_settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_contact_settings" ON contact_settings;
CREATE POLICY "admin_update_contact_settings" ON contact_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_contact_settings" ON contact_settings;
CREATE POLICY "admin_delete_contact_settings" ON contact_settings FOR DELETE TO authenticated USING (true);

-- ============================================================
-- messages (public insert, admin manage)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','replied','archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_created_idx ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_status_idx ON messages(status);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_messages" ON messages;
CREATE POLICY "public_insert_messages" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_read_messages" ON messages;
CREATE POLICY "admin_read_messages" ON messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_update_messages" ON messages;
CREATE POLICY "admin_update_messages" ON messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_messages" ON messages;
CREATE POLICY "admin_delete_messages" ON messages FOR DELETE TO authenticated USING (true);

-- ============================================================
-- navigation
-- ============================================================
CREATE TABLE IF NOT EXISTS navigation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  section_id text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS navigation_sort_idx ON navigation(sort_order);

ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_navigation" ON navigation;
CREATE POLICY "public_read_navigation" ON navigation FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_navigation" ON navigation;
CREATE POLICY "admin_insert_navigation" ON navigation FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_navigation" ON navigation;
CREATE POLICY "admin_update_navigation" ON navigation FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_navigation" ON navigation;
CREATE POLICY "admin_delete_navigation" ON navigation FOR DELETE TO authenticated USING (true);

-- ============================================================
-- section_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS section_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS section_settings_sort_idx ON section_settings(sort_order);

ALTER TABLE section_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_section_settings" ON section_settings;
CREATE POLICY "public_read_section_settings" ON section_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_section_settings" ON section_settings;
CREATE POLICY "admin_insert_section_settings" ON section_settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_section_settings" ON section_settings;
CREATE POLICY "admin_update_section_settings" ON section_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_section_settings" ON section_settings;
CREATE POLICY "admin_delete_section_settings" ON section_settings FOR DELETE TO authenticated USING (true);

-- ============================================================
-- seo_settings (single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_title text NOT NULL DEFAULT 'Akash Mondal — BBA Finance & Banking | Portfolio',
  meta_description text NOT NULL DEFAULT 'Portfolio of Akash Mondal, BBA Finance & Banking student. Skills in financial analysis, accounting, and banking operations.',
  keywords text NOT NULL DEFAULT 'Akash Mondal, Finance, Banking, BBA, Portfolio, Financial Analysis, Kolkata',
  og_image_url text,
  favicon_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_seo_settings" ON seo_settings;
CREATE POLICY "public_read_seo_settings" ON seo_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_seo_settings" ON seo_settings;
CREATE POLICY "admin_insert_seo_settings" ON seo_settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_seo_settings" ON seo_settings;
CREATE POLICY "admin_update_seo_settings" ON seo_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_seo_settings" ON seo_settings;
CREATE POLICY "admin_delete_seo_settings" ON seo_settings FOR DELETE TO authenticated USING (true);

-- ============================================================
-- admin_activity_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_logs_created_idx ON admin_activity_logs(created_at DESC);

ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_logs" ON admin_activity_logs;
CREATE POLICY "admin_read_logs" ON admin_activity_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_logs" ON admin_activity_logs;
CREATE POLICY "admin_insert_logs" ON admin_activity_logs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_logs" ON admin_activity_logs;
CREATE POLICY "admin_delete_logs" ON admin_activity_logs FOR DELETE TO authenticated USING (true);

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['site_settings','profile','social_links','contact_settings','navigation','section_settings','seo_settings']) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
  FOR t IN SELECT unnest(ARRAY['skills','education','experience','projects','certificates']) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END $$;

-- ============================================================
-- Realtime: add all tables to the supabase_realtime publication
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'site_settings','profile','social_links','skills','education','experience',
    'projects','certificates','contact_settings','messages','navigation',
    'section_settings','seo_settings','admin_activity_logs'
  ]) LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;
