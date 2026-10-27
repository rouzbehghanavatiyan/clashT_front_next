import { store } from "@/store";
import { RsetLoading } from "@/store/slices/mainSlice";

const asyncWrapper = (fn: any) => {
  return (...args: any) => {
    return fn(...args).catch((error: Error) => {
      store.dispatch(RsetLoading({ value: false }));
      console.error(error);
      throw error;
    });
  };
};

export default asyncWrapper;
