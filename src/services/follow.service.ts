import { api } from "./axios.config";

const followerLength = (userId: number | string) =>
  api.get(`/followerLength?userId=${userId}`);

const followingLength = (userId: number | string) =>
  api.get(`/followingLength?userId=${userId}`);

export const followService = {
  addFollower: (data: any) => api.post("/addFollower", data),
  removeFollower: (data: any) => api.delete("/removeFollower", { data }),
  followingLength,
  followerLength,
  followersLength: followerLength,
};
