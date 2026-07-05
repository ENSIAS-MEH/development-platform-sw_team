"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface EventDetails {
  id: string;
  title: string;
  minTeamSize: number;
  maxTeamSize: number;
  maxTeams: number;
  registeredTeams: number;
}

interface StudentSummary {
  id: string;        // ✅ UUID = String (pas number)
  firstName: string;
  lastName: string;
  email: string;
}

export default function RegisterTeamPage() {
  const router = useRouter();
  const { id: eventId } = useParams();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [teamName, setTeamName] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentSummary[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<StudentSummary[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // 1. Charger les détails de l'événement
  useEffect(() => {
    async function loadEventDetails() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const events: EventDetails[] = await res.json();
          const currentEvent = events.find(e => e.id === eventId);
          if (currentEvent) {
            setEvent(currentEvent);
          } else {
            alert("Événement introuvable");
            router.push("/student/events");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEvent(false);
      }
    }
    if (eventId) loadEventDetails();
  }, [eventId, token, router]);

  // 2. Recherche dynamique des camarades
  useEffect(() => {
    if (!studentQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/students?q=${studentQuery}&page=1&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.students || []);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [studentQuery, token]);

  const handleAddMember = (student: StudentSummary) => {
    if (!event) return;
    if (selectedMembers.length + 1 >= event.maxTeamSize) {
      alert(`Limite maximale atteinte : ${event.maxTeamSize} personnes.`);
      return;
    }
    if (!selectedMembers.some(m => m.id === student.id)) {
      setSelectedMembers([...selectedMembers, student]);
    }
    setStudentQuery("");
    setSearchResults([]);
  };

  const handleRemoveMember = (id: string) => {   // ✅ string au lieu de number
    setSelectedMembers(selectedMembers.filter(m => m.id !== id));
  };

  // 3. Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const totalSize = selectedMembers.length + 1; // +1 pour le leader (moi-même)
    if (totalSize < event.minTeamSize) {
      alert(`Votre équipe doit comporter au moins ${event.minTeamSize} membres.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${event.id}/register-team`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teamName: teamName.trim(),
            members: selectedMembers.map(m => m.id),  // ✅ "members" correspond à getMembers() dans CreateTeamRequest
          }),
        }
      );

      if (res.ok) {
        alert("✅ Équipe créée et inscrite à l'événement !");
        router.push("/student/teams");
      } else {
        // Affiche le vrai message d'erreur du backend
        const errorData = await res.json().catch(() => null);
        const msg = errorData?.error || errorData?.message || `Erreur ${res.status}`;
        alert(`❌ Erreur : ${msg}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur réseau, vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvent)
    return (
      <div className="p-8 text-sm text-gray-400 flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        Chargement des contraintes de l'événement…
      </div>
    );

  if (!event)
    return <div className="p-8 text-sm text-red-500">Événement introuvable.</div>;

  const totalMembers = selectedMembers.length + 1;
  const isValid = totalMembers >= event.minTeamSize && teamName.trim().length > 0;

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">

      {/* Top Bar */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/student/events")}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            title="Retour"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Inscription d'équipe</h1>
            <p className="text-xs text-gray-400">{event.title}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#1D9E75] text-white text-xs font-bold flex items-center justify-center">
          ST
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Formulaire principal (2/3) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">

          {/* Nom de l'équipe */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Nom de l'équipe *
            </label>
            <input
              required
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Entrez le nom officiel de votre équipe..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1D9E75] focus:outline-none transition"
            />
          </div>

          {/* Recherche de coéquipiers */}
          {totalMembers < event.maxTeamSize && (
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Rechercher des coéquipiers
              </label>
              <div className="relative">
                <input
                  value={studentQuery}
                  onChange={e => setStudentQuery(e.target.value)}
                  placeholder="Tapez un nom, prénom ou email..."
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1D9E75] focus:outline-none transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              </div>

              {/* Suggestions */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-xl max-h-48 overflow-y-auto z-20 divide-y divide-gray-50">
                  {searchResults.map(student => (
                    <div
                      key={student.id}
                      onClick={() => handleAddMember(student)}
                      className="p-3 text-xs hover:bg-emerald-50/50 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{student.firstName} {student.lastName}</p>
                        <p className="text-[10px] text-gray-400">{student.email}</p>
                      </div>
                      <span className="text-sm bg-gray-100 text-[#1D9E75] w-6 h-6 rounded-full flex items-center justify-center font-bold">+</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Liste des membres */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Membres ({totalMembers} / {event.maxTeamSize})
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {/* Leader = moi */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="font-semibold text-gray-800 block">Moi-même</span>
                  <span className="text-[10px] text-gray-400">Chef d'équipe</span>
                </div>
                <span className="text-[9px] bg-gray-800 text-white font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Leader
                </span>
              </div>

              {/* Membres ajoutés */}
              {selectedMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3.5 bg-emerald-50/20 rounded-xl border border-emerald-100 text-xs"
                >
                  <div>
                    <span className="font-semibold text-gray-800 block">
                      {member.firstName} {member.lastName}
                    </span>
                    <span className="text-[10px] text-gray-400">{member.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-400 hover:text-red-600 font-medium text-xs bg-white border border-red-100 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push("/student/events")}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !isValid}
              className="px-6 py-2.5 bg-[#1D9E75] text-white rounded-xl text-xs font-semibold hover:bg-[#0F6E56] disabled:opacity-40 transition-colors shadow-sm flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création en cours…
                </>
              ) : (
                "✅ Valider et s'inscrire"
              )}
            </button>
          </div>
        </form>

        {/* Panneau des règles (1/3) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm sticky top-8">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Règles de l'événement
          </h2>

          <div className="divide-y divide-gray-100 text-xs">
            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-400">Taille minimale</span>
              <span className="font-semibold text-gray-800">{event.minTeamSize} personnes</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-400">Taille maximale</span>
              <span className="font-semibold text-gray-800">{event.maxTeamSize} personnes</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-400">Places restantes</span>
              <span className="font-semibold text-gray-800">
                {event.registeredTeams} / {event.maxTeams} équipes
              </span>
            </div>
          </div>

          {/* Statut de validation en direct */}
          <div className={`p-3 rounded-xl border text-xs ${
            isValid
              ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
              : "bg-amber-50/50 border-amber-200 text-amber-800"
          }`}>
            <p className="font-semibold">Statut :</p>
            <p className="mt-0.5 text-[11px]">
              {!teamName.trim()
                ? "⚠️ Donnez un nom à votre équipe."
                : totalMembers < event.minTeamSize
                ? `⚠️ Il manque ${event.minTeamSize - totalMembers} membre(s).`
                : "✅ Votre équipe respecte les critères !"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}