"use client";

import React from "react";
import { StyledEngineProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Header from "../components/Header";
import AlertSnackbar from "../components/AlertSnackbar";
import GitHubIssueButton from "../components/GithubIssueButton";
import { AuthSubscriber } from "../stores/authStore";

type ProvidersProps = {
  children: React.ReactNode;
};

const Providers = ({ children }: ProvidersProps) => {
  return (
    <StyledEngineProvider injectFirst>
      <AuthSubscriber />
      <Header />
      <AlertSnackbar />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider>
      <GitHubIssueButton />
    </StyledEngineProvider>
  );
};

export default Providers;
