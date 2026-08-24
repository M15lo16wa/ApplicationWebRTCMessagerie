import { useEffect } from "react";
import { Icon } from "../../components/icons.jsx";
import { useCallStore } from "../../store/callStore.js";

export function CallErrorToast() {
  const error = useCallStore((state) => state.error);
  const setError = useCallStore((state) => state.setError);

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(null), 6000);
    return () => clearTimeout(timeout);
  }, [error, setError]);

  if (!error) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-danger text-white rounded-full pl-4 pr-2 py-2 flex items-center gap-3 shadow-lg text-sm max-w-[90vw]">
      <span>{error}</span>
      <button
        onClick={() => setError(null)}
        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 flex-shrink-0"
        aria-label="Fermer"
      >
        <Icon.X size={14} />
      </button>
    </div>
  );
}
