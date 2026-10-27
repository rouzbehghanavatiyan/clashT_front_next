import { api } from "./axios.config";

export const subCategoryList = async (
  categoryId: number | string | null | undefined,
) => {
  return await api.get("/subCategoryList", {
    params: { categoryId },
  });
};

export const categoryService = {
  list: () => api.get("/categoryList"),
  subCategoryList,
  subCategories: subCategoryList,
  subSubCategories: (subCatId: number) =>
    api.get(`/subSubCategoryList?subCategoryId=${subCatId}`),
};
