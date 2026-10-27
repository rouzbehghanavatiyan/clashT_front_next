// src/components/profile/ProfileHeader.tsx
"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { attachmentService } from "@/services/attachment.service";
import { userService } from "@/services/user.service";
import { followService } from "@/services/follow.service";
import ImageRank from "../ImageRank";
import { RsetUserLogin } from "@/store/slices/mainSlice";
import Follows from "../Follows";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import StringHelpers from "@/utils/StringHelpers";
import { buildChatHref } from "@/lib/chat";

interface ProfileHeaderProps {
  userImage?: string;
  userName?: string;
  followersCount?: number;
  followingCount?: number;
  score?: number;
  isMyProfile: boolean;
  setProfileImage?: (image: string) => void;
  currentProfile?: any;
  onFollowToggle?: () => void;
  isFollowLoading?: boolean;
}

const ProfileHeader = forwardRef<HTMLDivElement, ProfileHeaderProps>(
  (
    {
      currentProfile,
      isMyProfile,
      userImage,
      userName,
      score,
      followersCount = 0,
      followingCount = 0,
      setProfileImage,
      onFollowToggle,
      isFollowLoading = false,
    },
    ref,
  ) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const main = useAppSelector((state) => state?.main);
    const userId = main?.userLogin?.user?.id || main?.userLogin?.id;

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [localIsFollowed, setLocalIsFollowed] = useState<boolean>(
      Boolean(currentProfile?.isFollowedByMe),
    );
    const [isLoadingFollow, setIsLoadingFollow] = useState<boolean>(false);

    useEffect(() => {
      setLocalIsFollowed(Boolean(currentProfile?.isFollowedByMe));
    }, [currentProfile?.isFollowedByMe]);

    // انتخاب تصویر در وب
    const handleAvatarClick = () => {
      if (!isMyProfile) return;
      fileInputRef.current?.click();
    };

    const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // نمایش سریع پیش‌نمایش به کلاینت
        const previewUrl = URL.createObjectURL(file);
        setProfileImage?.(previewUrl);

        try {
          const formData = new FormData();
          formData.append("formFile", file);
          formData.append("attachmentId", String(userId));
          formData.append("attachmentType", "pf");
          formData.append("attachmentName", "profile");

          const resAttachment = await attachmentService.addAttachment(formData);
          const { status: attachmentStatus } = resAttachment?.data || {};

          if (attachmentStatus === 0) {
            console.log("33333333333333333", userId);

            const resProfileAttachment =
              await userService.profileAttachment(userId);
            const { status, data } = resProfileAttachment?.data || {};

            if (status === 0) {
              dispatch(RsetUserLogin(data));
            }
          }
        } catch (error) {
          console.error("Error uploading profile image:", error);
        } finally {
          e.target.value = ""; // ریست مقدار input
        }
      },
      [userId, dispatch, setProfileImage],
    );

    const handleFollowClick = async () => {
      if (isLoadingFollow || isFollowLoading) return;
      const targetUserId = currentProfile?.user?.id || currentProfile?.id;
      const postData = {
        userId: userId || null,
        followerId: targetUserId || null,
      };

      try {
        setIsLoadingFollow(true);
        if (localIsFollowed) {
          await followService.removeFollower(postData);
        } else {
          await followService.addFollower(postData);
        }
        setLocalIsFollowed((prev) => !prev);
        onFollowToggle?.();
      } catch (error) {
        console.error("Error in follow operation:", error);
      } finally {
        setIsLoadingFollow(false);
      }
    };

    const handleSendMessage = () => {
      const href = buildChatHref({
        id: currentProfile?.user?.id || currentProfile?.id,
        userName:
          currentProfile?.user?.userName ?? currentProfile?.userName ?? "",
        profile: currentProfile?.profile,
        score: currentProfile?.score ?? 0,
      });
      if (href) router.push(href);
    };

    return (
      <header ref={ref} className="w-full px-4 py-3">
        <div className="flex items-center min-h-[128px]">
          <div
            onClick={handleAvatarClick}
            className={`relative shrink-0 ${isMyProfile
              ? "cursor-pointer group hover:opacity-90"
              : "cursor-default"
              }`}
          >
            <div className="rounded-full border border-gray-200 dark:border-gray-700 p-0.5 flex items-center justify-center">
              <ImageRank
                score={score}
                imgSrc={userImage}
                imgSize={96}
                onClickDisable
              />
            </div>

            {isMyProfile && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload profile image"
              />
            )}
          </div>

          <div className="ml-4 flex flex-col justify-center flex-1 min-w-0">
            <h1
              itemProp="name"
              className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate"
            >
              {userName || "Unknown User"}
            </h1>

            {isMyProfile ? (
              <div className="flex items-center gap-6 mt-2">
                <Link
                  href={`/${encodeURIComponent(userName ?? "")}/following`}
                  className="flex items-center gap-1 hover:underline"
                >
                  <span className="font-bold">{followingCount}</span>
                  <span className="text-gray-500 text-sm">Following</span>
                </Link>

                <Link
                  href={`/${encodeURIComponent(userName ?? "")}/followers`}
                  className="flex items-center gap-1 hover:underline"
                >
                  <span className="font-bold">{followersCount}</span>
                  <span className="text-gray-500 text-sm">Followers</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-3">
                <div className="min-w-[100px]">
                  <Follows
                    onFollowClick={handleFollowClick}
                    title={localIsFollowed ? "Unfollow" : "Follow"}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="min-w-[100px] px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-md shadow-sm transition-colors text-center"
                >
                  Send message
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  },
);

ProfileHeader.displayName = "ProfileHeader";

export default React.memo(ProfileHeader);
