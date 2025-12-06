import { useEffect, useRef, useState } from "react";
import ImageRank from "../components/ImageRank";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Modal from "../components/Modal";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { miscService } from "@/services/misc.service";
import { useAppSelector } from "@/store/reduxHook";
import asyncWrapper from "@/utils/asyncWrapper";
import Loading from "@/components/Loading";
import StringHelpers from "@/utils/StringHelpers";
import MessageInput from "./MessageInput";

const Comments: React.FC<any> = ({
  positionVideo,
  setShowComments,
  commentUserInfo,
  showComments,
}) => {
  const main = useAppSelector((state) => state?.main);
  const [title, setTitle] = useState<string>("");
  const [allComments, setAllComments] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showStickers, setShowStickers] = useState(false);
  const [answerInfo, setAnswerInfo] = useState<any>(null);
  const [answerData, setAnswerData] = useState<any>({});
  const titleInputRef = useRef<HTMLInputElement>(null);

  const getMovieId =
    positionVideo === 0
      ? commentUserInfo?.attachmentInserted?.attachmentId
      : commentUserInfo?.attachmentMatched?.attachmentId;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title !== "") {
      const postData: any = {
        userId: main?.userLogin?.user?.id,
        movieId: getMovieId,
        desc: title.trim(),
        ParentId: answerData?.id || null,
      };
      const res = await miscService.addComment(postData);
      const { data, status } = res?.data;
      if (status === 0) {
        setTitle("");
        handleGetAllList();
        titleInputRef.current?.focus();
        setAnswerInfo(null);
      }
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setTitle((prev: any) => prev + emoji.emoji);
    setShowStickers(false);
  };

  const handleGetAllList = async () => {
    try {
      const res = await miscService.commentList(getMovieId);
      const { data, status } = res?.data;

      if (status === 0) {
        const commentsHierarchy = data.reduce((acc: any, comment: any) => {
          if (!comment.parentId) {
            acc.push({ ...comment, replies: [] });
          } else {
            const parentComment = acc.find(
              (c: any) => c.id === comment.parentId
            );
            if (parentComment) {
              parentComment.replies.push(comment);
            }
          }
          return acc;
        }, []);
        setAllComments(commentsHierarchy);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetAllList();
  }, [showComments]);

  const handleInputFocus = (e: React.FocusEvent) => {
    e.stopPropagation();
  };

  const handleAnswerComments = (item: any) => {
    setAnswerInfo((prev: any) => (prev?.id === item?.id ? null : item));
    setAnswerData(item);
    titleInputRef.current?.focus();
  };
  console.log(showComments);

  const handleRemoveComment = asyncWrapper(async (item: any) => {
    console.log(item);
    const res = await miscService.removeComment(item?.id);
    console.log(res);
    if (res.data.status === 0) {
      handleGetAllList();
    }
  });

  return (
    <>
      <Modal
        setIsOpen={setShowComments}
        onClose={() => setShowComments(false)}
        padding={0}
        isOpen={showComments}
      >
        <div className="flex flex-col h-[80vh] overflow-hidden">
          <div className="font15 bg-primary w-full z-20 p-2">
            <div className="grid grid-cols-5 items-center">
              <div className="col-span-1 flex justify-start">
                <ImageRank
                  userNameStyle="text-white"
                  imgSize={45}
                  userName={
                    positionVideo === 0
                      ? commentUserInfo?.userInserted?.userName
                      : commentUserInfo?.userMatched?.userName
                  }
                  imgSrc={
                    positionVideo === 0
                      ? StringHelpers.getProfile(
                          commentUserInfo?.profileInserted
                        )
                      : StringHelpers.getProfile(
                          commentUserInfo?.profileMatched
                        )
                  }
                />
              </div>
              <div className="col-span-3 flex justify-center">
                <span className="text-white">Reacts</span>
              </div>
              <div className="col-span-1 text-white flex justify-end">
                <CloseIcon
                  onClick={() => setShowComments(false)}
                  className="text-white font20 cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div className={`relative w-full h-full overflow-y-auto`}>
            <div className=" px-2">
              {isLoading && <Loading isLoading={isLoading} />}
              {allComments.length > 0 ? (
                allComments.map((item: any) => (
                  <div key={item?.id}>
                    <div className="flex justify-between items-start py-1 p-2">
                      <ImageRank
                        userNameStyle="text-black"
                        imgSize={35}
                        userName={item.userName}
                        score={item.score}
                        imgSrc={StringHelpers.getProfile(item.profile)}
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex">
                          <DeleteOutlineIcon
                            onClick={() => handleRemoveComment(item)}
                            className="m-2 font15 cursor-pointer"
                          />
                          <ArrowForwardIosIcon
                            onClick={() => handleAnswerComments(item)}
                            className="m-2 font15 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="col-span-6 m-2 container_message text-gray-800">
                      {item.desc}
                    </p>
                    {answerInfo?.id === item?.id && (
                      <div className="p-4 bg-gray-100 flex gap-2">
                        <span className="font-bold">
                          @{main?.userLogin?.user?.userName}
                        </span>
                        <span className=" text-gray-800 container_message">
                          {title}
                        </span>
                      </div>
                    )}
                    {item?.replies?.length > 0 &&
                      item?.replies?.map((reply: any) => (
                        <div
                          key={reply.id}
                          className="ml-6 pl-4 bg-gray-100  border-gray-300"
                        >
                          <ImageRank
                            userNameStyle="text-black"
                            imgSize={30}
                            userName={reply.userName}
                            score={reply.score}
                            imgSrc={StringHelpers.getProfile(reply.profile)}
                          />
                          <div className="flex justify-between">
                            <p className="text-sm container_message text-gray-800">
                              {reply.desc}
                            </p>
                            <DeleteOutlineIcon
                              onClick={() => handleRemoveComment(item)}
                              className="m-2 font15 cursor-pointer"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center p-4">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
          <MessageInput
            itsComment={true}
            title={title}
            setTitle={setTitle}
            handleSendMessage={(e: any) => handleSendMessage(e)}
            titleInputRef={titleInputRef}
            setShowStickers={setShowStickers}
            onEmojiSelect={handleEmojiSelect}
            showStickers={showStickers}
            onInputFocus={handleInputFocus}
          />
        </div>
      </Modal>
    </>
  );
};

export default Comments;
