"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  PUBLISHED: "Actif",
  DRAFT:     "Brouillon",
  CLOSED:    "Terminé",
  CANCELLED: "Annulé",
};

const TYPE_STYLE: Record<string, string> = {
  HACKATHON: "bg-purple-100 text-purple-700",
  CHALLENGE: "bg-blue-100   text-blue-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getDayMonth(iso: string) {
  const d = new Date(iso);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase(),
  };
}

// ── Page ───────────────────────────────────────────────────────────
export default function OrganizerHome() {
  const router = useRouter();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");

    if (!token || (role !== "ROLE_ORG")) {
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
        if (!sRes.ok || !eRes.ok) throw new Error("Erreur chargement données");
        const [s, e] = await Promise.all([sRes.json(), eRes.json()]);
        setStats(s);
        setEvents(e);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-[#1D9E75]/30 border-t-[#1D9E75] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes événements</h1>
          <p className="text-sm text-gray-500 mt-1">Tableau de bord organisateur</p>
        </div>
        <Link
          href="/organizer/events/create"
          className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-5 py-2.5
                     rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          + Créer un événement
        </Link>
      </div>

      {/* ── Stats cards ── */}
      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8 w-full">
          {[
            { label: "Événements publiés", value: stats.totalEvents,  sub: `${stats.activeEvents} actifs` },
            { label: "Équipes inscrites",  value: stats.totalTeams,   sub: "sur mes événements" },
            { label: "Événements actifs",  value: stats.activeEvents, sub: "en cours" },
            { label: "Taux de remplissage",value: `${stats.avgFillRate}%`, sub: "moy. tous événements" },
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
            <p className="text-gray-400 text-sm">Aucun événement créé pour l'instant.</p>
            <Link
              href="/organizer/events/create"
              className="mt-4 inline-block text-[#1D9E75] font-semibold text-sm hover:underline"
            >
              Créer votre premier événement →
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
                      {ev.prize && ` · Prix : ${ev.prize}`}
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
                          {ev.registeredTeams} / {ev.maxTeams} inscrits
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
                                       hover:bg-gray-50 transition-colors"
                          >
                            Voir participants
                          </Link>
                          <Link
                            href={`/organizer/events/${ev.id}/edit`}
                            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg
                                       hover:bg-gray-50 transition-colors"
                          >
                            Modifier
                          </Link>
                          <button className="text-xs border border-red-100 text-red-500 px-3 py-1.5
                                             rounded-lg hover:bg-red-50 transition-colors">
                            Clôturer
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/organizer/events/${ev.id}/results`}
                            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg
                                       hover:bg-gray-50 transition-colors"
                          >
                            Voir résultats
                          </Link>
                          <button className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg
                                             hover:bg-gray-50 transition-colors">
                            Archiver
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Registered count */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-2xl font-bold text-gray-900">{ev.registeredTeams}</span>
                    <p className="text-xs text-gray-400">inscrits</p>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}