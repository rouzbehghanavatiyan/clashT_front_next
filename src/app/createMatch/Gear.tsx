import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RsetCreateTalent } from "@/store/slices/mainSlice";
import { useAppDispatch } from "@/store/reduxHook";
import { Icon } from "@/components/Icon";
import asyncWrapper from "@/utils/asyncWrapper";
import SoftLink from "@/common/SoftLinks";
import { categoryService } from "@/services/category.service";

const Gear: React.FC<any> = ({
  currentStep,
  setCurrentStep,
  updateStepData,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [allSubSubCategory, setAllSubSubCategory] = useState<any>();
  const arenaId = Number(localStorage.getItem("arenaId"));

  const handleGetCategory = asyncWrapper(async () => {
    setIsLoading(true);
    const res = await categoryService.subSubCategoryList(
      currentStep?.skill?.id
    );
    setIsLoading(false);
    const { data, status } = res?.data;
    if (status === 0) {
      setAllSubSubCategory(data || []);
    }
  });

  useEffect(() => {
    handleGetCategory();
  }, []);

  const handleAcceptCategory = (data: any) => {
    if (arenaId !== 1002) {
      dispatch(RsetCreateTalent({ gear: data }));
      setCurrentStep(4);
      updateStepData(3, { name: data.name, icon: data.icon });
      localStorage.setItem("gearId", data.id);
      localStorage.setItem("gearIconName", data.icon);
      localStorage.setItem("gearName", data.name);
    } else if (arenaId === 1002) {
      navigate("/cup");
    }
  };

  const categoriesWithIcons = allSubSubCategory?.map((category: any) => ({
    ...category,
    icon: category.icon || category.name.toLowerCase(),
  }));

  const arenaIconMap = allSubSubCategory?.reduce((acc: any, category: any) => {
    if (category.icon) {
      acc[category.name.toLowerCase()] = (
        <Icon name={category.icon} className="font25 mx-3" />
      );
    }
    return acc;
  }, {});
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="lg:shadow-card">
      <MainTitle handleBack={handleBack} title="Gear" />
      <SoftLink
        iconMap={arenaIconMap}
        handleAcceptCategory={handleAcceptCategory}
        categories={categoriesWithIcons || []}
        isLoading={false}
      />
    </div>
  );
};

export default Gear;
