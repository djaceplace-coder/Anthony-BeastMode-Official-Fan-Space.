import React, { useState } from 'react';
import {
  Bell,
  Download,
  KeyRound,
  LogOut,
  MapPin,
  MessageSquare,
  Shield,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { MemberChat } from '../components/chat/MemberChat';
import { OfferCard } from '../components/offers/OfferCard';
import { SEOHead } from '../components/common/SEOHead';

interface AccountPageProps {
  navigate: (route: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ navigate }) => {
  const { currentUser, memberProfile, signOut, updateMemberProfile, selectedCityId, setSelectedCityId } = useAuth();
  const { cities, offers } = useDatabase();

  const [activeTab, setActiveTab] = useState<'profile' | 'chat' | 'offers' | 'security'>('profile');
  const [displayName, setDisplayName] = useState(memberProfile?.displayName || '');
  const [saveStatus, setSaveStatus] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!currentUser) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Please sign in to view your account.</h2>
        <button
          onClick={() => navigate('/signin')}
          className="px-6 py-2.5 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10]"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  const memberCity = cities.find((c) => c.id === memberProfile?.cityId);

  // Offers relevant to member city or segment
  const relevantOffers = offers.filter((o) => {
    if (o.status !== 'approved') return false;
    if (o.scope === 'all_visitors' || o.scope === 'members_only') return true;
    if (o.scope === 'city' && o.cityId === memberProfile?.cityId) return true;
    return false;
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMemberProfile({ displayName });
    setSaveStatus('Profile updated successfully.');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleExportData = () => {
    const exportPayload = {
      user: {
        uid: currentUser.uid,
        email: currentUser.email,
      },
      profile: memberProfile,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `anthony-beastmode-member-data-${currentUser.uid}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAccount = async () => {
    await updateMemberProfile({ status: 'removed' });
    await signOut();
    navigate('/');
  };

  return (
    <div className="space-y-10 pb-16 max-w-4xl mx-auto">
      <SEOHead
        title="Fan Club Account &amp; Dashboard"
        description="Member settings, tour preferences, and direct artist team messaging."
        canonicalPath="/account"
      />

      {/* Header Profile Bar */}
      <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold text-lg border border-[var(--accent)]/30">
            {memberProfile?.displayName ? memberProfile.displayName.slice(0, 2).toUpperCase() : 'BM'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {memberProfile?.displayName || 'Member'}
            </h1>
            <p className="text-xs text-[var(--text-muted)] flex items-center space-x-2 mt-0.5">
              <span>{currentUser.email}</span>
              <span>&bull;</span>
              <span className="text-[var(--accent)]">
                {memberCity ? `${memberCity.name}, ${memberCity.state}` : 'National Member'}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/30 transition-all flex items-center space-x-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === 'profile'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile &amp; Tour City</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === 'chat'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Team Messages</span>
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === 'offers'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Member Perks ({relevantOffers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === 'security'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Privacy &amp; Data</span>
        </button>
      </div>

      {/* Profile & Tour City Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Personal Information
            </h2>

            {saveStatus && (
              <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                {saveStatus}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Home Tour City</label>
                <select
                  value={memberProfile?.cityId || ''}
                  onChange={(e) => {
                    updateMemberProfile({ cityId: e.target.value });
                    setSelectedCityId(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">National (No primary city)</option>
                  {cities.filter((c) => c.enabled).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.state} (Tier {c.priorityTier})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Powers your personalized tour date highlights on the home page and in-app presale alerts.
                </p>
              </div>

              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Member Segments List */}
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Your Active Fan Segments</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Determines which regional meetups and partner perks are highlighted for your profile.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {(memberProfile?.segments || ['rebel_family']).map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent)] font-semibold"
                >
                  #{s.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Messages Tab */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <MemberChat />
        </div>
      )}

      {/* Member Perks / Sponsored Offers Tab */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Partner Offers &amp; Discounts
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Discounts scoped to your member segments and selected tour market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relevantOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      )}

      {/* Security & GDPR Data Export Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Export Your Fan Data (GDPR)</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Download a complete, machine-readable JSON copy of your profile, preferences, and activity.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 text-xs font-semibold rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Download Account Data (JSON)</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-400">Delete Account &amp; Personal Data</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Permanently closes your membership and purges your preferences. This action cannot be undone.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-xs font-semibold rounded-md bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30"
              >
                Request Account Deletion
              </button>
            ) : (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-red-400">Are you sure you want to delete your fan club profile?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-1.5 text-xs font-bold rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Confirm Permanent Deletion
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
