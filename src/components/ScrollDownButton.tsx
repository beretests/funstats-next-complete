"use client";

import React from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const ScrollDownButton: React.FC = () => {
  return (
    <div className="flex justify-center mt-10">
      <button
        className="animate-bounce bg-primary-800 text-white font-special px-4 py-2 rounded-full shadow-lg hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300/60"
        onClick={() =>
          window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
        }
      >
        Learn More <KeyboardArrowDownIcon />
      </button>
    </div>
  );
};

export default ScrollDownButton;
