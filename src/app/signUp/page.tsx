"use client";

import React, { FC, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/Input";
import Button from "@/components/Button";
import logo from "../../public/assets/images/logocircle.png";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import MessageModal from "@/components/MessageModal";
import { authService } from "@/services/auth.service";

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  general?: string;
}

interface FormValues {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}

const SignUpForm: FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const main = useAppSelector((state) => state.main);

  const [inputs, setInputs] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!inputs.username?.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!inputs.email?.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!inputs.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (inputs.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!inputs.passwordConfirmation) {
      newErrors.passwordConfirmation = "Please confirm your password";
      isValid = false;
    } else if (inputs.passwordConfirmation !== inputs.password) {
      newErrors.passwordConfirmation = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const postData = {
        UserName: inputs.username,
        Password: inputs.password,
        Email: inputs.email,
      };
      const res = await authService.register(postData);
      const { status, message } = res?.data;

      if (status === 0 || status === 2) {
        // Optional: show message modal
        // dispatch(RsetMessageModal({ title: "Check your email to verify.", show: true, icon: "email" }));
        router.push("/home");
      } else {
        setErrors({
          general: message || "Registration failed. Please try again.",
        });
      }
    } catch (err) {
      setErrors({ general: "An error occurred. Please try again later." });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 from-gray-50 to-gray-200">
      <div className="rounded-xl p-8 w-full max-w-md mx-4">
        <form onSubmit={handleSignUp} className="space-y-5">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <Link href="/" className="mb-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden">
                <Image src={logo} alt="Logo" fill className="object-cover" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mt-4">
              Clash Talent
            </h1>
            <p className="text-gray-600 mt-1">Create an Account</p>
          </div>

          {/* General error */}
          {errors.general && (
            <div className="text-red-600 p-3 rounded bg-red-50 text-sm">
              {errors.general}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <Input
              name="username"
              value={inputs.username || ""}
              onChange={handleInputChange}
              placeholder="Enter your username"
              className={`w-full py-2 px-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.username && (
              <p className="text-red-600 mt-1 text-sm">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              name="email"
              type="email"
              value={inputs.email || ""}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={`w-full py-2 px-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-600 mt-1 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={inputs.password || ""}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`w-full py-2 px-4 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </span>
            </div>
            {errors.password && (
              <p className="text-red-600 mt-1 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                name="passwordConfirmation"
                type={showConfirmPassword ? "text" : "password"}
                value={inputs.passwordConfirmation || ""}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={`w-full py-2 px-4 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.passwordConfirmation
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <VisibilityOffIcon />
                ) : (
                  <VisibilityIcon />
                )}
              </span>
            </div>
            {errors.passwordConfirmation && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.passwordConfirmation}
              </p>
            )}
          </div>

          <Button
            type="submit"
            loading={isLoading}
            label="Sign Up"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          />

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Log In
            </Link>
          </p>
        </form>

        {main?.messageModal?.show && <MessageModal />}
      </div>
    </div>
  );
};

export default SignUpForm;
