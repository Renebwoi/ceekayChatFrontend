import { Message, ReplyMeta } from "../../types/api";

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

export function buildReplyMetaFromMessage(
  message?: Message | null
): ReplyMeta | null {
  if (!message) {
    return null;
  }

  const senderName =
    typeof message.sender?.name === "string" && message.sender.name.trim()
      ? message.sender.name.trim()
      : "Unknown";

  const snippet = getMessagePreview(message);

  return {
    id: message.id,
    senderName,
    contentSnippet: snippet ? snippet : null,
    type: message.type,
  };
}

export function getReplyMetaPreview(meta?: ReplyMeta | null): string {
  if (!meta) {
    return "";
  }

  if (typeof meta.contentSnippet === "string" && meta.contentSnippet.trim()) {
    return meta.contentSnippet.trim();
  }

  if (meta.type === "FILE") {
    return "Attachment";
  }

  return "";
}
