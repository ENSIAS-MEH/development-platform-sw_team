"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; // 💡 Import du routeur pour la redirection

interface Event {
  id: string;
  title: string;
  description: string;
  eventType: "HACKATHON" | "CHALLENGE" | "WORKSHOP";
  eventStatus: "DRAFT" | "PUBLISHED" | "CLOSED";
  eventFormat: "ONLINE" | "PRESENTIAL";
  location: string;
  startsAt: string; 
  endsAt: string;
  maxTeams: number;
  minTeamSize: number;
  maxTeamSize: number;
  prizeFirst: string;
  prizeSecond?: string;
  prizeThird?: string;
  tags: string[];
  registeredTeams: number; 
  joined?: boolean; 
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
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRAFT:     "bg-amber-50 text-amber-700 border-amber-200",
  CLOSED:    "bg-gray-100 text-gray-400 border-gray-200",
};

export default function EventsPage() {
  const router = useRouter(); // 💡 Initialisation du routeur
  const [events, setEvents]         = useState<Event[]>([]);
  const [loading, setLoading]       = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatus]   = useState<string>("ALL");
  const [search, setSearch]         = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      ...(typeFilter !== "ALL" && { type: typeFilter }),
      ...(statusFilter !== "ALL" && { status: statusFilter }),
      ...(search && { q: search }),
    });
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (error) {
      console.error("Erreur API:", error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, search, token]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const leaveEvent = async (id: string) => {
    if (!confirm("Voulez-vous vraiment annuler l'inscription de votre équipe à cet événement ?")) return;
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}/leave`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, joined: false, registeredTeams: e.registeredTeams - 1 } : e));
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const spotsLeft = (e: Event) => e.maxTeams - e.registeredTeams;
  const spotsPct  = (e: Event) => e.maxTeams > 0 ? Math.min(100, (e.registeredTeams / e.maxTeams) * 100) : 0;

  const toggleDetails = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      {/* Top bar */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Événements</h1>
          <p className="text-xs text-gray-400">Hackathons, challenges, et workshops</p>
        </div>
        <a href="/student/profile" className="w-8 h-8 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center hover:opacity-80 transition-opacity" title="Mon Profil">
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
            placeholder="Rechercher un événement..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
              {t === "ALL" ? "Tous les types" : `${TYPE_ICONS[t]} ${t.charAt(0) + t.slice(1).toLowerCase()}`}
            </button>
          ))}

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {["ALL", "PUBLISHED", "CLOSED"].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                statusFilter === s
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {s === "ALL" ? "Tous les statuts" : s === "PUBLISHED" ? "Actifs" : "Clôturés"}
            </button>
          ))}

          <span className="ml-auto text-xs text-gray-400">
            {loading ? "Chargement…" : `${events.length} événement${events.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm font-medium text-gray-700">Aucun événement trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className={`bg-white rounded-xl border transition-all ${expandedId === ev.id ? "border-[#1D9E75] shadow-sm" : "border-gray-200 hover:shadow-sm"}`}>
                
                {/* Ligne Principale */}
                <div className="p-5 flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
                  
                  {/* Gauche : Icon & Infos globales */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#F0FAF6] text-[#1D9E75] text-lg flex items-center justify-center shrink-0">
                      {TYPE_ICONS[ev.eventType]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{ev.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[ev.eventType]}`}>
                          {ev.eventType}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[ev.eventStatus]}`}>
                          {ev.eventStatus === "PUBLISHED" ? "OPEN" : ev.eventStatus}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2.5 flex-wrap text-gray-400 text-xs">
                        <span>📅 {formatDate(ev.startsAt)} – {formatDate(ev.endsAt)}</span>
                        <span>🌐 {ev.eventFormat === "ONLINE" ? "En ligne" : ev.location}</span>
                        <span>👥 Équipes de {ev.minTeamSize}-{ev.maxTeamSize}</span>
                        {ev.prizeFirst && <span className="text-amber-600 font-medium">🏆 {ev.prizeFirst}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Droite : Jauge & Zone d'actions */}
                  <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-50">
                    
                    {/* Barre de progression */}
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-700">{ev.registeredTeams}/{ev.maxTeams} Équipes</p>
                        <p className="text-[11px] text-gray-400">{spotsLeft(ev)} restantes</p>
                      </div>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1D9E75] rounded-full transition-all"
                          style={{ width: `${spotsPct(ev)}%` }}
                        />
                      </div>
                    </div>

                    {/* Bloc Boutons d'action unifiés */}
                    <div className="flex items-center gap-2">
                      {/* Bouton Détails */}
                      <button
                        onClick={() => toggleDetails(ev.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors shadow-sm ${
                          expandedId === ev.id 
                            ? "bg-gray-100 text-gray-700 border-gray-300" 
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {expandedId === ev.id ? "Masquer" : "Détails"}
                      </button>

                      {/* Bouton Dynamique Redirection vers inscription d'Équipe */}
                      <div className="w-28">
                        {ev.joined ? (
                          <button
                            onClick={() => leaveEvent(ev.id)}
                            className="w-full py-2 rounded-xl border border-red-200 text-red-500 bg-white hover:bg-red-50 text-xs font-semibold transition-colors shadow-sm"
                          >
                            Quitter
                          </button>
                        ) : ev.eventStatus === "PUBLISHED" ? (
                          <button
                            onClick={() => router.push(`/student/events/${ev.id}/register`)} // 💡 Redirection fluide
                            disabled={spotsLeft(ev) <= 0}
                            className="w-full py-2 rounded-xl bg-[#1D9E75] text-white hover:bg-[#0F6E56] text-xs font-semibold transition-colors disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent shadow-sm"
                          >
                            {spotsLeft(ev) <= 0 ? "Complet" : "Rejoindre"}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium px-3 py-1 bg-gray-50 rounded-lg block text-center">Fermé</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section des détails masquable */}
                {expandedId === ev.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-gray-50/50 rounded-b-xl">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description</h4>
                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{ev.description}</p>
                      </div>

                      {/* Tags */}
                      {ev.tags && ev.tags.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Technologies / Thèmes</h4>
                          <div className="flex gap-1.5 flex-wrap">
                            {ev.tags.map(t => (
                              <span key={t} className="bg-white border border-gray-200 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cashprizes */}
                      {(ev.prizeSecond || ev.prizeThird) && (
                        <div className="pt-2 border-t border-gray-100">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Récompenses détaillées</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
                            <div className="bg-white p-2 rounded-lg border border-gray-100">
                              <p className="text-[10px] text-gray-400 font-medium">🥇 1er Prix</p>
                              <p className="text-xs font-bold text-amber-600">{ev.prizeFirst}</p>
                            </div>
                            {ev.prizeSecond && (
                              <div className="bg-white p-2 rounded-lg border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-medium">🥈 2e Prix</p>
                                <p className="text-xs font-bold text-gray-600">{ev.prizeSecond}</p>
                              </div>
                            )}
                            {ev.prizeThird && (
                              <div className="bg-white p-2 rounded-lg border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-medium">🥉 3e Prix</p>
                                <p className="text-xs font-bold text-amber-700">{ev.prizeThird}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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