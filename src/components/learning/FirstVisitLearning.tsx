"use client";

import { useCallback, useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PublicIcon from "@mui/icons-material/Public";
import introduceImage from "../../../public/assets/images/intrduce.png";
import Started from "../../../public/assets/ranks/starter.png";
import bronseBase1 from "../../../public/assets/ranks/bronze1.png";
import bronseBase2 from "../../../public/assets/ranks/bronze2.png";
import bronseBase3 from "../../../public/assets/ranks/bronze3.png";
import silver1 from "../../../public/assets/ranks/silver1.png";
import silver2 from "../../../public/assets/ranks/silver2.png";
import silver3 from "../../../public/assets/ranks/silver3.png";
import gold1 from "../../../public/assets/ranks/gold1.png";
import gold2 from "../../../public/assets/ranks/gold2.png";
import gold3 from "../../../public/assets/ranks/gold3.png";
import gem1 from "../../../public/assets/ranks/gem1.png";
import gem2 from "../../../public/assets/ranks/gem2.png";
import gem3 from "../../../public/assets/ranks/gem3.png";
import ruby1 from "../../../public/assets/ranks/ruby1.png";
import ruby2 from "../../../public/assets/ranks/ruby2.png";
import ruby3 from "../../../public/assets/ranks/ruby3.png";
import word from "../../../public/assets/ranks/worldMain.png";
import { SITE_LOGO, SITE_NAME } from "@/lib/seo";
import Button from "@/components/Button";
import { useAppSelector } from "@/store/reduxHook";
import { getAccessToken } from "@/services/tokenService";

interface RankItem {
  name: string;
  img: StaticImageData;
  description: string;
}

const allRanks: RankItem[] = [
  {
    name: "Starter",
    img: Started,
    description: "Just starting out. The journey begins here!",
  },
  {
    name: "Bronze 1",
    img: bronseBase1,
    description: "Taking the first steps in the Bronze tier.",
  },
  {
    name: "Bronze 2",
    img: bronseBase2,
    description: "Getting stronger. Bronze level 2 achieved.",
  },
  {
    name: "Bronze 3",
    img: bronseBase3,
    description: "At the peak of Bronze, ready for Silver.",
  },
  {
    name: "Silver 1",
    img: silver1,
    description: "Welcome to the Silver tier. Shine bright!",
  },
  {
    name: "Silver 2",
    img: silver2,
    description: "Moving up the ranks in Silver.",
  },
  {
    name: "Silver 3",
    img: silver3,
    description: "Almost Gold. Keep pushing forward.",
  },
  {
    name: "Gold 1",
    img: gold1,
    description: "A golden achievement. Welcome to Gold.",
  },
  { name: "Gold 2", img: gold2, description: "Solid Gold performance." },
  { name: "Gold 3", img: gold3, description: "True Gold mastery." },
  {
    name: "Gem 1",
    img: gem1,
    description: "Rare and valuable. Welcome to Gem tier.",
  },
  { name: "Gem 2", img: gem2, description: "Shining like a flawless Gem." },
  { name: "Gem 3", img: gem3, description: "The ultimate Gem status." },
  { name: "Ruby 1", img: ruby1, description: "Entering the elite Ruby tier." },
  { name: "Ruby 2", img: ruby2, description: "A legendary Ruby warrior." },
  { name: "Ruby 3", img: ruby3, description: "Unstoppable force in Ruby." },
  {
    name: "World",
    img: word,
    description: "Top of the world! The ultimate rank.",
  },
];

const starterRank = allRanks[0];
const otherRanks = allRanks.slice(1);

export const LEARNING_SEEN_KEY = "clash-learning-seen";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome",
    body: "Clash Talent. Easily level up and take your videos global.",
  },
  {
    id: "watch",
    title: "Watch",
    body: "See two talents side by side, then vote for the video you want the world to see.",
    icon: PlayCircleOutlineIcon,
  },
  {
    id: "create",
    title: "Create",
    body: "Record your skill, start a clash, and climb from your city onto the global board.",
    icon: AddCircleOutlineIcon,
  },
  {
    id: "share",
    title: "Go global",
    body: "Every vote pushes a video further. Keep clashing until your talent is seen worldwide.",
    icon: PublicIcon,
  },
] as const;

