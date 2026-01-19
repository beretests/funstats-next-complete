"use client";

import React, { useState } from "react";
import {
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import { useAuthStore } from "../stores/authStore";
import { useAlertStore } from "../stores/alertStore";

const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
const token = process.env.NEXT_PUBLIC_GITHUB_PERSONAL_ACCESS_TOKEN;

const GitHubIssueButton: React.FC = () => {
  const { user } = useAuthStore();
  const { showAlert } = useAlertStore();

  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [issueType, setIssueType] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    const issueData = {
      title,
      body: description,
      labels: [issueType],
    };

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(issueData),
        }
      );

      if (response.ok) {
        setFormOpen(false);
        setOpen(false);
        setTitle("");
        setDescription("");
        showAlert(
          "success",
          "Thanks for letting us know what you think of the app. We are constantly working to improve your experience!"
        );
      } else {
        console.error("Failed to create issue", response);
      }
    } catch (error) {
      console.error("Error creating issue", error);
    }
  };

  if (user) {
    return (
      <>
        <Tooltip
          title="Report Issue / Request Feature"
          className="!fixed !bottom-4 !right-4"
        >
          <Fab
            color="primary"
            className="!bg-primary-800 !text-white shadow-lg hover:!bg-primary-900"
            onClick={() => setOpen(true)}
          >
            <ContactSupportIcon />
          </Fab>
        </Tooltip>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>What would you like to do?</DialogTitle>
          <DialogContent>
            <Button
              onClick={() => {
                setIssueType("bug");
                setFormOpen(true);
              }}
              className="!text-primary-900 hover:!bg-primary-50"
            >
              Report Bug
            </Button>
            <Button
              onClick={() => {
                setIssueType("enhancement");
                setFormOpen(true);
              }}
              className="!text-primary-900 hover:!bg-primary-50"
            >
              Request Feature
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={formOpen} onClose={() => setFormOpen(false)}>
          <DialogTitle>
            {issueType === "bug" ? "Report a Bug" : "Request a Feature"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="dense"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="dense"
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setFormOpen(false)}
              className="!text-primary-900 hover:!bg-primary-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              className="!bg-primary-800 !text-white hover:!bg-primary-900"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
};

export default GitHubIssueButton;
