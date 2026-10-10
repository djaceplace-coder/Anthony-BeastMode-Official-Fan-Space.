import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Mail,
  MessageSquare,
  Newspaper,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { SEOHead } from '../components/common/SEOHead';
import { InquiryCategory } from '../types/database';

export const ContactPage: React.FC = () => {
  const { submitInquiry } = useDatabase();
  const [activeCategory, setActiveCategory] = useState<InquiryCategory>('fans');
  const [submitted, setSubmitted] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('');
  const [outlet, setOutlet] = useState('');
  const [deadline, setDeadline] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Silent discard for bots

    await submitInquiry({
      category: activeCategory,
      name,
      email,
      city: city || undefined,
      message,
      topic: topic || undefined,
      outlet: outlet || undefined,
      deadline: deadline || undefined,
      proposedDate: proposedDate || undefined,
      capacity: capacity || undefined,
    });

    setSubmitted(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setCity('');
    setMessage('');
    setTopic('');
    setOutlet('');
    setDeadline('');
    setProposedDate('');
    setCapacity('');
    setSubmitted(false);
  };

  return (
    <div className="space-y-12 pb-16 max-w-3xl mx-auto">
      <SEOHead
        title="Contact &amp; Inquiries: Fans, Press &amp; Booking"
        description="Direct contact routing for Anthony BeastMode: fan messages, press interviews, and promoter venue booking."
        canonicalPath="/contact"
      />

      <div className="border-b border-[var(--border-subtle)] pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
          Direct Communications
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
          Contact the Team
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Select your inquiry category to route your message directly to the appropriate department.
        </p>
      </div>

      {/* 3 Routing Channel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => { setActiveCategory('fans'); resetForm(); }}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeCategory === 'fans'
              ? 'border-[var(--accent)] bg-[var(--bg-secondary)] shadow-sm'
              : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--text-muted)]'
          }`}
        >
          <User className={`w-5 h-5 mb-2 ${activeCategory === 'fans' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Fan Support</h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Fan club questions &amp; city meetups</p>
        </button>

        <button
          onClick={() => { setActiveCategory('press'); resetForm(); }}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeCategory === 'press'
              ? 'border-[var(--accent)] bg-[var(--bg-secondary)] shadow-sm'
              : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--text-muted)]'
          }`}
        >
          <Newspaper className={`w-5 h-5 mb-2 ${activeCategory === 'press' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Press &amp; Media</h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Interviews &amp; photo credentials</p>
        </button>

        <button
          onClick={() => { setActiveCategory('booking'); resetForm(); }}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeCategory === 'booking'
              ? 'border-[var(--accent)] bg-[var(--bg-secondary)] shadow-sm'
              : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--text-muted)]'
          }`}
        >
          <Calendar className={`w-5 h-5 mb-2 ${activeCategory === 'booking' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Concert Booking</h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Venue promoters &amp; festivals</p>
        </button>
      </div>

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-6">
        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Inquiry Received Successfully
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
              Your message has been assigned to our {activeCategory} desk. You will receive a direct reply to {email}.
            </p>
            <button
              onClick={resetForm}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot hidden input */}
            <input
              type="text"
              name="company_url_hp"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            {/* Fans Specific Field */}
            {activeCategory === 'fans' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Your City / State</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kansas City, MO"
                    className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="General fan inquiry / meetup"
                    className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            )}

            {/* Press Specific Fields */}
            {activeCategory === 'press' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Media Outlet *</label>
                  <input
                    type="text"
                    required
                    value={outlet}
                    onChange={(e) => setOutlet(e.target.value)}
                    placeholder="Publication / Podcast name"
                    className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Editorial Deadline</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="e.g. Oct 25, 2026"
                    className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            )}

            {/* Booking Specific Fields */}
            {activeCategory === 'booking' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Proposed Venue &amp; City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Uptown Hall, St. Louis MO"
                    className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Proposed Date &amp; Capacity</label>
                  <input
                    type="text"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    placeholder="e.g. Dec 2026 / 800 Cap"
                    className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Message Details *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[10px] text-[var(--text-muted)] flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span>Protected by honeypot spam verification. We respect your privacy.</span>
              </p>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center space-x-1.5 shrink-0 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
