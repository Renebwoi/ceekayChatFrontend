import { Pin } from "lucide-react";
import { Message } from "../../types/api";
import { FileMessageItem } from "./FileMessageItem";
import { TextMessageItem } from "./TextMessageItem";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  pinnedMessageId?: string | null;
  canPin?: boolean;
  onPinMessage?: (messageId: string) => void;
  onUnpinMessage?: (messageId: string) => void;
  pinningMessageId?: string | null;
}

export function MessageList({
  messages,
  currentUserId,
  pinnedMessageId,
  canPin,
  onPinMessage,
  onUnpinMessage,
  pinningMessageId,
}: MessageListProps) {
  if (!messages.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-500">
        <p className="text-lg font-semibold">No messages yet</p>
        <p className="text-sm">
          Start the conversation by posting the first message.
        </p>
      </div>
    );
  }

  const pinnedMessage = pinnedMessageId
    ? messages.find((message) => message.id === pinnedMessageId)
    : messages.find((message) => message.isPinned);

  const otherMessages = pinnedMessage
    ? messages.filter((message) => message.id !== pinnedMessage.id)
    : messages;

  const renderMessage = (message: Message, isPinnedSection = false) => {
    const isOwn = message.senderId === currentUserId;
    const isPinned = Boolean(isPinnedSection || message.isPinned);
    const pinning = pinningMessageId === message.id;

    const handlePin = canPin
      ? (target: Message) => onPinMessage?.(target.id)
      : undefined;

    const handleUnpin = canPin
      ? (target: Message) => onUnpinMessage?.(target.id)
      : undefined;

    return message.type === "FILE" ? (
      <FileMessageItem
        message={message}
        isOwn={isOwn}
        canPin={canPin}
        onPin={handlePin}
        onUnpin={handleUnpin}
        isPinned={isPinned}
        pinning={pinning}
        showPinnedLabel={isPinnedSection}
      />
    ) : (
      <TextMessageItem
        message={message}
        isOwn={isOwn}
        canPin={canPin}
        onPin={handlePin}
        onUnpin={handleUnpin}
        isPinned={isPinned}
        pinning={pinning}
        showPinnedLabel={isPinnedSection}
      />
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {pinnedMessage && (
        <div className="shrink-0 border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-amber-600">
            <div className="flex items-center gap-2">
              <Pin className="h-3 w-3" />
              Pinned Message
            </div>
            {pinnedMessage.pinnedBy?.name && (
              <span className="text-slate-400 normal-case">
                by {pinnedMessage.pinnedBy.name}
              </span>
            )}
          </div>
          <div
            className={`mt-3 flex ${
              pinnedMessage.senderId === currentUserId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {renderMessage(pinnedMessage, true)}
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-3">
          {otherMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {renderMessage(message)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
