import { Loader2, Pin } from "lucide-react";
import { Message } from "../../types/api";

interface TextMessageItemProps {
  message: Message;
  isOwn?: boolean;
  canPin?: boolean;
  onPin?: (message: Message) => void;
  onUnpin?: (message: Message) => void;
  isPinned?: boolean;
  pinning?: boolean;
  showPinnedLabel?: boolean;
}

export function TextMessageItem({
  message,
  isOwn,
  canPin,
  onPin,
  onUnpin,
  isPinned,
  pinning,
  showPinnedLabel,
}: TextMessageItemProps) {
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
      className={`max-w-md rounded-2xl px-4 py-3 text-sm shadow transition ${
        isOwn ? "bg-slate-900 text-white" : "bg-white text-slate-900"
      } ${isPinned ? "ring-1 ring-amber-400" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {message.sender && (
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                isOwn ? "text-slate-200" : "text-slate-500"
              }`}
            >
              {message.sender.name}
            </p>
          )}
          {(showPinnedLabel || isPinned) && (
            <div
              className={`mt-1 flex items-center gap-1 text-[10px] font-semibold uppercase ${
                isOwn ? "text-amber-200" : "text-amber-600"
              }`}
            >
              <Pin className="h-3 w-3" />
              Pinned
            </div>
          )}
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
                className={`h-3.5 w-3.5 ${
                  isPinned ? "fill-current" : ""
                }`}
              />
            )}
          </button>
        )}
      </div>
      <p className="mt-2 whitespace-pre-line leading-relaxed">
        {message.content}
      </p>
      <p
        className={`mt-3 text-xs ${
          isOwn ? "text-slate-300" : "text-slate-400"
        }`}
      >
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
