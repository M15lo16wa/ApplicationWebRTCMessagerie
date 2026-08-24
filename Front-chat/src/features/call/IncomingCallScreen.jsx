import { Avatar } from "../../components/Avatar.jsx";
import { Icon } from "../../components/icons.jsx";
import { useCallStore } from "../../store/callStore.js";
import { useConversationsStore } from "../../store/conversationsStore.js";
import { acceptCall, declineCall } from "./useWebRTC.js";

export function IncomingCallScreen() {
  const { type, conversationId, peerId } = useCallStore();
  const conversation = useConversationsStore((state) =>
    state.conversations.find((c) => c.id === conversationId),
  );
  const caller = conversation?.participants.find((p) => p.userId === peerId)?.user;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] px-4">
      <div className="w-full max-w-72 bg-[#1c2622] rounded-3xl flex flex-col items-center gap-6 py-10 px-6 text-white shadow-2xl">
        <Avatar name={caller?.displayName ?? "Appel"} src={caller?.avatarUrl} size={88} />
        <div className="text-center">
          <p className="text-lg font-semibold">{caller?.displayName ?? "Appel entrant"}</p>
          <p className="text-sm opacity-70 mt-1">
            Appel {type === "video" ? "vidéo" : "audio"} entrant…
          </p>
        </div>
        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={declineCall}
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-danger)" }}
              aria-label="Refuser"
            >
              <Icon.Phone size={22} className="rotate-[135deg]" />
            </button>
            <span className="text-xs opacity-70">Refuser</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={acceptCall}
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-success)" }}
              aria-label="Répondre"
            >
              <Icon.Phone size={22} />
            </button>
            <span className="text-xs opacity-70">Répondre</span>
          </div>
        </div>
      </div>
    </div>
  );
}
