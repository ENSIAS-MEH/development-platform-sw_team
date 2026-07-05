"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUGGESTED_TAGS = [
  "AI", "Web", "Mobile", "Finance", "Blockchain",
  "DevOps", "Design", "Data", "Security", "Cloud",
  "IoT", "Robotics", "Gaming", "Education", "Health"
];

interface FormState {
  title: string;
  description: string;
  eventType: string;
  eventFormat: string;
  location: string;
  startsAt: string;
  endsAt: string;
  maxTeams: string;
  minTeamSize: string;
  maxTeamSize: string;
  prizeFirst: string;
  prizeSecond: string;
  prizeThird: string;
  tags: string[];
}

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [form, setForm] = useState<FormState>({
    title:       "",
    description: "",
    eventType:   "HACKATHON",
    eventFormat: "IN_PERSON",
    location:    "",
    startsAt:    "",
    endsAt:      "",
    maxTeams:    "",
    minTeamSize: "2",
    maxTeamSize: "5",
    prizeFirst:  "",
    prizeSecond: "",
    prizeThird:  "",
    tags:        [],
  });

  useEffect(() => {
    setIsMounted(true);
    const storedToken = localStorage.getItem("token");
    const storedRole  = localStorage.getItem("role");

    if (!storedToken || storedRole !== "ROLE_ORG") {
      router.push("/auth/login");
      return;
    }

    setToken(storedToken);
  }, [router]);

  const set = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.tags.length === 0) {
      setError("Add at least one theme.");
      return;
    }
    if (new Date(form.endsAt) <= new Date(form.startsAt)) {
      setError("End date must be after start date.");
      return;
    }
    if (Number(form.maxTeamSize) < Number(form.minTeamSize)) {
      setError("Max size must be >= min size.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/org/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            maxTeams:    Number(form.maxTeams),
            minTeamSize: Number(form.minTeamSize),
            maxTeamSize: Number(form.maxTeamSize),
            startsAt: new Date(form.startsAt).toISOString(),
            endsAt:   new Date(form.endsAt).toISOString(),
            prizeSecond: form.prizeSecond || null,
            prizeThird:  form.prizeThird || null,
          }),
        }
      );

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(data.message || "Error creating event");

      router.push("/organizer/home");

    } catch (err: any) {
      setError(err.message || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted || !token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <span className="w-8 h-8 border-4 border-[#1D9E75]/30 border-t-[#1D9E75] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    // w-full removes constraint to force full horizontal screen
    <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10">

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-3 mb-8 w-full border-b border-gray-200 pb-4">
        <Link
          href="/organizer/home"
          className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← My events
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-gray-800">Create an event</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">

        {/* ── MAIN FORM (Full screen extended over 2 wide columns) ── */}
        <form onSubmit={handleSubmit} className="xl:col-span-2 space-y-6">

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* General Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="font-bold text-gray-900 text-base border-b border-gray-50 pb-2">General Information</h2>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                required type="text"
                placeholder="Ex: Morocco AI Hackathon 2026"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Description / Objective & Rules <span className="text-red-500">*</span>
              </label>
              <textarea
                required rows={5}
                placeholder="Describe precisely the flow, context and rules of the competition..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all resize-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Event Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: "HACKATHON", label: "Hackathon 💻", sub: "Intensive programming competition" },
                  { value: "CHALLENGE", label: "Challenge 🏆", sub: "Thematic or open innovation challenge" },
                ].map((t) => (
                  <button
                    key={t.value} type="button"
                    onClick={() => set("eventType", t.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all shadow-sm ${
                      form.eventType === t.value
                        ? "border-[#1D9E75] bg-[#e8f5f0]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <p className="font-bold text-sm text-gray-800">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{t.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dates & Location */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="font-bold text-gray-900 text-base border-b border-gray-50 pb-2">Planning & Location</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  required type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => set("startsAt", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  required type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => set("endsAt", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Physical location or meeting URL <span className="text-red-500">*</span>
              </label>
              <input
                required type="text"
                placeholder="Ex: Technopark Casablanca or Discord Link"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Structural Format <span className="text-red-500">*</span>
              </label>
              <select
                value={form.eventFormat}
                onChange={(e) => set("eventFormat", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
              >
                <option value="IN_PERSON">In-Person 📍</option>
                <option value="ONLINE">Online 🌐</option>
                <option value="HYBRID">Hybrid 🔄</option>
              </select>
            </div>
          </div>

          {/* Teams */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-900 text-base border-b border-gray-50 pb-2">Team Dimension Configuration</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                  Max Teams <span className="text-red-500">*</span>
                </label>
                <input
                  required type="number" min={1}
                  placeholder="Ex: 30"
                  value={form.maxTeams}
                  onChange={(e) => set("maxTeams", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                  Min Members <span className="text-red-500">*</span>
                </label>
                <input
                  required type="number" min={1} max={20}
                  value={form.minTeamSize}
                  onChange={(e) => set("minTeamSize", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                  Max Members <span className="text-red-500">*</span>
                </label>
                <input
                  required type="number" min={1} max={20}
                  value={form.maxTeamSize}
                  onChange={(e) => set("maxTeamSize", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Prizes & Themes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="font-bold text-gray-900 text-base border-b border-gray-50 pb-2">Rewards & Themes</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-amber-500 font-semibold mb-1">🥇 1st Prize <span className="text-red-500">*</span></label>
                <input
                  required type="text"
                  placeholder="Ex: 10,000 MAD"
                  value={form.prizeFirst}
                  onChange={(e) => set("prizeFirst", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">🥈 2nd Prize (Optional)</label>
                <input
                  type="text"
                  placeholder="Ex: 5,000 MAD"
                  value={form.prizeSecond}
                  onChange={(e) => set("prizeSecond", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] text-amber-700 font-semibold mb-1">🥉 3rd Prize (Optional)</label>
                <input
                  type="text"
                  placeholder="Ex: 2,500 MAD"
                  value={form.prizeThird}
                  onChange={(e) => set("prizeThird", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Targeted Skills / Associated Tags <span className="text-red-500">*</span>
              </label>

              <div className="flex flex-wrap gap-1.5 p-3 border border-dashed border-gray-200 rounded-xl min-h-[50px] items-center bg-gray-50/50 mb-3">
                {form.tags.length === 0 ? (
                  <span className="text-xs text-gray-400 ml-1">Select or create at least one mandatory tag.</span>
                ) : (
                  form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 bg-[#e8f5f0] text-[#1D9E75] text-xs px-3 py-1.5 rounded-full font-bold border border-[#1D9E75]/10 shadow-sm">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:bg-[#1D9E75]/20 rounded-full w-4 h-4 flex items-center justify-center font-bold text-sm">×</button>
                    </span>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text" placeholder="Enter a custom skill..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }}}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white shadow-sm"
                />
                <button type="button" onClick={() => addTag(tagInput)} className="px-5 bg-gray-900 text-white font-semibold rounded-xl text-xs hover:bg-gray-800 shadow-sm transition-colors">
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {SUGGESTED_TAGS.filter((t) => !form.tags.includes(t)).map((t) => (
                  <button key={t} type="button" onClick={() => addTag(t)} className="text-xs bg-white border border-gray-200 text-gray-500 px-3 py-1.5 rounded-full hover:border-[#1D9E75] hover:text-[#1D9E75] shadow-sm transition-colors">
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── SUBMISSION AND CANCELLATION SAFETY BAR AT BOTTOM ── */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
            <Link
              href="/organizer/home"
              className="px-5 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-xl font-bold text-sm transition-colors shadow-sm disabled:bg-gray-300 flex items-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? "Creating event..." : "🚀 Publish Event"}
            </button>
          </div>
        </form>

        {/* ── SIDE PREVIEW (Fixed on scroll) ── */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-base border-b border-gray-50 pb-2">Real-time Preview</h2>

            {/* Interactive Card */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50 shadow-inner">
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#e8f5f0] flex flex-col items-center justify-center text-[#1D9E75] flex-shrink-0 border border-[#1D9E75]/10 shadow-sm">
                  <span className="text-base font-black leading-none">
                    {form.startsAt ? new Date(form.startsAt).getDate() : "--"}
                  </span>
                  <span className="text-[9px] font-bold mt-0.5">
                    {form.startsAt
                      ? new Date(form.startsAt).toLocaleDateString("en-US", { month: "short" }).toUpperCase()
                      : "---"}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-sm text-gray-900 leading-tight truncate">
                    {form.title || "Event Title"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    📍 {form.location || "Location not specified"} ·{" "}
                    {form.eventFormat === "IN_PERSON" ? "In-Person"
                      : form.eventFormat === "ONLINE" ? "Online" : "Hybrid"}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full mb-2 mt-4">
                <div className="h-full w-0 bg-[#1D9E75] rounded-full" />
              </div>
              <p className="text-[11px] font-medium text-gray-400">0 / {form.maxTeams || "?"} teams registered</p>
            </div>

            {/* Checklist */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Requirements Check</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Title required", ok: form.title.length > 0 },
                  { label: "Description / Objectives", ok: form.description.length > 0 },
                  { label: "Schedule defined", ok: !!form.startsAt && !!form.endsAt },
                  { label: "Team quota", ok: !!form.maxTeams },
                  { label: "At least 1 Theme", ok: form.tags.length > 0 },
                  { label: "Cash prize", ok: form.prizeFirst.length > 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span className={item.ok ? "text-[#1D9E75]" : "text-gray-300 animate-pulse"}>
                      {item.ok ? "✅" : "⏳"}
                    </span>
                    <span className={`font-medium ${item.ok ? "text-gray-700" : "text-gray-400"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}