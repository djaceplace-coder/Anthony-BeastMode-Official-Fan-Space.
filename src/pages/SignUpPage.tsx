import React, { useState } from 'react';
import { Check, ShieldAlert, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { SEOHead } from '../components/common/SEOHead';

interface SignUpPageProps {
  navigate: (route: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ navigate }) => {
  const { signUp, confirm18Plus, is18PlusConfirmed } = useAuth();
  const { cities } = useDatabase();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [segments, setSegments] = useState<string[]>(['rebel_family']);
  const [agree18Plus, setAgree18Plus] = useState(is18PlusConfirmed);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSegments = [
    { id: 'rebel_family', label: 'Rebel Family Core Fan' },
    { id: 'city_fan', label: 'Local City Concert Goer' },
    { id: 'new_listener', label: 'New Listener / Discography Explorer' },
    { id: 'press', label: 'Music Journalist / Playlist Curator' },
    { id: 'venue_contact', label: 'Venue Promoter / Booking Contact' },
    { id: 'brand_partner', label: 'Brand / Sponsor Representative' },
  ];

  const toggleSegment = (id: string) => {
    setSegments((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!agree18Plus) {
      setErrorMsg('Please confirm you are 18 years of age or older.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirm18Plus();
      await signUp(email, password, name, selectedCityId || undefined, segments);
      navigate('/account');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-8">
      <SEOHead
        title="Join the Fan Club (Free Sign-Up)"
        description="Create your free Anthony BeastMode fan account to follow local tour stops and message the team."
        canonicalPath="/signup"
      />

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Join the Fan Club
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Free membership. Select your local city and preferences below.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Your Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cole Walker"
              className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Email Address *</label>
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
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Create Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Local City Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              Your Primary Tour City (Optional)
            </label>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">No preference (National alerts)</option>
              {cities.filter((c) => c.enabled).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.state} (Tier {c.priorityTier})
                </option>
              ))}
            </select>
          </div>

          {/* Fan Segment Chips (Section 2.6) */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)] block">
              Fan Segments &amp; Interests (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableSegments.map((seg) => {
                const isSelected = segments.includes(seg.id);
                return (
                  <button
                    type="button"
                    key={seg.id}
                    onClick={() => toggleSegment(seg.id)}
                    className={`px-2.5 py-1 text-[11px] rounded-md font-medium border transition-colors ${
                      isSelected
                        ? 'bg-[var(--accent)] text-[#0B0C10] border-[var(--accent)] font-semibold'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--text-secondary)]'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {seg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explicit Content Confirmation (Rule 1.6) */}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
            <label className="flex items-start space-x-2.5 text-xs text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={agree18Plus}
                onChange={(e) => setAgree18Plus(e.target.checked)}
                className="mt-0.5 rounded text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span>
                I confirm that I am at least <strong>18 years of age</strong> (required for explicit audio streaming). No birthdate is collected.
              </span>
            </label>

            <label className="flex items-start space-x-2.5 text-xs text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span>
                I accept the{' '}
                <button
                  type="button"
                  onClick={() => navigate('/terms')}
                  className="text-[var(--accent)] underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => navigate('/privacy')}
                  className="text-[var(--accent)] underline"
                >
                  Privacy Policy
                </button>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 text-xs font-bold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'Creating Profile...' : 'Complete Free Registration'}</span>
          </button>
        </form>

        <div className="pt-3 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
          Already registered?{' '}
          <button
            onClick={() => navigate('/signin')}
            className="text-[var(--accent)] font-semibold hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
