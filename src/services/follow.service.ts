import { api } from "./axios.config";

export const followService = {
  addFollower: (data: any) => api.post("/addFollower", data),
  removeFollower: (data: any) => api.delete("/removeFollower", { data }),
};
