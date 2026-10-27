"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import EmailIcon from "@mui/icons-material/Email";
import ReportIcon from "@mui/icons-material/Report";
import {
  resetShowWatchState,
  RsetShowWatch,
  setPaginationShowWatch,
} from "@/store/slices/mainSlice";
import { useAppDispatch } from "@/store/reduxHook";
import { attachmentService } from "@/services/attachment.service";
import { buildChatHref } from "@/lib/chat";

const PAGE_SIZE = 6;

interface UseShowWatchProps {
  inviteId: string | number | undefined;
  data: any[];
  pagination: {
    skip: number;
    take: number;
    hasMore: boolean;
  };
  customFetchNextPage?: (params: {
    skip: number;
    take: number;
    inviteId: string | number | undefined;
  }) => Promise<any[] | void>;
  customCleanup?: () => void;
  useRedux?: boolean;
}

interface DropdownItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  divider?: boolean;
}

const itemKey = (item: any) =>
  String(
    item?.id ??
      [
        item?.inviteInserted?.id ?? "x",
        item?.inviteMatched?.id ?? "x",
        item?.attachmentInserted?.attachmentId ??
          item?.attachmentInserted?.id ??
          "x",
      ].join("-"),
  );

function mergeUnique(prev: any[], next: any[]) {
  const seen = new Set(prev.map(itemKey));
  const fresh: any[] = [];
  for (const item of next) {
    const key = itemKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    fresh.push(item);
  }
  return [...prev, ...fresh];
}

