import { Loader2, Search, X } from "lucide-react";
import { Message } from "../../types/api";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ThreadPanel } from "./ThreadPanel";

interface ChatWindowProps {
  messages: Message[];
  currentUserId?: string;
  onSendMessage: (
    content: string,
    options?: { parentMessageId?: string | null }
  ) => void;
  onUploadFile: (
    file: File,
    options?: { parentMessageId?: string | null }
  ) => void;
  disabled?: boolean;
  canPin?: boolean;
  pinnedMessageId?: string | null;
  onPinMessage?: (messageId: string) => void;
  onUnpinMessage?: (messageId: string) => void;
  pinningMessageId?: string | null;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onClearSearch: () => void;
  isSearchActive?: boolean;
  searchResults?: Message[];
  searchLoading?: boolean;
  searchError?: string | null;
  searchHasMore?: boolean;
  onSearchLoadMore?: () => void;
  searchHighlightTerm?: string;
  onReplyToMessage?: (message: Message) => void;
  onOpenThread?: (message: Message) => void;
  replyTarget?: Message | null;
  onCancelReply?: () => void;
  threadParent?: Message | null;
  threadMessages?: Message[];
  threadLoading?: boolean;
  threadHasMore?: boolean;
  onThreadLoadMore?: () => void;
  onCloseThread?: () => void;
  messageLookup?: (messageId: string) => Message | undefined | null;
  threadError?: string | null;
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
  searchQuery,
  onSearchQueryChange,
  onClearSearch,
  isSearchActive = false,
  searchResults = [],
  searchLoading = false,
  searchError,
  searchHasMore = false,
  onSearchLoadMore,
  searchHighlightTerm,
  onReplyToMessage,
  onOpenThread,
  replyTarget,
  onCancelReply,
  threadParent,
  threadMessages = [],
  threadLoading,
  threadHasMore,
  onThreadLoadMore,
  onCloseThread,
  messageLookup,
  threadError,
}: ChatWindowProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search messages"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          {searchLoading ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
          ) : searchQuery ? (
            <button
              type="button"
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              onClick={onClearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
      </div>
      <div className="flex-1 min-h-0">
        {isSearchActive ? (
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
              <p className="text-sm font-semibold text-slate-600">
                Search results
                {searchResults.length
                  ? ` (${searchResults.length}${searchHasMore ? "+" : ""})`
                  : ""}
              </p>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-slate-700"
                onClick={onClearSearch}
              >
                Exit search
              </button>
            </div>
            <div className="flex-1 min-h-0">
              {searchLoading && !searchResults.length ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching messages…
                </div>
              ) : (
                <>
                  <MessageList
                    messages={searchResults}
                    currentUserId={currentUserId}
                    showPinnedSection={false}
                    highlightTerm={searchHighlightTerm}
                    emptyState={{
                      title: searchError
                        ? "Something went wrong"
                        : "No messages match your search",
                      description:
                        searchError ??
                        "Try a different keyword, phrase, or name.",
                    }}
                  />
                  {searchError && searchResults.length > 0 && (
                    <div className="border-t border-amber-200 bg-amber-50 px-6 py-3 text-xs text-amber-700">
                      {searchError}
                    </div>
                  )}
                </>
              )}
            </div>
            {searchHasMore && onSearchLoadMore && (
              <div className="border-t border-slate-200 bg-white px-6 py-3">
                <button
                  type="button"
                  className="w-full rounded-full border border-slate-200 bg-white py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={onSearchLoadMore}
                  disabled={Boolean(searchLoading)}
                >
                  {searchLoading ? "Loading…" : "Load more results"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col lg:flex-row">
            <div className="flex-1 min-h-0">
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                canPin={canPin}
                pinnedMessageId={pinnedMessageId}
                onPinMessage={onPinMessage}
                onUnpinMessage={onUnpinMessage}
                pinningMessageId={pinningMessageId}
                onReply={onReplyToMessage}
                onOpenThread={onOpenThread}
                getParentMessage={messageLookup}
              />
            </div>
            {threadParent && (
              <div className="mt-6 w-full shrink-0 lg:mt-0 lg:w-[360px] xl:w-[400px]">
                <ThreadPanel
                  parentMessage={threadParent}
                  replies={threadMessages}
                  currentUserId={currentUserId}
                  canPin={canPin}
                  onClose={onCloseThread}
                  onReply={onReplyToMessage}
                  onLoadMore={onThreadLoadMore}
                  loading={threadLoading}
                  hasMore={threadHasMore}
                />
                {threadError && (
                  <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                    {threadError}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <MessageInput
        onSendMessage={onSendMessage}
        onUploadFile={onUploadFile}
        disabled={disabled}
        replyTo={replyTarget}
        onCancelReply={onCancelReply}
      />
    </div>
  );
}
