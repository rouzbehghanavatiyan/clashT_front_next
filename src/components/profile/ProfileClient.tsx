"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShowWatch } from "@/hooks/useShowWatch";
import ProfileBio from "./ProfileBio";
import { Icon } from "../Icon";
import ProfileHeader from "./ProfileHeader";
import { stopMatchTimer } from "../TimerForFindMatch";
import { useLoadMore } from "@/hooks/useLoadMore";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { withMatchEndAt } from "@/utils/matchTimer";
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

const ProfileClient: React.FC<Props> = ({ initialUserData }) => {
  const dispatch = useAppDispatch();
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const expireTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // --- استیت‌های ریداکس ---
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

  const myUserId = userLogin?.user?.id;
  const targetUserId = initialUserData.id;
  const isMyProfile = targetUserId === myUserId;

  const currentProfile = isMyProfile ? userLogin : initialUserData;
  const findImg =
    StringHelpers.getProfile(initialUserData?.profile) ||
    StringHelpers.getProfile(userLogin?.profile);

  const [refreshing, setRefreshing] = useState(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [videoLikes, setVideoLikes] = useState<Record<string, number>>({});
  const [showComments, setShowComments] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [commentPosition, setCommentPosition] = useState(0);
  const [otherUserVideos, setOtherUserVideos] = useState<any[]>([]);

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

  return (
    <main
      ref={scrollContainerRef}
      className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 w-full"
      itemScope
      itemType="https://schema.org/ProfilePage"
    >
      <header className="flex flex-col gap-4 p-2 bg-white dark:bg-gray-800 shadow-sm z-10">
        <ProfileHeader
          userImage={findImg}
          userName={initialUserData.userName}
          isMyProfile={isMyProfile}
          score={currentProfile?.score || 0}
          currentProfile={currentProfileMemo}
          followersCount={
            initialUserData?.followersCount ?? followerCountRedux?.count ?? 0
          }
          followingCount={
            initialUserData?.followingCount ?? followingCountRedux?.count ?? 0
          }
        />
        <ProfileBio
          isMyProfile={isMyProfile}
          userLogin={currentProfile}
          rankScore={currentProfile?.score}
          rankPercentage={percentage}
        />
        {/* <ProfileAchievements /> */}
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
                  ? "شما هنوز هیچ ویدیویی آپلود نکرده‌اید. همین حالا شروع کنید!"
                  : "این کاربر در حال حاضر هیچ ویدیویی برای نمایش ندارد."}
              </p>
            </div>
          </article>
        ) : (
          <div className="flex flex-col gap-4">
            {/* {allVideoData?.map((item: any, index: number) => {
              const uniqueKey =
                item?.inviteInserted?.id ?? item?.inviteMatched?.id ?? index;
              return (
                <VideosProfileItem
                  key={uniqueKey}
                  profileWatch={true}
                  itsMatchingWithTimer={itsMatchingWithTimer}
                  activeVideoId={currentlyPlayingId}
                  onPlay={handleVideoPlay}
                  video={item}
                  isActive={true}
                  videoLikes={videoLikes}
                  openDropdowns={openDropdowns}
                  setOpenDropdowns={setOpenDropdowns}
                  toggleDropdown={toggleDropdown}
                  dropdownItems={dropdownItems}
                  handleToggleComments={handleOpenComments}
                />
              );
            })} */}
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

      {/* {showComments && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex justify-center items-end">
          <Comments
            visible={showComments}
            onClose={handleCloseComments}
            video={selectedVideo}
            positionVideo={commentPosition}
            userIdLogin={myUserId}
          />
        </div>
      )} */}
    </main>
  );
};

export default ProfileClient;
