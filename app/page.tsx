"use client";

import React, { useEffect, useState } from "react";
import LogIn from "./auth/logIn";
import CreateAccount from "./auth/create";

const App = () => {
  const [site, setSite] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <></>;

  if (site) return <LogIn toogleSite={() => setSite(!site)} />;
  return <CreateAccount toogleSite={() => setSite(!site)} />;
};

export default App;
