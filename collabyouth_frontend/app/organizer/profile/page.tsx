"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrgProfile {
  id: string;
  name: string;
  email: string;
  organizationName: string;
  bio?: string;
  website?: string;
  github?: string; // Added for future use
  createdAt: string;
}

export default function OrganizerProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<OrgProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Edit form
  const [editBio, setEditBio] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editGithub, setEditGithub] = useState("");

  // Modals
  const [notificationModal, setNotificationModal] = useState<{ isOpen: boolean; type: "success" | "error"; title: string; message: string }>({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  });

  useEffect(() => {
    fetchProfile();
  }, [router]);

  const fetchProfile = () => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");

    if (!token || role !== "ROLE_ORG") {
      router.push("/auth/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/org/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unable to load profile.");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        // Initialize form fields
        setEditBio(data.bio || "");
        setEditWebsite(data.website || "");
        setEditGithub(data.github || "");
      })
      .catch((err) => {
        setNotificationModal({ isOpen: true, type: "error", title: "Error", message: err.message });
      })
      .finally(() => setLoading(false));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/org/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: editBio,
          website: editWebsite,
          github: editGithub
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile.");

      const updatedData = await res.json();
      setProfile(updatedData);
      setIsEditing(false);

      setNotificationModal({
        isOpen: true,
        type: "success",
        title: "Profile updated!",
        message: "Your changes have been saved successfully."
      });
    } catch (err: any) {
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: err.message || "An error occurred."
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="w-8 h-8 border-4 border-[#1D9E75]/30 border-t-[#1D9E75] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 relative">
      
      <div className="mb-6">
        <Link href="/organizer/home" className="text-sm text-[#1D9E75] hover:underline font-medium">
          ← Back to dashboard
        </Link>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#1D9E75] to-[#147e5d] p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold uppercase">
              {profile?.organizationName?.substring(0, 2) || "OR"}
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile?.organizationName}</h1>
              <p className="text-xs text-emerald-100 mt-0.5">Certified Organizer Account</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {/* Form or Details Display */}
        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Manager Name</label>
              <p className="text-sm font-medium text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100 cursor-not-allowed">{profile?.name || "Not provided"}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
              <p className="text-sm font-medium text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100 cursor-not-allowed">{profile?.email}</p>
            </div>
          </div>

          {/* BIO FIELD */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Biography / Description</label>
            {isEditing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full text-sm text-gray-900 bg-white p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all resize-none"
                placeholder="Describe your organization, your projects, your hackathons..."
              />
            ) : (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 min-h-[80px]">
                {profile?.bio || "No description provided yet."}
              </p>
            )}
          </div>

          {/* WEBSITE FIELD */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Website / External Link</label>
            {isEditing ? (
              <input
                type="url"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                className="w-full text-sm text-gray-900 bg-white p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all"
                placeholder="https://my-website.com"
              />
            ) : profile?.website ? (
              <a href={profile.website} target="_blank" rel="noreferrer" className="text-sm text-[#1D9E75] hover:underline block bg-gray-50 p-3 rounded-xl border border-gray-100">
                {profile.website}
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-gray-100">No website available</p>
            )}
          </div>

          {/* GITHUB LINK FIELD */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">GitHub Link</label>
            {isEditing ? (
              <input
                type="url"
                value={editGithub}
                onChange={(e) => setEditGithub(e.target.value)}
                className="w-full text-sm text-gray-900 bg-white p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all"
                placeholder="https://github.com/my-organization"
              />
            ) : profile?.github ? (
              <a href={profile.github} target="_blank" rel="noreferrer" className="text-sm text-gray-700 hover:underline block bg-gray-50 p-3 rounded-xl border border-gray-100">
                {profile.github}
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-gray-100">No GitHub link configured</p>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Profile Actions */}
          <div className="flex gap-3 justify-end pt-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditBio(profile?.bio || "");
                    setEditWebsite(profile?.website || "");
                    setEditGithub(profile?.github || "");
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1D9E75] hover:bg-[#0F6E56] rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitLoading ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                Log out
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Notification Modal UI */}
      {notificationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 ${
              notificationModal.type === "success" ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
            }`}>
              {notificationModal.type === "success" ? "✨" : "❌"}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{notificationModal.title}</h3>
            <p className="text-sm text-gray-400 mb-6 px-2">{notificationModal.message}</p>
            <button
              onClick={() => setNotificationModal(prev => ({ ...prev, isOpen: false }))}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}