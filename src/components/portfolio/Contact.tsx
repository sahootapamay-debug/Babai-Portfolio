import { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, Mail, MessageCircle, Linkedin, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import type { ContactSettings, SocialLinks } from '@/types';

interface ContactProps {
  contactSettings: ContactSettings | null;
  socialLinks: SocialLinks | null;
}

type FormState = 'idle' | 'sending' | 'sent' | 'failed';

const WHATSAPP_DEFAULT_MSG = 'Hello Akash, I found your portfolio and would like to discuss...';

export function Contact({ contactSettings, socialLinks }: ContactProps) {
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState>('idle');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.length > 5000) e.message = 'Message is too long (max 5000 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setFormState('sending');
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Success — only show success if backend confirmed
      if (data?.success) {
        setFormState('sent');
        setForm({ name: '', email: '', subject: '', message: '' });
        toast('Message sent successfully!', 'success');
        if (data.emailSent === false && data.warning) {
          toast('Note: Email notification may be delayed, but your message was received.', 'info');
        }
        setTimeout(() => setFormState('idle'), 5000);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      setFormState('failed');
      const msg = err instanceof Error ? err.message : 'Unable to send your message. Please try WhatsApp or email directly.';
      toast(msg, 'error');
      setTimeout(() => setFormState('idle'), 5000);
    }
  };

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const heading = contactSettings?.heading ?? "Let's Work Together!";
  const description = contactSettings?.description ?? '';
  const email = contactSettings?.email ?? socialLinks?.email ?? '';
  const phone = contactSettings?.phone ?? '';
  const location = contactSettings?.location ?? '';
  const whatsapp = contactSettings?.whatsapp_number ?? socialLinks?.whatsapp_number ?? '';
  const linkedin = contactSettings?.linkedin_url ?? socialLinks?.linkedin_url ?? '';

  const whatsappLink = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MSG)}`
    : '';

  return (
    <section id="contact" className="section-pad relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-pink-500/10 blur-[120px]" />
      <div className="container-max relative z-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: Info */}
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl text-balance">{heading}</h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" />
            <p className="mt-5 text-slate-400 leading-relaxed max-w-md">{description}</p>

            {/* Contact details */}
            <div className="mt-8 space-y-4">
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-3 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                    <p className="text-sm text-slate-200">{email}</p>
                  </div>
                </a>
              )}
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 group-hover:bg-white/10 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Phone</p>
                    <p className="text-sm text-slate-200">{phone}</p>
                  </div>
                </a>
              )}
              {location && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Location</p>
                    <p className="text-sm text-slate-200">{location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Direct contact buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  <Linkedin className="w-4 h-4" /> View LinkedIn Profile
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="btn-secondary">
                  <Mail className="w-4 h-4" /> Email Me
                </a>
              )}
            </div>
          </div>

          {/* Right: Form */}
          <div className="glass rounded-2xl p-6 card-glow">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="label-field" htmlFor="cf-name">Your Name</label>
                <input
                  id="cf-name"
                  className="input-field"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="John Doe"
                  disabled={formState === 'sending'}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
              </div>

              <div>
                <label className="label-field" htmlFor="cf-email">Your Email</label>
                <input
                  id="cf-email"
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="john@example.com"
                  disabled={formState === 'sending'}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
              </div>

              <div>
                <label className="label-field" htmlFor="cf-subject">Subject</label>
                <input
                  id="cf-subject"
                  className="input-field"
                  value={form.subject}
                  onChange={(e) => update('subject', e.target.value)}
                  placeholder="Let's connect"
                  disabled={formState === 'sending'}
                />
                {errors.subject && <p className="mt-1 text-xs text-rose-400">{errors.subject}</p>}
              </div>

              <div>
                <label className="label-field" htmlFor="cf-message">Message</label>
                <textarea
                  id="cf-message"
                  className="input-field min-h-[120px] resize-y"
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  placeholder="Tell me about your opportunity or just say hi..."
                  disabled={formState === 'sending'}
                  maxLength={5000}
                />
                {errors.message && <p className="mt-1 text-xs text-rose-400">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={formState === 'sending'}
                className={`btn-primary w-full ${
                  formState === 'sent' ? '!bg-emerald-500 !from-emerald-500 !to-emerald-500' : ''
                } ${
                  formState === 'failed' ? '!bg-rose-500 !from-rose-500 !to-rose-500' : ''
                }`}
              >
                {formState === 'sending' && (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                )}
                {formState === 'sent' && (
                  <><CheckCircle className="w-4 h-4" /> Message sent successfully!</>
                )}
                {formState === 'failed' && (
                  <><AlertCircle className="w-4 h-4" /> Failed to send. Try alternatives below.</>
                )}
                {formState === 'idle' && (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </button>

              {formState === 'failed' && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  <p className="font-medium mb-2">Unable to send your message. Please try WhatsApp or email directly:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {whatsappLink && (
                      <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-secondary !py-1.5 !px-3 text-xs">
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    )}
                    {email && (
                      <a href={`mailto:${email}`} className="btn-secondary !py-1.5 !px-3 text-xs">
                        <Mail className="w-3.5 h-3.5" /> Email Me
                      </a>
                    )}
                    {linkedin && (
                      <a href={linkedin} target="_blank" rel="noreferrer" className="btn-secondary !py-1.5 !px-3 text-xs">
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
