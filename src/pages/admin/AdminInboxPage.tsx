import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Download,
  FileCheck,
  FilePlus2,
  Image as ImageIcon,
  Inbox,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  Trash2,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Inquiry,
  InquiryStatus,
  Conversation,
  Message,
  ChatDocumentAttachment,
  ChatMediaAttachment,
  DocumentTemplateType,
  ChatDocumentLineItem,
} from '../../types/database';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ChatDocumentCard, downloadOfficialDocument } from '../../components/chat/ChatDocumentCard';

export const buildTemplateDocument = (
  templateType: DocumentTemplateType,
  recipientName: string,
  recipientEmail: string
): ChatDocumentAttachment => {
  const today = new Date().toISOString().split('T')[0];
  const randCode = Math.random().toString(36).substring(2, 7).toUpperCase();

  if (templateType === 'merch_invoice') {
    return {
      docType: 'merch_invoice',
      title: 'Official Merchandise Order Invoice & Receipt',
      referenceNumber: `INV-MERCH-${randCode}`,
      issueDate: today,
      recipientName: recipientName || 'Valued Fan Member',
      recipientEmail: recipientEmail || 'member@example.com',
      statusLabel: 'PAID & VERIFIED',
      items: [
        {
          description: 'Trailer Park Baby Heavyweight Tour Tee (Official Apparel)',
          quantity: 1,
          unitPrice: '$35.00',
          total: '$35.00',
        },
        {
          description: 'Outlaw Country Roads Embroidered Trucker Hat',
          quantity: 1,
          unitPrice: '$28.00',
          total: '$28.00',
        },
      ],
      subtotal: '$63.00',
      feesOrTax: '$5.00',
      totalAmount: '$68.00',
      verificationCode: `BM-MERCH-${randCode}`,
      notes: 'Official merchandise order verified by Anthony BeastMode Management. Approved for fulfillment.',
    };
  }

  if (templateType === 'ticket_invoice') {
    return {
      docType: 'ticket_invoice',
      title: 'Official Tour Ticket & VIP Pass Invoice',
      referenceNumber: `INV-TIX-${randCode}`,
      issueDate: today,
      recipientName: recipientName || 'Valued Fan Member',
      recipientEmail: recipientEmail || 'member@example.com',
      statusLabel: 'PAID & VERIFIED',
      items: [
        {
          description: 'General Admission Concert Pass - Autumn 2026 Tour',
          quantity: 2,
          unitPrice: '$25.00',
          total: '$50.00',
        },
        {
          description: 'Pre-Show VIP Meet & Greet Laminate Upgrade',
          quantity: 1,
          unitPrice: '$65.00',
          total: '$65.00',
        },
      ],
      subtotal: '$115.00',
      feesOrTax: '$0.00',
      totalAmount: '$115.00',
      verificationCode: `BM-TIX-${randCode}`,
      notes: 'Verified tour admission & VIP credential allocation. Present this official receipt at venue box office.',
    };
  }

  if (templateType === 'booking_invoice') {
    return {
      docType: 'booking_invoice',
      title: 'Official Live Performance & Venue Booking Invoice',
      referenceNumber: `INV-BOOK-${randCode}`,
      issueDate: today,
      recipientName: recipientName || 'Venue Promoter / Talent Buyer',
      recipientEmail: recipientEmail || 'booking@venue.com',
      statusLabel: 'BOOKING CONFIRMED',
      items: [
        {
          description: 'Anthony BeastMode Headline Live Performance Guarantee (50% Deposit)',
          quantity: 1,
          unitPrice: '$2,500.00',
          total: '$2,500.00',
        },
        {
          description: 'Tour Production & Sound Engineering Package',
          quantity: 1,
          unitPrice: '$500.00',
          total: '$500.00',
        },
      ],
      subtotal: '$3,000.00',
      feesOrTax: '$0.00',
      totalAmount: '$3,000.00',
      verificationCode: `BM-BOOK-${randCode}`,
      notes: 'Authorized performance booking invoice issued by Anthony BeastMode Tour Management.',
    };
  }

  return {
    docType: 'order_receipt',
    title: 'Official Order Validation & Payment Receipt',
    referenceNumber: `REC-VAL-${randCode}`,
    issueDate: today,
    recipientName: recipientName || 'Valued Fan Member',
    recipientEmail: recipientEmail || 'member@example.com',
    statusLabel: 'ORDER VALIDATED',
    items: [
      {
        description: 'Validated Fan Club Member Order & Exclusive Package',
        quantity: 1,
        unitPrice: '$50.00',
        total: '$50.00',
      },
    ],
    subtotal: '$50.00',
    feesOrTax: '$0.00',
    totalAmount: '$50.00',
    verificationCode: `BM-VAL-${randCode}`,
    notes: 'This receipt confirms your order has been reviewed and validated by official management.',
  };
};

