"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import ImageRank from "@/components/ImageRank";
import { Icon } from "@/components/Icon";
import { miscService } from "@/services/misc.service";
import { useAppSelector } from "@/store/reduxHook";
import StringHelpers from "@/utils/StringHelpers";

const PAGE_SIZE = 10;
const ACCENT = "#4F46E5";
const SHEET_VH = 78;

interface CommentsProps {
  visible?: boolean;
  showComments?: boolean;
  onClose?: () => void;
  setShowComments?: React.Dispatch<React.SetStateAction<boolean>>;
  video?: any;
  commentUserInfo?: any;
  positionVideo: number;
  userIdLogin?: string | null;
}

interface ReplyTarget {
  id: any;
  userName?: string;
}

const buildRoots = (items: any[]) => {
  const roots = items
    .filter((c) => !c.parentId)
    .map((c) => ({ ...c, replies: [] as any[] }));
  const rootById = new Map(roots.map((r) => [r.id, r]));
  items
    .filter((c) => !!c.parentId)
    .forEach((c) => rootById.get(c.parentId)?.replies.push(c));
  roots.forEach((r) => r.replies.sort((a: any, b: any) => a.id - b.id));
  return roots;
};

const normalizePayload = (payload: any) => {
  const body = payload?.data ?? payload;
  const inner = body?.data ?? body;
  if (Array.isArray(inner)) {
    return { items: inner, totalCount: inner.length, hasMore: false, status: body?.status ?? 0 };
  }
  if (Array.isArray(inner?.items)) {
    return {
      items: inner.items,
      totalCount: inner.totalCount ?? inner.items.length,
      hasMore: !!inner.hasMore,
      status: body?.status ?? 0,
    };
  }
  return { items: [], totalCount: 0, hasMore: false, status: body?.status ?? 1 };
};

const CommentsSkeleton = () => (
  <div className="animate-pulse px-4 pt-2">
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="flex items-start gap-3 py-2.5">
        <div className="h-[38px] w-[38px] shrink-0 rounded-full bg-black/10" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-[30%] rounded-md bg-black/10" />
          <div
            className={`h-3 rounded-md bg-black/10 ${i % 2 ? "w-[70%]" : "w-[90%]"}`}
          />
        </div>
      </div>
    ))}
  </div>
);

interface CommentRowProps {
  item: any;
  expanded: boolean;
  onToggle: (id: any) => void;
  onReply: (rootId: any, userName?: string) => void;
}

