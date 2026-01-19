"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoadingStore } from "../stores/loadingStore";
import { useAlertStore } from "../stores/alertStore";
import { useAuthStore } from "../stores/authStore";
import api from "../services/api";
import CustomModal from "../components/CustomModal";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  CircularProgress,
} from "@mui/material";

interface Friend {
  id: string;
  avatar_url: string;
  username: string;
  full_name: string;
  date_of_birth: number;
  friendship_date: number;
  position: string;
}

const FriendsPage: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const { isLoading, setLoading } = useLoadingStore();
  const showAlert = useAlertStore((state) => state.showAlert);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);

  const [error, setError] = useState("");

  const positionGroups = {
    Goalkeeper: ["Goalkeeper", "GK"],
    Defender: ["Defender", "CB", "RB", "RWB", "LB", "LWB"],
    Midfielder: ["Midfielder", "CAM", "CDM", "CM"],
    Forward: ["Forward", "ST", "LW", "RW"],
  };

  const handleClose = () => {
    setModalAddOpen(false);
  };

  const handleAddFriend = async (friendUsername: string) => {
    const trimmedUsername = friendUsername.trim();
    if (!trimmedUsername) {
      showAlert("error", "Username is required.");
      return;
    }
    if (!user?.id) {
      showAlert("error", "User not found. Please sign in again.");
      return;
    }

    try {
      const response = await api.post(`/api/${user.id}/friends/add`, {
        friendUsername: trimmedUsername,
      });
      if (response.data) {
        setFriends([...friends, response.data.friend]);
        handleClose();
        showAlert("success", "Successfully added friend.");
      } else {
        showAlert("error", "Failed to add friend. Please try again.");
      }
    } catch (err) {
      const fallback = "An error occurred. Please try again.";
      const message = (() => {
        if (!err) return fallback;
        if (typeof err === "string") return err;

        const errorWithResponse = err as {
          message?: string;
          response?: { status?: number; data?: unknown };
        };
        const response = errorWithResponse.response;
        const status = response?.status;
        const data = response?.data;

        if (typeof data === "string") {
          try {
            const parsed = JSON.parse(data) as { error?: string; message?: string };
            return parsed.error || parsed.message || data;
          } catch {
            return data;
          }
        }
        if (data && typeof data === "object") {
          const parsed = data as { error?: string; message?: string };
          if (parsed.error || parsed.message) {
            return parsed.error || parsed.message || fallback;
          }
        }

        if (status === 404) return "Friend not found.";
        if (status === 409) return "Friendship already exists.";
        if (status === 400) return "Username is required.";

        if (errorWithResponse.message) return errorWithResponse.message;
        if (err instanceof Error && err.message) return err.message;
        return fallback;
      })();
      setError(message);
      showAlert("error", message || fallback);
    }
  };

  const handleRemoveFriend = async (friendUsername: string) => {
    try {
      const response = await api.delete(`/api/${user.id}/friends/`, {
        params: { friendUsername },
      });
      if (response.data) {
        setFriends(
          friends.filter((friend) => friend.username !== friendUsername)
        );
        handleClose();
        showAlert("success", "Successfully removed friend.");
      } else {
        showAlert("error", "Failed to remove friend. Please try again.");
      }
    } catch (err) {
      console.log(err);
      showAlert("error", "An error occurred. Please try again.");
    }
  };

  const getPositionCategory = (position: string) => {
    for (const [category, positions] of Object.entries(positionGroups)) {
      if (positions.includes(position)) return category;
    }
    return "Unknown";
  };
  const colors = {
    Goalkeeper: "!bg-ok-800",
    Defender: "!bg-info-800",
    Midfielder: "!bg-secondary-800",
    Forward: "!bg-fail-800",
  };

  const getPositionColor = (positionCategory: keyof typeof colors) => {
    return colors[positionCategory] || "!bg-neutral-800";
  };

  useEffect(() => {
    const fetchPlayerFriends = async (userId: string) => {
      setLoading(true);
      try {
        const friends = await api.get(`/api/${userId}/friends`);
        console.log(friends);
        setFriends(friends.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        showAlert("error", `${(error as Error).message} Please try again.`);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchPlayerFriends(user.id);
    }
  }, [setLoading, showAlert, user?.id]);

  const handleCompareStats = (friendId: string, friendUsername: string) => {
    router.push(`/compare-stats/${friendId}/${friendUsername}`);
  };

  return (
    <div className="page-shell flex flex-col items-center gap-6">
      <h1 className="section-title text-center text-4xl">
        My Soccer Buddies
      </h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-[70vh]">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="p-2 md:px-20 text-center mb-4">
            <p className="muted-copy text-sm font-fredoka mb-4">
              Each buddy card is color-coded based on the position they play.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <p className="bg-ok-800 text-white px-2 py-1 font-bold rounded-md inline-block text-sm drop-shadow-md">
                🟢 Goalkeepers – Protect the net
              </p>
              <p className="bg-info-800 text-white px-2 py-1 font-bold rounded-md inline-block text-sm drop-shadow-md">
                🔵 Defenders – Hold the backline
              </p>
              <p className="bg-secondary-800 text-white font-bold px-2 py-1 rounded-md inline-block text-sm drop-shadow-md">
                🟣 Midfielders – Control the game
              </p>
              <p className="bg-fail-800 text-white font-bold px-2 py-1 rounded-md inline-block text-sm drop-shadow-md">
                🔴 Forwards – Lead the attack
              </p>
              <p className="bg-neutral-100 text-neutral-900 font-bold px-2 py-1 rounded-md inline-block text-xs sm:text-sm drop-shadow-md dark:bg-neutral-800 dark:text-neutral-50">
                ⚪ Invite your buddy to update his/her position in their profile
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card
              raised
              sx={{ height: 300, minWidth: 300, alignContent: "center" }}
              className="!rounded-xl surface-card !flex !items-center !justify-center"
            >
              <CardActions className="!justify-center ">
                <Button
                  size="large"
                  className="!text-white !bg-primary-800 hover:!bg-primary-900 !rounded-lg !normal-case !shadow-lg !justify-self-center !transition-colors"
                  onClick={() => setModalAddOpen(true)}
                >
                  Add New Buddy
                </Button>
              </CardActions>
            </Card>

            <CustomModal
              title="Enter New Buddy's Username"
              modalOpen={modalAddOpen}
              handleAddFriend={handleAddFriend}
              handleClose={handleClose}
              error={error}
              buttonText="Add Buddy"
            />

            {friends.map((friend, index) => {
              const positionCategory = getPositionCategory(friend.position);
              const bgColor = getPositionColor(
                positionCategory as keyof typeof colors
              );
              return (
                <div key={index}>
                  <Card
                    raised
                    sx={{ maxHeight: 300, maxWidth: 300 }}
                    className={`${bgColor} !rounded-xl`}
                  >
                    <CardMedia
                      sx={{ height: 170, objectFit: "auto" }}
                      image={friend.avatar_url}
                      title={friend.username}
                      className="bg-neutral-300"
                    />
                    <CardContent
                      className="flex flex-col items-center !pt-1"
                      sx={{ height: 90 }}
                    >
                      <Typography
                        variant="h6"
                        className="mt-4 font-bold text-white"
                        sx={{ fontFamily: "BubblegumSans" }}
                      >
                        {friend.username}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="text-white text-2xl !font-bold"
                        sx={{ fontFamily: "Fredoka" }}
                      >
                        {friend.full_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-white font-special !font-bold"
                        sx={{ fontFamily: "Nunito" }}
                      >
                        Friends Since:{" "}
                        {new Date(friend?.friendship_date).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions className="!pt-0 !px-6 !justify-between">
                      <Button
                        size="small"
                        className="!text-white !bg-primary-800 hover:!bg-primary-900 !rounded-lg !normal-case !shadow-lg !px-2 !transition-colors"
                        onClick={() =>
                          handleCompareStats(friend.id, friend.username)
                        }
                      >
                        Compare Stats
                      </Button>
                      <Button
                        size="small"
                        className="!text-white !bg-primary-800 hover:!bg-primary-900 !rounded-lg !normal-case !shadow-lg !px-2 !transition-colors"
                        onClick={() => setFriendToRemove(friend)}
                      >
                        Remove Friend
                      </Button>
                    </CardActions>
                  </Card>
                  {friendToRemove && (
                    <CustomModal
                      title={`Are you sure you no longer want to view or compare ${friendToRemove.username}'s stats`}
                      modalOpen={!!friendToRemove}
                      handleRemoveFriend={() => {
                        handleRemoveFriend(friendToRemove.username);
                        setFriendToRemove(null);
                      }}
                      handleClose={() => setFriendToRemove(null)}
                      error={error}
                      buttonText="Remove Buddy"
                      username={friendToRemove.username}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default FriendsPage;
