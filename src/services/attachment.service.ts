import { api } from "./axios.config";

export const attachmentService = {
  list: (params: any) =>
    api.get(`/attachmentList`, { params }),

  listByInviteId: (params: any) =>
    api.get(`/attachmentListByInviteId`, { params }),

  addMovie: (data: any) => api.post("/addMovie", data),

  addAttachment: (data: FormData) => api.post("/addAttachment", data),

  play: (path: string) => `${api.defaults.baseURL}/attachmentPlay?path=${path}`,
  
  removeInvite: (inviteId: number) =>
    api.delete(`/removeInvite?inviteId=${inviteId}`),

  userAttachmentList: (params: any) =>
    api.get(`/userAttachmentList`, { params }),

  followerAttachmentList: (params: any) =>
    api.get(`/followerAttachmentList`, { params }),
};
