import React, { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import asyncWrapper from "@/utils/asyncWrapper";
import MainTitle from "@/components/MainTitle";
import SoftLink from "@/common/SoftLinks";
import { categoryService } from "@/services/category.service";

const Skill: React.FC<any> = ({
  setAllSubCategory,
  allSubCategory,
  currentStep,
  updateStepData,
}) => {
  const [isLoading, setIsLoading] = useState<any>(false);

  const handleGetCategory = asyncWrapper(async () => {
    setIsLoading(true);
    const res = await categoryService.subCategoryList(currentStep?.arena?.id);
    console.log("subCategoryList", res);

    setIsLoading(false);
    const { data, status } = res?.data;
    if (status === 0) {
      setAllSubCategory(data || []);
    }
  });

  const handleAcceptCategory = (data: any) => {
    updateStepData(2, {
      name: data.name,
      id: data.id,
      icon: data.icon,
    });

    localStorage.setItem("skillId", data.id);
    localStorage.setItem("skillIconName", data.icon);
    localStorage.setItem("skillName", data.name);
  };

  useEffect(() => {
    handleGetCategory();
  }, []);

  const categoriesWithIcons = allSubCategory?.map((category: any) => ({
    ...category,
    icon: category.icon || category.name.toLowerCase(),
  }));

  console.log(allSubCategory);
  const arenaIconMap = allSubCategory?.reduce((acc: any, category: any) => {
    if (category.icon) {
      acc[category.name.toLowerCase()] = (
        <Icon name={category.icon} className="font25 mx-3" />
      );
    }
    return acc;
  }, {});

  return (
    <div className=" lg:shadow-card">
      <MainTitle title="Skill" />
      <SoftLink
        iconMap={arenaIconMap}
        handleAcceptCategory={handleAcceptCategory}
        categories={categoriesWithIcons || []}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Skill;
