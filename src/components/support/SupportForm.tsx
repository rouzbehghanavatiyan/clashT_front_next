"use client";

import React, { useState } from "react";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CircularProgress from "@mui/material/CircularProgress";
import { supportConnect } from "@/services/misc.service";

export const SUPPORT_EMAIL = "app.clashtalent@gmail.com";

type SupportFormProps = {
  showCancel?: boolean;
  onCancel?: () => void;
  className?: string;
};

export default function SupportForm({
  showCancel = true,
  onCancel,
  className = "",
}: SupportFormProps) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const showFeedback = (title: string, message: string, success: boolean) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setIsSuccess(success);
    setFeedbackOpen(true);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      showFeedback("Copied", "Email copied to clipboard!", true);
    } catch (error) {
      console.error("Copy email error:", error);
      showFeedback("Error", "Could not copy the email. Please try again.", false);
    }
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!subject.trim()) {
      showFeedback("Validation Error", "Please enter a subject.", false);
      return;
    }

    if (!description.trim()) {
      showFeedback("Validation Error", "Please enter your message.", false);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await supportConnect({
        subject: subject.trim(),
        description: description.trim(),
        userEmail: trimmedEmail,
      });

      if (res?.data?.status === 0) {
        showFeedback(
          "Message Sent",
          "Thank you! Your message has been sent to our support team.",
          true,
        );
        setEmail("");
        setSubject("");
        setDescription("");
      } else {
        showFeedback(
          "Error",
          res?.data?.message ||
          "Failed to send your message. Please try again.",
          false,
        );
      }
    } catch (error) {
      console.error("Support submit error:", error);
      showFeedback(
        "Error",
        "Failed to send your message. Please try again later.",
        false,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`flex flex-col gap-3 ${className}`}>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="rounded-full bg-gray-100 p-2 text-blue-600 dark:bg-zinc-800 dark:text-blue-400">
              <MailOutlineIcon sx={{ fontSize: 20 }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Official Support Email
              </p>
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                {SUPPORT_EMAIL}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            aria-label="Copy support email"
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-zinc-800 dark:hover:text-gray-200"
          >
            <ContentCopyIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="support-email"
            className="text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            Email{" "}
            <span className="font-medium text-gray-400 dark:text-gray-500">
              (optional)
            </span>
          </label>
          <input
            id="support-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. you@example.com"
            autoComplete="email"
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="support-subject"
            className="text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            Subject
          </label>
          <input
            id="support-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Account issue, Feedback..."
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-100"
          />
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write your message or issue description here..."
          className="h-[130px] w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none transition-colors focus:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-100"
        />

        <div className={`flex gap-3 pt-2 ${showCancel ? "mt-auto" : ""}`}>
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting && <CircularProgress size={16} color="inherit" />}
            Send
          </button>
        </div>
      </div>

      {feedbackOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6"
          onClick={() => setFeedbackOpen(false)}
        >
          <div
            className="flex w-full max-w-xs flex-col items-center gap-3.5 rounded-2xl bg-white p-5 text-center shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            {isSuccess ? (
              <CheckCircleOutlineIcon sx={{ fontSize: 40, color: "#2e7d32" }} />
            ) : (
              <ErrorOutlineIcon sx={{ fontSize: 40, color: "#d32f2f" }} />
            )}
            <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
              {feedbackTitle}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {feedbackMessage}
            </p>
            <button
              type="button"
              onClick={() => setFeedbackOpen(false)}
              className={`mt-1 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${isSuccess ? "bg-blue-600" : "bg-gray-900"
                }`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
