// src/components/profile/ImageRank.tsx
"use client";

import React, { useMemo, useState } from "react";
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

const ImageRank: React.FC<ImageRankProps> = ({
  imgSrc,
  userName,
  score = -1,
  imgSize = 40,
  userNameLength = 15,
  showProfile = true,
  onClickDisable = false,
  userInfo,
  className = "",
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const rankData = useMemo(() => getRankData(score), [score]);
  const rankSize = Math.floor(imgSize * 0.6);

  const hasValidImage =
    Boolean(imgSrc) && !imgSrc?.includes("undefined") && !imageError;

  const handleClick = () => {
    if (onClickDisable || !showProfile) return;

    // پیدا کردن نام کاربری یا شناسه برای آدرس‌دهی سئومحور
    const targetIdentifier =
      userInfo?.userName ||
      userInfo?.user?.userName ||
      userInfo?.id ||
      userInfo?.user?.id;

    if (targetIdentifier) {
      router.push(`/profile/${encodeURIComponent(targetIdentifier)}`);
    }
  };

  const displayName = userName
    ? userName.length > userNameLength
      ? `${userName.slice(0, userNameLength)}...`
      : userName
    : null;

  return (
    <div
      onClick={onClickDisable ? undefined : handleClick}
      className={`inline-flex items-center gap-2 select-none ${
        onClickDisable || !showProfile ? "" : "cursor-pointer group"
      } ${className}`}
    >
      {/* ظرف آواتار و مدال رتبه */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: imgSize, height: imgSize }}
      >
        {hasValidImage ? (
          <Image
            src={imgSrc as string}
            alt={userName || "User Avatar"}
            width={imgSize}
            height={imgSize}
            onError={() => setImageError(true)}
            className="rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
            style={{ width: imgSize, height: imgSize }}
            unoptimized={
              typeof imgSrc === "string" && imgSrc.startsWith("blob:")
            }
          />
        ) : (
          <div
            className="rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700"
            style={{ width: imgSize, height: imgSize }}
          >
            <Icon
              name="person"
              size={Math.round(imgSize * 0.55)}
              className="text-gray-400 dark:text-gray-500"
            />
          </div>
        )}

        {score >= 0 && rankData.starType && (
          <div
            className="absolute z-10 pointer-events-none drop-shadow-md"
            style={{
              width: rankSize,
              height: rankSize,
              bottom: -Math.floor(rankSize * 0.25),
              left: -Math.floor(rankSize * 0.25),
            }}
          >
            <Image
              src={rankData.base}
              alt={rankData.starType}
              width={rankSize}
              height={rankSize}
              className="object-contain w-full h-full"
            />
            {rankData.starType === "word" && rankData.displayNumber && (
              <span
                className="absolute inset-0 flex items-center justify-center font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
                style={{ fontSize: `${Math.max(rankSize * 0.22, 8)}px` }}
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
