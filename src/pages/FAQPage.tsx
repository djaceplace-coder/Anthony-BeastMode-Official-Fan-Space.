import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ShieldAlert } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'Ticketing & Pricing',
      question: 'How do I buy tickets, and does this site sell tickets directly?',
      answer:
        'This website never sells, resells, or processes payment for tickets directly. All ticket buttons link directly to authorized ticketing vendors (such as Eventbrite, TicketLeap, Bandsintown, or verified venue box offices). Prices shown on the site are based on official vendor listings and verified by our team, but remain subject to ticketing vendor convenience fees and checkout terms.',
    },
    {
      category: 'Ticketing & Pricing',
      question: 'How do refunds work if a show is postponed or cancelled?',
      answer:
        'All ticket refund requests are handled exclusively by the ticketing vendor where you purchased your ticket, in accordance with their event terms. In the event of a postponement or cancellation, the official status and public notices will be updated immediately on our Tour page.',
    },
    {
      category: 'Age Policies & Explicit Content',
      question: 'What are the age restrictions for live shows and online music?',
      answer:
        'For live shows, age policies (All Ages, 18+, or 21+) are strictly determined by the local venue and city ordinance, and are listed directly beside each tour date. For online streaming on this website, explicit tracks require a simple 18+ confirmation flag before streaming players expand. We never ask for or store birthdates.',
    },
    {
      category: 'Fan Club & Community',
      question: 'Is the Anthony BeastMode Fan Club free to join?',
      answer:
        'Yes! Membership is 100% free. By creating a profile, you can follow your local city, receive direct presale notifications, chat directly with our fan coordination team, and access exclusive meet-and-greet announcements.',
    },
    {
      category: 'Music & Streaming',
      question: 'Why does the site use external platform embeds instead of downloadable MP3s?',
      answer:
        'To support independent music licensing and ensure streaming numbers count toward official billboard and artist royalty certifications, all music is streamed exclusively through authorized embeds from Spotify, Apple Music, Deezer, and YouTube.',
    },
    {
      category: 'Press & Booking',
      question: 'How can venue promoters or journalists submit inquiries?',
      answer:
        'Promoters and media members can submit inquiries directly through our dedicated Contact routing portal (/contact) under the Press or Booking channels.',
    },
  ];

  return (
    <div className="space-y-12 pb-16 max-w-3xl mx-auto">
      <SEOHead
        title="Frequently Asked Questions (FAQ)"
        description="Official FAQ for Anthony BeastMode: ticketing verification, show age policies, explicit streaming rules, and fan club membership."
        canonicalPath="/faq"
      />

      <div className="border-b border-[var(--border-subtle)] pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
          Help &amp; Official Answers
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Verified answers regarding ticketing, age policies, fan club perks, and streaming.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--accent)] block font-mono">
                    {faq.category}
                  </span>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                    {faq.question}
                  </h2>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[var(--accent)] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="p-5 pt-0 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]/40 bg-[var(--bg-elevated)]">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
