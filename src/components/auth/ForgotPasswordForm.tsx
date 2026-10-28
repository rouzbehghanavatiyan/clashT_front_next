"use client";

import React, { FC, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { userService } from "@/services/user.service";

interface ModalState {
  visible: boolean;
  type: "success" | "error";
  title: string;
  description: string;
  onConfirm?: () => void;
}

const ForgotPasswordForm: FC = () => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [errors, setErrors] = useState<{
    identifier?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    type: "success",
    title: "",
    description: "",
  });

  const handleInputChange = (value: string) => {
    setIdentifier(value);
    setErrors({ identifier: undefined, general: undefined });
  };

  const handleCloseModal = () => {
    const confirm = modalState.onConfirm;
    setModalState((prev) => ({ ...prev, visible: false }));
    confirm?.();
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    if (!identifier.trim()) {
      setErrors({ identifier: "Email is required" });
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});

      const res = await userService.forgotPassword({
        email: identifier.trim(),
      });
      const { status, message: apiMessage } = res?.data || {};

      if (status === 0 || status === 2) {
        setModalState({
          visible: true,
          type: "success",
          title: "Email Sent",
          description:
            "If an account matches that email, a password reset link has been sent.",
          onConfirm: () => {
            router.replace("/login");
          },
        });
      } else {
        setErrors({
          general: apiMessage || "Failed to process request. Please try again.",
        });
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      setModalState({
        visible: true,
        type: "error",
        title: "Error",
        description: "An error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError?: string) =>
    `w-full rounded-lg border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-zinc-900 dark:text-gray-100 dark:disabled:bg-zinc-800 ${
      hasError
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
          <h1 className="text-xl font-bold text-slate-800 dark:text-gray-100">
            Reset Password
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-gray-400">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={identifier}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange(e.target.value)
              }
              placeholder="e.g., user@example.com"
              autoComplete="email"
              disabled={isLoading}
              className={inputClass(errors.identifier)}
            />
            {errors.identifier && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                <span>*</span>
                {errors.identifier}
              </p>
            )}
          </div>

          {!!errors.general && (
            <p className="text-center text-sm text-red-600">{errors.general}</p>
          )}

          <Button
            type="submit"
            size="lg"
            loading={isLoading}
            loadingText="Sending..."
            className="w-full text-base font-semibold"
          >
            Send
          </Button>

          <p className="pt-1 text-center text-sm text-slate-600 dark:text-gray-400">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>

      {modalState.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-zinc-900">
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
                modalState.type === "success"
                  ? "bg-green-50 text-green-600 dark:bg-green-950/40"
                  : "bg-red-50 text-red-600 dark:bg-red-950/40"
              }`}
            >
              {modalState.type === "success" ? "✓" : "✕"}
            </div>
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-gray-100">
              {modalState.title}
            </h2>
            <p className="mb-6 text-sm leading-6 text-slate-600 dark:text-gray-300">
              {modalState.description}
            </p>
            <Button
              type="button"
              className={`w-full font-semibold ${
                modalState.type === "success"
                  ? "bg-green-600 hover:bg-green-700 focus-visible:ring-green-500"
                  : ""
              }`}
              onClick={handleCloseModal}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
