"use client";

import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useAlertStore } from "../stores/alertStore";

const AlertSnackbar = () => {
  const { open, message, type, closeAlert } = useAlertStore();
  const alertClass =
    type === "success"
      ? "!bg-ok-800 !text-white"
      : type === "error"
      ? "!bg-fail-800 !text-white"
      : type === "warning"
      ? "!bg-warn-900 !text-white"
      : "!bg-info-800 !text-white";

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={closeAlert}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <MuiAlert
        onClose={closeAlert}
        severity={type}
        elevation={6}
        variant="filled"
        className={alertClass}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default AlertSnackbar;
