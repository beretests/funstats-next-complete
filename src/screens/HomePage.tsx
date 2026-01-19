"use client";

import { motion } from "framer-motion";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "next/link";
import ScrollDownButton from "../components/ScrollDownButton";
import { Badge } from "@mui/material";

const HomePage = () => {
  const features = [
    {
      title: "Personalized Player Profiles",
      description: "Create unique profiles with customizable avatars",
    },
    {
      title: "Match Performance Tracker",
      description:
        "Log key stats like goals scored, saves and more during matches",
    },
    {
      title: "Interactive Leaderboard",
      description:
        "Compare stats with friends and teammates on a fun leaderboard",
    },
    {
      title: "Achievement Badges",
      description: "Unlock badges for milestones such as scoring a hat trick",
    },
  ];

  return (
    <div className="page-shell space-y-12">
      <section className="min-h-screen flex items-center py-12">
        <div className="container mx-auto flex flex-col gap-4 justify-between px-4 md:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-50 font-special mb-6"
          >
            Kick-Start Your Soccer Journey!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="md:text-xl text-neutral-800 dark:text-neutral-200 font-special mb-8"
          >
            Fun and interactive soccer app promoting healthy competition among
            young soccer players!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link
              href="/login"
              className="button inline-flex justify-center px-6 py-3 text-lg"
            >
              Get Started
            </Link>
          </motion.div>
          <ScrollDownButton />
        </div>
      </section>
      <section className="bg-primary-50 dark:bg-neutral-800/60 py-6 rounded-2xl shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="section-title text-center mb-8">
            App Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                raised
                key={index}
                className="surface-card rounded-2xl hover:shadow-lg transition-shadow duration-300"
                sx={{
                  borderRadius: 5,
                  p: 0,
                }}
              >
                <CardContent className="px-4">
                  {feature.title === "Interactive Leaderboard" ||
                  feature.title === "Achievement Badges" ? (
                    <Badge
                      badgeContent="⏳"
                      color="secondary"
                      overlap="rectangular"
                      className="pr-4 mb-2"
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: "var(--color-secondary-800)",
                          color: "#fff",
                        },
                      }}
                    >
                      <h5 className="font-special text-center">
                        {feature.title}
                      </h5>
                    </Badge>
                  ) : (
                    <h5 className="font-special ">{feature.title}</h5>
                  )}
                  <p className="font-fredoka text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
