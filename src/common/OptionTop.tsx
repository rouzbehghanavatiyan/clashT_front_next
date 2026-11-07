"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ZoomIn from "@mui/icons-material/ZoomIn";
import ZoomOut from "@mui/icons-material/ZoomOut";
import ChatIcon from "@mui/icons-material/Chat";
import FlagIcon from "@mui/icons-material/Flag";
import BlockIcon from "@mui/icons-material/Block";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { userService } from "@/services/user.service";
import StringHelpers from "@/utils/StringHelpers";
import { buildChatHref } from "@/lib/chat";
import ImageRank from "@/components/ImageRank";
import Follows from "@/components/Follows";

const REPORT_REASONS = [
  { id: 1, label: "Bad Content", value: "bad_content" },
  { id: 2, label: "Meaningless Content", value: "meaningless_content" },
  { id: 3, label: "Illegal or 18+", value: "illegal_adult" },
  { id: 4, label: "Against starfaceoff Rules", value: "against_rules" },
  { id: 5, label: "Suspected AI-generated content", value: "ai_generated" },
];


function OverlayModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-5"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-[360px] rounded-2xl bg-white p-[18px] shadow-xl dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

const OptionTop: React.FC<any> = ({
  video,
  inviteWatch = false,
  positionVideo,
  score,
  userIdLogin,
  main,
  onExpand,
  isExpanded,
  onBlockSuccess,
  isBlocked = false,
}) => {
  const router = useRouter();
  const [localIsFollowed, setLocalIsFollowed] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);
  const [reportResult, setReportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const currentUserId = Number(
    userIdLogin ??
      main?.userLogin?.user?.id ??
      main?.userLogin?.userId ??
      main?.userLogin?.id,
  );
  const userInfo =
    positionVideo === 0
      ? video?.userInserted ||
        video?.inviteInserted?.user ||
        (video?.inviteInserted?.userId
          ? { id: video.inviteInserted.userId, userName: video?.inviteInserted?.userName }
          : null)
      : video?.userMatched ||
        video?.inviteMatched?.user ||
        (video?.inviteMatched?.userId
          ? { id: video.inviteMatched.userId, userName: video?.inviteMatched?.userName }
          : null);
  const profile =
    positionVideo === 0
      ? StringHelpers.getProfile(video?.profileInserted)
      : StringHelpers.getProfile(video?.profileMatched);
  const isOwnVideo =
    Number.isFinite(currentUserId) &&
    currentUserId > 0 &&
    Number(userInfo?.id) === currentUserId;
  const showOtherUserActions = Boolean(userInfo?.id) && !isOwnVideo;
  const userScore =
    positionVideo === 0 ? video?.scoreInserted : video?.scoreMatched;

  useEffect(() => {
    const isFollowed =
      positionVideo === 0
        ? video?.isFollowedMeInserted
        : video?.isFollowedMeMatched;
    setLocalIsFollowed(!!isFollowed);
  }, [video, positionVideo]);

  const getMovieId = (): number | null => {
    const id =
      positionVideo === 0
        ? video?.inviteInserted?.movieId
        : video?.inviteMatched?.movieId;
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const handleFollowClick = async () => {
    if (isLoadingFollow) return;
    const userIdFollow =
      positionVideo === 0 ? video?.userInserted?.id : video?.userMatched?.id;
    const postData = {
      userId: userIdLogin || null,
      followerId: userIdFollow || null,
    };
    try {
      setIsLoadingFollow(true);
      if (localIsFollowed) {
        await userService.removeFollower(postData);
      } else {
        await userService.addFollower(postData);
      }
      setLocalIsFollowed(!localIsFollowed);
    } catch (error) {
      console.error("Error in follow operation:", error);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleSendMessage = () => {
    setMenuOpen(false);
    if (!userInfo?.id) return;
    const href = buildChatHref({
      id: userInfo.id,
      userName: userInfo?.userName || "",
      profile: positionVideo === 0 ? video?.profileInserted : video?.profileMatched,
      score: userScore || "",
    });
    if (href) router.push(href);
  };

  const handleConfirmBlock = async () => {
    try {
      setIsSubmittingBlock(true);
      const res = await userService.userBlock({
        blockerId: userIdLogin,
        targetUserId: userInfo?.id,
      });
      const isSuccess =
        res?.data?.status === 0 ||
        res?.data === 0 ||
        res?.status === 200;
      setBlockModalOpen(false);
      if (isSuccess) onBlockSuccess?.();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  const runAfterMenuClose = (action: () => void) => {
    setMenuOpen(false);
    window.setTimeout(action, 0);
  };

  const handleOpenBlockModal = () => {
    runAfterMenuClose(() => setBlockModalOpen(true));
  };

  const handleOpenReportModal = () => {
    runAfterMenuClose(() => {
      setSelectedReason(null);
      setReportResult(null);
      setReportModalOpen(true);
    });
  };

  const handleCloseReportModal = () => {
    setReportModalOpen(false);
    setReportResult(null);
    setSelectedReason(null);
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) return;
    const movieId = getMovieId();
    if (!movieId || !userInfo?.id) {
      setReportResult({
        success: false,
        message: "Unable to identify this video. Please try again.",
      });
      return;
    }

    try {
      setIsSubmittingReport(true);
      const postData = {
        targetUserId: userInfo.id,
        movieId,
        reason: selectedReason,
      };
      const res = await userService.reportVideo(postData);
      if (res?.data?.status === 0) {
        setReportResult({
          success: true,
          message:
            "Thank you! Your report has been submitted and will be reviewed shortly.",
        });
      } else {
        setReportResult({
          success: false,
          message: res?.data?.message || "Failed to submit the report.",
        });
      }
    } catch (error: any) {
      console.error("Report submission failed:", error);
      setReportResult({
        success: false,
        message:
          error?.response?.data?.message ||
          "Something went wrong. Please check your connection and try again.",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const menuItems = [
    { label: "Send Message", icon: <ChatIcon sx={{ fontSize: 18 }} />, onClick: handleSendMessage },
    { label: "Report", icon: <FlagIcon sx={{ fontSize: 18 }} />, onClick: handleOpenReportModal },
    { label: "Block", icon: <BlockIcon sx={{ fontSize: 18 }} />, onClick: handleOpenBlockModal },
  ];

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-black/55 via-black/20 to-transparent pb-8 ${
        inviteWatch && positionVideo === 1 && !isExpanded
          ? "px-2 pb-8 pt-5"
          : "p-2 pb-8"
      }`}
    >
      <div className="pointer-events-auto grid grid-cols-9 items-center w-full">
        <div className="flex col-span-5 justify-start">
          <ImageRank
            userInfo={userInfo}
            userName={userInfo?.userName}
            imgSize={50}
            imgSrc={profile}
            score={score}
            className="relative z-20 [&_span]:text-white [&_span]:drop-shadow-sm"
          />
        </div>
        <div className="flex col-span-2 justify-center">
          {showOtherUserActions && (
            <Follows
              title={localIsFollowed ? "Unfollow" : "Follow"}
              onFollowClick={handleFollowClick}
              disabled={isLoadingFollow}
            />
          )}
        </div>
        <div className="flex col-span-2 items-center justify-end gap-0.5">
          {!isBlocked && (
            <button
              type="button"
              aria-label={isExpanded ? "Exit fullscreen" : "View video fullscreen"}
              onClick={(e) => {
                e.stopPropagation();
                onExpand?.();
              }}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15"
            >
              {isExpanded ? (
                <ZoomOut sx={{ fontSize: 20 }} />
              ) : (
                <ZoomIn sx={{ fontSize: 20 }} />
              )}
            </button>
          )}
          {!isBlocked && showOtherUserActions ? (
            <div className="relative">
              <button
                type="button"
                aria-label="More options"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(true);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/15"
              >
                <MoreVertIcon sx={{ fontSize: 22 }} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[390] bg-black/15"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen(false);
            }}
          >
            <div
              className="absolute right-8 top-12 w-[190px] rounded-[10px] border border-gray-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
              onClick={(event) => event.stopPropagation()}
            >
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    item.onClick();
                  }}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm text-zinc-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-800"
                >
                  <span className="text-zinc-700 dark:text-gray-200">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}

      <OverlayModal open={reportModalOpen} onClose={handleCloseReportModal}>
        {reportResult ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div
              className={`rounded-full p-3 ${
                reportResult.success ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              {reportResult.success ? (
                <CheckCircleIcon sx={{ fontSize: 48, color: "#10B981" }} />
              ) : (
                <ErrorOutlineIcon sx={{ fontSize: 48, color: "#DC2626" }} />
              )}
            </div>
            <p className="text-base font-bold text-zinc-900 dark:text-white">
              {reportResult.success ? "Report Submitted" : "Report Failed"}
            </p>
            <p className="text-sm leading-[22px] text-gray-500">
              {reportResult.message}
            </p>
            <button
              type="button"
              onClick={handleCloseReportModal}
              className="mt-1 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white"
            >
              OK
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-base font-bold text-zinc-900 dark:text-white">
                Report Content
              </p>
              <button
                type="button"
                onClick={handleCloseReportModal}
                disabled={isSubmittingReport}
                aria-label="Close report"
              >
                <CloseIcon sx={{ fontSize: 24, color: "#666" }} />
              </button>
            </div>
            <p className="mb-3 text-left text-xs text-gray-500">
              Please select a reason for reporting:
            </p>
            <div className="mb-4 flex flex-col gap-2">
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReason === reason.id;
                return (
                  <button
                    key={reason.id}
                    type="button"
                    disabled={isSubmittingReport}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`flex w-full items-center gap-3 rounded-[10px] border px-3.5 py-3 text-left ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    {isSelected ? (
                      <RadioButtonCheckedIcon sx={{ fontSize: 20, color: "#2563EB" }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: "#9CA3AF" }} />
                    )}
                    <span
                      className={`text-sm ${
                        isSelected ? "font-bold text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {reason.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={!selectedReason || isSubmittingReport}
              onClick={handleSubmitReport}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {isSubmittingReport ? "Submitting..." : "Submit"}
            </button>
          </>
        )}
      </OverlayModal>

      <OverlayModal open={blockModalOpen} onClose={() => setBlockModalOpen(false)}>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-base font-bold text-red-600">Block User</p>
          <button
            type="button"
            onClick={() => setBlockModalOpen(false)}
            aria-label="Close block"
          >
            <CloseIcon sx={{ fontSize: 24, color: "#666" }} />
          </button>
        </div>
        <p className="mb-4 text-left text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to block{" "}
          {userInfo?.userName ? `@${userInfo.userName}` : "this user"}? You will
          no longer see their content or receive messages from them.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={isSubmittingBlock}
            onClick={() => setBlockModalOpen(false)}
            className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmittingBlock}
            onClick={handleConfirmBlock}
            className="min-w-20 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {isSubmittingBlock ? "Blocking..." : "Block"}
          </button>
        </div>
      </OverlayModal>
    </div>
  );
};

export default OptionTop;
