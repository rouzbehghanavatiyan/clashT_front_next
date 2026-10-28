import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { RsetShowTimerButtn } from "./mainSlice";
import {
  startMatchTimer,
  stopMatchTimer,
} from "@/components/TimerForFindMatch";
import { socket } from "@/lib/socket";
import { attachmentService } from "@/services/attachment.service";
import { sendUserNotif } from "@/services/notify.service";
import { authService } from "@/services/auth.service";
import {
  cancelPendingInvite,
  keepMatchedInvite,
  setMatchReceiveHandler,
  setPendingInviteId,
} from "@/utils/pendingInvite";
import { clearCreateMediaFile, getCreateMediaFile } from "@/utils/createMediaFile";

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
    const inviteId =
      Number(state?.video?.movieData?.inviteId) || undefined;
    await cancelPendingInvite({ inviteId });
    dispatch(setWaitingForMatch(false));
    dispatch(RsetShowTimerButtn(false));
    dispatch(updateMovieData({ inviteId: null }));
  },
);

export const uploadFullProcessThunk = createAsyncThunk(
  "video/uploadFullProcess",
  async (
    { segments, mode, allFormData, movieMeta, router }: any,
    { rejectWithValue, dispatch, getState },
  ) => {
    try {
      const state = getState() as any;
      const userGender = state?.main?.userLogin?.user?.userGender;
      const userId =
        state?.main?.userLogin?.user?.id ||
        state?.main?.userLogin?.userId ||
        state?.main?.userId;
      const currentResizeMode = state.video.selectedResize || 1;
      const targetGender = state?.video?.movieData?.targetGender;

      const selectedSubSubCategoryId =
        state?.video?.movieData?.subSubCategoryId || 1004;

      let reqMatchToGender = 1;

      if (targetGender === "male") {
        reqMatchToGender = 1;
      } else if (targetGender === "female") {
        reqMatchToGender = 2;
      } else {
        reqMatchToGender = Math.floor(Math.random() * 5) + 1;
      }

      const postData = {
        userId: Number(userId),
        resizeMode: currentResizeMode,
        description: allFormData?.description || movieMeta?.desc || "",
        title: allFormData?.title || movieMeta?.title || "",
        subSubCategoryId: Number(selectedSubSubCategoryId),
        modeId: 3,
        userGender: userGender || 1,
        reqMatchToGender: reqMatchToGender || 94,
      };

      const movieRes = await attachmentService.addMovie(postData);
      const movieDataRes = movieRes?.data?.data;
      if (movieRes?.data?.status !== 0) {
        throw new Error("Error in recording initial movie information");
      }

      const formData = new FormData();
      const mediaFile = getCreateMediaFile();
      const mimeType = state.video.videoMimeType || mediaFile?.type || "";
      const fileName =
        state.video.videoFileName ||
        mediaFile?.name ||
        (mimeType.startsWith("image/") ? "cover.png" : "video.mp4");

      if (mediaFile) {
        formData.append("FormFile", mediaFile, fileName);
      } else if (allFormData?.video || allFormData?.imageCover) {
        const fallback = allFormData.video || allFormData.imageCover;
        if (fallback instanceof File || fallback instanceof Blob) {
          formData.append(
            "FormFile",
            fallback,
            (fallback as File).name || fileName,
          );
        }
      }

      formData.append("attachmentId", String(movieDataRes?.id));
      formData.append("attachmentType", "mo");
      formData.append("attachmentName", "movies");

      const attachRes = await attachmentService.addAttachment(formData);
      if (attachRes?.data?.status !== 0) {
        throw new Error("Error uploading attachments");
      }

      const requestData = {
        parentId: null,
        userId: Number(userId),
        movieId: Number(movieDataRes?.id),
        status: 0,
      };

      console.log("Test rerender from: video sliceee");
      const inviteRes = await attachmentService.addInvite(requestData);
      const inviteData = inviteRes?.data?.data;
      console.log("inviteRes", inviteRes?.data);
      const pendingInviteId = Number(inviteData?.id);
      dispatch(updateMovieData({ inviteId: pendingInviteId || null }));
      if (pendingInviteId) setPendingInviteId(pendingInviteId);
      dispatch(setNeedProfileRefresh(true));
      dispatch(RsetIsLoading(false));
      dispatch(setWaitingForMatch(true));
      dispatch(RsetShowTimerButtn(true));
      if (!socket.connected) socket.connect();
      socket.emit("register_user", userId);
      socket.emit("add_invite_offline", {
        ...inviteData,
        senderUserId: userId,
      });

      const currentUserId = Number(userId);

      const notifyMatchedUser = async (rawReceiverId: any) => {
        const receiverUserId = Number(rawReceiverId);
        if (!receiverUserId || receiverUserId === currentUserId) {
          console.warn(
            "Could not resolve receiver userId for match notification",
            rawReceiverId,
          );
          return;
        }
        try {
          await sendUserNotif({
            userId: receiverUserId,
            message: "A match has been found for your video",
          });
        } catch (error) {
          console.log("Error sending match notification", error);
        }
      };

      const handleReceiveInvite = async (data: any) => {
        keepMatchedInvite();
        dispatch(setWaitingForMatch(false));
        dispatch(RsetShowTimerButtn(false));

        const receiverUserId =
          Number(data?.senderUserId) === currentUserId
            ? Number(data?.userId)
            : Number(data?.senderUserId);

        await notifyMatchedUser(receiverUserId);

        router.replace("/profile");
      };

      setMatchReceiveHandler(handleReceiveInvite);

      if (inviteData?.userId !== 0) {
        keepMatchedInvite();
        dispatch(setWaitingForMatch(false));
        dispatch(RsetShowTimerButtn(false));
        await notifyMatchedUser(inviteData?.userId);
        router.replace("/profile");
      } else {
        startMatchTimer(() => {
          void cancelPendingInvite({ inviteId: pendingInviteId });
          dispatch(setWaitingForMatch(false));
          dispatch(RsetShowTimerButtn(false));
          dispatch(setShowTimeout(true));
          dispatch(updateMovieData({ inviteId: null }));

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
      void cancelPendingInvite();
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
      action: PayloadAction<{ src: string; mimeType: string; fileName: string }>,
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
          state.movieData.inviteId = inviteData.id;
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
