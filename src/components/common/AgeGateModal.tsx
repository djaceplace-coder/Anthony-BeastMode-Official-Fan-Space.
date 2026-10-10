import React, { useEffect, useRef } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AgeGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemTitle?: string;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
}) => {
  const { confirm18Plus } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap & accessibility
  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAgree = async () => {
    await confirm18Plus();
    onConfirm();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center space-x-2 text-[var(--accent)]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Content Advisory
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close age confirmation"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <h2 id="age-gate-title" className="text-lg font-bold text-[var(--text-primary)]">
            Age Confirmation Required (18+)
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {itemTitle ? (
              <span>
                <strong className="text-[var(--text-primary)] font-medium">{itemTitle}</strong> contains explicit lyrical themes and language.
              </span>
            ) : (
              'This release or audio player contains explicit lyrical content.'
            )}
          </p>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            In accordance with our community policy, visitors must confirm they are at least 18 years of age. We never collect or store your date of birth. Your selection is remembered securely on your device.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            ref={confirmButtonRef}
            onClick={handleAgree}
            className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center space-x-1.5 focus:ring-2 focus:ring-[var(--accent)]"
          >
            <Check className="w-4 h-4" />
            <span>I Am 18 or Older</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 text-xs font-medium rounded-md bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--text-muted)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
