/*
# Seed initial portfolio data + storage buckets

1. Inserts single-row records (profile, social_links, site_settings, contact_settings, seo_settings)
   only if they do not already exist.
2. Inserts default navigation items.
3. Inserts default section_settings.
4. Inserts sample skills, education, experience, projects, certificates for Akash Mondal.
5. Creates storage buckets: profile, certificates, projects, site-assets (public read, admin write).
*/

-- Single-row settings (insert if missing)
INSERT INTO site_settings (site_name, logo_text, primary_color, secondary_color, accent_color, dark_mode)
SELECT 'Akash Mondal', 'AM', '#6366f1', '#ec4899', '#22d3ee', true
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

INSERT INTO social_links (linkedin_url, whatsapp_number, email)
SELECT 'https://www.linkedin.com/in/akash-mondal', '919083347628', 'akashmondal1599@gmail.com'
WHERE NOT EXISTS (SELECT 1 FROM social_links);

INSERT INTO contact_settings (heading, description, email, phone, whatsapp_number, linkedin_url, location)
SELECT 'Let''s Work Together!',
       'I''m always open to discussing finance opportunities, internships, collaborations, or just a friendly chat about the industry. Feel free to reach out!',
       'akashmondal1599@gmail.com',
       '+91 9083347628',
       '919083347628',
       'https://www.linkedin.com/in/akash-mondal',
       'Kolkata, India'
WHERE NOT EXISTS (SELECT 1 FROM contact_settings);

INSERT INTO seo_settings (meta_title, meta_description, keywords)
SELECT 'Akash Mondal — BBA Finance & Banking | Portfolio',
       'Portfolio of Akash Mondal, BBA Finance & Banking student. Skills in financial analysis, accounting, and banking operations.',
       'Akash Mondal, Finance, Banking, BBA, Portfolio, Financial Analysis, Kolkata'
WHERE NOT EXISTS (SELECT 1 FROM seo_settings);

-- profile single row
INSERT INTO profile (name, professional_title, location, email, phone, languages, degree, hero_description, about_paragraph_1, about_paragraph_2, projects_stat, certificates_stat, internships_stat, hero_roles)
SELECT 'Akash Mondal',
       'BBA (Finance & Banking)',
       'Kolkata, India',
       'akashmondal1599@gmail.com',
       '+91 9083347628',
       'English, Hindi, Bengali',
       'BBA (Finance & Banking)',
       'BBA Finance & Banking student passionate about financial analysis, banking operations, and building a career in the finance industry.',
       'I am a BBA Finance & Banking student at Brainware University with a strong foundation in financial analysis, accounting, and banking operations. I am passionate about understanding how financial markets work and applying that knowledge to real-world business challenges.',
       'Through my academic journey and practical experience, I have developed skills in financial modeling, data analysis, and customer relationship management. I am eager to contribute my knowledge and continue learning in a dynamic professional environment.',
       12, 8, 3,
       'Finance & Banking Student|Financial Analyst Enthusiast|Aspiring Banking Professional'
WHERE NOT EXISTS (SELECT 1 FROM profile);

-- Navigation defaults
INSERT INTO navigation (label, section_id, sort_order, visible)
SELECT * FROM (VALUES
  ('Home', 'home', 0, true),
  ('About', 'about', 1, true),
  ('Skills', 'skills', 2, true),
  ('Education', 'education', 3, true),
  ('Experience', 'experience', 4, true),
  ('Projects', 'projects', 5, true),
  ('Certifications', 'certificates', 6, true),
  ('Contact', 'contact', 7, true)
) AS v(label, section_id, sort_order, visible)
WHERE NOT EXISTS (SELECT 1 FROM navigation);

-- Section settings defaults
INSERT INTO section_settings (section_key, title, subtitle, visible, sort_order)
SELECT * FROM (VALUES
  ('about', 'About Me', 'Get to know me', true, 0),
  ('skills', 'Skills & Expertise', 'What I bring to the table', true, 1),
  ('education', 'Education', 'My academic journey', true, 2),
  ('experience', 'Experience', 'Where I have worked', true, 3),
  ('projects', 'Projects', 'Things I have built', true, 4),
  ('certificates', 'Certifications', 'My achievements', true, 5),
  ('contact', 'Get In Touch', 'Let''s connect', true, 6)
) AS v(section_key, title, subtitle, visible, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM section_settings);

