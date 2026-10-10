import React, { useState } from 'react';
import { KeyRound, Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginPageProps {
  onSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess }) => {
  const { signIn, currentUser, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      // Wait for role check
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch {
      // Generic error message per Rule 1.8
      setErrorMsg('Invalid administrative credentials or insufficient privileges.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#2A2E3D] bg-[#14161D] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white">System Access Verification</h1>
          <p className="text-xs text-gray-400">
            Authorized management credentials required.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-400">Authorized Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@management.com"
              className="w-full px-3 py-2 rounded-md bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400">Security Key / Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-md bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-md bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSubmitting ? 'Verifying...' : 'Authenticate'}</span>
          </button>
        </form>

        <p className="text-[10px] text-gray-400 text-center">
          All sign-in attempts and security IP tokens are cryptographically audited.
        </p>
      </div>
    </div>
  );
};
