"use client";

import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

type PlayerStats = {
  player_id: string;
  username: string;
  total_goals: string;
  total_assists: string;
  total_shots_on_target: string;
  total_tackles: string;
  total_interceptions: string;
  total_saves: string;
  total_yellow_cards: string;
  total_red_cards: string;
  total_fouls: string;
  total_headers_won: string;
  total_offsides: string;
  total_games_played: string;
};

interface Props {
  playersData: PlayerStats[];
}

const PlayerStatComparison: React.FC<Props> = ({ playersData }) => {
  const getHighestValue = (statKey: keyof PlayerStats): string | null => {
    const values = playersData.map((player) => parseInt(player[statKey], 10));
    const maxValue = Math.max(...values);
    return maxValue.toString();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
      {playersData.map((player) => (
        <Card
          raised
          key={player.player_id}
          sx={{ maxWidth: 300 }}
          className="surface-card !w-80 md:w-full hover:!bg-neutral-100 dark:hover:!bg-neutral-800 !transition-all !duration-300 !rounded-xl mx"
        >
          <CardContent>
            <Typography
              variant="h6"
              className="text-center !font-special !text-2xl mb-2 text-primary-900 dark:text-primary-200"
            >
              {player.username}
            </Typography>
            <div className="grid gap-2 text-sm pt-4">
              {Object.keys(player).map((key) => {
                if (key === "player_id" || key === "username") return null;

                const isHighest =
                  player[key as keyof PlayerStats] ===
                  getHighestValue(key as keyof PlayerStats);

                const emojiMap = {
                  total_goals: "⚽️",
                  total_assists: "🅰️",
                  total_shots_on_target: "🎯",
                  total_tackles: "🛡️",
                  total_interceptions: "🚧",
                  total_saves: "🥅",
                  total_yellow_cards: "🟨",
                  total_red_cards: "🟥",
                  total_fouls: "🚫",
                  total_headers_won: "🤾‍♂️",
                  total_offsides: "🚩",
                  total_games_played: "🏆",
                };

                return (
                  <div
                    key={key}
                    className={`flex justify-between items-center px-4 rounded-2xl ${
                      isHighest
                        ? "bg-primary-800 text-white"
                        : "text-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    <span className="font-fredoka font-bold capitalize">
                      {key.replace(/_/g, " ").replace(/total /g, "")}
                      {"  "}
                      <span className="hover:!animate-bounce">
                        {"\n"}
                        {emojiMap[key as keyof typeof emojiMap]}
                      </span>
                      :
                    </span>{" "}
                    <span
                      className={`text-lg ${
                        isHighest
                          ? "text-white font-bold"
                          : "text-neutral-800 dark:text-neutral-200"
                      }`}
                    >
                      {player[key as keyof PlayerStats]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PlayerStatComparison;
