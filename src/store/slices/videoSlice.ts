import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { RsetMessageModal, RsetShowTimerButtn } from "./mainSlice";
import {
  startMatchTimer,
  stopMatchTimer,
} from "@/components/TimerForFindMatch";
import { socket } from "@/lib/socket";
import { attachmentService } from "@/services/attachment.service";
import { MATCH_NOTIF, notifyUserMatch } from "@/services/notify.service";
import { authService } from "@/services/auth.service";
import { cancelPendingInvite } from "@/utils/pendingInvite";
import {
  clearCreateMediaFile,
  getCreateMediaFile,
} from "@/utils/createMediaFile";
import { captureVideoCover } from "@/utils/media";
import {
  fileExtension,
  makeCoverFileName,
  makeMovieAttachmentName,
} from "@/utils/fileHelper";

function toBlob(value: unknown): Blob | File | null {
  if (value instanceof File || value instanceof Blob) return value;
  return null;
}

const initialState: any = {
  needProfileRefresh: false,
  videoSrc: null,
  videoMimeType: null,
  videoFileName: null,
  showTimeout: false,
  isLoading: false,
  selectedResize: 1,
  error: null,
  gearId: 0,
  showDeactivatedModal: false,
  currentStep: 1,
  isWaitingForMatch: false,
  uploadStatus: "idle",
  resMovieData: null,
  movieData: {
    parentId: null,
    userId: null,
    movieId: null,
    status: null,
    inviteId: null,
    title: "",
    desc: "",
    trimStart: 0,
    trimEnd: 0,
    duration: 0,
  },
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    {
      username,
      password,
    }: {
      username: string;
      password: string;
    },
    thunkAPI,
  ) => {
    try {
      const response = await authService.login({
        userName: username,
        password,
      });

      const { status, data } = response.data;

      if (status !== 0) {
        return thunkAPI.rejectWithValue("Invalid username or password");
      }

      const decoded = jwtDecode(data.token) as any;
      const userId = Object.values(decoded)?.[1] as string;

      return {
        token: data.token,
        user: {
          username,
          userId,
        },
      };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Server error",
      );
    }
  },
);

export const removeInviteThunk = createAsyncThunk(
  "video/removeInvite",
  async (inviteId: number, { dispatch }) => {
    const res = await attachmentService.removeInvite(inviteId);

    if (res?.data?.status === 0) {
      dispatch(setShowDeactivatedModal(true));
    }

    return inviteId;
  },
);

export const cancelMatchSearchThunk = createAsyncThunk(
  "video/cancelMatchSearch",
  async (_, { dispatch, getState }) => {
    const state = getState() as any;
    const inviteId = Number(state?.video?.movieData?.inviteId) || undefined;
    await cancelPendingInvite({ inviteId });
    dispatch(setWaitingForMatch(false));
    dispatch(RsetShowTimerButtn(false));
    dispatch(updateMovieData({ inviteId: null }));
  },
);

