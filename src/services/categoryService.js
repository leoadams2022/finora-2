import db from "../db/database";

/**
 * Helper to check duplicate category name (case-insensitive).
 */
export const checkDuplicateCategoryName = async (
  name,
  excludeCategoryId = null,
) => {
  const cleanName = name.trim().toLowerCase();
  const existing = await db.categories
    .filter(
      (c) =>
        c.name.trim().toLowerCase() === cleanName && c.id !== excludeCategoryId,
    )
    .first();
  return !!existing;
};

/**
 * Helper to check duplicate subcategory name under the same parent category (case-insensitive).
 */
export const checkDuplicateSubcategoryName = async (
  name,
  categoryId,
  excludeSubcategoryId = null,
) => {
  const cleanName = name.trim().toLowerCase();
  const existing = await db.subcategories
    .where("categoryId")
    .equals(categoryId)
    .filter(
      (s) =>
        s.name.trim().toLowerCase() === cleanName &&
        s.id !== excludeSubcategoryId,
    )
    .first();
  return !!existing;
};

export const categoryService = {
  // Category CRUD
  async getAllCategories(includeInactive = false) {
    if (includeInactive) {
      return await db.categories.toArray();
    }
    return await db.categories.filter((c) => c.isActive !== false).toArray();
  },

  async createCategory(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Category name is required.");
    }

    const isDuplicate = await checkDuplicateCategoryName(data.name);
    if (isDuplicate) {
      throw new Error(`A category named "${data.name.trim()}" already exists.`);
    }

    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const category = {
      id,
      name: data.name.trim(),
      type: data.type || "expense",
      icon: data.icon || "FolderTree",
      color: data.color || "#3b82f6",
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await db.categories.add(category);
    return category;
  },

  async updateCategory(id, data) {
    const existing = await db.categories.get(id);
    if (!existing) throw new Error("Category not found.");

    const targetName =
      data.name !== undefined ? data.name.trim() : existing.name;

    const isDuplicate = await checkDuplicateCategoryName(targetName, id);
    if (isDuplicate) {
      throw new Error(`A category named "${targetName}" already exists.`);
    }

    const updated = {
      ...existing,
      ...data,
      name: targetName,
      updatedAt: new Date().toISOString(),
    };

    await db.categories.put(updated);
    return updated;
  },

  async toggleArchiveCategory(id, archiveState = true) {
    await db.categories.update(id, {
      isActive: !archiveState,
      updatedAt: new Date().toISOString(),
    });
  },

  // Subcategory CRUD
  async getSubcategoriesByCategory(categoryId) {
    return await db.subcategories
      .where("categoryId")
      .equals(categoryId)
      .filter((sub) => sub.isActive !== false)
      .toArray();
  },

  async createSubcategory(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Subcategory name is required.");
    }
    if (!data.categoryId) {
      throw new Error("Parent category is required.");
    }

    const isDuplicate = await checkDuplicateSubcategoryName(
      data.name,
      data.categoryId,
    );
    if (isDuplicate) {
      throw new Error(
        `A subcategory named "${data.name.trim()}" already exists under this category.`,
      );
    }

    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const subcategory = {
      id,
      categoryId: data.categoryId,
      name: data.name.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await db.subcategories.add(subcategory);
    return subcategory;
  },

  async updateSubcategory(id, data) {
    const existing = await db.subcategories.get(id);
    if (!existing) throw new Error("Subcategory not found.");

    const targetName =
      data.name !== undefined ? data.name.trim() : existing.name;
    const parentCategoryId = data.categoryId || existing.categoryId;

    const isDuplicate = await checkDuplicateSubcategoryName(
      targetName,
      parentCategoryId,
      id,
    );
    if (isDuplicate) {
      throw new Error(
        `A subcategory named "${targetName}" already exists under this category.`,
      );
    }

    const updated = {
      ...existing,
      ...data,
      name: targetName,
      updatedAt: new Date().toISOString(),
    };

    await db.subcategories.put(updated);
    return updated;
  },

  async toggleArchiveSubcategory(id, archiveState = true) {
    await db.subcategories.update(id, {
      isActive: !archiveState,
      updatedAt: new Date().toISOString(),
    });
  },
};
