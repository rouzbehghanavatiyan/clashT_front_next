import { getImageUrl } from "@/utils/fileHelper";

export function buildChatHref(user: {
  id?: string | number | null;
  userName?: string | null;
  profile?: any;
  score?: number | string | null;
}) {
  const id = user?.id;
  if (id == null || id === "") return null;

  const params = new URLSearchParams({
    userName: String(user.userName ?? ""),
    profile: getImageUrl(user.profile) || "",
    score: String(user.score ?? 0),
  });

  return `/chat/${id}?${params.toString()}`;
}
