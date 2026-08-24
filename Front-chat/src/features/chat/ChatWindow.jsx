import { useEffect, useRef, useState } from "react";
import { Avatar } from "../../components/Avatar.jsx";
import { StatusDot } from "../../components/StatusDot.jsx";
import { Icon } from "../../components/icons.jsx";
import { useAuthStore } from "../../store/authStore.js";
import { useConversationsStore } from "../../store/conversationsStore.js";
import { usePresenceStore } from "../../store/presenceStore.js";
import { initiateCall } from "../call/useWebRTC.js";
import { EmojiPicker } from "./EmojiPicker.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { FileDropzone } from "./FileDropzone.jsx";
import { MessageBubble } from "./MessageBubble.jsx";
import { VoiceRecorder } from "./VoiceRecorder.jsx";

function conversationLabel(conversation, currentUserId) {
  if (conversation.type === "group") return conversation.name ?? "Groupe";
  const other = conversation.participants.find((p) => p.userId !== currentUserId);
  return other?.user?.displayName ?? "Discussion";
}

export function ChatWindow({ onOpenInfo, onBack }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const conversations = useConversationsStore((state) => state.conversations);
  const activeConversationId = useConversationsStore((state) => state.activeConversationId);
  const messagesByConversation = useConversationsStore((state) => state.messagesByConversation);
  const sendMessage = useConversationsStore((state) => state.sendMessage);
  const deleteMessages = useConversationsStore((state) => state.deleteMessages);
  const isOnline = usePresenceStore((state) => state.isOnline);

  const [draft, setDraft] = useState("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectMode = selectedIds.size > 0;
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const conversation = conversations.find((c) => c.id === activeConversationId);
  const messages = messagesByConversation[activeConversationId] ?? [];
  const otherParticipant =
    conversation?.type === "private"
      ? conversation.participants.find((p) => p.userId !== currentUserId)?.user
      : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeConversationId]);

  function enterSelect(messageId) {
    setSelectedIds(new Set([messageId]));
  }

  function toggleSelect(messageId) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  }

  function cancelSelect() {
    setSelectedIds(new Set());
  }

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Supprimer ${count} message${count > 1 ? "s" : ""} ?`)) return;
    await deleteMessages(activeConversationId, Array.from(selectedIds));
    setSelectedIds(new Set());
  }

  if (!conversation) {
    return (
      <EmptyState
        title="Sélectionne une discussion"
        subtitle="Choisis une conversation dans la liste, ou démarre une nouvelle discussion."
      />
    );
  }

  async function handleSend(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    await sendMessage(activeConversationId, content);
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      <header className="flex items-center gap-1 px-2 md:px-4 py-3 border-b border-line bg-surface">
        {selectMode ? (
          <>
            <button
              onClick={cancelSelect}
              className="w-9 h-9 flex-shrink-0 rounded-full hover:bg-line flex items-center justify-center text-ink-soft"
              aria-label="Annuler la sélection"
            >
              <Icon.X size={18} />
            </button>
            <span className="flex-1 text-sm font-medium text-ink px-2">
              {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
            </span>
            <button
              onClick={handleDeleteSelected}
              className="w-10 h-10 rounded-full hover:bg-line flex items-center justify-center text-danger"
              aria-label="Supprimer la sélection"
            >
              <Icon.Trash size={19} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onBack}
              className="md:hidden w-9 h-9 flex-shrink-0 rounded-full hover:bg-line flex items-center justify-center text-ink-soft"
              aria-label="Retour aux discussions"
            >
              <Icon.ChevronRight size={20} className="rotate-180" />
            </button>
            <button
              onClick={onOpenInfo}
              className="flex items-center gap-3 flex-1 min-w-0 text-left px-2"
            >
              <span className="relative">
                <Avatar
                  name={conversationLabel(conversation, currentUserId)}
                  src={otherParticipant?.avatarUrl}
                />
                {otherParticipant && (
                  <span className="absolute -bottom-0.5 -right-0.5">
                    <StatusDot online={isOnline(otherParticipant.id)} />
                  </span>
                )}
              </span>
              <span className="flex-1 min-w-0">
                <p className="font-medium text-ink truncate">
                  {conversationLabel(conversation, currentUserId)}
                </p>
                {otherParticipant && (
                  <p className="text-xs text-ink-soft">
                    {isOnline(otherParticipant.id) ? "en ligne" : "hors ligne"}
                  </p>
                )}
              </span>
            </button>
            <button
              title="Appel audio"
              onClick={() => initiateCall(activeConversationId, "audio")}
              className="w-10 h-10 rounded-full hover:bg-line flex items-center justify-center text-ink-soft"
            >
              <Icon.Phone size={19} />
            </button>
            <button
              title="Appel vidéo"
              onClick={() => initiateCall(activeConversationId, "video")}
              className="w-10 h-10 rounded-full hover:bg-line flex items-center justify-center text-ink-soft"
            >
              <Icon.Video size={19} />
            </button>
            <button
              title="Informations"
              onClick={onOpenInfo}
              className="hidden md:flex w-10 h-10 rounded-full hover:bg-line items-center justify-center text-ink-soft"
            >
              <Icon.DotsVertical size={19} />
            </button>
          </>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 bg-chat-bg">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
            selectMode={selectMode}
            selected={selectedIds.has(message.id)}
            onEnterSelect={enterSelect}
            onToggleSelect={toggleSelect}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 bg-surface border-t border-line">
        {!isRecordingVoice && (
          <>
            <EmojiPicker
              onPick={(emoji) => {
                setDraft((value) => value + emoji);
                inputRef.current?.focus();
              }}
            />
            <FileDropzone conversationId={activeConversationId} />
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Écrire un message…"
              className="flex-1 rounded-full border border-line px-4 py-2 text-sm text-ink bg-app"
            />
          </>
        )}
        {draft.trim() ? (
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0"
            aria-label="Envoyer"
          >
            <Icon.Send size={16} />
          </button>
        ) : (
          <VoiceRecorder conversationId={activeConversationId} onRecordingChange={setIsRecordingVoice} />
        )}
      </form>
    </div>
  );
}
