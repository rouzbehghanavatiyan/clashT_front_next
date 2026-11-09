export default class StringHelpers {
  static baseURL: string = process.env.NEXT_PUBLIC_BASE_URL || "";

  static fixUserName(data: any) {
    console.log(data);
  }

  static getProfile = (data: any): string => {
    if (!data) return "";
    if (typeof data === "string") {
      const value = data.trim();
      if (!value || value === "null" || value.includes("undefined")) return "";
      if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
      return "";
    }
    const type = String(data.attachmentType || data.AttachmentType || "").replace(
      /^\/+|\/+$/g,
      "",
    );
    const extRaw = data.ext ?? data.Ext;
    const ext = extRaw == null ? "" : String(extRaw);
    const fileName = String(data.fileName || data.FileName || "")
      .replace(/[\u00a0\u202f]/g, " ")
      .trim();
    if (!type || !fileName || fileName === "null") return "";
    const extNorm = ext && !ext.startsWith(".") ? `.${ext}` : ext;
    const alreadyHasExt = /\.[a-z0-9]+$/i.test(fileName);
    const suffix = alreadyHasExt ? "" : extNorm;
    return `${StringHelpers.baseURL}/${type}/${encodeURIComponent(fileName)}${suffix}`;
  };
}
