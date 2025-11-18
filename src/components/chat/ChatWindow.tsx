import { Message } from "../../types/api";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

interface ChatWindowProps {
  messages: Message[];
  currentUserId?: string;
  onSendMessage: (content: string) => void;
  onUploadFile: (file: File, caption?: string) => void;
  disabled?: boolean;
  canPin?: boolean;
  pinnedMessageId?: string | null;
  onPinMessage?: (messageId: string) => void;
  onUnpinMessage?: (messageId: string) => void;
  pinningMessageId?: string | null;
}

export function ChatWindow({
  messages,
  currentUserId,
  onSendMessage,
  onUploadFile,
  disabled,
  canPin,
  pinnedMessageId,
  onPinMessage,
  onUnpinMessage,
  pinningMessageId,
}: ChatWindowProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <div className="flex-1 min-h-0">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          canPin={canPin}
          pinnedMessageId={pinnedMessageId}
          onPinMessage={onPinMessage}
          onUnpinMessage={onUnpinMessage}
          pinningMessageId={pinningMessageId}
        />
      </div>
      <MessageInput
        onSendMessage={onSendMessage}
        onUploadFile={onUploadFile}
        disabled={disabled}
      />
    </div>
  );
}
