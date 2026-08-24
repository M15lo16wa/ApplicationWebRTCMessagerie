import { Avatar } from "../../components/Avatar.jsx";
import { Icon } from "../../components/icons.jsx";
import { useAuthStore } from "../../store/authStore.js";

const NAV_ITEMS = [
  { key: "chat", icon: Icon.MessageCircle, label: "Discussions" },
  { key: "contacts", icon: Icon.Users, label: "Contacts" },
  { key: "calls", icon: Icon.Phone, label: "Appels" },
];

export function IconRail({ view, onChangeView, onOpenProfile }) {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="w-16 flex-shrink-0 bg-surface border-r border-line flex flex-col items-center py-4 gap-2">
      <button onClick={onOpenProfile} title="Mon profil" className="mb-2">
        <Avatar name={user?.displayName} src={user?.avatarUrl} size={36} />
      </button>

      {NAV_ITEMS.map(({ key, icon: ItemIcon, label }) => (
        <button
          key={key}
          title={label}
          onClick={() => onChangeView(key)}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
            view === key ? "bg-primary-tint text-primary" : "text-ink-soft hover:bg-line"
          }`}
        >
          <ItemIcon size={21} />
        </button>
      ))}

      <div className="flex-1" />

      <button
        title="Paramètres"
        onClick={onOpenProfile}
        className="w-11 h-11 rounded-xl flex items-center justify-center text-ink-soft hover:bg-line"
      >
        <Icon.Settings size={21} />
      </button>
    </div>
  );
}
