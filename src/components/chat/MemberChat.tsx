import React, { useState, useEffect, useRef } from 'react';
import { Download, Image as ImageIcon, MessageSquare, Paperclip, Send, ShieldCheck, X } from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { ChatMediaAttachment, Conversation, Message } from '../../types/database';
import { ChatDocumentCard } from './ChatDocumentCard';

export const MemberChat: React.FC = () => {
  const { currentUser, memberProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [convId, setConvId] = useState<string | null>(null);
  const [convoMeta, setConvoMeta] = useState<Conversation | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Live Chat Request Form State (When member hasn't requested a live chat yet)
  const [requestTopic, setRequestTopic] = useState('Order / Merch Receipt Validation');
  const [requestInitialMessage, setRequestInitialMessage] = useState('');

  // Member Media Upload State
  const [pendingMedia, setPendingMedia] = useState<ChatMediaAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'conversations'),
      where('memberUid', '==', currentUser.uid)
    );

    let unsubMsgs: (() => void) | null = null;

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setConvId(docSnap.id);
        setConvoMeta({ id: docSnap.id, ...(docSnap.data() as Omit<Conversation, 'id'>) });

        if (unsubMsgs) unsubMsgs();
        const msgQuery = query(
          collection(db, 'conversations', docSnap.id, 'messages'),
          orderBy('createdAt', 'asc')
        );
        unsubMsgs = onSnapshot(msgQuery, (msgSnap) => {
          const list = msgSnap.docs
            .map((d) => ({ id: d.id, ...d.data() } as Message))
            .filter((m) => !m.hidden);
          setMessages(list);
        });
      } else {
        setConvId(null);
        setConvoMeta(null);
        setMessages([]);
      }
    });

    return () => {
      unsub();
      if (unsubMsgs) unsubMsgs();
    };
  }, [currentUser]);

  const handleRequestLiveChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !requestInitialMessage.trim()) return;

    setIsSending(true);
    try {
      const text = requestInitialMessage.trim();
      const newConv = await addDoc(collection(db, 'conversations'), {
        memberUid: currentUser.uid,
        memberName: memberProfile?.displayName || currentUser.displayName || 'Fan Member',
        memberEmail: currentUser.email || memberProfile?.email || '',
        subject: requestTopic,
        status: 'open',
        requestedByMember: true,
        initiatedByAdmin: false,
        cityId: memberProfile?.cityId || null,
        segmentSnapshot: memberProfile?.segments || [],
        lastMessage: text,
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      setConvId(newConv.id);
      await addDoc(collection(db, 'conversations', newConv.id, 'messages'), {
        senderUid: currentUser.uid,
        senderRole: 'member',
        senderName: memberProfile?.displayName || 'Member',
        body: text,
        createdAt: new Date().toISOString(),
      });
      setRequestInitialMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleMemberFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !pendingMedia) || !currentUser || !convId) return;

    const text = newMessage.trim() || (pendingMedia ? `Attached file: ${pendingMedia.name}` : '');
    setNewMessage('');
    setIsSending(true);

    try {
      await updateDoc(doc(db, 'conversations', convId), {
        lastMessage: text,
        lastMessageAt: new Date().toISOString(),
        status: 'open',
      });

      const payload: Record<string, any> = {
        senderUid: currentUser.uid,
        senderRole: 'member',
        senderName: memberProfile?.displayName || 'Member',
        body: text,
        createdAt: new Date().toISOString(),
      };
      if (pendingMedia) {
        payload.mediaAttachment = pendingMedia;
      }

      await addDoc(collection(db, 'conversations', convId, 'messages'), payload);
      setPendingMedia(null);
    } finally {
      setIsSending(false);
    }
  };

  // If no live chat has been requested by the user or prompted by Admin yet:
  if (!convId) {
    return (
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] block">
              OFFICIAL ARTIST MANAGEMENT DESK
            </span>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Request a Live Support &amp; Order Validation Chat
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Live chats are opened on request or when prompted by management to validate merchandise orders, tour tickets, or booking receipts.
            </p>
          </div>
          <MessageSquare className="w-7 h-7 text-[var(--accent)] shrink-0" />
        </div>

        <form onSubmit={handleRequestLiveChat} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-[var(--text-secondary)]">Select Live Chat Topic *</label>
            <select
              value={requestTopic}
              onChange={(e) => setRequestTopic(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="Order / Merch Receipt Validation">Order / Merch Receipt Validation</option>
              <option value="Tour Ticket & VIP Pass Invoice Request">Tour Ticket &amp; VIP Pass Invoice Request</option>
              <option value="Venue / Booking Invoice & Verification">Venue / Booking Invoice &amp; Verification</option>
              <option value="Direct Fan Club Support">Direct Fan Club Support</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[var(--text-secondary)]">Your Message / Order Details *</label>
            <textarea
              rows={3}
              required
              value={requestInitialMessage}
              onChange={(e) => setRequestInitialMessage(e.target.value)}
              placeholder="Describe your order, ticket validation request, or question to open a live chat with management..."
              className="w-full p-3 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={isSending || !requestInitialMessage.trim()}
            className="px-5 py-2.5 rounded-md bg-[var(--accent)] text-[#0B0C10] font-bold hover:bg-[var(--accent-hover)] transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isSending ? 'Opening Live Chat...' : 'Start Live Chat Session'}</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col h-[560px]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold text-xs">
            AB
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)]">
              {convoMeta?.subject || 'Official Management Live Chat'}
            </h3>
            <span className="text-[10px] text-emerald-400 font-medium">
              ● Live Session Active &bull; Official Invoices &amp; Receipts Enabled
            </span>
          </div>
        </div>
        <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase">
          Status: {convoMeta?.status || 'open'}
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((msg) => {
          const isMe = msg.senderRole === 'member';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] text-[var(--text-muted)] px-1 mb-0.5">
                {msg.senderName}
              </span>
              <div
                className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                  isMe
                    ? 'bg-[var(--accent)] text-[#0B0C10] font-medium'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                }`}
              >
                <p className="whitespace-pre-line">{msg.body}</p>

                {/* Media Attachment */}
                {msg.mediaAttachment && (
                  <div className="mt-2 p-2 rounded bg-black/30 border border-white/15 space-y-2">
                    {msg.mediaAttachment.mimeType.startsWith('image/') && (
                      <img
                        src={msg.mediaAttachment.url}
                        alt={msg.mediaAttachment.name}
                        className="max-h-56 rounded object-contain"
                      />
                    )}
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                      <span className="truncate">{msg.mediaAttachment.name}</span>
                      <a
                        href={msg.mediaAttachment.url}
                        download={msg.mediaAttachment.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-black text-amber-400 font-bold flex items-center gap-1 shrink-0"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Official Templated Document (Invoice / Receipt) */}
                {msg.documentAttachment && (
                  <ChatDocumentCard docAttachment={msg.documentAttachment} />
                )}
              </div>
              <span className="text-[9px] text-[var(--text-muted)] px-1 mt-0.5 font-mono">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pending Media Attachment Preview */}
      {pendingMedia && (
        <div className="px-4 py-2 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <ImageIcon className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span className="truncate text-[var(--text-primary)]">{pendingMedia.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setPendingMedia(null)}
            className="text-[var(--text-muted)] hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Send Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleMemberFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach image or receipt file"
          className="px-3 py-2 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent)]"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message to official management..."
          className="flex-1 px-3 py-2 text-xs rounded-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={isSending || (!newMessage.trim() && !pendingMedia)}
          className="px-4 py-2 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors flex items-center space-x-1 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
