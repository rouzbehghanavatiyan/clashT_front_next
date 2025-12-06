"use client";
import React, { FC, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "@/assets/img/1724181984017.jpg";
import Input from "@/components/Input";
import Button from "@/components/Button";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";

import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { loginUser, RsetUserLogin } from "@/store/slices/mainSlice";

const LoginForm: FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector((state) => state.main);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formState, setFormState] = useState<any>({
    username: "",
    password: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("rememberedUsername");
    if (saved) {
      setFormState((prev: any) => ({ ...prev, username: saved }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(
      loginUser({
        userName: formState.username,
        password: formState.password,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      const token = result.payload.data.token;
      const userData: any = jwtDecode(token);
      const userId = Object.values(userData)?.[1] as string;

      sessionStorage.setItem("token", token);

      dispatch(
        RsetUserLogin({
          token,
          userId,
          username: formState.username,
        })
      );

      // Save username if Remember Me is active
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
    <div className="flex items-center justify-center min-h-screen bg-gray-200 from-gray-50 to-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-4">
            <div className="relative w-24 h-24 rounded-full shadow-lg">
              <Image src={logo} alt="Logo" fill className="object-cover" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Clash Talent</h1>
          <p className="text-gray-600 text-center">Sign in to your account</p>
        </div>
        {error && (
          <div className="mb-6 p-4 text-red-700 rounded-lg text-sm">
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
                className="w-full px-4 py-3 pr-12 rounded-lg border"
              />
              <span
                onClick={() => setShowPassword((p) => !p)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="cursor-pointer"
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
            label="sign in"
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          />
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Don’t have an account?
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
