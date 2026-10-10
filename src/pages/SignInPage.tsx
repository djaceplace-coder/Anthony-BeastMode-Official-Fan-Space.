import React, { useState } from 'react';
import { LogIn, KeyRound } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/common/SEOHead';

interface SignInPageProps {
  navigate: (route: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ navigate }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/account');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Please enter your email above to receive a password reset link.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg('Could not send reset email: ' + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <SEOHead
        title="Member Sign In"
        description="Sign in to your Anthony BeastMode fan club account."
        canonicalPath="/signin"
      />

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Member Sign In
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Access your member dashboard, chat messages, and local city tour alerts.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {errorMsg}
          </div>
        )}
        {resetSent && (
          <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
            Password reset link sent to your email.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-[var(--accent)] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 text-xs font-bold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-3 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
          Need an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-[var(--accent)] font-semibold hover:underline"
          >
            Join Free Fan Club
          </button>
        </div>
      </div>
    </div>
  );
};