-- Sample skills
INSERT INTO skills (group_name, name, icon, level, sort_order, visible)
SELECT * FROM (VALUES
  ('Finance', 'Financial Analysis', 'TrendingUp', 85, 0, true),
  ('Finance', 'Accounting', 'Calculator', 80, 1, true),
  ('Finance', 'Financial Modeling', 'BarChart3', 75, 2, true),
  ('Finance', 'Banking Operations', 'Landmark', 82, 3, true),
  ('Technical', 'MS Excel', 'FileSpreadsheet', 90, 4, true),
  ('Technical', 'SQL', 'Database', 70, 5, true),
  ('Technical', 'Python', 'Code', 65, 6, true),
  ('Technical', 'Power BI', 'BarChart3', 68, 7, true),
  ('Soft Skills', 'Communication', 'MessageSquare', 88, 8, true),
  ('Soft Skills', 'Customer Service', 'Users', 85, 9, true),
  ('Soft Skills', 'Teamwork', 'Users', 90, 10, true),
  ('Soft Skills', 'Problem Solving', 'Lightbulb', 80, 11, true)
) AS v(group_name, name, icon, level, sort_order, visible)
WHERE NOT EXISTS (SELECT 1 FROM skills);

-- Education
INSERT INTO education (year, title, organization, tags, description, sort_order, visible)
SELECT * FROM (VALUES
  ('2023 — 2026', 'BBA in Finance & Banking', 'Brainware University', 'Finance, Banking, Degree', 'Pursuing a Bachelor of Business Administration with specialization in Finance and Banking. Coursework covers financial management, accounting, banking operations, and investment analysis.', 0, true),
  ('2021 — 2023', 'Higher Secondary (Commerce)', 'West Bengal Council', 'Commerce, Economics, Accountancy', 'Completed higher secondary education with a focus on commerce, economics, and accountancy, building the foundation for a finance career.', 1, true),
  ('2021', 'Secondary Education', 'West Bengal Board', 'Foundation, 10th', 'Completed secondary education with distinction, developing strong analytical and communication skills.', 2, true)
) AS v(year, title, organization, tags, description, sort_order, visible)
WHERE NOT EXISTS (SELECT 1 FROM education);

-- Experience
INSERT INTO experience (year, title, organization, tags, description, sort_order, visible)
SELECT * FROM (VALUES
  ('Summer 2026', 'Finance & Banking Intern', 'IPPB — ON SITE', 'Customer Satisfaction, Banking', 'Hands-on experience with India Post Payments Bank handling customer interactions, banking operations, and satisfaction initiatives. Developed practical knowledge of day-to-day banking processes.', 0, true),
  ('2025', 'Finance Project Trainee', 'Brainware University', 'Research, Analysis', 'Worked on a finance research project analyzing market trends and preparing a comprehensive report on investment strategies.', 1, true)
) AS v(year, title, organization, tags, description, sort_order, visible)
WHERE NOT EXISTS (SELECT 1 FROM experience);

-- Projects
INSERT INTO projects (title, description, technologies, project_url, github_url, image_url, category, featured, sort_order, visible)
SELECT * FROM (VALUES
  ('Financial Portfolio Analyzer', 'A tool to analyze and visualize investment portfolios with risk metrics and performance tracking.', 'Excel, Power BI, SQL', NULL, NULL, NULL, 'Finance', true, 0, true),
  ('Banking Operations Dashboard', 'Interactive dashboard monitoring key banking KPIs including customer satisfaction and transaction volumes.', 'Power BI, Excel', NULL, NULL, NULL, 'Banking', true, 1, true),
  ('Market Trend Research Report', 'Comprehensive research report on current market trends and investment opportunities in the Indian finance sector.', 'Research, Analysis, Word', NULL, NULL, NULL, 'Research', false, 2, true),
  ('Personal Finance Tracker', 'A budgeting application concept helping individuals track income, expenses, and savings goals.', 'Excel, Python', NULL, NULL, NULL, 'Finance', false, 3, true)
) AS v(title, description, technologies, project_url, github_url, image_url, category, featured, sort_order, visible)
WHERE NOT EXISTS (SELECT 1 FROM projects);

