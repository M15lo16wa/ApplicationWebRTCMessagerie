import { useEffect, useState } from "react";
import { http } from "../../api/http.js";
import { Avatar } from "../../components/Avatar.jsx";
import { Icon } from "../../components/icons.jsx";
import { useAuthStore } from "../../store/authStore.js";
import { initiateCall } from "../call/useWebRTC.js";

function otherParty(call, currentUserId) {
  const other = call.conversation.participants.find((p) => p.userId !== currentUserId);
  return other?.user ?? call.initiator;
}

function formatWhen(isoDate) {
  const date = new Date(isoDate);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Aujourd'hui, ${time}`;
  return `${date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}, ${time}`;
}

export function CallHistoryView() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [calls, setCalls] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectMode = selectedIds.size > 0;

  useEffect(() => {
    http.get("/calls").then(({ data }) => setCalls(data.calls));
  }, []);

  function toggleSelect(callId) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(callId)) next.delete(callId);
      else next.add(callId);
      return next;
    });
  }

  async function handleDeleteSelected() {
    const count = selectedIds.size;
    if (!window.confirm(`Supprimer ${count} appel${count > 1 ? "s" : ""} de l'historique ?`)) return;
    const { data } = await http.delete("/calls/bulk", { data: { callIds: Array.from(selectedIds) } });
    const removed = new Set(data.callIds);
    setCalls((current) => current.filter((call) => !removed.has(call.id)));
    setSelectedIds(new Set());
  }

  async function handleClearAll() {
    if (calls.length === 0) return;
    if (!window.confirm("Supprimer tout l'historique d'appels ?")) return;
    await http.delete("/calls/all");
    setCalls([]);
    setSelectedIds(new Set());
  }

  return (
    <div className="flex-1 min-w-0 md:w-80 md:flex-none border-r border-line bg-surface flex flex-col h-full">
      <div className="p-4 border-b border-line flex items-center justify-between">
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
              {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
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
            <h2 className="font-semibold text-ink">Appels</h2>
            {calls.length > 0 && (
              <button
                onClick={handleClearAll}
                title="Tout supprimer"
                className="w-9 h-9 rounded-full hover:bg-line flex items-center justify-center text-ink-soft"
              >
                <Icon.Trash size={17} />
              </button>
            )}
          </>
        )}
      </div>
      <ul className="flex-1 overflow-y-auto">
        {calls.map((call) => {
          const person = otherParty(call, currentUserId);
          const missed = call.state === "missed";
          const outgoing = call.initiatorId === currentUserId;
          const selected = selectedIds.has(call.id);
          return (
            <li key={call.id}>
              <button
                onClick={() =>
                  selectMode ? toggleSelect(call.id) : initiateCall(call.conversationId, call.type)
                }
                onContextMenu={(event) => {
                  event.preventDefault();
                  toggleSelect(call.id);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-line text-left"
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
                <Avatar name={person?.displayName} src={person?.avatarUrl} size={40} />
                <span className="flex-1 min-w-0">
                  <span className={`block font-medium truncate ${missed ? "text-danger" : "text-ink"}`}>
                    {person?.displayName ?? "Utilisateur"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-ink-soft">
                    {outgoing ? "Sortant" : missed ? "Manqué" : "Entrant"} · {formatWhen(call.startedAt)}
                  </span>
                </span>
                {!selectMode &&
                  (call.type === "video" ? (
                    <Icon.Video size={18} className="text-ink-soft" />
                  ) : (
                    <Icon.Phone size={18} className="text-ink-soft" />
                  ))}
              </button>
            </li>
          );
        })}
        {calls.length === 0 && (
          <p className="px-4 py-3 text-sm text-ink-soft">Aucun appel pour l'instant.</p>
        )}
      </ul>
    </div>
  );
}
