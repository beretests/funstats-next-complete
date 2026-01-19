"use client";

import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

interface CustomModalProps {
  title: string;
  modalOpen: boolean;
  handleClose: () => void;
  username?: string;
  handleAddFriend?: (username: string) => void;
  handleRemoveFriend?: (username: string) => void;
  error?: string;
  buttonText: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  title,
  modalOpen,
  handleClose,
  username,
  handleAddFriend,
  handleRemoveFriend,
  buttonText,
}) => {
  const [friendUsername, setFriendUsername] = useState("");

  useEffect(() => {
    if (!modalOpen) {
      setFriendUsername("");
    }
  }, [modalOpen]);

  return (
    <Modal open={modalOpen} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: "10px",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" mb={2}>
          {title}
        </Typography>
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={username ? username : friendUsername}
          onChange={(e) => setFriendUsername(e.target.value)}
          disabled={username ? true : false}
        />
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            onClick={
              username
                ? () => handleRemoveFriend && handleRemoveFriend(username)
                : () => handleAddFriend && handleAddFriend(friendUsername)
            }
            className="!bg-primary-800 !text-white hover:!bg-primary-900"
          >
            {buttonText}
          </Button>
          <Button
            variant="outlined"
            onClick={handleClose}
            className="!border-primary-900 !text-primary-900 hover:!bg-primary-50"
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CustomModal;
