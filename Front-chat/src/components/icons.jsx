const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ children, size = 20, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      {children}
    </svg>
  );
}

export const Icon = {
  Mail: (p) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  ),
  Lock: (p) => (
    <Svg {...p}>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  ),
  Eye: (p) => (
    <Svg {...p}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  ),
  EyeOff: (p) => (
    <Svg {...p}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a15.6 15.6 0 0 1-4 4.6M6.2 6.2A15.6 15.6 0 0 0 2 12s3.6 7 10 7c1.4 0 2.6-.3 3.7-.7" />
      <path d="M9.5 9.5a3 3 0 0 0 4.2 4.2" />
    </Svg>
  ),
  Search: (p) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  ),
  Phone: (p) => (
    <Svg {...p}>
      <path d="M4 5c0 8.3 6.7 15 15 15l2-3.5-5-2-1.5 1.5A11.4 11.4 0 0 1 8 10.5L9.5 9 7.5 4Z" />
    </Svg>
  ),
  Video: (p) => (
    <Svg {...p}>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m16 10 6-3.5v11L16 14" />
    </Svg>
  ),
  DotsVertical: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="5" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" />
    </Svg>
  ),
  Pencil: (p) => (
    <Svg {...p}>
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5.5 16.5Z" />
      <path d="m14 6 4 4" />
    </Svg>
  ),
  MessageCircle: (p) => (
    <Svg {...p}>
      <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L4 21l1.4-4.6A8.5 8.5 0 1 1 21 12Z" />
    </Svg>
  ),
  Users: (p) => (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6M18.5 20a6.2 6.2 0 0 0-3.7-5.7" />
    </Svg>
  ),
  Settings: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H11a1.7 1.7 0 0 0 1-1.5V5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V11a1.7 1.7 0 0 0 1.5 1H19a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </Svg>
  ),
  ChevronRight: (p) => (
    <Svg {...p}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  ),
  Image: (p) => (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5 18 5-5 4 4 3-3 3 3" />
    </Svg>
  ),
  Bell: (p) => (
    <Svg {...p}>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Svg>
  ),
  X: (p) => (
    <Svg {...p}>
      <path d="m5 5 14 14M19 5 5 19" />
    </Svg>
  ),
  Check: (p) => (
    <Svg {...p}>
      <path d="m4 12 5 5L20 6" />
    </Svg>
  ),
  CheckCheck: (p) => (
    <Svg {...p}>
      <path d="m2 12 4.5 4.5L15 8" />
      <path d="m8.5 12 4.5 4.5L22 8" />
    </Svg>
  ),
  Send: (p) => (
    <Svg {...p}>
      <path d="M4 11.5 20 4l-6.5 16-2.8-7.2L4 11.5Z" />
    </Svg>
  ),
  Smile: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 10.5h.01M15.5 10.5h.01" strokeWidth="2.4" />
      <path d="M8 14.5s1.5 2.5 4 2.5 4-2.5 4-2.5" />
    </Svg>
  ),
  Paperclip: (p) => (
    <Svg {...p}>
      <path d="M18.5 12.5 11 20a4 4 0 0 1-5.7-5.7l8-8a2.6 2.6 0 0 1 3.7 3.7l-7.7 7.7a1.2 1.2 0 0 1-1.7-1.7l7-7" />
    </Svg>
  ),
  Shield: (p) => (
    <Svg {...p}>
      <path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  ),
  Slash: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.5 5.5 13 13" />
    </Svg>
  ),
  Camera: (p) => (
    <Svg {...p}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13.5" r="3.2" />
      <path d="M9 7l1.2-2h3.6L15 7" />
    </Svg>
  ),
  Mic: (p) => (
    <Svg {...p}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
    </Svg>
  ),
  Trash: (p) => (
    <Svg {...p}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </Svg>
  ),
};
