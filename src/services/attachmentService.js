// src/services/attachmentService.js

import db from "../db/database";

export const attachmentService = {
  /**
   * Fetch all attachments associated with an entity ID.
   */
  async getAttachmentsByEntity(entityId) {
    if (!entityId) return [];
    return await db.attachments
      .where("transactionId")
      .equals(entityId)
      .toArray();
  },

  /**
   * Converts files to base64 Data URLs asynchronously BEFORE database transactions.
   */
  async prepareAttachmentRecords(entityId, fileList) {
    if (!entityId || !fileList || fileList.length === 0) return [];

    const now = new Date().toISOString();
    const records = [];

    for (const file of Array.from(fileList)) {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File "${file.name}" exceeds the 5MB size limit.`);
      }

      const dataUrl = await this.fileToDataUrl(file);
      records.push({
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        transactionId: entityId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        dataUrl,
        createdAt: now,
      });
    }

    return records;
  },

  /**
   * Process and save multiple File objects linked to an entity ID.
   */
  async uploadAttachments(entityId, fileList) {
    const records = await this.prepareAttachmentRecords(entityId, fileList);
    if (records.length === 0) return [];

    await db.attachments.bulkAdd(records);
    return records;
  },

  /**
   * Delete an attachment by ID.
   */
  async deleteAttachment(id) {
    await db.attachments.delete(id);
  },

  /**
   * Helper to convert File to base64 Data URL string.
   */
  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },
};
