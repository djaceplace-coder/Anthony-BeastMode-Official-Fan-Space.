import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Filter, Inbox, Mail, MessageSquare, Send, Tag } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { Inquiry, InquiryStatus } from '../../types/database';

export const AdminInboxPage: React.FC = () => {
  const { inquiries, updateInquiryStatus } = useDatabase();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [internalNoteText, setInternalNoteText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fans' | 'press' | 'booking'>('all');

  const filteredInquiries = inquiries.filter((i) => {
    if (selectedCategory === 'all') return true;
    return i.category === selectedCategory;
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

  const cannedReplies = [
    'Thank you for reaching out to Anthony BeastMode fan support. We have verified your request and routed it to local tour coordination.',
    'Thank you for the venue booking inquiry. Please provide your hold date, room capacity, and production specs for review by tour management.',
    'Press credentials request acknowledged. High-res photo assets and approved bio are accessible directly in our digital EPK at /media/press-kit.',
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-[#2A2E3D] pb-4">
        <h1 className="text-xl font-bold text-white">Unified Support &amp; Booking Pipeline</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Process fan communications, media interviews, and promoter venue booking pipelines.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs">
        {['all', 'fans', 'press', 'booking'].map((cat) => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat as any); setSelectedInquiry(null); }}
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
        {/* Inquiries List */}
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
                  <span className="font-bold uppercase text-amber-400 font-mono">
                    {inq.category}
                  </span>
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
            <div className="p-8 text-center text-xs text-gray-400">
              No inquiries in this category queue.
            </div>
          )}
        </div>

        {/* Selected Inquiry Detail & Pipeline */}
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

                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {selectedInquiry.status}
                </span>
              </div>

              {/* Status Pipeline Buttons */}
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

              {/* Message Payload */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Inquiry Message Details
                </label>
                <div className="p-4 rounded-lg bg-[#1F222E] text-xs text-gray-200 leading-relaxed whitespace-pre-line border border-[#2A2E3D]">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Internal Notes (Hidden from Public & Fans - Section 4 requirement) */}
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

              {/* Canned Quick Replies */}
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
              Select an inquiry thread from the list on the left to inspect details and route replies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