-- Certificates
INSERT INTO certificates (name, issuer, year, icon, gradient, certificate_url, image_url, sort_order, visible)
SELECT * FROM (VALUES
  ('Financial Markets Certification', 'NSE Academy', '2025', 'TrendingUp', 'from-indigo-500 to-purple-500', NULL, NULL, 0, true),
  ('Banking Operations Fundamentals', 'Indian Institute of Banking', '2025', 'Landmark', 'from-pink-500 to-rose-500', NULL, NULL, 1, true),
  ('Excel for Finance Professionals', 'Coursera', '2024', 'FileSpreadsheet', 'from-cyan-500 to-blue-500', NULL, NULL, 2, true),
  ('Data Analysis with Power BI', 'Microsoft', '2024', 'BarChart3', 'from-emerald-500 to-teal-500', NULL, NULL, 3, true),
  ('Customer Service Excellence', 'IPPB', '2025', 'Users', 'from-amber-500 to-orange-500', NULL, NULL, 4, true)
) AS v(name, issuer, year, icon, gradient, certificate_url, image_url, sort_order, visible)
WHERE NOT EXISTS (SELECT 1 FROM certificates);

-- ============================================================
-- Storage buckets (public read, admin write via policies)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
SELECT 'profile', 'profile', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile');

INSERT INTO storage.buckets (id, name, public)
SELECT 'certificates', 'certificates', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'certificates');

INSERT INTO storage.buckets (id, name, public)
SELECT 'projects', 'projects', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'projects');

INSERT INTO storage.buckets (id, name, public)
SELECT 'site-assets', 'site-assets', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'site-assets');

-- Public read policies for storage
DROP POLICY IF EXISTS "public_read_profile_bucket" ON storage.objects;
CREATE POLICY "public_read_profile_bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'profile');

DROP POLICY IF EXISTS "public_read_certificates_bucket" ON storage.objects;
CREATE POLICY "public_read_certificates_bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "public_read_projects_bucket" ON storage.objects;
CREATE POLICY "public_read_projects_bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'projects');

DROP POLICY IF EXISTS "public_read_site_assets_bucket" ON storage.objects;
CREATE POLICY "public_read_site_assets_bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'site-assets');

-- Admin write policies for storage (authenticated can CRUD in all four buckets)
DROP POLICY IF EXISTS "admin_write_profile_bucket" ON storage.objects;
CREATE POLICY "admin_write_profile_bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile');
DROP POLICY IF EXISTS "admin_update_profile_bucket" ON storage.objects;
CREATE POLICY "admin_update_profile_bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile') WITH CHECK (bucket_id = 'profile');
DROP POLICY IF EXISTS "admin_delete_profile_bucket" ON storage.objects;
CREATE POLICY "admin_delete_profile_bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile');

DROP POLICY IF EXISTS "admin_write_certificates_bucket" ON storage.objects;
CREATE POLICY "admin_write_certificates_bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates');
DROP POLICY IF EXISTS "admin_update_certificates_bucket" ON storage.objects;
CREATE POLICY "admin_update_certificates_bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'certificates') WITH CHECK (bucket_id = 'certificates');
DROP POLICY IF EXISTS "admin_delete_certificates_bucket" ON storage.objects;
CREATE POLICY "admin_delete_certificates_bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "admin_write_projects_bucket" ON storage.objects;
CREATE POLICY "admin_write_projects_bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'projects');
DROP POLICY IF EXISTS "admin_update_projects_bucket" ON storage.objects;
CREATE POLICY "admin_update_projects_bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'projects') WITH CHECK (bucket_id = 'projects');
DROP POLICY IF EXISTS "admin_delete_projects_bucket" ON storage.objects;
CREATE POLICY "admin_delete_projects_bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'projects');

DROP POLICY IF EXISTS "admin_write_site_assets_bucket" ON storage.objects;
CREATE POLICY "admin_write_site_assets_bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets');
DROP POLICY IF EXISTS "admin_update_site_assets_bucket" ON storage.objects;
CREATE POLICY "admin_update_site_assets_bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-assets') WITH CHECK (bucket_id = 'site-assets');
DROP POLICY IF EXISTS "admin_delete_site_assets_bucket" ON storage.objects;
CREATE POLICY "admin_delete_site_assets_bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-assets');
