import { useEffect, useMemo } from "react";
import { Icon } from "../../components/icons.jsx";

export function FilePreviewModal({ file, uploading, error, onCancel, onConfirm }) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isAudio = file.type.startsWith("audio/");

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={uploading ? undefined : onCancel}
    >
      <div
        className="bg-surface rounded-2xl shadow-lg w-full max-w-sm p-5 flex flex-col gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">Envoyer le fichier</h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            aria-label="Annuler"
            className="text-ink-soft hover:text-ink disabled:opacity-50"
          >
            <Icon.X size={18} />
          </button>
        </div>

        <div className="rounded-lg bg-app overflow-hidden flex items-center justify-center">
          {isImage && (
            <img src={previewUrl} alt={file.name} className="max-w-full max-h-64 object-contain" />
          )}
          {isVideo && <video src={previewUrl} controls className="max-w-full max-h-64" />}
          {isAudio && <audio src={previewUrl} controls className="w-full m-4" />}
          {!isImage && !isVideo && !isAudio && (
            <div className="flex flex-col items-center gap-2 py-8 text-ink-soft">
              <Icon.Paperclip size={28} />
              <span className="text-sm text-ink px-4 text-center break-all">{file.name}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-ink-soft text-center">{(file.size / (1024 * 1024)).toFixed(1)} Mo</p>

        {error && <p className="text-sm text-danger text-center">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="flex-1 py-2 rounded-full text-sm font-medium text-ink-soft hover:bg-line disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={uploading}
            className="flex-1 py-2 rounded-full text-sm font-medium bg-primary text-white disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              "Envoi…"
            ) : (
              <>
                <Icon.Send size={15} />
                Envoyer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
