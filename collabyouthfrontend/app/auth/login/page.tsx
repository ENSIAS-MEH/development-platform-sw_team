"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Identifiants incorrects");

      const token = await res.text();
      localStorage.setItem("token", token);
      router.push("/home");
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex">

      {/* ── PANNEAU GAUCHE (visible desktop) ── */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#e8f5f0] to-[#c8ead9] flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Cercles décoratifs */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-[#1D9E75] opacity-10" />
        <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full bg-[#0F6E56] opacity-10" />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="CollabYouth"
            width={160}
            height={55}
            className="object-contain"
          />
        </div>

        {/* Texte central */}
        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-bold text-[#0F6E56] leading-tight">
            Connecte.<br />Collabore.<br />Crée.
          </h2>
          <p className="text-[#1D9E75] text-lg leading-relaxed">
            Trouve tes coéquipiers, lance tes hackathons<br />
            et construis quelque chose de grand.
          </p>

          {/* Badges */}
          <div className="flex gap-3 pt-4">
            <span className="bg-white/60 text-[#0F6E56] text-xs font-semibold px-3 py-1.5 rounded-full">
              🏆 Challenges
            </span>
            <span className="bg-white/60 text-[#0F6E56] text-xs font-semibold px-3 py-1.5 rounded-full">
              ⚡ Hackathons
            </span>
            <span className="bg-white/60 text-[#0F6E56] text-xs font-semibold px-3 py-1.5 rounded-full">
              🤝 Équipes
            </span>
          </div>
        </div>

        {/* Footer gauche */}
        <p className="relative z-10 text-[#5DCAA5] text-sm">
          © 2025 CollabYouth
        </p>
      </div>

      {/* ── PANNEAU DROIT — Formulaire ── */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {/* Logo mobile uniquement */}
            <div className="lg:hidden flex justify-center mb-10">
              <Image src="/logo.png" alt="CollabYouth" width={140} height={48} />
            </div>

            {/* Titre */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Bon retour 👋
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                Pas encore de compte ?{" "}
                <Link
                  href="/register"
                  className="text-[#1D9E75] font-semibold hover:underline"
                >
                  Rejoindre CollabYouth
                </Link>
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Champs formulaire */}
            <div className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  placeholder="toi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                             text-gray-900 placeholder-gray-300
                             focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                             focus:border-transparent transition-all"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#1D9E75] hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm
                               text-gray-900 placeholder-gray-300
                               focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                               focus:border-transparent transition-all"
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

              {/* Bouton login */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white font-semibold
                           py-3 rounded-xl transition-colors duration-200
                           disabled:opacity-60 disabled:cursor-not-allowed
                           shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>

              {/* Séparateur */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-gray-400">
                    ou continuer avec
                  </span>
                </div>
              </div>

              {/* Bouton Google */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 border border-gray-200
                           py-3 rounded-xl text-sm text-gray-600
                           hover:bg-gray-50 transition-colors duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </button>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="py-4 px-6 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-[#1D9E75] transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="hover:text-[#1D9E75] transition-colors">
              Conditions d'utilisation
            </Link>
            <Link href="/contact" className="hover:text-[#1D9E75] transition-colors">
              Contact
            </Link>
            <span>© 2025 CollabYouth</span>
          </div>
        </footer>
      </div>
    </div>
  );
}