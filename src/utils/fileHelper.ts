import StringHelpers from "./StringHelpers";

export function fixNumberCount(value: number | string | null | undefined) {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function getImageUrl(data: any): string {
  if (!data) return "";
  if (typeof data === "string") return toCoverPath(data);

  const attachment =
    data.attachment ||
    (data.profile && typeof data.profile === "object" ? data.profile : null) ||
    (data.fileName ? data : null);

  if (typeof data.profile === "string" && data.profile) {
    return toCoverPath(data.profile);
  }
  if (typeof data.userProfile === "string" && data.userProfile) {
    return toCoverPath(data.userProfile);
  }
  if (attachment?.fileName) {
    return StringHelpers.getProfile(toCoverAttachment(attachment));
  }
  return "";
}

function toCoverPath(value: string) {
  return value
    .replace(/(^|\/)video_/g, "$1cover_")
    .replace(/\.mp4$/i, ".png");
}

function toCoverAttachment(attachment: any) {
  const fileName = String(attachment?.fileName || "");
  const ext = String(attachment?.ext || "").toLowerCase();
  const isVideo =
    ext === ".mp4" ||
    ext === ".mov" ||
    ext === ".webm" ||
    fileName.startsWith("video_");
  if (!isVideo) return attachment;
  return {
    ...attachment,
    fileName: fileName.replace(/^video_/, "cover_"),
    ext: ".png",
  };
}

function randomFromAlphabet(length: number, alphabet: string) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export function makeMovieAttachmentName(
  prefix: "video" | "cover",
  movieId: string | number,
) {
  const id = String(movieId);
  const token = randomFromAlphabet(12, "abcdefghijklmnopqrstuvwxyz0123456789");
  const guid = randomFromAlphabet(32, "0123456789abcdef");
  return `${prefix}_${id}_${token}_${id}_${guid}`;
}

export function makeCoverFileName(movieId: string | number) {
  const guid = randomFromAlphabet(32, "0123456789abcdef");
  return `cover_${Date.now()}_${movieId}_${guid}.png`;
}

export function fileExtension(name?: string | null, fallback = ".mp4") {
  const match = String(name || "").match(/(\.[a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : fallback;
}
