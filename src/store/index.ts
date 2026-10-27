import { configureStore } from "@reduxjs/toolkit";
import mainSlice from "./slices/mainSlice";
import videoSlice from "./slices/videoSlice";
import chatSlice from "./slices/chatSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      main: mainSlice,
      video: videoSlice,
      chat: chatSlice,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const store = makeStore();
