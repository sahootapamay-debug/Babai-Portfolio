import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Loader2 className={`animate-spin text-indigo-400 ${className}`} style={{ width: size, height: size }} />;
}

export function FullPageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0f]">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-indigo-500 border-r-pink-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-400 tracking-wide">{label}</p>
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-white/5 bg-white/[0.02] ${className}`}>
      <div className="h-full w-full" />
    </div>
  );
}

export function InlineLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
      <LoadingSpinner size={16} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
