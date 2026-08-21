import {
  buildMineruCacheKey,
  type MineruCacheListItem,
} from "../chat/MinerUCacheService";

export type MineruLibraryRowStatus =
  | MineruCacheListItem["runtimeStatus"]
  | "uncached";

export interface MineruLibraryRow {
  cacheKey: string;
  attachmentKey: string;
  libraryID: number;
  title: string;
  fileName: string;
  creators: string;
  year: string;
  dateAdded: string;
  runtimeStatus: MineruLibraryRowStatus;
  errorMessage?: string;
  parsedAt?: number;
  tags: string[];
}

export interface MineruCollectionNode {
  key: string | null;
  name: string;
  count: number;
  depth: number;
  children: MineruCollectionNode[];
}

export interface MineruTagEntry {
  name: string;
  count: number;
  color: string;
}

export interface MineruTagSummary {
  tagged: number;
  untagged: number;
  tags: MineruTagEntry[];
}

const TAG_COLORS = [
  "#0a84ff",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

export function tagColor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash + name.charCodeAt(index) * (index + 1)) % TAG_COLORS.length;
  }
  return TAG_COLORS[hash] || TAG_COLORS[0];
}

export function formatCreatorLabel(item: Zotero.Item | null): string {
  if (!item) {
    return "-";
  }
  const creators = item.getCreators();
  if (!creators.length) {
    return "-";
  }
  const primary =
    creators[0].lastName ||
    creators[0].firstName ||
    "-";
  return creators.length > 1 ? `${primary} 等` : primary;
}

export function formatItemYear(item: Zotero.Item | null): string {
  if (!item) {
    return "-";
  }
  const year = String(item.getField("date") || item.getField("year") || "")
    .trim()
    .slice(0, 4);
  return year || "-";
}

