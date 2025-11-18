import { Loader2, Paperclip, Pin } from "lucide-react";
import { Message } from "../../types/api";

interface FileMessageItemProps {
  message: Message;
  isOwn?: boolean;
  canPin?: boolean;
  onPin?: (message: Message) => void;
  onUnpin?: (message: Message) => void;
  isPinned?: boolean;
  pinning?: boolean;
  showPinnedLabel?: boolean;
}

export function FileMessageItem({
  message,
  isOwn,
  canPin,
  onPin,
  onUnpin,
  isPinned,
  pinning,
  showPinnedLabel,
}: FileMessageItemProps) {
  if (!message.attachment) return null;

  const { attachment } = message;

  const handleTogglePin = () => {
    if (pinning) return;
    if (isPinned) {
      onUnpin?.(message);
    } else {
      onPin?.(message);
    }
  };

  const pinButtonVisible = Boolean(canPin && (onPin || onUnpin));

  return (
    <div
      className={`max-w-md rounded-2xl border px-4 py-3 text-sm shadow transition ${
        isOwn
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-900"
      } ${isPinned ? "ring-1 ring-amber-400" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {(showPinnedLabel || isPinned) && (
            <div
              className={`mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase ${
                isOwn ? "text-amber-200" : "text-amber-600"
              }`}
            >
              <Pin className="h-3 w-3" />
              Pinned
            </div>
          )}
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide">
            <Paperclip className="h-4 w-4" />
            File Attachment
          </div>
        </div>
        {pinButtonVisible && (
          <button
            type="button"
            aria-label={isPinned ? "Unpin message" : "Pin message"}
            className={`rounded-full border p-1 transition ${
              isOwn
                ? "border-slate-700 text-slate-200 hover:border-amber-300 hover:text-amber-200"
                : "border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600"
            } ${pinning ? "opacity-60" : ""}`}
            onClick={handleTogglePin}
            disabled={pinning}
          >
            {pinning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Pin
                className={`h-3.5 w-3.5 ${isPinned ? "fill-current" : ""}`}
              />
            )}
          </button>
        )}
      </div>
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-col rounded-xl border border-dashed px-4 py-3 transition ${
          isOwn
            ? "border-slate-700 bg-slate-800"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <p className="font-semibold">{attachment.fileName}</p>
        <p className="text-xs opacity-70">
          {(attachment.size / 1024 / 1024).toFixed(2)} MB •{" "}
          {message.sender?.name}
        </p>
      </a>
    </div>
  );
}
