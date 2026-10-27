"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/reduxHook";
import { useCreateMediaPick } from "@/hooks/useCreateMediaPick";

type MatchGender = "random" | "male" | "female";

interface ActivityOption {
  label: string;
  value: string;
  id: number;
  icon: string;
}

interface CreateMatchPageProps {
  videoSrc?: string;
  coverImage?: string;
  isLoading?: boolean;
  onAccept?: (gender: MatchGender, activity: string, categoryId: number) => void;
  onCancel?: () => void;
}

const activityOptions: ActivityOption[] = [
  { label: "Ball Sports", id: 1010, value: "ball_sports", icon: "⚽" },
  { label: "Fitness & Gym", id: 1004, value: "fitness", icon: "🏋️" },
  { label: "Combat & Boxing", id: 1011, value: "combat", icon: "🥊" },
  { label: "Street & Urban", id: 2040, value: "urban", icon: "🛹" },
  { label: "Other Sports", id: 2041, value: "otherSport", icon: "🎯" },
];

const genderOptions: { label: string; value: MatchGender; desc: string }[] = [
  { label: "Random Match", value: "random", desc: "Open to all contenders" },
  { label: "Male Opponents", value: "male", desc: "Matched with males only" },
  { label: "Female Opponents", value: "female", desc: "Matched with females only" },
];

const CreateMatchClient: React.FC<CreateMatchPageProps> = ({
  videoSrc: videoSrcProp,
  coverImage: coverImageProp,
  isLoading = false,
  onAccept,
  onCancel,
}) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const storedSrc = useAppSelector((state) => state.video.videoSrc);
  const storedFile = useAppSelector((state) => state.video.videoFile);
  const { openPicker, fileInput, error: pickerError } = useCreateMediaPick();
  const videoSrc = videoSrcProp || storedSrc;
  const isImage = Boolean(storedFile?.type?.startsWith("image/"));
  const coverImage = coverImageProp || (isImage ? storedSrc : "");
  const [selectedGender, setSelectedGender] = useState<MatchGender>("random");
  const [selectedActivity, setSelectedActivity] = useState<ActivityOption | null>(
    null,
  );
  const [activityError, setActivityError] = useState(false);

  const handleStartMatch = () => {
    if (!selectedActivity) {
      setActivityError(true);
      return;
    }
    onAccept?.(selectedGender, selectedActivity.value, selectedActivity.id);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else router.push("/");
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100 flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-6xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <header className="px-8 py-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
              Setup Your Clash Match
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 mt-1">
              Review your talent video, configure rules, and challenge opponents.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Ready to Publish
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          <section className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between gap-6 bg-slate-950/40">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                Video Preview
              </span>
              <div className="relative aspect-[9/14] sm:aspect-video lg:aspect-[4/5] w-full bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {fileInput}
                {videoSrc && !isImage ? (
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverImage}
                    alt="Selected photo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={openPicker}
                    className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center"
                  >
                    <p className="text-sm font-semibold text-slate-300">
                      Choose a photo or video
                    </p>
                    <p className="text-xs text-slate-500">
                      Videos must be under 1 minute
                    </p>
                    {pickerError && (
                      <p className="text-xs font-medium text-rose-400">{pickerError}</p>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="font-semibold text-slate-200 text-xs">Strict Match Rule</p>
              <p className="text-slate-400 mt-0.5 text-xs">
                Opponents will have 120s to respond once this match begins.
              </p>
            </div>
          </section>

          <section className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between gap-8">
            <div className="space-y-8">
              <div>
                <p className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  1. Match Topic / Sport Category
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activityOptions.map((item) => {
                    const isSelected = selectedActivity?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedActivity(item);
                          setActivityError(false);
                        }}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600/10 border-emerald-500 ring-2 ring-emerald-500/30 text-white"
                            : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <span className="text-2xl mb-2">{item.icon}</span>
                        <span className="text-sm font-semibold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
                {activityError && (
                  <p className="mt-2 text-xs text-rose-400 font-medium">
                    Please select a topic before continuing.
                  </p>
                )}
              </div>

              <div>
                <p className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  2. Opponent Preferences
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {genderOptions.map((item) => {
                    const isSelected = selectedGender === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSelectedGender(item.value)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/30 text-white"
                            : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleStartMatch}
                className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm"
              >
                {isLoading ? "Processing..." : "Launch Match"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default CreateMatchClient;
