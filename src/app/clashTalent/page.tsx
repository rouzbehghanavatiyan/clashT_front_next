// "use client";

// import React, { useEffect, useState } from "react";
// import Arena from "./Arena";
// import { Icon } from "@/components/Icon";
// import { categoryService } from "@/services/category.service";
// import { miscService } from "@/services/misc.service";
// import Skill from "./Skill";
// import Gear from "./Gear";

// interface StepData {
//   title: string;
//   icon: string;
//   session: "Arena" | "Skill" | "Gear" | "Mode";
// }

// interface CurrentStep {
//   number: number;
//   arena: any | null;
//   skill: any | null;
//   gear: any | null;
//   mode: any | null;
// }

// const CreateMatchPage: React.FC = () => {
//   const [stepsData, setStepsData] = useState<StepData[]>([
//     { title: "", icon: "", session: "Arena" },
//     { title: "", icon: "", session: "Skill" },
//     { title: "", icon: "", session: "Gear" },
//     { title: "", icon: "", session: "Mode" },
//   ]);

//   const [allSubCategory, setAllSubCategory] = useState<any[]>([]);
//   const [currentStep, setCurrentStep] = useState<CurrentStep>({
//     number: 1,
//     arena: null,
//     skill: null,
//     gear: null,
//     mode: null,
//   });

//   const updateStepData = (stepNumber: number, data: any) => {
//     setStepsData((prev) =>
//       prev.map((step, index) =>
//         index === stepNumber - 1
//           ? { title: data.name, icon: data.icon, session: step.session }
//           : step
//       )
//     );

//     setCurrentStep((prev) => ({
//       ...prev,
//       [stepNumber === 1
//         ? "arena"
//         : stepNumber === 2
//         ? "skill"
//         : stepNumber === 3
//         ? "gear"
//         : "mode"]: data,
//       number: stepNumber + 1,
//     }));
//   };

//   const renderCurrentStep = () => {
//     switch (currentStep.number) {
//       case 1:
//         return (
//           <Arena
//             allSubCategory={allSubCategory}
//             setAllSubCategory={setAllSubCategory}
//             currentStep={currentStep}
//             setCurrentStep={setCurrentStep}
//             updateStepData={updateStepData}
//           />
//         );
//       case 2:
//         return (
//           <Skill
//             allSubCategory={allSubCategory}
//             setAllSubCategory={setAllSubCategory}
//             currentStep={currentStep}
//             setCurrentStep={setCurrentStep}
//             updateStepData={updateStepData}
//           />
//         );
//       case 3:
//         return (
//           <Gear
//             currentStep={currentStep}
//             setCurrentStep={setCurrentStep}
//             updateStepData={updateStepData}
//           />
//         );
//       case 4:
//         return (
//           <Mode
//             currentStep={currentStep}
//             setCurrentStep={setCurrentStep}
//             updateStepData={updateStepData}
//           />
//         );
//       default:
//         return (
//           <Mode
//             currentStep={currentStep}
//             setCurrentStep={setCurrentStep}
//             updateStepData={updateStepData}
//           />
//         );
//     }
//   };

//   const checkChoiceSot = async () => {
//     if (typeof window === "undefined") return; // فقط client

//     try {
//       const arenaId = localStorage.getItem("arenaId");
//       const skillId = localStorage.getItem("skillId");
//       const gearId = localStorage.getItem("gearId");

//       const arenaIconName = localStorage.getItem("arenaIconName");
//       const skillIconName = localStorage.getItem("skillIconName");
//       const gearIconName = localStorage.getItem("gearIconName");

//       const arenaName = localStorage.getItem("arenaName");
//       const skillName = localStorage.getItem("skillName");
//       const gearName = localStorage.getItem("gearName");

//       if (arenaId) {
//         const res = await categoryService.subCategoryList(arenaId);
//         const { data, status } = res?.data || {};
//         if (status === 0) {
//           setAllSubCategory(data || []);
//           const arenaData = data.find(
//             (item: any) => item.id === parseInt(arenaId)
//           );
//           setCurrentStep((prev) => ({ ...prev, number: 2, arena: arenaData }));
//           setStepsData((prev) => [
//             {
//               title: arenaName || "",
//               icon: arenaIconName || "",
//               session: "Arena",
//             },
//             prev[1],
//             prev[2],
//             prev[3],
//           ]);
//         }
//       }

//       if (arenaId && skillId) {
//         const res = await categoryService.subSubCategoryList(skillId);
//         const { data, status } = res?.data || {};
//         if (status === 0) {
//           setAllSubCategory(data || []);
//           const skillData = data.find(
//             (item: any) => item.id === parseInt(skillId)
//           );
//           setCurrentStep((prev) => ({ ...prev, number: 3, skill: skillData }));
//           setStepsData((prev) => [
//             prev[0],
//             {
//               title: skillName || "",
//               icon: skillIconName || "",
//               session: "Skill",
//             },
//             prev[2],
//             prev[3],
//           ]);
//         }
//       }

//       if (arenaId && skillId && gearId) {
//         const res = await miscService.modeList();
//         const { data, status } = res?.data || {};
//         if (status === 0) {
//           setAllSubCategory(data || []);
//           const gearData = data.find(
//             (item: any) => item.id === parseInt(gearId)
//           );
//           setCurrentStep((prev) => ({ ...prev, number: 4, gear: gearData }));
//           setStepsData((prev) => [
//             prev[0],
//             prev[1],
//             {
//               title: gearName || "",
//               icon: gearIconName || "",
//               session: "Gear",
//             },
//             prev[3],
//           ]);
//         }
//       }
//     } catch (error) {
//       console.error("خطا در بررسی ذخیره‌سازی:", error);
//     }
//   };

