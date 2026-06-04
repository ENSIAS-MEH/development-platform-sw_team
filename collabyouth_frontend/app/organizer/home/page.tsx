"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────
interface Stats {
  totalEvents: number;
  activeEvents: number;
  totalTeams: number;
  avgFillRate: number;
}

interface OrgEvent {
  id: string;
  title: string;
  eventType: string;
  eventStatus: string;
  eventFormat: string;
  location: string;
  startsAt: string;
  endsAt: string;
  maxTeams: number | null;
  prize: string | null;
  tags: string[];
  registeredTeams: number;
}

// ── Helpers ────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT:     "bg-gray-100  text-gray-600",
  CLOSED:    "bg-red-100   text-red-600",
  CANCELLED: "bg-red-100   text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Active",
  DRAFT:     "Draft",
  CLOSED:    "Ended",
  CANCELLED: "Cancelled",
};

const TYPE_STYLE: Record<string, string> = {
  HACKATHON: "bg-purple-100 text-purple-700",
  CHALLENGE: "bg-blue-100   text-blue-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getDayMonth(iso: string) {
  const d = new Date(iso);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
}

// ── Main Page ────────────────────────────────────────────────────────
export default function OrganizerHome() {
  const router = useRouter();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Modal UI States ──
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; eventId: string | null }>({
    isOpen: false,
    eventId: null,
  });
  const [notificationModal, setNotificationModal] = useState<{ isOpen: boolean; type: "success" | "error"; title: string; message: string }>({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  });

  // Load page data on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");

    if (!token || role !== "ROLE_ORG") {
      router.push("/auth/login");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const API = process.env.NEXT_PUBLIC_API_URL;

    Promise.all([
      fetch(`${API}/api/org/events/stats`, { headers }),
      fetch(`${API}/api/org/events`,       { headers }),
    ])
      .then(async ([sRes, eRes]) => {
        if (!sRes.ok || !eRes.ok) throw new Error("Error loading data.");
        const [s, e] = await Promise.all([sRes.json(), eRes.json()]);
        setStats(s);
        setEvents(e);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  // ── Trigger close confirmation modal ──
  const triggerCloseConfirmation = (eventId: string) => {
    setConfirmModal({ isOpen: true, eventId });
  };

  // ── Final close handler (called by the modal) ──
  const handleCloseEvent = async () => {
    const eventId = confirmModal.eventId;
    if (!eventId) return;

    setConfirmModal({ isOpen: false, eventId: null });
    setActionLoading(eventId);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/org/events/${eventId}/close`, {
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Server error (Code: ${res.status})`);
      }

      setEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev.id === eventId ? { ...ev, eventStatus: "CLOSED" } : ev
        )
      );

      setStats((prevStats) => 
        prevStats ? { ...prevStats, activeEvents: Math.max(0, prevStats.activeEvents - 1) } : null
      );

      setNotificationModal({
        isOpen: true,
        type: "success",
        title: "Event closed!",
        message: "The status has been successfully updated. Team registrations are now locked."
      });

    } catch (err: any) {
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Action failed",
        message: err.message || "An error occurred while communicating with the server."
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="w-8 h-8 border-4 border-[#1D9E75]/30 border-t-[#1D9E75] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-50 font-medium">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 relative">

      {/* ── Header ── */}
      <div className="flex flex-col gap-6 mb-8 border-b border-gray-100 pb-6">
  
        {/* Top Bar: Logo on the left & Profile/Logout on the right */}
        <div className="flex justify-between items-center w-full">
          <div className="relative w-80 h-30">
            <Image 
              src="/img/collabyouth_logo_v1_fixed.png" 
              alt="Collabyouth Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/organizer/profile"
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>👤</span> My Organizer Profile
            </Link>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/auth/login";
              }}
              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors px-2 py-2"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Bar: Title and Create Event */}
        <div className="relative flex items-center justify-center w-full min-h-[50px]">
  
            {/* Le titre est ici, parfaitement centré grâce à justify-center sur le parent */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 text-center">My Events</h1>
            </div>
            
            {/* Le bouton est sorti du flux normal avec 'absolute' et collé à droite avec 'right-0' */}
            <Link
              href="/organizer/events/create"
              className="absolute right-0 bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-5 py-2.5
                        rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              + Create an event
            </Link>
          </div>
      </div>
        
      {/* ── Stats cards ── */}
      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8 w-full">
          {[
            { label: "Published events", value: stats.totalEvents,  sub: `${stats.activeEvents} active` },
            { label: "Registered teams",  value: stats.totalTeams,   sub: "across my events" },
            { label: "Active events",     value: stats.activeEvents, sub: "in progress" },
            { label: "Fill rate",         value: `${stats.avgFillRate}%`, sub: "avg. across all events" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-[#1D9E75] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Events list ── */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No events created yet.</p>
            <Link
              href="/organizer/events/create"
              className="mt-4 inline-block text-[#1D9E75] font-semibold text-sm hover:underline"
            >
              Create your first event →
            </Link>
          </div>
        ) : (
          events.map((ev) => {
            const { day, month } = getDayMonth(ev.startsAt);
            const fillPct = ev.maxTeams
              ? Math.min(100, Math.round((ev.registeredTeams / ev.maxTeams) * 100))
              : 0;

            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100
                           hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">

                  {/* Date badge */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#e8f5f0] flex flex-col
                                  items-center justify-center text-[#1D9E75]">
                    <span className="text-xl font-bold leading-none">{day}</span>
                    <span className="text-[10px] font-semibold">{month}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-base font-bold text-gray-900 truncate">{ev.title}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLE[ev.eventType] ?? "bg-gray-100 text-gray-600"}`}>
                        {ev.eventType}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[ev.eventStatus] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[ev.eventStatus] ?? ev.eventStatus}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-2">
                      {ev.location} · {formatDate(ev.startsAt)} – {formatDate(ev.endsAt)}
                      {ev.prize && ` · Prize: ${ev.prize}`}
                    </p>

                    {/* Tags */}
                    {ev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {ev.tags.map((t) => (
                          <span key={t} className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Progress bar */}
                    {ev.maxTeams && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1D9E75] rounded-full transition-all"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {ev.registeredTeams} / {ev.maxTeams} registered
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {ev.eventStatus === "PUBLISHED" || ev.eventStatus === "DRAFT" ? (
                        <>
                          <Link
                            href={`/organizer/events/${ev.id}/participants`}
                            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg
                                       hover:bg-gray-50 transition-colors font-medium text-gray-600"
                          >
                            View participants
                          </Link>
                          <Link
                            href={`/organizer/events/${ev.id}/edit`}
                            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg
                                       hover:bg-gray-50 transition-colors font-medium text-gray-600"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => triggerCloseConfirmation(ev.id)}
                            disabled={actionLoading === ev.id}
                            className="text-xs border border-red-100 text-red-500 px-3 py-1.5
                                       rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                          >
                            {actionLoading === ev.id ? "Closing..." : "Close"}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/organizer/events/${ev.id}/results`}
                            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg
                                       hover:bg-gray-50 transition-colors font-medium text-gray-600"
                          >
                            View results
                          </Link>
                          <button className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg
                                             hover:bg-gray-50 transition-colors font-medium text-gray-400">
                            Archive
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Registered count */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-2xl font-bold text-gray-900">{ev.registeredTeams}</span>
                    <p className="text-xs text-gray-400">registered</p>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* ── MODAL UI ── */}
      {/* ────────────────────────────────────────────────────────────── */}

      {/* 1. Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Close this event?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to permanently close this event? New team registrations will be instantly locked.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ isOpen: false, eventId: null })}
                className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseEvent}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm"
              >
                Confirm closure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. General Notification Modal (Success / Error) */}
      {notificationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 ${
              notificationModal.type === "success" ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
            }`}>
              {notificationModal.type === "success" ? "✨" : "❌"}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{notificationModal.title}</h3>
            <p className="text-sm text-gray-400 mb-6 px-2">{notificationModal.message}</p>
            <button
              onClick={() => setNotificationModal(prev => ({ ...prev, isOpen: false }))}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm text-white ${
                notificationModal.type === "success" ? "bg-[#1D9E75] hover:bg-[#0F6E56]" : "bg-gray-800 hover:bg-gray-900"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
