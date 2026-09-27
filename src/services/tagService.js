import db from "../db/database";

/**
 * Service managing Tag CRUD operations in Dexie.
 */
export const tagService = {
  async getAllTags() {
    return await db.tags.toArray();
  },

  async createTag(name) {
    if (!name || !name.trim()) {
      throw new Error("Tag name is required.");
    }

    const cleanName = name.trim().replace(/^#/, "");
    const existing = await db.tags
      .filter((t) => t.name.toLowerCase() === cleanName.toLowerCase())
      .first();

    if (existing) {
      throw new Error(`Tag "#${cleanName}" already exists.`);
    }

    const id = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Get current tags count to append new item to the end
    const totalExistingItems = await db.tags.count();

    const newTag = {
      id,
      name: cleanName,
      createdAt: new Date().toISOString(),
      sortOrder: totalExistingItems,
    };

    await db.tags.add(newTag);
    return newTag;
  },

  async updateTag(id, name) {
    if (!name || !name.trim()) {
      throw new Error("Tag name is required.");
    }

    const cleanName = name.trim().replace(/^#/, "");
    const existing = await db.tags
      .filter(
        (t) => t.name.toLowerCase() === cleanName.toLowerCase() && t.id !== id,
      )
      .first();

    if (existing) {
      throw new Error(`Tag "#${cleanName}" already exists.`);
    }

    await db.tags.update(id, { name: cleanName });
  },

  async deleteTag(id) {
    await db.tags.delete(id);
  },

  /**
   * Reorder tags atomically.
   * @param {string[]} orderedIds - Array of tag IDs in new order.
   */
  async reorderTags(orderedIds) {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) return;

    const now = new Date().toISOString();

    return await db.transaction("rw", [db.tags, db.auditLogs], async () => {
      for (let index = 0; index < orderedIds.length; index++) {
        await db.tags.update(orderedIds[index], {
          sortOrder: index,
          updatedAt: now,
        });
      }

      await db.auditLogs.add({
        id: `log_${Date.now()}`,
        entityType: "tag",
        action: "REORDER",
        details: `Reordered ${orderedIds.length} tags`,
        timestamp: now,
      });
    });
  },
};