//   useEffect(() => {
//     checkChoiceSot();
//   }, []);

//   return (
//     <div className="h-[calc(100svh-100px)] md:h-[calc(100vh-65px)]">
//       <div className="mt-3">
//         <div className="ms-2 flex gap-3 items-center justify-center">
//           <input
//             id="remember-me"
//             name="remember-me"
//             type="checkbox"
//             className="h-4 w-4 text-blue-600 focus:text-soft_blue border-gray-300 rounded"
//           />
//           <label className="font12 font-bold">Remember talent</label>
//         </div>
//       </div>

//       <section className="mt-3 gap-10 flex flex-col justify-center items-center">
//         <div className="flex gap-4 overflow-auto">
//           {stepsData.map((step, index) => (
//             <div key={index} className="flex flex-col items-center">
//               <div
//                 className={`w-14 h-14 rounded-full cursor-pointer ${
//                   index < currentStep.number ? "bg-green" : "bg-gray-200"
//                 }`}
//                 onClick={() =>
//                   setCurrentStep({ ...currentStep, number: index + 1 })
//                 }
//               >
//                 <div className="h-full flex font8 text-white flex-col items-center justify-center">
//                   <Icon name={step.icon} className="font20" />
//                   <span className="font10 font-bold">{step.title}</span>
//                 </div>
//               </div>
//               <span className="text-xs font11 text-gray-600">
//                 {["Arena", "Skill", "Gear", "Mode"][index]}
//               </span>
//             </div>
//           ))}
//         </div>
//       </section>

//       <div>{renderCurrentStep()}</div>
//     </div>
//   );
// };

// export default CreateMatchPage;



"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type MatchGender = "random" | "male" | "female";

interface ActivityOption {
  label: string;
  value: string;
  id: number;
  icon: string;
}

interface CreateMatchPageProps {
  videoSrc?: string;
  coverImage?: string;
  movieData?: any;
  isLoading?: boolean;
  onAccept?: (gender: MatchGender, activity: string, categoryId: number) => void;
  onCancel?: () => void;
}

const activityOptions: ActivityOption[] = [
  { label: "Ball Sports", id: 1010, value: "ball_sports", icon: "⚽" },
  { label: "Fitness & Gym", id: 1004, value: "fitness", icon: "🏋️" },
  { label: "Combat & Boxing", id: 1011, value: "combat", icon: "🥊" },
  { label: "Street & Urban", id: 2040, value: "urban", icon: "🛹" },
  { label: "Other Sports", id: 2041, value: "otherSport", icon: "🎯" },
];

const genderOptions: { label: string; value: MatchGender; desc: string }[] = [
  { label: "Random Match", value: "random", desc: "Open to all contenders" },
  { label: "Male Opponents", value: "male", desc: "Matched with males only" },
  { label: "Female Opponents", value: "female", desc: "Matched with females only" },
];

const CreateMatchPage: React.FC<CreateMatchPageProps> = ({
  videoSrc,
  coverImage,
  movieData,
  isLoading = false,
  onAccept,
  onCancel,
}) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [selectedGender, setSelectedGender] = useState<MatchGender>("random");
  const [selectedActivity, setSelectedActivity] = useState<ActivityOption | null>(null);
  const [activityError, setActivityError] = useState(false);

  const handleStartMatch = () => {
    if (!selectedActivity) {
      setActivityError(true);
      return;
    }

    if (onAccept) {
      onAccept(selectedGender, selectedActivity.value, selectedActivity.id);
    } else {
      console.log("Match Configured:", {
        gender: selectedGender,
        activity: selectedActivity.value,
        id: selectedActivity.id,
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/home");
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100 flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-6xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Top Header Bar */}
        <header className="px-8 py-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Setup Your Clash Match
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 mt-1">
              Review your talent video, configure rules, and challenge opponents.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ready to Publish
          </div>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column: Video Preview */}
          <section className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between gap-6 bg-slate-950/40">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                Video Preview
              </span>

              <div className="relative aspect-[9/14] sm:aspect-video lg:aspect-[4/5] w-full bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner group">
                {videoSrc ? (
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : coverImage ? (
                  <img
                    src={coverImage}
                    alt="Video Cover"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-3 p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-300">
                        No Preview Available
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Maximum video duration: 60 seconds
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                ✓
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-200">Strict Match Rule</p>
                <p className="text-slate-400 mt-0.5">
                  Opponents will have 120s to respond once this match begins.
                </p>
              </div>
            </div>
          </section>

          {/* Right Column: Configuration Controls */}
          <section className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between gap-8">
            <div className="space-y-8">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  1. Match Topic / Sport Category
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activityOptions.map((item) => {
                    const isSelected = selectedActivity?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedActivity(item);
                          setActivityError(false);
                        }}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${isSelected
                            ? "bg-emerald-600/10 border-emerald-500 ring-2 ring-emerald-500/30 text-white"
                            : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                      >
                        <span className="text-2xl mb-2">{item.icon}</span>
                        <span className="text-sm font-semibold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {activityError && (
                  <p className="mt-2 text-xs text-rose-400 font-medium flex items-center gap-1">
                    <span>⚠</span> Please select a topic before continuing.
                  </p>
                )}
              </div>

              {/* Match Gender Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  2. Opponent Preferences
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {genderOptions.map((item) => {
                    const isSelected = selectedGender === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSelectedGender(item.value)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${isSelected
                            ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/30 text-white"
                            : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                      >
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleStartMatch}
                className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Launch Match</span>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default CreateMatchPage;

