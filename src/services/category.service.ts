import { api } from "./axios.config";

export const categoryService = {
  list: () => api.get("/categoryList"),
  subCategories: (categoryId: number) =>
    api.get(`/subCategoryList?categoryId=${categoryId}`),
  subSubCategories: (subCatId: number) =>
    api.get(`/subSubCategoryList?subCategoryId=${subCatId}`),
};
