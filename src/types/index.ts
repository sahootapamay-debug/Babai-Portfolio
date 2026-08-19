export interface Profile {
  id: string;
  name: string;
  professional_title: string;
  location: string;
  email: string;
  phone: string;
  languages: string;
  degree: string;
  resume_url: string | null;
  profile_photo_url: string | null;
  hero_description: string;
  about_paragraph_1: string;
  about_paragraph_2: string;
  projects_stat: number;
  certificates_stat: number;
  internships_stat: number;
  hero_roles: string;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  id: string;
  linkedin_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  whatsapp_number: string;
  email: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  logo_text: string;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  dark_mode: boolean;
  updated_at: string;
}

export interface Skill {
  id: string;
  group_name: string;
  name: string;
  icon: string;
  level: number;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  year: string;
  title: string;
  organization: string;
  tags: string | null;
  description: string | null;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  year: string;
  title: string;
  organization: string;
  tags: string | null;
  description: string | null;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  technologies: string | null;
  project_url: string | null;
  github_url: string | null;
  image_url: string | null;
  category: string | null;
  featured: boolean;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  year: string;
  icon: string;
  gradient: string;
  certificate_url: string | null;
  image_url: string | null;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactSettings {
  id: string;
  heading: string;
  description: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  linkedin_url: string | null;
  location: string;
  updated_at: string;
}

export type MessageStatus = 'new' | 'read' | 'replied' | 'archived';

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  created_at: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  section_id: string;
  sort_order: number;
  visible: boolean;
  updated_at: string;
}

export interface SectionSetting {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  visible: boolean;
  sort_order: number;
  updated_at: string;
}

export interface SeoSettings {
  id: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  og_image_url: string | null;
  favicon_url: string | null;
  updated_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_email: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  details: string | null;
  created_at: string;
}

export interface PortfolioData {
  profile: Profile | null;
  socialLinks: SocialLinks | null;
  siteSettings: SiteSettings | null;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certificates: Certificate[];
  contactSettings: ContactSettings | null;
  navigation: NavigationItem[];
  sectionSettings: SectionSetting[];
  seoSettings: SeoSettings | null;
}

export type TableName =
  | 'site_settings' | 'profile' | 'social_links' | 'skills' | 'education'
  | 'experience' | 'projects' | 'certificates' | 'contact_settings'
  | 'messages' | 'navigation' | 'section_settings' | 'seo_settings'
  | 'admin_activity_logs';
