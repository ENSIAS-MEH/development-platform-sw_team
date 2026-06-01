"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/student/home",           label: "Dashboard",      icon: "⊞" },
  { href: "/student/profile",   label: "My Profile",     icon: "◎" },
  { href: "/student/partners",  label: "Find Partners",  icon: "⊕" },
  { href: "/student/events",    label: "Events",         icon: "📅" },
  { href: "/student/invitations", label: "Invitations",  icon: "✉" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    // ← bg-white on the entire shell, no dark bg anywhere
    <div className="flex h-screen bg-white overflow-hidden">

      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-gray-200">
          <span className="text-base font-bold text-[#1D9E75] tracking-tight">CollabYouth</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== "/student" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#F0FAF6] text-[#1D9E75]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: profile quick-link */}
        <div className="px-3 pb-4">
          <Link
            href="/student/profile"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div className="w-7 h-7 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center shrink-0">
              ST
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">My Profile</p>
              <p className="text-xs text-gray-400 truncate">View & edit</p>
            </div>
            <span className="text-gray-300 group-hover:text-gray-500 text-xs">→</span>
          </Link>
        </div>
      </aside>

      {/* Page content — bg-gray-50 gives the subtle off-white inner bg cards sit on */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {children}
      </main>
    </div>
  );
}