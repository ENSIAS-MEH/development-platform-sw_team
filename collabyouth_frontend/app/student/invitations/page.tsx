"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Invitation {
  id: string;
  fromName: string;
  fromDomain: string;
  fromSkills: string[];
  fromAvailability: string;
  eventTitle: string;
  eventType: "HACKATHON" | "CHALLENGE" | "WORKSHOP";
  eventDeadline: string;
  message?: string;
  sentAt: string;
  direction: "RECEIVED" | "SENT";
  status: "PENDING" | "ACCEPTED" | "DECLINED";
}

const TYPE_COLORS: Record<string, string> = {
  HACKATHON: "bg-violet-50 text-violet-700",
  CHALLENGE:  "bg-blue-50 text-blue-700",
  WORKSHOP:   "bg-teal-50 text-teal-700",
};

const TYPE_ICONS: Record<string, string> = {
  HACKATHON: "⚡", CHALLENGE: "🏆", WORKSHOP: "📚",
};

const AVAIL_COLORS: Record<string, string> = {
  FULL_TIME:   "bg-emerald-50 text-emerald-700",
  PART_TIME:   "bg-blue-50 text-blue-700",
  WEEKENDS:    "bg-amber-50 text-amber-700",
  UNAVAILABLE: "bg-red-50 text-red-600",
};
const AVAIL_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time", PART_TIME: "Part-time",
  WEEKENDS: "Weekends", UNAVAILABLE: "Unavailable",
};

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded animate-pulse ${className}`} />;
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState<"RECEIVED" | "SENT">("RECEIVED");
  const [actionId, setActionId]       = useState<string | null>(null);
  const [toast, setToast]             = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => { fetchInvitations(); }, []);

  const fetchInvitations = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setInvitations(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id: string, action: "accept" | "decline") => {
    setActionId(id);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/student/invitations/${id}/${action}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      setInvitations(prev =>
        prev.map(inv =>
          inv.id === id
            ? { ...inv, status: action === "accept" ? "ACCEPTED" : "DECLINED" }
            : inv
        )
      );
      showToast(action === "accept" ? "Invitation accepted!" : "Invitation declined.");
    }
    setActionId(null);
  };

  const cancel = async (id: string) => {
    setActionId(id);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/student/invitations/${id}/cancel`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      showToast("Invite cancelled.");
    }
    setActionId(null);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const initials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const filtered   = invitations.filter(i => i.direction === tab);
  const pendingCount = invitations.filter(i => i.direction === "RECEIVED" && i.status === "PENDING").length;

  return (
    <>
      {/* Top bar */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/student" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Dashboard
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="text-sm font-semibold text-gray-900">Invitations</h1>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {pendingCount} pending
            </span>
          )}
          <Link
            href="/student/profile"
            className="w-8 h-8 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center hover:opacity-80 transition-opacity"
            title="My Profile"
          >
            ST
          </Link>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="flex-1 overflow-auto px-8 py-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {(["RECEIVED", "SENT"] as const).map(t => {
            const count = invitations.filter(i => i.direction === t && i.status === "PENDING").length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "RECEIVED" ? "Received" : "Sent"}
                {count > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    tab === t ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-500"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex gap-4">
                  <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-3xl mb-2">{tab === "RECEIVED" ? "📬" : "📤"}</p>
            <p className="text-sm font-medium text-gray-700">
              {tab === "RECEIVED" ? "No invitations received yet" : "No invitations sent yet"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {tab === "RECEIVED"
                ? "When someone invites you to their team, it'll show up here."
                : "Invite partners from the Find Partners page."}
            </p>
            {tab === "SENT" && (
              <Link
                href="/student/partners"
                className="inline-block mt-4 text-xs px-4 py-2 rounded-lg bg-[#1D9E75] text-white hover:bg-[#0F6E56] transition-colors font-medium"
              >
                Find partners →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(inv => (
              <div
                key={inv.id}
                className={`bg-white rounded-xl border transition-colors ${
                  inv.status === "PENDING"
                    ? "border-gray-200 hover:border-gray-300"
                    : "border-gray-100 opacity-70"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">

                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-2xl bg-[#F0FAF6] text-[#1D9E75] text-sm font-bold flex items-center justify-center shrink-0">
                      {initials(inv.fromName)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{inv.fromName}</p>
                        {inv.fromAvailability && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${AVAIL_COLORS[inv.fromAvailability] ?? "bg-gray-100 text-gray-500"}`}>
                            {AVAIL_LABELS[inv.fromAvailability] ?? inv.fromAvailability}
                          </span>
                        )}
                        {/* Status badge for non-pending */}
                        {inv.status !== "PENDING" && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            inv.status === "ACCEPTED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-400"
                          }`}>
                            {inv.status === "ACCEPTED" ? "✓ Accepted" : "✗ Declined"}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-0.5">{inv.fromDomain}</p>

                      {/* Skills */}
                      {inv.fromSkills?.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-1.5">
                          {inv.fromSkills.slice(0, 4).map(sk => (
                            <span key={sk} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                              {sk}
                            </span>
                          ))}
                          {inv.fromSkills.length > 4 && (
                            <span className="bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                              +{inv.fromSkills.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Event info */}
                      <div className="flex items-center gap-2 mt-2.5 p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-base">{TYPE_ICONS[inv.eventType]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{inv.eventTitle}</p>
                          <p className="text-xs text-gray-400">Deadline {formatDate(inv.eventDeadline)}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[inv.eventType]}`}>
                          {inv.eventType}
                        </span>
                      </div>

                      {/* Optional message */}
                      {inv.message && (
                        <p className="text-xs text-gray-500 italic mt-2 pl-1 border-l-2 border-gray-200">
                          "{inv.message}"
                        </p>
                      )}

                      <p className="text-xs text-gray-300 mt-2">{timeAgo(inv.sentAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex flex-col gap-2">
                      {inv.status === "PENDING" && tab === "RECEIVED" && (
                        <>
                          <button
                            onClick={() => respond(inv.id, "accept")}
                            disabled={actionId === inv.id}
                            className="px-4 py-1.5 rounded-lg bg-[#1D9E75] text-white text-xs font-semibold hover:bg-[#0F6E56] transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {actionId === inv.id ? "…" : "✓ Accept"}
                          </button>
                          <button
                            onClick={() => respond(inv.id, "decline")}
                            disabled={actionId === inv.id}
                            className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {inv.status === "PENDING" && tab === "SENT" && (
                        <button
                          onClick={() => cancel(inv.id)}
                          disabled={actionId === inv.id}
                          className="px-4 py-1.5 rounded-lg border border-red-100 text-red-400 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {actionId === inv.id ? "…" : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}