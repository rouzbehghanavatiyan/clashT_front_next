import { api } from "./axios.config";

export const followService = {
  addFollower: (data: any) => api.post("/addFollower", data),
  removeFollower: (data: any) => api.delete("/removeFollower", { data }),

  followingLength: (userId: number | string) =>
    api.get(`/followingLength?.userId${userId}`),
  followersLength: (userId: number | string) =>
    api.get(`/followersLength?.userId${userId}`),
};
