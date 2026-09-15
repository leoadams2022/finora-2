// src/services/peopleService.js

import db from "../db/database";

export const peopleService = {
  /**
   * Fetch all non-deleted people and entities.
   */
  async getAll() {
    return await db.peopleEntities.toArray();
  },

  /**
   * Helper function to check if a person or entity with the given name already exists.
   */
  async checkDuplicateName(name, excludeId = null) {
    if (!name || !name.trim()) return false;
    const cleanName = name.trim().toLowerCase();

    const allEntities = await db.peopleEntities.toArray();
    return allEntities.some(
      (pe) =>
        pe.name.toLowerCase() === cleanName &&
        (!excludeId || pe.id !== excludeId),
    );
  },

  /**
   * Create a new Person or Entity record.
   * Enforces name presence and uniqueness.
   */
  async create(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Name is required.");
    }

    const trimmedName = data.name.trim();

    // Check for duplicate name
    const isDuplicate = await this.checkDuplicateName(trimmedName);
    if (isDuplicate) {
      throw new Error(
        `A contact or entity named "${trimmedName}" already exists.`,
      );
    }

    const id = `pe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const person = {
      id,
      name: trimmedName,
      type: data.type || "Person",
      phone: data.phone ? data.phone.trim() : "",
      email: data.email ? data.email.trim() : "",
      notes: data.notes ? data.notes.trim() : "",
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    await db.peopleEntities.add(person);
    return person;
  },

  /**
   * Update an existing Person or Entity record.
   * Enforces name uniqueness excluding the current entity ID.
   */
  async update(id, data) {
    const existing = await db.peopleEntities.get(id);
    if (!existing) {
      throw new Error("Person or Entity not found.");
    }

    if (!data.name || !data.name.trim()) {
      throw new Error("Name is required.");
    }

    const trimmedName = data.name.trim();

    // Check for duplicate name excluding the item currently being edited
    const isDuplicate = await this.checkDuplicateName(trimmedName, id);
    if (isDuplicate) {
      throw new Error(
        `A contact or entity named "${trimmedName}" already exists.`,
      );
    }

    const now = new Date().toISOString();

    const updatedPerson = {
      ...existing,
      name: trimmedName,
      type: data.type || existing.type,
      phone: data.phone !== undefined ? data.phone.trim() : existing.phone,
      email: data.email !== undefined ? data.email.trim() : existing.email,
      notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
      updatedAt: now,
    };

    await db.peopleEntities.put(updatedPerson);
    return updatedPerson;
  },

  /**
   * Delete a Person or Entity record.
   * Prevents deletion if the entity is currently linked to active debt records.
   */
  async delete(id) {
    const existing = await db.peopleEntities.get(id);
    if (!existing) {
      throw new Error("Person or Entity not found.");
    }

    // Check for linked active debt records
    const linkedDebts = await db.debts
      .where("personEntityId")
      .equals(id)
      .filter((d) => !d.isDeleted)
      .count();

    if (linkedDebts > 0) {
      throw new Error(
        `Cannot delete "${existing.name}" because they are linked to ${linkedDebts} active debt record(s).`,
      );
    }

    const now = new Date().toISOString();

    return await db.transaction(
      "rw",
      [db.peopleEntities, db.auditLogs],
      async () => {
        await db.peopleEntities.delete(id);

        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "person_entity",
          entityId: id,
          action: "DELETE",
          details: `Deleted person/entity record: ${existing.name}`,
          timestamp: now,
        });
      },
    );
  },
};
