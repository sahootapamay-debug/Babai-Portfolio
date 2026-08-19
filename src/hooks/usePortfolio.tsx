import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchPortfolioData } from '@/services/data';
import type { PortfolioData } from '@/types';

interface PortfolioContextValue {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  realtimeStatus: 'connected' | 'reconnecting' | 'disconnected';
  refresh: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

const EMPTY: PortfolioData = {
  profile: null, socialLinks: null, siteSettings: null, skills: [], education: [],
  experience: [], projects: [], certificates: [], contactSettings: null,
  navigation: [], sectionSettings: [], seoSettings: null,
};

const ARRAY_TABLES = ['skills', 'education', 'experience', 'projects', 'certificates', 'navigation', 'section_settings'] as const;

const arrayKeyMap: Record<string, keyof PortfolioData> = {
  skills: 'skills', education: 'education', experience: 'experience',
  projects: 'projects', certificates: 'certificates', navigation: 'navigation',
  section_settings: 'sectionSettings',
};

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  const refresh = useCallback(async () => {
    try {
      const fresh = await fetchPortfolioData();
      setData(fresh);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load portfolio data');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const initial = await fetchPortfolioData();
        if (mounted) {
          setData(initial);
          setError(null);
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load portfolio data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Realtime: one channel for all portfolio changes
    const channel = supabase
      .channel('portfolio-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setData((d) => ({ ...(d ?? EMPTY), profile: null }));
        } else {
          setData((d) => ({ ...(d ?? EMPTY), profile: payload.new as PortfolioData['profile'] }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_links' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setData((d) => ({ ...(d ?? EMPTY), socialLinks: null }));
        } else {
          setData((d) => ({ ...(d ?? EMPTY), socialLinks: payload.new as PortfolioData['socialLinks'] }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setData((d) => ({ ...(d ?? EMPTY), siteSettings: null }));
        } else {
          setData((d) => ({ ...(d ?? EMPTY), siteSettings: payload.new as PortfolioData['siteSettings'] }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_settings' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setData((d) => ({ ...(d ?? EMPTY), contactSettings: null }));
        } else {
          setData((d) => ({ ...(d ?? EMPTY), contactSettings: payload.new as PortfolioData['contactSettings'] }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seo_settings' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setData((d) => ({ ...(d ?? EMPTY), seoSettings: null }));
        } else {
          setData((d) => ({ ...(d ?? EMPTY), seoSettings: payload.new as PortfolioData['seoSettings'] }));
        }
      });

    // Array tables — refetch on any change to keep ordering correct
    for (const table of ARRAY_TABLES) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, async () => {
        const key = arrayKeyMap[table];
        const { data: rows, error: err } = await supabase.from(table).select('*').order('sort_order');
        if (!err && rows) {
          setData((d) => ({ ...(d ?? EMPTY), [key]: rows }));
        }
      });
    }

    channel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        setRealtimeStatus('reconnecting');
      }
    });

    channelsRef.current.push(channel);

    return () => {
      mounted = false;
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, []);

  // Reconnect: if realtime drops, poll until restored
  useEffect(() => {
    if (realtimeStatus !== 'reconnecting') return;
    const interval = setInterval(async () => {
      try {
        await refresh();
      } catch {
        // keep trying
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [realtimeStatus, refresh]);

  return (
    <PortfolioContext.Provider value={{ data, loading, error, realtimeStatus, refresh }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}

