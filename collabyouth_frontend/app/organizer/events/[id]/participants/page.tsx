"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ParticipantTeam {
  teamId: string;
  teamName: string;
  description: string;
  createdBy: string;
  registeredAt: string;
}

export default function EventParticipantsPage() {
  const { id } = useParams();
  const [teams, setTeams] = useState<ParticipantTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/org/events/${id}/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur lors de la récupération des participants");
        const data = await res.json();
        setTeams(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [id]);

  if (loading) return <p className="p-6">Chargement des participants...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Équipes inscrites</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {teams.length === 0 ? (
        <p className="text-gray-500">Aucune équipe n'est encore inscrite à cet événement.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 font-semibold text-sm">Nom de l'équipe</th>
                <th className="p-3 font-semibold text-sm">Description</th>
                <th className="p-3 font-semibold text-sm">Inscrite le</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.teamId} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-blue-600">{team.teamName}</td>
                  <td className="p-3 text-gray-600 text-sm">{team.description || "Pas de description"}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(team.registeredAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}