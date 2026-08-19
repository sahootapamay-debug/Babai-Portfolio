import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PortfolioProvider } from '@/hooks/usePortfolio';
import { ToastProvider } from '@/components/ui/Toast';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminApp } from '@/pages/admin/AdminApp';
import { ResetPassword } from '@/pages/ResetPassword';
import { Portfolio } from '@/pages/Portfolio';
import { FullPageLoader } from '@/components/ui/Loader';

function AppRoutes() {
  const { session, loading } = useAuth();
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handler = () => {
      setRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handler);

    return () => {
      window.removeEventListener('popstate', handler);
    };
  }, []);

  // Intercept link clicks for SPA navigation
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');

      if (!target) return;

      const href = target.getAttribute('href');

      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('https://wa.me')
      ) {
        return;
      }

      if (target.target === '_blank') return;

      if (href.startsWith('/')) {
        e.preventDefault();

        window.history.pushState({}, '', href);
        setRoute(href);
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, []);

  // PASSWORD RESET ROUTE
  if (route === '/reset-password') {
    return <ResetPassword />;
  }

  // ADMIN ROUTE
  if (route.startsWith('/admin')) {
    if (loading) {
      return <FullPageLoader label="Checking session..." />;
    }

    if (!session) {
      return <AdminLogin />;
    }

    return <AdminApp />;
  }

  // PUBLIC PORTFOLIO
  return (
    <PortfolioProvider>
      <Portfolio />
    </PortfolioProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
