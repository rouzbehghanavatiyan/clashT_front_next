import Stickers from "./Stickers";

const StickerOverlay: React.FC<{
  onEmojiSelect: (emoji: any) => void;
  setShowStickers: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ onEmojiSelect, setShowStickers }) => {
  // console.log(onEmojiSelect(emoji));

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setShowStickers(false)}
      ></div>
      <Stickers onEmojiSelect={onEmojiSelect} />
    </div>
  );
};

export default StickerOverlay;
