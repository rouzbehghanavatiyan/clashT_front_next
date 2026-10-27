import { configureStore } from "@reduxjs/toolkit";
import mainSlice from "./slices/mainSlice";
import videoSlice from "./slices/videoSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      main: mainSlice,
      video: videoSlice,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const store = makeStore();
