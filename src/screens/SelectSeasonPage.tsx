"use client";

import React, { useEffect } from "react";
import SelectSeason from "../components/Stats/SelectSeason";
import useSeasonStore from "../stores/seasonStore";

const SelectSeasonPage: React.FC = () => {
  const { fetchSeasons } = useSeasonStore();

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  return (
    <div className="page-shell">
      <SelectSeason />
    </div>
  );
};

export default SelectSeasonPage;
