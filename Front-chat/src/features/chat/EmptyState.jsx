import { Icon } from "../../components/icons.jsx";

export function EmptyState({ title, subtitle }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-chat-bg px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-primary-tint flex items-center justify-center">
        <Icon.MessageCircle size={34} className="text-primary" />
      </div>
      <div>
        <p className="font-semibold text-ink text-lg">{title}</p>
        <p className="text-sm text-ink-soft mt-1 max-w-xs">{subtitle}</p>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-ink-soft mt-2">
        <Icon.Shield size={14} />
        Connexion chiffrée (TLS)
      </p>
    </div>
  );
}
