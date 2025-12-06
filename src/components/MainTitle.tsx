import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface PropType {
  title: string;
  handleBack?: () => void;
}

const MainTitle: React.FC<PropType> = ({ title, handleBack }) => {
  return (
    <div className=" grid grid-cols-3 border-[1px] border-gray-150 bg-gray-100 pb-2 py-2  ">
      <span className="col-span-1 ms-4 flex items-center">
        {handleBack && (
          <ArrowBackIcon
            onClick={handleBack}
            className="text-primary font-bold font25"
          />
        )}
      </span>
      <span className=" ms-2 font15 col-span-1 flex justify-center items-center font-bold text-gray-800">
        {title}
      </span>
    </div>
  );
};

export default MainTitle;
