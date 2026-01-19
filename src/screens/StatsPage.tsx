"use client";

import React, { useEffect } from "react";
import useSeasonStore from "../stores/seasonStore";
import PersonalStats from "../components/Stats/PersonalStats";
import { useRouter } from "next/navigation";

const StatsPage: React.FC = () => {
  const { selectedSeason } = useSeasonStore();
  const router = useRouter();

  useEffect(() => {
    if (!selectedSeason) {
      router.replace("/select-season");
    }
  }, [router, selectedSeason]);

  return (
    <div className="page-shell">
      <PersonalStats />
    </div>
  );
};

export default StatsPage;
