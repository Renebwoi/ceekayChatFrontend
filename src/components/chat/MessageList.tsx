import { Message } from "../../types/api";
import { FileMessageItem } from "./FileMessageItem";
import { TextMessageItem } from "./TextMessageItem";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
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

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto px-6 py-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.senderId === currentUserId ? "justify-end" : "justify-start"
          }`}
        >
          {message.type === "FILE" ? (
            <FileMessageItem
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ) : (
            <TextMessageItem
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          )}
        </div>
      ))}
    </div>
  );
}
