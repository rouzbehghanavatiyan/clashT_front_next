// src/components/profile/ImageRank.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";

import Started from "../../public/assets/ranks/starter.png";
import bronseBase1 from "../../public/assets/ranks/bronze1.png";
import bronseBase2 from "../../public/assets/ranks/bronze2.png";
import bronseBase3 from "../../public/assets/ranks/bronze3.png";
import silver1 from "../../public/assets/ranks/silver1.png";
import silver2 from "../../public/assets/ranks/silver2.png";
import silver3 from "../../public/assets/ranks/silver3.png";
import gold1 from "../../public/assets/ranks/gold1.png";
import gold2 from "../../public/assets/ranks/gold2.png";
import gold3 from "../../public/assets/ranks/gold3.png";
import gem1 from "../../public/assets/ranks/gem1.png";
import gem2 from "../../public/assets/ranks/gem2.png";
import gem3 from "../../public/assets/ranks/gem3.png";
import ruby1 from "../../public/assets/ranks/ruby1.png";
import ruby2 from "../../public/assets/ranks/ruby2.png";
import ruby3 from "../../public/assets/ranks/ruby3.png";
import word from "../../public/assets/ranks/worldMain.png";
import { Icon } from "./Icon";
import StringHelpers from "@/utils/StringHelpers";

type StarType = "bronse" | "silver" | "gold" | "gem" | "ruby" | "word" | "";

interface RankState {
  base: StaticImageData | string;
  stars: number;
  starType: StarType;
  displayNumber?: number;
}

interface ImageRankProps {
  userInfo?: any;
  imgSrc?: string | null;
  userName?: string;
  score?: number;
  imgSize?: number;
  userNameLength?: number;
  showProfile?: boolean;
  onClickDisable?: boolean;
  softBorder?: boolean;
  className?: string;
}

const getRankData = (score: number): RankState => {
  if (score < 0) return { base: Started, stars: 0, starType: "" };
  if (score < 100) return { base: bronseBase1, stars: 1, starType: "bronse" };
  if (score < 200) return { base: bronseBase2, stars: 2, starType: "bronse" };
  if (score < 300) return { base: bronseBase3, stars: 3, starType: "bronse" };
  if (score < 400) return { base: silver1, stars: 1, starType: "silver" };
  if (score < 500) return { base: silver2, stars: 2, starType: "silver" };
  if (score < 600) return { base: silver3, stars: 3, starType: "silver" };
  if (score < 700) return { base: gold1, stars: 1, starType: "gold" };
  if (score < 800) return { base: gold2, stars: 2, starType: "gold" };
  if (score < 900) return { base: gold3, stars: 3, starType: "gold" };
  if (score < 1000) return { base: gem1, stars: 1, starType: "ruby" };
  if (score < 1100) return { base: gem2, stars: 2, starType: "ruby" };
  if (score < 1200) return { base: gem3, stars: 3, starType: "ruby" };
  if (score < 1300) return { base: ruby1, stars: 1, starType: "ruby" };
  if (score < 1400) return { base: ruby2, stars: 2, starType: "ruby" };
  if (score < 1500) return { base: ruby3, stars: 3, starType: "ruby" };
  if (score < 1600)
    return { base: word, stars: 1, starType: "word", displayNumber: 900 };
  if (score < 1700)
    return { base: word, stars: 1, starType: "word", displayNumber: 850 };
  if (score < 1800)
    return { base: word, stars: 2, starType: "word", displayNumber: 800 };
  if (score < 1850)
    return { base: word, stars: 2, starType: "word", displayNumber: 750 };
  if (score < 1900)
    return { base: word, stars: 3, starType: "word", displayNumber: 700 };
  if (score < 1950)
    return { base: word, stars: 3, starType: "word", displayNumber: 650 };
  if (score < 2000)
    return { base: word, stars: 3, starType: "word", displayNumber: 600 };
  return { base: word, stars: 3, starType: "word", displayNumber: 550 };
};

function embeddedSrc(src: string) {
  return src.replace(/^https?:\/\/load\.clashtalent\.com(?=\/)/i, "/media");
}

