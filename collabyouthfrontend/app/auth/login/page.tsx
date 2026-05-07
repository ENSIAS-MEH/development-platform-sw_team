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

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Identifiants incorrects");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      switch (data.role) {
        case "ROLE_ADMIN":
          router.push("/admin/home");
          break;
        case "ROLE_ORG":
          router.push("/organizer/home");
          break;
        default:
          router.push("/student/home");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center py-10"
      style={{
        backgroundImage: "url('/img/collabyouth_logo_v1_fixed.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#e8f5f0",
      }}
    >
      {/* Overlay vert léger */}
      <div className="absolute inset-0 bg-[#e8f5f0]/70 backdrop-blur-sm" />

      {/* Card formulaire */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/img/collabyouth_logo_v1_fixed.png"
            alt="CollabYouth"
            width={180}
            height={65}
            className="object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
          Sign in
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Welcome back 👋
        </p>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              placeholder="toi@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                         text-gray-900 placeholder-gray-300
                         focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                         focus:border-transparent transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-[#1D9E75] hover:underline"
              >
                Forgot your password
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm
                           text-gray-900 placeholder-gray-300
                           focus:outline-none focus:ring-2 focus:ring-[#1D9E75]
                           focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white font-semibold
                       py-3 rounded-xl transition-colors duration-200
                       disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sign in...
              </span>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don’t have an account?{" "}
          <Link href="/auth/register" className="text-[#1D9E75] font-semibold hover:underline">
            Register
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