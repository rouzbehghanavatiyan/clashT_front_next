import StringHelpers from "./StringHelpers";

export function getImageUrl(data: any): string {
  if (!data) return "";
  if (typeof data === "string") return data;

  const attachment =
    data.attachment ||
    (data.profile && typeof data.profile === "object" ? data.profile : null) ||
    (data.fileName ? data : null);

  if (typeof data.profile === "string" && data.profile) return data.profile;
  if (typeof data.userProfile === "string" && data.userProfile) {
    return data.userProfile;
  }
  if (attachment?.fileName) return StringHelpers.getProfile(attachment);
  return "";
}
