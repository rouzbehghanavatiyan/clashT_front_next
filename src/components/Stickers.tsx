import React from "react";
import EmojiPicker from "emoji-picker-react";

interface PropsType {
  onEmojiSelect: (emoji: any) => void;
}

const Stickers: React.FC<PropsType> = ({ onEmojiSelect }) => {
  return (
    <div className="absolute left-0 mb-6 bottom-24 z-50 w-full">
      <div className="mx-auto " style={{ height: "400px", width: "100%" }}>
        <EmojiPicker
          height="100%"
          width="100%"
          onEmojiClick={(emojiObject: any) => onEmojiSelect(emojiObject)}
          previewConfig={{ showPreview: false }}
        />
      </div>
    </div>
  );
};

export default Stickers;