const ImageRank: React.FC<ImageRankProps> = ({
  imgSrc,
  userName,
  score = -1,
  imgSize = 40,
  userNameLength = 15,
  showProfile = true,
  onClickDisable = false,
  softBorder = false,
  userInfo,
  className = "",
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [srcOverride, setSrcOverride] = useState<string | null>(null);

  const userImg = useMemo(() => {
    const raw =
      typeof imgSrc === "string" && imgSrc.trim() && !imgSrc.includes("undefined")
        ? imgSrc.trim()
        : StringHelpers.getProfile(userInfo?.profile) ||
          StringHelpers.getProfile(userInfo?.avatar) ||
          StringHelpers.getProfile(userInfo?.attachment) ||
          "";
    return raw ? embeddedSrc(raw) : "";
  }, [imgSrc, userInfo]);

  useEffect(() => {
    setSrcOverride(null);
    setImageError(false);
  }, [userImg]);
  const displaySrc = srcOverride ?? userImg;
  const hasValidImage = Boolean(displaySrc) && !imageError;
  const rankData = useMemo(() => getRankData(score), [score]);
  const rankSize = Math.floor(imgSize * 0.6);

  const isClickable = !onClickDisable && showProfile;

  const handleClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    if (!isClickable) return;

    const targetIdentifier =
      userInfo?.userName ||
      userInfo?.user?.userName ||
      userName;

    if (!targetIdentifier) return;
    router.push(`/${encodeURIComponent(targetIdentifier)}`);
  };

  const displayName = userName
    ? userName.length > userNameLength
      ? `${userName.slice(0, userNameLength)}...`
      : userName
    : null;

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? handleClick : undefined}
      onPointerDown={isClickable ? (event) => event.stopPropagation() : undefined}
      onKeyDown={
        isClickable
          ? (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleClick(event);
            }
          }
          : undefined
      }
      className={`inline-flex items-center gap-2 select-none pointer-events-auto ${isClickable ? "cursor-pointer group" : ""
        } ${className}`}
    >
      <div
        className="relative shrink-0"
        style={{ width: imgSize, height: imgSize }}
      >
        {hasValidImage ? (
          <img
            key={displaySrc}
            src={displaySrc}
            alt={userName || "User Avatar"}
            referrerPolicy="no-referrer"
            onError={() => {
              const remote = imgSrc?.trim();
              if (
                !srcOverride &&
                remote &&
                /^https?:\/\//i.test(remote) &&
                remote !== displaySrc
              ) {
                setSrcOverride(remote);
                return;
              }
              setImageError(true);
            }}
            className="block object-cover"
            style={{
              width: imgSize,
              height: imgSize,
              borderRadius: imgSize / 2,
              border: softBorder ? "2px solid #707070" : "1px solid #dfdfdf91",
            }}
          />
        ) : (
          <div
            className={`flex items-center justify-center overflow-hidden bg-[#ececec] ${
              softBorder
                ? "border-2 border-[#d1d5db]"
                : "border-[1.5px] border-[#f0f0f0]"
            }`}
            style={{
              width: imgSize,
              height: imgSize,
              borderRadius: imgSize / 2,
            }}
          >
            <Icon
              name="person"
              size={Math.round(imgSize * 0.55)}
              className="text-[#9ca3af]"
            />
          </div>
        )}

        {score >= 0 && rankData.starType && (
          <div
            className="pointer-events-none absolute z-20"
            style={{
              width: rankSize,
              height: rankSize,
              bottom: -15,
              left: -10,
            }}
          >
            <Image
              src={rankData.base}
              alt={rankData.starType}
              width={rankSize}
              height={rankSize}
              className="h-full w-full object-contain"
            />
            {rankData.starType === "word" && rankData.displayNumber && (
              <span
                className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center font-bold text-white"
                style={{
                  width: rankSize * 0.35,
                  height: rankSize * 0.35,
                  fontSize: rankSize * 0.16,
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.75)",
                }}
              >
                {rankData.displayNumber}
              </span>
            )}
          </div>
        )}
      </div>

      {/* نام کاربر */}
      {displayName && (
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
          {displayName}
        </span>
      )}
    </div>
  );
};

export default React.memo(ImageRank);
