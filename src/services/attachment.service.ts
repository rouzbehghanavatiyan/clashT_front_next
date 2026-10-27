import { api } from "./axios.config";

export const removeInvite = async (invId: number) => {
  return await api.delete(`/removeInvite?inviteId=${invId}`);
};

export const attachmentService = {
  attachmentList: (params: any) => api.get(`/attachmentList`, { params }),
  attachmentListByInviteId: (params: {
    skip: number;
    take: number;
    inviteId: string | number;
  }) => api.get(`/attachmentListByInviteId`, { params }),
  listByInviteId: (params: any) =>
    api.get(`/attachmentListByInviteId`, { params }),

  addMovie: (data: any) => api.post("/addMovie", data),

  addAttachment: (data: FormData) => api.post("/addAttachment", data),

  addInvite: (postData: any) => api.post("/addInvite", postData),

  play: (path: string) => `${api.defaults.baseURL}/attachmentPlay?path=${path}`,

  removeInvite,

  userAttachmentList: (params: any) =>
    api.get(`/userAttachmentList`, { params }),

  followerAttachmentList: (postData: any) =>
    api.get(
      `/followerAttachmentList?skip=${postData?.skip}&take=${postData?.take}&userId=${postData?.userIdLogin}`,
    ),
};