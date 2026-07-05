"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Matches StudentProfileResponse exactly
interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  domain?: string;
  institution?: string;
  studyYear?: number;
  availability?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  skills: string[];   // Set<String> from backend → string[] on frontend
}

// Matches StudentProfileRequest exactly
interface StudentProfileRequest {
  bio?: string;
  domain?: string;
  institution?: string;
  studyYear?: number;
  availability?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  skills?: string[];
}

const DOMAINS = [
  "Web Development", "Mobile Development", "Data Science",
  "AI / Machine Learning", "Cybersecurity", "UI/UX Design",
  "DevOps", "Game Development", "Embedded Systems", "Other",
];

const AVAILABILITY_OPTIONS = [
  "FULL_TIME", "PART_TIME", "WEEKENDS", "UNAVAILABLE",
];

const AVAILABILITY_LABELS: Record<string, string> = {
  FULL_TIME:   "Full-time",
  PART_TIME:   "Part-time",
  WEEKENDS:    "Weekends only",
  UNAVAILABLE: "Unavailable",
};

const AVAILABILITY_COLORS: Record<string, string> = {
  FULL_TIME:   "bg-emerald-50 text-emerald-700",
  PART_TIME:   "bg-blue-50 text-blue-700",
  WEEKENDS:    "bg-amber-50 text-amber-700",
  UNAVAILABLE: "bg-red-50 text-red-600",
};

const SKILL_SUGGESTIONS = [
  "React", "Next.js", "TypeScript", "Node.js", "Python", "Django",
  "FastAPI", "PostgreSQL", "MongoDB", "Docker", "Figma", "Flutter",
  "TensorFlow", "PyTorch", "AWS", "Git", "GraphQL", "Redis",
];

function Skeleton({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`bg-gray-100 rounded animate-pulse ${className}`} style={style} />;
}

