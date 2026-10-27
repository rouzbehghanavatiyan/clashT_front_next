import { stopMatchTimer } from "@/components/TimerForFindMatch";
import { socket } from "@/lib/socket";
import { baseURL } from "@/services/axios.config";
import { attachmentService } from "@/services/attachment.service";
import { getAccessToken } from "@/services/tokenService";

const STORAGE_KEY = "pendingInviteId";

let receiveInviteHandler: ((data: any) => void) | null = null;

export const setPendingInviteId = (id: number | null) => {
  if (typeof window === "undefined") return;
  if (id) sessionStorage.setItem(STORAGE_KEY, String(id));
  else sessionStorage.removeItem(STORAGE_KEY);
};

export const getPendingInviteId = (): number | null => {
  if (typeof window === "undefined") return null;
  const id = Number(sessionStorage.getItem(STORAGE_KEY));
  return Number.isFinite(id) && id > 0 ? id : null;
};

export const setMatchReceiveHandler = (handler: ((data: any) => void) | null) => {
  if (receiveInviteHandler) {
    socket.off("receive_invite", receiveInviteHandler);
  }
  receiveInviteHandler = handler;
  if (handler) {
    socket.once("receive_invite", handler);
  }
};

export const clearMatchSearchListeners = () => {
  if (receiveInviteHandler) {
    socket.off("receive_invite", receiveInviteHandler);
    receiveInviteHandler = null;
  }
  stopMatchTimer();
};

export const keepMatchedInvite = () => {
  clearMatchSearchListeners();
  setPendingInviteId(null);
};

export const cancelPendingInvite = async (options?: {
  inviteId?: number | null;
  keepalive?: boolean;
}) => {
  const inviteId = Number(options?.inviteId) || getPendingInviteId();
  clearMatchSearchListeners();
  setPendingInviteId(null);
  if (!inviteId) return;

  try {
    if (options?.keepalive && typeof window !== "undefined") {
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      await fetch(`${baseURL}/removeInvite?inviteId=${inviteId}`, {
        method: "DELETE",
        keepalive: true,
        headers,
      });
      return;
    }

    await attachmentService.removeInvite(inviteId);
  } catch (error) {
    console.error("removeInvite failed", error);
  }
};
