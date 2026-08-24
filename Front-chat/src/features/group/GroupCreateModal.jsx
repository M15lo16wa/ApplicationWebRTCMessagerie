import { useEffect, useState } from "react";
import { http } from "../../api/http.js";
import { Avatar } from "../../components/Avatar.jsx";
import { Button } from "../../components/Button.jsx";
import { useConversationsStore } from "../../store/conversationsStore.js";

export function GroupCreateModal({ onClose }) {
  const createGroup = useConversationsStore((state) => state.createGroup);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const { data } = await http.get("/users", { params: { search } });
      setUsers(data.users);
    }, 200);
    return () => clearTimeout(timeout);
  }, [search]);

  function toggle(userId) {
    setSelectedIds((ids) =>
      ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId],
    );
  }

  async function handleCreate() {
    if (!name.trim() || selectedIds.length === 0) return;
    setLoading(true);
    try {
      await createGroup(name.trim(), selectedIds);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl shadow-lg w-full max-w-sm p-5 flex flex-col gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="font-semibold text-ink">Nouveau groupe</h3>

        <input
          placeholder="Nom du groupe"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-sm text-ink bg-app"
        />

        <input
          placeholder="Ajouter des membres…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-sm text-ink bg-app"
        />

        <ul className="max-h-48 overflow-y-auto flex flex-col gap-1">
          {users.map((user) => (
            <li key={user.id}>
              <label className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-line cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(user.id)}
                  onChange={() => toggle(user.id)}
                />
                <Avatar name={user.displayName} src={user.avatarUrl} size={32} />
                <span className="flex-1 min-w-0 truncate text-sm text-ink">{user.displayName}</span>
              </label>
            </li>
          ))}
        </ul>

        <Button
          onClick={handleCreate}
          disabled={loading || !name.trim() || selectedIds.length === 0}
        >
          {loading ? "Création…" : `Créer (${selectedIds.length} membre·s)`}
        </Button>
      </div>
    </div>
  );
}