export const AdminInboxPage: React.FC = () => {
  const {
    inquiries,
    updateInquiryStatus,
    deleteInquiry,
    conversations,
    sendAdminChatMessage,
    promptMemberChatFromAdmin,
    updateConversationStatus,
    members,
  } = useDatabase();

  const [activeMode, setActiveMode] = useState<'chat' | 'inquiries'>('chat');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [internalNoteText, setInternalNoteText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fans' | 'press' | 'booking'>('all');

  // Live Member Chat State
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [convoMessages, setConvoMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'requested'>('all');

  // Prompt New Chat Modal State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [targetMemberUid, setTargetMemberUid] = useState('');
  const [newChatSubject, setNewChatSubject] = useState('Official Order Validation & Support');
  const [newChatInitialMsg, setNewChatInitialMsg] = useState('');

  // Media Attachment State in Chat
  const [pendingMedia, setPendingMedia] = useState<ChatMediaAttachment | null>(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [showMediaBar, setShowMediaBar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Templated Invoice / Receipt Builder State
  const [showDocBuilder, setShowDocBuilder] = useState(false);
  const [docDraft, setDocDraft] = useState<ChatDocumentAttachment | null>(null);
  const [docCompanionText, setDocCompanionText] = useState(
    'Please find your official validated invoice/receipt attached below. You may download a copy directly for your records.'
  );

  useEffect(() => {
    if (!selectedConvo) {
      setConvoMessages([]);
      return;
    }
    const q = query(collection(db, 'conversations', selectedConvo.id, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs = snap.docs.map((d) => ({ ...(d.data() as Message), id: d.id }));
        setConvoMessages(msgs);
      },
      () => {}
    );
    return () => unsub();
  }, [selectedConvo]);

  const filteredInquiries = inquiries.filter((i) => {
    if (selectedCategory === 'all') return true;
    return i.category === selectedCategory;
  });

  const filteredConversations = conversations.filter((c) => {
    if (chatFilter === 'requested') {
      return c.requestedByMember !== false;
    }
    return true;
  });

  const pipelineStages: InquiryStatus[] = ['new', 'contacted', 'hold', 'offer_sent', 'booked', 'declined', 'closed'];

  const handleUpdateStatus = async (status: InquiryStatus) => {
    if (!selectedInquiry) return;
    await updateInquiryStatus(selectedInquiry.id, status, internalNoteText || selectedInquiry.internalNotes);
    setSelectedInquiry({ ...selectedInquiry, status, internalNotes: internalNoteText || selectedInquiry.internalNotes });
    setInternalNoteText('');
  };

  const handleSaveInternalNote = async () => {
    if (!selectedInquiry || !internalNoteText.trim()) return;
    await updateInquiryStatus(selectedInquiry.id, selectedInquiry.status, internalNoteText);
    setSelectedInquiry({ ...selectedInquiry, internalNotes: internalNoteText });
    setInternalNoteText('');
  };

  const handleDeleteInquiry = async (id: string) => {
    await deleteInquiry(id);
    if (selectedInquiry?.id === id) setSelectedInquiry(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPendingMedia({
          url: reader.result,
          name: file.name,
          mimeType: file.type || 'image/png',
        });
        setShowMediaBar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAttachExternalMedia = () => {
    if (!mediaUrlInput.trim()) return;
    setPendingMedia({
      url: mediaUrlInput.trim(),
      name: 'Attached Media File',
      mimeType: 'image/jpeg',
    });
    setMediaUrlInput('');
    setShowMediaBar(false);
  };

  const handleOpenTemplateBuilder = (
    templateType: DocumentTemplateType,
    overrideName?: string,
    overrideEmail?: string
  ) => {
    const member = selectedConvo ? members.find((m) => m.uid === selectedConvo.memberUid) : null;
    const recName =
      overrideName ||
      member?.displayName ||
      selectedConvo?.memberName ||
      selectedInquiry?.name ||
      'Valued Member';
    const recEmail =
      overrideEmail ||
      member?.email ||
      selectedConvo?.memberEmail ||
      selectedInquiry?.email ||
      'member@example.com';

    setDocDraft(buildTemplateDocument(templateType, recName, recEmail));
    setShowDocBuilder(true);
  };

  const handleSendDocumentToChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docDraft || !selectedConvo) return;
    setSendingReply(true);
    try {
      await sendAdminChatMessage(selectedConvo.id, docCompanionText || `Issued ${docDraft.title}`, {
        documentAttachment: docDraft,
      });
      setShowDocBuilder(false);
      setDocDraft(null);
    } finally {
      setSendingReply(false);
    }
  };

  const handleSendChatReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvo || (!replyText.trim() && !pendingMedia)) return;
    setSendingReply(true);
    try {
      await sendAdminChatMessage(
        selectedConvo.id,
        replyText.trim() || (pendingMedia ? `Attached media: ${pendingMedia.name}` : ''),
        {
          mediaAttachment: pendingMedia || undefined,
        }
      );
      setReplyText('');
      setPendingMedia(null);
    } finally {
      setSendingReply(false);
    }
  };

  const handleStartNewMemberChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find((m) => m.uid === targetMemberUid);
    if (!targetMember || !newChatInitialMsg.trim()) return;
    setSendingReply(true);
    try {
      const convId = await promptMemberChatFromAdmin(
        targetMember,
        newChatInitialMsg.trim(),
        newChatSubject.trim() || 'Official Management Support'
      );
      setShowNewChatModal(false);
      setNewChatInitialMsg('');
      const found = conversations.find((c) => c.id === convId);
      if (found) setSelectedConvo(found);
    } finally {
      setSendingReply(false);
    }
  };

  const updateLineItem = (idx: number, field: keyof ChatDocumentLineItem, val: string | number) => {
    if (!docDraft) return;
    const nextItems = [...docDraft.items];
    nextItems[idx] = { ...nextItems[idx], [field]: val };
    setDocDraft({ ...docDraft, items: nextItems });
  };

  const addLineItem = () => {
    if (!docDraft) return;
    setDocDraft({
      ...docDraft,
      items: [
        ...docDraft.items,
        { description: 'Additional Verified Item', quantity: 1, unitPrice: '$25.00', total: '$25.00' },
      ],
    });
  };

  const removeLineItem = (idx: number) => {
    if (!docDraft || docDraft.items.length <= 1) return;
    setDocDraft({
      ...docDraft,
      items: docDraft.items.filter((_, i) => i !== idx),
    });
  };

  const cannedReplies = [
    'Thank you for reaching out to Anthony BeastMode fan support. We have verified your request and routed it to local tour coordination.',
    'Thank you for the venue booking inquiry. Please provide your hold date, room capacity, and production specs for review by tour management.',
    'Press credentials request acknowledged. High-res photo assets and approved bio are accessible directly in our digital EPK at /media/press-kit.',
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E3D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">
            Live Member Chats, Order Invoices &amp; Booking Pipeline
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Validate orders with templated invoices &amp; receipts, upload media in real-time chat, or prompt a chat with any user.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMode('chat')}
            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeMode === 'chat'
                ? 'bg-amber-500 text-black'
                : 'bg-[#14161D] text-gray-300 border border-[#2A2E3D] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Member Chats ({conversations.length})</span>
          </button>
          <button
            onClick={() => setActiveMode('inquiries')}
            className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeMode === 'inquiries'
                ? 'bg-amber-500 text-black'
                : 'bg-[#14161D] text-gray-300 border border-[#2A2E3D] hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inquiries &amp; Booking ({inquiries.length})</span>
          </button>
        </div>
      </div>

      {/* Prompt New Chat Modal */}
      {showNewChatModal && (
        <div className="p-5 rounded-xl border border-amber-500/40 bg-[#14161D] space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#2A2E3D] pb-2">
            <h3 className="font-bold uppercase tracking-wider text-amber-400">
              Prompt New Live Chat with Registered Member
            </h3>
            <button onClick={() => setShowNewChatModal(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleStartNewMemberChat} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-gray-400">Select Member Account *</label>
                <select
                  required
                  value={targetMemberUid}
                  onChange={(e) => setTargetMemberUid(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                >
                  <option value="">-- Choose a registered user --</option>
                  {members.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {m.displayName} ({m.email || m.uid})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-gray-400">Conversation Subject *</label>
                <input
                  type="text"
                  required
                  value={newChatSubject}
                  onChange={(e) => setNewChatSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-gray-400">Opening Message to Member *</label>
              <textarea
                rows={2}
                required
                value={newChatInitialMsg}
                onChange={(e) => setNewChatInitialMsg(e.target.value)}
                placeholder="Hello! We are reaching out from Anthony BeastMode Management regarding your order validation..."
                className="w-full p-3 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="px-3 py-1.5 rounded border border-[#2A2E3D] text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingReply}
                className="px-4 py-1.5 rounded bg-amber-500 text-black font-bold hover:bg-amber-400"
              >
                Prompt Live Chat Now
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templated Invoice / Receipt Builder Modal */}
      {showDocBuilder && docDraft && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-amber-500/40 rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-[#2A2E3D] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                  OFFICIAL ORDER &amp; BOOKING VALIDATION GENERATOR
                </span>
                <h2 className="text-base font-bold text-white">{docDraft.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDocBuilder(false);
                  setDocDraft(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Template Switcher */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'merch_invoice', label: 'Merchandise Invoice' },
                  { id: 'ticket_invoice', label: 'Ticket / VIP Invoice' },
                  { id: 'booking_invoice', label: 'Venue Booking Invoice' },
                  { id: 'order_receipt', label: 'Order Validation Receipt' },
                ] as const
              ).map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() =>
                    setDocDraft(
                      buildTemplateDocument(tpl.id, docDraft.recipientName, docDraft.recipientEmail)
                    )
                  }
                  className={`px-3 py-1.5 rounded font-mono text-[11px] font-bold border transition-colors ${
                    docDraft.docType === tpl.id
                      ? 'bg-amber-500 text-black border-amber-500'
                      : 'bg-[#1F222E] text-gray-300 border-[#2A2E3D] hover:text-white'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendDocumentToChat} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={docDraft.title}
                    onChange={(e) => setDocDraft({ ...docDraft, title: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Reference Number *</label>
                  <input
                    type="text"
                    required
                    value={docDraft.referenceNumber}
                    onChange={(e) => setDocDraft({ ...docDraft, referenceNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Validation Status Stamp</label>
                  <select
                    value={docDraft.statusLabel}
                    onChange={(e) =>
                      setDocDraft({
                        ...docDraft,
                        statusLabel: e.target.value as ChatDocumentAttachment['statusLabel'],
                      })
                    }
                    className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white font-bold"
                  >
                    <option value="PAID & VERIFIED">PAID &amp; VERIFIED</option>
                    <option value="ORDER VALIDATED">ORDER VALIDATED</option>
                    <option value="BOOKING CONFIRMED">BOOKING CONFIRMED</option>
                    <option value="ISSUED / DUE">ISSUED / DUE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={docDraft.recipientName}
                    onChange={(e) => setDocDraft({ ...docDraft, recipientName: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Recipient Email *</label>
                  <input
                    type="email"
                    required
                    value={docDraft.recipientEmail}
                    onChange={(e) => setDocDraft({ ...docDraft, recipientEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Issue Date</label>
                  <input
                    type="date"
                    value={docDraft.issueDate}
                    onChange={(e) => setDocDraft({ ...docDraft, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                  />
                </div>
              </div>

              {/* Line Items Editor */}
              <div className="space-y-2 border-t border-[#2A2E3D] pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase text-amber-400">
                    Validated Order / Booking Line Items
                  </label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="px-2.5 py-1 rounded bg-[#1F222E] border border-[#2A2E3D] text-gray-200 hover:border-amber-500 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-amber-400" /> Add Line Item
                  </button>
                </div>

                {docDraft.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                        placeholder="Item description"
                        className="w-full px-2.5 py-1.5 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value))}
                        placeholder="Qty"
                        className="w-full px-2.5 py-1.5 rounded bg-[#1F222E] border border-[#2A2E3D] text-white text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(idx, 'unitPrice', e.target.value)}
                        placeholder="$35.00"
                        className="w-full px-2.5 py-1.5 rounded bg-[#1F222E] border border-[#2A2E3D] text-white font-mono"
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-1">
                      <input
                        type="text"
                        value={item.total}
                        onChange={(e) => updateLineItem(idx, 'total', e.target.value)}
                        placeholder="$35.00"
                        className="w-full px-2.5 py-1.5 rounded bg-[#1F222E] border border-[#2A2E3D] text-amber-400 font-mono font-bold"
                      />
                      {docDraft.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          className="p-1 text-gray-500 hover:text-red-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[#2A2E3D]">
                <div className="space-y-1">
                  <label className="text-gray-400">Subtotal</label>
                  <input
                    type="text"
                    value={docDraft.subtotal}
                    onChange={(e) => setDocDraft({ ...docDraft, subtotal: e.target.value })}
                    className="w-full px-3 py-1.5 rounded bg-[#1F222E] border border-[#2A2E3D] text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Fees / Tax</label>
                  <input
                    type="text"
                    value={docDraft.feesOrTax}
                    onChange={(e) => setDocDraft({ ...docDraft, feesOrTax: e.target.value })}
                    className="w-full px-3 py-1.5 rounded bg-[#1F222E] border border-[#2A2E3D] text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-amber-400 font-bold">Total Verified Amount</label>
                  <input
                    type="text"
                    value={docDraft.totalAmount}
                    onChange={(e) => setDocDraft({ ...docDraft, totalAmount: e.target.value })}
                    className="w-full px-3 py-1.5 rounded bg-[#1F222E] border border-amber-500/50 text-amber-400 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Verification Token</label>
                  <input
                    type="text"
                    value={docDraft.verificationCode}
                    onChange={(e) => setDocDraft({ ...docDraft, verificationCode: e.target.value })}
                    className="w-full px-3 py-1.5 rounded bg-[#1F222E] border border-[#2A2E3D] text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Official Notes / Fulfillment Instructions</label>
                <input
                  type="text"
                  value={docDraft.notes || ''}
                  onChange={(e) => setDocDraft({ ...docDraft, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                />
              </div>

              {selectedConvo && (
                <div className="space-y-1">
                  <label className="text-gray-400">Accompanying Chat Message</label>
                  <input
                    type="text"
                    value={docCompanionText}
                    onChange={(e) => setDocCompanionText(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#1F222E] border border-[#2A2E3D] text-white"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-[#2A2E3D] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => downloadOfficialDocument(docDraft)}
                  className="px-4 py-2 rounded bg-[#1F222E] border border-amber-500/40 text-amber-400 hover:bg-[#2A2E3D] font-bold flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official Copy Now</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDocBuilder(false);
                      setDocDraft(null);
                    }}
                    className="px-4 py-2 rounded border border-[#2A2E3D] text-gray-400"
                  >
                    Close
                  </button>
                  {selectedConvo && (
                    <button
                      type="submit"
                      disabled={sendingReply}
                      className="px-5 py-2 rounded bg-amber-500 text-black font-bold hover:bg-amber-400 flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Official Document to User Chat</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeMode === 'chat' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Live Conversations List */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex rounded-md overflow-hidden border border-[#2A2E3D] text-[11px]">
                <button
                  onClick={() => setChatFilter('all')}
                  className={`px-2.5 py-1.5 font-semibold ${
                    chatFilter === 'all' ? 'bg-amber-500 text-black' : 'bg-[#14161D] text-gray-300'
                  }`}
                >
                  All Chats ({conversations.length})
                </button>
                <button
                  onClick={() => setChatFilter('requested')}
                  className={`px-2.5 py-1.5 font-semibold ${
                    chatFilter === 'requested' ? 'bg-amber-500 text-black' : 'bg-[#14161D] text-gray-300'
                  }`}
                >
                  User Requested
                </button>
              </div>

              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-3 py-1.5 rounded-md bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Prompt Chat</span>
              </button>
            </div>

            <div className="rounded-xl border border-[#2A2E3D] bg-[#14161D] divide-y divide-[#2A2E3D] overflow-hidden">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((convo) => {
                  const member = members.find((m) => m.uid === convo.memberUid);
                  return (
                    <div
                      key={convo.id}
                      onClick={() => setSelectedConvo(convo)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedConvo?.id === convo.id ? 'bg-[#1F222E]' : 'hover:bg-[#1F222E]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold uppercase text-amber-400 font-mono truncate max-w-[160px]">
                          {convo.subject || 'Support Thread'}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono text-[10px] uppercase ${
                            convo.status === 'open'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : convo.status === 'waiting'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-[#0B0C10] text-gray-400'
                          }`}
                        >
                          {convo.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">
                        {member ? member.displayName : convo.memberName || convo.memberUid}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-mono truncate">
                        {member?.email || convo.memberEmail || ''}
                      </p>
                      {convo.lastMessage && (
                        <p className="text-xs text-gray-300 truncate mt-1">{convo.lastMessage}</p>
                      )}
                      <p className="text-[10px] text-gray-500 font-mono mt-1">
                        {new Date(convo.lastMessageAt || convo.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 space-y-2">
                  <p>No active live chat threads in this view.</p>
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="px-3 py-1.5 rounded bg-amber-500 text-black font-bold text-xs"
                  >
                    Prompt a Live Chat with a Member
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Conversation Messages, Media Upload & Invoice/Receipt Sender */}
          <div className="md:col-span-8">
            {selectedConvo ? (
              <div className="p-6 rounded-xl border border-[#2A2E3D] bg-[#14161D] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2E3D] pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400">
                      Live Member Support &amp; Order Validation &bull; {selectedConvo.subject}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {members.find((m) => m.uid === selectedConvo.memberUid)?.displayName ||
                        selectedConvo.memberName ||
                        selectedConvo.memberUid}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['open', 'waiting', 'closed'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          updateConversationStatus(selectedConvo.id, st);
                          setSelectedConvo({ ...selectedConvo, status: st });
                        }}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase ${
                          selectedConvo.status === st
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-[#1F222E] text-gray-300'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Invoice / Receipt / Validation Templates Bar */}
                <div className="p-3 rounded-lg bg-[#1F222E] border border-[#2A2E3D] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <FileCheck className="w-4 h-4" />
                    <span>Issue Official Document to User:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenTemplateBuilder('merch_invoice')}
                      className="px-2.5 py-1 rounded bg-[#14161D] hover:border-amber-500 border border-[#2A2E3D] text-[11px] text-white font-semibold"
                    >
                      + Merch Invoice
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenTemplateBuilder('ticket_invoice')}
                      className="px-2.5 py-1 rounded bg-[#14161D] hover:border-amber-500 border border-[#2A2E3D] text-[11px] text-white font-semibold"
                    >
                      + Ticket / VIP Invoice
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenTemplateBuilder('booking_invoice')}
                      className="px-2.5 py-1 rounded bg-[#14161D] hover:border-amber-500 border border-[#2A2E3D] text-[11px] text-white font-semibold"
                    >
                      + Booking Invoice
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenTemplateBuilder('order_receipt')}
                      className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold"
                    >
                      + Order Receipt
                    </button>
                  </div>
                </div>

                {/* Message History Stream */}
                <div className="space-y-3 max-h-96 overflow-y-auto p-4 rounded-lg bg-[#0B0C10] border border-[#2A2E3D]">
                  {convoMessages.length > 0 ? (
                    convoMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg text-xs max-w-[88%] ${
                          msg.senderRole === 'team'
                            ? 'ml-auto bg-amber-500/10 border border-amber-500/30 text-amber-50'
                            : 'bg-[#1F222E] border border-[#2A2E3D] text-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-gray-400 mb-1">
                          <span className="uppercase font-bold text-amber-400">
                            {msg.senderRole === 'team'
                              ? msg.senderName || 'Official Management'
                              : msg.senderName || 'Member'}
                          </span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{msg.body}</p>

                        {/* Media Attachment */}
                        {msg.mediaAttachment && (
                          <div className="mt-2 p-2 rounded bg-[#14161D] border border-[#2A2E3D] space-y-2">
                            {msg.mediaAttachment.mimeType.startsWith('image/') && (
                              <img
                                src={msg.mediaAttachment.url}
                                alt={msg.mediaAttachment.name}
                                className="max-h-56 rounded object-contain border border-[#2A2E3D]"
                              />
                            )}
                            <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                              <span className="text-gray-300 truncate">{msg.mediaAttachment.name}</span>
                              <a
                                href={msg.mediaAttachment.url}
                                download={msg.mediaAttachment.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded bg-amber-500 text-black font-bold flex items-center gap-1 shrink-0"
                              >
                                <Download className="w-3 h-3" /> Download Media
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Official Templated Invoice / Receipt Card */}
                        {msg.documentAttachment && (
                          <ChatDocumentCard docAttachment={msg.documentAttachment} />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-gray-500 py-8">No messages in this thread yet.</p>
                  )}
                </div>

                {/* Pending Media Preview */}
                {pendingMedia && (
                  <div className="p-2.5 rounded-lg bg-[#1F222E] border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-white font-semibold truncate">{pendingMedia.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">(Ready to send)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingMedia(null)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Media Upload Bar */}
                {showMediaBar && (
                  <div className="p-3 rounded-lg bg-[#1F222E] border border-[#2A2E3D] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-300">Attach Image or Document to Chat</span>
                      <button
                        type="button"
                        onClick={() => setShowMediaBar(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.html"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded bg-amber-500 text-black font-bold flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload File from Device
                      </button>
                      <div className="flex-1 flex gap-1.5">
                        <input
                          type="url"
                          value={mediaUrlInput}
                          onChange={(e) => setMediaUrlInput(e.target.value)}
                          placeholder="Or paste direct image/media URL..."
                          className="flex-1 px-3 py-1.5 rounded bg-[#14161D] border border-[#2A2E3D] text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAttachExternalMedia}
                          className="px-3 py-1.5 rounded bg-[#14161D] border border-[#2A2E3D] text-amber-400 font-bold"
                        >
                          Attach URL
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reply Input & Action Buttons */}
                <form onSubmit={handleSendChatReply} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaBar((prev) => !prev)}
                    title="Upload or attach media"
                    className="px-3 py-2 rounded-md bg-[#1F222E] border border-[#2A2E3D] text-gray-300 hover:border-amber-500 hover:text-amber-400 flex items-center gap-1 text-xs"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenTemplateBuilder('order_receipt')}
                    title="Create & attach official invoice or receipt"
                    className="px-3 py-2 rounded-md bg-[#1F222E] border border-[#2A2E3D] text-amber-400 hover:border-amber-500 flex items-center gap-1 text-xs font-bold shrink-0"
                  >
                    <FilePlus2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Template</span>
                  </button>
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type real-time management response to member..."
                    className="flex-1 px-3 py-2 rounded-md bg-[#1F222E] border border-[#2A2E3D] text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || (!replyText.trim() && !pendingMedia)}
                    className="px-4 py-2 rounded-md bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-12 text-center rounded-xl border border-[#2A2E3D] bg-[#14161D] text-xs text-gray-400 space-y-3">
                <p>Select a member conversation thread on the left to reply, upload media, or issue templated invoices &amp; receipts.</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2 rounded-md bg-amber-500 text-black font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Prompt New Live Chat with a Member
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 text-xs">
            {['all', 'fans', 'press', 'booking'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat as any);
                  setSelectedInquiry(null);
                }}
                className={`px-3 py-1.5 rounded-md capitalize font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#14161D] text-gray-300 border border-[#2A2E3D] hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Inquiries' : `${cat} Desk`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 rounded-xl border border-[#2A2E3D] bg-[#14161D] divide-y divide-[#2A2E3D] overflow-hidden">
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedInquiry?.id === inq.id ? 'bg-[#1F222E]' : 'hover:bg-[#1F222E]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold uppercase text-amber-400 font-mono">{inq.category}</span>
                      <span className="text-gray-400 font-mono text-[10px]">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{inq.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{inq.message}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2A2E3D]/50 text-[10px]">
                      <span className="text-gray-400">{inq.email}</span>
                      <span className="px-1.5 py-0.2 rounded font-mono uppercase bg-[#0B0C10] text-gray-300">
                        {inq.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400">No inquiries in this category queue.</div>
              )}
            </div>

            <div className="md:col-span-7">
              {selectedInquiry ? (
                <div className="p-6 rounded-xl border border-[#2A2E3D] bg-[#14161D] space-y-5">
                  <div className="flex justify-between items-start border-b border-[#2A2E3D] pb-3">
                    <div>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-amber-400 uppercase">
                        <span>{selectedInquiry.category} Inbound</span>
                        {selectedInquiry.city && <span>&bull; {selectedInquiry.city}</span>}
                      </div>
                      <h3 className="text-lg font-bold text-white">{selectedInquiry.name}</h3>
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="text-xs text-gray-400 hover:text-amber-400 underline"
                      >
                        {selectedInquiry.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenTemplateBuilder(
                            selectedInquiry.category === 'booking' ? 'booking_invoice' : 'order_receipt',
                            selectedInquiry.name,
                            selectedInquiry.email
                          )
                        }
                        className="px-2.5 py-1 rounded bg-amber-500 text-black font-bold text-[10px] flex items-center gap-1"
                      >
                        <FilePlus2 className="w-3 h-3" /> Generate Invoice / Receipt
                      </button>
                      <button
                        onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                        className="p-1.5 rounded bg-[#1F222E] text-gray-400 hover:text-red-400"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Update Pipeline Stage
                    </label>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {pipelineStages.map((stage) => (
                        <button
                          key={stage}
                          onClick={() => handleUpdateStatus(stage)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                            selectedInquiry.status === stage
                              ? 'bg-amber-500 text-black'
                              : 'bg-[#1F222E] text-gray-300 hover:bg-[#2A2E3D]'
                          }`}
                        >
                          {stage.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Inquiry Message Details
                    </label>
                    <div className="p-4 rounded-lg bg-[#1F222E] text-xs text-gray-200 leading-relaxed whitespace-pre-line border border-[#2A2E3D]">
                      {selectedInquiry.message}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#2A2E3D]">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Internal Staff Notes (Private / Never Visible to Member)
                      </label>
                      {selectedInquiry.internalNotes && (
                        <span className="text-[10px] text-gray-400 font-mono">Logged</span>
                      )}
                    </div>

                    {selectedInquiry.internalNotes && (
                      <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono">
                        {selectedInquiry.internalNotes}
                      </div>
                    )}

                    <div className="flex gap-2 text-xs">
                      <input
                        type="text"
                        value={internalNoteText}
                        onChange={(e) => setInternalNoteText(e.target.value)}
                        placeholder="Add private staff note or routing status..."
                        className="flex-1 px-3 py-1.5 rounded bg-[#1F222E] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={handleSaveInternalNote}
                        className="px-3 py-1.5 rounded bg-amber-500 text-black font-bold hover:bg-amber-400"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#2A2E3D]">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Approved Canned Responses
                    </label>
                    <div className="space-y-1.5">
                      {cannedReplies.map((reply, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded bg-[#1F222E] text-[11px] text-gray-300 leading-relaxed border border-[#2A2E3D] flex justify-between items-start gap-2"
                        >
                          <span>{reply}</span>
                          <a
                            href={`mailto:${selectedInquiry.email}?subject=RE: Anthony BeastMode Support&body=${encodeURIComponent(reply)}`}
                            className="px-2 py-1 rounded bg-amber-500 text-black font-bold text-[10px] shrink-0 hover:bg-amber-400"
                          >
                            Send
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-xl border border-[#2A2E3D] bg-[#14161D] text-xs text-gray-400">
                  Select an inquiry thread from the list on the left to inspect details, route replies, or generate a booking/order invoice.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
