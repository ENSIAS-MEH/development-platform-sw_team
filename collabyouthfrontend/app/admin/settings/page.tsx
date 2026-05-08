"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm]   = useState({ name: "Admin", email: "admin@collabyouth.com", currentPwd: "", newPwd: "" });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );

  const inputClass = `w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
    focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-all`;

  return (
    <>
      <header className="h-14 border-b border-gray-200 bg-white flex items-center px-8 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Settings</h1>
          <p className="text-xs text-gray-400">Manage your account preferences</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6 max-w-2xl">

        {saved && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm
                          px-4 py-3 rounded-lg flex items-center gap-2">
            ✓ Changes saved successfully
          </div>
        )}

        <form onSubmit={handleSave}>

          <Section title="Profile">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-[#1D9E75] text-white font-black text-lg
                              flex items-center justify-center shrink-0">
                {form.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{form.name}</p>
                <p className="text-xs text-gray-400">{form.email}</p>
                <span className="text-xs bg-[#F0FAF6] text-[#1D9E75] font-medium px-2 py-0.5 rounded mt-1 inline-block">
                  Administrator
                </span>
              </div>
            </div>

            <Field label="Display name">
              <input type="text" value={form.name} className={inputClass}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email address">
              <input type="email" value={form.email} className={inputClass}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </Field>
          </Section>

          <Section title="Change password">
            <Field label="Current password">
              <input type="password" placeholder="••••••••" value={form.currentPwd} className={inputClass}
                onChange={e => setForm({ ...form, currentPwd: e.target.value })} />
            </Field>
            <Field label="New password">
              <input type="password" placeholder="Min. 8 characters" value={form.newPwd} className={inputClass}
                onChange={e => setForm({ ...form, newPwd: e.target.value })} />
            </Field>
          </Section>

          <Section title="Platform">
            {[
              { label: "Email notifications for new orgs", defaultChecked: true  },
              { label: "Weekly summary report",            defaultChecked: false },
              { label: "Security alerts",                  defaultChecked: true  },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer
                                  peer-checked:bg-[#1D9E75] transition-colors
                                  after:content-[''] after:absolute after:top-0.5 after:left-0.5
                                  after:bg-white after:rounded-full after:h-4 after:w-4
                                  after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </Section>

          <button type="submit"
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#1D9E75] text-white
                       hover:bg-[#0F6E56] transition-colors">
            Save changes
          </button>

        </form>
      </div>
    </>
  );
}