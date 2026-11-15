import React from 'react';
import { CheckCircle2, Download, FileCheck, FileText, ShieldCheck } from 'lucide-react';
import { ChatDocumentAttachment } from '../../types/database';

interface ChatDocumentCardProps {
  docAttachment: ChatDocumentAttachment;
}

export const downloadOfficialDocument = (docAttachment: ChatDocumentAttachment) => {
  const rowsHtml = (docAttachment.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2A2E3D; color: #F4F1EA;">${item.description}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2A2E3D; text-align: center; color: #A6A197;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2A2E3D; text-align: right; color: #A6A197;">${item.unitPrice}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #2A2E3D; text-align: right; font-weight: bold; color: #F4F1EA;">${item.total}</td>
      </tr>`
    )
    .join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${docAttachment.title} - ${docAttachment.referenceNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0B0C10;
      color: #F4F1EA;
      padding: 40px 20px;
      margin: 0;
    }
    .sheet {
      max-width: 760px;
      margin: 0 auto;
      background: #14161D;
      border: 1px solid #2A2E3D;
      border-radius: 12px;
      padding: 36px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #2A2E3D;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #F59E0B;
      font-weight: 700;
    }
    .doc-title {
      font-size: 24px;
      font-weight: 900;
      margin: 6px 0 4px;
      color: #FFFFFF;
    }
    .stamp {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
      font-size: 13px;
    }
    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #9CA3AF;
      margin-bottom: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 24px;
    }
    th {
      background: #1F222E;
      color: #9CA3AF;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 1px;
      padding: 10px 12px;
      text-align: left;
    }
    .totals {
      margin-left: auto;
      width: 280px;
      font-size: 13px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      color: #D1D5DB;
    }
    .totals-final {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-top: 2px solid #2A2E3D;
      font-size: 16px;
      font-weight: 800;
      color: #F59E0B;
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #2A2E3D;
      font-size: 11px;
      color: #9CA3AF;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .print-btn {
      background: #F59E0B;
      color: #000;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .sheet { border: 1px solid #ccc; background: #fff; color: #000; }
      .doc-title, td, .totals-row { color: #000 !important; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="brand">ANTHONY BEASTMODE OFFICIAL MANAGEMENT</div>
        <div class="doc-title">${docAttachment.title}</div>
        <div style="font-size: 12px; color: #9CA3AF; font-family: monospace;">REF: ${docAttachment.referenceNumber}</div>
      </div>
      <div style="text-align: right;">
        <div class="stamp">${docAttachment.statusLabel}</div>
        <div style="font-size: 11px; color: #9CA3AF; margin-top: 8px;">Issued: ${docAttachment.issueDate}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="meta-label">Issued To (Validated Recipient)</div>
        <div style="font-weight: 700; color: #FFF;">${docAttachment.recipientName}</div>
        <div style="color: #9CA3AF;">${docAttachment.recipientEmail}</div>
      </div>
      <div style="text-align: right;">
        <div class="meta-label">Verification Token</div>
        <div style="font-family: monospace; color: #F59E0B; font-weight: 700;">${docAttachment.verificationCode}</div>
        <div style="color: #9CA3AF; font-size: 11px;">Authorized via Official Portal</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item / Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${docAttachment.subtotal}</span>
      </div>
      <div class="totals-row">
        <span>Fees / Taxes</span>
        <span>${docAttachment.feesOrTax}</span>
      </div>
      <div class="totals-final">
        <span>Total Verified</span>
        <span>${docAttachment.totalAmount}</span>
      </div>
    </div>

    ${
      docAttachment.notes
        ? `<div style="margin-top: 20px; padding: 14px; background: #1F222E; border-radius: 8px; font-size: 12px; color: #D1D5DB;">
            <strong style="color: #F59E0B; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 10px;">Official Management Notes</strong>
            ${docAttachment.notes}
          </div>`
        : ''
    }

    <div class="footer">
      <div>
        Verified by Anthony BeastMode Official Management &bull; Document ID: ${docAttachment.referenceNumber}
      </div>
      <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${docAttachment.referenceNumber}-${docAttachment.docType}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const ChatDocumentCard: React.FC<ChatDocumentCardProps> = ({ docAttachment }) => {
  const isPaidOrVerified =
    docAttachment.statusLabel === 'PAID & VERIFIED' ||
    docAttachment.statusLabel === 'ORDER VALIDATED' ||
    docAttachment.statusLabel === 'BOOKING CONFIRMED';

  return (
    <div className="mt-2 rounded-xl border border-amber-500/40 bg-[#0B0C10] text-white overflow-hidden shadow-lg max-w-md w-full">
      {/* Top Banner */}
      <div className="px-4 py-2.5 bg-[#14161D] border-b border-[#2A2E3D] flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 block">
              OFFICIAL MANAGEMENT DOCUMENT
            </span>
            <h4 className="text-xs font-bold text-white">{docAttachment.title}</h4>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 border ${
            isPaidOrVerified
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}
        >
          {docAttachment.statusLabel}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 text-[11px]">
        <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#2A2E3D]/70">
          <div>
            <span className="text-[9px] uppercase font-mono text-gray-400 block">Recipient</span>
            <span className="font-bold text-white block truncate">{docAttachment.recipientName}</span>
            <span className="text-[10px] text-gray-400 block truncate">{docAttachment.recipientEmail}</span>
          </div>
          <div className="text-right font-mono">
            <span className="text-[9px] uppercase text-gray-400 block">Ref &amp; Date</span>
            <span className="font-bold text-amber-400 block">{docAttachment.referenceNumber}</span>
            <span className="text-[10px] text-gray-400 block">{docAttachment.issueDate}</span>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-1.5">
          {(docAttachment.items || []).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#1F222E]">
              <div className="pr-2">
                <span className="text-gray-200 font-medium">{item.description}</span>
                <span className="text-[10px] text-gray-500 font-mono ml-1.5">
                  ({item.quantity} &times; {item.unitPrice})
                </span>
              </div>
              <span className="font-mono font-bold text-white shrink-0">{item.total}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-1 space-y-1 font-mono text-[11px]">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal:</span>
            <span>{docAttachment.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Fees / Tax:</span>
            <span>{docAttachment.feesOrTax}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-amber-400 pt-1 border-t border-[#2A2E3D]">
            <span>Total Verified:</span>
            <span>{docAttachment.totalAmount}</span>
          </div>
        </div>

        {docAttachment.notes && (
          <div className="p-2 rounded bg-[#14161D] border border-[#2A2E3D] text-[10px] text-gray-300 leading-relaxed">
            <span className="font-mono uppercase text-[9px] text-amber-400 block mb-0.5">
              Verification Note:
            </span>
            {docAttachment.notes}
          </div>
        )}

        <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#2A2E3D]">
          <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Token: {docAttachment.verificationCode}
          </span>
          <button
            type="button"
            onClick={() => downloadOfficialDocument(docAttachment)}
            className="px-3 py-1.5 rounded bg-amber-500 text-black font-bold text-[10px] hover:bg-amber-400 transition-colors flex items-center gap-1 shadow-sm"
          >
            <Download className="w-3 h-3" />
            <span>Download Official Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
