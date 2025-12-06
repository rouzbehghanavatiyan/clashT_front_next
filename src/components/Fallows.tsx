import React from "react";

interface PropTypes {
  onFollowClick: any;
  title: string;
  bgColor: string;
}

const Follows: React.FC<PropTypes> = ({
  onFollowClick,
  title,
  bgColor = "text-white",
}) => {
  return (
    <div className="flex  justify-center items-center">
      <span
        onClick={onFollowClick}
        className={`p-1 border-b-2 px-3 ${bgColor}  font-bold font12 rounded-lg cursor-pointer `}
      >
        {title}
      </span>
    </div>
  );
};

export default Follows;
