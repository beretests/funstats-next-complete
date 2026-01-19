"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useRouter } from "next/navigation";
import { useAlertStore } from "../stores/alertStore";
import { useLoadingStore } from "../stores/loadingStore";
import api from "../services/api";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CircularProgress from "@mui/material/CircularProgress";
import { retryFetch } from "../utils/retryFetch";

const Login: React.FC = () => {
  const showAlert = useAlertStore((state) => state.showAlert);
  const { isLoading, setLoading } = useLoadingStore();

  const router = useRouter();
  const [identifier, setIdentifier] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUserName] = useState("");

  const [isSignUp, setIsSignUp] = useState(false);

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "auth") {
      showAlert("warning", "You must be logged in to view this content.");
    }
  }, [showAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    let didNavigate = false;

    try {
      const successMessage = isSignUp
        ? "You have created an account! Update your profile."
        : "You are logged in!";

      if (isSignUp) {
        await retryFetch(
          async () => {
            const { error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  username,
                  email,
                },
              },
            });

            if (error) throw error;
          },
          3,
          1000
        );
        router.push("/profile");
        didNavigate = true;
        showAlert("success", successMessage);
      } else {
        let userEmail = identifier.includes("@") ? identifier : null;

        await retryFetch(
          async () => {
            if (!userEmail) {
              const endpoint = "/auth/login";
              const payload = { identifier, password };
              const response = await api.post(endpoint, payload);
              userEmail = response.data.email;
              setEmail(userEmail ?? "");
            } else {
              setEmail(userEmail);
            }

            if (!userEmail) {
              throw new Error("Email is not set before authentication");
            }

            const { data, error } = await supabase.auth.signInWithPassword({
              email: userEmail,
              password,
            });

            if (error) throw error;
            if (!data) console.log("No data");

            return data;
          },
          3,
          1000
        );

        router.push("/profile");
        didNavigate = true;
        showAlert("success", successMessage);
      }
    } catch (error) {
      showAlert("error", (error as Error).message);
    } finally {
      if (!didNavigate) {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-[90vh]">
          <CircularProgress />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-4 mt-4 p-6 surface-card text-neutral-900 dark:text-neutral-50"
        >
          <h2 className="font-special text-2xl md:text-3xl !text-neutral-900 dark:!text-neutral-50 text-center mb-4">
            {isSignUp ? "Sign Up" : "Login"}
          </h2>
          {isSignUp ? (
            <FormControl
              sx={{ my: 1, width: "100%", fontFamily: "font-special" }}
              variant="outlined"
            >
              <InputLabel
                htmlFor="email"
                className="!text-neutral-800 dark:!text-neutral-300"
              >
                Email
              </InputLabel>
              <OutlinedInput
                className="!text-neutral-900 dark:!text-neutral-50"
                id="email"
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </FormControl>
          ) : (
            <FormControl
              sx={{ my: 1, width: "100%", fontFamily: "font-special" }}
              variant="outlined"
            >
              <InputLabel htmlFor="email-or-username">
                Email or Username
              </InputLabel>
              <OutlinedInput
                required
                autoFocus
                id="email-or-username"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                label="Email or Username"
              />
            </FormControl>
          )}
          <FormControl sx={{ my: 1, width: "100%" }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
              Password
            </InputLabel>
            <OutlinedInput
              required
              id="outlined-adornment-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    onMouseUp={handleMouseUpPassword}
                    edge="end"
                    className="!text-neutral-900 dark:!text-neutral-50 hover:!text-neutral-900 dark:hover:!text-neutral-50"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
          {isSignUp && (
            <FormControl
              sx={{ my: 1, width: "100%", fontFamily: "font-special" }}
              variant="outlined"
            >
              <InputLabel htmlFor="username">Username</InputLabel>
              <OutlinedInput
                required
                id="username"
                type="text"
                label="Username"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
              />
            </FormControl>
          )}
          <button
            type="submit"
            className="button w-full p-2 !bg-primary-800 hover:!bg-primary-900 text-white"
          >
            {isSignUp ? "Sign Up" : "Login"}
          </button>
          <p className="mt-4 text-center font-special">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="!text-neutral-900 font-semibold underline hover:!text-neutral-900 dark:!text-neutral-50 dark:hover:!text-neutral-50"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Do not have an account?{" "}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="!text-neutral-900 font-semibold underline hover:!text-neutral-900 dark:!text-neutral-50 dark:hover:!text-neutral-50"
                >
                  Sign Up
                </button>
              </>
            )}
          </p>
        </form>
      )}
    </div>
  );
};

export default Login;
