import { Loader2, X } from "lucide-react";
import { Message } from "../../types/api";
import { MessageList } from "./MessageList";

interface ThreadPanelProps {
  parentMessage: Message;
  replies: Message[];
  currentUserId?: string;
  canPin?: boolean;
  onClose?: () => void;
  onReply?: (message: Message) => void;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
}

export function ThreadPanel({
  parentMessage,
  replies,
  currentUserId,
  canPin,
  onClose,
  onReply,
  onLoadMore,
  loading,
  hasMore,
}: ThreadPanelProps) {
  const handleClose = () => {
    onClose?.();
  };

  return (
    <div className="flex h-full flex-col border-t border-slate-200 bg-white lg:border-t-0 lg:border-l">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Thread
          </p>
          <p className="text-sm font-medium text-slate-900">
            {parentMessage.sender?.name || "Conversation"}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close thread"
          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="border-b border-slate-200 px-4 py-4 h-24 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:'none'] [&::-webkit-scrollbar]:hidden">
        <MessageList
          messages={[parentMessage]}
          currentUserId={currentUserId}
          canPin={canPin}
          showPinnedSection={false}
          showParentContext={false}
          isThreadView
          onReply={onReply}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 [scrollbar-width:none] [-ms-overflow-style:'none'] [&::-webkit-scrollbar]:hidden">
        {loading && !replies.length ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading replies…
          </div>
        ) : (
          <MessageList
            messages={replies}
            currentUserId={currentUserId}
            canPin={canPin}
            showPinnedSection={false}
            showParentContext={false}
            isThreadView
            onReply={onReply}
          />
        )}
      </div>
      {hasMore && onLoadMore && (
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={onLoadMore}
            className="w-full rounded-full border border-slate-200 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={Boolean(loading)}
          >
            {loading ? "Loading…" : "Load more replies"}
          </button>
        </div>
      )}
    </div>
  );
}
