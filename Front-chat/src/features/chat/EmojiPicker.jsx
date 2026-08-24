import { useState } from "react";
import { Icon } from "../../components/icons.jsx";

const EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🎉", "😢", "😮", "❤️", "🔥", "😅", "🤔"];

export function EmojiPicker({ onPick }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-ink-soft hover:text-ink"
        aria-label="Émojis"
      >
        <Icon.Smile size={20} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-10 left-0 z-20 bg-surface border border-line rounded-xl shadow-lg p-2 grid grid-cols-6 gap-1 w-56">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onPick(emoji);
                  setOpen(false);
                }}
                className="text-xl hover:bg-line rounded-md p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
