import React, { useState, useEffect } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { userService } from "@/services/user.service";
import StringHelpers from "@/utils/StringHelpers";
import Dropdown from "@/components/DropDown";
import ImageRank from "@/components/ImageRank";
import Follows from "@/components/Follows";

const OptionTop: React.FC<any> = ({
  video,
  positionVideo,
  openDropdowns,
  score,
  setOpenDropdowns,
  toggleDropdown,
  dropdownItems,
  userIdLogin,
  main,
}) => {
  const profile =
    positionVideo === 0
      ? StringHelpers?.getProfile(video?.profileInserted)
      : StringHelpers?.getProfile(video?.profileMatched);
  const [localIsFollowed, setLocalIsFollowed] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const userInfo =
    positionVideo === 0 ? video?.userInserted : video?.userMatched;

  const checkMyVideo = userInfo?.id !== main?.userLogin?.user?.id;

  useEffect(() => {
    const getInitialFollowStatus = () => {
      if (positionVideo === 0) {
        return video?.isFollowedMeInserted === true;
      } else {
        return video?.isFollowedMeMatched === true;
      }
    };

    setLocalIsFollowed(getInitialFollowStatus());
  }, [video, positionVideo]);

  const handleFallowClick = async (video: any, position: number) => {
    if (isLoadingFollow) return;
    const userIdFollow =
      position === 0 ? video?.userInserted?.id : video?.userMatched?.id;
    const postData = {
      userId: userIdLogin || null,
      followerId: userIdFollow || null,
    };

    const newFollowStatus = !localIsFollowed;

    try {
      setIsLoadingFollow(true);

      if (localIsFollowed) {
        await userService.removeFollower(postData);
        console.log("Unfollow successful");
      } else {
        await userService.addFollower(postData);
        console.log("Follow successful");
      }

      setLocalIsFollowed(newFollowStatus);
    } catch (error) {
      console.error("Error in follow operation:", error);
      setLocalIsFollowed(localIsFollowed);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  return (
    <div className="flex-shrink-0 p-2 z-10 absolute top-0 left-0 right-0 bg_profile_watch">
      <div className="grid grid-cols-9 items-center w-full">
        <div className="flex col-span-5 justify-start">
          <ImageRank
            userInfo={video}
            positionVideo={positionVideo}
            userNameStyle="text-gray-150"
            userName={userInfo?.userName}
            imgSize={50}
            imgSrc={profile}
            score={score}
          />
        </div>
        <div className="flex col-span-3 justify-center">
          {checkMyVideo && (
            <Follows
              title={localIsFollowed ? "Unfollow" : "Follow"}
              onFollowClick={() => handleFallowClick(video, positionVideo)}
              bgColor="red"
            />
          )}
        </div>
        <div className="flex col-span-1 justify-end ">
          {checkMyVideo ? (
            <Dropdown
              isOpenOptions={openDropdowns[positionVideo]}
              setIsOpenOptions={(isOpen: any) => {
                setOpenDropdowns((prev: any) => ({
                  ...prev,
                  [positionVideo]: isOpen,
                }));
              }}
              buttonIcon={
                <MoreVertIcon
                  className="text-white font35 cursor-pointer"
                  onClick={() =>
                    toggleDropdown(positionVideo ? "top" : "bottom")
                  }
                />
              }
              items={dropdownItems(video)}
              position="right"
              className="ml-4"
            />
          ) : (
            <div> </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionTop;
