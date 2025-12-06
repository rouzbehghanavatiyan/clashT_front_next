import SendIcon from "@mui/icons-material/Send";
import MoodIcon from "@mui/icons-material/Mood";
import Input from "@/components/Input";
import StickerOverlay from "@/components/StickerOverlay";

const MessageInput: React.FC<{
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e: React.FormEvent) => void;
  titleInputRef: any;
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
}) => (
  <div className={`w-full bottom-0  shadow-card z-50 px-3`}>
    <form onSubmit={handleSendMessage} className=" mb-2 grid grid-cols-5">
      <div className="flex col-span-4 items-center justify-center ">
        <div className="flex-1 items-center justify-center">
          <Input
            multiline={true}
            maxHeight="120px"
            onFocus={onInputFocus}
            ref={titleInputRef}
            className="w-full rounded-lg border border-gray-300 font14 mt- px-2 py-1 focus:outline-none bg-white"
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
      <div className="col-span-1 gap-4 ms-3 mb-2 items-end justify-center flex">
        <button
          type="button"
          onClick={() => setShowStickers(!showStickers)}
          className="flex text-gray-600"
        >
          <MoodIcon className="cursor-pointer text-gray-900 font25" />
        </button>
        <button type="submit">
          <SendIcon className="cursor-pointer text-gray-900 font25" />
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
export default MessageInput;
