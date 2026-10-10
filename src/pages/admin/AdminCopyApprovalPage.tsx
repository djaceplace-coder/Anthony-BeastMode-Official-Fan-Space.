import React from 'react';
import { Check, Clock, FileCheck, ShieldAlert, X } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { CopyItem, ApprovalStatus } from '../../types/database';

export const AdminCopyApprovalPage: React.FC = () => {
  const { copyItems, updateCopyStatus } = useDatabase();

  const handleApprove = async (id: string) => {
    await updateCopyStatus(id, 'approved');
  };

  const handleRequestChanges = async (id: string) => {
    await updateCopyStatus(id, 'changes_requested');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-[#2A2E3D] pb-4">
        <h1 className="text-xl font-bold text-white">Copy &amp; Factual Claims Approval Queue</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Rule 1.1 / 16.2: Every claim regarding biography, origins, awards, and community naming requires documented approval.
        </p>
      </div>

      <div className="space-y-4">
        {copyItems.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-xl border bg-[#14161D] space-y-3 ${
              item.status === 'pending'
                ? 'border-amber-500/50'
                : item.status === 'approved'
                ? 'border-[#2A2E3D]'
                : 'border-red-500/40'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A2E3D] pb-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-gray-400">Target: /{item.pageRef}</span>
                <span>&bull;</span>
                <span className="font-semibold text-white">Key: {item.key}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  item.status === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : item.status === 'pending'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {item.status.replace('_', ' ')}
              </span>
            </div>

            <div className="p-3 rounded bg-[#1F222E] text-xs text-gray-200 leading-relaxed font-mono">
              "{item.body}"
            </div>

            {item.sourceNote && (
              <div className="text-[11px] text-amber-400/90 flex items-center space-x-1">
                <span>Source Note: {item.sourceNote}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-gray-400 text-[11px]">Author: {item.author}</span>

              {item.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequestChanges(item.id)}
                    className="px-3 py-1.5 rounded border border-[#2A2E3D] hover:bg-red-950/40 text-gray-300 hover:text-red-400 text-xs flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </button>
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve &amp; Publish</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
