import { Loader2, Pin } from "lucide-react";
import type { ReactNode } from "react";
import { Message } from "../../types/api";
import { getLatestReplyLabel, getMessagePreview } from "./messageUtils";

interface TextMessageItemProps {
  message: Message;
  isOwn?: boolean;
  canPin?: boolean;
  onPin?: (message: Message) => void;
  onUnpin?: (message: Message) => void;
  isPinned?: boolean;
  pinning?: boolean;
  showPinnedLabel?: boolean;
  highlightTerm?: string;
  parentMessage?: Message | null;
  onReply?: (message: Message) => void;
  onOpenThread?: (message: Message) => void;
  replyCount?: number;
  latestReply?: Message["latestReply"];
  isThreadMessage?: boolean;
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
  highlightTerm,
  parentMessage,
  onReply,
  onOpenThread,
  replyCount = 0,
  latestReply,
  isThreadMessage,
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
  const parentPreview = parentMessage ? getMessagePreview(parentMessage) : "";
  const parentAuthor = parentMessage?.sender?.name ?? "";
  const hasReplies = replyCount > 0;
  const latestReplyLabel = getLatestReplyLabel(latestReply);

  const handleReplyClick = () => {
    onReply?.(message);
  };

  const handleOpenThread = () => {
    onOpenThread?.(message);
  };

  const renderContent = (): ReactNode => {
    const baseContent =
      typeof message.content === "string" ? message.content : "";
    const trimmedTerm = highlightTerm?.trim();

    if (!trimmedTerm) {
      return baseContent;
    }

    const escapedTerm = escapeRegExp(trimmedTerm);
    if (!escapedTerm) {
      return baseContent;
    }

    const regex = new RegExp(`(${escapedTerm})`, "gi");
    const segments = baseContent.split(regex);

    return segments.map((segment, index) => {
      if (!segment) {
        return segment;
      }

      if (index % 2 === 1) {
        return (
          <mark
            key={`${message.id}-highlight-${index}`}
            className={`rounded bg-amber-200 px-1 py-0.5 ${
              isOwn ? "text-slate-900" : ""
            }`}
          >
            {segment}
          </mark>
        );
      }

      return <span key={`${message.id}-text-${index}`}>{segment}</span>;
    });
  };

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
                className={`h-3.5 w-3.5 ${isPinned ? "fill-current" : ""}`}
              />
            )}
          </button>
        )}
      </div>
      {parentMessage && (
        <div
          className={`mt-3 rounded-xl border px-3 py-2 text-xs leading-snug ${
            isOwn
              ? "border-slate-700 bg-slate-800/60 text-slate-200"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          <p className="font-semibold uppercase tracking-wide">
            Replying to {parentAuthor || "message"}
          </p>
          {parentPreview && (
            <p
              className={`mt-1 text-xs ${
                isOwn ? "text-slate-200" : "text-slate-500"
              }`}
            >
              {parentPreview}
            </p>
          )}
        </div>
      )}
      <p className="mt-2 whitespace-pre-line leading-relaxed">
        {renderContent()}
      </p>
      {(onReply || (hasReplies && onOpenThread && !isThreadMessage)) && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          {onReply && (
            <button
              type="button"
              onClick={handleReplyClick}
              className={`font-semibold transition ${
                isOwn
                  ? "text-slate-200 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Reply
            </button>
          )}
          {hasReplies && onOpenThread && !isThreadMessage && (
            <button
              type="button"
              onClick={handleOpenThread}
              className={`rounded-full border px-3 py-1 transition ${
                isOwn
                  ? "border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
              }`}
            >
              {replyCount === 1 ? "1 reply" : `${replyCount} replies`}
              {latestReplyLabel && (
                <span className="ml-2 text-[11px] font-normal text-slate-400">
                  {latestReplyLabel}
                </span>
              )}
            </button>
          )}
        </div>
      )}
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
