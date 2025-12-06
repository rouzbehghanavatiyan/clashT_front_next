import React, { useState } from "react";
import { Icon } from "@/components/Icon";
import { useAppSelector } from "@/store/reduxHook";
import SoftLink from "@/common/SoftLinks";
import MainTitle from "@/components/MainTitle";

const Arena: React.FC<any> = ({ updateStepData }) => {
  const main = useAppSelector((state) => state?.main);

  const handleAcceptCategory = (data: any) => {
    updateStepData(1, {
      name: data.name,
      id: data.id,
      icon: data.icon,
    });

    if (data.icon === "robot") {
      return;
    }

    localStorage.setItem("arenaId", data.id);
    localStorage.setItem("arenaIconName", data.icon);
    localStorage.setItem("arenaName", data.name);
  };

  const arenaIconMap = main?.category?.reduce((acc: any, category: any) => {
    if (category.icon) {
      acc[category.name.toLowerCase()] = <Icon name={category.icon} className="font25 mx-3" />;
    }
    return acc;
  }, {});

  const categoriesWithIcons = main?.category?.map((category: any) => ({
    ...category,
    icon: category.icon || category.name.toLowerCase(),
  }));

  return (
    <div className="lg:shadow-card">
      <MainTitle title="Arena" />
      <SoftLink
        iconMap={arenaIconMap} 
        handleAcceptCategory={handleAcceptCategory}
        categories={categoriesWithIcons || []}
      />
    </div>
  );
};

export default Arena;