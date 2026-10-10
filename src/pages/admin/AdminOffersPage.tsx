import React, { useState } from 'react';
import { CheckCircle, ExternalLink, Plus, Save, ShieldAlert, Tag, X } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { PartnerOffer, OfferScope, OfferType, OfferStatus } from '../../types/database';

export const AdminOffersPage: React.FC = () => {
  const { offers, cities, addOffer, updateOffer } = useDatabase();
  const [editingOffer, setEditingOffer] = useState<Partial<PartnerOffer> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleStartCreate = () => {
    setEditingOffer({
      partnerName: '',
      partnerLogoUrl: '',
      offerType: 'razer_gold',
      headline: '',
      discountText: '',
      scope: 'all_visitors',
      startAt: new Date().toISOString().split('T')[0],
      endAt: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'draft',
      ctaLabel: 'Claim Offer',
      ctaUrl: '',
      finePrint: '',
      signedTermsRef: '',
      ticketRelated: false,
      ticketingPartnerApproved: false,
      sponsoredLabel: 'Sponsored',
    });
    setIsCreating(true);
    setValidationError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer?.finePrint || editingOffer.finePrint.trim().length === 0) {
      setValidationError('Rule 1.7 / 7.2: An offer with empty fine print cannot be created or published.');
      return;
    }
    if (!editingOffer.partnerName || !editingOffer.headline || !editingOffer.ctaUrl) {
      setValidationError('Partner name, headline, and external checkout URL are mandatory.');
      return;
    }

    if (isCreating) {
      await addOffer(editingOffer as Omit<PartnerOffer, 'id'>);
    } else if (editingOffer.id) {
      await updateOffer(editingOffer.id, editingOffer);
    }

    setEditingOffer(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between border-b border-[#2A2E3D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Partner Offers &amp; Sponsorships</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Strict fine-print backed promotions. Mandatory "Sponsored" label on every card.
          </p>
        </div>
        {!editingOffer && (
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 text-xs font-bold rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Partner Offer</span>
          </button>
        )}
      </div>

      {editingOffer && (
        <div className="p-6 rounded-xl border border-amber-500/40 bg-[#14161D] space-y-4">
          <div className="flex justify-between items-center border-b border-[#2A2E3D] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {isCreating ? 'Create Partner Offer' : `Edit: ${editingOffer.partnerName}`}
            </h2>
            <button
              onClick={() => { setEditingOffer(null); setIsCreating(false); }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {validationError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {validationError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400">Partner Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.partnerName || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, partnerName: e.target.value })}
                  placeholder="e.g. Razer Gold / Apple Music"
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Partner Logo URL</label>
                <input
                  type="url"
                  value={editingOffer.partnerLogoUrl || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, partnerLogoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Offer Type</label>
                <select
                  value={editingOffer.offerType || 'other'}
                  onChange={(e) => setEditingOffer({ ...editingOffer, offerType: e.target.value as OfferType })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="razer_gold">Razer Gold</option>
                  <option value="apple">Apple</option>
                  <option value="fan_membership">Fan Membership</option>
                  <option value="merch">Merchandise</option>
                  <option value="other">Other Brand</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Audience Scope</label>
                <select
                  value={editingOffer.scope || 'all_visitors'}
                  onChange={(e) => setEditingOffer({ ...editingOffer, scope: e.target.value as OfferScope })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all_visitors">All Visitors</option>
                  <option value="members_only">Fan Club Members Only</option>
                  <option value="city">Specific City Hub Only</option>
                  <option value="segment">Specific Member Segment Only</option>
                </select>
              </div>

              {editingOffer.scope === 'city' && (
                <div className="space-y-1">
                  <label className="text-gray-400">Scoped City</label>
                  <select
                    value={editingOffer.cityId || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, cityId: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}, {c.state}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-gray-400">Signed Terms Reference (Mandatory)</label>
                <input
                  type="text"
                  required
                  value={editingOffer.signedTermsRef || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, signedTermsRef: e.target.value })}
                  placeholder="e.g. AGR-RAZER-2026-08"
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400">Headline *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.headline || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, headline: e.target.value })}
                  placeholder="e.g. Exclusive 10% Bonus Gaming Credit"
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Discount Text *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.discountText || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, discountText: e.target.value })}
                  placeholder="e.g. Get 10% bonus credit with code BEASTMODE at checkout"
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Outbound Checkout / Partner URL *</label>
                <input
                  type="url"
                  required
                  value={editingOffer.ctaUrl || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, ctaUrl: e.target.value })}
                  placeholder="https://gold.razer.com/..."
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Publication Status</label>
                <select
                  value={editingOffer.status || 'draft'}
                  onChange={(e) => setEditingOffer({ ...editingOffer, status: e.target.value as OfferStatus })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="approved">Approved &amp; Live</option>
                  <option value="paused">Paused</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-bold text-amber-400">
                Complete Legal Fine Print * (Required - Cannot Be Published If Empty)
              </label>
              <textarea
                required
                rows={4}
                value={editingOffer.finePrint || ''}
                onChange={(e) => setEditingOffer({ ...editingOffer, finePrint: e.target.value })}
                placeholder="SPONSORED PROMOTION. Valid on official partner checkout only. Terms apply..."
                className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setEditingOffer(null); setIsCreating(false); }}
                className="px-4 py-2 rounded border border-[#2A2E3D] text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Offer</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Offers Table */}
      <div className="rounded-xl border border-[#2A2E3D] bg-[#14161D] divide-y divide-[#2A2E3D] overflow-hidden">
        {offers.map((offer) => (
          <div key={offer.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{offer.partnerName}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-[#1F222E] text-amber-400">
                  {offer.scope}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {offer.status}
                </span>
              </div>
              <h4 className="text-xs text-gray-300 font-medium mt-0.5">{offer.headline}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{offer.finePrint}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => { setEditingOffer(offer); setIsCreating(false); }}
                className="px-3 py-1.5 rounded bg-[#1F222E] hover:bg-[#2A2E3D] text-xs font-semibold text-gray-200"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