const CommentRow = memo(
  ({ item, expanded, onToggle, onReply }: CommentRowProps) => {
    const replies: any[] = item?.replies ?? [];
    return (
      <div className="flex items-start gap-2.5 py-2">
        <ImageRank
          imgSrc={StringHelpers.getProfile(item?.profile) || undefined}
          imgSize={38}
          score={item?.score}
          onClickDisable
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="rounded-2xl border border-black/10 bg-white px-3 py-2">
            <p className="text-[13px] font-bold text-neutral-900">
              {item?.userName || "Anonymous"}
            </p>
            <p className="text-sm leading-5 text-neutral-900">{item?.desc}</p>
          </div>
          <div className="flex items-center px-1.5">
            <button
              type="button"
              onClick={() => onReply(item?.id, item?.userName)}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-800"
            >
              Reply
            </button>
          </div>
          {replies.length > 0 && (
            <button
              type="button"
              onClick={() => onToggle(item?.id)}
              className="flex items-center gap-2 px-1.5"
            >
              <span className="h-px w-[22px] bg-black/10" />
              <span className="text-xs font-bold text-neutral-500">
                {expanded
                  ? "Hide replies"
                  : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
              </span>
            </button>
          )}
          {expanded && replies.length > 0 && (
            <div className="mt-1 flex flex-col gap-2.5">
              {replies.map((reply: any) => (
                <div key={reply.id} className="flex items-start gap-2">
                  <ImageRank
                    imgSrc={StringHelpers.getProfile(reply?.profile) || undefined}
                    imgSize={28}
                    userName={reply?.userName}
                    score={reply?.score}
                    onClickDisable
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="rounded-[14px] border border-black/10 bg-white px-2.5 py-1.5">
                      <p className="text-xs font-bold text-neutral-900">
                        {reply?.userName || "Anonymous"}
                      </p>
                      <p className="text-[13px] leading-[18px] text-neutral-900">
                        {reply?.desc}
                      </p>
                    </div>
                    <div className="px-1.5">
                      <button
                        type="button"
                        onClick={() => onReply(item?.id, reply?.userName)}
                        className="text-[11.5px] font-bold text-neutral-500 hover:text-neutral-800"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);
CommentRow.displayName = "CommentRow";

const Comments: React.FC<CommentsProps> = ({
  visible,
  showComments,
  onClose,
  setShowComments,
  video,
  commentUserInfo,
  positionVideo,
}) => {
  const isVisible = visible ?? showComments ?? false;
  const videoData = video ?? commentUserInfo;
  const userLogin = useAppSelector((state) => state?.main?.userLogin);
  const loginUserId = userLogin?.user?.id;
  const userProfile = StringHelpers.getProfile(userLogin?.profile);

  const [sendError, setSendError] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [answerData, setAnswerData] = useState<ReplyTarget | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  const [dragY, setDragY] = useState(0);

  const pageRef = useRef(1);
  const loadingMoreRef = useRef(false);
  const closingRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragging = useRef(false);

  const movieId =
    positionVideo === 0
      ? videoData?.attachmentInserted?.attachmentId
      : videoData?.attachmentMatched?.attachmentId;

  const handleDismiss = useCallback(() => {
    closingRef.current = false;
    setOpen(false);
    setDragY(0);
    setComments([]);
    setText("");
    setAnswerData(null);
    setExpanded({});
    setLoading(false);
    setSending(false);
    setHasMore(false);
    setLoadingMore(false);
    setIsFocused(false);
    pageRef.current = 1;
    loadingMoreRef.current = false;
    onClose?.();
    setShowComments?.(false);
  }, [onClose, setShowComments]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setOpen(false);
    setDragY(0);
    window.setTimeout(handleDismiss, 200);
  }, [handleDismiss]);

  const fetchComments = useCallback(
    async (keepLoadedPages = false) => {
      if (!movieId) return;
      const pages = keepLoadedPages ? pageRef.current : 1;
      setLoading(true);
      try {
        const res = await miscService.commentList(movieId, 1, pages * PAGE_SIZE);
        const parsed = normalizePayload(res?.data);
        if (parsed.status === 0) {
          setTotalCount(parsed.totalCount);
          setHasMore(parsed.hasMore);
          pageRef.current = pages;
          setComments(buildRoots(parsed.items));
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    },
    [movieId],
  );

  const fetchMore = useCallback(async () => {
    if (!movieId || !hasMore || loadingMoreRef.current || loading) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const res = await miscService.commentList(movieId, nextPage, PAGE_SIZE);
      const parsed = normalizePayload(res?.data);
      if (parsed.status === 0) {
        const newRoots = buildRoots(parsed.items);
        pageRef.current = nextPage;
        setHasMore(parsed.hasMore);
        setTotalCount(parsed.totalCount);
        setComments((prev) => {
          const ids = new Set(prev.map((c) => c.id));
          return [...prev, ...newRoots.filter((r) => !ids.has(r.id))];
        });
      }
    } catch (error) {
      console.error("Error loading more comments:", error);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [movieId, hasMore, loading]);

  useEffect(() => {
    if (!isVisible) return;
    closingRef.current = false;
    const id = window.requestAnimationFrame(() => setOpen(true));
    if (movieId) fetchComments();
    return () => window.cancelAnimationFrame(id);
  }, [isVisible, movieId, fetchComments]);

  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, handleClose]);

  const handleReplyPress = useCallback((rootId: any, userName?: string) => {
    setAnswerData({ id: rootId, userName });
    inputRef.current?.focus();
  }, []);

  const handleToggleReplies = useCallback((id: any) => {
    setExpanded((prev) => ({ ...prev, [String(id)]: !prev[String(id)] }));
  }, []);

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || !movieId || sending) return;
    setSendError(false);
    setSending(true);
    try {
      const res = await miscService.addComment({
        userId: loginUserId,
        movieId,
        desc: trimmed,
        ParentId: answerData?.id || null,
      });
      if (res?.data?.status === 0) {
        const isReply = !!answerData?.id;
        if (isReply) {
          setExpanded((prev) => ({ ...prev, [String(answerData!.id)]: true }));
        }
        setText("");
        setAnswerData(null);
        await fetchComments(true);
        if (!isReply) scrollToTop();
      }
    } catch (error) {
      setSendError(true);
      console.error("Error sending comment:", error);
    } finally {
      setSending(false);
    }
  }, [text, movieId, sending, loginUserId, answerData, fetchComments, scrollToTop]);

  const onListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      fetchMore();
    }
  };

  const onHandlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    dragStartY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dy = Math.max(0, e.clientY - dragStartY.current);
    setDragY(dy);
  };

  const onHandlePointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragY > 120) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  if (!isVisible && !open) return null;
  if (typeof document === "undefined") return null;

  const canSend = !!text.trim() && !sending;
  const sheetOffset = open ? dragY : 520;

  return createPortal(
    <div className="fixed inset-0 z-[999]">
      <button
        type="button"
        aria-label="Close comments"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/55 transition-opacity duration-200 ${
          open && dragY === 0 ? "opacity-100" : "opacity-70"
        }`}
      />
      <div
        className="absolute inset-x-0 bottom-0 flex max-h-[78vh] flex-col overflow-hidden rounded-t-3xl bg-[#fafafa] transition-transform duration-200 ease-out"
        style={{
          height: `${SHEET_VH}vh`,
          transform: `translateY(${sheetOffset}px)`,
        }}
      >
        <div className="shrink-0 border-b border-black/10 bg-white pt-2 pb-3">
          <div
            className="flex cursor-grab justify-center pb-2.5 active:cursor-grabbing"
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={onHandlePointerUp}
          >
            <div className="h-1 w-10 rounded-full bg-neutral-500/35" />
          </div>
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-neutral-900">Comments</h2>
              {totalCount > 0 && (
                <span className="rounded-[10px] border border-black/10 bg-[#fafafa] px-2 py-0.5 text-xs font-bold text-neutral-500">
                  {totalCount}
                </span>
              )}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#fafafa]"
            >
              <Icon name="Close" size={18} className="text-neutral-500" />
            </button>
          </div>
        </div>

        <div
          ref={listRef}
          onScroll={onListScroll}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          {loading && comments.length === 0 ? (
            <CommentsSkeleton />
          ) : comments.length > 0 ? (
            <div className="px-4 py-2">
              {comments.map((item) => (
                <CommentRow
                  key={item?.id}
                  item={item}
                  expanded={!!expanded[String(item?.id)]}
                  onToggle={handleToggleReplies}
                  onReply={handleReplyPress}
                />
              ))}
              {loadingMore && (
                <div className="flex justify-center py-4">
                  <span
                    className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                    style={{ borderColor: ACCENT, borderTopColor: "transparent" }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-6 py-12">
              <div
                className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-black/10 bg-white"
              >
                <Icon name="ChatBubbleOutline" size={32} sx={{ color: ACCENT }} />
              </div>
              <p className="text-base font-bold text-neutral-900">No comments yet</p>
              <p className="text-center text-[13px] text-neutral-500">
                Be the first to share your thoughts.
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="mt-1.5 rounded-full px-[18px] py-[9px] text-[13px] font-bold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                Write a comment
              </button>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-black/10 bg-white pb-[max(0px,env(safe-area-inset-bottom))]">
          {answerData && (
            <div className="flex items-center justify-between bg-[#fafafa] px-4 py-2">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className="h-[22px] w-[3px] rounded-sm"
                  style={{ backgroundColor: ACCENT }}
                />
                <p className="truncate text-[12.5px] text-neutral-500">
                  Replying to{" "}
                  <span className="font-bold text-neutral-900">
                    @{answerData?.userName || "User"}
                  </span>
                </p>
              </div>
              <button
                type="button"
                aria-label="Cancel reply"
                onClick={() => setAnswerData(null)}
                className="p-1"
              >
                <Icon name="Close" size={16} className="text-neutral-500" />
              </button>
            </div>
          )}
          {sendError && (
            <p className="px-4 pt-2 text-xs text-red-600">
              Could not send comment. Try again.
            </p>
          )}
          <div className="flex items-end gap-2.5 px-3 py-2.5">
            <div className="mb-0.5">
              <ImageRank
                imgSrc={userProfile || undefined}
                imgSize={36}
                onClickDisable
              />
            </div>
            <div
              className="flex flex-1 items-end gap-1.5 rounded-[22px] border py-1 pr-1.5 pl-3.5"
              style={{
                borderColor: isFocused ? ACCENT : "rgba(0,0,0,0.12)",
                backgroundColor: "#fafafa",
              }}
            >
              <textarea
                ref={inputRef}
                value={text}
                rows={1}
                onChange={(e) => {
                  setText(e.target.value);
                  if (sendError) setSendError(false);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  answerData
                    ? `Write a reply to @${answerData?.userName || "comment"}...`
                    : "Add a comment..."
                }
                className="max-h-[100px] min-h-[32px] flex-1 resize-none bg-transparent py-1.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-500"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="mb-px inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full disabled:opacity-70"
                style={{
                  backgroundColor: canSend ? ACCENT : "rgba(0,0,0,0.12)",
                }}
              >
                {sending ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <Icon
                    name="Send"
                    size={15}
                    className={canSend ? "text-white" : "text-neutral-500"}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Comments;
