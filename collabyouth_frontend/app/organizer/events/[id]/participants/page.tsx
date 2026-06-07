"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ParticipantTeam {
  teamId: string;
  teamName: string;
  description: string;
  createdBy: string;
  registeredAt: string;
  membersCount?: number;
}

export default function EventParticipantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [teams, setTeams] = useState<ParticipantTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/org/events/${id}/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch participants");
        const data = await res.json();
        setTeams(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [id]);

  const filtered = teams.filter(t =>
    t.teamName.toLowerCase().includes(search.toLowerCase()) ||
    (t.createdBy || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Registered Teams</h1>
            <p className="text-xs text-gray-400">
              {loading ? "Loading..." : `${teams.length} team${teams.length !== 1 ? "s" : ""} registered`}
            </p>
          </div>
        </div>

        {/* Search */}
        {!loading && teams.length > 0 && (
          <div className="relative">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search teams..."
              className="pl-8 pr-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:outline-none w-48"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          </div>
        )}
      </header>

      <div className="flex-1 p-8">

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-20" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 max-w-xl mx-auto mt-10 text-xs">
            <p className="font-bold mb-1">⚠️ Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && teams.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center max-w-xl mx-auto mt-10">
            <p className="text-3xl mb-2">👥</p>
            <h3 className="text-sm font-semibold text-gray-800">No teams yet</h3>
            <p className="text-xs text-gray-400 mt-1">No teams have registered for this event yet.</p>
          </div>
        )}

        {/* Teams */}
        {!loading && !error && teams.length > 0 && (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-[#1D9E75]">{teams.length}</p>
                <p className="text-xs text-gray-500 mt-1">Total Teams</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {teams.filter(t => t.membersCount && t.membersCount > 0).length || teams.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active Teams</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-violet-600">
                  {filtered.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Showing</p>
              </div>
            </div>

            {/* No search results */}
            {filtered.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <p className="text-xs text-gray-400">No teams match your search.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Table header */}
                <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Team</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Leader</div>
                  <div className="col-span-1">Registered</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-50">
                  {filtered.map((team, index) => (
                    <div
                      key={team.teamId}
                      className="grid grid-cols-12 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Index */}
                      <div className="col-span-1">
                        <span className="text-xs text-gray-400 font-medium">{index + 1}</span>
                      </div>

                      {/* Team name */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F0FAF6] text-[#1D9E75] text-xs font-bold flex items-center justify-center shrink-0">
                          {getInitials(team.teamName)}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 truncate">{team.teamName}</p>
                      </div>

                      {/* Description */}
                      <div className="col-span-4">
                        <p className="text-xs text-gray-500 truncate">
                          {team.description || "No description provided"}
                        </p>
                      </div>

                      {/* Leader */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[9px] font-bold flex items-center justify-center shrink-0">
                            {team.createdBy ? getInitials(team.createdBy) : "?"}
                          </div>
                          <p className="text-xs text-gray-600 truncate">{team.createdBy || "—"}</p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="col-span-1">
                        <p className="text-xs text-gray-400">{formatDate(team.registeredAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Showing {filtered.length} of {teams.length} teams
                  </p>
                  <p className="text-xs text-gray-400">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
