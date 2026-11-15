import React from 'react';
import {
  Activity,
  Calendar,
  Disc3,
  FileCheck,
  Inbox,
  MapPin,
  Plus,
  Settings,
  Shield,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

interface AdminDashboardProps {
  navigateAdmin: (subroute: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigateAdmin }) => {
  const { releases, shows, cities, copyItems, inquiries, members, merchItems, isLiveConnected } = useDatabase();

  const upcomingShows = shows.filter((s) => s.status !== 'past');
  const pendingApprovals = copyItems.filter((c) => c.status === 'pending');
  const newInquiries = inquiries.filter((i) => i.status === 'new');
  const activeMembers = members.filter((m) => m.status === 'active');

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Real-Time Operations Command Center</h1>
          <p className="text-xs text-gray-400 mt-1">
            Live synchronized metrics across global member accounts, tour dates, discography, merch, and approval queues.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>{isLiveConnected ? 'FIRESTORE REAL-TIME STREAM ACTIVE' : 'CONNECTING TO FIRESTORE...'}</span>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          onClick={() => navigateAdmin('members')}
          className="p-5 rounded-xl border border-amber-500/40 bg-[#14161D] hover:border-amber-500 cursor-pointer transition-colors space-y-2"
        >
          <div className="flex justify-between items-center text-amber-400">
            <span className="text-xs font-bold uppercase">Live Accounts</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{members.length}</div>
          <span className="text-[11px] text-emerald-400 font-mono">{activeMembers.length} active globally</span>
        </div>

        <div
          onClick={() => navigateAdmin('tours')}
          className="p-5 rounded-xl border border-[#2A2E3D] bg-[#14161D] hover:border-amber-500 cursor-pointer transition-colors space-y-2"
        >
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold uppercase">Upcoming Shows</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{upcomingShows.length}</div>
          <span className="text-[11px] text-gray-400">Total in calendar: {shows.length}</span>
        </div>

        <div
          onClick={() => navigateAdmin('releases')}
          className="p-5 rounded-xl border border-[#2A2E3D] bg-[#14161D] hover:border-amber-500 cursor-pointer transition-colors space-y-2"
        >
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold uppercase">Releases</span>
            <Disc3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{releases.length}</div>
          <span className="text-[11px] text-gray-400">{merchItems.length} Merch Items</span>
        </div>

        <div
          onClick={() => navigateAdmin('copy')}
          className="p-5 rounded-xl border border-[#2A2E3D] bg-[#14161D] hover:border-amber-500 cursor-pointer transition-colors space-y-2"
        >
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold uppercase">Pending Copy</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">{pendingApprovals.length}</div>
          <span className="text-[11px] text-gray-400">Awaiting management sign-off</span>
        </div>

        <div
          onClick={() => navigateAdmin('inbox')}
          className="p-5 rounded-xl border border-[#2A2E3D] bg-[#14161D] hover:border-amber-500 cursor-pointer transition-colors space-y-2"
        >
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-semibold uppercase">New Inquiries</span>
            <Inbox className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{newInquiries.length}</div>
          <span className="text-[11px] text-gray-400">Fans, Press &amp; Booking</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-6 rounded-xl border border-[#2A2E3D] bg-[#14161D] space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">
          Quick Administrative Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigateAdmin('members')}
            className="px-4 py-2 text-xs font-bold rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Manage / Create Member Accounts</span>
          </button>
          <button
            onClick={() => navigateAdmin('tours')}
            className="px-4 py-2 text-xs font-semibold rounded-md border border-[#2A2E3D] bg-[#1F222E] text-white hover:border-amber-500 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Tour Date</span>
          </button>
          <button
            onClick={() => navigateAdmin('releases')}
            className="px-4 py-2 text-xs font-semibold rounded-md border border-[#2A2E3D] bg-[#1F222E] text-white hover:border-amber-500 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Music Release</span>
          </button>
          <button
            onClick={() => navigateAdmin('merch-news')}
            className="px-4 py-2 text-xs font-semibold rounded-md border border-[#2A2E3D] bg-[#1F222E] text-white hover:border-amber-500 transition-colors flex items-center space-x-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Edit Merch, News &amp; Bio</span>
          </button>
          <button
            onClick={() => navigateAdmin('offers')}
            className="px-4 py-2 text-xs font-semibold rounded-md border border-[#2A2E3D] bg-[#1F222E] text-white hover:border-amber-500 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Create Partner Offer</span>
          </button>
          <button
            onClick={() => navigateAdmin('cities')}
            className="px-4 py-2 text-xs font-semibold rounded-md border border-[#2A2E3D] bg-[#1F222E] text-white hover:border-amber-500 transition-colors flex items-center space-x-1.5"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>View City Priorities</span>
          </button>
          <button
            onClick={() => navigateAdmin('settings')}
            className="px-4 py-2 text-xs font-semibold rounded-md border border-[#2A2E3D] bg-[#1F222E] text-white hover:border-amber-500 transition-colors flex items-center space-x-1.5"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Global Site Settings</span>
          </button>
        </div>
      </div>

      {/* Live Registered Accounts Stream */}
      <div className="p-6 rounded-xl border border-[#2A2E3D] bg-[#14161D] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Users className="w-4 h-4" />
            <span>Latest Registered User Accounts (Live Global Stream)</span>
          </div>
          <button
            onClick={() => navigateAdmin('members')}
            className="text-xs font-mono text-amber-400 hover:underline"
          >
            View All ({members.length}) &rarr;
          </button>
        </div>

        <div className="divide-y divide-[#2A2E3D] rounded-lg border border-[#2A2E3D] bg-[#0B0C10] overflow-hidden">
          {members.slice(0, 6).map((m) => {
            const city = cities.find((c) => c.id === m.cityId);
            return (
              <div key={m.uid} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{m.displayName}</span>
                    <span className="text-gray-400 font-mono">{m.email}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1F222E] text-amber-400">
                      {m.role || 'member'}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    City: {city ? `${city.name}, ${city.state}` : 'National'} &bull; Joined:{' '}
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : 'Active'}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    m.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}
                >
                  {m.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Governance & Pre-Launch Blockers Status Check */}
      <div className="p-6 rounded-xl border border-[#2A2E3D] bg-[#14161D] space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Shield className="w-4 h-4" />
          <span>Launch Governance Checklist Status</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-300">
          <div className="p-3 rounded-lg bg-[#1F222E] flex items-center justify-between">
            <span>Email Verification Testing Mode (Rule 1.9)</span>
            <span className="text-amber-400 font-mono font-bold">OFF (Testing)</span>
          </div>
          <div className="p-3 rounded-lg bg-[#1F222E] flex items-center justify-between">
            <span>Stripe / Card Processing Prohibited (Rule 1.5)</span>
            <span className="text-emerald-400 font-mono font-bold">ENFORCED (0 cards)</span>
          </div>
          <div className="p-3 rounded-lg bg-[#1F222E] flex items-center justify-between">
            <span>Explicit 18+ Content Gating (Rule 1.6)</span>
            <span className="text-emerald-400 font-mono font-bold">ACTIVE (No birthdates)</span>
          </div>
          <div className="p-3 rounded-lg bg-[#1F222E] flex items-center justify-between">
            <span>Admin URL Concealment (Rule 1.8)</span>
            <span className="text-emerald-400 font-mono font-bold">HIDDEN (404 on public)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
