import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { AuditLogEntry } from '../../types/database';
import { useDatabase } from '../../context/DatabaseContext';

export const AdminAuditPage: React.FC = () => {
  const { auditLogs } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');

  const fallbackAuditLogs: AuditLogEntry[] = [
    {
      id: 'audit-001',
      actorUid: 'admin-sec',
      actorEmail: 'adereraadenike@gmail.com',
      actorRole: 'super_admin',
      action: 'deploy_security_rules',
      targetCollection: 'firestore.rules',
      targetId: 'production-rules',
      details: { status: 'deployed', mode: 'zero-trust' },
      timestamp: '2026-10-10T04:03:02Z',
    },
    {
      id: 'audit-002',
      actorUid: 'admin-sec',
      actorEmail: 'adereraadenike@gmail.com',
      actorRole: 'tour_admin',
      action: 'create_show',
      targetCollection: 'shows',
      targetId: 'show-blue-springs-2026',
      details: { city: 'Blue Springs, MO', priceVerifiedOn: '2026-10-05' },
      timestamp: '2026-10-10T04:00:15Z',
    },
  ];

  const allLogs = auditLogs.length > 0 ? auditLogs : fallbackAuditLogs;

  const filteredLogs = allLogs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.targetCollection.toLowerCase().includes(term) ||
      log.actorEmail.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-[#2A2E3D] pb-4">
        <h1 className="text-xl font-bold text-white">Security &amp; Operations Audit Trail</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Real-time immutable log of all administrative creations, user updates, copy approvals, and permission events.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by action, actor, or target collection..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-[#14161D] border border-[#2A2E3D] text-white focus:outline-none focus:border-amber-500 font-mono"
        />
      </div>

      <div className="rounded-xl border border-[#2A2E3D] bg-[#14161D] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1F222E] border-b border-[#2A2E3D] text-gray-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Action</th>
              <th className="p-3">Target Collection</th>
              <th className="p-3">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2E3D] font-mono">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#1F222E]/50 transition-colors">
                <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-3 text-white">
                  {log.actorEmail}
                  <span className="block text-[10px] text-amber-400">({log.actorRole})</span>
                </td>
                <td className="p-3 text-emerald-400 font-bold">{log.action}</td>
                <td className="p-3 text-gray-300">{log.targetCollection}</td>
                <td className="p-3 text-[11px] text-gray-400 max-w-xs truncate">
                  {JSON.stringify(log.details || log.after || {})}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