export const useShowWatch = ({
  inviteId,
  data: externalData,
  pagination,
  customFetchNextPage,
  customCleanup,
  useRedux = true,
}: UseShowWatchProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null,
  );
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>(
    {},
  );

  const [internalData, setInternalData] = useState<any[]>(externalData || []);

  const paginationRef = useRef({
    skip: pagination?.skip ?? 0,
    take: PAGE_SIZE,
    hasMore: pagination?.hasMore ?? true,
  });
  const isLoadingRef = useRef(isLoading);
  const isFetchingMoreRef = useRef(isFetchingMore);
  const dataRef = useRef(internalData);
  const didAutoPlayFirstRef = useRef(false);
  const lastFetchSlideRef = useRef(0);
  const inviteIdRef = useRef(inviteId);
  const requestIdRef = useRef(0);
  const customCleanupRef = useRef(customCleanup);
  customCleanupRef.current = customCleanup;

  useEffect(() => {
    isLoadingRef.current = isLoading;
    isFetchingMoreRef.current = isFetchingMore;
    dataRef.current = internalData;
  }, [isLoading, isFetchingMore, internalData]);

  useEffect(() => {
    if (inviteIdRef.current === inviteId) return;
    inviteIdRef.current = inviteId;
    requestIdRef.current += 1;
    didAutoPlayFirstRef.current = false;
    lastFetchSlideRef.current = 0;
    setInternalData([]);
    setActiveSlideIndex(0);
    setCurrentlyPlayingId(null);
    setOpenDropdowns({});
    setIsLoading(false);
    setIsFetchingMore(false);
    isLoadingRef.current = false;
    isFetchingMoreRef.current = false;
    paginationRef.current = { skip: 0, take: PAGE_SIZE, hasMore: true };
  }, [inviteId]);

  const defaultFetchNextPage = useCallback(
    async ({
      skip,
      take,
      inviteId: nextInviteId,
    }: {
      skip: number;
      take: number;
      inviteId: string | number | undefined;
    }) => {
      if (!nextInviteId) return [];
      try {
        const res = await attachmentService.attachmentListByInviteId({
          skip,
          take,
          inviteId: nextInviteId,
        });
        const payload = res?.data?.data ?? res?.data ?? [];
        return Array.isArray(payload) ? payload : [];
      } catch (error) {
        console.error("Error fetching data:", error);
        return [];
      }
    },
    [],
  );

  const fetchNextPage = useCallback(async () => {
    if (
      isLoadingRef.current ||
      isFetchingMoreRef.current ||
      !paginationRef.current.hasMore ||
      inviteId == null ||
      inviteId === ""
    ) {
      return [];
    }

    const isInitial = dataRef.current.length === 0;
    const requestId = ++requestIdRef.current;

    try {
      if (isInitial) {
        setIsLoading(true);
        isLoadingRef.current = true;
      } else {
        setIsFetchingMore(true);
        isFetchingMoreRef.current = true;
      }

      const fetchFn = customFetchNextPage || defaultFetchNextPage;
      const payload = await fetchFn({
        skip: paginationRef.current.skip,
        take: PAGE_SIZE,
        inviteId,
      });

      if (requestId !== requestIdRef.current) return [];
      if (!Array.isArray(payload)) return [];

      const newData = payload;
      const nextPagination = {
        take: PAGE_SIZE,
        skip: paginationRef.current.skip + PAGE_SIZE,
        hasMore: newData.length >= PAGE_SIZE,
      };
      paginationRef.current = nextPagination;

      if (newData.length > 0) {
        setInternalData((prev) => mergeUnique(prev, newData));
        if (useRedux) {
          dispatch(RsetShowWatch(newData));
          dispatch(setPaginationShowWatch(nextPagination));
        }
      } else {
        paginationRef.current.hasMore = false;
      }

      return newData;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsFetchingMore(false);
        isLoadingRef.current = false;
        isFetchingMoreRef.current = false;
      }
    }
  }, [customFetchNextPage, defaultFetchNextPage, dispatch, inviteId, useRedux]);

  const handleVideoPlay = useCallback((videoId: string) => {
    setOpenDropdowns({});
    setCurrentlyPlayingId((prev) => (prev === videoId ? null : videoId));
  }, []);

  const toggleDropdown = useCallback((index: number) => {
    setOpenDropdowns((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const dropdownItems = useCallback(
    (data: any, position: number, userSenderId: any): DropdownItem[] => {
      const isSender = position === 0;
      const config = {
        sender: isSender ? data?.userInserted?.id : data?.userMatched?.id,
        userProfile: isSender ? data?.profileInserted : data?.profileMatched,
        userNameSender: isSender
          ? data?.userInserted?.userName
          : data?.userMatched?.userName,
      };

      return [
        {
          label: "Send message",
          icon: <EmailIcon className="text-gray-800 font20" />,
          onClick: () => {
            const href = buildChatHref({
              id: userSenderId?.id ?? config.sender,
              userName: config.userNameSender,
              profile: config.userProfile,
              score: isSender ? data?.scoreInserted : data?.scoreMatched,
            });
            if (href) router.push(href);
          },
        },
        {
          label: "Report",
          icon: <ReportIcon className="text-gray-800 font20" />,
          onClick: () => alert("Report clicked"),
        },
        { divider: true },
      ];
    },
    [router],
  );

  const handleSlideChange = useCallback(
    (swiper: any) => {
      const realIndex = swiper.realIndex;
      setActiveSlideIndex(realIndex);
      setOpenDropdowns({});

      const topVideoId =
        dataRef.current[realIndex]?.attachmentInserted?.attachmentId;
      if (topVideoId) setCurrentlyPlayingId(topVideoId);

      const remaining = dataRef.current.length - realIndex;
      const crossedThreeSlides =
        realIndex > 0 && realIndex - lastFetchSlideRef.current >= 3;
      const nearEnd = remaining <= 3;

      if (
        paginationRef.current.hasMore &&
        !isLoadingRef.current &&
        !isFetchingMoreRef.current &&
        (crossedThreeSlides || nearEnd)
      ) {
        lastFetchSlideRef.current = realIndex;
        fetchNextPage();
      }
    },
    [fetchNextPage],
  );

  const initializeSwiper = useCallback((swiper: any) => {
    setActiveSlideIndex(swiper.realIndex);
    if (didAutoPlayFirstRef.current || dataRef.current?.length === 0) return;
    const firstId = dataRef.current[0]?.attachmentInserted?.attachmentId;
    if (!firstId) return;
    didAutoPlayFirstRef.current = true;
    setCurrentlyPlayingId(firstId);
  }, []);

  const exposedFetchNextPage = useCallback(async () => {
    return await fetchNextPage();
  }, [fetchNextPage]);

  useEffect(() => {
    if (
      inviteId != null &&
      inviteId !== "" &&
      !isLoadingRef.current &&
      internalData.length === 0
    ) {
      fetchNextPage();
    }
  }, [inviteId, fetchNextPage, internalData.length]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      if (customCleanupRef.current) {
        customCleanupRef.current();
      } else if (useRedux) {
        dispatch(resetShowWatchState());
      }
    };
  }, [dispatch, useRedux]);

  useEffect(() => {
    if (didAutoPlayFirstRef.current || activeSlideIndex !== 0) return;
    const firstId = internalData[0]?.attachmentInserted?.attachmentId;
    if (!firstId) return;
    didAutoPlayFirstRef.current = true;
    setCurrentlyPlayingId(firstId);
  }, [internalData, activeSlideIndex]);

  return {
    data: internalData,
    isLoading,
    isFetchingMore,
    openDropdowns,
    currentlyPlayingId,
    activeSlideIndex,
    handleVideoPlay,
    toggleDropdown,
    dropdownItems,
    handleSlideChange,
    initializeSwiper,
    fetchNextPage: exposedFetchNextPage,
    setOpenDropdowns,
    resetData: useCallback(() => {
      requestIdRef.current += 1;
      didAutoPlayFirstRef.current = false;
      lastFetchSlideRef.current = 0;
      setInternalData([]);
      setActiveSlideIndex(0);
      setCurrentlyPlayingId(null);
      setOpenDropdowns({});
      setIsFetchingMore(false);
      paginationRef.current = { skip: 0, take: PAGE_SIZE, hasMore: true };
    }, []),
  };
};
