"use client";

import React, { FC, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { BrandLogo } from "@/components/BrandLogo";
import { authService } from "@/services/auth.service";

interface FormErrors {
  username?: string;
  email?: string;
  gender?: string;
  password?: string;
  passwordConfirmation?: string;
  general?: string;
}

interface FormValues {
  username?: string;
  email?: string;
  gender?: number;
  password?: string;
  passwordConfirmation?: string;
}

interface ModalState {
  visible: boolean;
  type: "success" | "error";
  title: string;
  description: React.ReactNode;
  onConfirm?: () => void;
}

const genderOptions = [
  { label: "Male", value: 1, icon: MaleIcon },
  { label: "Female", value: 2, icon: FemaleIcon },
];

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
      <span>*</span>
      <span>{message}</span>
    </p>
  );
};

const SignUpForm: FC = () => {
  const router = useRouter();
  const [inputs, setInputs] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    type: "error",
    title: "",
    description: "",
  });

  const handleInputChange = (field: keyof FormValues, value: string | number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const next: FormErrors = {};
    let isValid = true;

    if (!inputs.username?.trim()) {
      next.username = "Username is required";
      isValid = false;
    }

    if (!inputs.email?.trim()) {
      next.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
      next.email = "Please enter a valid email";
      isValid = false;
    }

    if (inputs.gender === undefined || inputs.gender === null) {
      next.gender = "Please select your gender";
      isValid = false;
    }

    if (!inputs.password) {
      next.password = "Password is required";
      isValid = false;
    } else if (inputs.password.length < 8) {
      next.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!inputs.passwordConfirmation) {
      next.passwordConfirmation = "Please confirm your password";
      isValid = false;
    } else if (inputs.passwordConfirmation !== inputs.password) {
      next.passwordConfirmation = "Passwords do not match";
      isValid = false;
    }

    setErrors(next);
    return isValid;
  };

  const handleCloseModal = () => {
    const confirm = modalState.onConfirm;
    setModalState((prev) => ({ ...prev, visible: false }));
    confirm?.();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: undefined }));

    try {
      const res = await authService.register({
        username: inputs.username,
        email: inputs.email,
        password: inputs.password,
        userTypeId: 1,
        confirmPassword: inputs.passwordConfirmation,
        userGender: Number(inputs.gender),
      });

      const { status, message: apiMessage } = res?.data || {};

      if (status === 0 || status === 2) {
        setModalState({
          visible: true,
          type: "success",
          title: "Registration Successful",
          description: (
            <p className="text-center text-sm leading-6 text-slate-600">
              Please check your inbox{" "}
              <span className="font-bold text-slate-900">email</span>, and make
              sure to check your{" "}
              <span className="font-bold text-slate-900">spam</span> folder as
              well!
            </p>
          ),
          onConfirm: () => router.replace("/login"),
        });
      } else {
        setErrors({
          general: apiMessage || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Sign Up Error:", error);
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
          <p className="text-sm text-slate-500 dark:text-gray-400">Create your account</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
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
              autoComplete="username"
              value={inputs.username || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange("username", e.target.value)
              }
              placeholder="Enter your username"
              disabled={isLoading}
              className={inputClass(errors.username)}
            />
            <FieldError message={errors.username} />
          </div>

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
              autoComplete="email"
              value={inputs.email || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange("email", e.target.value)
              }
              placeholder="Enter your email"
              disabled={isLoading}
              className={inputClass(errors.email)}
            />
            <FieldError message={errors.email} />
          </div>

          <div>
            <p className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">
              Gender
            </p>
            <div className="grid grid-cols-2 gap-3">
              {genderOptions.map((item) => {
                const isSelected = inputs.gender === item.value;
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleInputChange("gender", item.value)}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-3 text-sm transition ${isSelected
                        ? "border-blue-600 bg-blue-50 font-semibold text-blue-700"
                        : errors.gender
                          ? "border-red-500 text-slate-700 hover:bg-slate-50"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    <Icon fontSize="small" />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.gender} />
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
                autoComplete="new-password"
                value={inputs.password || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("password", e.target.value)
                }
                placeholder="Enter your password"
                disabled={isLoading}
                className={`${inputClass(errors.password)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <VisibilityIcon fontSize="small" />
                ) : (
                  <VisibilityOffIcon fontSize="small" />
                )}
              </button>
            </div>
            <FieldError message={errors.password} />
          </div>

          <div>
            <label
              htmlFor="passwordConfirmation"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={inputs.passwordConfirmation || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("passwordConfirmation", e.target.value)
                }
                placeholder="Confirm your password"
                disabled={isLoading}
                className={`${inputClass(errors.passwordConfirmation)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={isLoading}
                tabIndex={-1}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? (
                  <VisibilityIcon fontSize="small" />
                ) : (
                  <VisibilityOffIcon fontSize="small" />
                )}
              </button>
            </div>
            <FieldError message={errors.passwordConfirmation} />
          </div>

          {errors.general && (
            <p className="text-center text-sm text-red-600">{errors.general}</p>
          )}

          <Button
            type="submit"
            size="lg"
            loading={isLoading}
            loadingText="Signing up..."
            className="mt-2 w-full text-base font-semibold"
          >
            Sign up
          </Button>

          <p className="pt-1 text-center text-sm text-slate-600">
            Already have an account?{" "}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${modalState.type === "success"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
                }`}
            >
              {modalState.type === "success" ? "✓" : "✕"}
            </div>
            <h2 className="mb-2 text-lg font-bold text-slate-900">
              {modalState.title}
            </h2>
            <div className="mb-6">{modalState.description}</div>
            <Button
              type="button"
              className={`w-full font-semibold ${modalState.type === "success"
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

export default SignUpForm;
