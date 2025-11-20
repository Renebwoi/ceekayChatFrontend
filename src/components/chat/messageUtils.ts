import { Message, MessageReplySummary } from "../../types/api";

const MAX_PREVIEW_LENGTH = 80;

function truncate(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_PREVIEW_LENGTH) {
    return normalized;
  }
  return normalized.slice(0, MAX_PREVIEW_LENGTH - 1).trimEnd() + "…";
}

export function getMessagePreview(message?: Message | null): string {
  if (!message) {
    return "";
  }
  if (message.type === "FILE") {
    const fileName = message.attachment?.fileName;
    if (fileName) {
      return `Attachment • ${fileName}`;
    }
    return "Attachment";
  }
  if (typeof message.content === "string" && message.content.trim()) {
    return truncate(message.content);
  }
  return "Message";
}

export function getLatestReplyLabel(
  summary?: MessageReplySummary | null
): string {
  if (!summary) {
    return "";
  }
  const preview = truncate(summary.preview ?? summary.contentPreview ?? "");
  const author = summary.sender?.name?.trim();
  if (preview && author) {
    return `${author}: ${preview}`;
  }
  if (preview) {
    return preview;
  }
  if (author) {
    return `${author} replied`;
  }
  return "New reply";
}
