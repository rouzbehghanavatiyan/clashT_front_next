"use client";

import React, { useEffect, useState } from "react";
import Arena from "./Arena";
import { Icon } from "@/components/Icon";
import { categoryService } from "@/services/category.service";
import { miscService } from "@/services/misc.service";
import Skill from "./Skill";
import Gear from "./Gear";

interface StepData {
  title: string;
  icon: string;
  session: "Arena" | "Skill" | "Gear" | "Mode";
}

interface CurrentStep {
  number: number;
  arena: any | null;
  skill: any | null;
  gear: any | null;
  mode: any | null;
}

const CreateMatchPage: React.FC = () => {
  const [stepsData, setStepsData] = useState<StepData[]>([
    { title: "", icon: "", session: "Arena" },
    { title: "", icon: "", session: "Skill" },
    { title: "", icon: "", session: "Gear" },
    { title: "", icon: "", session: "Mode" },
  ]);

  const [allSubCategory, setAllSubCategory] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<CurrentStep>({
    number: 1,
    arena: null,
    skill: null,
    gear: null,
    mode: null,
  });

  const updateStepData = (stepNumber: number, data: any) => {
    setStepsData((prev) =>
      prev.map((step, index) =>
        index === stepNumber - 1
          ? { title: data.name, icon: data.icon, session: step.session }
          : step
      )
    );

    setCurrentStep((prev) => ({
      ...prev,
      [stepNumber === 1
        ? "arena"
        : stepNumber === 2
        ? "skill"
        : stepNumber === 3
        ? "gear"
        : "mode"]: data,
      number: stepNumber + 1,
    }));
  };

  const renderCurrentStep = () => {
    switch (currentStep.number) {
      case 1:
        return (
          <Arena
            allSubCategory={allSubCategory}
            setAllSubCategory={setAllSubCategory}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            updateStepData={updateStepData}
          />
        );
      case 2:
        return (
          <Skill
            allSubCategory={allSubCategory}
            setAllSubCategory={setAllSubCategory}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            updateStepData={updateStepData}
          />
        );
      case 3:
        return (
          <Gear
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            updateStepData={updateStepData}
          />
        );
      case 4:
        return (
          <Mode
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            updateStepData={updateStepData}
          />
        );
      default:
        return (
          <Mode
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            updateStepData={updateStepData}
          />
        );
    }
  };

  const checkChoiceSot = async () => {
    if (typeof window === "undefined") return; // فقط client

    try {
      const arenaId = localStorage.getItem("arenaId");
      const skillId = localStorage.getItem("skillId");
      const gearId = localStorage.getItem("gearId");

      const arenaIconName = localStorage.getItem("arenaIconName");
      const skillIconName = localStorage.getItem("skillIconName");
      const gearIconName = localStorage.getItem("gearIconName");

      const arenaName = localStorage.getItem("arenaName");
      const skillName = localStorage.getItem("skillName");
      const gearName = localStorage.getItem("gearName");

      if (arenaId) {
        const res = await categoryService.subCategoryList(arenaId);
        const { data, status } = res?.data || {};
        if (status === 0) {
          setAllSubCategory(data || []);
          const arenaData = data.find(
            (item: any) => item.id === parseInt(arenaId)
          );
          setCurrentStep((prev) => ({ ...prev, number: 2, arena: arenaData }));
          setStepsData((prev) => [
            {
              title: arenaName || "",
              icon: arenaIconName || "",
              session: "Arena",
            },
            prev[1],
            prev[2],
            prev[3],
          ]);
        }
      }

      if (arenaId && skillId) {
        const res = await categoryService.subSubCategoryList(skillId);
        const { data, status } = res?.data || {};
        if (status === 0) {
          setAllSubCategory(data || []);
          const skillData = data.find(
            (item: any) => item.id === parseInt(skillId)
          );
          setCurrentStep((prev) => ({ ...prev, number: 3, skill: skillData }));
          setStepsData((prev) => [
            prev[0],
            {
              title: skillName || "",
              icon: skillIconName || "",
              session: "Skill",
            },
            prev[2],
            prev[3],
          ]);
        }
      }

      if (arenaId && skillId && gearId) {
        const res = await miscService.modeList();
        const { data, status } = res?.data || {};
        if (status === 0) {
          setAllSubCategory(data || []);
          const gearData = data.find(
            (item: any) => item.id === parseInt(gearId)
          );
          setCurrentStep((prev) => ({ ...prev, number: 4, gear: gearData }));
          setStepsData((prev) => [
            prev[0],
            prev[1],
            {
              title: gearName || "",
              icon: gearIconName || "",
              session: "Gear",
            },
            prev[3],
          ]);
        }
      }
    } catch (error) {
      console.error("خطا در بررسی ذخیره‌سازی:", error);
    }
  };

  useEffect(() => {
    checkChoiceSot();
  }, []);

  return (
    <div className="h-[calc(100svh-100px)] md:h-[calc(100vh-65px)]">
      <div className="mt-3">
        <div className="ms-2 flex gap-3 items-center justify-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:text-soft_blue border-gray-300 rounded"
          />
          <label className="font12 font-bold">Remember talent</label>
        </div>
      </div>

      <section className="mt-3 gap-10 flex flex-col justify-center items-center">
        <div className="flex gap-4 overflow-auto">
          {stepsData.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-14 h-14 rounded-full cursor-pointer ${
                  index < currentStep.number ? "bg-green" : "bg-gray-200"
                }`}
                onClick={() =>
                  setCurrentStep({ ...currentStep, number: index + 1 })
                }
              >
                <div className="h-full flex font8 text-white flex-col items-center justify-center">
                  <Icon name={step.icon} className="font20" />
                  <span className="font10 font-bold">{step.title}</span>
                </div>
              </div>
              <span className="text-xs font11 text-gray-600">
                {["Arena", "Skill", "Gear", "Mode"][index]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div>{renderCurrentStep()}</div>
    </div>
  );
};

export default CreateMatchPage;
