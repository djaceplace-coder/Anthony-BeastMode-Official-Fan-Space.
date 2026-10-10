import React, { useState } from 'react';
import { Download, Edit, MapPin, Plus, Save, TrendingUp, X } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { City } from '../../types/database';

export const AdminCitiesPage: React.FC = () => {
  const { cities, addCity, updateCity } = useDatabase();
  const [editingCity, setEditingCity] = useState<Partial<City> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'directory' | 'priority'>('priority');

  const handleStartCreate = () => {
    setEditingCity({
      name: '',
      state: 'MO',
      country: 'USA',
      slug: '',
      timeZone: 'America/Chicago',
      priorityTier: 1,
      enabled: true,
      cityNote: '',
      adminNote: '',
      metricsPrivate: {
        monthlyListeners: 10000,
        pastSales: 300,
        socialFollowers: 5000,
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    });
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCity?.name || !editingCity?.slug) return;

    if (isCreating) {
      await addCity(editingCity as Omit<City, 'id'>);
    } else if (editingCity.id) {
      await updateCity(editingCity.id, editingCity);
    }

    setEditingCity(null);
    setIsCreating(false);
  };

  const handleExportCSV = () => {
    const headers = ['City', 'State', 'PriorityTier', 'MonthlyListeners', 'PastSales', 'SocialFollowers', 'Enabled', 'AdminNote'];
    const rows = cities.map((c) => [
      `"${c.name}"`,
      `"${c.state}"`,
      c.priorityTier,
      c.metricsPrivate?.monthlyListeners || 0,
      c.metricsPrivate?.pastSales || 0,
      c.metricsPrivate?.socialFollowers || 0,
      c.enabled ? 'YES' : 'NO',
      `"${(c.adminNote || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `anthony-beastmode-city-priority-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2A2E3D] pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">City Strategy &amp; Priority Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Internal tour market analytics (Spotify monthly listeners, past sales, priority tiers).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold rounded border border-[#2A2E3D] bg-[#1F222E] text-gray-200 hover:border-amber-500 transition-colors flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>
          {!editingCity && (
            <button
              onClick={handleStartCreate}
              className="px-4 py-1.5 text-xs font-bold rounded bg-amber-500 text-black hover:bg-amber-400 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add City</span>
            </button>
          )}
        </div>
      </div>

      {editingCity && (
        <div className="p-6 rounded-xl border border-amber-500/40 bg-[#14161D] space-y-4">
          <div className="flex justify-between items-center border-b border-[#2A2E3D] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {isCreating ? 'Launch New City Hub' : `Edit: ${editingCity.name}`}
            </h2>
            <button
              onClick={() => { setEditingCity(null); setIsCreating(false); }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400">City Name *</label>
                <input
                  type="text"
                  required
                  value={editingCity.name || ''}
                  onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">State Code (e.g. MO)</label>
                <input
                  type="text"
                  required
                  value={editingCity.state || ''}
                  onChange={(e) => setEditingCity({ ...editingCity, state: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">URL Slug * (e.g. kansas-city-mo)</label>
                <input
                  type="text"
                  required
                  value={editingCity.slug || ''}
                  onChange={(e) => setEditingCity({ ...editingCity, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Priority Tier</label>
                <select
                  value={editingCity.priorityTier || 1}
                  onChange={(e) => setEditingCity({ ...editingCity, priorityTier: parseInt(e.target.value) as any })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={1}>Tier 1 (Flagship / Core Launch)</option>
                  <option value={2}>Tier 2 (Secondary Routing)</option>
                  <option value={3}>Tier 3 (Expansion / Opportunistic)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Monthly Listeners (Spotify for Artists)</label>
                <input
                  type="number"
                  value={editingCity.metricsPrivate?.monthlyListeners || 0}
                  onChange={(e) =>
                    setEditingCity({
                      ...editingCity,
                      metricsPrivate: {
                        ...editingCity.metricsPrivate,
                        monthlyListeners: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Past Ticket Sales</label>
                <input
                  type="number"
                  value={editingCity.metricsPrivate?.pastSales || 0}
                  onChange={(e) =>
                    setEditingCity({
                      ...editingCity,
                      metricsPrivate: {
                        ...editingCity.metricsPrivate,
                        pastSales: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Approved Public City Note</label>
              <input
                type="text"
                value={editingCity.cityNote || ''}
                onChange={(e) => setEditingCity({ ...editingCity, cityNote: e.target.value })}
                placeholder="One-line public note for the city page"
                className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Internal Routing Decision Note (Private)</label>
              <textarea
                rows={2}
                value={editingCity.adminNote || ''}
                onChange={(e) => setEditingCity({ ...editingCity, adminNote: e.target.value })}
                placeholder="Internal notes on promoter relationship, capacity target..."
                className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setEditingCity(null); setIsCreating(false); }}
                className="px-4 py-2 rounded border border-[#2A2E3D] text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save City Hub</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Priority Matrix Table */}
      <div className="rounded-xl border border-[#2A2E3D] bg-[#14161D] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1F222E] border-b border-[#2A2E3D] text-gray-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3">City / Hub</th>
              <th className="p-3">Tier</th>
              <th className="p-3">Monthly Listeners</th>
              <th className="p-3">Past Sales</th>
              <th className="p-3">Internal Routing Note</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2E3D] font-mono">
            {cities.map((city) => (
              <tr key={city.id} className="hover:bg-[#1F222E]/50 transition-colors">
                <td className="p-3 font-bold text-white font-sans">
                  {city.name}, {city.state}
                  <span className="block text-[10px] text-gray-400 font-mono">/{city.slug}</span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      city.priorityTier === 1
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : city.priorityTier === 2
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    Tier {city.priorityTier}
                  </span>
                </td>
                <td className="p-3 text-gray-200">
                  {city.metricsPrivate?.monthlyListeners?.toLocaleString() || '--'}
                </td>
                <td className="p-3 text-emerald-400">
                  {city.metricsPrivate?.pastSales?.toLocaleString() || '--'}
                </td>
                <td className="p-3 text-gray-400 font-sans max-w-xs truncate">
                  {city.adminNote || 'No notes on file.'}
                </td>
                <td className="p-3 text-right font-sans">
                  <button
                    onClick={() => { setEditingCity(city); setIsCreating(false); }}
                    className="px-2.5 py-1 rounded bg-[#1F222E] hover:bg-[#2A2E3D] text-gray-200 text-xs"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
