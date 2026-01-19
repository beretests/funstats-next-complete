"use client";

import React, { useState } from "react";
import Grid from "@mui/material/Grid2";
import StatCard from "./StatCard";
import StatCardBack from "./StatCardBack";
import { motion } from "framer-motion";
import { useAlertStore } from "../../stores/alertStore";
import useSeasonStore from "../../stores/seasonStore";
import { useAuthStore } from "../../stores/authStore";
import { useCardDataStore } from "../../stores/cardDataStore";
import api from "../../services/api";

interface FlipCardProps {
  card: {
    icon: React.ReactNode;
    stat: string;
    label: string;
    color: string;
  };
  index: number;
}

const FlipCard: React.FC<FlipCardProps> = ({
  card: { icon, stat, label, color },
  index,
}) => {
  const fetchGameStats = async (
    playerId: string,
    seasonId: string,
    statType: string
  ) => {
    try {
      const stats = await api.get(`/api/stats/games`, {
        params: {
          playerId,
          seasonId,
          statType,
        },
      });
      console.log("Stats:", stats.data);
      if (stats?.data) {
        setCardData(label, stats.data);
      }
      return stats;
    } catch (error) {
      console.log(error);
      showAlert("error", `${(error as Error).message} Please try again.`);
    } finally {
    }
  };
  const { showAlert } = useAlertStore();
  const { selectedSeason } = useSeasonStore();
  const { user } = useAuthStore();
  const { setCardData } = useCardDataStore();

  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const handleCardClick = (index: number) => {
    const isCurrentlyFlipped = flippedCards[index];
    const isAboutToFlip = !isCurrentlyFlipped;

    // setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
    setFlippedCards((prev) => ({ ...prev, [index]: isAboutToFlip }));

    if (isAboutToFlip) {
      fetchGameStats(
        user.id,
        selectedSeason?.id ?? "",
        label.toLowerCase().replace(/ /g, "_").replace("goals", "goals_scored")
      );
    }
  };

  return (
    <Grid size={{ xs: 12, md: 4, sm: 6, lg: 3 }} sx={{ cursor: "pointer" }}>
      <div
        className="relative w-full min-h-40 perspective"
        onClick={() => handleCardClick(index)}
      >
        <motion.div
          className="absolute w-full h-full"
          animate={{ rotateY: flippedCards[index] ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <StatCard icon={icon} stat={stat} label={label} color={color} />
          <StatCardBack label={label} />
        </motion.div>
      </div>
    </Grid>
  );
};

export default FlipCard;
