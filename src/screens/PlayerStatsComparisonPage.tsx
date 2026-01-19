"use client";

import React, { useEffect, useMemo, useState } from "react";
import PlayerStatComparison from "../components/PlayerStatComparison";
import useSeasonStore from "../stores/seasonStore";
import { useAuthStore } from "../stores/authStore";
import { useLoadingStore } from "../stores/loadingStore";
import { useAlertStore } from "../stores/alertStore";
import api from "../services/api";
import { useParams } from "next/navigation";

type PlayerStatRow = {
  player_id: string;
  total_goals?: string;
  total_assists?: string;
  total_shots_on_target?: string;
  total_tackles?: string;
  total_interceptions?: string;
  total_saves?: string;
  total_yellow_cards?: string;
  total_red_cards?: string;
  total_fouls?: string;
  total_headers_won?: string;
  total_offsides?: string;
  total_games_played?: string;
};

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

const PlayerStatsComparisonPage: React.FC = () => {
  const params = useParams();
  const friendId = params?.friendId as string | undefined;
  const friendUsername = params?.friendUsername as string | undefined;
  const { user, username } = useAuthStore();
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const userId = user?.id;
  const playerIds = useMemo(() => {
    if (!userId) return "";
    return friendId ? `${userId},${friendId}` : `${userId}`;
  }, [friendId, userId]);
  const { selectedSeason } = useSeasonStore();
  const { setLoading } = useLoadingStore();
  const showAlert = useAlertStore((state) => state.showAlert);

  const usersWithUsernames = useMemo(
    () => {
      if (!userId) return [];
      return [
        { id: userId, username: username || user?.email || "You" },
        { id: friendId || "", username: friendUsername || "Friend" },
      ];
    },
    [friendId, friendUsername, user?.email, userId, username]
  );

  useEffect(() => {
    const fetchPlayerFriends = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/stats`, {
          params: {
            playerIds,
            seasonId: selectedSeason?.id,
          },
        });
        const playersWithUsernames = (response.data as PlayerStatRow[]).map(
          (player) => {
            const usernameValue =
              usersWithUsernames.find((u) => u.id === player.player_id)
                ?.username || "Player";

            return {
              player_id: player.player_id,
              username: usernameValue,
              total_goals: player.total_goals ?? "0",
              total_assists: player.total_assists ?? "0",
              total_shots_on_target: player.total_shots_on_target ?? "0",
              total_tackles: player.total_tackles ?? "0",
              total_interceptions: player.total_interceptions ?? "0",
              total_saves: player.total_saves ?? "0",
              total_yellow_cards: player.total_yellow_cards ?? "0",
              total_red_cards: player.total_red_cards ?? "0",
              total_fouls: player.total_fouls ?? "0",
              total_headers_won: player.total_headers_won ?? "0",
              total_offsides: player.total_offsides ?? "0",
              total_games_played: player.total_games_played ?? "0",
            };
          }
        );
        setPlayers(playersWithUsernames);
        setLoading(false);
      } catch (error) {
        console.log(error);
        showAlert("error", `${(error as Error).message} Please try again.`);
      } finally {
        setLoading(false);
      }
    };
    if (userId && friendId && selectedSeason?.id) {
      fetchPlayerFriends();
    }
  }, [
    friendId,
    playerIds,
    selectedSeason?.id,
    setLoading,
    showAlert,
    userId,
    usersWithUsernames,
  ]);

  return (
    <div className="page-shell flex items-center justify-center">
      <PlayerStatComparison playersData={players} />
    </div>
  );
};

export default PlayerStatsComparisonPage;
