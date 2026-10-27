"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import ProfileBio from "./ProfileBio";
import VideosProfile from "./VideosProfile";
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
import { getImageUrl } from "@/utils/fileHelper";
import { socket } from "@/lib/socket";
import { SITE_URL } from "@/lib/env";
import { withMatchEndAt, isMatchActive } from "@/utils/matchTimer";

interface InitialUserData {
  id: number;
  userName: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  profile?: any;
  score?: number;
  followersCount?: number;
  followingCount?: number;
}

interface Props {
  initialUserData: InitialUserData;
}

function mapProfilePayload(d: any): InitialUserData {
  const attachment = d?.avatar ?? d?.profile ?? d?.user?.profile ?? null;
  let avatarUrl: string | undefined;
  try {
    avatarUrl = getImageUrl(attachment) || getImageUrl(d) || undefined;
  } catch {
    avatarUrl = undefined;
  }

  return {
    id: d?.user?.id ?? d?.userId ?? d?.id,
    userName: d?.user?.userName ?? d?.userName,
    fullName: d?.fullName || d?.user?.userName || d?.userName,
    bio: d?.bio ?? "",
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
  const routeUsername = decodeURIComponent(
    String(params?.username || initialUserData.userName || ""),
  );

  const [profileUser, setProfileUser] =
    useState<InitialUserData>(initialUserData);
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
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [routeUsername]);

  const myUserId = userLogin?.user?.id ?? userLogin?.userId;
  const targetUserId = profileUser.id;
  const isMyProfile =
    !!myUserId &&
    !!targetUserId &&
    String(targetUserId) === String(myUserId);

  const currentProfile = isMyProfile ? userLogin : profileUser;
  const findImg =
    profileUser?.avatarUrl ||
    getImageUrl(profileUser?.profile) ||
    getImageUrl(userLogin?.profile);

  const [refreshing, setRefreshing] = useState(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [videoLikes, setVideoLikes] = useState<Record<string, number>>({});

  const allVideoData = isMyProfile ? myVideosInRedux : otherUserVideos;

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

  const fetchVideos = useCallback(
    async (paginationParams: { skip: number; take: number }) => {
      if (!targetUserId) return [];
      return await attachmentService.userAttachmentList({
        ...paginationParams,
        id: targetUserId,
      });
    },
    [targetUserId],
  );

  const handleDataLoaded = useCallback(
    (newItems: any[], isFirstPage: boolean) => {
      if (!newItems) return;
      const items = withMatchEndAt(newItems);

      if (isMyProfile) {
        dispatch(
          RsetProfileVideo(isFirstPage ? items : [...myVideosInRedux, ...items]),
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
    `${routeUsername}:${targetUserId || ""}`,
  );

  const onRefresh = useCallback(async () => {
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
        if (isMyProfile) {
          dispatch(RsetProfileVideo(items));
        } else {
          setOtherUserVideos(items);
        }
      }
    } catch (error) {
      console.error("Profile refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [
    targetUserId,
    isMyProfile,
    myUserId,
    dispatch,
    refreshMyProfileAttachment,
  ]);

  useEffect(() => {
    refreshMyProfileAttachment();
  }, [refreshMyProfileAttachment]);

  useEffect(() => {
    if (!targetUserId) return;
    followService
      .followingLength(targetUserId)
      .then((res: any) => dispatch(RsetFollowingLength(res?.data?.data)))
      .catch(console.error);
    followService
      .followerLength(targetUserId)
      .then((res: any) => dispatch(RsetFollowerLength(res?.data?.data)))
      .catch(console.error);
  }, [targetUserId, dispatch]);

  useEffect(() => {
    if (needProfileRefresh) {
      onRefresh();
      dispatch(setNeedProfileRefresh(false));
    }
  }, [needProfileRefresh, dispatch, onRefresh]);

  const itsMatchingWithTimer = useMemo(
    () => allVideoData?.some(isMatchActive),
    [allVideoData],
  );

  useEffect(() => {
    if (!itsMatchingWithTimer) return;
    const timer = setTimeout(() => {
      window.scrollTo({ top: 230, behavior: "smooth" });
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
        [data.movieId]: Math.max((prev[data.movieId] || 0) - 1, 0),
      }));
    };

    socket.on("add_liked_response", handleAddLike);
    socket.on("remove_liked_response", handleRemoveLike);
    return () => {
      stopMatchTimer();
      socket.off("add_liked_response", handleAddLike);
      socket.off("remove_liked_response", handleRemoveLike);
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
    const el = observerTarget.current;
    if (el) observer.observe(el);
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

  const profileUrl = `${SITE_URL}/${encodeURIComponent(profileUser.userName || "")}`;
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profileUser.fullName || profileUser.userName,
    alternateName: profileUser.userName,
    description: profileUser.bio || undefined,
    image: profileUser.avatarUrl || undefined,
    url: profileUrl,
  };

  const showEmpty = allVideoData?.length === 0 && !loading && !refreshing;

  return (
    <main
      ref={scrollContainerRef}
      className="flex min-h-screen w-full flex-col bg-gray-50 dark:bg-zinc-950"
      itemScope
      itemType="https://schema.org/ProfilePage"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
      <header className="z-10 flex flex-col gap-4 bg-white p-2 shadow-sm dark:bg-zinc-900">
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

      <section className="mx-auto w-full max-w-lg flex-1 py-4">
        {showEmpty ? (
          <article className="mx-5 mt-16 flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-white px-6 py-9 shadow-lg transition-transform hover:scale-95 dark:bg-zinc-900">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-indigo-500 bg-indigo-50 shadow-md dark:bg-indigo-900/20">
              <Icon
                name="locationSearching"
                fontSize="large"
                className="text-indigo-600"
              />
            </div>
            <div className="mt-4 flex flex-col items-center gap-2 px-2">
              <h2 className="text-lg font-bold tracking-wide text-gray-800 dark:text-white">
                No Matches Yet
              </h2>
              <p className="text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {isMyProfile
                  ? "You haven't uploaded any videos yet. Get started right now!"
                  : "This user currently has no videos to display."}
              </p>
            </div>
          </article>
        ) : (
          <VideosProfile
            match={allVideoData}
            videoLikes={videoLikes}
            isLoading={loading || refreshing}
            loadingRef={observerTarget}
          />
        )}
      </section>
    </main>
  );
};

export default ProfileClient;
