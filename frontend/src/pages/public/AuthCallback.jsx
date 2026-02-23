import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/context/AuthContext';

/**
 * Handles the redirect from GitHub OAuth.
 * Backend sets the JWT cookie then redirects here with:
 *   ?success=true  — login succeeded
 *   ?error=...     — login failed, error message in param
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (error) {
      setErrorMsg('GitHub login failed. Please try again.');
      const timer = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(timer);
    }

    if (success === 'true') {
      // Cookie is already set by backend — refresh auth state
      profile().then(() => {
        navigate('/dashboard', { replace: true });
      });
    } else {
      // Neither success nor error — something unexpected
      navigate('/login', { replace: true });
    }
  }, []);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-8 py-6 text-center">
          <p className="text-destructive font-medium">{errorMsg}</p>
          <p className="text-muted-foreground text-sm mt-1">Redirecting you back to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      {/* Spinner */}
      <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-muted-foreground text-sm">Signing you in with GitHub…</p>
    </div>
  );
}
