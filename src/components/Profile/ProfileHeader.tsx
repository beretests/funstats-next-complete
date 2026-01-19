"use client";

import { useProfileStore } from "../../stores/profileStore";
import { useAuthStore } from "../../stores/authStore";
import { Avatar, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { supabase } from "../../services/supabase";
import { useAlertStore } from "../../stores/alertStore";
import LoopIcon from "@mui/icons-material/Loop";
import { useState } from "react";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TimelineIcon from "@mui/icons-material/Timeline";
import { calculateAge } from "../../utils/dateUtils";

const ProfileHeader = () => {
  const { isEditing, uploading, setUploading, setIsEditing } =
    useProfileStore();
  const { user, setUser } = useAuthStore();
  const showAlert = useAlertStore((state) => state.showAlert);
  const [file, setFile] = useState<File | null>(null);

  const player = user;
  const displayName =
    player?.full_name || player?.user_metadata?.full_name || "Player";
  const username =
    player?.user_metadata?.username ||
    player?.user_metadata?.full_name ||
    player?.email;
  const favoritePlayer =
    player?.favorite_soccer_player ||
    player?.user_metadata?.favorite_soccer_player;
  const position = player?.position || player?.user_metadata?.position;
  const age =
    calculateAge(player?.date_of_birth) ||
    calculateAge(player?.user_metadata?.date_of_birth);

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);

    try {
      if (!player) {
        showAlert("error", "User not found. Please sign in again.");
        setUploading(false);
        return;
      }

      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        const fileName = `${player.id}-${Date.now()}-${e.target.files[0].name}`;

        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(fileName, e.target.files[0]);

        if (error) {
          console.error("Error uploading file:", error.message);
          showAlert("error", `Failed to upload image, ${error.message}`);
          setUploading(false);
          return;
        }

        const publicUrl = supabase.storage
          .from("avatars")
          .getPublicUrl(data.path).data;

        if (!publicUrl) {
          showAlert("error", "Failed to retrieve image URL");
          return;
        }

        const { error: dbError } = await supabase
          .from("profiles")
          .update({ avatar_url: publicUrl.publicUrl })
          .eq("id", player.id);

        if (dbError) {
          console.error("Error updating profile:", dbError.message);
          showAlert("error", `Failed to update profile, ${dbError.message}`);
          setUploading(false);
          return;
        }

        setUser({ ...player, avatar_url: publicUrl.publicUrl });
        setIsEditing(false);
        showAlert("success", "Image uploaded successfully!");
      }

      setUploading(false);
    } catch (err) {
      console.error("Error uploading image:", err);
      showAlert("error", "An error occurred while uploading the image");
      setUploading(false);
    }
  };

  return (
    <div className="relative overflow-hidden surface-card px-5 py-7 md:px-8 md:py-9 rounded-3xl text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800" />
      <div className="absolute -left-16 top-6 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-emerald-300/30 blur-3xl" />

      <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-white/10 blur" />
          <Avatar
            src={
              file
                ? URL.createObjectURL(file)
                : player?.avatar_url || player?.user_metadata?.avatar_url
                ? player.avatar_url || player?.user_metadata?.avatar_url
                : undefined
            }
            alt={displayName}
            className="font-special ring-4 ring-white/20 shadow-2xl"
            sx={{ width: 196, height: 196 }}
          >
            {!player?.avatar_url && player?.user_metadata?.full_name
              ? player.user_metadata.full_name
                  .split(" ")
                  .map((part: string) => part[0])
                  .join("")
              : ""}
          </Avatar>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-400 text-neutral-900 font-special text-xs px-3 py-1 rounded-full shadow-lg">
            Ready to play
          </span>
        </div>

        <div className="flex-1 space-y-4 text-left">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm uppercase tracking-[0.2em] text-white font-semibold">
              Player profile
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-black/30 text-white font-special">
              @{username}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-special font-bold">
            {displayName || "Player"}
          </h1>
          <p className="text-white font-fredoka">
            {position ? `Dynamic ${position} pushing for the next big game.` : "Set up your position to personalize your training plan."}{" "}
            {favoritePlayer
              ? `Channeling inspiration from ${favoritePlayer}.`
              : ""}
          </p>

          <div className="flex flex-wrap gap-3">
            {position && (
              <span className="bg-black/30 text-white px-3 py-1 rounded-full text-sm inline-flex items-center gap-2">
                <SportsSoccerIcon fontSize="small" />
                {position}
              </span>
            )}
            {favoritePlayer && (
              <span className="bg-black/30 text-white px-3 py-1 rounded-full text-sm inline-flex items-center gap-2">
                <EmojiEventsIcon fontSize="small" />
                {favoritePlayer}
              </span>
            )}
            {age && (
              <span className="bg-black/30 text-white px-3 py-1 rounded-full text-sm inline-flex items-center gap-2">
                <TimelineIcon fontSize="small" />
                {age} yrs old
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-black/30 border border-white/20 rounded-2xl p-3 shadow-lg">
              <p className="text-xs text-white">Focus</p>
              <p className="text-lg font-special">Consistency</p>
              <p className="text-white text-sm">Show up weekly to keep your streak alive.</p>
            </div>
            <div className="bg-black/30 border border-white/20 rounded-2xl p-3 shadow-lg">
              <p className="text-xs text-white">Energy</p>
              <p className="text-lg font-special">Match Ready</p>
              <p className="text-white text-sm">Stay hydrated and warm up before logging stats.</p>
            </div>
            <div className="bg-black/30 border border-white/20 rounded-2xl p-3 shadow-lg">
              <p className="text-xs text-white">Next Move</p>
              <p className="text-lg font-special">Update profile</p>
              <p className="text-white text-sm">Fine-tune details to unlock better insights.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {!isEditing && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setIsEditing(true)}
                className="!bg-white !text-primary-900 !font-special hover:!bg-white/90"
              >
                Edit profile
              </Button>
            )}

            {isEditing && (
              <Button
                component="label"
                role={undefined}
                variant="outlined"
                tabIndex={-1}
                startIcon={
                  uploading ? (
                    <LoopIcon className="animate-spin" />
                  ) : (
                    <CloudUploadIcon />
                  )
                }
                disabled={uploading}
                className="!border-white !text-white hover:!border-white/80 hover:!bg-black/30"
              >
                {uploading ? "Uploading..." : "Upload image"}
                <VisuallyHiddenInput type="file" onChange={handleImageUpload} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileHeader;
