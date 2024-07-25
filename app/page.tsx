"use client";

import React, { useEffect, useState } from "react";
import LogIn from "./auth/logIn";
import CreateAccount from "./auth/create";
import Spinner from "./spinner/spinner";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

const App = () => {
  const [site, setSite] = useState(true);
  const [loading, setLoading] = useState(true);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "/generator";
    }
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading)
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner />
      </div>
    );

  if (site) return <LogIn toogleSite={() => setSite(!site)} />;
  return <CreateAccount toogleSite={() => setSite(!site)} />;
};

export default App;
