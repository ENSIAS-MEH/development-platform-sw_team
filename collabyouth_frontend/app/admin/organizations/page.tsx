"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type OrgStatus = "PENDING" | "ACTIVE" | "REJECTED";

interface Org {
  id: string;
  name: string;
  email: string;
  description?: string;
  websiteUrl?: string;
  location?: string;
  status: OrgStatus;
}

type Tab = "pending" | "ACTIVE" | "rejected" | "all";

const AVATAR_COLORS = [
  { bg: "#E1F5EE", color: "#0F6E56" },
  { bg: "#E6F1FB", color: "#185FA5" },
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#FAEEDA", color: "#854F0B" },
  { bg: "#FBEAF0", color: "#993556" },
];

function avatarColor(name: string) {
  let h = 0;

  for (const c of name) {
    h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  }

  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}

/* ---------- UI COMPONENTS ---------- */

function StatusBadge({ status }: { status: OrgStatus }) {
  const map = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
  };

  const label = {
    PENDING: "⏳ Pending",
    ACTIVE: "✅ Approved",
    REJECTED: "❌ Rejected",
  };

  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full border font-medium ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-white shadow-sm text-emerald-700"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- PAGE ---------- */

export default function AdminOrganizationsPage() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("pending");
  const [allOrgs, setAllOrgs] = useState<Org[]>([]);
  const [pendingOrgs, setPendingOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  function getToken() {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      ""
    );
  }

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    };
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  const loadOrgs = useCallback(async () => {
    setLoading(true);

    try {
      const [pendingRes, allRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations/pending`,
          {
            headers: authHeaders(),
          }
        ),

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations`, {
          headers: authHeaders(),
        }),
      ]);

      if (pendingRes.status === 401 || allRes.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!pendingRes.ok || !allRes.ok) {
        throw new Error();
      }

      setPendingOrgs(await pendingRes.json());
      setAllOrgs(await allRes.json());
    } catch {
      showToast("Failed to load organizations", "error");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  async function handleAction(
    id: string,
    action: "approve" | "reject"
  ) {
    setLoadingIds((prev) => new Set(prev).add(id));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations/${id}/${action}`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      showToast(
        action === "approve"
          ? "Organization approved successfully"
          : "Organization rejected",
        action === "approve" ? "success" : "error"
      );

      await loadOrgs();
    } catch {
      showToast("Action failed", "error");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const displayedOrgs =
    tab === "pending"
      ? pendingOrgs
      : tab === "ACTIVE"
      ? allOrgs.filter((o) => o.status === "ACTIVE")
      : tab === "rejected"
      ? allOrgs.filter((o) => o.status === "REJECTED")
      : allOrgs;

  const ACTIVECount = allOrgs.filter(
    (o) => o.status === "ACTIVE"
  ).length;

  const emptyMessage =
    tab === "pending"
      ? "No organizations need approval right now 🎉"
      : tab === "ACTIVE"
      ? "No approved organizations yet."
      : tab === "rejected"
      ? "No rejected organizations."
      : "No organizations available.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Organization Review
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage organization onboarding requests
            </p>
          </div>

          <button
            onClick={loadOrgs}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Organizations",
              value: allOrgs.length,
            },
            {
              label: "Pending Review",
              value: pendingOrgs.length,
            },
            {
              label: "Approved",
              value: ACTIVECount,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/80 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">
                {item.label}
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "—" : item.value}
              </h2>
            </div>
          ))}
        </div>

        {/* TABS */}

        <div className="bg-gray-100 p-1 rounded-2xl flex gap-1">
          <TabButton
            active={tab === "pending"}
            onClick={() => setTab("pending")}
          >
            ⏳ Pending
          </TabButton>

          <TabButton
            active={tab === "ACTIVE"}
            onClick={() => setTab("ACTIVE")}
          >
            ✅ Approved
          </TabButton>

          <TabButton
            active={tab === "rejected"}
            onClick={() => setTab("rejected")}
          >
            ❌ Rejected
          </TabButton>

          <TabButton
            active={tab === "all"}
            onClick={() => setTab("all")}
          >
            🏢 All
          </TabButton>
        </div>

        {/* TOAST */}

        {toast && (
          <div
            className={`px-4 py-3 rounded-2xl border text-sm font-medium ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* CONTENT */}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />

            <p className="text-sm font-medium">
              Loading organizations...
            </p>
          </div>
        ) : displayedOrgs.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md border border-white rounded-3xl shadow-sm py-20 px-6 text-center">
            <div className="text-6xl mb-4">🏢</div>

            <h3 className="text-xl font-semibold text-gray-800">
              Nothing here
            </h3>

            <p className="text-gray-500 mt-2">
              {emptyMessage}
            </p>

            {tab === "pending" && (
              <p className="text-xs text-gray-400 mt-4">
                Everything is up to date.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedOrgs.map((org) => {
              const c = avatarColor(org.name);
              const busy = loadingIds.has(org.id);

              return (
                <div
                  key={org.id}
                  className="bg-white/90 backdrop-blur-md border border-white rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
                >

                  {/* TOP */}

                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        background: c.bg,
                        color: c.color,
                      }}
                    >
                      {initials(org.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-semibold text-gray-900 text-base">
                            {org.name}
                          </h2>

                          <p className="text-sm text-gray-500">
                            {org.email}
                          </p>
                        </div>

                        <StatusBadge status={org.status} />
                      </div>

                      {org.description && (
                        <p className="text-sm text-gray-600 leading-relaxed mt-3">
                          {org.description}
                        </p>
                      )}

                      {(org.location || org.websiteUrl) && (
                        <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
                          {org.location && (
                            <span className="flex items-center gap-1">
                              📍 {org.location}
                            </span>
                          )}

                          {org.websiteUrl && (
                            <a
                              href={org.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline flex items-center gap-1"
                            >
                              🌐{" "}
                              {org.websiteUrl.replace(
                                /^https?:\/\//,
                                ""
                              )}
                            </a>
                          )}
                        </div>
                      )}

                      {/* ACTIONS */}

                      {org.status === "PENDING" && (
                        <div className="flex gap-3 mt-5">
                          <button
                            disabled={busy}
                            onClick={() =>
                              handleAction(org.id, "approve")
                            }
                            className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition disabled:opacity-50"
                          >
                            {busy ? "Processing..." : "✅ Approve"}
                          </button>

                          <button
                            disabled={busy}
                            onClick={() =>
                              handleAction(org.id, "reject")
                            }
                            className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50"
                          >
                            {busy ? "Processing..." : "❌ Reject"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}