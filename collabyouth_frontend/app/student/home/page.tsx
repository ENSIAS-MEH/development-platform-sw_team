"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentHome() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");

    if (!storedRole) {
      router.push("/auth/login");
      return;
    }

    if (storedRole !== "ROLE_STUDENT") {
      router.push("/auth/login");
      return;
    }

    setRole(storedRole);
  }, [router]);

  if (!role) return null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold text-blue-600">
        🎓 Vous êtes STUDENT
      </h1>
    </div>
  );
}