export const uploadFullProcessThunk = createAsyncThunk(
  "video/uploadFullProcess",
  async (
    {
      allFormData,
      movieMeta,
      router,
      targetGender: targetGenderArg,
      subSubCategoryId: subSubCategoryIdArg,
    }: any,
    { rejectWithValue, dispatch, getState },
  ) => {
    try {
      const state = getState() as any;
      const login = state?.main?.userLogin;
      const rawUserGender = Number(
        login?.user?.userGender ??
          login?.user?.gender ??
          login?.userGender ??
          login?.gender,
      );
      const postUserGender = rawUserGender === 2 ? 2 : 1;
      const userId =
        login?.user?.id || login?.userId || login?.id || state?.main?.userId;
      const currentResizeMode = state.video.selectedResize || 1;
      const targetGender =
        targetGenderArg ?? state?.video?.movieData?.targetGender;

      const selectedSubSubCategoryId = Number(
        subSubCategoryIdArg ??
          state?.video?.movieData?.subSubCategoryId ??
          1004,
      );

      let reqMatchToGender = 0;
      if (
        targetGender === "male" ||
        targetGender === 1 ||
        targetGender === "1"
      ) {
        reqMatchToGender = 1;
      } else if (
        targetGender === "female" ||
        targetGender === 2 ||
        targetGender === "2"
      ) {
        reqMatchToGender = 2;
      }

      const postData = {
        userId: Number(userId),
        resizeMode: currentResizeMode,
        description: allFormData?.description || movieMeta?.desc || "",
        title: allFormData?.title || movieMeta?.title || "",
        subSubCategoryId: selectedSubSubCategoryId,
        modeId: 3,
        userGender: postUserGender,
        reqMatchToGender,
      };

      const movieRes = await attachmentService.addMovie(postData);
      const movieDataRes = movieRes?.data?.data;
      if (movieRes?.data?.status !== 0) {
        throw new Error("Error in recording initial movie information");
      }

      const mediaFile = getCreateMediaFile();
      const videoFile = toBlob(allFormData?.video);
      let coverFile = toBlob(allFormData?.imageCover);
      const movieId = String(movieDataRes?.id);

      if (!coverFile && videoFile) {
        try {
          coverFile = await captureVideoCover(
            videoFile instanceof File
              ? videoFile
              : new File([videoFile], "video.mp4", { type: "video/mp4" }),
          );
        } catch (coverError) {
          console.error("Failed to capture video cover:", coverError);
        }
      }
      if (!coverFile && !videoFile) {
        coverFile = toBlob(allFormData?.image) || mediaFile;
      }

      const uploadAttachment = async (
        file: Blob,
        name: string,
        attachmentType: string,
        attachmentName: string,
      ) => {
        const formData = new FormData();
        formData.append("FormFile", file, name);
        formData.append("attachmentId", movieId);
        formData.append("attachmentType", attachmentType);
        formData.append("attachmentName", attachmentName);
        const attachRes = await attachmentService.addAttachment(formData);
        if (attachRes?.data?.status !== 0) {
          throw new Error("Error uploading attachments");
        }
      };

      if (!videoFile && !coverFile) {
        throw new Error("No video or cover file to upload");
      }

      if (videoFile) {
        const videoName = `${makeMovieAttachmentName("video", movieId)}${fileExtension(
          videoFile instanceof File ? videoFile.name : "video.mp4",
          ".mp4",
        )}`;
        await uploadAttachment(videoFile, videoName, "mo", "movies");
      }

      if (coverFile) {
        const coverName =
          coverFile instanceof File && /^cover_/i.test(coverFile.name)
            ? coverFile.name
            : `${makeCoverFileName(movieId)}.png`;
        await uploadAttachment(coverFile, coverName, "co", "covers");
      }

      const requestData = {
        parentId: null,
        userId: Number(userId),
        movieId: Number(movieDataRes?.id),
        status: 0,
        userGender: postUserGender,
        reqMatchToGender,
      };

      console.log("Test rerender from: video sliceee");
      const inviteRes = await attachmentService.addInvite(requestData);
      const inviteData = inviteRes?.data?.data;
      console.log("inviteRes inviteRes inviteRes", inviteRes?.data);
      dispatch(setNeedProfileRefresh(true));
      dispatch(RsetIsLoading(false));
      dispatch(setWaitingForMatch(true));
      dispatch(RsetShowTimerButtn(true));
      const emitInviteOffline = () => {
        socket.emit("register_user", userId);
        socket.emit("add_invite_offline", {
          ...inviteData,
          senderUserId: userId,
          userGender: postUserGender,
          reqMatchToGender,
        });
      };
      if (socket.connected) {
        emitInviteOffline();
      } else {
        socket.once("connect", emitInviteOffline);
        socket.connect();
      }

      const currentUserId = Number(userId);

      const notifyMatchedUser = async (rawReceiverId: any) => {
        const receiverUserId = Number(rawReceiverId);
        dispatch(
          RsetMessageModal({
            show: true,
            icon: "success",
            title: "Match found",
            message: MATCH_NOTIF.message,
            href: MATCH_NOTIF.url,
          }),
        );
        if (!receiverUserId || receiverUserId === currentUserId) {
          console.warn(
            "Could not resolve receiver userId for match notification",
            rawReceiverId,
          );
          return;
        }
        await notifyUserMatch(receiverUserId);
      };

      const handleReceiveInvite = async (data: any) => {
        stopMatchTimer();
        dispatch(setWaitingForMatch(false));
        dispatch(RsetShowTimerButtn(false));

        const receiverUserId =
          Number(data?.senderUserId) === currentUserId
            ? Number(data?.userId)
            : Number(data?.senderUserId);

        await notifyMatchedUser(receiverUserId);

        socket.off("receive_invite", handleReceiveInvite);
        router.replace("/profile");
      };

      socket.once("receive_invite", handleReceiveInvite);

      const matchedUserId = Number(
        inviteData?.userId ?? inviteData?.UserId ?? 0,
      );
      if (matchedUserId !== 0) {
        stopMatchTimer();
        router.replace("/profile");
        dispatch(setWaitingForMatch(false));
        dispatch(RsetShowTimerButtn(false));
        await notifyMatchedUser(matchedUserId);
        socket.off("receive_invite", handleReceiveInvite);
      } else {
        startMatchTimer(() => {
          socket.off("receive_invite", handleReceiveInvite);
          dispatch(setWaitingForMatch(false));
          dispatch(RsetShowTimerButtn(false));
          dispatch(setShowTimeout(true));
          router.replace("/watch");
        });
      }

      return {
        modeType: 3,
        movieData: movieDataRes,
        inviteData,
      };
    } catch (error: any) {
      stopMatchTimer();
      dispatch(RsetIsLoading(false));
      dispatch(setWaitingForMatch(false));
      dispatch(RsetShowTimerButtn(false));

      if (error?.response) {
        console.log("❌ Server Error Status:", error.response.status);
        console.log(
          "❌ Server Error Data:",
          JSON.stringify(error.response.data, null, 2),
        );
      } else if (error?.request) {
        console.log(
          "❌ Network / Timeout Error (No response received):",
          error.message,
        );
      } else {
        console.log("❌ Code/Runtime/Custom Error Message:", error.message);
        console.log("❌ Error Stack Trace:", error.stack);
      }

      const errorMessage =
        error.response?.data?.message ||
        error?.response?.data?.title ||
        error?.message ||
        "Upload failed";

      if (typeof window !== "undefined") {
        window.alert(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  },
);

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    RsetIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setVideoSrc(state, action: PayloadAction<string>) {
      state.videoSrc = action.payload;
    },
    setPreparedMedia(
      state,
      action: PayloadAction<{
        src: string;
        mimeType: string;
        fileName: string;
      }>,
    ) {
      state.videoSrc = action.payload.src;
      state.videoMimeType = action.payload.mimeType;
      state.videoFileName = action.payload.fileName;
    },
    setMovieData(state, action: PayloadAction<any>) {
      state.movieData = action?.payload;
    },
    RsetSelectedResize(state, action: PayloadAction<any>) {
      state.selectedResize = action?.payload;
    },
    setNeedProfileRefresh: (state, action) => {
      state.needProfileRefresh = action.payload;
    },
    setGearId: (state, action) => {
      state.gearId = action.payload;
    },
    updateMovieData(state, action: PayloadAction<Partial<any>>) {
      state.movieData = { ...state.movieData, ...action.payload };
    },
    resetVideoState: () => {
      clearCreateMediaFile();
      return initialState;
    },
    setMovieMeta: (state, action) => {
      state.movieData.title = action.payload.title ?? state.movieData.title;
      state.movieData.desc = action.payload.desc ?? state.movieData.desc;
      state.movieData.userId = action.payload.userId ?? state.movieData.userId;
    },
    goToStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setWaitingForMatch(state, action: PayloadAction<boolean>) {
      state.isWaitingForMatch = action.payload;
    },
    setShowTimeout(state, action: PayloadAction<boolean>) {
      state.showTimeout = action.payload;
    },
    setShowDeactivatedModal(state, action: PayloadAction<boolean>) {
      state.showDeactivatedModal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFullProcessThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadStatus = "idle";
      })
      .addCase(uploadFullProcessThunk.fulfilled, (state, action) => {
        state.uploadStatus = "success";
        state.isLoading = false;
        const movieData = action.payload?.movieData;
        const inviteData = action.payload?.inviteData;

        state.resMovieData = movieData;
        state.movieData.movieId = movieData?.id;
        if (inviteData) {
          state.movieData.inviteId = inviteData.id ?? inviteData.Id;
        }
      })
      .addCase(uploadFullProcessThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.uploadStatus = "failed";
        state.error = action.payload as string;
      })
      .addCase(removeInviteThunk.fulfilled, (state) => {
        state.movieData.inviteId = null;
      })
      .addCase(cancelMatchSearchThunk.fulfilled, (state) => {
        state.movieData.inviteId = null;
        state.isWaitingForMatch = false;
      });
  },
});

export const {
  resetVideoState,
  setMovieData,
  setMovieMeta,
  goToStep,
  setGearId,
  RsetIsLoading,
  updateMovieData,
  setVideoSrc,
  setPreparedMedia,
  RsetSelectedResize,
  setShowTimeout,
  setNeedProfileRefresh,
  setShowDeactivatedModal,
  setWaitingForMatch,
} = videoSlice.actions;

export default videoSlice.reducer;
