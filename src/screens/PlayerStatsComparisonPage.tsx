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
  username?: string;
};

const PlayerStatsComparisonPage: React.FC = () => {
  const params = useParams();
  const friendId = params?.friendId as string | undefined;
  const friendUsername = params?.friendUsername as string | undefined;
  const { user, username } = useAuthStore();
  const [players, setPlayers] = useState<PlayerStatRow[]>([]);
  const playerIds = useMemo(
    () => (friendId ? `${user.id},${friendId}` : `${user.id}`),
    [friendId, user.id]
  );
  const { selectedSeason } = useSeasonStore();
  const { setLoading } = useLoadingStore();
  const showAlert = useAlertStore((state) => state.showAlert);

  const usersWithUsernames = useMemo(
    () => [
      { id: `${user.id}`, username: `${username}` },
      { id: `${friendId}`, username: `${friendUsername}` },
    ],
    [friendId, friendUsername, user.id, username]
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
          (player) => ({
            ...player,
            username: usersWithUsernames.find((u) => u.id === player.player_id)
              ?.username,
          })
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
    if (friendId && selectedSeason?.id) {
      fetchPlayerFriends();
    }
  }, [
    friendId,
    playerIds,
    selectedSeason?.id,
    setLoading,
    showAlert,
    usersWithUsernames,
  ]);

  return (
    <div className="page-shell flex items-center justify-center">
      <PlayerStatComparison playersData={players} />
    </div>
  );
};

export default PlayerStatsComparisonPage;
