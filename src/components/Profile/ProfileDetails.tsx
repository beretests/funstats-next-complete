"use client";

import React from "react";
import { useProfileStore } from "../../stores/profileStore";
import { calculateAge } from "../../utils/dateUtils";
import { useAuthStore } from "../../stores/authStore";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import StarsIcon from "@mui/icons-material/Stars";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const ProfileDetails: React.FC = () => {
  const { isEditing, setIsEditing } = useProfileStore();
  const { user } = useAuthStore();
  const player = user;

  const details = [
    {
      label: "Full Name",
      value: player?.full_name || player?.user_metadata?.full_name,
      icon: <PersonOutlineIcon className="text-white" />,
    },
    {
      label: "Email",
      value: player?.email,
      icon: <AlternateEmailIcon className="text-white" />,
    },
    {
      label: "Age",
      value:
        calculateAge(player?.date_of_birth) ||
        calculateAge(player?.user_metadata?.date_of_birth),
      icon: <CalendarMonthIcon className="text-white" />,
    },
    {
      label: "Position",
      value: player?.position || player?.user_metadata?.position,
      icon: <SportsSoccerIcon className="text-white" />,
    },
    {
      label: "Favorite Soccer Player",
      value:
        player?.favorite_soccer_player ||
        player?.user_metadata?.favorite_soccer_player,
      icon: <StarsIcon className="text-white" />,
    },
  ];

  const filled = details.filter((item) => item.value).length;
  const completion = Math.round((filled / details.length) * 100);
  const completionWidth = Math.max(completion, 8);
  const favoritePlayer =
    player?.favorite_soccer_player ||
    player?.user_metadata?.favorite_soccer_player;
  const position = player?.position || player?.user_metadata?.position;

  if (!isEditing) {
    return (
      <div className="grid w-full gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="surface-card p-6 rounded-3xl shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-primary-900 dark:text-primary-200 font-semibold">
                Player dossier
              </p>
              <h2 className="section-title text-left">About you</h2>
              <p className="muted-copy">
                {position
                  ? `A ${position} with their eyes on the next big match.`
                  : "Set your position so we can personalize your game plan."}{" "}
                {favoritePlayer
                  ? `Inspired by ${favoritePlayer}; use that spark to fuel your next training.`
                  : "Share your soccer inspiration to unlock player-specific drills."}
              </p>
            </div>
            <button className="button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {details.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-neutral-200/70 dark:border-neutral-700/80 bg-white/80 dark:bg-neutral-800/60 px-3 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-800 text-white dark:bg-primary-800">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
                      {item.label}
                    </p>
                    <p className="font-special text-base text-neutral-900 dark:text-neutral-50">
                      {item.value || "Add this to your profile"}
                    </p>
                  </div>
                </div>
                {!item.value && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-primary-50 text-primary-900 border border-primary-100 dark:bg-primary-900 dark:text-primary-100 dark:border-primary-700">
                    Needed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-5 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary-900 dark:text-primary-200 font-semibold">
                  Momentum
                </p>
                <h3 className="font-special text-xl">Profile completeness</h3>
              </div>
              <EmojiEventsIcon className="text-primary-900 dark:text-primary-200" />
            </div>
            <div className="mt-4">
              <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-emerald-300 transition-all duration-500"
                  style={{ width: `${completionWidth}%` }}
                />
              </div>
              <div className="flex justify-between text-sm mt-2 text-neutral-800 dark:text-neutral-300">
                <span>{completion}% complete</span>
                <span>{details.length - filled} fields left</span>
              </div>
            </div>
            <p className="muted-copy mt-3">
              Filling in the remaining details makes your recommendations and
              badges feel more personal.
            </p>
          </div>

          <div className="surface-card p-5 rounded-3xl shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <SportsSoccerIcon className="text-primary-900 dark:text-primary-200" />
              <h3 className="font-special text-xl">Weekly focus</h3>
            </div>
            <p className="muted-copy">
              A couple of quick wins to keep your profile active and your stats
              trending up.
            </p>
            <ul className="space-y-2 text-neutral-900 dark:text-neutral-100 font-fredoka">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                Refresh your favorite player for fresh drills.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                Log a friendly match to keep your streak alive.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                Upload a new avatar so friends spot you faster.
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProfileDetails;
