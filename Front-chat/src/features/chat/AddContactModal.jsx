import { useEffect, useState } from "react";
import { http } from "../../api/http.js";
import { Avatar } from "../../components/Avatar.jsx";
import { Icon } from "../../components/icons.jsx";

export function AddContactModal({ existingContactIds, onAdded, onClose }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!search.trim()) {
        setUsers([]);
        return;
      }
      const { data } = await http.get("/users", { params: { search } });
      setUsers(data.users);
    }, 200);
    return () => clearTimeout(timeout);
  }, [search]);

  async function handleAdd(user) {
    setError(null);
    try {
      const { data } = await http.post("/contacts", { contactId: user.id });
      setAddedIds((ids) => new Set(ids).add(user.id));
      onAdded(data.contact);
    } catch (err) {
      setError(err.response?.data?.error ?? "Impossible d'ajouter ce contact");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl shadow-lg w-full max-w-sm p-5 flex flex-col gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">Nouveau contact</h3>
          <button onClick={onClose} aria-label="Fermer" className="text-ink-soft hover:text-ink">
            <Icon.X size={18} />
          </button>
        </div>
        <p className="text-sm text-ink-soft">
          Cherche par nom d'affichage, puis clique "Ajouter" sur le bon compte.
        </p>

        <div className="relative">
          <Icon.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            autoFocus
            placeholder="Nom d'affichage…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-line pl-9 pr-3 py-2 text-sm text-ink bg-app"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <ul className="max-h-64 overflow-y-auto flex flex-col gap-1">
          {users.map((user) => {
            const isContact = existingContactIds.has(user.id) || addedIds.has(user.id);
            return (
              <li key={user.id} className="flex items-center gap-3 px-2 py-2 rounded-lg">
                <Avatar name={user.displayName} src={user.avatarUrl} size={32} />
                <span className="flex-1 min-w-0 truncate text-sm text-ink">{user.displayName}</span>
                <button
                  onClick={() => handleAdd(user)}
                  disabled={isContact}
                  className="text-xs font-medium text-primary disabled:text-ink-soft disabled:cursor-default"
                >
                  {isContact ? "Ajouté ✓" : "Ajouter"}
                </button>
              </li>
            );
          })}
          {search.trim() && users.length === 0 && (
            <p className="text-sm text-ink-soft px-2 py-2">Aucun utilisateur avec ce nom.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
