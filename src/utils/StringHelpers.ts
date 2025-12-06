export default class StringHelpers {
  static baseURL: string = process.env.NEXT_PUBLIC_SERVERTEST || "";

  static fixUserName(data: any) {
    console.log(data);
  }

  static getProfile = (data: any): string => {
    if (!data) return "";
    return `${StringHelpers.baseURL}/${data.attachmentType}/${data.fileName}${data.ext}`;
  };
}
