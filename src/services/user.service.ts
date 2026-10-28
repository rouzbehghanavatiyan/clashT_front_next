import { api } from "./axios.config";

export const blockListByUser = async () => {
  return await api.get(`/blockListByUser`);
};

export const userUnBlock = async (data: any) => {
  return await api.post(`/userUnBlock`, data);
};

export const requestChangeEmail = async (data: { newEmail: string }) => {
  return await api.post(`/requestChangeEmail`, data);
};

export const forgotPassword = async (data: any) => {
  return await api.post(`/forgotPassword`, data);
};

export const addProfile = async (data: any) => {
  return await api.put(`/addProfile`, data);
};

export const userService = {
  list: () => api.get("/userList"),
  followerList: (userId: number) => api.get(`/followerList?userId=${userId}`),
  followingList: (userId: number) =>
    api.get(`/followingList?userId=${userId}`),
  profileAttachment: (userId: number) =>
    api.get(`/profileAttachment?userId=${userId}`),
  addLike: (data: any) => api.post("/addLike", data),
  removeLike: (data: any) => api.delete("/removeLike", { data }),
  showProfileByUser: (userId: number) =>
    api.get(`/showProfileByUser?userId=${userId}`),
  removeFollower: (postData: any) =>
    api.delete(`/removeFollower`, { data: postData }),
  addFollower: (data: any) => api.post("/addFollower", data),
  profile: (username: any) => api.get(`/profile/${username}`),
  addProfile,
  forgotPassword,
  requestChangeEmail,
  blockListByUser,
  userUnBlock,
  searchUser: (postData: {
    userNameReq: string;
    pageNumber: number;
    pageSize: number;
  }) =>
    api.get(
      `/searchUser?SearchUserDto=${encodeURIComponent(postData?.userNameReq ?? "")}&PageNumber=${postData?.pageNumber}&PageSize=${postData?.pageSize}`,
    ),
};
