import { api } from "./axios.config";

export const miscService = {
  tableFields: () => api.patch("/logins"),
  commentList: (movieId: number) =>
    api.get(`/commentList?movieId=${movieId}`),
  addComment: (data: any) => api.post("/addComment", data),
  removeComment: (commentId: number) =>
    api.delete(`/removeComment?commentId=${commentId}`),
  topScoreList: () => api.get("/topScoreList"),
  modeList: () => api.get("/modeList"),
};
