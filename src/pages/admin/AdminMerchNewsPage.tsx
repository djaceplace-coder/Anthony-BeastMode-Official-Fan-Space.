import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { MerchItem, NewsPost } from '../../types/database';
import { ShoppingBag, Newspaper, User, Plus, Edit, Trash2, X, ExternalLink, CheckCircle2, Save } from 'lucide-react';

export const AdminMerchNewsPage: React.FC = () => {
  const {
    merchItems,
    addMerchItem,
    updateMerchItem,
    deleteMerchItem,
    newsPosts,
    addNewsPost,
    updateNewsPost,
    deleteNewsPost,
    artistProfile,
    updateArtistProfile,
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'merch' | 'news' | 'profile'>('merch');

  // Merch Modal State
  const [editingMerch, setEditingMerch] = useState<MerchItem | null>(null);
  const [isNewMerch, setIsNewMerch] = useState(false);

  // News Modal State
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
  const [isNewNews, setIsNewNews] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState(artistProfile);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    setProfileForm(artistProfile);
  }, [artistProfile]);

  const handleOpenNewMerch = () => {
    setIsNewMerch(true);
    setEditingMerch({
      id: `merch-${Date.now()}`,
      title: '',
      priceLabel: '$35.00',
      status: 'available',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      officialStoreUrl: 'https://anthonybeastmode.myshopify.com',
      sortOrder: merchItems.length + 1,
    });
  };

  const handleSaveMerch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMerch) return;
    const { id, ...rest } = editingMerch;
    if (isNewMerch) {
      await addMerchItem(rest);
    } else {
      await updateMerchItem(id, rest);
    }
    setEditingMerch(null);
    setIsNewMerch(false);
  };

  const handleOpenNewNews = () => {
    setIsNewNews(true);
    setEditingNews({
      id: `news-${Date.now()}`,
      title: '',
      slug: '',
      body: '',
      tags: ['Announcement'],
      publishAt: new Date().toISOString().split('T')[0],
      status: 'published',
      authorTeam: 'Anthony BeastMode Management',
      heroImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    });
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    const slug =
      editingNews.slug.trim() ||
      editingNews.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const { id, ...rest } = { ...editingNews, slug };
    if (isNewNews) {
      await addNewsPost(rest);
    } else {
      await updateNewsPost(id, rest);
    }
    setEditingNews(null);
    setIsNewNews(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateArtistProfile(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E3D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Merchandise, Newsroom &amp; Artist Biography</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time management of official merchandise pricing/links, press dispatches, and artist biography.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('merch')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'merch'
                ? 'bg-amber-500 text-black'
                : 'bg-[#14161D] text-gray-300 border border-[#2A2E3D] hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Merch ({merchItems.length})
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'news'
                ? 'bg-amber-500 text-black'
                : 'bg-[#14161D] text-gray-300 border border-[#2A2E3D] hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" /> News ({newsPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-black'
                : 'bg-[#14161D] text-gray-300 border border-[#2A2E3D] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Artist Profile
          </button>
        </div>
      </div>

      {/* MERCH TAB */}
      {activeTab === 'merch' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Manage official merchandise items, display pricing, availability status, and outbound store links in real time.
            </p>
            <button
              onClick={handleOpenNewMerch}
              className="px-4 py-2 rounded-md bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Merch Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#14161D] border border-[#2A2E3D] rounded-xl flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="aspect-[4/3] bg-[#0B0C10] relative overflow-hidden border-b border-[#2A2E3D]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                          item.status === 'available'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : item.status === 'sold_out'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-[#0B0C10]/90 border border-amber-500/40 font-mono text-xs font-bold text-amber-400">
                      {item.priceLabel}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">{item.description}</p>
                    {item.officialStoreUrl && (
                      <a
                        href={item.officialStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-amber-400 hover:underline"
                      >
                        Store Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-[#0B0C10] border-t border-[#2A2E3D] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-gray-500 uppercase">
                    Order #{item.sortOrder || 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsNewMerch(false);
                        setEditingMerch(item);
                      }}
                      className="px-2.5 py-1 rounded bg-[#1F222E] text-xs text-gray-200 hover:text-white flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3 text-amber-400" /> Edit
                    </button>
                    <button
                      onClick={() => deleteMerchItem(item.id)}
                      className="p-1.5 rounded bg-[#1F222E] text-gray-400 hover:text-red-400"
                      title="Delete Merch Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEWS TAB */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Publish and edit official press dispatches, tour updates, and release announcements in real time.
            </p>
            <button
              onClick={handleOpenNewNews}
              className="px-4 py-2 rounded-md bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Publish Dispatch
            </button>
          </div>

          <div className="space-y-3">
            {newsPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#14161D] border border-[#2A2E3D] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {post.heroImageUrl && (
                    <img
                      src={post.heroImageUrl}
                      alt={post.title}
                      className="w-20 h-16 rounded object-cover border border-[#2A2E3D] shrink-0 hidden sm:block"
                    />
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {(post.tags || []).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-[#1F222E] font-mono text-[10px] uppercase text-amber-400"
                        >
                          {t}
                        </span>
                      ))}
                      <span className="font-mono text-xs text-gray-400">{post.publishAt}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${
                          post.status === 'published'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white">{post.title}</h3>
                    <p className="text-xs text-gray-400 max-w-2xl line-clamp-2 mt-0.5">{post.body}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setIsNewNews(false);
                      setEditingNews(post);
                    }}
                    className="px-3 py-1.5 rounded bg-[#1F222E] text-xs text-gray-200 flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3 text-amber-400" /> Edit
                  </button>
                  <button
                    onClick={() => deleteNewsPost(post.id)}
                    className="p-1.5 rounded bg-[#1F222E] text-gray-400 hover:text-red-400"
                    title="Delete News Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARTIST PROFILE TAB */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-[#14161D] border border-[#2A2E3D] rounded-xl p-6 space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-[#2A2E3D] pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Artist Biography &amp; Press Kit Details</h2>
              <p className="text-xs text-gray-400">
                Changes sync immediately to the Home, About, and Digital Press Kit (EPK) pages.
              </p>
            </div>
            {profileSaved && (
              <span className="px-3 py-1.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Saved Live
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-gray-400">Artist Display Name</label>
              <input
                type="text"
                value={profileForm.displayName}
                onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-400">Home Base Region</label>
              <input
                type="text"
                value={profileForm.homeBase}
                onChange={(e) => setProfileForm({ ...profileForm, homeBase: e.target.value })}
                className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-gray-400">Origin Summary</label>
              <input
                type="text"
                value={profileForm.originSummary}
                onChange={(e) => setProfileForm({ ...profileForm, originSummary: e.target.value })}
                className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-gray-400">Short Bio (Hero / EPK Summary)</label>
              <textarea
                rows={2}
                value={profileForm.shortBio}
                onChange={(e) => setProfileForm({ ...profileForm, shortBio: e.target.value })}
                className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-gray-400">Full Press Biography</label>
              <textarea
                rows={5}
                value={profileForm.longBio}
                onChange={(e) => setProfileForm({ ...profileForm, longBio: e.target.value })}
                className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded p-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#2A2E3D] flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Artist Profile
            </button>
          </div>
        </form>
      )}

      {/* MERCH EDIT MODAL */}
      {editingMerch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-[#2A2E3D] rounded-xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#2A2E3D] pb-3">
              <h2 className="text-sm font-bold uppercase text-white">
                {isNewMerch ? 'Add Merch Item' : `Edit Merch: ${editingMerch.title}`}
              </h2>
              <button onClick={() => setEditingMerch(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveMerch} className="space-y-4">
              <div className="space-y-1">
                <label className="text-gray-400">Item Title *</label>
                <input
                  type="text"
                  required
                  value={editingMerch.title}
                  onChange={(e) => setEditingMerch({ ...editingMerch, title: e.target.value })}
                  className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400">Price Label *</label>
                  <input
                    type="text"
                    required
                    value={editingMerch.priceLabel}
                    onChange={(e) => setEditingMerch({ ...editingMerch, priceLabel: e.target.value })}
                    placeholder="$35.00"
                    className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Inventory Status</label>
                  <select
                    value={editingMerch.status}
                    onChange={(e) =>
                      setEditingMerch({ ...editingMerch, status: e.target.value as MerchItem['status'] })
                    }
                    className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                  >
                    <option value="available">Available</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Sort Order</label>
                  <input
                    type="number"
                    value={editingMerch.sortOrder || 1}
                    onChange={(e) => setEditingMerch({ ...editingMerch, sortOrder: Number(e.target.value) })}
                    className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-gray-400">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editingMerch.description}
                  onChange={(e) => setEditingMerch({ ...editingMerch, description: e.target.value })}
                  className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded p-3 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400">Product Image URL *</label>
                <input
                  type="url"
                  required
                  value={editingMerch.imageUrl}
                  onChange={(e) => setEditingMerch({ ...editingMerch, imageUrl: e.target.value })}
                  className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400">Official External Store URL *</label>
                <input
                  type="url"
                  required
                  value={editingMerch.officialStoreUrl}
                  onChange={(e) => setEditingMerch({ ...editingMerch, officialStoreUrl: e.target.value })}
                  className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                />
              </div>
              <div className="pt-3 border-t border-[#2A2E3D] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMerch(null)}
                  className="px-4 py-2 rounded border border-[#2A2E3D] text-gray-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded bg-amber-500 text-black font-bold">
                  Save Merch Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEWS EDIT MODAL */}
      {editingNews && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-[#2A2E3D] rounded-xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#2A2E3D] pb-3">
              <h2 className="text-sm font-bold uppercase text-white">
                {isNewNews ? 'Publish News Dispatch' : `Edit Dispatch: ${editingNews.title}`}
              </h2>
              <button onClick={() => setEditingNews(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveNews} className="space-y-4">
              <div className="space-y-1">
                <label className="text-gray-400">Headline *</label>
                <input
                  type="text"
                  required
                  value={editingNews.title}
                  onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                  className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400">Primary Tag</label>
                  <input
                    type="text"
                    value={(editingNews.tags || [])[0] || 'Tour'}
                    onChange={(e) => setEditingNews({ ...editingNews, tags: [e.target.value] })}
                    className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Publish Date</label>
                  <input
                    type="date"
                    value={editingNews.publishAt}
                    onChange={(e) => setEditingNews({ ...editingNews, publishAt: e.target.value })}
                    className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Status</label>
                  <select
                    value={editingNews.status}
                    onChange={(e) =>
                      setEditingNews({ ...editingNews, status: e.target.value as NewsPost['status'] })
                    }
                    className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                  >
                    <option value="published">Published</option>
                    <option value="approved">Approved</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-gray-400">Article Body *</label>
                <textarea
                  rows={5}
                  required
                  value={editingNews.body}
                  onChange={(e) => setEditingNews({ ...editingNews, body: e.target.value })}
                  className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded p-3 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400">Hero Image URL</label>
                <input
                  type="url"
                  value={editingNews.heroImageUrl || ''}
                  onChange={(e) => setEditingNews({ ...editingNews, heroImageUrl: e.target.value })}
                  className="w-full bg-[#1F222E] border border-[#2A2E3D] rounded px-3 py-2 text-white"
                />
              </div>
              <div className="pt-3 border-t border-[#2A2E3D] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNews(null)}
                  className="px-4 py-2 rounded border border-[#2A2E3D] text-gray-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded bg-amber-500 text-black font-bold">
                  Save Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
