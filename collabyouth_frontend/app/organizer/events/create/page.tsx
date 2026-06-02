"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUGGESTED_TAGS = [
  "IA", "Web", "Mobile", "Finance", "Blockchain",
  "DevOps", "Design", "Data", "Sécurité", "Cloud",
  "IoT", "Robotique", "Gaming", "Education", "Santé"
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
  const [isMounted, setIsMounted] = useState(false); // Pour éviter les erreurs d'hydration

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

  // ── Vérification token au chargement ──
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

  // ── Helpers ──
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

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.tags.length === 0) {
      setError("Ajoutez au moins un thème.");
      return;
    }
    if (new Date(form.endsAt) <= new Date(form.startsAt)) {
      setError("La date de fin doit être après la date de début.");
      return;
    }
    if (Number(form.maxTeamSize) < Number(form.minTeamSize)) {
      setError("La taille max doit être >= à la taille min.");
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
          }),
        }
      );

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(data.message || "Erreur lors de la création");

      router.push("/organizer/home");

    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  // Empêche le rendu tant que le composant n'est pas monté côté client
  if (!isMounted || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="w-8 h-8 border-4 border-[#1D9E75]/30 border-t-[#1D9E75] rounded-full animate-spin" />
      </div>
    );
  }

  // ── UI ──
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/organizer/home"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Mes événements
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-700">Créer un événement</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ── Formulaire ── */}
        <form onSubmit={handleSubmit} className="xl:col-span-2 space-y-6">

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm
                            px-4 py-3 rounded-xl flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Informations générales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-800 text-base mb-2">Informations générales</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Titre de l'événement <span className="text-red-500">*</span>
              </label>
              <input
                required type="text"
                placeholder="Ex: Hackathon IA Maroc 2025"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description / Objectif <span className="text-red-500">*</span>
              </label>
              <textarea
                required rows={4}
                placeholder="Décrivez l'objectif et le contexte de l'événement..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'événement <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "HACKATHON", label: "Hackathon", sub: "Compétition intensive en équipe" },
                  { value: "CHALLENGE", label: "Challenge", sub: "Défi thématique sur plusieurs jours" },
                ].map((t) => (
                  <button
                    key={t.value} type="button"
                    onClick={() => set("eventType", t.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.eventType === t.value
                        ? "border-[#1D9E75] bg-[#e8f5f0]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-800">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dates & Lieu */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-800 text-base mb-2">Dates & Lieu</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date de début <span className="text-red-500">*</span>
                </label>
                <input
                  required type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => set("startsAt", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                             focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date de fin <span className="text-red-500">*</span>
                </label>
                <input
                  required type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => set("endsAt", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                             focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lieu <span className="text-red-500">*</span>
              </label>
              <input
                required type="text"
                placeholder="Ex: Casablanca, Maroc"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format <span className="text-red-500">*</span>
              </label>
              <select
                value={form.eventFormat}
                onChange={(e) => set("eventFormat", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all bg-white"
              >
                <option value="IN_PERSON">Présentiel</option>
                <option value="ONLINE">En ligne</option>
                <option value="HYBRID">Hybride</option>
              </select>
            </div>
          </div>

          {/* Équipes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-800 text-base mb-2">Équipes & Participants</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Équipes max", field: "maxTeams" as const,     placeholder: "Ex: 50" },
                { label: "Taille min",  field: "minTeamSize" as const, placeholder: "2" },
                { label: "Taille max",  field: "maxTeamSize" as const, placeholder: "5" },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {f.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    required type="number" min={1} max={f.field === "maxTeams" ? undefined : 20}
                    placeholder={f.placeholder}
                    value={form[f.field]}
                    onChange={(e) => set(f.field, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                               focus:border-transparent transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Prix & Thèmes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-800 text-base mb-2">Prix & Thèmes</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                🥇 1er prix
              </label>
              <input
                required
                type="text"
                placeholder="Ex: 10 000 MAD + stage"
                value={form.prizeFirst}
                onChange={(e) => set("prizeFirst", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                🥈 2e prix
              </label>
              <input
                required
                type="text"
                placeholder="Ex: 5 000 MAD + goodies"
                value={form.prizeSecond}
                onChange={(e) => set("prizeSecond", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                🥉 3e prix
              </label>
              <input
                required
                type="text"
                placeholder="Ex: 2 000 MAD"
                value={form.prizeThird}
                onChange={(e) => set("prizeThird", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Thèmes / Compétences ciblées <span className="text-red-500">*</span>
              </label>

              <div className="flex flex-wrap gap-2 mb-3">
                {form.tags.map((tag) => (
                  <span key={tag}
                    className="flex items-center gap-1 bg-[#e8f5f0] text-[#1D9E75]
                               text-xs px-3 py-1 rounded-full font-medium">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition-colors ml-1">×</button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text" placeholder="Ajouter un thème..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }}}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                             focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => addTag(tagInput)}
                  className="px-4 py-2.5 bg-[#1D9E75] text-white rounded-xl text-sm
                             hover:bg-[#0F6E56] transition-colors">
                  Ajouter
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {SUGGESTED_TAGS.filter((t) => !form.tags.includes(t)).map((t) => (
                  <button key={t} type="button" onClick={() => addTag(t)}
                    className="text-xs border border-gray-200 text-gray-500 px-3 py-1
                               rounded-full hover:border-[#1D9E75] hover:text-[#1D9E75]
                               transition-colors">
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white font-semibold
                       py-4 rounded-xl transition-colors duration-200
                       disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publication en cours...
              </span>
            ) : "🚀 Publier l'événement"}
          </button>
        </form>

        {/* ── Aperçu ── */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6 space-y-4">
            <h2 className="font-bold text-gray-800 text-base">Aperçu de la carte</h2>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#e8f5f0] flex flex-col
                                items-center justify-center text-[#1D9E75] flex-shrink-0">
                  <span className="text-lg font-bold leading-none">
                    {form.startsAt ? new Date(form.startsAt).getDate() : "--"}
                  </span>
                  <span className="text-[10px] font-semibold">
                    {form.startsAt
                      ? new Date(form.startsAt).toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()
                      : "---"}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 leading-tight">
                    {form.title || "Titre de l'événement"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {form.location || "Lieu"} ·{" "}
                    {form.eventFormat === "IN_PERSON" ? "Présentiel"
                      : form.eventFormat === "ONLINE" ? "En ligne" : "Hybride"}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {form.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full mb-2">
                <div className="h-full w-0 bg-[#1D9E75] rounded-full" />
              </div>
              <p className="text-xs text-gray-400">0 / {form.maxTeams || "?"} inscrits</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Checklist de publication</h3>
              <div className="space-y-2">
                {[
                  { label: "Titre renseigné",         ok: form.title.length > 0 },
                  { label: "Description ajoutée",    ok: form.description.length > 0 },
                  { label: "Dates définies",          ok: !!form.startsAt && !!form.endsAt },
                  { label: "Nombre de places défini", ok: !!form.maxTeams },
                  { label: "Thèmes recommandés",      ok: form.tags.length > 0 },
                  { label: "Prix défini",             ok: form.prizeFirst.length > 0 }, // ← Fixé ici
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <span className={item.ok ? "text-[#1D9E75]" : "text-gray-300"}>
                      {item.ok ? "✅" : "⏳"}
                    </span>
                    <span className={item.ok ? "text-gray-700" : "text-gray-400"}>
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
