import { configureStore } from "@reduxjs/toolkit";
import mainSlice from "./slices/mainSlice";
import videoSlice from "./slices/videoSlice";

export const store = configureStore({
  reducer: {
    main: mainSlice,
    video: videoSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
