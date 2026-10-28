import { api } from "./axios.config";
import { NOTIF_API_URL } from "@/lib/env";

const notifBaseURL = NOTIF_API_URL;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function extractPublicKey(payload: any): string {
  const raw =
    payload?.publicKey ??
    payload?.key ??
    payload?.data?.publicKey ??
    payload?.data ??
    payload;
  return typeof raw === "string" ? raw.trim() : "";
}

async function ensureServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export const createSubscription = async () => {
  if (!notifBaseURL) return null;
  const url = `${notifBaseURL.replace(/\/$/, "")}/public-key`;
  return await api.get(url, { skipAuth: true });
};

export const saveSubscription = async (postData: {
  userId: number;
  expoPushToken: string;
}) => {
  const url = `${notifBaseURL}/subscribe`;
  return await api.post(url, postData);
};

export const sendAllNotif = async (postData: any) => {
  const url = `${notifBaseURL}/send-all`;
  return await api.post(url, postData);
};

export const sendUserNotif = async (postData: any) => {
  const url = `${notifBaseURL}/send`;
  return await api.post(url, postData);
};

export const registerForPushNotifications = async () => {
  try {
    if (typeof window === "undefined") return null;
    if (!("Notification" in window) || !("PushManager" in window)) {
      console.log("Push notifications are not supported in this browser.");
      return null;
    }

    let permission = Notification.permission;
    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    await ensureServiceWorker();
    const registration = await navigator.serviceWorker.ready;

    const keyRes = await createSubscription();
    const publicKey = extractPublicKey(keyRes?.data);
    if (!publicKey) {
      return null;
    }

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const webPushToken = JSON.stringify(subscription.toJSON());
    return webPushToken;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status !== 404 && status !== 501) {
      console.warn("Push token is unavailable:", error.message || error);
    }
    return null;
  }
};

export const syncPushToken = async (userId: string | number) => {
  if (!userId || typeof window === "undefined") return;
  try {
    const deviceToken = await registerForPushNotifications();
    if (!deviceToken) {
      return;
    }

    const cacheKey = `user_fcm_token_${userId}`;
    const cachedToken = localStorage.getItem(cacheKey);

    if (deviceToken !== cachedToken) {
      const res = await saveSubscription({
        userId: Number(userId),
        expoPushToken: deviceToken,
      });

      if (res?.status === 200 || res?.status === 201) {
        localStorage.setItem(cacheKey, deviceToken);
      } else {
        console.warn(
          "Backend did not confirm success, not caching:",
          res?.status,
          res?.data,
        );
      }
    }

    return deviceToken;
  } catch (error: any) {
    console.error(
      "Error syncing push token:",
      error?.response?.status,
      error?.response?.data || error.message,
    );
  }
};

export const notifyService = {
  createSubscription,
  saveSubscription,
  sendAllNotif,
  sendUserNotif,
  registerForPushNotifications,
  syncPushToken,
};
