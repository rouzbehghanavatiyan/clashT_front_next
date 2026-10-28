"use client";

import React, { forwardRef, useEffect, useState } from "react";
import EmailIcon from "@mui/icons-material/Email";
import ReportIcon from "@mui/icons-material/Report";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import { useRouter } from "next/navigation";
import LoadingChild from "../LoadingChild";
import { RsetLastMatch } from "@/store/slices/mainSlice";
import { useAppDispatch } from "@/store/reduxHook";
import StringHelpers from "@/utils/StringHelpers";
import { buildChatHref } from "@/lib/chat";
import VideosProfileItem from "./VideosProfileItem";

interface VideosProfileProps {
  isLoading: boolean;
  match: any[];
  videoLikes: Record<string, number>;
  loadingRef: React.RefObject<HTMLDivElement | null> | any;
  onMatchExpired?: () => void;
}

const VideosProfile = forwardRef<HTMLDivElement, VideosProfileProps>(
  ({ loadingRef, isLoading, match, videoLikes, onMatchExpired }, ref) => {
    const [openDropdowns, setOpenDropdowns] = useState<
      Record<string | number, boolean>
    >({});
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
      null,
    );
    const router = useRouter();
    const dispatch = useAppDispatch();

    const dropdown = (data: any, position: number, userSenderId: any) => {
      const temp = {
        sender: position === 0 ? data?.userInserted?.id : data?.userMatched?.id,
        userProfile:
          position === 0
            ? StringHelpers.getProfile(data?.profileInserted)
            : StringHelpers.getProfile(data?.profileMatched),
        userNameSender:
          position === 0
            ? data?.userInserted?.userName
            : data?.userMatched?.userName,
      };

      return [
        {
          label: "Send message",
          icon: <EmailIcon className="text-gray-800 font20" />,
          onClick: () => {
            const href = buildChatHref({
              id: userSenderId?.id ?? temp.sender,
              userName: temp.userNameSender,
              profile: temp.userProfile,
              score:
                position === 0 ? data?.scoreInserted : data?.scoreMatched,
            });
            if (href) router.push(href);
          },
        },
        {
          label: "Report",
          icon: <ReportIcon className="text-gray-800 font20" />,
          onClick: () => alert("Report submitted"),
        },
        {
          label: "Save",
          icon: <TurnedInNotIcon className="text-gray-800 font20" />,
          onClick: () => alert("Saved"),
        },
        { divider: true },
      ];
    };

    const toggleDropdown = (video: any, index: number) => {
      setOpenDropdowns((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    };

    useEffect(() => {
      if (match?.length > 0) {
        dispatch(RsetLastMatch(match[0]));
      }
    }, [match, dispatch]);

    return (
      <div ref={ref}>
        <div className="flex w-full justify-center border-t border-gray-100 dark:border-zinc-800">
          <div className="grid w-full grid-cols-1">
            {match?.map((video: any, index: number) => (
              <VideosProfileItem
                key={
                  video?.inviteInserted?.id ??
                  video?.inviteMatched?.id ??
                  video?.id ??
                  index
                }
                video={video}
                videoLikes={videoLikes}
                currentlyPlayingId={currentlyPlayingId}
                onPlay={setCurrentlyPlayingId}
                onMatchExpired={onMatchExpired}
                openDropdowns={openDropdowns}
                setOpenDropdowns={setOpenDropdowns}
                toggleDropdown={toggleDropdown}
                dropdownItems={dropdown}
              />
            ))}
          </div>
        </div>
        <LoadingChild ref={loadingRef} isLoading={isLoading} />
      </div>
    );
  },
);

VideosProfile.displayName = "VideosProfile";

export default VideosProfile;
