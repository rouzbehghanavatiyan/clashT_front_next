import { api } from "./axios.config";

export const supportConnect = async (data: {
  subject: string;
  description: string;
  userEmail?: string;
}) => {
  return await api.post(`/supportConnect`, data, { skipAuth: true });
};

export const miscService = {
  commentList: (movieId: number, pageNumber = 1, pageSize = 10) =>
    api.get(`/commentList`, {
      params: { movieId, PageNumber: pageNumber, PageSize: pageSize },
    }),
  addComment: (data: any) => api.post("/addComment", data),
  removeComment: (commentId: number) =>
    api.delete(`/removeComment?commentId=${commentId}`),
  topScoreList: () => api.get("/topScoreList"),
  modeList: () => api.get("/modeList"),
  supportConnect,
};
