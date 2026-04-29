import type { Metadata } from "next";
import "../../../styles/auth.css";

export const metadata: Metadata = {
  title: "CollabYouth — Connexion",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-wrapper min-h-screen flex">
      {/* Panneau gauche — visuel */}
      <div className="auth-left hidden lg:flex flex-col justify-between w-1/2 bg-[#e8f5f0] p-12 relative overflow-hidden">
        <div className="auth-decoration" />
        <div>
          <img src="/logo.png" alt="CollabYouth" className="w-40" />
        </div>
        <div className="z-10 relative">
          <h2 className="text-3xl font-bold text-[#0F6E56] mb-4">
            Connecte, Collabore, Crée
          </h2>
          <p className="text-[#1D9E75] text-lg">
            Trouve tes coéquipiers, lance tes projets,<br />
            construis quelque chose de grand.
          </p>
        </div>
        <p className="text-sm text-[#5DCAA5]">© 2025 CollabYouth</p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="auth-right flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-4 px-6 border-t border-gray-100 flex justify-center gap-6 text-xs text-gray-400">
      <a href="/privacy" className="hover:text-[#1D9E75] transition-colors">Confidentialité</a>
      <a href="/terms" className="hover:text-[#1D9E75] transition-colors">Conditions</a>
      <a href="/contact" className="hover:text-[#1D9E75] transition-colors">Contact</a>
      <span>© 2025 CollabYouth</span>
    </footer>
  );
}