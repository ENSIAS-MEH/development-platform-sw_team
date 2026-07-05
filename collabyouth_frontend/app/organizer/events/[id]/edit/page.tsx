"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [newTag, setNewTag] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    eventType: "HACKATHON",
    eventFormat: "IN_PERSON",
    location: "",
    startsAt: "",
    endsAt: "",
    maxTeams: 10,
    minTeamSize: 2,
    maxTeamSize: 5,
    prizeFirst: "",
    prizeSecond: "",
    prizeThird: "",
    tags: [] as string[],
  });

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!id) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/org/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error("Unable to load event data");
        const data = await res.json();
        
        let formattedStartsAt = "";
        let formattedEndsAt = "";
        if (data.startsAt) formattedStartsAt = new Date(data.startsAt).toISOString().substring(0, 16);
        if (data.endsAt) formattedEndsAt = new Date(data.endsAt).toISOString().substring(0, 16);

        setForm({
          title: data.title || "",
          description: data.description || "",
          eventType: data.eventType || "HACKATHON",
          eventFormat: data.eventFormat || "IN_PERSON",
          location: data.location || "",
          startsAt: formattedStartsAt,
          endsAt: formattedEndsAt,
          maxTeams: data.maxTeams ?? 10,
          minTeamSize: data.minTeamSize ?? 2,
          maxTeamSize: data.maxTeamSize ?? 5,
          prizeFirst: data.prizeFirst && String(data.prizeFirst) !== "null" ? String(data.prizeFirst).trim() : "",
          prizeSecond: data.prizeSecond && String(data.prizeSecond) !== "null" ? String(data.prizeSecond).trim() : "",
          prizeThird: data.prizeThird && String(data.prizeThird) !== "null" ? String(data.prizeThird).trim() : "",
          tags: data.tags || [],
        });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchEventData();
  }, [id]);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    if (!form.tags.includes(newTag.trim())) {
      setForm({ ...form, tags: [...form.tags, newTag.trim()] });
    }
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        title: form.title,
        description: form.description,
        eventType: form.eventType,
        eventFormat: form.eventFormat,
        location: form.location,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        maxTeams: Number(form.maxTeams),
        minTeamSize: Number(form.minTeamSize),
        maxTeamSize: Number(form.maxTeamSize),
        prizeFirst: form.prizeFirst,
        prizeSecond: form.prizeSecond || null,
        prizeThird: form.prizeThird || null,
        tags: form.tags,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/org/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error updating the event");
      }

      router.push("/organizer/home");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-[#1D9E75]/30 border-t-[#1D9E75] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    // w-full min-h-screen removes the "restricted box" effect to occupy 100% of the screen width
    <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10">
      
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* PAGE HEADER */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
            <p className="text-sm text-gray-500 mt-1">Adjust all structural configurations, details and cash prizes</p>
          </div>
          <Link 
            href="/organizer/home" 
            className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 shadow-sm"
          >
            ← Back
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-4 rounded-xl mb-6 border border-red-100">
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TITLE */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Event Title</label>
            <input
              type="text"
              className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Description / Competition Rules</label>
            <textarea
              rows={6}
              className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          {/* TYPE & FORMAT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Event Type</label>
              <select
                className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                required
              >
                <option value="HACKATHON">Hackathon 💻</option>
                <option value="CHALLENGE">Challenge 🏆</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Event Format</label>
              <select
                className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
                value={form.eventFormat}
                onChange={(e) => setForm({ ...form, eventFormat: e.target.value })}
                required
              >
                <option value="IN_PERSON">In Person 📍</option>
                <option value="ONLINE">Online 🌐</option>
                <option value="HYBRID">Hybrid 🔄</option>
              </select>
            </div>
          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Venue / Video Conference Link</label>
            <input
              type="text"
              className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>

          {/* DATES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Start Date and Time</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">End Date and Time</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white transition-all shadow-sm"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                required
              />
            </div>
          </div>

          {/* TEAM CONFIGURATION */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4 shadow-inner">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Team Size Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Max total teams</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 bg-white p-3 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] shadow-sm"
                  value={form.maxTeams}
                  onChange={(e) => setForm({ ...form, maxTeams: parseInt(e.target.value) || 0 })}
                  min={1} required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Minimum members per team</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 bg-white p-3 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] shadow-sm"
                  value={form.minTeamSize}
                  onChange={(e) => setForm({ ...form, minTeamSize: parseInt(e.target.value) || 0 })}
                  min={1} required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Maximum members per team</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 bg-white p-3 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] shadow-sm"
                  value={form.maxTeamSize}
                  onChange={(e) => setForm({ ...form, maxTeamSize: parseInt(e.target.value) || 0 })}
                  min={1} required
                />
              </div>
            </div>
          </div>

          {/* PRIZES */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Prizes (Cash Prizes)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] text-amber-500 font-semibold">🥇 1st Prize</span>
                <input 
                  key={`prize1-${form.prizeFirst}`}
                  type="text"
                  className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm mt-1.5 focus:outline-none focus:border-[#1D9E75] focus:bg-white shadow-sm"
                  defaultValue={form.prizeFirst} 
                  onChange={(e) => setForm({...form, prizeFirst: e.target.value})}
                  placeholder="e.g. $1000"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold">🥈 2nd Prize</span>
                <input 
                  key={`prize2-${form.prizeSecond}`}
                  type="text"
                  className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm mt-1.5 focus:outline-none focus:border-[#1D9E75] focus:bg-white shadow-sm"
                  defaultValue={form.prizeSecond} 
                  onChange={(e) => setForm({...form, prizeSecond: e.target.value})}
                  placeholder="Optional"
                />
              </div>

              <div>
                <span className="text-[11px] text-amber-700 font-semibold">🥉 3rd Prize</span>
                <input 
                  key={`prize3-${form.prizeThird}`}
                  type="text"
                  className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm mt-1.5 focus:outline-none focus:border-[#1D9E75] focus:bg-white shadow-sm"
                  defaultValue={form.prizeThird} 
                  onChange={(e) => setForm({...form, prizeThird: e.target.value})}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* TAGS & SKILLS */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Skills & Technologies Required</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a skill (e.g. React, Docker, UI/UX...)"
                className="flex-1 border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm focus:outline-none focus:border-[#1D9E75] focus:bg-white shadow-sm"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 border border-dashed border-gray-200 rounded-xl min-h-[55px] items-center bg-gray-50/50">
              {form.tags.length === 0 ? (
                <span className="text-xs text-gray-400 ml-1">No skills or tags specified yet.</span>
              ) : (
                form.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1.5 text-xs bg-[#e8f5f0] text-[#1D9E75] font-bold pl-3 pr-2 py-1.5 rounded-full border border-[#1D9E75]/10 shadow-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="w-4 h-4 rounded-full hover:bg-[#1D9E75]/20 flex items-center justify-center text-[12px] font-bold transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* ── ACTION BAR (CANCEL OR SAVE) ── */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
            <Link
              href="/organizer/home"
              className="px-5 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
            >
              Discard changes
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-xl font-bold text-sm transition-colors shadow-sm disabled:bg-gray-300 flex items-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? "Saving..." : "Save and Publish"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}