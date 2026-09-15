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
    const newTag = {
      id,
      name: cleanName,
      createdAt: new Date().toISOString(),
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
};