function hasSeenLearning() {
  try {
    return localStorage.getItem(LEARNING_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

function markLearningSeen() {
  try {
    localStorage.setItem(LEARNING_SEEN_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function FirstVisitLearning() {
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [zoomedRank, setZoomedRank] = useState<RankItem | null>(null);

  useEffect(() => {
    const token = userLogin?.token || getAccessToken();
    if (!token || hasSeenLearning()) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [userLogin]);

  const finish = useCallback(() => {
    markLearningSeen();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (zoomedRank) setZoomedRank(null);
        else finish();
      }
      if (event.key === "ArrowRight") {
        setStep((current) => Math.min(current + 1, STEPS.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setStep((current) => Math.max(current - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish, open, zoomedRank]);

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = "icon" in current ? current.icon : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="learning-title"
      className="fixed inset-0 z-[80] flex flex-col bg-white text-gray-900 dark:bg-zinc-950 dark:text-gray-100"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pb-28 pt-8 text-center">
        {step === 0 ? (
          <div className="flex w-full max-w-md flex-col items-center">
            <h1 id="learning-title">
              <Image
                src={SITE_LOGO}
                alt={SITE_NAME}
                width={96}
                height={96}
                priority
                className="h-24 w-24 rounded-full"
              />
            </h1>
            <p className="mt-5 text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-200">
              Easily reach a higher medal with your videos and be seen around the world.
            </p>
            <Image
              src={introduceImage}
              alt="Players connected around the world on Clash Talent"
              priority
              className="mt-6 h-auto w-full rounded-2xl"
            />

            <p className="mt-8 text-base font-semibold text-gray-900 dark:text-gray-100">
              Examples of ranks at different scores.
            </p>
            <div className="mt-4 w-full space-y-4 pb-2">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setZoomedRank(starterRank)}
                  className="flex h-28 w-24 flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-2 transition-transform hover:scale-105 dark:border-gray-600 dark:bg-gray-700/60"
                >
                  <Image
                    src={starterRank.img}
                    alt={starterRank.name}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                  <span className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {starterRank.name}
                  </span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {otherRanks.map((rank) => (
                  <button
                    key={rank.name}
                    type="button"
                    onClick={() => setZoomedRank(rank)}
                    className="flex h-28 flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-2 transition-transform hover:scale-105 dark:border-gray-600 dark:bg-gray-700/60"
                  >
                    <Image
                      src={rank.img}
                      alt={rank.name}
                      width={52}
                      height={52}
                      className="object-contain"
                    />
                    <span className="mt-2 w-full truncate text-center text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {rank.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <Image
              src={SITE_LOGO}
              alt={SITE_NAME}
              width={96}
              height={96}
              priority
              className="h-24 w-24 rounded-full"
            />
            <p className="mt-4 text-xl font-bold tracking-tight">
              Clash<span className="text-blue-600">T</span>alent
            </p>
            <div className="mt-14 flex max-w-md flex-col items-center">
              {Icon ? (
                <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                  <Icon sx={{ fontSize: 30 }} />
                </span>
              ) : null}
              <h1 id="learning-title" className="text-4xl font-extrabold">
                {current.title}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                {current.body}
              </p>
            </div>
          </>
        )}
      </div>

      {zoomedRank ? (
        <div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/80 p-6"
          onClick={() => setZoomedRank(null)}
        >
          <div className="flex max-w-xs flex-col items-center text-center">
            <Image
              src={zoomedRank.img}
              alt={zoomedRank.name}
              width={180}
              height={180}
              className="object-contain"
            />
            <h2 className="mt-4 text-xl font-bold text-white">{zoomedRank.name}</h2>
            <p className="mt-2 text-sm text-gray-300">{zoomedRank.description}</p>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-[85] border-t border-gray-100 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          <div className="flex items-center justify-center gap-2" aria-hidden>
            {STEPS.map((item, index) => (
              <span
                key={item.id}
                className={`h-2 rounded-full transition-all ${
                  index === step ? "w-6 bg-blue-600" : "w-2 bg-gray-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((value) => value - 1)}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (isLast) finish();
                else setStep((value) => value + 1);
              }}
            >
              {isLast ? "Get started" : "Next"}
            </Button>
            <button
              type="button"
              onClick={finish}
              className="ml-auto rounded-full px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
