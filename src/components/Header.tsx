"use client";

import React from "react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { ThemeToggle } from "./ThemeToggle";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import PeopleIcon from "@mui/icons-material/People";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { useAlertStore } from "../stores/alertStore";
import { supabase } from "../services/supabase";
import { Badge } from "@mui/material";

export const Header: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const showAlert = useAlertStore((state) => state.showAlert);
  const { theme } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
    showAlert("success", "You have successfully logged out!");
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const [state, setState] = React.useState({
    right: false,
    top: false,
    menuOpen: false,
  });

  const toggleDrawer =
    (anchor: string, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setState({ ...state, [anchor]: open, menuOpen: !state.menuOpen });
    };

  const list = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List className="w-full bg-neutral-900/90 text-white !font-special">
        <ListItem disablePadding>
          <Link href="/profile" className="w-full">
            <ListItemButton>
              <ListItemIcon>
                <ManageAccountsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Profile"
                sx={{ fontFamily: "BubblegumSans" }}
                className="!font-special"
              />
            </ListItemButton>
          </Link>
        </ListItem>
        <ListItem disablePadding>
          <Link href="/stats" className="w-full">
            <ListItemButton>
              <ListItemIcon>
                <QueryStatsIcon />
              </ListItemIcon>
              <ListItemText primary="Stats" />
            </ListItemButton>
          </Link>
        </ListItem>
        <ListItem disablePadding>
          <Link href="/friends" className="w-full">
            <ListItemButton>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Friends" />
            </ListItemButton>
          </Link>
        </ListItem>
        <Badge
          badgeContent="⏳ Coming Soon"
          color="secondary"
          overlap="circular"
          className=""
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "var(--color-secondary-800)",
              color: "#fff",
            },
          }}
        >
          <ListItem disablePadding>
            <Link href="/leaderboard" className="w-full">
              <ListItemButton>
                <ListItemIcon>
                  <LeaderboardIcon />
                </ListItemIcon>
                <ListItemText primary="Leaderboard" />
              </ListItemButton>
            </Link>
          </ListItem>
        </Badge>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  const anchor = "top";

  return (
    <header className="bg-gradient-to-r from-primary-800 to-secondary-800 rounded-bl-2xl rounded-br-2xl min-h-12 flex justify-between px-2 py-2 items-center shadow-md md:px-8">
      <div className="flex items-center gap-1 md:gap-2">
        <Link href="/">
          <Image
            src={
              theme === "dark"
                ? "/logo-warn-100-dark.png"
                : "/logo-warn-100.png"
            }
            alt="FunStats Logo"
            width={30}
            height={30}
            className="rounded-full shadow-xs hover:scale-110 transition-transform duration-300 ease-in-out drop-shadow-2xl"
            priority
          />
        </Link>
        <h1 className="drop-shadow-3xl font-special text-white text-[1.7rem] pt-2 ">
          FunStats
        </h1>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex gap-1">
        <ThemeToggle
          darkIcon={<DarkModeIcon className="w-4 h-4" />}
          lightIcon={<LightModeIcon className="w-4 h-4" />}
        />

        {isAuthenticated ? (
          <>
            <button
              onClick={toggleDrawer(anchor, true)}
              className="bg-primary-800 text-white rounded-full p-1 shadow-sm"
            >
              {state.menuOpen ? <MenuOpenIcon /> : <MenuIcon />}
            </button>

            <SwipeableDrawer
              anchor={anchor}
              open={state[anchor]}
              onClose={toggleDrawer(anchor, false)}
              onOpen={toggleDrawer(anchor, true)}
              className=""
              ModalProps={{
                keepMounted: false,
              }}
            >
              {list()}
            </SwipeableDrawer>
          </>
        ) : (
          <Link
            href="/login"
            className="p-1 bg-primary-800 text-white rounded-full shadow-sm"
          >
            <LoginIcon className="rounded-full" />
          </Link>
        )}
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-3 items-center font-special text-white ">
        <ThemeToggle
          darkIcon={<DarkModeIcon className="w-4 h-4" />}
          lightIcon={<LightModeIcon className="w-4 h-4" />}
        />
        {isAuthenticated ? (
          <div className="flex items-center gap-4 text-lg font-bold font-special">
            <>
              <Link
                href="/profile"
                className={`px-1 rounded-md transition-colors duration-200 ${
                  isActive("/profile")
                    ? "bg-primary-800 text-white"
                    : "hover:text-white"
                }`}
              >
                Profile
              </Link>
              <Link
                href="/stats"
                className={`px-1 rounded-md transition-colors duration-200 ${
                  isActive("/stats")
                    ? "bg-primary-800 text-white"
                    : "hover:text-white"
                }`}
              >
                Stats
              </Link>
              <Link
                href="/friends"
                className={`px-1 rounded-md transition-colors duration-200 ${
                  isActive("/friends")
                    ? "bg-primary-800 text-white"
                    : "hover:text-white"
                }`}
              >
                Friends
              </Link>
              <Badge
                badgeContent="⏳"
                color="secondary"
                overlap="rectangular"
                className="mr-1"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "var(--color-secondary-800)",
                    color: "#fff",
                  },
                }}
              >
                <Link
                  href="/leaderboard"
                  className={`px-2 py-1 rounded-md transition-colors duration-200 ${
                    isActive("/leaderboard")
                      ? "bg-primary-800 text-white"
                      : "hover:text-white"
                  }`}
                >
                  Leaderboard
                </Link>
              </Badge>
              <button type="button" className="" onClick={handleLogout}>
                Logout
              </button>
            </>
          </div>
        ) : (
          <div className="text-white">
            <Link href="/login" className="">
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
