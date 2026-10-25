"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // برای Pages Router از "next/router" استفاده کنید
import { useAppDispatch } from "@/store/reduxHook";
import { Icon } from "@/components/Icon";
import asyncWrapper from "@/utils/asyncWrapper";
import SoftLink from "@/common/SoftLinks";
import { categoryService } from "@/services/category.service";
import MainTitle from "@/components/MainTitle"; // مسیر MainTitle پروژه خود را در صورت نیاز اصلاح کنید

interface GearProps {
  currentStep?: any;
  setCurrentStep: (step: number) => void;
  updateStepData: (stepIndex: number, data: { name: string; icon: string }) => void;
}

const Gear: React.FC<GearProps> = ({
  currentStep,
  setCurrentStep,
  updateStepData,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allSubSubCategory, setAllSubSubCategory] = useState<any[]>([]);
  const [arenaId, setArenaId] = useState<number | null>(null);

  // دریافت امن arenaId از localStorage پس از مانت شدن در مرورگر (جلوگیری از Hydration Error)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedArenaId = localStorage.getItem("arenaId");
      if (storedArenaId) {
        setArenaId(Number(storedArenaId));
      }
    }
  }, []);

  const handleGetCategory = asyncWrapper(async () => {
    setIsLoading(true);
    try {
      const res = await categoryService.subSubCategories(currentStep?.skill?.id);
      const { data, status } = res?.data || {};
      if (status === 0) {
        setAllSubSubCategory(data || []);
      }
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    handleGetCategory();
  }, [currentStep?.skill?.id]);

  const handleAcceptCategory = (data: any) => {
    if (arenaId !== 1002) {
      // dispatch(RsetCreateTalent({ gear: data }));
      setCurrentStep(4);
      updateStepData(3, { name: data.name, icon: data.icon });

      if (typeof window !== "undefined") {
        localStorage.setItem("gearId", data.id);
        localStorage.setItem("gearIconName", data.icon);
        localStorage.setItem("gearName", data.name);
      }
    } else if (arenaId === 1002) {
      router.push("/cup");
    }
  };

  const categoriesWithIcons = allSubSubCategory?.map((category: any) => ({
    ...category,
    icon: category.icon || category.name?.toLowerCase(),
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
    router.back();
  };

  return (
    <div className="lg:shadow-card">
      <MainTitle handleBack={handleBack} title="Gear" />
      <SoftLink
        iconMap={arenaIconMap}
        handleAcceptCategory={handleAcceptCategory}
        categories={categoriesWithIcons || []}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Gear;
