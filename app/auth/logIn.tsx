"use client";

import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import "./account.css";

const provider = new GoogleAuthProvider();

const LogIn = ({ toogleSite }: any) => {
  const [loginError, setLoginError] = useState("");

  const google = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;

        window.location.href = "/generator";
      })
      .catch((error) => {
        const errorMessage = error.message;
        setLoginError(errorMessage);

        const email = error.customData.email;
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = (document.getElementById("email") as HTMLInputElement)?.value;
    const password = (document.getElementById("password") as HTMLInputElement)
      ?.value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential: any) => {
        // Signed in
        const user = userCredential.user;
        window.location.href = "/generator";
      })
      .catch((error: any) => {
        const errorMessage = error.message;
        setLoginError(errorMessage);
      });
  };

  return (
    <section className="bg-gray-50 dark:bg-slate-950 h-screen">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Log in to your account
            </h1>
            <p className="text-red-400">{loginError}</p>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
              >
                Log In
              </button>
              <button
                onClick={google}
                className="login-with-google-btn text-black flex items-center justify-center w-full hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:hover:bg-gray-400 dark:focus:ring-gray-800 "
              >
                <div className="mr-2">
                  <FaGoogle />
                </div>
                Google
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400 flex">
                Don't have an account yet?
                <span
                  className="font-medium text-primary-600 hover:underline text-blue-500 cursor-pointer pl-1"
                  onClick={toogleSite}
                >
                  Create Account
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogIn;
