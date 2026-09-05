import { useEffect, useRef, useState } from "react";
import { http } from "../../api/http.js";
import { FilePreviewModal } from "./FilePreviewModal.jsx";

const MAX_SIZE_MB = Number(import.meta.env.VITE_UPLOAD_MAX_SIZE_MB ?? 15);
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function FileDropzone({ conversationId }) {
  const inputRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timeout);
  }, [toast]);

  function handleFiles(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    setToast(null);

    if (file.size > MAX_SIZE_BYTES) {
      setToast(`Ce fichier dépasse la taille recommandée (${MAX_SIZE_MB} Mo).`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError(null);
    setPendingFile(file);
  }

  function cancelPending() {
    setPendingFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function confirmSend() {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", pendingFile);
      await http.post(`/files/${conversationId}`, formData);
      setPendingFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err.response?.data?.error ?? "Envoi du fichier impossible");
    } finally {
      setUploading(false);
    }
  }

  return (
    <span className="relative flex-shrink-0">
      {toast && (
        <span className="absolute bottom-full mb-2 left-0 whitespace-nowrap rounded-lg bg-danger text-white text-xs px-2 py-1">
          {toast}
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />
      <button
        type="button"
        title="Joindre un fichier"
        onClick={() => inputRef.current?.click()}
        className="text-xl text-ink-soft hover:text-ink"
      >
        📎
      </button>

      {pendingFile && (
        <FilePreviewModal
          file={pendingFile}
          uploading={uploading}
          error={error}
          onCancel={cancelPending}
          onConfirm={confirmSend}
        />
      )}
    </span>
  );
}
