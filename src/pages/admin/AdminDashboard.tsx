import React from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  Disc3,
  FileCheck,
  Inbox,
  MapPin,
  Plus,
  Shield,
  Tag,
  Users,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

interface AdminDashboardProps {
  navigateAdmin: (subroute: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigateAdmin }) => {
  const { releases, shows, cities, offers, copyItems, inquiries } = useDatabase();

  const upcomingShows = shows.filter((s) => s.status !== 'past');
  const pendingApprovals = copyItems.filter((c) => c.status === 'pending');
  const activeOffers = offers.filter((o) => o.status === 'approved');
  const newInquiries = inquiries.filter((i) => i.status === 'new');

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Operations Overview</h1>
        <p className="text-xs text-gray-400 mt-1">
          Real-time metrics across tour dates, discography releases, and approval queues.
        </p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <span className="text-[11px] text-gray-400">Verified platform players</span>
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
            onClick={() => navigateAdmin('tours')}
            className="px-4 py-2 text-xs font-bold rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
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
