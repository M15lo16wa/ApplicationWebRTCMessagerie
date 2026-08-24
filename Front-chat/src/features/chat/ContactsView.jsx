import { useEffect, useMemo, useState } from "react";
import { http } from "../../api/http.js";
import { Avatar } from "../../components/Avatar.jsx";
import { Icon } from "../../components/icons.jsx";
import { useConversationsStore } from "../../store/conversationsStore.js";
import { GroupCreateModal } from "../group/GroupCreateModal.jsx";
import { AddContactModal } from "./AddContactModal.jsx";

export function ContactsView({ onOpenChat }) {
  const openPrivate = useConversationsStore((state) => state.openPrivate);
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  async function loadContacts() {
    const { data } = await http.get("/contacts");
    setContacts(data.contacts);
  }

  useEffect(() => {
    loadContacts();
  }, []);

  const existingContactIds = useMemo(() => new Set(contacts.map((c) => c.id)), [contacts]);

  const visibleContacts = contacts.filter((contact) =>
    contact.displayName.toLowerCase().includes(search.toLowerCase()),
  );

  async function handlePick(userId) {
    await openPrivate(userId);
    onOpenChat();
  }

  return (
    <div className="flex-1 min-w-0 md:w-80 md:flex-none border-r border-line bg-surface flex flex-col h-full">
      <div className="p-4 border-b border-line">
        <h2 className="font-semibold text-ink mb-3">Nouvelle discussion</h2>
        <div className="relative">
          <Icon.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            placeholder="Rechercher un contact"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-full border border-line pl-9 pr-3 py-2 text-sm text-ink bg-app"
          />
        </div>
      </div>

      <button
        onClick={() => setShowAddContact(true)}
        className="flex items-center gap-3 px-4 py-3 text-left hover:bg-line"
      >
        <span className="w-10 h-10 rounded-full bg-primary-tint text-primary flex items-center justify-center">
          <Icon.Pencil size={17} />
        </span>
        <span className="text-sm font-medium text-ink">Nouveau contact</span>
      </button>

      <button
        onClick={() => setShowGroupModal(true)}
        className="flex items-center gap-3 px-4 py-3 text-left hover:bg-line"
      >
        <span className="w-10 h-10 rounded-full bg-primary-tint text-primary flex items-center justify-center">
          <Icon.Users size={18} />
        </span>
        <span className="text-sm font-medium text-ink">Nouveau groupe</span>
      </button>

      <p className="px-4 pt-2 pb-1 text-xs font-medium text-ink-soft uppercase tracking-wide">
        Contacts
      </p>
      <ul className="flex-1 overflow-y-auto">
        {visibleContacts.map((contact) => (
          <li key={contact.id}>
            <button
              onClick={() => handlePick(contact.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-line text-left"
            >
              <Avatar name={contact.displayName} src={contact.avatarUrl} size={38} />
              <span className="flex-1 min-w-0 truncate text-sm text-ink">{contact.displayName}</span>
            </button>
          </li>
        ))}
        {contacts.length === 0 && (
          <p className="px-4 py-3 text-sm text-ink-soft">
            Aucun contact pour l'instant — clique "Nouveau contact" pour en ajouter un.
          </p>
        )}
        {contacts.length > 0 && visibleContacts.length === 0 && (
          <p className="px-4 py-3 text-sm text-ink-soft">Aucun contact ne correspond.</p>
        )}
      </ul>

      {showGroupModal && <GroupCreateModal onClose={() => setShowGroupModal(false)} />}
      {showAddContact && (
        <AddContactModal
          existingContactIds={existingContactIds}
          onAdded={loadContacts}
          onClose={() => setShowAddContact(false)}
        />
      )}
    </div>
  );
}
