function initials(name) {
  return (name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, src, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className="rounded-full object-cover flex-shrink-0"
      />
    );
  }

  return (
    <div
      style={style}
      className="rounded-full bg-primary-tint text-primary font-semibold flex items-center justify-center flex-shrink-0"
    >
      {initials(name)}
    </div>
  );
}
