import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Download,
  Edit,
  FileCheck,
  Megaphone,
  MessageSquare,
  Radio,
  Save,
  Search,
  Send,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  X,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { DocumentTemplateType, Member, UserRole } from '../../types/database';
import { buildTemplateDocument } from './AdminInboxPage';

export const AdminMembersPage: React.FC = () => {
  const {
    members,
    cities,
    isLiveConnected,
    createMemberFromAdmin,
    updateMemberFromAdmin,
    deleteMemberFromAdmin,
    sendNotificationToMember,
    broadcastNotification,
    promptMemberChatFromAdmin,
  } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');

  // Create / Edit modal state
  const [editingMember, setEditingMember] = useState<(Partial<Member> & { password?: string }) | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionBanner, setActionBanner] = useState('');

  // Direct Notification modal state (Single Member)
  const [notifyTarget, setNotifyTarget] = useState<Member | null>(null);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');

  // Prompt Live Chat modal state (Single Member)
  const [chatTarget, setChatTarget] = useState<Member | null>(null);
  const [chatSubject, setChatSubject] = useState('Official Order Validation & Support');
  const [chatMessage, setChatMessage] = useState('');
  const [attachTemplateType, setAttachTemplateType] = useState<DocumentTemplateType | 'none'>('none');

  // General Broadcast Notification modal state (All / Filtered Members)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastCity, setBroadcastCity] = useState('all');
  const [broadcastSegment, setBroadcastSegment] = useState('all');

  const availableSegments = [
    { id: 'rebel_family', label: 'Rebel Family Core' },
    { id: 'city_fan', label: 'City Concert Fan' },
    { id: 'new_listener', label: 'New Listener' },
    { id: 'press', label: 'Press / Media' },
    { id: 'venue_contact', label: 'Venue / Promoter' },
    { id: 'brand_partner', label: 'Brand Partner' },
  ];

  const availableRoles: { value: UserRole; label: string }[] = [
    { value: 'member', label: 'Member (Standard Fan)' },
    { value: 'fan_support', label: 'Fan Support Staff' },
    { value: 'tour_admin', label: 'Tour & Venue Admin' },
    { value: 'content_admin', label: 'Content & Copy Admin' },
    { value: 'partnerships', label: 'Partnerships Admin' },
    { value: 'super_admin', label: 'Super Admin' },
  ];

  const filteredMembers = members.filter((m) => {
    if (filterRole !== 'all' && (m.role || 'member') !== filterRole) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (filterCity !== 'all' && (m.cityId || '') !== filterCity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (m.displayName || '').toLowerCase().includes(q);
      const matchEmail = (m.email || '').toLowerCase().includes(q);
      const matchUid = (m.uid || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchUid) return false;
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingMember({
      displayName: '',
      email: '',
      password: '',
      role: 'member',
      cityId: cities[0]?.id || '',
      segments: ['rebel_family'],
      confirmed18Plus: true,
      language: 'en',
      notificationPrefs: {
        shows: true,
        presales: true,
        music: true,
        offers: true,
        messages: true,
      },
      status: 'active',
      adminNotes: '',
    });
    setIsCreating(true);
    setFormError('');
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember({ ...member });
    setIsCreating(false);
    setFormError('');
  };

  const toggleSegment = (segId: string) => {
    if (!editingMember) return;
    const current = editingMember.segments || [];
    const updated = current.includes(segId)
      ? current.filter((s) => s !== segId)
      : [...current, segId];
    setEditingMember({ ...editingMember, segments: updated });
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember?.displayName || !editingMember?.email) {
      setFormError('Display name and email address are required.');
      return;
    }

    try {
      if (isCreating) {
        await createMemberFromAdmin({
          displayName: editingMember.displayName,
          email: editingMember.email,
          password: editingMember.password || 'BeastMode2026!',
          role: editingMember.role || 'member',
          cityId: editingMember.cityId || undefined,
          segments: editingMember.segments || ['rebel_family'],
          confirmed18Plus: editingMember.confirmed18Plus ?? true,
          confirmed18PlusAt: new Date().toISOString(),
          language: editingMember.language || 'en',
          notificationPrefs: editingMember.notificationPrefs || {
            shows: true,
            presales: true,
            music: true,
            offers: false,
            messages: true,
          },
          status: editingMember.status || 'active',
          adminNotes: editingMember.adminNotes || '',
        });
        setActionBanner(`Created new account for ${editingMember.displayName} (${editingMember.email}).`);
      } else if (editingMember.uid) {
        const { uid, ...updates } = editingMember;
        await updateMemberFromAdmin(uid, updates);
        setActionBanner(`Updated account ${editingMember.displayName}.`);
      }
      setEditingMember(null);
      setIsCreating(false);
      setTimeout(() => setActionBanner(''), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Could not save member account.');
    }
  };

  const handleQuickStatusChange = async (member: Member, newStatus: Member['status']) => {
    await updateMemberFromAdmin(member.uid, { status: newStatus });
    setActionBanner(`Changed status for ${member.displayName} to ${newStatus.toUpperCase()}.`);
    setTimeout(() => setActionBanner(''), 3500);
  };

  const handleDeleteMember = async (member: Member) => {
    await deleteMemberFromAdmin(member.uid);
    setActionBanner(`Removed account ${member.displayName} (${member.email}).`);
    setTimeout(() => setActionBanner(''), 3500);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyTarget || !notifyTitle.trim() || !notifyBody.trim()) return;
    await sendNotificationToMember(
      notifyTarget.uid,
      notifyTitle.trim(),
      notifyBody.trim(),
      'news',
      '/account'
    );
    setActionBanner(`Sent real-time notification to ${notifyTarget.displayName}.`);
    setNotifyTarget(null);
    setNotifyTitle('');
    setNotifyBody('');
    setTimeout(() => setActionBanner(''), 3500);
  };

  const handlePromptLiveChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatTarget || !chatMessage.trim()) return;

    const docAttachment =
      attachTemplateType !== 'none'
        ? buildTemplateDocument(attachTemplateType, chatTarget.displayName, chatTarget.email || '')
        : undefined;

    await promptMemberChatFromAdmin(chatTarget, chatMessage.trim(), chatSubject.trim(), {
      documentAttachment: docAttachment,
    });

    setActionBanner(
      `Prompted live chat thread with ${chatTarget.displayName}${
        docAttachment ? ` and attached ${docAttachment.title}` : ''
      }.`
    );
    setChatTarget(null);
    setChatMessage('');
    setAttachTemplateType('none');
    setTimeout(() => setActionBanner(''), 4000);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    const count = await broadcastNotification(broadcastTitle.trim(), broadcastBody.trim(), {
      cityId: broadcastCity,
      segment: broadcastSegment,
    });
    setActionBanner(`Broadcasted general notification to ${count} active member accounts in real time.`);
    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastBody('');
    setTimeout(() => setActionBanner(''), 4000);
  };

  const handleExportCSV = () => {
    const headers = ['UID', 'DisplayName', 'Email', 'Role', 'Status', 'City', 'Segments', '18Plus', 'CreatedAt'];
    const rows = filteredMembers.map((m) => {
      const city = cities.find((c) => c.id === m.cityId);
      return [
        `"${m.uid}"`,
        `"${(m.displayName || '').replace(/"/g, '""')}"`,
        `"${m.email || ''}"`,
        `"${m.role || 'member'}"`,
        `"${m.status}"`,
        `"${city ? `${city.name}, ${city.state}` : 'National'}"`,
        `"${(m.segments || []).join('; ')}"`,
        m.confirmed18Plus ? 'YES' : 'NO',
        `"${m.createdAt || ''}"`,
      ];
    });
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `anthony-beastmode-members-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2A2E3D] pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white">Real-Time User &amp; Account Management</h1>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{isLiveConnected ? 'LIVE SYNC' : 'ONLINE'}</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Automatically catches every account registered globally. Prompt live chats, issue order invoices, or dispatch targeted/general notifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-3 py-2 text-xs font-bold rounded-md border border-amber-500/40 bg-[#1F222E] text-amber-400 hover:bg-[#2A2E3D] transition-colors flex items-center space-x-1.5"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Send General Notification</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold rounded-md border border-[#2A2E3D] bg-[#1F222E] text-gray-200 hover:border-amber-500 transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV ({filteredMembers.length})</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-bold rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>
        </div>
      </div>

      {actionBanner && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionBanner}</span>
        </div>
      )}

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[#2A2E3D] bg-[#14161D]">
          <span className="text-[10px] uppercase font-mono text-gray-400">Total Accounts</span>
          <div className="text-2xl font-black text-white font-mono mt-0.5">{members.length}</div>
        </div>
        <div className="p-4 rounded-xl border border-[#2A2E3D] bg-[#14161D]">
          <span className="text-[10px] uppercase font-mono text-gray-400">Active Members</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
            {members.filter((m) => m.status === 'active').length}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[#2A2E3D] bg-[#14161D]">
          <span className="text-[10px] uppercase font-mono text-gray-400">18+ Confirmed</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
            {members.filter((m) => m.confirmed18Plus).length}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[#2A2E3D] bg-[#14161D]">
          <span className="text-[10px] uppercase font-mono text-gray-400">Staff / Admins</span>
          <div className="text-2xl font-black text-purple-400 font-mono mt-0.5">
            {members.filter((m) => m.role && m.role !== 'member').length}
          </div>
        </div>
      </div>

      {/* General Broadcast Notification Modal */}
      {showBroadcastModal && (
        <div className="p-5 rounded-xl border border-amber-500/40 bg-[#14161D] space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-[#2A2E3D] pb-2">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold uppercase tracking-wider text-amber-400">
                Broadcast General In-App Notification to Members
              </h3>
            </div>
            <button onClick={() => setShowBroadcastModal(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-gray-400">Target City Filter</label>
                <select
                  value={broadcastCity}
                  onChange={(e) => setBroadcastCity(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                >
                  <option value="all">All Active Members Nationwide</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.state} Members Only
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-gray-400">Target Fan Segment Filter</label>
                <select
                  value={broadcastSegment}
                  onChange={(e) => setBroadcastSegment(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                >
                  <option value="all">All Fan Segments</option>
                  {availableSegments.map((seg) => (
                    <option key={seg.id} value={seg.id}>
                      {seg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <input
              type="text"
              required
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="Broadcast Headline (e.g. Official Autumn Tour Presale & Merch Drop Live)"
              className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
            />
            <textarea
              rows={2}
              required
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              placeholder="Enter general announcement message delivered immediately to all matching member accounts..."
              className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="px-3 py-1.5 rounded border border-[#2A2E3D] text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 flex items-center space-x-1"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Dispatch General Notification</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prompt Live Chat Modal for Individual Member */}
      {chatTarget && (
        <div className="p-5 rounded-xl border border-amber-500/40 bg-[#14161D] space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-[#2A2E3D] pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold uppercase tracking-wider text-amber-400">
                Prompt Live Chat with {chatTarget.displayName} ({chatTarget.email})
              </h3>
            </div>
            <button onClick={() => setChatTarget(null)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handlePromptLiveChat} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-gray-400">Conversation Subject *</label>
                <input
                  type="text"
                  required
                  value={chatSubject}
                  onChange={(e) => setChatSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400">Optional Pre-Filled Invoice / Receipt Attachment</label>
                <select
                  value={attachTemplateType}
                  onChange={(e) => setAttachTemplateType(e.target.value as DocumentTemplateType | 'none')}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-amber-400 font-semibold"
                >
                  <option value="none">No document attachment (Message only)</option>
                  <option value="merch_invoice">Attach Official Merchandise Invoice &amp; Receipt</option>
                  <option value="ticket_invoice">Attach Official Tour Ticket / VIP Pass Invoice</option>
                  <option value="booking_invoice">Attach Official Venue Booking Invoice</option>
                  <option value="order_receipt">Attach Official Order Validation Receipt</option>
                </select>
              </div>
            </div>
            <textarea
              rows={2}
              required
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your opening message to prompt a live chat with this member..."
              className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setChatTarget(null)}
                className="px-3 py-1.5 rounded border border-[#2A2E3D] text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Start Live Chat &amp; Send</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Direct Notification Modal */}
      {notifyTarget && (
        <div className="p-5 rounded-xl border border-amber-500/40 bg-[#14161D] space-y-4">
          <div className="flex justify-between items-center border-b border-[#2A2E3D] pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Send Direct In-App Alert to {notifyTarget.displayName} ({notifyTarget.email})
            </h3>
            <button onClick={() => setNotifyTarget(null)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSendNotification} className="space-y-3 text-xs">
            <input
              type="text"
              required
              value={notifyTitle}
              onChange={(e) => setNotifyTitle(e.target.value)}
              placeholder="Notification Headline (e.g. Order Validated / Kansas City Presale Access)"
              className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
            />
            <textarea
              rows={2}
              required
              value={notifyBody}
              onChange={(e) => setNotifyBody(e.target.value)}
              placeholder="Message body delivered in real time to member's account dashboard..."
              className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNotifyTarget(null)}
                className="px-3 py-1.5 rounded border border-[#2A2E3D] text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 flex items-center space-x-1"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Dispatch Alert</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create / Edit Account Drawer */}
      {editingMember && (
        <div className="p-6 rounded-xl border border-amber-500/40 bg-[#14161D] space-y-4">
          <div className="flex justify-between items-center border-b border-[#2A2E3D] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {isCreating ? 'Create New Account in Database' : `Manage Account: ${editingMember.displayName}`}
            </h2>
            <button
              onClick={() => {
                setEditingMember(null);
                setIsCreating(false);
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400">Full Name / Display Name *</label>
                <input
                  type="text"
                  required
                  value={editingMember.displayName || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, displayName: e.target.value })}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingMember.email || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">
                  {isCreating ? 'Account Password *' : 'Reset Password (Optional)'}
                </label>
                <input
                  type="text"
                  required={isCreating}
                  value={editingMember.password || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, password: e.target.value })}
                  placeholder={isCreating ? 'Temporary or initial password' : 'Leave blank to keep current'}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">System Role (RBAC)</label>
                <select
                  value={editingMember.role || 'member'}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  {availableRoles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Account Status</label>
                <select
                  value={editingMember.status || 'active'}
                  onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as Member['status'] })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="removed">Removed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Assigned Tour City Hub</label>
                <select
                  value={editingMember.cityId || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, cityId: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">National (All Cities)</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.state} (Tier {c.priorityTier})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Segments */}
            <div className="space-y-1.5">
              <label className="text-gray-400 block">Member Segments</label>
              <div className="flex flex-wrap gap-1.5">
                {availableSegments.map((seg) => {
                  const selected = (editingMember.segments || []).includes(seg.id);
                  return (
                    <button
                      type="button"
                      key={seg.id}
                      onClick={() => toggleSegment(seg.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                        selected
                          ? 'bg-amber-500 text-black border-amber-500 font-bold'
                          : 'bg-[#1F222E] text-gray-300 border-[#2A2E3D] hover:border-gray-500'
                      }`}
                    >
                      {selected && '✓ '}
                      {seg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Internal Admin Notes on Member */}
            <div className="space-y-1">
              <label className="text-gray-400">Internal Admin Notes (Private to Staff)</label>
              <input
                type="text"
                value={editingMember.adminNotes || ''}
                onChange={(e) => setEditingMember({ ...editingMember, adminNotes: e.target.value })}
                placeholder="VIP meetup guest, local promoter contact, etc."
                className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2A2E3D]">
              <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingMember.confirmed18Plus || false}
                  onChange={(e) => setEditingMember({ ...editingMember, confirmed18Plus: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <span>18+ Explicit Content Gate Confirmed</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMember(null);
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
                  <span>{isCreating ? 'Create Account Now' : 'Save Account Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#14161D] border border-[#2A2E3D] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts by name, email, or UID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-2.5 py-2 rounded-md bg-[#1F222E] border border-[#2A2E3D] text-gray-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Roles</option>
            {availableRoles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-2 rounded-md bg-[#1F222E] border border-[#2A2E3D] text-gray-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="removed">Removed</option>
          </select>

          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-2.5 py-2 rounded-md bg-[#1F222E] border border-[#2A2E3D] text-gray-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}, {c.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-Time Accounts Table */}
      <div className="rounded-xl border border-[#2A2E3D] bg-[#14161D] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1F222E] border-b border-[#2A2E3D] text-gray-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3">Account / Identity</th>
              <th className="p-3">Role &amp; Status</th>
              <th className="p-3">City Hub</th>
              <th className="p-3">Segments</th>
              <th className="p-3">Created</th>
              <th className="p-3 text-right">Chat, Alerts &amp; Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2E3D]">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const city = cities.find((c) => c.id === member.cityId);
                return (
                  <tr key={member.uid} className="hover:bg-[#1F222E]/60 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <span>{member.displayName}</span>
                        {member.confirmed18Plus && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            18+
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">{member.email || 'No email'}</div>
                      <div className="text-[10px] text-gray-500 font-mono">UID: {member.uid}</div>
                      {member.adminNotes && (
                        <div className="text-[10px] text-amber-400/90 mt-0.5 italic">
                          Note: {member.adminNotes}
                        </div>
                      )}
                    </td>

                    <td className="p-3 space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#1F222E] text-amber-400 border border-[#2A2E3D]">
                        {(member.role || 'member').replace('_', ' ')}
                      </span>
                      <div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            member.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : member.status === 'suspended'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-gray-300">
                      {city ? (
                        <span>
                          {city.name}, {city.state}
                        </span>
                      ) : (
                        <span className="text-gray-500">National</span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {(member.segments || []).map((seg) => (
                          <span
                            key={seg}
                            className="px-1.5 py-0.5 rounded bg-[#1F222E] text-gray-300 text-[10px] font-mono"
                          >
                            {seg}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3 font-mono text-[11px] text-gray-400">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Active'}
                      {member.lastLoginAt && (
                        <span className="block text-[9px] text-emerald-400">
                          Seen {new Date(member.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setChatTarget(member);
                            setChatSubject('Official Order Validation & Support');
                            setChatMessage('');
                            setAttachTemplateType('none');
                          }}
                          title="Prompt a live chat or send invoice/receipt to this member"
                          className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-semibold flex items-center space-x-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </button>
                        <button
                          onClick={() => setNotifyTarget(member)}
                          title="Send direct in-app notification to this member"
                          className="px-2 py-1 rounded bg-[#1F222E] hover:bg-[#2A2E3D] border border-[#2A2E3D] text-gray-200 font-semibold flex items-center space-x-1"
                        >
                          <Bell className="w-3 h-3 text-amber-400" />
                          <span>Notify</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="px-2.5 py-1 rounded bg-[#1F222E] hover:bg-[#2A2E3D] text-gray-200 font-semibold flex items-center space-x-1"
                        >
                          <Edit className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>
                        {member.status === 'active' ? (
                          <button
                            onClick={() => handleQuickStatusChange(member, 'suspended')}
                            title="Suspend account"
                            className="p-1.5 rounded bg-[#1F222E] hover:bg-amber-950/50 text-gray-400 hover:text-amber-400"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickStatusChange(member, 'active')}
                            title="Reactivate account"
                            className="p-1.5 rounded bg-[#1F222E] hover:bg-emerald-950/50 text-gray-400 hover:text-emerald-400"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMember(member)}
                          title="Delete account"
                          className="p-1.5 rounded bg-[#1F222E] hover:bg-red-950/50 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No accounts match the current search filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
