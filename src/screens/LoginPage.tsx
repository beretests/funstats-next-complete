"use client";

import React from "react";
import Login from "../components/Login";

const LoginPage: React.FC = () => {
  return (
    <div className="page-shell min-h-[85vh] flex items-center justify-center">
      <Login />
    </div>
  );
};

export default LoginPage;
