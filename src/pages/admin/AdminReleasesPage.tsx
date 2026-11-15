import React, { useState } from 'react';
import { Disc3, Edit, Music2, Plus, Save, Trash2, X } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { Release, ReleaseType, Track, LyricsStatus } from '../../types/database';

export const AdminReleasesPage: React.FC = () => {
  const { releases, addRelease, updateRelease, deleteRelease, tracks, addTrack, updateTrack, deleteTrack } =
    useDatabase();
  const [activeTab, setActiveTab] = useState<'releases' | 'tracks'>('releases');
  const [editingRelease, setEditingRelease] = useState<Partial<Release> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Track editor state
  const [editingTrack, setEditingTrack] = useState<Partial<Track> | null>(null);
  const [isCreatingTrack, setIsCreatingTrack] = useState(false);

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

  const handleStartCreateTrack = () => {
    setIsCreatingTrack(true);
    setEditingTrack({
      releaseId: releases[0]?.id || '',
      title: '',
      trackNumber: tracks.length + 1,
      durationSeconds: 195,
      explicit: true,
      lyricsStatus: 'not_shown',
    });
  };

  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack?.title || !editingTrack?.releaseId) return;
    if (isCreatingTrack) {
      await addTrack({
        releaseId: editingTrack.releaseId,
        title: editingTrack.title,
        trackNumber: Number(editingTrack.trackNumber) || 1,
        durationSeconds: Number(editingTrack.durationSeconds) || 195,
        explicit: Boolean(editingTrack.explicit),
        lyricsStatus: (editingTrack.lyricsStatus as LyricsStatus) || 'not_shown',
        platformLinks: editingTrack.platformLinks || {},
      });
    } else if (editingTrack.id) {
      const { id, ...rest } = editingTrack;
      await updateTrack(id, rest);
    }
    setEditingTrack(null);
    setIsCreatingTrack(false);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor((sec || 0) / 60);
    const rem = (sec || 0) % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E3D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Discography, Releases &amp; Tracks Manager</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage albums, tracks, verified platform streaming URLs, and 18+ explicit flags in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('releases')}
            className={`px-3.5 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'releases'
                ? 'bg-amber-500 text-black'
                : 'bg-[#14161D] text-gray-300 border border-[#2A2E3D] hover:text-white'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>Releases ({releases.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-3.5 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'tracks'
                ? 'bg-amber-500 text-black'
                : 'bg-[#14161D] text-gray-300 border border-[#2A2E3D] hover:text-white'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Tracks ({tracks.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'releases' ? (
        <>
          <div className="flex justify-end">
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
                  onClick={() => {
                    setEditingRelease(null);
                    setIsCreating(false);
                  }}
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
                    onClick={() => {
                      setEditingRelease(null);
                      setIsCreating(false);
                    }}
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
                    onClick={() => {
                      setEditingRelease(release);
                      setIsCreating(false);
                    }}
                    className="px-3 py-1.5 rounded bg-[#1F222E] hover:bg-[#2A2E3D] text-xs font-semibold text-gray-200 transition-colors flex items-center space-x-1"
                  >
                    <Edit className="w-3 h-3 text-amber-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteRelease(release.id)}
                    title="Delete Release"
                    className="p-1.5 rounded bg-[#1F222E] text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            {!editingTrack && (
              <button
                onClick={handleStartCreateTrack}
                className="px-4 py-2 text-xs font-bold rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Track</span>
              </button>
            )}
          </div>

          {editingTrack && (
            <form
              onSubmit={handleSaveTrack}
              className="p-6 rounded-xl border border-amber-500/40 bg-[#14161D] space-y-4 text-xs"
            >
              <div className="flex justify-between items-center border-b border-[#2A2E3D] pb-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isCreatingTrack ? 'Add New Track' : `Edit Track: ${editingTrack.title}`}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTrack(null);
                    setIsCreatingTrack(false);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-gray-400">Track Title *</label>
                  <input
                    type="text"
                    required
                    value={editingTrack.title || ''}
                    onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Parent Release *</label>
                  <select
                    value={editingTrack.releaseId || ''}
                    onChange={(e) => setEditingTrack({ ...editingTrack, releaseId: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                  >
                    {releases.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Duration (Seconds)</label>
                  <input
                    type="number"
                    value={editingTrack.durationSeconds || 180}
                    onChange={(e) => setEditingTrack({ ...editingTrack, durationSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingTrack.explicit)}
                    onChange={(e) => setEditingTrack({ ...editingTrack, explicit: e.target.checked })}
                  />
                  <span>Explicit (18+ Badge)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTrack(null)}
                  className="px-4 py-2 rounded border border-[#2A2E3D] text-gray-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded bg-amber-500 text-black font-bold">
                  Save Track
                </button>
              </div>
            </form>
          )}

          <div className="rounded-xl border border-[#2A2E3D] bg-[#14161D] divide-y divide-[#2A2E3D] overflow-hidden">
            {tracks.map((tr) => {
              const rel = releases.find((r) => r.id === tr.releaseId);
              return (
                <div key={tr.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">#{tr.trackNumber}</span>
                      <span className="font-bold text-white text-sm">{tr.title}</span>
                      {tr.explicit && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          18+
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      Release: {rel ? rel.title : tr.releaseId} &bull; Duration: {formatDuration(tr.durationSeconds)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingTrack(tr);
                        setIsCreatingTrack(false);
                      }}
                      className="px-3 py-1.5 rounded bg-[#1F222E] text-xs text-gray-200 flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3 text-amber-400" /> Edit
                    </button>
                    <button
                      onClick={() => deleteTrack(tr.id)}
                      className="p-1.5 rounded bg-[#1F222E] text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
