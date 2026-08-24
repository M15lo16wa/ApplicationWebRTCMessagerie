import { useRef, useState } from "react";
import { http } from "../../api/http.js";

export function FileDropzone({ conversationId }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await http.post(`/files/${conversationId}`, formData);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />
      <button
        type="button"
        title="Joindre un fichier"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="text-xl text-ink-soft hover:text-ink disabled:opacity-50"
      >
        {uploading ? "…" : "📎"}
      </button>
    </>
  );
}
