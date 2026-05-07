"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminHome() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");

    if (!storedRole) {
      router.push("/auth/login");
      return;
    }

    if (storedRole !== "ROLE_ADMIN") {
      router.push("/auth/login");
      return;
    }

    setRole(storedRole);
  }, [router]);

  if (!role) return null; // loading simple

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold text-green-600">
        👑 Vous êtes ADMIN
      </h1>
    </div>
  );
}