import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, RefreshCw, CheckCircle2, ShieldAlert, Globe, Save, KeyRound } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { siteSettings, updateSiteSettings, syncSeedDataToFirestore, logAuditAction } = useDatabase();
  const { updateAdminPassword } = useAuth();
  const [form, setForm] = useState(siteSettings);
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncedDone, setSyncedDone] = useState(false);

  // Admin Passcode Update State
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeMsg, setPasscodeMsg] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  useEffect(() => {
    setForm(siteSettings);
  }, [siteSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSiteSettings({
      ...form,
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUpdatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeMsg('');
    setPasscodeError('');

    if (newPasscode !== confirmPasscode) {
      setPasscodeError('New passcode and confirmation do not match.');
      return;
    }

    try {
      await updateAdminPassword(currentPasscode, newPasscode);
      await logAuditAction('update_admin_passcode', 'members', 'admin-owner-primary', {
        email: 'admin@anthonybeastmode.online',
      });
      setPasscodeMsg('Admin security passcode updated in real time.');
      setCurrentPasscode('');
      setNewPasscode('');
      setConfirmPasscode('');
      setTimeout(() => setPasscodeMsg(''), 4000);
    } catch (err: any) {
      setPasscodeError(err.message || 'Could not update passcode.');
    }
  };

  const handleResync = async () => {
    setSyncing(true);
    try {
      await syncSeedDataToFirestore();
      setSyncedDone(true);
      setTimeout(() => setSyncedDone(false), 4000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E3D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Global Site Settings &amp; Security Controls</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage admin security passcode, operational policies, social endpoints, and Firestore catalog sync.
          </p>
        </div>
        {saved && (
          <span className="px-3 py-1.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Settings Synced to Firestore
          </span>
        )}
      </div>

      {/* Admin Passcode / Password Update Card */}
      <form onSubmit={handleUpdatePasscode} className="bg-[#14161D] border border-[#2A2E3D] rounded-xl p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-[#2A2E3D] pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Admin Credentials &amp; Security Passcode
            </h2>
          </div>
          <span className="font-mono text-[11px] text-amber-400">admin@anthonybeastmode.online</span>
        </div>

        {passcodeError && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400">
            {passcodeError}
          </div>
        )}
        {passcodeMsg && (
          <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{passcodeMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-gray-400">Current Passcode *</label>
            <input
              type="password"
              required
              value={currentPasscode}
              onChange={(e) => setCurrentPasscode(e.target.value)}
              placeholder="••••••"
              className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white tracking-widest focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-gray-400">New Passcode *</label>
            <input
              type="password"
              required
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder="••••••"
              className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white tracking-widest focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-gray-400">Confirm New Passcode *</label>
            <input
              type="password"
              required
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              placeholder="••••••"
              className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white tracking-widest focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" /> Update Security Passcode
          </button>
        </div>
      </form>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        <div className="bg-[#14161D] border border-[#2A2E3D] rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#2A2E3D] pb-3">
            <Settings className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Operational Policies &amp; Modes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="p-4 rounded-lg bg-[#1F222E] border border-[#2A2E3D] flex items-start justify-between gap-4 cursor-pointer">
              <div>
                <span className="font-bold text-white block mb-1">Public Maintenance Mode</span>
                <p className="text-gray-400 leading-relaxed">
                  When enabled, non-admin visitors see a maintenance screen while admins retain full portal and preview access.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
                className="mt-1 accent-amber-500 w-4 h-4"
              />
            </label>

            <label className="p-4 rounded-lg bg-[#1F222E] border border-[#2A2E3D] flex items-start justify-between gap-4 cursor-pointer">
              <div>
                <span className="font-bold text-white block mb-1">Community Name Approval Flag</span>
                <p className="text-gray-400 leading-relaxed">
                  Marks whether the official fan club community naming has been signed off by management.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.communityNameApproved}
                onChange={(e) => setForm({ ...form, communityNameApproved: e.target.checked })}
                className="mt-1 accent-amber-500 w-4 h-4"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-gray-400">Default Platform Language</label>
              <input
                type="text"
                value={form.defaultLanguage}
                onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })}
                className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-400">Footer Copyright &amp; Attribution Text</label>
              <input
                type="text"
                value={form.footerText}
                onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#14161D] border border-[#2A2E3D] rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#2A2E3D] pb-3">
            <Globe className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Official Streaming &amp; Social Endpoints
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['spotify', 'appleMusic', 'youtube', 'instagram'] as const).map((key) => (
              <div key={key} className="space-y-1">
                <label className="text-gray-400 uppercase font-mono text-[10px]">{key} URL</label>
                <input
                  type="url"
                  value={form.socialLinks?.[key] || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socialLinks: {
                        ...form.socialLinks,
                        [key]: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#2A2E3D] flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Global Settings
            </button>
          </div>
        </div>
      </form>

      <div className="bg-[#14161D] border border-[#2A2E3D] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase">
              Firestore Seed Catalog Synchronization
            </h3>
          </div>
          <p className="text-xs text-gray-400 max-w-xl">
            Re-synchronize default seed releases, tracks, tour dates, cities, venues, partner offers, merch items, and copy registry documents to Firestore without deleting custom user accounts.
          </p>
        </div>
        <button
          type="button"
          disabled={syncing}
          onClick={handleResync}
          className="px-4 py-2.5 rounded bg-[#1F222E] border border-[#2A2E3D] hover:border-amber-500 text-xs font-bold text-white transition-colors flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-amber-400' : ''}`} />
          {syncing ? 'Syncing...' : syncedDone ? 'Catalog Synced!' : 'Resync Seed Data'}
        </button>
      </div>
    </div>
  );
};
