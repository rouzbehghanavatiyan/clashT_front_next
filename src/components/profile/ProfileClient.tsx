"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import { useShowWatch } from "@/hooks/useShowWatch";
import ProfileBio from "./ProfileBio";
import { Icon } from "../Icon";
import ProfileHeader from "./ProfileHeader";
import { stopMatchTimer } from "../TimerForFindMatch";
import { useLoadMore } from "@/hooks/useLoadMore";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import {
  RsetFollowerLength,
  RsetFollowingLength,
  RsetProfileVideo,
  RsetUserLogin,
} from "@/store/slices/mainSlice";
import { attachmentService } from "@/services/attachment.service";
import { userService } from "@/services/user.service";
import { followService } from "@/services/follow.service";
import { setNeedProfileRefresh } from "@/store/slices/videoSlice";
import StringHelpers from "@/utils/StringHelpers";
import { socket } from "@/lib/socket";
import { SITE_URL } from "@/lib/env";
import { withMatchEndAt, isMatchActive } from "@/utils/matchTimer";

interface InitialUserData {
  id: number;
  userName: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  profile?: string;
  score?: number;
  followersCount?: number;
  followingCount?: number;
}

interface Props {
  initialUserData: InitialUserData;
}

function mapProfilePayload(d: any): InitialUserData {
  const attachment = d?.avatar ?? d?.profile ?? null;
  let avatarUrl: string | undefined;
  try {
    avatarUrl = attachment
      ? StringHelpers.getProfile(attachment) || undefined
      : undefined;
  } catch {
    avatarUrl = undefined;
  }

  return {
    id: d?.userId ?? d?.id,
    userName: d?.userName,
    fullName: d?.fullName || d?.userName,
    bio: d?.bio ?? "",
    location: d?.location ?? "",
    profile: attachment,
    avatarUrl,
    score: d?.score ?? 0,
    followersCount: d?.followersCount ?? 0,
    followingCount: d?.followingCount ?? 0,
  };
}

