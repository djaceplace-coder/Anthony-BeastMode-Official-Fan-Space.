import React, { useState } from 'react';
import { Calendar, Copy, Edit, Plus, Save, Trash2, X } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { Show, ShowStatus, AgePolicy } from '../../types/database';

export const AdminShowsPage: React.FC = () => {
  const { shows, cities, venues, addShow, updateShow } = useDatabase();
  const [editingShow, setEditingShow] = useState<Partial<Show> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleStartCreate = () => {
    setEditingShow({
      cityId: cities[0]?.id || '',
      venueId: venues[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      doorsTime: '7:00 PM',
      showTime: '8:00 PM',
      timeZone: 'America/Chicago',
      agePolicy: '18_plus',
      status: 'on_sale',
      officialTicketUrl: '',
      ticketVendorName: 'Official Venue Box Office',
      priceLabel: '$25 advance',
      priceSource: 'Official Ticketing',
      priceVerifiedOn: new Date().toISOString().split('T')[0],
      opener: '',
      publicNotice: '',
    });
    setIsCreating(true);
    setValidationError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShow?.cityId || !editingShow?.venueId || !editingShow?.date || !editingShow?.agePolicy) {
      setValidationError('City, Venue, Date, and Age Policy are mandatory fields.');
      return;
    }

    if (isCreating) {
      await addShow(editingShow as Omit<Show, 'id'>);
    } else if (editingShow.id) {
      await updateShow(editingShow.id, editingShow);
    }

    setEditingShow(null);
    setIsCreating(false);
  };

  const handleDuplicate = (show: Show) => {
    const { id, ...rest } = show;
    setEditingShow({
      ...rest,
      date: new Date().toISOString().split('T')[0],
    });
    setIsCreating(true);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between border-b border-[#2A2E3D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Tour Dates &amp; Shows Manager</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Single source of truth for tour routing, ticket vendors, and price verifications.
          </p>
        </div>
        {!editingShow && (
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 text-xs font-bold rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Show</span>
          </button>
        )}
      </div>

      {editingShow && (
        <div className="p-6 rounded-xl border border-amber-500/40 bg-[#14161D] space-y-4">
          <div className="flex justify-between items-center border-b border-[#2A2E3D] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {isCreating ? 'Schedule New Concert Date' : 'Edit Concert Date'}
            </h2>
            <button
              onClick={() => { setEditingShow(null); setIsCreating(false); }}
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
                <label className="text-gray-400">Select City Hub *</label>
                <select
                  required
                  value={editingShow.cityId || ''}
                  onChange={(e) => setEditingShow({ ...editingShow, cityId: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Select Venue *</label>
                <select
                  required
                  value={editingShow.venueId || ''}
                  onChange={(e) => setEditingShow({ ...editingShow, venueId: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Concert Date *</label>
                <input
                  type="date"
                  required
                  value={editingShow.date || ''}
                  onChange={(e) => setEditingShow({ ...editingShow, date: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Doors Time</label>
                <input
                  type="text"
                  value={editingShow.doorsTime || ''}
                  onChange={(e) => setEditingShow({ ...editingShow, doorsTime: e.target.value })}
                  placeholder="e.g. 7:00 PM"
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Showtime *</label>
                <input
                  type="text"
                  required
                  value={editingShow.showTime || ''}
                  onChange={(e) => setEditingShow({ ...editingShow, showTime: e.target.value })}
                  placeholder="e.g. 8:00 PM"
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Age Policy *</label>
                <select
                  value={editingShow.agePolicy || '18_plus'}
                  onChange={(e) => setEditingShow({ ...editingShow, agePolicy: e.target.value as AgePolicy })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all_ages">All Ages</option>
                  <option value="18_plus">18+ Only</option>
                  <option value="21_plus">21+ Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Show Status</label>
                <select
                  value={editingShow.status || 'on_sale'}
                  onChange={(e) => setEditingShow({ ...editingShow, status: e.target.value as ShowStatus })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="on_sale">On Sale</option>
                  <option value="low_tickets">Low Tickets</option>
                  <option value="sold_out">Sold Out</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="postponed">Postponed</option>
                  <option value="past">Past</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Official Ticket URL (Outbound)</label>
                <input
                  type="url"
                  value={editingShow.officialTicketUrl || ''}
                  onChange={(e) => setEditingShow({ ...editingShow, officialTicketUrl: e.target.value })}
                  placeholder="https://eventbrite.com/..."
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Ticketing Vendor Name</label>
                <input
                  type="text"
                  value={editingShow.ticketVendorName || ''}
                  onChange={(e) => setEditingShow({ ...editingShow, ticketVendorName: e.target.value })}
                  placeholder="e.g. Eventbrite / TicketLeap"
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Price Label (e.g. $25 advance)</label>
                <input
                  type="text"
                  value={editingShow.priceLabel || ''}
                  onChange={(e) => setEditingShow({ ...editingShow, priceLabel: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Price Source (Vendor Name)</label>
                <input
                  type="text"
                  value={editingShow.priceSource || ''}
                  onChange={(e) => setEditingShow({ ...editingShow, priceSource: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Price Verified Date (Must be within 14 days)</label>
                <input
                  type="date"
                  value={editingShow.priceVerifiedOn || ''}
                  onChange={(e) => setEditingShow({ ...editingShow, priceVerifiedOn: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Public notice for cancellation / postponement */}
            <div className="space-y-1">
              <label className="text-gray-400">Public Notice / Reason (Required if Cancelled or Postponed)</label>
              <input
                type="text"
                value={editingShow.publicNotice || ''}
                onChange={(e) => setEditingShow({ ...editingShow, publicNotice: e.target.value })}
                placeholder="e.g. Rescheduled due to severe weather. All original tickets honored."
                className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setEditingShow(null); setIsCreating(false); }}
                className="px-4 py-2 rounded border border-[#2A2E3D] text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Tour Date</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shows List */}
      <div className="rounded-xl border border-[#2A2E3D] bg-[#14161D] divide-y divide-[#2A2E3D] overflow-hidden">
        {shows.map((show) => {
          const city = cities.find((c) => c.id === show.cityId);
          const venue = venues.find((v) => v.id === show.venueId);

          return (
            <div key={show.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-amber-400 text-xs font-bold">{show.date}</span>
                  <span className="font-bold text-white text-sm">
                    {city ? `${city.name}, ${city.state}` : 'City'} &bull; {venue ? venue.name : 'Venue'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-[#1F222E] text-gray-300">
                    {show.status}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Age: {show.agePolicy} &bull; Price: {show.priceLabel || 'N/A'} (Verified: {show.priceVerifiedOn})
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleDuplicate(show)}
                  title="Duplicate show to new date"
                  className="p-1.5 rounded bg-[#1F222E] text-gray-400 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setEditingShow(show); setIsCreating(false); }}
                  className="px-3 py-1.5 rounded bg-[#1F222E] hover:bg-[#2A2E3D] text-xs font-semibold text-gray-200 flex items-center space-x-1"
                >
                  <Edit className="w-3 h-3 text-amber-400" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
