export function StatusDot({ online }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full ring-2 ring-surface"
      style={{ background: online ? "var(--color-success)" : "var(--color-ink-soft)" }}
      aria-label={online ? "en ligne" : "hors ligne"}
    />
  );
}
