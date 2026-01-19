"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, Chip, CircularProgress } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BoltIcon from "@mui/icons-material/Bolt";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { useLoadingStore } from "../stores/loadingStore";
import { useAlertStore } from "../stores/alertStore";
import api from "../services/api";
import useSeasonStore from "../stores/seasonStore";

type LeaderboardPlayer = {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  position?: string;
  points: number;
  goals: number;
  assists: number;
  saves: number;
  tackles: number;
  interceptions: number;
  gamesPlayed: number;
  streak: number;
  badges: string[];
};

type Friend = {
  id: string;
  avatar_url?: string;
  username: string;
  full_name: string;
  position?: string;
};

type PlayerStats = {
  player_id: string;
  total_goals?: string;
  total_assists?: string;
  total_saves?: string;
  total_tackles?: string;
  total_interceptions?: string;
  total_games_played?: string;
  streak?: string | number;
};

const medalColors = [
  "from-amber-400 to-orange-500",
  "from-slate-200 to-slate-100",
  "from-amber-200 to-yellow-200",
];

const LeaderboardPage = () => {
  const { user } = useAuthStore();
  const { setLoading, isLoading } = useLoadingStore();
  const showAlert = useAlertStore((state) => state.showAlert);
  const { selectedSeason } = useSeasonStore();
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async (userId: string, seasonId?: string) => {
      setLoading(true);
      try {
        const friendsRes = await api.get<Friend[]>(`/api/${userId}/friends`);
        const friendList = friendsRes.data || [];

        const userSelf: Friend = {
          id: userId,
          avatar_url: user?.avatar_url || user?.user_metadata?.avatar_url,
          username:
            user?.user_metadata?.username ||
            user?.username ||
            user?.email ||
            "you",
          full_name:
            user?.full_name || user?.user_metadata?.full_name || "You",
          position: user?.position || user?.user_metadata?.position,
        };

        const uniquePlayers = dedupeById([userSelf, ...friendList]);
        const playerIds = uniquePlayers.map((p) => p.id).join(",");

        const statsResponse = await api.get<PlayerStats[]>(`/api/stats`, {
          params: { playerIds, seasonId },
        });
        const statsByPlayer = new Map(
          (statsResponse.data || []).map((row) => [row.player_id, row])
        );

        const leaderboard = uniquePlayers.map((friend) => {
          const stat = statsByPlayer.get(friend.id);
          const goals = toNumber(stat?.total_goals);
          const assists = toNumber(stat?.total_assists);
          const saves = toNumber(stat?.total_saves);
          const tackles = toNumber(stat?.total_tackles);
          const interceptions = toNumber(stat?.total_interceptions);
          const gamesPlayed = toNumber(stat?.total_games_played);
          const streak = toNumber(stat?.streak);
          const points = calculatePoints({
            goals,
            assists,
            saves,
            tackles,
            interceptions,
            gamesPlayed,
          });

          return {
            id: friend.id,
            username: friend.username,
            full_name: friend.full_name,
            avatar_url: friend.avatar_url,
            position: friend.position,
            points,
            goals,
            assists,
            saves,
            tackles,
            interceptions,
            gamesPlayed,
            streak,
            badges: buildBadges({ goals, assists, saves, gamesPlayed }),
          };
        });

        setPlayers(leaderboard);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
        showAlert("error", "Could not load leaderboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchLeaderboard(user.id, selectedSeason?.id);
    }
  }, [
    selectedSeason?.id,
    setLoading,
    showAlert,
    user?.avatar_url,
    user?.email,
    user?.full_name,
    user?.id,
    user?.position,
    user?.user_metadata,
    user?.username,
  ]);

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.points - a.points),
    [players]
  );
  const podium = sortedPlayers.slice(0, 3);
  const everyoneElse = sortedPlayers.slice(3);
  const me = sortedPlayers.find(
    (player) =>
      player.id === user?.id ||
      player.username === user?.user_metadata?.username
  );

  return (
    <div className="page-shell pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-primary-100/70 dark:border-primary-800/60 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white shadow-2xl px-5 py-7 md:px-8 md:py-10 mb-8">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#fbbf24,transparent_30%),radial-gradient(circle_at_80%_0%,#34d399,transparent_30%),radial-gradient(circle_at_50%_80%,#60a5fa,transparent_25%)]" />
        <div className="absolute -left-14 -top-10 h-48 w-48 bg-white/10 blur-3xl rounded-full" />
        <div className="absolute -right-16 bottom-0 h-52 w-52 bg-emerald-300/40 blur-3xl rounded-full" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-white">
              Friends leaderboard
            </p>
            <h1 className="text-3xl md:text-4xl font-special font-bold">
              Who&apos;s lighting up the pitch?
            </h1>
            <p className="text-white font-fredoka max-w-2xl">
              Track goals, assists, saves, and hustle points. Celebrate the top
              performers and chase the next badge together!
            </p>
            <div className="flex flex-wrap gap-3">
              <Chip
                icon={<LocalFireDepartmentIcon className="text-amber-300" />}
                label="Streaks earn bonus points"
                className="!bg-black/30 !text-white !font-special"
              />
              <Chip
                icon={<FavoriteIcon className="text-pink-200" />}
                label="Cheer your buddies on"
                className="!bg-black/30 !text-white !font-special"
              />
            </div>
          </div>

          {me && (
            <div className="relative">
              <div className="surface-card bg-white/90 dark:bg-neutral-900/90 text-neutral-900 dark:text-neutral-50 px-4 py-4 rounded-2xl shadow-xl flex items-center gap-3">
                <Avatar
                  src={me.avatar_url}
                  alt={me.full_name}
                  sx={{ width: 56, height: 56 }}
                  className="font-special !bg-primary-800"
                >
                  {getInitials(me.full_name)}
                </Avatar>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary-900 dark:text-primary-200 font-semibold">
                    You
                  </p>
                  <p className="font-special text-lg">{me.full_name}</p>
                  <p className="text-sm text-neutral-800 dark:text-neutral-300">
                    {me.points} pts • 🔥 {me.streak}-day streak
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[40vh]">
          <CircularProgress />
        </div>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1.1fr,1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {podium.map((player, index) => (
                <motion.div
                  key={player.id}
                  whileHover={{ y: -6 }}
                  className="relative"
                >
                  <div
                    className={`relative overflow-hidden rounded-3xl p-4 shadow-xl text-neutral-950 bg-gradient-to-br ${medalColors[index]} border border-white/60`}
                    style={{ minHeight: 230 }}
                  >
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]" />
                    <div className="relative flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={player.avatar_url}
                          alt={player.full_name}
                          className="font-special shadow-lg ring-2 ring-white/80"
                          sx={{ width: 64, height: 64 }}
                        >
                          {getInitials(player.full_name)}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary-950">
                              #{index + 1}
                            </span>
                            <EmojiEventsIcon
                              className="text-amber-900"
                              fontSize="small"
                            />
                          </div>
                          <p className="font-special text-xl text-neutral-950">
                            {player.full_name}
                          </p>
                          <p className="text-sm text-neutral-950">
                            @{player.username} • {player.position || "Player"}
                          </p>
                        </div>
                      </div>
                      <Chip
                        icon={<MilitaryTechIcon className="text-primary-900" />}
                        label={`${player.points} pts`}
                        className="!bg-white !text-primary-900 !font-special shadow-sm"
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-fredoka text-neutral-950">
                      <StatTile
                        label="Goals"
                        value={player.goals}
                        icon={<SportsSoccerIcon fontSize="small" />}
                      />
                      <StatTile
                        label="Assists"
                        value={player.assists}
                        icon={<BoltIcon fontSize="small" />}
                      />
                      <StatTile label="Streak" value={`${player.streak}🔥`} />
                    </div>

                    {player.badges.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {player.badges.map((badge) => (
                          <span
                            key={badge}
                            className="text-xs px-3 py-1 rounded-full bg-white/70 text-primary-900 font-semibold shadow-sm"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="surface-card rounded-3xl p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-primary-900 dark:text-primary-200 font-semibold">
                    The chase
                  </p>
                  <h2 className="section-title text-left">Climb the table</h2>
                </div>
                <Chip
                  icon={<EmojiEventsIcon className="text-amber-900" />}
                  label="Top 10 win new flair"
                  className="!font-special !border-primary-900 !text-primary-900"
                  color="primary"
                  variant="outlined"
                />
              </div>

              <div className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-700">
                {everyoneElse.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 px-1"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-lg font-bold text-primary-900 dark:text-primary-200 w-8">
                        #{index + podium.length + 1}
                      </span>
                      <Avatar
                        src={player.avatar_url}
                        alt={player.full_name}
                        className="font-special"
                        sx={{ width: 48, height: 48 }}
                      >
                        {getInitials(player.full_name)}
                      </Avatar>
                      <div>
                        <p className="font-special text-lg leading-tight text-neutral-900 dark:text-neutral-50">
                          {player.full_name}
                        </p>
                        <p className="text-sm text-neutral-700 dark:text-neutral-100">
                          @{player.username} • {player.position || "Player"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs font-semibold text-primary-900 dark:text-primary-200">
                          <span className="inline-flex items-center gap-1 bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-primary-100 px-2 py-1 rounded-full">
                            ⚽ {player.goals} goals
                          </span>
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 px-2 py-1 rounded-full">
                            🅰️ {player.assists} assists
                          </span>
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 px-2 py-1 rounded-full">
                            🔥 {player.streak}-day streak
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          Points
                        </span>
                        <span className="font-special text-xl">
                          {player.points}
                        </span>
                      </div>
                      <div className="flex-1 sm:w-40">
                        <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-emerald-300"
                            style={{
                              width: `${Math.min(
                                100,
                                (player.points / (podium[0]?.points || 1)) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="surface-card rounded-3xl p-5 shadow-lg space-y-4">
            <div className="rounded-2xl border border-primary-200/70 dark:border-primary-800/70 bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/40 dark:to-emerald-900/30 p-4 shadow-inner space-y-2">
              <div className="flex items-center gap-3">
                <EmojiEventsIcon className="text-primary-900 dark:text-primary-200" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-primary-900 dark:text-primary-200 font-semibold">
                    How scoring works
                  </p>
                  <p className="font-special text-lg">Points + streaks</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-neutral-800 dark:text-neutral-100 font-fredoka">
                <p>⚽ Goals: +10 pts, 🅰️ Assists: +7 pts</p>
                <p>🧤 Saves: +5 pts, 💪 Tackles: +4 pts, 🛡️ Interceptions: +3 pts</p>
                <p>📅 Each game played: +2 pts (keep logging matches!)</p>
                <div className="mt-1 rounded-xl bg-white/70 dark:bg-neutral-800/70 p-3 border border-primary-100/70 dark:border-primary-800/70 space-y-1">
                  <p className="font-semibold">🔥 Streaks for kids</p>
                  <p>Every time you play and log a game, your streak meter heats up.</p>
                  <p>Goals and assists add extra “fire.”</p>
                  <p>Goalies/defenders get fire for saves, tackles, and interceptions too.</p>
                  <p>The app mixes your recent games and actions and sets your streak between 1 and 10 fireballs.</p>
                  <p>Play regularly to keep the fire glowing!</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LocalFireDepartmentIcon className="text-amber-900" />
              <h3 className="font-special text-xl">Side quests</h3>
            </div>
            <ul className="space-y-2 text-neutral-800 dark:text-neutral-100 font-fredoka">
              <li className="flex items-start gap-2">
                <span className="mt-1">🎯</span>
                <div>
                  <p className="font-semibold">Score 3 goals this week</p>
                  <p className="muted-copy">Unlock the “Sharpshooter” badge.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">🧊</span>
                <div>
                  <p className="font-semibold">Keep a clean sheet</p>
                  <p className="muted-copy">Goalies get bonus points.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">🤝</span>
                <div>
                  <p className="font-semibold">Assist a friend</p>
                  <p className="muted-copy">Assists fuel your streak meter.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">📸</span>
                <div>
                  <p className="font-semibold">Update your avatar</p>
                  <p className="muted-copy">
                    Show up on the board with style.
                  </p>
                </div>
              </li>
            </ul>

            <div className="rounded-2xl bg-gradient-to-r from-primary-100 to-emerald-100 dark:from-primary-900/60 dark:to-emerald-900/50 p-4 shadow-inner">
              <div className="flex items-center gap-3">
                <BoltIcon className="text-primary-900 dark:text-primary-200" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-primary-900 dark:text-primary-200 font-semibold">
                    Tip
                  </p>
                  <p className="font-special text-lg">Team boosts</p>
                </div>
              </div>
              <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
                Play together each weekend to earn a +15% squad bonus on your
                points.
              </p>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
};

const StatTile = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) => (
  <div className="rounded-2xl bg-white/85 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 px-3 py-2 shadow-sm flex items-center gap-2">
    {icon && <span className="text-primary-900 dark:text-primary-200">{icon}</span>}
    <div>
      <p className="text-xs text-neutral-700 dark:text-neutral-200">{label}</p>
      <p className="font-special text-lg text-neutral-900 dark:text-neutral-50">
        {value}
      </p>
    </div>
  </div>
);

const getInitials = (name?: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const toNumber = (value?: string | number) => {
  if (value === undefined || value === null) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const calculatePoints = ({
  goals,
  assists,
  saves,
  tackles,
  interceptions,
  gamesPlayed,
}: {
  goals: number;
  assists: number;
  saves: number;
  tackles: number;
  interceptions: number;
  gamesPlayed: number;
}) => {
  return (
    goals * 10 +
    assists * 7 +
    saves * 5 +
    tackles * 4 +
    interceptions * 3 +
    gamesPlayed * 2
  );
};

const buildBadges = ({
  goals,
  assists,
  saves,
  gamesPlayed,
}: {
  goals: number;
  assists: number;
  saves: number;
  gamesPlayed: number;
}) => {
  const badges: string[] = [];
  if (goals >= 10) badges.push("Goal Getter");
  if (assists >= 8) badges.push("Playmaker");
  if (saves >= 8) badges.push("Safe Hands");
  if (gamesPlayed >= 5) badges.push("Consistent");
  return badges;
};

const dedupeById = <T extends { id: string }>(items: T[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export default LeaderboardPage;