export function formatZoteroDate(value: string | number | undefined): string {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPdfAttachment(item: Zotero.Item): Zotero.Item | null {
  if (item.isAttachment?.() && item.isPDFAttachment?.()) {
    return item;
  }
  if (!item.isAttachment?.()) {
    for (const attachmentID of item.getAttachments()) {
      const attachment = Zotero.Items.get(attachmentID);
      if (attachment?.isPDFAttachment?.()) {
        return attachment;
      }
    }
  }
  return null;
}

function resolveTitle(attachment: Zotero.Item, parent: Zotero.Item | null): string {
  if (parent) {
    const title = String(parent.getField("title") || "").trim();
    if (title) {
      return title;
    }
  }
  return attachment.attachmentFilename || attachment.getDisplayTitle();
}

function countPdfsInCollection(collection: Zotero.Collection): number {
  let count = 0;
  for (const item of collection.getChildItems()) {
    if (getPdfAttachment(item)) {
      count += 1;
    }
  }
  return count;
}

function buildCollectionChildren(
  libraryID: number,
  parentID: number | false,
  depth: number,
): MineruCollectionNode[] {
  const collections = Zotero.Collections.getByLibrary(libraryID).filter(
    (collection: Zotero.Collection) =>
      parentID === false
        ? !collection.parentID
        : collection.parentID === parentID,
  );
  return collections
    .map((collection: Zotero.Collection) => ({
      key: collection.key,
      name: collection.name,
      count: countPdfsInCollection(collection),
      depth,
      children: buildCollectionChildren(libraryID, collection.id, depth + 1),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function listAllPdfAttachments(
  libraryID = Zotero.Libraries.userLibraryID,
): Promise<Zotero.Item[]> {
  const search = new Zotero.Search({ libraryID });
  search.addCondition("itemType", "is", "attachment");
  const ids = await search.search();
  const attachments: Zotero.Item[] = [];
  for (const id of ids) {
    const attachment = Zotero.Items.get(id);
    if (attachment?.isPDFAttachment?.()) {
      attachments.push(attachment);
    }
  }
  return attachments;
}

export function listPdfAttachmentsInCollection(
  collection: Zotero.Collection,
): Zotero.Item[] {
  const attachments: Zotero.Item[] = [];
  for (const item of collection.getChildItems()) {
    const pdf = getPdfAttachment(item);
    if (pdf) {
      attachments.push(pdf);
    }
  }
  return attachments;
}

export async function buildCollectionTree(
  libraryID = Zotero.Libraries.userLibraryID,
  rootLabel: string,
): Promise<MineruCollectionNode> {
  const allPdfs = await listAllPdfAttachments(libraryID);
  return {
    key: null,
    name: rootLabel,
    count: allPdfs.length,
    depth: 0,
    children: buildCollectionChildren(libraryID, false, 1),
  };
}

export function buildTagSummary(pdfAttachments: readonly Zotero.Item[]): MineruTagSummary {
  const tagCounts = new Map<string, number>();
  let tagged = 0;
  let untagged = 0;
  for (const attachment of pdfAttachments) {
    const parent = attachment.parentItemID
      ? Zotero.Items.get(attachment.parentItemID)
      : null;
    const tagNames = (parent?.getTags?.() || [])
      .map((tag) => String(tag.tag || "").trim())
      .filter(Boolean);
    if (tagNames.length === 0) {
      untagged += 1;
      continue;
    }
    tagged += 1;
    for (const name of tagNames) {
      tagCounts.set(name, (tagCounts.get(name) || 0) + 1);
    }
  }
  const tags = [...tagCounts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      color: tagColor(name),
    }))
    .sort(
      (left, right) =>
        right.count - left.count || left.name.localeCompare(right.name),
    );
  return { tagged, untagged, tags };
}

export function buildLibraryRows(
  pdfAttachments: readonly Zotero.Item[],
  cacheItems: readonly MineruCacheListItem[],
  options: {
    tag?: string | null;
    search?: string;
  } = {},
): MineruLibraryRow[] {
  const cacheByKey = new Map(
    cacheItems.map((item) => [item.cacheKey, item] as const),
  );
  const query = options.search?.trim().toLowerCase() || "";
  const activeTag = options.tag?.trim() || "";

  const rows: MineruLibraryRow[] = [];
  for (const attachment of pdfAttachments) {
    const parent = attachment.parentItemID
      ? Zotero.Items.get(attachment.parentItemID)
      : null;
    const tags = (parent?.getTags?.() || [])
      .map((tag) => String(tag.tag || "").trim())
      .filter(Boolean);
    if (activeTag && !tags.includes(activeTag)) {
      continue;
    }

    const title = resolveTitle(attachment, parent);
    const creators = formatCreatorLabel(parent);
    const year = formatItemYear(parent);
    const dateAdded = formatZoteroDate(
      parent?.dateAdded || attachment.dateAdded,
    );
    const cacheKey = buildMineruCacheKey(
      attachment.libraryID,
      attachment.key,
    );
    const cached = cacheByKey.get(cacheKey);
    const runtimeStatus: MineruLibraryRowStatus =
      cached?.runtimeStatus || "uncached";

    if (
      query &&
      !title.toLowerCase().includes(query) &&
      !creators.toLowerCase().includes(query) &&
      !attachment.attachmentFilename.toLowerCase().includes(query)
    ) {
      continue;
    }

    rows.push({
      cacheKey,
      attachmentKey: attachment.key,
      libraryID: attachment.libraryID,
      title,
      fileName: attachment.attachmentFilename || "document.pdf",
      creators,
      year,
      dateAdded,
      runtimeStatus,
      errorMessage: cached?.errorMessage,
      parsedAt: cached?.parsedAt,
      tags,
    });
  }

  return rows.sort((left, right) => right.dateAdded.localeCompare(left.dateAdded));
}

export async function listPdfAttachmentsForScope(
  collectionKey: string | null,
  libraryID = Zotero.Libraries.userLibraryID,
): Promise<Zotero.Item[]> {
  if (!collectionKey) {
    return listAllPdfAttachments(libraryID);
  }
  const collection = Zotero.Collections.getByLibraryAndKey(
    libraryID,
    collectionKey,
  );
  if (!collection) {
    return [];
  }
  return listPdfAttachmentsInCollection(collection);
}
