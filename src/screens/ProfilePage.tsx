"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileDetails from "../components/Profile/ProfileDetails";
import { getProfileData } from "../services/profileService";
import ProfileForm from "../components/Profile/ProfileForm";
import { useLoadingStore } from "../stores/loadingStore";
import CircularProgress from "@mui/material/CircularProgress";

const ProfilePage: React.FC = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const setUser = useAuthStore((state) => state.setUser);
  const { isLoading, setLoading } = useLoadingStore();

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const data = await getProfileData(userId);
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          setUser({ ...currentUser, ...data });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [setLoading, setUser, userId]);

  return (
    <div className="page-shell">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <CircularProgress />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-8">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-800/80 via-primary-700/60 to-primary-500/60 px-4 py-6 shadow-xl">
            <div className="absolute inset-0 blur-3xl opacity-30 bg-[radial-gradient(circle_at_20%_20%,#60a5fa,transparent_35%),radial-gradient(circle_at_80%_0%,#fcd34d,transparent_30%),radial-gradient(circle_at_50%_80%,#34d399,transparent_25%)]" />
            <div className="relative">
              <ProfileHeader />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
            <ProfileDetails />
          </section>

          <ProfileForm />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
