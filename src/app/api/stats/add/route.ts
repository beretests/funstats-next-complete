import { NextRequest, NextResponse } from "next/server";
import knex from "../../../../lib/db/knex";
import { verifyRequestToken } from "../../../../lib/auth/verifyToken";
import { clearLeaderboardCache } from "../../../../lib/leaderboard/cache";

export async function POST(request: NextRequest) {
  const auth = verifyRequestToken(request);
  if (!auth.ok) return auth.response;

  const {
    playerId,
    date,
    homeTeamId,
    teamId,
    seasonId,
    awayTeamId,
    stats,
    awardId,
    tournamentId,
    position
  } = await request.json();

  const positionPlayed = position || stats?.position;

  try {
    const newStats = await knex.transaction(async (trx) => {
      const [playerTeamSeason] = await trx("player_teams_seasons")
        .select("id")
        .where({
          player_id: playerId,
          team_id: teamId,
          season_id: seasonId
        });

      let playerTeamSeasonId = playerTeamSeason?.id;

      if (!playerTeamSeasonId) {
        const [newPlayerTeamSeason] = await trx("player_teams_seasons").insert(
          {
            player_id: playerId,
            team_id: teamId,
            season_id: seasonId
          },
          ["id"]
        );
        playerTeamSeasonId = newPlayerTeamSeason.id;
      }

      const [game] = await trx("games").select("id").where({
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        date
      });
      let gameId = game?.id;

      if (!gameId) {
        const [newGame] = await trx("games").insert(
          {
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            date
          },
          ["id"]
        );
        gameId = newGame.id;
      }

      await trx("player_stats").insert({
        player_id: playerId,
        game_id: gameId,
        player_team_season_id: playerTeamSeasonId,
        position_played: positionPlayed || null,
        goals_scored: stats.goalsScored || 0,
        assists: stats.assists || 0,
        shots_on_target: stats.shotsOnTarget || 0,
        tackles: stats.tackles || 0,
        interceptions: stats.interceptions || 0,
        saves: stats.saves || 0,
        yellow_cards: stats.yellowCards || 0,
        red_cards: stats.redCards || 0,
        fouls: stats.fouls || 0,
        headers_won: stats.headersWon || 0,
        offsides: stats.offsides || 0
      });

      if (awardId) {
        await trx("player_awards").insert({
          game_id: gameId,
          player_id: playerId,
          season_id: seasonId,
          award_id: awardId
        });
      }

      if (tournamentId) {
        await trx("game_tournaments").insert({
          game_id: gameId,
          tournament_id: tournamentId
        });
      }
    });

    clearLeaderboardCache();

    return NextResponse.json({ newStats, message: "Stat successfully added." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
}
