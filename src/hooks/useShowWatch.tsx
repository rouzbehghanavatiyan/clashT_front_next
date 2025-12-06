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

interface UseShowWatchProps {
  inviteId: string | undefined;
  data: any[];
  pagination: {
    skip: number;
    take: number;
    hasMore: boolean;
  };
  customFetchNextPage?: (params: {
    skip: number;
    take: number;
    inviteId: string | undefined;
  }) => Promise<any[]>;
  customCleanup?: () => void;
  useRedux?: boolean;
}

interface DropdownItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  divider?: boolean;
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
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  );
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>(
    {}
  );

  const [internalData, setInternalData] = useState<any[]>(externalData);

  const paginationRef = useRef(pagination);
  const isLoadingRef = useRef(isLoading);
  const dataRef = useRef(internalData);

  useEffect(() => {
    isLoadingRef.current = isLoading;
    paginationRef.current = pagination;
    dataRef.current = internalData;
  }, [isLoading, pagination, internalData]);

  useEffect(() => {
    setInternalData(externalData);
  }, [externalData]);

  const defaultFetchNextPage = useCallback(
    async ({
      skip,
      take,
      inviteId,
    }: {
      skip: number;
      take: number;
      inviteId: string | undefined;
    }) => {
      if (!inviteId) return [];
      try {
        const res = await attachmentService.listByInviteId({
          skip,
          take,
          inviteId,
        });
        return res?.data || [];
      } catch (error) {
        console.error("Error fetching data:", error);
        return [];
      }
    },
    []
  );

  const fetchNextPage = useCallback(async () => {
    if (isLoadingRef.current || !paginationRef.current.hasMore || !inviteId)
      return [];

    try {
      setIsLoading(true);
      const fetchFn = customFetchNextPage || defaultFetchNextPage;
      const newData = await fetchFn({
        skip: paginationRef.current.skip,
        take: paginationRef.current.take,
        inviteId,
      });

      if (newData.length > 0) {
        setInternalData((prev) => [...prev, ...newData]);
        if (useRedux) {
          dispatch(RsetShowWatch(newData));
          dispatch(
            setPaginationShowWatch({
              take: paginationRef.current.take,
              skip: paginationRef.current.skip + paginationRef.current.take,
              hasMore: newData.length > 0,
            })
          );
        }
      }

      return newData;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    } finally {
      setIsLoading(false);
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
        //   onClick: () =>
        //     router.push(`/privateMessage?id=${userSenderId?.id}`, {
        //       state: { userInfo: config },
        //     }),
        },
        {
          label: "Report",
          icon: <ReportIcon className="text-gray-800 font20" />,
          onClick: () => alert("Report clicked"),
        },
        { divider: true },
      ];
    },
    [router]
  );

  const handleSlideChange = useCallback(
    (swiper: any) => {
      const realIndex = swiper.realIndex;
      setActiveSlideIndex(realIndex);
      setOpenDropdowns({});

      const topVideoId =
        dataRef.current[realIndex]?.attachmentInserted?.attachmentId;
      if (topVideoId) setCurrentlyPlayingId(topVideoId);

      if (
        realIndex % 3 === 0 &&
        paginationRef.current.hasMore &&
        !isLoadingRef.current
      ) {
        fetchNextPage();
      }
    },
    [fetchNextPage]
  );

  const initializeSwiper = useCallback((swiper: any) => {
    setActiveSlideIndex(swiper.realIndex);
    if (dataRef.current?.length > 0) {
      setCurrentlyPlayingId(
        dataRef.current[0]?.attachmentInserted?.attachmentId
      );
    }
  }, []);

  const exposedFetchNextPage = useCallback(async () => {
    return await fetchNextPage();
  }, [fetchNextPage]);

  useEffect(() => {
    if (inviteId && !isLoadingRef.current && internalData.length === 0) {
      fetchNextPage();
    }
  }, [inviteId, fetchNextPage, internalData.length]);

  useEffect(() => {
    return () => {
      if (customCleanup) {
        customCleanup();
      } else if (useRedux) {
        dispatch(resetShowWatchState());
      }
    };
  }, [customCleanup, dispatch, useRedux]);

  useEffect(() => {
    if (
      dataRef.current?.length > 0 &&
      activeSlideIndex === 0 &&
      !currentlyPlayingId
    ) {
      setCurrentlyPlayingId(
        dataRef.current[0]?.attachmentInserted?.attachmentId
      );
    }
  }, [internalData, activeSlideIndex, currentlyPlayingId]);

  return {
    data: internalData,
    isLoading,
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
      setInternalData([]);
      setActiveSlideIndex(0);
      setCurrentlyPlayingId(null);
      setOpenDropdowns({});
    }, []),
  };
};
