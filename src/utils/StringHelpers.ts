export default class StringHelpers {
  static baseURL: string = process.env.NEXT_PUBLIC_BASE_URL || "";

  static fixUserName(data: any) {
    console.log(data);
  }

  static getProfile = (data: any): string => {
    if (!data) return "";
    const type = String(data.attachmentType || "").replace(/^\/+|\/+$/g, "");
    const ext = data.ext == null ? "" : String(data.ext);
    const fileName = String(data.fileName || "")
      .replace(/[\u00a0\u202f]/g, " ")
      .trim();
    if (!type || !fileName) return "";
    return `${StringHelpers.baseURL}/${type}/${encodeURIComponent(fileName)}${ext}`;
  };
}
