"use client";

import { useState, useEffect, useCallback } from "react";

interface Event {
  id: string;
  title: string;
  description: string;
  type: "HACKATHON" | "CHALLENGE" | "WORKSHOP";
  organizer: string;
  location: string;
  isOnline: boolean;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  teamSize: number;
  maxParticipants: number;
  registeredCount: number;
  tags: string[];
  status: "OPEN" | "CLOSED" | "UPCOMING";
  joined: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  HACKATHON: "bg-violet-50 text-violet-700 border-violet-200",
  CHALLENGE: "bg-blue-50 text-blue-700 border-blue-200",
  WORKSHOP:  "bg-teal-50 text-teal-700 border-teal-200",
};

const TYPE_ICONS: Record<string, string> = {
  HACKATHON: "⚡", CHALLENGE: "🏆", WORKSHOP: "📚",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN:     "bg-emerald-50 text-emerald-700",
  UPCOMING: "bg-amber-50 text-amber-700",
  CLOSED:   "bg-gray-100 text-gray-400",
};

export default function EventsPage() {
  const [events, setEvents]         = useState<Event[]>([]);
  const [loading, setLoading]       = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatus]   = useState<string>("ALL");
  const [search, setSearch]         = useState("");
  const [joining, setJoining]       = useState<string | null>(null);
  const [expanded, setExpanded]     = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      ...(typeFilter !== "ALL" && { type: typeFilter }),
      ...(statusFilter !== "ALL" && { status: statusFilter }),
      ...(search && { q: search }),
    });
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }, [typeFilter, statusFilter, search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const joinEvent = async (id: string) => {
    setJoining(id);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setEvents(prev => prev.map(e => e.id === id ? { ...e, joined: true, registeredCount: e.registeredCount + 1 } : e));
    setJoining(null);
  };

  const leaveEvent = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}/leave`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setEvents(prev => prev.map(e => e.id === id ? { ...e, joined: false, registeredCount: e.registeredCount - 1 } : e));
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const daysUntil = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    const d = Math.ceil(diff / 86400000);
    if (d < 0) return null;
    if (d === 0) return "Today";
    if (d === 1) return "1 day left";
    return `${d} days left`;
  };

  const spotsLeft = (e: Event) => e.maxParticipants - e.registeredCount;
  const spotsPct  = (e: Event) => Math.min(100, (e.registeredCount / e.maxParticipants) * 100);

  const filteredCount = events.length;

  return (
    <>
      {/* Top bar */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Events</h1>
          <p className="text-xs text-gray-400">Hackathons, challenges, and workshops</p>
        </div>
        <a href="/student/profile" className="w-8 h-8 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center hover:opacity-80 transition-opacity" title="My Profile">
          ST
        </a>
      </header>

      {/* Filters bar */}
      <div className="px-8 py-4 border-b border-gray-100 bg-white space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition"
            placeholder="Search events…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter */}
          {["ALL", "HACKATHON", "CHALLENGE", "WORKSHOP"].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                typeFilter === t
                  ? "bg-[#1D9E75] text-white border-[#1D9E75]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {t === "ALL" ? "All types" : `${TYPE_ICONS[t]} ${t.charAt(0) + t.slice(1).toLowerCase()}`}
            </button>
          ))}

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Status filter */}
          {["ALL", "OPEN", "UPCOMING"].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                statusFilter === s
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {s === "ALL" ? "All statuses" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}

          <span className="ml-auto text-xs text-gray-400">
            {loading ? "Loading…" : `${filteredCount} event${filteredCount !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm font-medium text-gray-700">No events found</p>
            <p className="text-xs text-gray-400 mt-1">Check back later or try different filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <div
                key={ev.id}
                className={`bg-white rounded-xl border transition-all ${
                  expanded === ev.id ? "border-[#BCEAD9] shadow-sm" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Main row */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-[#F0FAF6] text-[#1D9E75] text-lg flex items-center justify-center shrink-0">
                      {TYPE_ICONS[ev.type]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{ev.title}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[ev.type]}`}>
                          {ev.type}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[ev.status]}`}>
                          {ev.status}
                        </span>
                        {ev.joined && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F0FAF6] text-[#1D9E75]">
                            ✓ Joined
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        by {ev.organizer} · {ev.isOnline ? "🌐 Online" : `📍 ${ev.location}`}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="text-xs text-gray-400">
                          📅 {formatDate(ev.startDate)} – {formatDate(ev.endDate)}
                        </span>
                        <span className="text-xs text-gray-400">
                          👥 Team of {ev.teamSize}
                        </span>
                        {daysUntil(ev.registrationDeadline) && ev.status === "OPEN" && (
                          <span className="text-xs font-medium text-amber-600">
                            ⏰ Deadline: {daysUntil(ev.registrationDeadline)}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {ev.tags?.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {ev.tags.slice(0, 4).map(t => (
                            <span key={t} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-700">{ev.registeredCount}/{ev.maxParticipants}</p>
                        <p className="text-xs text-gray-400">{spotsLeft(ev)} spots left</p>
                      </div>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1D9E75] rounded-full transition-all"
                          style={{ width: `${spotsPct(ev)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded === ev.id && (
                  <div className="px-5 pb-5 border-t border-gray-50">
                    <p className="text-sm text-gray-600 my-3 leading-relaxed">{ev.description}</p>
                    <div className="flex items-center gap-3">
                      {ev.status === "OPEN" && !ev.joined && (
                        <button
                          onClick={() => joinEvent(ev.id)}
                          disabled={joining === ev.id || spotsLeft(ev) <= 0}
                          className="px-4 py-2 rounded-lg bg-[#1D9E75] text-white text-xs font-semibold hover:bg-[#0F6E56] transition-colors disabled:opacity-50"
                        >
                          {joining === ev.id ? "Joining…" : spotsLeft(ev) <= 0 ? "Full" : "Join event"}
                        </button>
                      )}
                      {ev.joined && (
                        <button
                          onClick={() => leaveEvent(ev.id)}
                          className="px-4 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors"
                        >
                          Leave event
                        </button>
                      )}
                      <a
                        href={`/student/events/${ev.id}`}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition-colors"
                      >
                        View details →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}