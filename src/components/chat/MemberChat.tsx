import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ShieldCheck, User } from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types/database';

export const MemberChat: React.FC = () => {
  const { currentUser, memberProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [convId, setConvId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Look up conversation for this member
    const q = query(
      collection(db, 'conversations'),
      where('memberUid', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, async (snap) => {
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setConvId(docSnap.id);

        // Listen for messages in subcollection
        const msgQuery = query(
          collection(db, 'conversations', docSnap.id, 'messages'),
          orderBy('createdAt', 'asc')
        );
        onSnapshot(msgQuery, (msgSnap) => {
          const list = msgSnap.docs
            .map((d) => ({ id: d.id, ...d.data() } as Message))
            .filter((m) => !m.hidden);
          setMessages(list);
        });
      } else {
        // Conversation will be initialized on first send
        setMessages([
          {
            id: 'welcome',
            senderUid: 'team',
            senderRole: 'team',
            senderName: 'Fan Club Coordination',
            body: `Welcome to the Fan Club, ${memberProfile?.displayName || 'Member'}! Send us any question regarding tour dates, meet-and-greets, or city alerts.`,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    });

    return () => unsub();
  }, [currentUser, memberProfile]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const text = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      let activeId = convId;
      if (!activeId) {
        // Create conversation doc
        const newConv = await addDoc(collection(db, 'conversations'), {
          memberUid: currentUser.uid,
          memberName: memberProfile?.displayName || 'Fan Member',
          subject: 'Member Direct Support Thread',
          status: 'open',
          cityId: memberProfile?.cityId || null,
          segmentSnapshot: memberProfile?.segments || [],
          lastMessage: text,
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
        activeId = newConv.id;
        setConvId(activeId);
      } else {
        await updateDoc(doc(db, 'conversations', activeId), {
          lastMessage: text,
          lastMessageAt: new Date().toISOString(),
          status: 'open',
        });
      }

      // Add message to subcollection
      await addDoc(collection(db, 'conversations', activeId, 'messages'), {
        senderUid: currentUser.uid,
        senderRole: 'member',
        senderName: memberProfile?.displayName || 'Member',
        body: text,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Chat send error, falling back locally:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          senderUid: currentUser.uid,
          senderRole: 'member',
          senderName: memberProfile?.displayName || 'Member',
          body: text,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col h-[460px]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold text-xs">
            AB
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)]">Fan Support Team</h3>
            <span className="text-[10px] text-emerald-400 font-medium">● Direct Private Thread</span>
          </div>
        </div>
        <span className="text-[10px] text-[var(--text-muted)]">Encrypted &bull; Staff Replies</span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
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
                className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                  isMe
                    ? 'bg-[var(--accent)] text-[#0B0C10] font-medium'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                }`}
              >
                {msg.body}
              </div>
              <span className="text-[9px] text-[var(--text-muted)] px-1 mt-0.5 font-mono">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Send Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message to the fan team..."
          className="flex-1 px-3 py-2 text-xs rounded-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={isSending || !newMessage.trim()}
          className="px-4 py-2 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors flex items-center space-x-1 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
