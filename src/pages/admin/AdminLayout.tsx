import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  Disc3,
  FileCheck,
  FileText,
  Inbox,
  LogOut,
  MapPin,
  Shield,
  Tag,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';

interface AdminLayoutProps {
  currentSubroute: string;
  navigateAdmin: (subroute: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSubroute,
  navigateAdmin,
  children,
}) => {
  const { currentUser, isAdmin, signOut } = useAuth();
  const { copyItems, inquiries, shows, releases, offers } = useDatabase();

  const pendingCopy = copyItems.filter((c) => c.status === 'pending').length;
  const newInquiries = inquiries.filter((i) => i.status === 'new').length;

  const adminNav = [
    { label: 'Dashboard', subroute: 'overview', icon: Shield },
    { label: 'Releases & Music', subroute: 'releases', icon: Disc3, badge: releases.length },
    { label: 'Tours & Shows', subroute: 'tours', icon: Calendar, badge: shows.length },
    { label: 'Cities & Priority', subroute: 'cities', icon: MapPin },
    { label: 'Copy Approval Queue', subroute: 'copy', icon: FileCheck, badge: pendingCopy || undefined },
    { label: 'Partner Offers', subroute: 'offers', icon: Tag, badge: offers.length },
    { label: 'Inbox & Booking', subroute: 'inbox', icon: Inbox, badge: newInquiries || undefined },
    { label: 'Audit Trail', subroute: 'audit', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F5F5F7] font-sans flex flex-col">
      {/* Admin Top Navigation */}
      <header className="border-b border-[#2A2E3D] bg-[#14161D] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
            INTERNAL OPS CONSOLE
          </div>
          <span className="text-sm font-bold text-white">Anthony BeastMode Management</span>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <span className="text-gray-400 font-mono">{currentUser?.email}</span>
          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded bg-[#1F222E] hover:bg-red-950/40 text-gray-300 hover:text-red-400 border border-[#2A2E3D] transition-colors flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 border-r border-[#2A2E3D] bg-[#14161D]/60 p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Navigation
          </div>
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentSubroute === item.subroute;
            return (
              <button
                key={item.subroute}
                onClick={() => navigateAdmin(item.subroute)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-gray-300 hover:bg-[#1F222E] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                      isActive ? 'bg-black text-amber-400' : 'bg-[#1F222E] text-gray-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content View */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
