import { Message } from "../../types/api";

interface TextMessageItemProps {
  message: Message;
  isOwn?: boolean;
}

export function TextMessageItem({ message, isOwn }: TextMessageItemProps) {
  return (
    <div
      className={`max-w-md rounded-2xl px-4 py-3 text-sm shadow transition ${
        isOwn ? "bg-slate-900 text-white" : "bg-white text-slate-900"
      }`}
    >
      {message.sender && (
        <p
          className={`text-xs font-semibold uppercase tracking-wide ${
            isOwn ? "text-slate-200" : "text-slate-500"
          }`}
        >
          {message.sender.name}
        </p>
      )}
      <p className="mt-1 whitespace-pre-line leading-relaxed">
        {message.content}
      </p>
      <p
        className={`mt-2 text-xs ${
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
