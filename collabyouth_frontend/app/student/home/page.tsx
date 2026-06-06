"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  skills: string[];
  domain?: string;
  availability?: string;
}

interface Event {
  id: string;
  title: string;
  type: "HACKATHON" | "CHALLENGE" | "WORKSHOP";
  deadline: string;
  teamSize: number;
  registeredCount: number;
  tags: string[];
}

interface TeamInvitation {
  id: string;
  fromName: string;
  eventTitle: string;
  sentAt: string;
}

interface StudentStats {
  eventsJoined: number;
  teamsFormed: number;
  pendingInvites: number;
  profileViews: number;
}

interface TeamContribution {
  id: string;
  teamName: string;
  eventName: string;
  eventType: "HACKATHON" | "CHALLENGE" | "WORKSHOP";
  role: "LEADER" | "MEMBER";
  membersCount: number;
  maxTeamSize: number;
  registeredAt: string;
  eventStatus: "PUBLISHED" | "CLOSED";
}

const TYPE_COLORS: Record<string, string> = {
  HACKATHON: "bg-violet-50 text-violet-700",
  CHALLENGE: "bg-blue-50 text-blue-700",
  WORKSHOP:  "bg-teal-50 text-teal-700",
};

const TYPE_ICONS: Record<string, string> = {
  HACKATHON: "⚡",
  CHALLENGE: "🏆",
  WORKSHOP: "📚",
};

export default function StudentDashboard() {
  const [profile, setProfile]         = useState<StudentProfile | null>(null);
  const [events, setEvents]           = useState<Event[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [statsData, setStatsData]     = useState<StudentStats | null>(null);
  const [teams, setTeams]             = useState<TeamContribution[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const base = process.env.NEXT_PUBLIC_API_URL;

    const [profileRes, eventsRes, invitesRes, statsRes, teamsRes] = await Promise.all([
      fetch(`${base}/api/student/profile`,             { headers }),
      fetch(`${base}/api/events?limit=4`,              { headers }),
      fetch(`${base}/api/student/invitations?limit=3`, { headers }),
      fetch(`${base}/api/student/stats`,               { headers }),
      fetch(`${base}/api/students/me/teams`,           { headers }),
    ]);

    if (profileRes.ok)  setProfile(await profileRes.json());
    if (eventsRes.ok)   setEvents(await eventsRes.json());
    if (invitesRes.ok)  setInvitations(await invitesRes.json());
    if (statsRes.ok)    setStatsData(await statsRes.json());
    if (teamsRes.ok)    setTeams(await teamsRes.json());
  };

  const acceptInvite = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/invitations/${id}/accept`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    setInvitations(prev => prev.filter(i => i.id !== id));
  };

  const declineInvite = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/invitations/${id}/decline`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    setInvitations(prev => prev.filter(i => i.id !== id));
  };

  const fullName  = (p: StudentProfile) => `${p.firstName} ${p.lastName}`.trim();
  const initials  = (p: StudentProfile) =>
    `${p.firstName?.[0] ?? ""}${p.lastName?.[0] ?? ""}`.toUpperCase() || "ST";
  const nameInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const stats = [
    { label: "Events joined",   value: statsData ? String(statsData.eventsJoined) : "—",  color: "#1D9E75" },
    { label: "Teams formed",    value: statsData ? String(statsData.teamsFormed) : "—",   color: "#059669" },
    { label: "Pending invites", value: String(invitations.length),                         color: "#D97706" },
    { label: "Profile views",   value: statsData ? String(statsData.profileViews) : "—",  color: "#6366F1" },
  ];

  return (
    <>
      {/* Top bar */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400">
            Welcome back{profile ? `, ${profile.firstName}` : ""} 👋
          </p>
        </div>
        <div className="flex items-center gap-2">
          {invitations.length > 0 && (
            <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {invitations.length} team invite{invitations.length > 1 ? "s" : ""}
            </span>
          )}
          <Link
            href="/student/profile"
            className="w-8 h-8 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center hover:opacity-80 transition-opacity"
            title="My Profile"
          >
            {profile ? initials(profile) : "ST"}
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Upcoming events */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Upcoming events</p>
              <Link href="/student/events" className="text-xs text-[#1D9E75] font-medium hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {events.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-2xl mb-1">📅</p>
                  <p className="text-xs text-gray-400">No upcoming events</p>
                </div>
              ) : events.map(ev => (
                <div key={ev.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-[#F0FAF6] text-[#1D9E75] text-xs font-bold flex items-center justify-center shrink-0">
                    {ev.type === "HACKATHON" ? "⚡" : ev.type === "CHALLENGE" ? "🏆" : "📚"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${TYPE_COLORS[ev.type]}`}>
                        {ev.type}
                      </span>
                      <span className="text-xs text-gray-400">Deadline {formatDate(ev.deadline)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">{ev.registeredCount}/{ev.teamSize} spots</p>
                    <Link href={`/student/events/${ev.id}`} className="text-xs text-[#1D9E75] font-medium hover:underline">
                      Join →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team invitations */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Team invitations
                {invitations.length > 0 && (
                  <span className="ml-2 bg-amber-50 text-amber-600 text-xs font-semibold px-1.5 py-0.5 rounded">
                    {invitations.length}
                  </span>
                )}
              </p>
              <Link href="/student/invitations" className="text-xs text-[#1D9E75] font-medium hover:underline">All →</Link>
            </div>
            {invitations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-1">✓</p>
                <p className="text-xs text-gray-400">No pending invitations</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invitations.map(inv => (
                  <div key={inv.id} className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#F0FAF6] text-[#1D9E75] text-xs font-bold flex items-center justify-center shrink-0">
                        {nameInitials(inv.fromName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{inv.fromName}</p>
                        <p className="text-xs text-gray-400 truncate">{inv.eventTitle}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => acceptInvite(inv.id)}
                        className="flex-1 text-xs py-1 rounded bg-[#1D9E75] text-white hover:bg-[#0F6E56] transition-colors font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineInvite(inv.id)}
                        className="flex-1 text-xs py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Teams */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">My Teams</p>
            <Link href="/student/teams" className="text-xs text-[#1D9E75] font-medium hover:underline">See more →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {teams.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-2xl mb-1">👥</p>
                <p className="text-xs text-gray-400">You haven't joined any teams yet</p>
              </div>
            ) : teams.slice(0, 2).map(team => (
              <div key={team.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#F0FAF6] text-[#1D9E75] text-xs font-bold flex items-center justify-center shrink-0">
                  {TYPE_ICONS[team.eventType] || "👥"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{team.teamName}</p>
                  <p className="text-xs text-gray-400 truncate">{team.eventName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    team.role === "LEADER" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {team.role}
                  </span>
                  <span className="text-xs text-gray-400">
                    {team.membersCount}/{team.maxTeamSize} members
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
