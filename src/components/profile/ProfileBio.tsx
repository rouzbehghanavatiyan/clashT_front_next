"use client";

import React, { useState } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

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
import { userService } from "@/services/user.service";
import { Icon } from "../Icon";

interface RankItem {
  name: string;
  img: StaticImageData | string;
  description: string;
}

interface ProfileBioProps {
  rankPercentage: number;
  rankScore: number;
  userLogin: any;
  isMyProfile: boolean;
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

const ProfileBio: React.FC<ProfileBioProps> = ({
  rankScore,
  rankPercentage,
  userLogin,
  isMyProfile,
}) => {
  const [showRanksModal, setShowRanksModal] = useState(false);
  const [zoomedRank, setZoomedRank] = useState<RankItem | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [fetchedBioData, setFetchedBioData] = useState<any>(null);

  const activeBio = fetchedBioData?.bio ?? userLogin?.bio;
  const activeLocation = fetchedBioData?.location ?? userLogin?.location;
  const activeMail = fetchedBioData?.mail ?? userLogin?.mail;

  const hasProfileInfo = Boolean(activeBio || activeLocation || activeMail);
  const shouldShowDetails = hasProfileInfo || isFetched;

  const getProfileUser = async () => {
    const targetUserId =
      userLogin?.user?.id || userLogin?.userId || userLogin?.id;
    if (!targetUserId) return;
    try {
      setLoadingProfile(true);
      const res = await userService.showProfileByUser(targetUserId);
      const resData = res?.data?.data || res?.data || res;
      if (resData) {
        setFetchedBioData(resData);
      }
    } catch (error) {
      console.error("Error fetching profile info:", error);
    } finally {
      setLoadingProfile(false);
      setIsFetched(true);
    }
  };

  return (
    <section
      className="w-full flex flex-col items-center px-4"
      aria-label="مشخصات و نشان‌ها"
    >
      <button
        type="button"
        onClick={() => setShowRanksModal(true)}
        className="w-full group focus:outline-none"
        title="مشاهده تمام رتبه‌ها"
      >
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full relative overflow-hidden border border-indigo-500/40 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(Math.max(rankPercentage, 0), 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-indigo-950 dark:text-white drop-shadow">
              {rankPercentage}%
            </span>
          </div>
        </div>
      </button>

      {/* مدال لیست کامل رتبه‌ها */}
      {showRanksModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div
            className="fixed inset-0"
            onClick={() => {
              setShowRanksModal(false);
              setZoomedRank(null);
            }}
          />

          <div className="relative w-full max-w-md max-h-[85vh] bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-2xl flex flex-col z-10 overflow-hidden">
            {/* دکمه خروج */}
            <button
              onClick={() => {
                setShowRanksModal(false);
                setZoomedRank(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-white p-2 rounded-full transition-colors"
              aria-label="بستن"
            >
              ✕
            </button>

            {/* امتیاز کاربر */}
            <div className="text-center pb-3">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                Score: {rankScore}
              </span>
            </div>

            {/* اسکرول لیست مدال‌ها */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
              {/* مدال شروع (Starter) */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setZoomedRank(starterRank)}
                  className="w-24 h-28 bg-gray-50 dark:bg-gray-700/60 rounded-xl p-2 flex flex-col items-center justify-center hover:scale-105 transition-transform border border-gray-100 dark:border-gray-600"
                >
                  <Image
                    src={starterRank.img}
                    alt={starterRank.name}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                  <span className="text-xs font-semibold mt-2 text-gray-800 dark:text-gray-200">
                    {starterRank.name}
                  </span>
                </button>
              </div>

              {/* شبکه بقیه رتبه‌ها */}
              <div className="grid grid-cols-3 gap-2">
                {otherRanks.map((rank) => (
                  <button
                    key={rank.name}
                    type="button"
                    onClick={() => setZoomedRank(rank)}
                    className="h-28 bg-gray-50 dark:bg-gray-700/60 rounded-xl p-2 flex flex-col items-center justify-center hover:scale-105 transition-transform border border-gray-100 dark:border-gray-600"
                  >
                    <Image
                      src={rank.img}
                      alt={rank.name}
                      width={52}
                      height={52}
                      className="object-contain"
                    />
                    <span className="text-xs font-semibold mt-2 text-gray-800 dark:text-gray-200 truncate w-full text-center">
                      {rank.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* زوم روی هر رتبه به هنگام کلیک */}
          {zoomedRank && (
            <div
              className="fixed inset-0 z-60 bg-black/80 flex flex-col items-center justify-center p-6"
              onClick={() => setZoomedRank(null)}
            >
              <div className="flex flex-col items-center max-w-xs text-center animate-scaleUp">
                <Image
                  src={zoomedRank.img}
                  alt={zoomedRank.name}
                  width={180}
                  height={180}
                  className="object-contain"
                />
                <h3 className="text-xl font-bold text-white mt-4">
                  {zoomedRank.name}
                </h3>
                <p className="text-sm text-gray-300 mt-2">
                  {zoomedRank.description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* اطلاعات بیو و دکمه ویرایش (با نشانه‌گذاری سئو) */}
      <div className="w-full mt-4 flex flex-col items-start gap-2.5">
        {isMyProfile ? (
          <div className="w-full flex justify-center">
            <Link
              href="/setting/editProfile"
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-pink-500 text-pink-500 hover:bg-pink-500/10 transition-colors text-xs font-semibold gap-1.5"
            >
              <Icon name="edit" size={14} className="text-pink-500" />
              <span>Edit Profile</span>
            </Link>
          </div>
        ) : shouldShowDetails ? (
          <div className="w-full flex flex-col gap-1.5 text-right">
            {activeBio && (
              <p
                itemProp="description"
                className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
              >
                {activeBio}
              </p>
            )}

            {activeLocation && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Icon name="location-on" size={15} className="text-gray-400" />
                <span itemProp="address">{activeLocation}</span>
              </div>
            )}

            {activeMail && (
              <div className="flex items-center gap-1.5 text-xs">
                <Icon name="language" size={15} className="text-blue-500" />
                <a
                  href={`mailto:${activeMail}`}
                  itemProp="email"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {activeMail}
                </a>
              </div>
            )}

            {!hasProfileInfo && (
              <span className="text-xs text-gray-400 italic">
                No bio information available.
              </span>
            )}
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <button
              type="button"
              onClick={getProfileUser}
              disabled={loadingProfile}
              className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all text-xs font-medium gap-2 disabled:opacity-50"
            >
              {loadingProfile ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Icon name="Visibility" size={16} className="text-white" />
                  <span>Show Profile</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileBio;
