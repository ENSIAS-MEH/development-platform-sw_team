"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { icon: "▣", label: "Dashboard",      href: "/admin/home" },
  { icon: "🏢", label: "Organizations", href: "/admin/organizations" },
  { icon: "🎓", label: "Students",      href: "/admin/students" },
  { icon: "📅", label: "Events",        href: "/admin/events" },
  { icon: "⚙️", label: "Settings",      href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    if (!token || role !== "ROLE_ADMIN") router.push("/auth/login");
  }, []);

  const logout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col border-r border-gray-200 bg-white transition-all duration-200 shrink-0"
        style={{ width: collapsed ? 64 : 220, minHeight: "100vh" }}
      >
        {/* Brand / Logo */}
        <div className={`flex items-center h-16 border-b border-gray-100 px-3 overflow-hidden
                         ${collapsed ? "justify-center" : "gap-2"}`}>
          {collapsed ? (
            /* Collapsed: show only the icon part of the logo */
            <div className="w-8 h-8 rounded-lg bg-[#1D9E75] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-black">C</span>
            </div>
          ) : (
            /* Expanded: show actual logo image */
            <Image
              src="/Img/collabyouth_logo_v1_fixed.png"
              alt="CollabYouth"
              width={140}
              height={48}
              className="object-contain"
              priority
            />
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors
                  ${active
                    ? "bg-[#F0FAF6] text-[#1D9E75] font-medium"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : ""}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-3 space-y-0.5 border-t border-gray-100 pt-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-xs text-gray-400
                        hover:text-gray-600 hover:bg-gray-50 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <span>{collapsed ? "→" : "←"}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={logout}
            className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm text-gray-500
                        hover:text-red-500 hover:bg-red-50 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <span className="shrink-0">↩</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}