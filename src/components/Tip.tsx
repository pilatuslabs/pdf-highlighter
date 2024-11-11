import type React from "react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onConfirm: (comment: { text: string; emoji: string }) => void;
  onOpen: () => void;
  onUpdate?: () => void;
}

export const Tip: React.FC<Props> = ({ onConfirm, onOpen, onUpdate }) => {
  const [state, setState] = useState({
    compact: true,
    text: "",
    emoji: "",
  });

  const { compact, text, emoji } = state;

  useEffect(() => {
    if (onUpdate) {
      onUpdate();
    }
  }, [onUpdate]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onConfirm({ text, emoji });
  };

  const handleCompactClick = () => {
    onOpen();
    setState((prev) => ({ ...prev, compact: false, isFocused: true }));
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState((prev) => ({ ...prev, text: event.target.value }));
  };

  const handleEmojiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, emoji: event.target.value }));
  };

  return (
    <div>
      {compact ? (
        <div
          className="compact cursor-pointer  bg-[#3d464d] border border-[rgba(255,255,255,0.25)] text-white py-1 px-2.5 rounded-md"
          onClick={handleCompactClick}
        >
          Add highlight
        </div>
      ) : (
        <form
          className="card p-2.5 bg-white bg-clip-padding border border-[#e8e8e8] rounded-md shadow-[0_2px_4px_rgba(37,40,43,0.2)]"
          onSubmit={handleSubmit}
        >
          <div>
            <textarea
              className="text-base text-black  w-50 h-[70px]"
              placeholder="Your comment"
              // biome-ignore lint: needs to be focused for better ux
              autoFocus
              value={text}
              onChange={handleTextChange}
            />
            <div>
              {["💩", "😱", "😍", "🔥", "😳", "⚠️"].map((_emoji) => (
                <label key={_emoji}>
                  <input
                    checked={emoji === _emoji}
                    type="radio"
                    name="emoji"
                    value={_emoji}
                    onChange={handleEmojiChange}
                  />
                  {_emoji}
                </label>
              ))}
            </div>
          </div>
          <div>
            <input
              type="submit"
              value="Save"
              className="mt-1.25 text-lg text-black"
            />
          </div>
        </form>
      )}
    </div>
  );
};
