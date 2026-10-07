"use client";

import React, { FC, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "../../public/assets/images/logocircle.png";
import Input from "@/components/Input";
import Button from "@/components/Button";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";

import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { loginUser, RsetUserLogin } from "@/store/slices/mainSlice";

interface LoginFormState {
  username: string;
  password: string;
}

interface DecodedToken {
  sub?: string;
  nameid?: string;
  [key: string]: unknown;
}

const LoginForm: FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector((state) => state.main);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formState, setFormState] = useState<LoginFormState>({
    username: "",
    password: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("rememberedUsername");
    if (saved) {
      setFormState((prev) => ({ ...prev, username: saved }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await dispatch(
      loginUser({
        username: formState.username,
        password: formState.password,
      }),
    );

    if (loginUser.fulfilled.match(result)) {
      const token = result.payload?.token;
      if (!token) return;

      const userData = jwtDecode<DecodedToken>(token);
      const userId = (userData.nameid ||
        userData.sub ||
        Object.values(userData)?.[1]) as string;

      sessionStorage.setItem("token", token);

      dispatch(
        RsetUserLogin({
          token,
          userId,
          username: formState.username,
        }),
      );

      if (rememberMe) {
        localStorage.setItem("rememberedUsername", formState.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      router.push("/home");
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg">
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
          <h1 className="text-2xl font-bold text-gray-800">Clash Talent</h1>
          <p className="text-gray-600 text-center">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <Input
              name="username"
              value={formState.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
              required
              className="w-full px-4 py-3 rounded-lg border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formState.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 pr-12 rounded-lg border"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              Remember Me
            </label>

            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            label="Sign in"
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          />

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link
                href="/signUp"
                className="text-blue-600 font-medium hover:underline"
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
