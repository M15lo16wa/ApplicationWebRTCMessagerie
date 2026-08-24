import { useEffect, useMemo, useState } from "react";
import { Avatar } from "../../components/Avatar.jsx";
import { StatusDot } from "../../components/StatusDot.jsx";
import { Icon } from "../../components/icons.jsx";
import { useAuthStore } from "../../store/authStore.js";
import { useConversationsStore } from "../../store/conversationsStore.js";
import { usePresenceStore } from "../../store/presenceStore.js";

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "unread", label: "Non lues" },
  { key: "group", label: "Groupes" },
];

function conversationLabel(conversation, currentUserId) {
  if (conversation.type === "group") return conversation.name ?? "Groupe";
  const other = conversation.participants.find((p) => p.userId !== currentUserId);
  return other?.user?.displayName ?? "Discussion";
}

function conversationAvatarUser(conversation, currentUserId) {
  if (conversation.type === "group") return null;
  return conversation.participants.find((p) => p.userId !== currentUserId)?.user;
}

function lastMessagePreview(conversation, currentUserId) {
  const message = conversation.messages?.[0];
  if (!message) return "Aucun message";
  const text = message.content ?? (message.mediaFile ? "📎 Pièce jointe" : "");
  if (conversation.type !== "group") return text;
  const senderName = message.senderId === currentUserId ? "Toi" : message.sender?.displayName ?? "";
  return senderName ? `${senderName} : ${text}` : text;
}

export function ConversationList({ onCompose, onOpenGroupModal }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const conversations = useConversationsStore((state) => state.conversations);
  const activeConversationId = useConversationsStore((state) => state.activeConversationId);
  const unreadCounts = useConversationsStore((state) => state.unreadCounts);
  const loadConversations = useConversationsStore((state) => state.loadConversations);
  const setActiveConversation = useConversationsStore((state) => state.setActiveConversation);
  const deleteConversation = useConversationsStore((state) => state.deleteConversation);
  const isOnline = usePresenceStore((state) => state.isOnline);
  usePresenceStore((state) => state.byUserId);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectMode = selectedIds.size > 0;

  function toggleSelect(conversationId) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(conversationId)) next.delete(conversationId);
      else next.add(conversationId);
      return next;
    });
  }

  async function handleDeleteSelected() {
    const count = selectedIds.size;
    if (
      !window.confirm(
        `Supprimer ${count} discussion${count > 1 ? "s" : ""} ? Elles ne seront supprimées que de ta liste.`,
      )
    )
      return;
    await Promise.all(Array.from(selectedIds).map((id) => deleteConversation(id)));
    setSelectedIds(new Set());
  }

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const visibleConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      if (filter === "group" && conversation.type !== "group") return false;
      if (filter === "unread" && !unreadCounts[conversation.id]) return false;
      if (search) {
        const label = conversationLabel(conversation, currentUserId).toLowerCase();
        if (!label.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [conversations, filter, search, unreadCounts, currentUserId]);

  return (
    <div className="flex-1 min-w-0 md:w-80 md:flex-none border-r border-line bg-surface flex flex-col h-full">
      <div className="p-4 flex items-center justify-between">
        {selectMode ? (
          <>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="w-9 h-9 rounded-full hover:bg-line flex items-center justify-center text-ink-soft"
              aria-label="Annuler la sélection"
            >
              <Icon.X size={18} />
            </button>
            <span className="text-sm font-medium text-ink">
              {selectedIds.size} sélectionnée{selectedIds.size > 1 ? "s" : ""}
            </span>
            <button
              onClick={handleDeleteSelected}
              className="w-9 h-9 rounded-full hover:bg-line flex items-center justify-center text-danger"
              aria-label="Supprimer la sélection"
            >
              <Icon.Trash size={18} />
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-ink">Discussions</h2>
            <div className="flex items-center gap-1">
              <button
                title="Nouveau groupe"
                onClick={onOpenGroupModal}
                className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-line"
              >
                <Icon.Users size={18} />
              </button>
              <button
                title="Nouvelle discussion"
                onClick={onCompose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-line"
              >
                <Icon.Pencil size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Icon.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            placeholder="Rechercher ou démarrer une discussion"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-full border border-line pl-9 pr-3 py-2 text-sm text-ink bg-app"
          />
        </div>
      </div>

      <div className="px-4 pb-3 flex gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filter === key ? "bg-primary-tint text-primary" : "bg-app text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="flex-1 overflow-y-auto">
        {visibleConversations.map((conversation) => {
          const label = conversationLabel(conversation, currentUserId);
          const avatarUser = conversationAvatarUser(conversation, currentUserId);
          const online = avatarUser ? isOnline(avatarUser.id) : false;
          const unread = unreadCounts[conversation.id] ?? 0;
          const lastMessage = conversation.messages?.[0];
          const selected = selectedIds.has(conversation.id);

          return (
            <li key={conversation.id}>
              <button
                onClick={() =>
                  selectMode ? toggleSelect(conversation.id) : setActiveConversation(conversation.id)
                }
                onContextMenu={(event) => {
                  event.preventDefault();
                  toggleSelect(conversation.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-line ${
                  activeConversationId === conversation.id ? "bg-primary-tint" : ""
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
                <span className="relative">
                  <Avatar name={label} src={avatarUser?.avatarUrl} />
                  {avatarUser && (
                    <span className="absolute -bottom-0.5 -right-0.5">
                      <StatusDot online={online} />
                    </span>
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink truncate">{label}</span>
                    {lastMessage && (
                      <span
                        className={`text-xs flex-shrink-0 ${unread ? "text-primary font-medium" : "text-ink-soft"}`}
                      >
                        {new Date(lastMessage.sentAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="block text-sm text-ink-soft truncate">
                      {lastMessagePreview(conversation, currentUserId)}
                    </span>
                    {unread > 0 && (
                      <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-success text-white text-xs font-semibold flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {visibleConversations.length === 0 && (
          <p className="p-4 text-sm text-ink-soft">Aucune discussion pour l'instant.</p>
        )}
      </ul>
    </div>
  );
}
