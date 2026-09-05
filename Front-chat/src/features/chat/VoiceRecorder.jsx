import { useEffect, useRef, useState } from "react";
import { http } from "../../api/http.js";
import { Icon } from "../../components/icons.jsx";

function formatDuration(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function VoiceRecorder({ conversationId, onRecordingChange }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    onRecordingChange?.(recording);
  }, [recording, onRecordingChange]);

  useEffect(() => {
    if (!recording) return;
    const interval = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timeout);
  }, [error]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => () => {
    mediaRecorderRef.current?.stop();
    stopStream();
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      cancelledRef.current = false;

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stopStream();
        const chunks = chunksRef.current;
        chunksRef.current = [];
        if (cancelledRef.current || chunks.length === 0) return;

        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", blob, `vocal-${Date.now()}.webm`);
          await http.post(`/files/${conversationId}`, formData);
        } catch (err) {
          setError(err.response?.data?.error ?? "Envoi du message vocal impossible");
        } finally {
          setUploading(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setRecording(true);
    } catch {
      setError("Micro inaccessible");
    }
  }

  function stopAndSend() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function cancelRecording() {
    cancelledRef.current = true;
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  if (recording) {
    return (
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={cancelRecording}
          aria-label="Annuler l'enregistrement"
          className="text-danger flex-shrink-0"
        >
          <Icon.Trash size={19} />
        </button>
        <span className="flex items-center gap-2 text-sm text-ink flex-1 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse flex-shrink-0" />
          {formatDuration(seconds)}
        </span>
        <button
          type="button"
          onClick={stopAndSend}
          aria-label="Envoyer le message vocal"
          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0"
        >
          <Icon.Send size={16} />
        </button>
      </div>
    );
  }

  return (
    <span className="relative flex-shrink-0">
      {error && (
        <span className="absolute bottom-full mb-2 right-0 whitespace-nowrap rounded-lg bg-danger text-white text-xs px-2 py-1">
          {error}
        </span>
      )}
      <button
        type="button"
        title="Message vocal"
        disabled={uploading}
        onClick={startRecording}
        className="w-10 h-10 rounded-full hover:bg-line flex items-center justify-center text-ink-soft disabled:opacity-50"
      >
        {uploading ? "…" : <Icon.Mic size={19} />}
      </button>
    </span>
  );
}
