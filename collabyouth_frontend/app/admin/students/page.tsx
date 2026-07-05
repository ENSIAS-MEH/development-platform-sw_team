"use client";

import { useState, useEffect } from "react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setStudents(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const badge = (s: string) =>
    s === "ACTIVE"  ? "bg-emerald-50 text-emerald-700" :
    s === "PENDING" ? "bg-amber-50 text-amber-700" :
                      "bg-red-50 text-red-600";

  const initials = (s: Student) =>
    `${s.firstName?.[0] ?? ""}${s.lastName?.[0] ?? ""}`.toUpperCase();

  const BG_COLORS = ["#FEF3C7", "#DBEAFE", "#FCE7F3", "#E0E7FF", "#F0FAF6"];

  return (
    <>
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Students</h1>
          <p className="text-xs text-gray-400">{students.length} registered users</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]
                       placeholder-gray-400 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Student", "Email", "Role", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm">No students found</td></tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                             style={{ background: BG_COLORS[i % BG_COLORS.length], color: "#374151" }}>
                          {initials(s)}
                        </div>
                        <span className="font-medium text-gray-900">{s.firstName} {s.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{s.email}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {s.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}