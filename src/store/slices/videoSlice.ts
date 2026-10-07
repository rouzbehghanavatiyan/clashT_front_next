import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { authService } from "@/services/auth.service";

type VideoSliceTypes = {
  needProfileRefresh?: boolean;
};

const initialState: VideoSliceTypes = {
  needProfileRefresh: false,
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

const videoSlice = createSlice({
  name: "video",
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
    setNeedProfileRefresh: (state, action) => {
      state.needProfileRefresh = action.payload;
    },
    // extraReducers: (builder) => {
    //   builder
    //     .addCase(loginUser.pending, (state) => {
    //       state.loading = true;
    //       state.error = null;
    //     })
    //     .addCase(loginUser.fulfilled, (state, action) => {
    //       state.loading = false;
    //       state.token = action.payload.token;
    //       state.user = action.payload.user;

    //       if (typeof window !== "undefined") {
    //         localStorage.setItem("token", action.payload.token);
    //       }
    //     })
    //     .addCase(loginUser.rejected, (state, action) => {
    //       state.loading = false;
    //       state.error = action.payload as string;
    //     });
  },
});

export const { setNeedProfileRefresh } = videoSlice.actions;

export default videoSlice.reducer;
