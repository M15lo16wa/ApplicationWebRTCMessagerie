import { useRef } from "react";
import { Icon } from "../../components/icons.jsx";

const LONG_PRESS_MS = 450;

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace(
  /\/api\/?$/,
  "",
);

function formatTime(isoDate) {
  return new Date(isoDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function MediaContent({ mediaFile }) {
  const url = `${API_ORIGIN}${mediaFile.url}`;
  if (mediaFile.mimeType.startsWith("image/")) {
    return (
      <a href={url} target="_blank" rel="noreferrer" title="Ouvrir l'image en grand">
        <img
          src={url}
          alt={mediaFile.originalName}
          className="rounded-lg max-w-full sm:max-w-[240px] cursor-pointer hover:opacity-90"
        />
      </a>
    );
  }
  if (mediaFile.mimeType.startsWith("video/")) {
    return <video src={url} controls className="rounded-lg max-w-full sm:max-w-[240px]" />;
  }
  if (mediaFile.mimeType.startsWith("audio/")) {
    return (
      <audio controls>
        <source src={url} type={mediaFile.mimeType} />
      </audio>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="underline">
      📎 {mediaFile.originalName}
    </a>
  );
}

export function MessageBubble({ message, isOwn, selectMode, selected, onEnterSelect, onToggleSelect }) {
  const pressTimer = useRef(null);
  const longPressed = useRef(false);

  function clearPressTimer() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  function handlePointerDown() {
    if (selectMode) return;
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      onEnterSelect?.(message.id);
    }, LONG_PRESS_MS);
  }

  function handleClick() {
    if (!selectMode) return;
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    onToggleSelect?.(message.id);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={clearPressTimer}
      onPointerLeave={clearPressTimer}
      onClick={handleClick}
      className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : ""} ${
        selectMode ? "cursor-pointer" : ""
      }`}
    >
      {selectMode && (
        <span
          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
            selected ? "bg-primary border-primary text-white" : "border-line"
          }`}
        >
          {selected && <Icon.Check size={12} />}
        </span>
      )}
      <div className={`flex flex-col min-w-0 max-w-[78%] ${isOwn ? "items-end" : "items-start"}`}>
        <div
          className="rounded-2xl px-3 py-2 text-sm leading-relaxed"
          style={{
            background: isOwn ? "var(--color-primary-tint)" : "var(--color-surface)",
            color: "var(--color-ink)",
            borderBottomRightRadius: isOwn ? 4 : undefined,
            borderBottomLeftRadius: isOwn ? undefined : 4,
          }}
        >
          {message.mediaFile && <MediaContent mediaFile={message.mediaFile} />}
          {message.content && (
            <p className={`break-words ${message.mediaFile ? "mt-1" : ""}`}>{message.content}</p>
          )}
          <span className="flex items-center justify-end gap-1 text-[10px] mt-1 opacity-60">
            {formatTime(message.sentAt)}
            {isOwn && (
              message.status === "read" ? (
                <Icon.CheckCheck size={13} className="text-primary opacity-100" />
              ) : message.status === "delivered" ? (
                <Icon.CheckCheck size={13} />
              ) : (
                <Icon.Check size={13} />
              )
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