export default function StudentProfilePage() {
  const [profile, setProfile]       = useState<StudentProfile | null>(null);
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState<StudentProfileRequest>({});
  const [skillInput, setSkillInput] = useState("");
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: StudentProfile = await res.json();
        setProfile(data);
        // Pre-fill form with existing values
        setForm({
          bio:          data.bio,
          domain:       data.domain,
          institution:  data.institution,
          studyYear:    data.studyYear,
          availability: data.availability,
          githubUrl:    data.githubUrl,
          linkedinUrl:  data.linkedinUrl,
          skills:       data.skills ?? [],
        });
      }
    } catch {
      setError("Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Send skills as array — Spring deserialises Set<String> from JSON array fine
        body: JSON.stringify({ ...form, skills: form.skills ?? [] }),
      });
      if (res.ok) {
        const updated: StudentProfile = await res.json();
        setProfile(updated);
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "Failed to save. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
    if (profile) {
      setForm({
        bio: profile.bio, domain: profile.domain, institution: profile.institution,
        studyYear: profile.studyYear, availability: profile.availability,
        githubUrl: profile.githubUrl, linkedinUrl: profile.linkedinUrl,
        skills: profile.skills ?? [],
      });
    }
  };

  const addSkill = (sk: string) => {
    const s = sk.trim();
    if (!s || (form.skills ?? []).includes(s)) return;
    setForm(f => ({ ...f, skills: [...(f.skills ?? []), s] }));
    setSkillInput("");
  };

  const removeSkill = (sk: string) =>
    setForm(f => ({ ...f, skills: (f.skills ?? []).filter(s => s !== sk) }));

  // Derived: full name from two fields
  const fullName = (p: StudentProfile) => `${p.firstName} ${p.lastName}`.trim();

  const initials = (p: StudentProfile) =>
    `${p.firstName?.[0] ?? ""}${p.lastName?.[0] ?? ""}`.toUpperCase() || "ST";

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition";
  const labelCls = "text-xs font-medium text-gray-500 mb-1 block";

  return (
    <>
      {/* Top bar */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/student/home" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Dashboard
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="text-sm font-semibold text-gray-900">My Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
              ✓ Saved
            </span>
          )}
          {!loading && (
            editing ? (
              <>
                <button
                  onClick={cancelEdit}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#1D9E75] text-white hover:bg-[#0F6E56] transition-colors disabled:opacity-50 font-medium"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#1D9E75] text-[#1D9E75] hover:bg-[#F0FAF6] transition-colors font-medium"
              >
                Edit profile
              </button>
            )
          )}
          <div className="w-8 h-8 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center">
            {profile ? initials(profile) : "ST"}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* SKELETON */}
          {loading ? (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-5">
                  <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-52" />
                    <Skeleton className="h-3 w-full mt-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <Skeleton className="h-4 w-36" />
                <div className="flex gap-6">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-2 flex-wrap">
                  {[80, 64, 72, 56, 88].map(w => (
                    <Skeleton key={w} className="h-7 rounded-full" style={{ width: `${w}px` }} />
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <Skeleton className="h-4 w-16" />
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-7 h-7 rounded-md" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))}
              </div>
            </>

          ) : !profile ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <p className="text-3xl mb-2">👤</p>
              <p className="text-sm font-medium text-gray-700">Profile not found</p>
              <p className="text-xs text-gray-400 mt-1">Start by completing your profile below.</p>
              <button
                onClick={() => setEditing(true)}
                className="mt-4 text-xs px-4 py-2 rounded-lg bg-[#1D9E75] text-white hover:bg-[#0F6E56] transition-colors font-medium"
              >
                Set up profile
              </button>
            </div>

          ) : (
            <>
              {/* ── Header card ── */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#F0FAF6] text-[#1D9E75] text-xl font-bold flex items-center justify-center shrink-0">
                    {initials(profile)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editing ? (
                      // Name is read-only (comes from User entity, not UserProfile)
                      <div className="space-y-3">
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-400 mb-0.5">Full name (from your account)</p>
                          <p className="text-sm font-medium text-gray-600">{fullName(profile)}</p>
                        </div>
                        <div>
                          <label className={labelCls}>Bio</label>
                          <textarea
                            className={inputCls}
                            rows={3}
                            value={form.bio ?? ""}
                            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                            placeholder="Tell others about yourself…"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg font-bold text-gray-900">{fullName(profile)}</h2>
                          {profile.availability && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${AVAILABILITY_COLORS[profile.availability] ?? "bg-gray-100 text-gray-500"}`}>
                              {AVAILABILITY_LABELS[profile.availability] ?? profile.availability}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>
                        {profile.bio ? (
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{profile.bio}</p>
                        ) : (
                          <p className="text-xs text-gray-300 mt-2 italic">No bio yet.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Academic & Availability ── */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Academic & Availability</p>
                {editing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Domain / Field</label>
                      <select
                        className={inputCls}
                        value={form.domain ?? ""}
                        onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                      >
                        <option value="">Select domain…</option>
                        {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Availability</label>
                      <select
                        className={inputCls}
                        value={form.availability ?? ""}
                        onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
                      >
                        <option value="">Select…</option>
                        {AVAILABILITY_OPTIONS.map(v => (
                          <option key={v} value={v}>{AVAILABILITY_LABELS[v]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Institution</label>
                      <input
                        className={inputCls}
                        value={form.institution ?? ""}
                        onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
                        placeholder="Your university or school"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Study year</label>
                      <input
                        className={inputCls}
                        type="number"
                        min={1} max={8}
                        value={form.studyYear ?? ""}
                        onChange={e => setForm(f => ({ ...f, studyYear: Number(e.target.value) || undefined }))}
                        placeholder="e.g. 2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Domain",       value: profile.domain },
                      { label: "Availability", value: profile.availability ? (AVAILABILITY_LABELS[profile.availability] ?? profile.availability) : null },
                      { label: "Institution",  value: profile.institution },
                      { label: "Study year",   value: profile.studyYear ? `Year ${profile.studyYear}` : null },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                        <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Skills ── */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Skills</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(editing ? form.skills : profile.skills)?.map(sk => (
                    <span
                      key={sk}
                      className="flex items-center gap-1 bg-[#F0FAF6] text-[#1D9E75] text-xs font-medium px-2.5 py-1 rounded-full border border-[#BCEAD9]"
                    >
                      {sk}
                      {editing && (
                        <button
                          onClick={() => removeSkill(sk)}
                          className="text-[#1D9E75] hover:text-red-500 transition-colors leading-none ml-0.5"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && !editing && (
                    <p className="text-xs text-gray-400">No skills added yet.</p>
                  )}
                </div>
                {editing && (
                  <>
                    <div className="flex gap-2 mb-3">
                      <input
                        className={`${inputCls} flex-1`}
                        placeholder="Type a skill and press Enter…"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                      />
                      <button
                        onClick={() => addSkill(skillInput)}
                        className="px-3 py-2 rounded-lg bg-[#1D9E75] text-white text-xs font-medium hover:bg-[#0F6E56] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SKILL_SUGGESTIONS
                        .filter(s => !(form.skills ?? []).includes(s))
                        .slice(0, 10)
                        .map(s => (
                          <button
                            key={s}
                            onClick={() => addSkill(s)}
                            className="bg-gray-100 hover:bg-[#F0FAF6] hover:text-[#1D9E75] text-gray-500 text-xs px-2 py-0.5 rounded-full transition-colors"
                          >
                            + {s}
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>

              {/* ── Links ── */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Links</p>
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>GitHub</label>
                      <input
                        className={inputCls}
                        value={form.githubUrl ?? ""}
                        onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>LinkedIn</label>
                      <input
                        className={inputCls}
                        value={form.linkedinUrl ?? ""}
                        onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[
                      { label: "GitHub",   value: profile.githubUrl,   icon: "⌥" },
                      { label: "LinkedIn", value: profile.linkedinUrl, icon: "in" },
                    ].map(({ label, value, icon }) =>
                      value ? (
                        <div key={label} className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                            {icon}
                          </span>
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#1D9E75] hover:underline truncate"
                          >
                            {value}
                          </a>
                        </div>
                      ) : (
                        <div key={label} className="flex items-center gap-3 opacity-40">
                          <span className="w-7 h-7 rounded-md bg-gray-100 text-gray-400 text-xs font-bold flex items-center justify-center">
                            {icon}
                          </span>
                          <span className="text-xs text-gray-400">{label} not added</span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}