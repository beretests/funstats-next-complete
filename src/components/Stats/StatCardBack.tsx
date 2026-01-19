"use client";

import React, { useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  CardAward,
  CardStatEntry,
  useCardDataStore,
} from "../../stores/cardDataStore";

interface StatCardBackProps {
  label: string;
  isVisible?: boolean;
}

const StatCardBack: React.FC<StatCardBackProps> = ({ label }) => {
  const { getCardData } = useCardDataStore();
  const statData: CardStatEntry[] = getCardData(label) || [];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => Math.min(statData.length - 1, prev + 1));
  };

  return (
    <Card
      raised
      className={`absolute !bg-ok-900 w-full h-full shadow-lg hover:shadow-xl transition-shadow duration-300 !rounded-xl border-4 border-accent-100 backface-hidden`}
      style={{ transform: "rotateY(180deg)" }}
    >
      <CardContent className="flex flex-col items-center p-4">
        <div className="text-white mb-2">
          <Typography variant="h6" className={`font-bold !font-special`}>
            {label}
          </Typography>
        </div>
        <div className="relative flex-grow w-full flex items-center">
          {currentIndex > 0 && (
            <IconButton
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="!absolute left-0"
            >
              <ArrowBackIosIcon className="text-white" />
            </IconButton>
          )}

          <div className="flex-grow text-center mx-14">
            {statData[currentIndex] && (
              <div key={currentIndex}>
                <h3 className="text-white font-fredoka">
                  {statData[currentIndex].away_team_name} v{" "}
                  {statData[currentIndex].home_team_name}
                </h3>
                <h4 className="text-center text-lg mb-2 text-white font-bold">
                  {statData[currentIndex].stat_value}
                </h4>
                {statData[currentIndex].awards?.map(
                  (award: CardAward, idx: number) => (
                    <p
                      key={idx}
                      className="text-accent-100 font-nunito font-bold"
                    >
                      🏆 {award.award_name}
                    </p>
                  )
                )}
              </div>
            )}
          </div>

          {currentIndex < statData.length - 1 && (
            <IconButton
              onClick={handleNext}
              disabled={currentIndex === statData.length - 1}
              className="!absolute right-0"
            >
              <ArrowForwardIosIcon className="text-white" />
            </IconButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCardBack;

// {
//   awards: [];
//   away_team_name: "Titans";
//   date: "2024-04-20T06:00:00.000Z";
//   game_id: "bcb3f1a0-36b4-4dbf-b927-8c739d7f2a40";
//   home_team_name: "Forge";
//   stat_value: 1;
// }
