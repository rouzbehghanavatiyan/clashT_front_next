"use client";

import React, { FC, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import logo from "../../public/assets/images/logocircle.png";
import Input from "@/components/Input";
import Button from "@/components/Button";

import { useAppDispatch } from "@/store/reduxHook";
import { RsetUserLogin } from "@/store/slices/mainSlice";
import { saveTokens } from "@/services/tokenService";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";

const REMEMBER_KEY = "rememberedUsername";

// خواندن localStorage بدون useEffect: روی سرور "" برمی‌گرداند
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

  // null یعنی کاربر هنوز دست نبرده و مقدار ذخیره‌شده نمایش داده می‌شود
  const [usernameInput, setUsernameInput] = useState<string | null>(null);
  const [rememberInput, setRememberInput] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");

  const username = usernameInput ?? remembered;
  const rememberMe = rememberInput ?? remembered !== "";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

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
      console.log("response", response)
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

      router.push("/home");
      router.refresh();
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
          <Link href="/" className="mb-4 transition-transform hover:scale-105">
            <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-md ring-2 ring-blue-500/20">
              <Image
                src={logo}
                alt="Logo"
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
            <svg
              className="h-5 w-5 shrink-0 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Username
            </label>
            <Input
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Input
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
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
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
              Don’t have an account?{" "}
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