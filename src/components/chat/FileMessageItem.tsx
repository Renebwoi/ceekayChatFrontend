import { useCallback, useState, type MouseEvent } from "react";
import { Loader2, Paperclip, Pin } from "lucide-react";
import { messageApi } from "../../api/messageApi";
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
  const [isDownloading, setIsDownloading] = useState(false);

  const handleTogglePin = () => {
    if (pinning) return;
    if (isPinned) {
      onUnpin?.(message);
    } else {
      onPin?.(message);
    }
  };

  const pinButtonVisible = Boolean(canPin && (onPin || onUnpin));

  const handleDownload = useCallback(
    async (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (isDownloading) return;

      setIsDownloading(true);
      try {
        const response = await messageApi.downloadAttachment(
          message.courseId,
          message.id,
          attachment.downloadUrl
        );
        const blob = response.data;
        const fileName =
          deriveFileName(response.headers) || attachment.fileName || "download";
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectUrl);
      } catch (err) {
        console.error("Failed to download attachment", err);
      } finally {
        setIsDownloading(false);
      }
    },
    [
      attachment.downloadUrl,
      attachment.fileName,
      isDownloading,
      message.courseId,
      message.id,
    ]
  );

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
        href={attachment.downloadUrl ?? "#"}
        onClick={handleDownload}
        className={`flex flex-col rounded-xl border border-dashed px-4 py-3 transition ${
          isOwn
            ? "border-slate-700 bg-slate-800"
            : "border-slate-200 bg-slate-50"
        } ${
          isDownloading ? "cursor-wait opacity-70" : "hover:border-slate-300"
        }`}
      >
        <p className="font-semibold flex items-center gap-2">
          {attachment.fileName}
          {isDownloading && <Loader2 className="h-4 w-4 animate-spin" />}
        </p>
        <p className="text-xs opacity-70">
          {(attachment.size / 1024 / 1024).toFixed(2)} MB •{" "}
          {message.sender?.name}
        </p>
      </a>
    </div>
  );
}

function deriveFileName(headers: unknown): string | null {
  if (!headers || typeof headers !== "object") {
    return null;
  }

  const withGetter = headers as { get?: (name: string) => string | null };
  const recordHeaders = headers as Record<string, unknown>;

  const resolveHeader = (name: string): string | null => {
    const getterValue = typeof withGetter.get === "function"
      ? withGetter.get(name)
      : null;
    if (getterValue) {
      return getterValue;
    }

    const directValue = recordHeaders[name];
    if (typeof directValue === "string" && directValue) {
      return directValue;
    }

    const lowerValue = recordHeaders[name.toLowerCase()];
    if (typeof lowerValue === "string" && lowerValue) {
      return lowerValue;
    }

    return null;
  };

  const disposition =
    resolveHeader("content-disposition") ||
    resolveHeader("Content-Disposition");

  if (!disposition) {
    return null;
  }

  const match = /filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i.exec(
    disposition
  );

  if (!match) {
    return null;
  }

  const raw = match[1] || match[2];
  if (!raw) {
    return null;
  }

  try {
    return decodeURIComponent(raw);
  } catch (error) {
    console.warn("Failed to decode filename from header", error);
    return raw;
  }
}
