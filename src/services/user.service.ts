import { api } from "./axios.config";

export const userService = {
  list: () => api.get("/userList"),
  followerList: (userId: number) => api.get(`/followerList?userId=${userId}`),
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
};
