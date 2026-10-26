"use client";

import React, { FC, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import logo from "../../../public/assets/images/logocircle.png";
import Input from "@/components/Input";
import Button from "@/components/Button";

import { useAppDispatch } from "@/store/reduxHook";
import { RsetUserLogin } from "@/store/slices/mainSlice";
import { saveTokens } from "@/services/tokenService";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";

const REMEMBER_KEY = "rememberedUsername";

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const getSnapshot = () => localStorage.getItem(REMEMBER_KEY) ?? "";
const getServerSnapshot = () => "";

const LoginForm: FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const remembered = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const [usernameInput, setUsernameInput] = useState<string | null>(null);
  const [rememberInput, setRememberInput] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const username = usernameInput ?? remembered;
  const rememberMe = rememberInput ?? remembered !== "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (attempts >= 3) {
      setError("Too many failed attempts. Please try again later.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await authService.login({
        userName: username.trim(),
        password,
      });
      const ok = response?.data?.status === 0 || response?.data?.statusCode === 200;
      const token = response?.data?.data?.token;
      const refreshToken = response?.data?.data?.refreshToken;
      const userId = response?.data?.data?.userId;

      if (!ok || !token) {
        setAttempts((p) => p + 1);
        setError(response?.message || "User not found or incorrect password.");
        return;
      }

      saveTokens(token, refreshToken || "");
      dispatch(RsetUserLogin({ token, userId, username: username.trim() }));

      try {
        const res = await userService.profileAttachment(userId);
        const profileData = res?.data?.data;
        if (profileData) {
          dispatch(RsetUserLogin({ ...profileData, token, userId }));
        }
      } catch (err) {
        console.error("profileAttachment error:", err);
      }

      if (rememberMe) localStorage.setItem(REMEMBER_KEY, username.trim());
      else localStorage.removeItem(REMEMBER_KEY);

      router.push("/");
    } catch (err) {
      setAttempts((p) => p + 1);
      const status = isAxiosError(err) ? err.response?.status : undefined;
      setError(
        status === 404 || status === 401
          ? "User not found or incorrect password. Please try again."
          : "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/login" className="mb-4 transition-transform hover:scale-105">
            <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-md ring-2 ring-blue-500/20">
              <Image
                src={logo}
                alt="Clash Talent logo"
                fill
                sizes="96px"
                priority
                className="object-cover"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Clash Talent
          </h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">
              Username
            </label>
            <Input
              id="username"
              name="username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsernameInput(e.target.value)
              }
              placeholder="Enter your username"
              autoComplete="username"
              disabled={loading}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-11 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                disabled={loading}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-600 disabled:pointer-events-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-slate-600 hover:text-slate-900">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={loading}
                onChange={(e) => setRememberInput(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 transition focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <span>Remember Me</span>
            </label>

            <Link
              href="/forgot-password"
              className="font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={loading}
            loadingText="Signing in..."
            className="w-full"
          >
            Sign in
          </Button>

          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signUp"
                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
