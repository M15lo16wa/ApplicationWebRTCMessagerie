import { useRef, useState } from "react";
import { Avatar } from "../../components/Avatar.jsx";
import { Icon } from "../../components/icons.jsx";
import { useAuthStore } from "../../store/authStore.js";

function EditableField({ label, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  async function commit() {
    setEditing(false);
    if (draft !== value) await onSave(draft);
  }

  return (
    <div className="px-4 py-4 border-b border-line">
      <p className="text-xs font-medium text-ink-soft uppercase tracking-wide mb-1">{label}</p>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => event.key === "Enter" && commit()}
          className="w-full rounded-lg border border-line px-2 py-1 text-sm text-ink bg-app"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center justify-between w-full text-left text-sm text-ink"
        >
          {value || <span className="text-ink-soft italic">Ajouter…</span>}
          <Icon.Pencil size={14} className="text-ink-soft" />
        </button>
      )}
    </div>
  );
}

export function ProfilePanel({ onClose }) {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const uploadAvatar = useAuthStore((state) => state.uploadAvatar);
  const logout = useAuthStore((state) => state.logout);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAvatar(file);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="fixed inset-0 z-40 md:static md:z-auto w-full md:w-80 flex-shrink-0 border-l border-line bg-surface flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <h3 className="font-semibold text-ink">Profil</h3>
        <button onClick={onClose} aria-label="Fermer" className="text-ink-soft hover:text-ink">
          <Icon.X size={18} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 py-6 border-b border-line">
        <div className="relative">
          <Avatar name={user?.displayName} src={user?.avatarUrl} size={84} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center"
            aria-label="Changer la photo"
            disabled={uploading}
          >
            <Icon.Camera size={13} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        </div>
        <p className="font-semibold text-ink text-lg">{user?.displayName}</p>
        <p className="text-sm text-ink-soft">{user?.email}</p>
      </div>

      <EditableField
        label="Nom affiché"
        value={user?.displayName}
        onSave={(displayName) => updateProfile({ displayName })}
      />
      <EditableField
        label="À propos"
        value={user?.statusText}
        onSave={(statusText) => updateProfile({ statusText })}
      />

      <div className="flex-1" />

      <button
        onClick={logout}
        className="flex items-center gap-2 px-4 py-4 text-danger text-sm font-medium hover:bg-line"
      >
        <Icon.X size={16} />
        Déconnexion
      </button>
    </div>
  );
}
