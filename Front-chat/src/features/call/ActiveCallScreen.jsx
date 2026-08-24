import { useEffect, useRef, useState } from "react";
import { Avatar } from "../../components/Avatar.jsx";
import { Icon } from "../../components/icons.jsx";
import { useAuthStore } from "../../store/authStore.js";
import { useCallStore } from "../../store/callStore.js";
import { useConversationsStore } from "../../store/conversationsStore.js";
import { endCall, switchCamera } from "./useWebRTC.js";

function formatDuration(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function ActiveCallScreen() {
  const { phase, type, conversationId, peerId, localStream, remoteStream, connectionQuality } = useCallStore();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const conversation = useConversationsStore((state) =>
    state.conversations.find((c) => c.id === conversationId),
  );
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const otherId = peerId ?? conversation?.participants.find((p) => p.userId !== currentUserId)?.userId;
  const peer = conversation?.participants.find((p) => p.userId === otherId)?.user;
  const isVideo = type === "video";

  useEffect(() => {
    const el = localVideoRef.current;
    if (!el) return;
    el.srcObject = localStream ?? null;
    if (localStream) el.play().catch(() => {});
  }, [localStream]);

  const hasLocalVideo = (localStream?.getVideoTracks() ?? []).some((t) => t.readyState === "live");
  const hasRemoteVideo = (remoteStream?.getVideoTracks() ?? []).some((t) => t.readyState === "live");

  useEffect(() => {
    const el = isVideo ? remoteVideoRef.current : remoteAudioRef.current;
    if (!el) return;
    el.srcObject = remoteStream ?? null;
    if (!remoteStream) return;

    el.play()
      .then(() => setAudioBlocked(false))
      .catch(() => setAudioBlocked(true));
  }, [remoteStream, isVideo]);

  function retryAudio() {
    const el = isVideo ? remoteVideoRef.current : remoteAudioRef.current;
    el?.play()
      .then(() => setAudioBlocked(false))
      .catch(() => setAudioBlocked(true));
  }

  useEffect(() => {
    if (phase !== "active") {
      setSeconds(0);
      return;
    }
    const interval = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  function toggleMute() {
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setMuted((value) => !value);
  }

  function toggleVideo() {
    localStream?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setVideoOff((value) => !value);
  }

  async function handleSwitchCamera() {
    setSwitching(true);
    try {
      await switchCamera();
    } finally {
      setSwitching(false);
    }
  }

  const statusLabel = phase === "outgoing" ? "Appel en cours…" : formatDuration(seconds);
  const unstable = connectionQuality === "unstable";

  if (isVideo) {
    return (
      <div className="fixed inset-0 bg-black z-[100] text-white">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        {!hasRemoteVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar name={peer?.displayName ?? "Appel"} src={peer?.avatarUrl} size={96} />
          </div>
        )}
        <div className="absolute bottom-24 right-6 w-28 h-40 rounded-xl overflow-hidden border-2 border-white/30 bg-white/10">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!hasLocalVideo && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-center px-1 opacity-80">
              Caméra indisponible
            </div>
          )}
        </div>
        <div className="absolute top-4 left-4 bg-black/40 rounded-full px-3 py-1 text-sm flex items-center gap-2">
          {peer?.displayName} · {statusLabel}
          {unstable && (
            <span className="flex items-center gap-1 text-amber-300 text-xs" title="Connexion instable">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              instable
            </span>
          )}
        </div>
        {audioBlocked && (
          <button
            onClick={retryAudio}
            className="absolute top-16 left-1/2 -translate-x-1/2 bg-danger text-white text-sm rounded-full px-4 py-2"
          >
            🔇 Activer le son
          </button>
        )}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 rounded-full px-5 py-3">
          <button
            onClick={toggleMute}
            className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center"
            aria-label={muted ? "Réactiver le micro" : "Couper le micro"}
          >
            <MicIcon muted={muted} />
          </button>
          <button
            onClick={toggleVideo}
            className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center"
            aria-label={videoOff ? "Réactiver la caméra" : "Couper la caméra"}
          >
            <CameraIcon off={videoOff} />
          </button>
          <button
            onClick={handleSwitchCamera}
            disabled={switching}
            className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center disabled:opacity-50"
            aria-label="Changer de caméra"
          >
            <Icon.Camera size={18} />
          </button>
          <button
            onClick={endCall}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-danger)" }}
            aria-label="Raccrocher"
          >
            <Icon.Phone size={20} className="rotate-[135deg]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] px-4">
      <audio ref={remoteAudioRef} autoPlay />
      <div className="w-full max-w-72 bg-[#1c2622] rounded-3xl flex flex-col items-center gap-6 py-10 px-6 text-white shadow-2xl">
        <Avatar name={peer?.displayName ?? "Appel"} src={peer?.avatarUrl} size={88} />
        <div className="text-center">
          <p className="text-lg font-semibold">{peer?.displayName ?? "Appel en cours"}</p>
          <p className="text-sm opacity-70 mt-1 font-mono">{statusLabel}</p>
          {unstable && (
            <p className="flex items-center justify-center gap-1 text-amber-300 text-xs mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              Connexion instable
            </p>
          )}
        </div>
        {audioBlocked && (
          <button onClick={retryAudio} className="bg-danger text-white text-sm rounded-full px-4 py-2">
            🔇 Activer le son
          </button>
        )}
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleMute}
              className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center"
              aria-label={muted ? "Réactiver le micro" : "Couper le micro"}
            >
              <MicIcon muted={muted} />
            </button>
            <span className="text-xs opacity-70">{muted ? "Réactiver" : "Silence"}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={endCall}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-danger)" }}
              aria-label="Raccrocher"
            >
              <Icon.Phone size={20} className="rotate-[135deg]" />
            </button>
            <span className="text-xs opacity-70">Raccrocher</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MicIcon({ muted }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      {muted && <path d="M4 4l16 16" />}
    </svg>
  );
}

function CameraIcon({ off }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m16 10 6-3.5v11L16 14" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}
