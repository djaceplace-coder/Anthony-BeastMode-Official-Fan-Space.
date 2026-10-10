import React, { useState } from 'react';
import { Disc3, Edit, ExternalLink, Plus, Save, Trash2, X } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { Release, ReleaseType, ReleaseLifecycle, ApprovalStatus } from '../../types/database';

export const AdminReleasesPage: React.FC = () => {
  const { releases, addRelease, updateRelease } = useDatabase();
  const [editingRelease, setEditingRelease] = useState<Partial<Release> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Valid platform domains map
  const PLATFORM_DOMAINS: Record<string, string> = {
    spotify: 'open.spotify.com',
    apple_music: 'music.apple.com',
    youtube_music: 'music.youtube.com',
    deezer: 'deezer.com',
    bandcamp: 'bandcamp.com',
  };

  const handleStartCreate = () => {
    setEditingRelease({
      slug: '',
      title: '',
      type: 'album',
      releaseDate: new Date().toISOString().split('T')[0],
      status: 'released',
      explicit: false,
      coverUrl: '',
      description: '',
      embedProvider: 'spotify',
      embedUrl: '',
      platformLinks: {},
      featured: false,
      sortOrder: releases.length + 1,
      approvalStatus: 'approved',
    });
    setIsCreating(true);
    setValidationError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRelease?.title || !editingRelease?.slug) {
      setValidationError('Title and URL slug are mandatory.');
      return;
    }

    // Embed validator
    if (editingRelease.embedUrl) {
      try {
        const u = new URL(editingRelease.embedUrl);
        const allowed = ['open.spotify.com', 'embed.music.apple.com', 'widget.deezer.com', 'youtube.com'];
        if (!allowed.some((host) => u.hostname.includes(host))) {
          setValidationError(`Embed host (${u.hostname}) is not on the verified allowlist.`);
          return;
        }
      } catch {
        setValidationError('Invalid embed URL format.');
        return;
      }
    }

    if (isCreating) {
      await addRelease(editingRelease as Omit<Release, 'id'>);
    } else if (editingRelease.id) {
      await updateRelease(editingRelease.id, editingRelease);
    }

    setEditingRelease(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between border-b border-[#2A2E3D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Discography &amp; Release Manager</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage albums, verified platform streaming URLs, and embed allowlists.
          </p>
        </div>
        {!editingRelease && (
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 text-xs font-bold rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Release</span>
          </button>
        )}
      </div>

      {editingRelease && (
        <div className="p-6 rounded-xl border border-amber-500/40 bg-[#14161D] space-y-4">
          <div className="flex justify-between items-center border-b border-[#2A2E3D] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {isCreating ? 'Create New Release' : `Edit: ${editingRelease.title}`}
            </h2>
            <button
              onClick={() => { setEditingRelease(null); setIsCreating(false); }}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400">Release Title *</label>
                <input
                  type="text"
                  required
                  value={editingRelease.title || ''}
                  onChange={(e) => setEditingRelease({ ...editingRelease, title: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">URL Slug * (e.g. trailer-park-baby)</label>
                <input
                  type="text"
                  required
                  value={editingRelease.slug || ''}
                  onChange={(e) => setEditingRelease({ ...editingRelease, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Release Type</label>
                <select
                  value={editingRelease.type || 'album'}
                  onChange={(e) => setEditingRelease({ ...editingRelease, type: e.target.value as ReleaseType })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="album">Album</option>
                  <option value="ep">EP</option>
                  <option value="single">Single</option>
                  <option value="mixtape">Mixtape</option>
                  <option value="compilation">Compilation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Release Date</label>
                <input
                  type="date"
                  value={editingRelease.releaseDate || ''}
                  onChange={(e) => setEditingRelease({ ...editingRelease, releaseDate: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Cover Image URL (1:1 Ratio)</label>
                <input
                  type="url"
                  value={editingRelease.coverUrl || ''}
                  onChange={(e) => setEditingRelease({ ...editingRelease, coverUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Official Embed URL (Allowlisted Host)</label>
                <input
                  type="url"
                  value={editingRelease.embedUrl || ''}
                  onChange={(e) => setEditingRelease({ ...editingRelease, embedUrl: e.target.value })}
                  placeholder="https://open.spotify.com/embed/album/..."
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Approved Liner Notes / Description</label>
              <textarea
                rows={3}
                value={editingRelease.description || ''}
                onChange={(e) => setEditingRelease({ ...editingRelease, description: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-2 border-t border-[#2A2E3D]">
              <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingRelease.explicit || false}
                  onChange={(e) => setEditingRelease({ ...editingRelease, explicit: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <span>Explicit Content (requires 18+ gate)</span>
              </label>

              <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingRelease.featured || false}
                  onChange={(e) => setEditingRelease({ ...editingRelease, featured: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <span>Feature on Home Strip</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setEditingRelease(null); setIsCreating(false); }}
                className="px-4 py-2 rounded border border-[#2A2E3D] text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Release</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Releases List */}
      <div className="rounded-xl border border-[#2A2E3D] bg-[#14161D] divide-y divide-[#2A2E3D] overflow-hidden">
        {releases.map((release) => (
          <div key={release.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-12 h-12 rounded bg-[#1F222E] overflow-hidden shrink-0 border border-[#2A2E3D]">
                {release.coverUrl ? (
                  <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover" />
                ) : (
                  <Disc3 className="w-6 h-6 m-3 text-amber-400" />
                )}
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm truncate">{release.title}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-[#1F222E] text-amber-400">
                    {release.type}
                  </span>
                  {release.explicit && (
                    <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      18+
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                  Slug: /{release.slug} &bull; Released: {release.releaseDate}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => { setEditingRelease(release); setIsCreating(false); }}
                className="px-3 py-1.5 rounded bg-[#1F222E] hover:bg-[#2A2E3D] text-xs font-semibold text-gray-200 transition-colors flex items-center space-x-1"
              >
                <Edit className="w-3 h-3 text-amber-400" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
