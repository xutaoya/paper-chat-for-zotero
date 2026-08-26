export function isZoteroItemAlive(item: unknown): item is Zotero.Item {
  if (!item || typeof item !== "object") {
    return false;
  }
  try {
    void (item as Zotero.Item).id;
    return true;
  } catch {
    return false;
  }
}

export function getZoteroItem(id: number): Zotero.Item | null {
  try {
    const item = Zotero.Items.get(id);
    return isZoteroItemAlive(item) ? item : null;
  } catch {
    return null;
  }
}

export function getZoteroItemByKey(
  libraryID: number,
  key: string,
): Zotero.Item | null {
  try {
    const item = Zotero.Items.getByLibraryAndKey(libraryID, key);
    return isZoteroItemAlive(item) ? item : null;
  } catch {
    return null;
  }
}

export function getParentItem(attachment: Zotero.Item): Zotero.Item | null {
  try {
    const parentID = attachment.parentItemID;
    if (!parentID) {
      return null;
    }
    return getZoteroItem(parentID);
  } catch {
    return null;
  }
}

export function getCollectionChildItems(
  collection: Zotero.Collection,
): Zotero.Item[] {
  try {
    const items: Zotero.Item[] = [];
    for (const item of collection.getChildItems()) {
      if (isZoteroItemAlive(item)) {
        items.push(item);
      }
    }
    return items;
  } catch {
    return [];
  }
}
