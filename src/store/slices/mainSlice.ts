import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { authService } from "@/services/auth.service";

type MessageModal = {
  title?: string;
  show?: boolean;
  icon?: string;
};

const initialState: any = {
  user: null,
  createTalent: {},
  token: null,
  loading: false,
  error: null,
  userLogin: {},
  showLoading: {},
  watchVideo: {
    pagination: {
      take: 6,
      skip: 0,
      hasMore: true,
    },
    data: [],
  },
  homeMatch: {
    pagination: {
      take: 6,
      skip: 0,
      hasMore: true,
    },
    data: [],
  },
  showWatchMatch: {
    pagination: {
      take: 6,
      skip: 0,
      hasMore: true,
    },
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
    thunkAPI
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
        err.response?.data?.message || "Server error"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    RsetShowWatch: (state: any, action: PayloadAction<any>) => {
      if (Array.isArray(action.payload)) {
        state.showWatchMatch.data = [
          ...state.showWatchMatch.data,
          ...action.payload,
        ];
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
    RsetUserLogin: (state, action: PayloadAction<any>) => {
      // state.userLogin = { ...state.userLogin, ...action.payload };
      state.userLogin = action.payload;
    },
    RsetLoading: (
      state,
      action: PayloadAction<{ btnName?: string | number; value?: boolean }>
    ) => {
      state.showLoading = action.payload;
    },
    RsetMessageModal: (state, action: PayloadAction<MessageModal>) => {
      state.messageModal = action.payload;
    },
    setPaginationShowWatch: (
      state,
      action: PayloadAction<{ take: number; skip: number; hasMore: boolean }>
    ) => {
      state.showWatchMatch.pagination = action.payload;
    },
    RsetHomeMatch: (state, action: PayloadAction<any[]>) => {
      if (Array.isArray(action.payload)) {
        state.homeMatch.data = [...state.homeMatch.data, ...action.payload];
      }
    },
    RsetCreateTalent: (state, action: PayloadAction<any>) => {
      state.createTalent = action.payload;
    },
    setPaginationHomeMatch: (
      state,
      action: PayloadAction<{ take: number; skip: number; hasMore: boolean }>
    ) => {
      state.homeMatch.pagination = action.payload;
    },
    resetShowWatchState: (state) => {
      state.showWatchMatch = {
        pagination: {
          take: 6,
          skip: 0,
          hasMore: true,
        },
        data: [],
      };
    },
    updateLikeStatus: (
      state,
      action: PayloadAction<{
        movieId: string;
        isLiked: boolean;
        positionVideo?: number;
      }>
    ) => {
      const { movieId, isLiked, positionVideo } = action.payload;
      state.showWatchMatch.data = state.showWatchMatch.data.map(
        (video: any) => {
          const videoCopy = { ...video };

          if (!videoCopy.likes) {
            videoCopy.likes = {};
          }

          if (!videoCopy.likes[movieId]) {
            videoCopy.likes[movieId] = { isLiked: false, count: 0 };
          }
          videoCopy.likes[movieId] = {
            ...videoCopy.likes[movieId],
            isLiked: isLiked,
          };

          return videoCopy;
        }
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;

        if (typeof window !== "undefined") {
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setToken,
  logout,
  RsetUserLogin,
  RsetMessageModal,
  resetShowWatchState,
  RsetShowWatch,
  setPaginationShowWatch,
  RsetHomeMatch,
  setPaginationHomeMatch,
  updateLikeStatus,
  RsetLoading,
  RsetCreateTalent,
} = authSlice.actions;

export default authSlice.reducer;
