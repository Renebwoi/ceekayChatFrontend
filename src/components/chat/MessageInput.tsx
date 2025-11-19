import { Paperclip, Send } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onUploadFile: (file: File) => void;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onUploadFile,
  disabled,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage("");
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onUploadFile(file);
    event.target.value = "";
  };

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-4 shadow-inner">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-full border border-slate-200 p-3 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <div className="flex flex-1 flex-col gap-2">
          <textarea
            className="min-h-[80px] w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled}
          />
        </div>
        <button
          type="button"
          className="rounded-full bg-slate-900 p-3 text-white transition hover:bg-slate-800 disabled:bg-slate-300"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleUpload}
        disabled={disabled}
      />
    </div>
  );
}
