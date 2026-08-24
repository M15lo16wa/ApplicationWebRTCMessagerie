import { useState } from "react";
import { Avatar } from "../../components/Avatar.jsx";
import { Icon } from "../../components/icons.jsx";
import { useAuthStore } from "../../store/authStore.js";
import { useConversationsStore } from "../../store/conversationsStore.js";
import { usePresenceStore } from "../../store/presenceStore.js";
import { initiateCall } from "../call/useWebRTC.js";

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace(
  /\/api\/?$/,
  "",
);

export function ContactInfoPanel({ conversation, onClose }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isOnline = usePresenceStore((state) => state.isOnline);
  const messages = useConversationsStore(
    (state) => state.messagesByConversation[conversation.id] ?? [],
  );
  const clearConversation = useConversationsStore((state) => state.clearConversation);
  const [showMedia, setShowMedia] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleClearConversation() {
    if (
      !window.confirm(
        "Vider cette discussion ? Les messages seront supprimés uniquement de ta vue, ton interlocuteur gardera son historique.",
      )
    )
      return;
    setClearing(true);
    try {
      await clearConversation(conversation.id);
    } finally {
      setClearing(false);
    }
  }

  const isGroup = conversation.type === "group";
  const otherParticipant = !isGroup
    ? conversation.participants.find((p) => p.userId !== currentUserId)?.user
    : null;
  const label = isGroup ? conversation.name : otherParticipant?.displayName;
  const mediaMessages = messages.filter((m) => m.mediaFile);
  const mediaCount = mediaMessages.length;

  return (
    <div className="fixed inset-0 z-40 md:static md:z-auto w-full md:w-80 flex-shrink-0 border-l border-line bg-surface flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <h3 className="font-semibold text-ink">
          {isGroup ? "Informations du groupe" : "Informations du contact"}
        </h3>
        <button onClick={onClose} aria-label="Fermer" className="text-ink-soft hover:text-ink">
          <Icon.X size={18} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 py-6 border-b border-line">
        <Avatar name={label} src={otherParticipant?.avatarUrl} size={84} />
        <p className="font-semibold text-ink text-lg">{label}</p>
        {otherParticipant && (
          <p className="text-sm text-ink-soft">
            {isOnline(otherParticipant.id) ? "en ligne" : "hors ligne"}
          </p>
        )}
        {isGroup && (
          <p className="text-sm text-ink-soft">{conversation.participants.length} membres</p>
        )}
      </div>

      {!isGroup && (
        <div className="flex gap-2 px-4 py-4 border-b border-line">
          <button
            onClick={() => initiateCall(conversation.id, "audio")}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-line text-primary"
          >
            <Icon.Phone size={18} />
            <span className="text-xs text-ink">Appeler</span>
          </button>
          <button
            onClick={() => initiateCall(conversation.id, "video")}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-line text-primary"
          >
            <Icon.Video size={18} />
            <span className="text-xs text-ink">Vidéo</span>
          </button>
        </div>
      )}

      {!isGroup && otherParticipant?.statusText && (
        <div className="px-4 py-4 border-b border-line">
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide mb-1">À propos</p>
          <p className="text-sm text-ink">{otherParticipant.statusText}</p>
        </div>
      )}

      <button
        onClick={() => setShowMedia((value) => !value)}
        disabled={mediaCount === 0}
        className="flex items-center justify-between px-4 py-3.5 border-b border-line hover:bg-line text-left disabled:hover:bg-transparent disabled:cursor-default"
      >
        <span className="flex items-center gap-2 text-sm text-ink">
          <Icon.Image size={16} className="text-ink-soft" />
          Médias partagés (chargés)
        </span>
        <span className="flex items-center gap-1 text-sm text-ink-soft">
          {mediaCount}
          <Icon.ChevronRight size={14} className={showMedia ? "rotate-90" : ""} />
        </span>
      </button>

      {showMedia && (
        <div className="px-4 py-4 border-b border-line grid grid-cols-3 gap-2">
          {mediaMessages.map((message) => {
            const { mediaFile } = message;
            const url = `${API_ORIGIN}${mediaFile.url}`;
            const isImage = mediaFile.mimeType.startsWith("image/");
            const isVideo = mediaFile.mimeType.startsWith("video/");
            return (
              <a
                key={message.id}
                href={url}
                target="_blank"
                rel="noreferrer"
                title={mediaFile.originalName}
                className="aspect-square rounded-lg overflow-hidden bg-app flex items-center justify-center hover:opacity-90"
              >
                {isImage ? (
                  <img src={url} alt={mediaFile.originalName} className="w-full h-full object-cover" />
                ) : isVideo ? (
                  <video src={url} className="w-full h-full object-cover" />
                ) : (
                  <Icon.Paperclip size={20} className="text-ink-soft" />
                )}
              </a>
            );
          })}
        </div>
      )}

      {isGroup && (
        <div className="px-4 py-4 flex-1 overflow-y-auto">
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide mb-2">Membres</p>
          <ul className="flex flex-col gap-2">
            {conversation.participants.map((p) => (
              <li key={p.userId} className="flex items-center gap-3">
                <Avatar name={p.user?.displayName} src={p.user?.avatarUrl} size={32} />
                <span className="text-sm text-ink">{p.user?.displayName}</span>
                {p.role === "admin" && (
                  <span className="text-xs text-ink-soft ml-auto">admin</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto px-4 py-4 border-t border-line">
        <button
          onClick={handleClearConversation}
          disabled={clearing || messages.length === 0}
          className="w-full flex items-center gap-2 text-sm text-danger disabled:opacity-50 disabled:cursor-default"
        >
          <Icon.Trash size={16} />
          {clearing ? "Suppression…" : "Vider la discussion"}
        </button>
      </div>
    </div>
  );
}
