"use client";

import { useState, useEffect, useCallback } from "react";

// --- INTERFACES POUR L'HISTORIQUE GLOBAL ---
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

// --- INTERFACES POUR LES DÉTAILS COMPLETS (MODALE) ---
interface EventInfo {
  id: string;
  title: string;
  description: string;
  eventType: string;
  eventFormat: string;
  location: string;
  startsAt: string;
  endsAt: string;
  minTeamSize: number;
  maxTeamSize: number;
  prizeFirst?: string;
  prizeSecond?: string;
  prizeThird?: string;
}

interface MemberInfo {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "LEADER" | "MEMBER";
}

interface TeamDetails {
  teamId: string;
  teamName: string;
  description?: string;
  createdAt: string;
  event: EventInfo | null;
  members: MemberInfo[];
}

const TYPE_ICONS: Record<string, string> = {
  HACKATHON: "⚡",
  CHALLENGE: "🏆",
  WORKSHOP: "📚",
};

export default function MyTeamsHistoryPage() {
  const [contributions, setContributions] = useState<TeamContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // États pour la gestion de la modale de détails
  const [selectedTeam, setSelectedTeam] = useState<TeamDetails | null>(null);
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Récupération de l'historique complet des équipes
  const fetchMyHistory = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    if (!token) {
      setErrorMsg("You are not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/me/teams`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (res.status === 403) {
        setErrorMsg("Access Denied (403): Session expired or missing required roles.");
        return;
      }

      if (res.ok) {
        setContributions(await res.json());
      } else {
        setErrorMsg(`Server returned an error: status ${res.status}`);
      }
    } catch (error) {
      console.error("Error fetching teams history:", error);
      setErrorMsg("Network error: Unable to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Récupération des détails d'une équipe spécifique au clic
  const handleViewDetails = async (teamId: string) => {
    setLoadingDetailsId(teamId);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/${teamId}/details`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data: TeamDetails = await res.json();
      setSelectedTeam(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching team details:", error);
      alert("Failed to load team details. Please try again.");
    } finally {
      setLoadingDetailsId(null);
    }
  };

  useEffect(() => {
    fetchMyHistory();
  }, [fetchMyHistory]);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Teams History</h1>
          <p className="text-xs text-gray-400">View and track all teams you have contributed to</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center">
          ST
        </div>
      </header>

      <div className="flex-1 p-8 overflow-auto">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-20" />
            ))}
          </div>
        ) : errorMsg ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 max-w-xl mx-auto mt-10 text-xs space-y-2">
            <p className="font-bold">⚠️ Security & Access Notice</p>
            <p>{errorMsg}</p>
            <button onClick={fetchMyHistory} className="mt-2 bg-white border border-red-300 px-3 py-1.5 rounded-lg text-red-700 hover:bg-red-100 transition-colors">
              Retry
            </button>
          </div>
        ) : contributions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center max-w-xl mx-auto mt-10">
            <p className="text-3xl mb-2">👥</p>
            <h3 className="text-sm font-semibold text-gray-800">No teams found</h3>
            <p className="text-xs text-gray-400 mt-1">You haven't participated or contributed to any teams yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm overflow-hidden">
            {contributions.map((team) => (
              <div key={team.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-gray-900">{team.teamName}</h2>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      team.eventStatus === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}>
                      {team.eventStatus === "PUBLISHED" ? "Active Event" : "Archived"}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      team.role === "LEADER" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      {team.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span>{TYPE_ICONS[team.eventType] || "📅"}</span>
                    <span>Contributed in: <span className="font-semibold text-gray-700">{team.eventName}</span></span>
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 border-t sm:border-0 pt-2 sm:pt-0 border-gray-50">
                  <div className="text-left sm:text-right text-xs text-gray-400 flex flex-row sm:flex-col justify-between sm:justify-center w-full sm:w-auto gap-2">
                    <p className="font-medium text-gray-600">👥 {team.membersCount} / {team.maxTeamSize} Members</p>
                    <p className="text-[10px]">
                      Registered: {new Date(team.registeredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  
                  {/* BOUTON DÉTAILS INTÉGRÉ */}
                  <button
                    disabled={loadingDetailsId !== null}
                    onClick={() => handleViewDetails(team.id)}
                    className="w-full sm:w-auto px-4 py-1.5 border border-gray-200 hover:border-gray-950 hover:bg-gray-950 hover:text-white rounded-lg text-xs font-semibold text-gray-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingDetailsId === team.id ? (
                      <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "View Details"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODALE FENÊTRE DÉTAILS DE L'ÉQUIPE --- */}
      {isModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-100 shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header Modale */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Team Profile</span>
                <h2 className="text-lg font-bold text-gray-900">{selectedTeam.teamName}</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenu Modale défilant */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Infos Événement */}
              {selectedTeam.event ? (
                <div className="bg-gray-50/70 border border-gray-200/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                      {TYPE_ICONS[selectedTeam.event.eventType] || "⚡"} {selectedTeam.event.title}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-900 text-white font-semibold rounded text-[9px]">
                      {selectedTeam.event.eventFormat.replace("_", " ")}
                    </span>
                  </div>
                  
                  {selectedTeam.event.description && (
                    <p className="text-gray-500 leading-relaxed italic border-l-2 border-gray-200 pl-2">
                      "{selectedTeam.event.description}"
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-[11px] pt-1 border-t border-gray-100 text-gray-600">
                    <div>📍 <strong>Location:</strong> {selectedTeam.event.location || "Online"}</div>
                    <div>👥 <strong>Allowed Size:</strong> {selectedTeam.event.minTeamSize} - {selectedTeam.event.maxTeamSize} per team</div>
                    <div>🏁 <strong>Starts:</strong> {new Date(selectedTeam.event.startsAt).toLocaleDateString()}</div>
                    <div>🔚 <strong>Ends:</strong> {new Date(selectedTeam.event.endsAt).toLocaleDateString()}</div>
                  </div>

                  {/* Podium des Prix */}
                  {(selectedTeam.event.prizeFirst || selectedTeam.event.prizeSecond || selectedTeam.event.prizeThird) && (
                    <div className="mt-3 pt-3 border-t border-gray-200/60">
                      <p className="font-bold text-gray-800 mb-1.5 flex items-center gap-1">🎁 Event Prizes:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {selectedTeam.event.prizeFirst && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-900">
                            <strong>1st:</strong> {selectedTeam.event.prizeFirst}
                          </div>
                        )}
                        {selectedTeam.event.prizeSecond && (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800">
                            <strong>2nd:</strong> {selectedTeam.event.prizeSecond}
                          </div>
                        )}
                        {selectedTeam.event.prizeThird && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-orange-900">
                            <strong>3rd:</strong> {selectedTeam.event.prizeThird}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 italic">No associated event found for this team.</p>
              )}

              {/* Liste des Membres de l'Équipe */}
              <div className="space-y-2.5">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1">
                  👥 Roster Members ({selectedTeam.members.length})
                </h3>
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden bg-white">
                  {selectedTeam.members.map((member) => (
                    <div key={member.userId} className="p-3 flex items-center justify-between hover:bg-gray-50/40 transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-800">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-[11px] text-gray-400">{member.email}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-wide ${
                        member.role === "LEADER" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {member.role === "LEADER" ? "⭐ LEADER" : "MEMBER"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modale */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}