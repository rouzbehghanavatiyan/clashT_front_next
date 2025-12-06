import { api } from "./axios.config";

export const userService = {
  list: () => api.get("/userList"),
  addFollower: (data: any) => api.post("/addFollower", data),
  removeFollower: (data: any) =>
    api.delete("/removeFollower", { data }),
  followerList: (userId: number) =>
    api.get(`/followerList?userId=${userId}`),
  profileAttachment: (userId: number) =>
    api.get(`/profileAttachment?userId=${userId}`),
  addLike: (data: any) => api.post("/addLike", data),
  removeLike: (data: any) =>
    api.delete("/removeLike", { data }),
};
