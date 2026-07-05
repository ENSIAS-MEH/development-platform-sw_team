"use client";

import { useState, useEffect, useCallback } from "react";

interface StudentCard {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  domain: string;
  skills: string[];
  availability: string;
  bio?: string;
  institution?: string;
  studyYear?: number;
  githubUrl?: string;
  linkedinUrl?: string;
  inviteStatus?: "NONE" | "PENDING" | "ACCEPTED";
}

const DOMAINS = [
  "All domains",
  "Web Development", "Mobile Development", "Data Science",
  "AI / Machine Learning", "Cybersecurity", "UI/UX Design",
  "DevOps", "Game Development", "Embedded Systems",
];

const AVAILABILITIES = [
  { value: "", label: "Any availability" },
  { value: "FULL_TIME",   label: "Full-time" },
  { value: "PART_TIME",   label: "Part-time" },
  { value: "WEEKENDS",    label: "Weekends only" },
];

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

const POPULAR_SKILLS = ["React", "Python", "Node.js", "Figma", "Flutter", "TensorFlow", "Docker", "PostgreSQL"];

export default function FindPartnersPage() {
  const [students, setStudents]       = useState<StudentCard[]>([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState("");
  const [domain, setDomain]           = useState("All domains");
  const [availability, setAvail]      = useState("");
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [inviting, setInviting]       = useState<string | null>(null);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const PER_PAGE = 12;

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PER_PAGE),
      ...(search && { q: search }),
      ...(domain !== "All domains" && { domain }),
      ...(availability && { availability }),
      ...(skillFilter.length && { skills: skillFilter.join(",") }),
    });
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setStudents(data.students ?? data);
      setTotal(data.total ?? (data.students ?? data).length);
    }
    setLoading(false);
  }, [search, domain, availability, skillFilter, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const sendInvite = async (studentId: string) => {
    setInviting(studentId);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/invitations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ toStudentId: studentId }),
    });
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, inviteStatus: "PENDING" } : s));
    setInviting(null);
  };

  const toggleSkill = (sk: string) =>
    setSkillFilter(prev => prev.includes(sk) ? prev.filter(s => s !== sk) : [...prev, sk]);

  const clearFilters = () => {
    setSearch(""); setDomain("All domains"); setAvail(""); setSkillFilter([]); setPage(1);
  };

  const initials = (s: StudentCard) => {
    const first = s.firstName?.[0] ?? "";
    const last  = s.lastName?.[0] ?? "";
    return (first + last).toUpperCase() || "?";
  };

  const fullName = (s: StudentCard) =>
    [s.firstName, s.lastName].filter(Boolean).join(" ") || s.email;

  const hasFilters = search || domain !== "All domains" || availability || skillFilter.length > 0;

  return (
    <>
      {/* Top bar */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Find Partners</h1>
          <p className="text-xs text-gray-400">Discover students to collaborate with</p>
        </div>
        <a href="/student/profile" className="w-8 h-8 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center hover:opacity-80 transition-opacity" title="My Profile">
          ST
        </a>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="px-8 py-5 border-b border-gray-100 bg-white space-y-3">

          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition"
              placeholder="Search by name, skill, or domain…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-white"
              value={domain}
              onChange={e => { setDomain(e.target.value); setPage(1); }}
            >
              {DOMAINS.map(d => <option key={d}>{d}</option>)}
            </select>

            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] bg-white"
              value={availability}
              onChange={e => { setAvail(e.target.value); setPage(1); }}
            >
              {AVAILABILITIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>

            <div className="flex gap-1.5 flex-wrap">
              {POPULAR_SKILLS.map(sk => (
                <button
                  key={sk}
                  onClick={() => { toggleSkill(sk); setPage(1); }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    skillFilter.includes(sk)
                      ? "bg-[#1D9E75] text-white border-[#1D9E75]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#1D9E75] hover:text-[#1D9E75]"
                  }`}
                >
                  {sk}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 underline ml-auto">
                Clear filters
              </button>
            )}
          </div>

          {/* Count */}
          <p className="text-xs text-gray-400">
            {loading ? "Searching…" : `${total} student${total !== 1 ? "s" : ""} found`}
          </p>
        </div>

        <div className="px-8 py-6">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-gray-100 rounded w-1/2 mb-3" />
                  <div className="flex gap-1 mb-4">
                    <div className="h-5 w-12 bg-gray-100 rounded-full" />
                    <div className="h-5 w-10 bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-7 bg-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm font-medium text-gray-700">No students found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
              <button onClick={clearFilters} className="mt-3 text-xs text-[#1D9E75] hover:underline">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {students.map(s => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#BCEAD9] hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F0FAF6] text-[#1D9E75] text-base font-bold flex items-center justify-center">
                        {initials(s)}
                      </div>
                      {s.availability && s.availability !== "UNAVAILABLE" && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${AVAIL_COLORS[s.availability]}`}>
                          {AVAIL_LABELS[s.availability]}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-gray-900 leading-tight">{fullName(s)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.domain}</p>
                    {s.institution && <p className="text-xs text-gray-400">🎓 {s.institution}</p>}
                    {s.bio && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{s.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-1 mt-3 mb-4">
                      {s.skills.slice(0, 3).map(sk => (
                        <span key={sk} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{sk}</span>
                      ))}
                      {s.skills.length > 3 && (
                        <span className="bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded-full">+{s.skills.length - 3}</span>
                      )}
                    </div>

                    {s.inviteStatus === "PENDING" ? (
                      <div className="w-full text-center text-xs py-1.5 rounded-lg bg-gray-100 text-gray-400 font-medium">
                        Invite sent ✓
                      </div>
                    ) : s.inviteStatus === "ACCEPTED" ? (
                      <div className="w-full text-center text-xs py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-medium">
                        Teammates ✓
                      </div>
                    ) : s.availability === "UNAVAILABLE" ? (
                      <div className="w-full text-center text-xs py-1.5 rounded-lg bg-red-50 text-red-400 font-medium">
                        Unavailable
                      </div>
                    ) : (
                      <button
                        onClick={() => sendInvite(s.id)}
                        disabled={inviting === s.id}
                        className="w-full text-xs py-1.5 rounded-lg border border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white transition-all font-medium disabled:opacity-50"
                      >
                        {inviting === s.id ? "Sending…" : "Invite to team"}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {total > PER_PAGE && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-gray-400">
                    Page {page} of {Math.ceil(total / PER_PAGE)}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(total / PER_PAGE)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}