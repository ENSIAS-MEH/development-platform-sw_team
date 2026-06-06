"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserType = "student" | "org";

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Student
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Org
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPassword, setOrgPassword] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgLocation, setOrgLocation] = useState("");

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (userType === "student") {
        if (!firstName || !lastName || !email || !password) {
          setError("Veuillez remplir tous les champs obligatoires.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, password }),
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur d'inscription");

        setSuccess("Compte créé avec succès ! Redirection...");
        setTimeout(() => router.push("/auth/login"), 2000);

      } else {
        if (!orgName || !orgEmail || !orgPassword) {
          setError("Veuillez remplir tous les champs obligatoires.");
          setLoading(false);
          return;
        }

        // ✅ Corrigé : /api/org/auth/register (au lieu de /api/auth/org/register)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/org/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: orgName,
              email: orgEmail,
              password: orgPassword,
              description: orgDescription,
              websiteUrl: orgWebsite,
              location: orgLocation,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur d'inscription");

        setSuccess("Organisation enregistrée ! En attente d'approbation admin.");
        setTimeout(() => router.push("/auth/login"), 2500);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center py-10"
      style={{
        backgroundImage: "url('/Img/collabyouth_logo_v1_fixed.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#e8f5f0",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#e8f5f0]/70 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/Img/collabyouth_logo_v1_fixed.png"
            alt="CollabYouth"
            width={180}
            height={65}
            className="object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
          Create an account
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Join the CollabYouth community 🚀
        </p>

        {/* Toggle Student / Org */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => { setUserType("student"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              userType === "student"
                ? "bg-white text-[#1D9E75] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => { setUserType("org"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              userType === "org"
                ? "bg-white text-[#1D9E75] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            🏢 Organizer
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            <span>✅</span> {success}
          </div>
        )}

        {/* FORMULAIRE ÉTUDIANT */}
        {userType === "student" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                             focus:border-transparent transition-all placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                             focus:border-transparent transition-all placeholder-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                placeholder="toi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                             focus:border-transparent transition-all placeholder-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? "Cacher" : "Voir"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white font-semibold
                         py-3 rounded-xl transition-colors duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creation...
                </span>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>
        )}

        {/* FORMULAIRE ORGANISATION */}
        {userType === "org" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Organization name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Mon Organisation"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                placeholder="contact@org.com"
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                placeholder="Min. 8 caractères"
                value={orgPassword}
                onChange={(e) => setOrgPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                placeholder="Décrivez votre organisation..."
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all placeholder-gray-300 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={orgWebsite}
                  onChange={(e) => setOrgWebsite(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                             focus:border-transparent transition-all placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Ville, Pays"
                  value={orgLocation}
                  onChange={(e) => setOrgLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                             focus:border-transparent transition-all placeholder-gray-300"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-3 rounded-xl">
              ⏳ Organization accounts require admin approval before activation.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white font-semibold
                         py-3 rounded-xl transition-colors duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Send...
                </span>
              ) : (
                "Enregistrer l'organisation"
              )}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#1D9E75] font-semibold hover:underline">
            Sign in
          </Link>
        </p>

        {/* Footer */}
        <div className="flex justify-center gap-4 mt-6 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-[#1D9E75] transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-[#1D9E75] transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-[#1D9E75] transition-colors">Contact</Link>
        </div>
      </div>
    </div>
  );
}