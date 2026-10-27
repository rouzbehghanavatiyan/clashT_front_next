"use client";

import React, { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { BrandLogo } from "@/components/BrandLogo";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAppDispatch } from "@/store/reduxHook";
import {
  RsetCategory,
  RsetFollowerLength,
  RsetFollowingLength,
  RsetUserId,
  RsetUserLogin,
} from "@/store/slices/mainSlice";
import { saveTokens } from "@/services/tokenService";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { categoryService } from "@/services/category.service";
import { followService } from "@/services/follow.service";
import { syncPushToken } from "@/services/notify.service";

const REMEMBER_KEY = "rememberedUsername";
const LOCK_KEY = "loginLockUntil";
const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_DURATION_SEC = 5 * 60;

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const LoginForm: FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockRemaining, setLockRemaining] = useState(0);
  const isLocked = lockRemaining > 0;

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("Login Error");
  const [modalMessage, setModalMessage] = useState("");
  const [modalIsError, setModalIsError] = useState(true);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY) ?? "";
    if (saved) {
      setUsername(saved);
      setRememberMe(true);
    }

    const lockUntil = Number(sessionStorage.getItem(LOCK_KEY) || 0);
    const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
    if (remaining > 0) setLockRemaining(remaining);
  }, []);

  useEffect(() => {
    if (!isLocked) return;
    const timer = setInterval(() => {
      setLockRemaining((prev) => {
        const next = Math.max(prev - 1, 0);
        if (next === 0) sessionStorage.removeItem(LOCK_KEY);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLocked]);

  const openModal = (
    message: string,
    options?: { title?: string; isError?: boolean; showResend?: boolean },
  ) => {
    setModalTitle(options?.title ?? "Login Error");
    setModalIsError(options?.isError ?? true);
    setShowResend(options?.showResend ?? false);
    setModalMessage(message);
    setShowErrorModal(true);
  };

  const closeModal = () => {
    setShowErrorModal(false);
    setShowResend(false);
  };

  const lockedMessage = (remainingSec?: number) =>
    remainingSec
      ? `Too many failed attempts. Please try again in ${formatTime(remainingSec)}.`
      : `Too many failed attempts. Please try again in ${LOCK_DURATION_SEC / 60} minutes.`;

  const registerFailedAttempt = () => {
    const next = loginAttempts + 1;
    if (next >= MAX_LOGIN_ATTEMPTS) {
      setLoginAttempts(0);
      setLockRemaining(LOCK_DURATION_SEC);
      sessionStorage.setItem(
        LOCK_KEY,
        String(Date.now() + LOCK_DURATION_SEC * 1000),
      );
      return true;
    }
    setLoginAttempts(next);
    return false;
  };

  const validateForm = () => {
    const next: { username?: string; password?: string } = {};
    if (!username.trim()) next.username = "Username is required";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLoginSuccess = async (data: any) => {
    const { token, refreshToken, userId } = data ?? {};
    if (!token) throw new Error("Token not found in login response");

    saveTokens(token, refreshToken || "");
    dispatch(RsetUserLogin({ token, userId }));
    dispatch(RsetUserId(userId));

    await Promise.all([
      categoryService
        .list()
        .then((res) => dispatch(RsetCategory(res?.data?.data || [])))
        .catch((err) => console.error("Category List Error:", err?.message)),
      followService
        .followingLength(userId)
        .then((res) => dispatch(RsetFollowingLength(res?.data?.data)))
        .catch((err) => console.error("Following Length Error:", err?.message)),
      followService
        .followerLength(userId)
        .then((res) => dispatch(RsetFollowerLength(res?.data?.data)))
        .catch((err) => console.error("Follower Length Error:", err?.message)),
      userService
        .profileAttachment(userId)
        .then((res) => {
          if (res?.data?.data) {
            dispatch(RsetUserLogin({ ...res.data.data, token, userId }));
          }
        })
        .catch((err) => console.error("Profile Attachment Error:", err?.message)),
    ]);

    if (rememberMe) localStorage.setItem(REMEMBER_KEY, username.trim());
    else localStorage.removeItem(REMEMBER_KEY);

    void syncPushToken(userId);
    router.replace("/watch");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (isLocked) {
      openModal(lockedMessage(lockRemaining));
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.login({
        userName: username.trim(),
        password,
      });
      const payload = response?.data;
      const ok = payload?.status === 0 || payload?.statusCode === 200;
      const errorCode = payload?.errorCode || payload?.data?.errorCode;

      if (ok) {
        await handleLoginSuccess(payload?.data);
        return;
      }

      if (errorCode === "EMAIL_NOT_CONFIRMED") {
        openModal(
          payload?.message ||
          "Your account is not activated. Please verify your email.",
          { title: "Account Unverified", showResend: true, isError: true },
        );
        return;
      }

      const nowLocked = registerFailedAttempt();
      openModal(
        nowLocked
          ? lockedMessage()
          : payload?.message || "User not found or incorrect password.",
      );
    } catch (error: any) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      const errorCode =
        error?.response?.data?.errorCode || error?.response?.data?.data?.errorCode;

      if (errorCode === "EMAIL_NOT_CONFIRMED") {
        openModal(
          error?.response?.data?.message ||
          "Your account is not activated. Please verify your email.",
          { title: "Account Unverified", showResend: true, isError: true },
        );
        return;
      }

      if (status === 401 || status === 404) {
        const nowLocked = registerFailedAttempt();
        openModal(
          nowLocked
            ? lockedMessage()
            : "User not found or incorrect password. Please try again.",
        );
      } else {
        openModal(
          "Something went wrong. Please check your connection and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendLoading) return;
    const name = username.trim();
    if (!name) {
      openModal("Please enter your username first.", {
        title: "Validation Error",
        isError: true,
        showResend: false,
      });
      return;
    }

    try {
      setResendLoading(true);
      const res = await authService.resendVerificationEmail({ userName: name });
      const payload = res?.data;
      if (payload?.status === 0 || payload?.statusCode === 200) {
        openModal(
          payload?.message ||
          "A new verification link has been sent to your email. Please check your inbox and spam folder.",
          { title: "Verification Email Sent", isError: false, showResend: false },
        );
      } else {
        openModal(
          payload?.message || "Could not send the email. Please try again later.",
          { title: "Email Error", isError: true, showResend: true },
        );
      }
    } catch (error: any) {
      openModal(
        error?.response?.data?.message ||
        "Could not send the email. Please try again later.",
        { title: "Failed", isError: true, showResend: true },
      );
    } finally {
      setResendLoading(false);
    }
  };

  const inputClass = (hasError?: string) =>
    `w-full rounded-lg border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-zinc-900 dark:text-gray-100 dark:disabled:bg-zinc-800 ${hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-zinc-700"
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="mb-8 flex flex-col items-center">
          <BrandLogo
            size={64}
            showName={false}
            className="mb-4 transition-transform hover:scale-105"
            imageClassName="shadow-md ring-2 ring-blue-500/20"
            nameClassName="whitespace-nowrap text-2xl font-bold tracking-tight text-slate-800"
          />
          <p className="text-sm text-slate-500 dark:text-gray-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
            >
              Username
            </label>
            <Input
              id="username"
              name="username"
              value={username}
              suppressHydrationWarning
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUsername(e.target.value);
                setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              placeholder="Enter your username"
              autoComplete="username"
              disabled={loading || isLocked}
              className={inputClass(errors.username)}
            />
            {errors.username && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                <span>*</span>
                {errors.username}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                suppressHydrationWarning
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading || isLocked}
                className={`${inputClass(errors.password)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                disabled={loading}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 disabled:pointer-events-none"
              >
                {showPassword ? (
                  <VisibilityIcon fontSize="small" />
                ) : (
                  <VisibilityOffIcon fontSize="small" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                <span>*</span>
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-slate-600 hover:text-slate-900">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={loading}
                onChange={(e) => setRememberMe(e.target.checked)}
                suppressHydrationWarning
                className="h-4 w-4 rounded border-slate-300 text-blue-600 transition focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <span>Remember Me</span>
            </label>
            <Link
              href="/forgot-password"
              className="font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={loading}
            disabled={isLocked}
            loadingText="Signing in..."
            className="w-full text-base font-semibold"
          >
            {isLocked ? `Try again in ${formatTime(lockRemaining)}` : "Sign in"}
          </Button>

          <p className="pt-1 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signUp"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>

      {showErrorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className={`text-lg font-bold ${modalIsError ? "text-red-600" : "text-blue-600"
                }`}
            >
              {modalTitle}
            </h2>
            <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-gray-300">{modalMessage}</p>
            <div className="mt-5 flex items-center justify-end gap-3">
              {showResend && (
                <Button
                  type="button"
                  variant="ghost"
                  loading={resendLoading}
                  loadingText="Sending..."
                  onClick={handleResend}
                >
                  Resend email
                </Button>
              )}
              <Button type="button" className="min-w-20" onClick={closeModal}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
