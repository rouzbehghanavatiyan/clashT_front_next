"use client";

import { useRef } from "react";
import SendIcon from "@mui/icons-material/Send";
import MoodIcon from "@mui/icons-material/Mood";
import Input from "@/components/Input";
import StickerOverlay from "@/components/StickerOverlay";

const MessageInput: React.FC<{
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e?: React.FormEvent) => void;
  titleInputRef?: any;
  setShowStickers: React.Dispatch<React.SetStateAction<boolean>>;
  showStickers: boolean;
  onEmojiSelect?: any;
  onInputFocus?: (e: React.FocusEvent) => void;
  itsComment?: boolean;
}> = ({
  title,
  setTitle,
  handleSendMessage,
  onEmojiSelect,
  titleInputRef,
  setShowStickers,
  showStickers,
  onInputFocus,
}) => {
  const internalRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(
    null,
  );
  const inputRef = titleInputRef ?? internalRef;

  return (
    <div className="z-50 w-full px-3 shadow-card">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(e);
        }}
        className="mb-2 grid grid-cols-5"
      >
        <div className="col-span-4 flex items-center justify-center">
          <div className="flex-1 items-center justify-center">
            <Input
              multiline={true}
              maxHeight="120px"
              onFocus={onInputFocus}
              ref={inputRef}
              className="font14 mt- w-full rounded-lg border border-gray-300 bg-white px-2 py-1 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-100"
              placeholder="Message..."
              value={title}
              onChange={(e: any) => setTitle(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
        </div>
        <div className="col-span-1 mb-2 ms-3 flex items-end justify-center gap-4">
          <button
            type="button"
            onClick={() => setShowStickers(!showStickers)}
            className="flex text-gray-600"
            aria-label="Open stickers"
          >
            <MoodIcon className="font25 cursor-pointer text-gray-900 dark:text-gray-100" />
          </button>
          <button type="submit" aria-label="Send message">
            <SendIcon className="font25 cursor-pointer text-gray-900 dark:text-gray-100" />
          </button>
        </div>
      </form>
      {showStickers && (
        <StickerOverlay
          onEmojiSelect={onEmojiSelect}
          setShowStickers={setShowStickers}
        />
      )}
    </div>
  );
};

export default MessageInput;
