import React, { useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CookieConsent: React.FC = () => {
  const { cookieConsent, setCookieConsent } = useAuth();
  const [showManageModal, setShowManageModal] = useState(false);

  if (cookieConsent !== null && !showManageModal) return null;

  return (
    <>
      {cookieConsent === null && (
        <aside
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] p-4 shadow-xl animate-in slide-in-from-bottom duration-300"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  Privacy-First Experience &amp; Consent
                </p>
                <p className="text-xs text-[var(--text-muted)] max-w-3xl leading-relaxed">
                  We value your privacy. We never sell your personal information or track your identity across external sites. We use strictly essential storage for your 18+ age preferences and Fan Club authentication, plus optional anonymous analytics to measure tour city demand.
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={() => setCookieConsent('essential')}
                className="px-3 py-1.5 text-xs font-medium rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              >
                Essential Only
              </button>
              <button
                onClick={() => setShowManageModal(true)}
                className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
              >
                Manage
              </button>
              <button
                onClick={() => setCookieConsent('all')}
                className="px-4 py-1.5 text-xs font-semibold rounded bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {showManageModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Manage Privacy &amp; Tracking Preferences
              </h3>
              <button
                onClick={() => setShowManageModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[var(--bg-elevated)] rounded-md border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between font-semibold text-[var(--text-primary)]">
                  <span>Strictly Essential (Always Active)</span>
                  <span className="text-[var(--accent)]">Required</span>
                </div>
                <p className="text-[var(--text-muted)]">
                  Required for user sessions, 18+ explicit gating, and security. Cannot be turned off.
                </p>
              </div>

              <div className="p-3 bg-[var(--bg-elevated)] rounded-md border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between font-semibold text-[var(--text-primary)]">
                  <span>Anonymous Tour &amp; City Metrics</span>
                  <span className="text-xs text-[var(--text-secondary)]">Optional</span>
                </div>
                <p className="text-[var(--text-muted)]">
                  Anonymously aggregates ticket link and offer clicks by city to help the team route upcoming tour dates. No individual IP or identity is stored.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setCookieConsent('essential');
                  setShowManageModal(false);
                }}
                className="px-3 py-1.5 text-xs font-medium border border-[var(--border-subtle)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Save Essential Only
              </button>
              <button
                onClick={() => {
                  setCookieConsent('all');
                  setShowManageModal(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded bg-[var(--accent)] text-[#0B0C10]"
              >
                Save &amp; Allow All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
