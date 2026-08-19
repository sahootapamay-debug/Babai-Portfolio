import { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export function AdminLogin() {
  const { signIn, signUp, resetPassword } = useAuth();
  const { success } = useToast();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(null);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setFormError(error);
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          setFormError(error);
        } else {
          success('Account created. You are now signed in.');
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          setFormError(error);
        } else {
          success('Password reset email sent. Check your inbox.');
          setMode('login');
        }
      }
    } catch {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-pink-500/15 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo / Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex w-16 h-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Portfolio Admin</h1>
            <p className="mt-2 text-sm text-slate-400">Akash Mondal — Content Management System</p>
          </div>

          {/* Card */}
          <div className="glass-strong rounded-2xl p-8 shadow-2xl">
            <div className="mb-6 flex gap-1 rounded-xl bg-white/5 p-1">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === 'login' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === 'signup' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Create Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="input-field pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="label-field">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-10 pr-10"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {formError && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {formError}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Please wait...
                  </span>
                ) : (
                  <>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Admin Account'}
                    {mode === 'reset' && 'Send Reset Email'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              {mode === 'login' && (
                <button onClick={() => setMode('reset')} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                  Forgot your password?
                </button>
              )}
              {mode === 'reset' && (
                <button onClick={() => setMode('login')} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                  Back to sign in
                </button>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            Protected area. Authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}

