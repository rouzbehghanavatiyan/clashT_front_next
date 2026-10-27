"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CircularProgress from "@mui/material/CircularProgress";

import {
  forgotPassword,
  requestChangeEmail,
  userService,
} from "@/services/user.service";
import { useAppSelector } from "@/store/reduxHook";
import StringHelpers from "@/utils/StringHelpers";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

interface SectionCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

const SectionCard = ({ icon, title, subtitle, children }: SectionCardProps) => (
    <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <div className="flex items-center gap-2">
            <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {title}
            </h2>
        </div>
        {subtitle && (
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {subtitle}
            </p>
        )}
        <div className="flex flex-col gap-4">{children}</div>
    </section>
);

export default function EditProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const userLogin = useAppSelector((state) => state?.main?.userLogin);

    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [mail, setMail] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [resetEmail, setResetEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEmailUpdating, setIsEmailUpdating] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const [feedback, setFeedback] = useState<{
        open: boolean;
        title: string;
        message: string;
        isSuccess: boolean;
        goBack: boolean;
    }>({
        open: false,
        title: "",
        message: "",
        isSuccess: false,
        goBack: false,
    });

    useEffect(() => {
        if (userLogin) {
            setBio(userLogin.bio || "");
            setLocation(userLogin.location || "");
            setMail(userLogin.mail || "");
        }
    }, [userLogin]);

    const showFeedback = (
        title: string,
        message: string,
        isSuccess: boolean,
        goBack = false
    ) => {
        setFeedback({ open: true, title, message, isSuccess, goBack });
    };

    const handleFeedbackClose = () => {
        const shouldGoBack = feedback.goBack;
        setFeedback((prev) => ({ ...prev, open: false }));
        if (shouldGoBack) {
            router.back();
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const postData = {
            bio: bio || null,
            location: location || null,
            mail: mail || null,
        };

        try {
            setIsSubmitting(true);
            const res = await userService.addProfile(postData);

            if (res?.data?.status === 0) {
                showFeedback(
                    "Success",
                    res?.data?.message || "Profile updated successfully.",
                    true
                );
            } else {
                showFeedback(
                    "Error",
                    res?.data?.message || "Failed to update profile.",
                    false
                );
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            showFeedback(
                "Network Error",
                "Something went wrong. Please try again.",
                false
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async () => {
        if (isResetting) return;

        const email = resetEmail.trim();
        if (!EMAIL_REGEX.test(email)) {
            showFeedback("Error", "Please enter a valid email address.", false);
            return;
        }

        try {
            setIsResetting(true);
            const res: any = await forgotPassword({ email });

            if (res?.data?.status === 0) {
                showFeedback(
                    "Email Sent",
                    "If an account matches that email, a password reset link has been sent. Check your inbox.",
                    true
                );
                setResetEmail("");
            } else {
                showFeedback(
                    "Error",
                    res?.data?.message || "Failed to process request. Please try again.",
                    false
                );
            }
        } catch (error: any) {
            console.error("Forgot Password Error:", error);
            showFeedback(
                "Network Error",
                error?.response?.data?.message ||
                "An error occurred. Please try again later.",
                false
            );
        } finally {
            setIsResetting(false);
        }
    };

    const handleEmailChangeRequest = async () => {
        if (isEmailUpdating) return;

        const email = newEmail.trim();
        if (!EMAIL_REGEX.test(email)) {
            showFeedback("Error", "Please enter a valid email address.", false);
            return;
        }

        try {
            setIsEmailUpdating(true);
            const res: any = await requestChangeEmail({ newEmail: email });

            if (res?.data?.status === 0) {
                showFeedback(
                    "Verification Sent",
                    `A confirmation link has been sent to ${email}. Your email will change after you confirm it.`,
                    true
                );
                setNewEmail("");
            } else {
                showFeedback(
                    "Error",
                    res?.data?.message || "Failed to send verification email.",
                    false
                );
            }
        } catch (error: any) {
            console.error("Change email error:", error);
            showFeedback(
                "Network Error",
                error?.response?.data?.message ||
                "Something went wrong. Please try again.",
                false
            );
        } finally {
            setIsEmailUpdating(false);
        }
    };

    const avatarSrc =
        selectedImage ||
        (userLogin?.profile ? StringHelpers.getProfile(userLogin.profile) : "/default-avatar.png");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 flex flex-col">
            <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
                {/* Profile Picture Upload Section */}
                <div className="flex flex-col items-center justify-center mb-8 gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-2 border-gray-200 dark:border-zinc-700 shadow-md transition-all hover:opacity-90"
                    >
                        <Image
                            src={avatarSrc}
                            alt="Profile avatar"
                            fill
                            sizes="112px"
                            className="object-cover"
                            unoptimized={Boolean(selectedImage)}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <CameraAltOutlinedIcon sx={{ color: "#fff", fontSize: 28 }} />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Upload Image
                    </button>
                </div>

                <div className="flex flex-col gap-6">
                    <SectionCard
                        icon={<PersonOutlineIcon sx={{ fontSize: 22 }} />}
                        title="Profile Info"
                    >
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Social Link
                            </label>
                            <input
                                type="text"
                                value={mail}
                                onChange={(e) => setMail(e.target.value)}
                                placeholder="https://..."
                                className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-600 dark:focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Location
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="City, Country"
                                className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-600 dark:focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Status / Bio
                            </label>
                            <textarea
                                rows={4}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us about yourself..."
                                className="w-full resize-none rounded-xl border border-gray-300 dark:border-zinc-700 bg-transparent p-3.5 text-sm outline-none transition-colors focus:border-indigo-600 dark:focus:border-indigo-500"
                            />
                        </div>

                        <div className="mt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 rounded-xl border border-gray-300 dark:border-zinc-700 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleSubmit()}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting && <CircularProgress size={16} color="inherit" />}
                                Save
                            </button>
                        </div>
                    </SectionCard>

                    {/* Section: Change Email */}
                    <SectionCard
                        icon={<MailOutlineIcon sx={{ fontSize: 22 }} />}
                        title="Change Email"
                        subtitle="We'll send a confirmation link to your new email. Your current email stays active until you confirm it."
                    >
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                New Email
                            </label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-600 dark:focus:border-indigo-500"
                            />
                        </div>

                        <button
                            type="button"
                            disabled={isEmailUpdating}
                            onClick={handleEmailChangeRequest}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {isEmailUpdating && (
                                <CircularProgress size={16} color="inherit" />
                            )}
                            Send Confirmation Email
                        </button>
                    </SectionCard>

                    {/* Section: Change Password */}
                    <SectionCard
                        icon={<LockOutlinedIcon sx={{ fontSize: 22 }} />}
                        title="Change Password"
                        subtitle="Enter your account email and we'll send you a link to set a new password."
                    >
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Account Email
                            </label>
                            <input
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="Your Email"
                                className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-600 dark:focus:border-indigo-500"
                            />
                        </div>

                        <button
                            type="button"
                            disabled={isResetting}
                            onClick={handleResetPassword}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-600 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors disabled:opacity-50"
                        >
                            {isResetting && <CircularProgress size={16} color="inherit" />}
                            Send Reset Link
                        </button>
                    </SectionCard>
                </div>
            </main>

            {/* Feedback Dialog / Modal */}
            {feedback.open && (
                <div
                    onClick={handleFeedbackClose}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-xs rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl flex flex-col items-center text-center gap-3"
                    >
                        {feedback.isSuccess ? (
                            <CheckCircleOutlineIcon sx={{ fontSize: 44, color: "#22c55e" }} />
                        ) : (
                            <ErrorOutlineIcon sx={{ fontSize: 44, color: "#ef4444" }} />
                        )}

                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                            {feedback.title}
                        </h3>

                        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                            {feedback.message}
                        </p>

                        <button
                            type="button"
                            onClick={handleFeedbackClose}
                            className="mt-2 w-full rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
