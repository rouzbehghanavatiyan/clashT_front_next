import { chatApi } from "./axios.config";

export const allUserMessagese = async (
  skip: number = 0,
  take: number = 10,
): Promise<any> => {
  return await chatApi.get("/api/chat/allUserMessagese", {
    params: {
      skip,
      take,
    },
  });
};

export const userMessages = async (
  userIdLogin: number,
  userIdSender: number,
  skip: number,
  take: number,
): Promise<any> => {
  try {
    const response = await chatApi.get("/api/chat/userMessages", {
      params: {
        userIdLogin,
        userIdSender,
        skip,
        take,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch user messages",
    );
  }
};

export const markAsRead = async (payload: {
  senderId: number;
  receiveId: number;
  messageId?: number;
}) => {
  try {
    const response = await chatApi.patch("/api/chat/markAsRead", payload);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};

export const unreadCount = async (userId: string | number) => {
  try {
    const response = await chatApi.get(`/api/chat/unreadCount/${userId}`);
    return response?.data;
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};

export function parseUnreadCount(payload: any): number {
  const raw =
    payload?.unreadCount ??
    payload?.data?.unreadCount ??
    payload?.count ??
    payload?.data ??
    payload;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export const chatService = {
  allUserMessagese,
  userMessages,
  markAsRead,
  unreadCount,
};