const ProfileClient: React.FC<Props> = ({ initialUserData }) => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const expireTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const routeUsername = decodeURIComponent(
    String(params?.username || initialUserData.userName || ""),
  );

  const [profileUser, setProfileUser] = useState<InitialUserData>(initialUserData);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [otherUserVideos, setOtherUserVideos] = useState<any[]>([]);

  const myVideosInRedux =
    useAppSelector((state) => state?.main?.profileVideo) || [];
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const followerCountRedux = useAppSelector(
    (state) => state?.main?.followerLength,
  );
  const followingCountRedux = useAppSelector(
    (state) => state?.main?.followingLength,
  );
  const needProfileRefresh = useAppSelector(
    (state) => state?.video?.needProfileRefresh,
  );

  const userLoginRef = useRef(userLogin);
  useEffect(() => {
    userLoginRef.current = userLogin;
  }, [userLogin]);

  useEffect(() => {
    if (!routeUsername) return;

    let cancelled = false;

    const loadProfile = async () => {
      setIsFetchingProfile(true);
      setOtherUserVideos([]);
      try {
        const res = await userService.profile(routeUsername);
        if (cancelled) return;
        const d = res?.data?.data;
        if (res?.data?.status === 0 && d) {
          setProfileUser(mapProfilePayload(d));
        }
      } catch (error) {
        console.error("[profile] client fetch failed:", error);
      } finally {
        if (!cancelled) setIsFetchingProfile(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [routeUsername]);

  const myUserId = userLogin?.user?.id;
  const targetUserId = profileUser.id;
  const isMyProfile = String(targetUserId) === String(myUserId);

  const currentProfile = isMyProfile ? userLogin : profileUser;
  const findImg =
    profileUser?.avatarUrl ||
    StringHelpers.getProfile(profileUser?.profile) ||
    StringHelpers.getProfile(userLogin?.profile);

  const [refreshing, setRefreshing] = useState(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [videoLikes, setVideoLikes] = useState<Record<string, number>>({});
  const [showComments, setShowComments] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [commentPosition, setCommentPosition] = useState(0);

  const allVideoData = isMyProfile ? myVideosInRedux : otherUserVideos;

  const handleOpenComments = useCallback((video: any, position: number) => {
    setSelectedVideo(video);
    setCommentPosition(position ?? 0);
    setShowComments(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setShowComments(false);
    setSelectedVideo(null);
    setCommentPosition(0);
  }, []);

  // --- رفرش دیتای پروفایل ---
  const refreshMyProfileAttachment = useCallback(async () => {
    if (!isMyProfile || !myUserId) return;
    try {
      const profileRes = await userService.profileAttachment(myUserId);
      const freshUserData = profileRes?.data?.data || profileRes?.data;
      if (freshUserData) {
        dispatch(RsetUserLogin({ ...userLoginRef.current, ...freshUserData }));
      }
    } catch (err) {
      console.log("profileAttachment refresh error:", err);
    }
  }, [isMyProfile, myUserId, dispatch]);

  // --- واکشی ویدیوها ---
  const fetchVideos = useCallback(
    async (paginationParams: { skip: number; take: number }) => {
      if (
        paginationParams.skip === 0 &&
        isMyProfile &&
        myVideosInRedux.length > 0
      ) {
        return null;
      }
      return await attachmentService.userAttachmentList({
        ...paginationParams,
        id: targetUserId,
      });
    },
    [targetUserId, isMyProfile, myVideosInRedux.length],
  );

  const handleDataLoaded = useCallback(
    (newItems: any[], isFirstPage: boolean) => {
      if (!newItems) return;
      const items = withMatchEndAt(newItems);

      if (isMyProfile) {
        dispatch(
          RsetProfileVideo(
            isFirstPage ? items : [...myVideosInRedux, ...items],
          ),
        );
      } else {
        setOtherUserVideos((prev) =>
          isFirstPage ? items : [...prev, ...items],
        );
      }
    },
    [dispatch, isMyProfile, myVideosInRedux],
  );

  const { loading, loadMore, hasMore } = useLoadMore(
    fetchVideos,
    handleDataLoaded,
    allVideoData?.length || 0,
    routeUsername,
  );

  const {
    openDropdowns,
    setOpenDropdowns,
    currentlyPlayingId,
    handleVideoPlay,
    toggleDropdown,
    dropdownItems,
  } = useShowWatch({
    inviteId: targetUserId,
    data: allVideoData,
    pagination: { skip: allVideoData.length, take: 10, hasMore },
    customFetchNextPage: async () => {
      if (!loading && hasMore) await loadMore();
    },
  });

  const onRefresh = async () => {
    if (!targetUserId) return;
    setRefreshing(true);
    try {
      const promises: Promise<any>[] = [
        attachmentService.userAttachmentList({
          skip: 0,
          take: 10,
          id: targetUserId,
        }),
        followService
          .followingLength(targetUserId)
          .then((res: any) => dispatch(RsetFollowingLength(res?.data?.data)))
          .catch(console.error),
        followService
          .followerLength(targetUserId)
          .then((res: any) => dispatch(RsetFollowerLength(res?.data?.data)))
          .catch(console.error),
      ];
      if (isMyProfile && myUserId) promises.push(refreshMyProfileAttachment());

      const [videosRes] = await Promise.all(promises);
      const freshVideos = videosRes?.data?.data || videosRes?.data || videosRes;

      if (freshVideos && Array.isArray(freshVideos)) {
        const items = withMatchEndAt(freshVideos);
        isMyProfile
          ? dispatch(RsetProfileVideo(items))
          : setOtherUserVideos(items);
      }
    } catch (error) {
      console.error("Profile refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshMyProfileAttachment();
  }, [refreshMyProfileAttachment]);

  useEffect(() => {
    if (!isMyProfile) setOtherUserVideos([]);
    if (targetUserId) onRefresh();
  }, [targetUserId]);

  useEffect(() => {
    if (needProfileRefresh) {
      onRefresh();
      dispatch(setNeedProfileRefresh(false));
    }
  }, [needProfileRefresh, dispatch]);

  const itsMatchingWithTimer = useMemo(
    () => allVideoData?.some(isMatchActive),
    [allVideoData],
  );

  useEffect(() => {
    if (!itsMatchingWithTimer) return;
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        window.scrollTo({ top: 230, behavior: "smooth" });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [itsMatchingWithTimer]);

  useEffect(() => {
    const handleAddLike = (data: { movieId: number }) => {
      setVideoLikes((prev) => ({
        ...prev,
        [data.movieId]: (prev[data.movieId] || 0) + 1,
      }));
    };
    const handleRemoveLike = (data: { movieId: number }) => {
      setVideoLikes((prev) => ({
        ...prev,
        [data.movieId]: (prev[data.movieId] || 0) - 1,
      }));
    };

    if (socket?.on) {
      socket.on("add_liked_response", handleAddLike);
      socket.on("remove_liked_response", handleRemoveLike);
    }
    return () => {
      stopMatchTimer();
      if (socket) {
        socket.off("add_liked_response", handleAddLike);
        socket.off("remove_liked_response", handleRemoveLike);
      }
    };
  }, []);

  useEffect(() => {
    const score = currentProfile?.score || 0;
    setPercentage(
      Math.min(Math.max(score <= 100 ? score : score % 100 || 100, 1), 100),
    );
  }, [currentProfile?.score]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, hasMore, loadMore]);

  const currentProfileMemo = useMemo(
    () => ({
      id: currentProfile?.user?.id ?? currentProfile?.id,
      userName: currentProfile?.user?.userName ?? currentProfile?.userName,
      profile: currentProfile?.profile,
      score: currentProfile?.score,
      isFollowedByMe: currentProfile?.isFollowedByMe,
    }),
    [currentProfile],
  );

  const profileUrl = `${SITE_URL}/${encodeURIComponent(profileUser.userName)}`;
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profileUser.fullName || profileUser.userName,
    alternateName: profileUser.userName,
    description: profileUser.bio || undefined,
    image: profileUser.avatarUrl || undefined,
    url: profileUrl,
  };

  return (
    <main
      ref={scrollContainerRef}
      className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 w-full"
      itemScope
      itemType="https://schema.org/ProfilePage"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
      <header className="flex flex-col gap-4 p-2 bg-white dark:bg-gray-800 shadow-sm z-10">
        <ProfileHeader
          userImage={findImg}
          userName={profileUser.userName}
          isMyProfile={isMyProfile}
          score={currentProfile?.score || 0}
          currentProfile={currentProfileMemo}
          followersCount={
            profileUser?.followersCount ?? followerCountRedux?.count ?? 0
          }
          followingCount={
            profileUser?.followingCount ?? followingCountRedux?.count ?? 0
          }
        />
        <ProfileBio
          isMyProfile={isMyProfile}
          userLogin={currentProfile}
          rankScore={currentProfile?.score}
          rankPercentage={percentage}
        />
      </header>

      <section className="flex-1 w-full max-w-lg mx-auto py-4">
        {allVideoData?.length === 0 && !loading ? (
          <article
            className="flex flex-col items-center justify-center mt-16 mx-5 px-6 py-9 shadow-lg rounded-2xl bg-white dark:bg-gray-800 cursor-pointer hover:scale-95 transition-transform"
            onClick={() => isMyProfile && console.log("Open Media Picker")}
          >
            <div className="w-20 h-20 rounded-full border border-indigo-500 flex items-center justify-center shadow-md bg-indigo-50 dark:bg-indigo-900/20">
              <Icon
                name="locationSearching"
                fontSize="large"
                className="text-indigo-600"
              />
            </div>
            <div className="flex flex-col items-center gap-2 px-2 mt-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
                No Matches Yet
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                {isMyProfile
                  ? "You haven't uploaded any videos yet. Get started right now!"
                  : "This user currently has no videos to display."}
              </p>
            </div>
          </article>
        ) : (
          <div className="flex flex-col gap-4">
          </div>
        )}

        <div
          ref={observerTarget}
          className="h-16 flex items-center justify-center py-4"
        >
          {loading && (
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ProfileClient;