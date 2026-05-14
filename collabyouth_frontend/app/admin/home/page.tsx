"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface OrgSummary {
  id: string; name: string; email: string;
  description: string; websiteUrl: string; location: string; status: string;
}

const STAT_COLORS = ["#1D9E75", "#059669", "#D97706", "#DC2626"];

export default function AdminHomePage() {
  const [orgs, setOrgs]           = useState<OrgSummary[]>([]);
  const [pending, setPending]     = useState<OrgSummary[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [a, p] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations`,         { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations/pending`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (a.ok) setOrgs(await a.json());
    if (p.ok) setPending(await p.json());
  };

  const action = async (id: string, act: "approve" | "reject") => {
    setLoadingId(id);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations/${id}/${act}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    await fetchAll();
    setLoadingId(null);
  };

  const stats = [
    { label: "Total orgs",  value: orgs.length,                                  color: STAT_COLORS[0] },
    { label: "Active",      value: orgs.filter(o => o.status === "ACTIVE").length,   color: STAT_COLORS[1] },
    { label: "Pending",     value: orgs.filter(o => o.status === "PENDING").length,  color: STAT_COLORS[2] },
    { label: "Rejected",    value: orgs.filter(o => o.status === "REJECTED").length, color: STAT_COLORS[3] },
  ];

  const chartData = [
    { name: "Active",   v: stats[1].value },
    { name: "Pending",  v: stats[2].value },
    { name: "Rejected", v: stats[3].value },
  ];

  const recent = [...orgs].reverse().slice(0, 6);

  const badge = (s: string) =>
    s === "ACTIVE"   ? "bg-emerald-50 text-emerald-700" :
    s === "PENDING"  ? "bg-amber-50 text-amber-700" :
                       "bg-red-50 text-red-600";

  return (
    <>
      {/* Top bar */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400">Overview of your platform</p>
        </div>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {pending.length} awaiting approval
            </span>
          )}
          <div className="w-8 h-8 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center">
            AD
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Organizations by status</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={36}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "#F9FAFB" }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                />
                <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={STAT_COLORS[i + 1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pending quick actions */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Pending approvals
              {pending.length > 0 && (
                <span className="ml-2 bg-amber-50 text-amber-600 text-xs font-semibold px-1.5 py-0.5 rounded">
                  {pending.length}
                </span>
              )}
            </p>
            {pending.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-1">✓</p>
                <p className="text-xs text-gray-400">All caught up</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pending.slice(0, 4).map(org => (
                  <div key={org.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-7 h-7 rounded-md bg-[#F0FAF6] text-[#1D9E75] text-xs font-bold flex items-center justify-center shrink-0">
                      {org.name[0]}
                    </div>
                    <span className="text-xs text-gray-700 flex-1 truncate font-medium">{org.name}</span>
                    <button onClick={() => action(org.id, "approve")} disabled={loadingId === org.id}
                      className="text-xs px-2 py-1 rounded bg-[#1D9E75] text-white hover:bg-[#0F6E56] transition-colors disabled:opacity-40">
                      ✓
                    </button>
                    <button onClick={() => action(org.id, "reject")} disabled={loadingId === org.id}
                      className="text-xs px-2 py-1 rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40">
                      ✗
                    </button>
                  </div>
                ))}
                {pending.length > 4 && (
                  <p className="text-xs text-gray-400 text-center pt-1">+{pending.length - 4} more</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Recent organizations</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Organization", "Email", "Location", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(org => (
                <tr key={org.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-[#F0FAF6] text-[#1D9E75] text-xs font-bold flex items-center justify-center">
                        {org.name[0]}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{org.email}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{org.location || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge(org.status)}`}>
                      {org.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}