import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { RsetShowTimerButtn } from "./mainSlice";
import {
  startMatchTimer,
  stopMatchTimer,
} from "@/components/TimerForFindMatch";
import { socket } from "@/lib/socket";
import { attachmentService } from "@/services/attachment.service";
import { authService } from "@/services/auth.service";

const initialState: any = {
  needProfileRefresh: false,
  videoSrc: null,
  videoFile: null,
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

export const prepareVideoFileThunk = createAsyncThunk(
  "video/prepareFile",
  async (fileAsset: any) => {
    let src = "";
    if (typeof window !== "undefined") {
      if (fileAsset instanceof Blob || fileAsset instanceof File) {
        src = URL.createObjectURL(fileAsset);
      } else {
        src = fileAsset?.uri || "";
      }
    }
    return { file: fileAsset, src };
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
        state?.main?.userLogin?.user?.id || state?.main?.userLogin?.userId;
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

      // تنظیم ویدیو برای FormData وب (File/Blob)
      if (allFormData?.video) {
        if (
          typeof window !== "undefined" &&
          (allFormData.video instanceof File ||
            allFormData.video instanceof Blob)
        ) {
          formData.append(
            "FormFile",
            allFormData.video,
            (allFormData.video as File).name || "video.mp4",
          );
        } else {
          formData.append("FormFile", {
            uri: allFormData.video.uri,
            name: allFormData.video.name || "video.mp4",
            type: allFormData.video.type || "video/mp4",
          } as any);
        }
      }

      // تنظیم کاور برای FormData وب (File/Blob)
      if (allFormData?.imageCover) {
        if (
          typeof window !== "undefined" &&
          (allFormData.imageCover instanceof File ||
            allFormData.imageCover instanceof Blob)
        ) {
          formData.append(
            "FormFile",
            allFormData.imageCover,
            (allFormData.imageCover as File).name || "cover.png",
          );
        } else {
          formData.append("FormFile", {
            uri: allFormData.imageCover.uri,
            name: allFormData.imageCover.name || "cover.png",
            type: allFormData.imageCover.type || "image/png",
          } as any);
        }
      }

      formData.append("attachmentId", String(movieDataRes?.id));
      formData.append("attachmentType", "mo");
      formData.append("attachmentName", "movies");

      const attachRes = await attachmentService.addAttachment(formData);
      if (attachRes?.status !== 0) {
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
      dispatch(setNeedProfileRefresh(true));
      dispatch(RsetIsLoading(false));
      dispatch(RsetShowTimerButtn(true));
      socket.emit("register_user", userId);
      socket.emit("add_invite_offline", {
        ...inviteData,
        senderUserId: userId,
      });

      const currentUserId = Number(userId);

      const notifyMatchedUser = async (rawReceiverId: any) => {
        const receiverUserId = Number(rawReceiverId);
        if (!receiverUserId || receiverUserId === currentUserId) {
          return;
        }
        try {
          // const res = await attachmentService.sendUserNotif({
          //   userId: receiverUserId,
          //   message: "A match has been found for your video",
          // });
        } catch (error) {
          console.log("❌ Error sending match notification", error);
        }
      };

      const handleReceiveInvite = async (data: any) => {
        stopMatchTimer();
        dispatch(RsetShowTimerButtn(false));

        const receiverUserId =
          Number(data?.senderUserId) === currentUserId
            ? Number(data?.userId)
            : Number(data?.senderUserId);

        // await attachmentService.notifyMatchedUser(receiverUserId);

        socket.off("receive_invite", handleReceiveInvite);
        router.replace("/profile");
      };

      socket.once("receive_invite", handleReceiveInvite);

      if (inviteData?.userId !== 0) {
        stopMatchTimer();
        router.replace("/profile");
        dispatch(RsetShowTimerButtn(false));
        // await attachmentService.notifyMatchedUser(inviteData?.userId);

        socket.off("receive_invite", handleReceiveInvite);
      } else {
        startMatchTimer(() => {
          socket.off("receive_invite", handleReceiveInvite);
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
    resetVideoState: () => initialState,
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
      .addCase(prepareVideoFileThunk.fulfilled, (state, action) => {
        state.videoFile = action.payload.file;
        state.videoSrc = action.payload.src;
      })
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
  RsetSelectedResize,
  setShowTimeout,
  setNeedProfileRefresh,
  setShowDeactivatedModal,
} = videoSlice.actions;

export default videoSlice.reducer;
