import { Paperclip } from "lucide-react";
import { Message } from "../../types/api";

interface FileMessageItemProps {
  message: Message;
  isOwn?: boolean;
}

export function FileMessageItem({ message, isOwn }: FileMessageItemProps) {
  if (!message.attachment) return null;

  const { attachment } = message;
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex max-w-md flex-col rounded-2xl border px-4 py-3 text-sm shadow transition ${
        isOwn
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide">
        <Paperclip className="h-4 w-4" />
        File Attachment
      </div>
      <p className="font-semibold">{attachment.fileName}</p>
      <p className="text-xs opacity-70">
        {(attachment.size / 1024 / 1024).toFixed(2)} MB • {message.sender?.name}
      </p>
    </a>
  );
}
