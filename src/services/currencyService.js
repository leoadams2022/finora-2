// src/services/currencyService.js

import db from "../db/database";

export const currencyService = {
  /**
   * Get currency object by code, name, or symbol.
   * Priority: 1. Code -> 2. Name -> 3. Symbol
   */
  async getCurrency(query) {
    if (!query || typeof query !== "string") return null;

    const searchTerm = query.trim();
    if (!searchTerm) return null;

    // 1. Try matching by code (exact or case-insensitive)
    const upperCode = searchTerm.toUpperCase();
    let currency = await db.currencies.get(upperCode);
    if (currency) return currency;

    const allCurrencies = await db.currencies.toArray();

    // 2. Try matching by name (case-insensitive)
    currency = allCurrencies.find(
      (c) => c.name && c.name.toLowerCase() === searchTerm.toLowerCase(),
    );
    if (currency) return currency;

    // 3. Try matching by symbol
    currency = allCurrencies.find((c) => c.symbol && c.symbol === searchTerm);
    if (currency) return currency;

    return null;
  },

  /**
   * Fetch all registered currencies.
   */
  async getCurrencies() {
    return await db.currencies.toArray();
  },

  /**
   * Add or update a currency with its exchange rate against USD.
   * Enforces single-default currency across IndexedDB and checks for duplicate code/symbol.
   */
  async saveCurrency(data) {
    if (!data.code || !data.code.trim()) {
      throw new Error("Currency code is required (e.g. USD, EGP, EUR).");
    }
    const code = data.code.trim().toUpperCase();
    const symbol = data.symbol ? data.symbol.trim() : code;
    const rateToUSD = Number(data.rateToUSD);

    if (isNaN(rateToUSD) || rateToUSD <= 0) {
      throw new Error(
        "Exchange rate against USD must be a positive number greater than 0.",
      );
    }

    const allCurrencies = await db.currencies.toArray();

    // Check duplicate code (when creating a new currency)
    const existingCodeMatch = allCurrencies.find((c) => c.code === code);
    const isEditing = Boolean(data.isEditing);

    if (!isEditing && existingCodeMatch) {
      throw new Error(`A currency with code "${code}" already exists.`);
    }

    // Check duplicate symbol (excluding current currency when updating)
    const duplicateSymbol = allCurrencies.find(
      (c) => c.symbol.toLowerCase() === symbol.toLowerCase() && c.code !== code,
    );

    if (duplicateSymbol) {
      throw new Error(
        `A currency with symbol "${symbol}" already exists (${duplicateSymbol.code}).`,
      );
    }

    const now = new Date().toISOString();
    const isDefault = Boolean(data.isDefault);

    return await db.transaction(
      "rw",
      [db.currencies, db.auditLogs],
      async () => {
        // Enforce single default currency rule
        if (isDefault) {
          for (const curr of allCurrencies) {
            if (curr.code !== code && curr.isDefault) {
              await db.currencies.update(curr.code, {
                isDefault: false,
                updatedAt: now,
              });
            }
          }
        }

        const currencyRecord = {
          code,
          name: data.name ? data.name.trim() : code,
          symbol,
          rateToUSD: code === "USD" ? 1.0 : rateToUSD,
          isBase: Boolean(data.isBase),
          isDefault,
          updatedAt: now,
        };

        if (isEditing) {
          await db.currencies.update(code, currencyRecord);
        } else {
          currencyRecord.createdAt = now;
          await db.currencies.put(currencyRecord);
        }

        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "currency",
          entityId: code,
          action: isEditing ? "UPDATE" : "CREATE",
          details: `Saved currency ${code} (Default: ${isDefault}) with USD rate: ${rateToUSD}`,
          timestamp: now,
        });

        return currencyRecord;
      },
    );
  },

  /**
   * Delete custom currency (prevent deleting USD or base currency).
   */
  async deleteCurrency(code) {
    if (code === "USD") {
      throw new Error("Cannot delete baseline USD currency.");
    }

    const existing = await db.currencies.get(code);
    if (!existing) throw new Error("Currency not found.");
    if (existing.isBase) {
      throw new Error("Cannot delete the active Base Currency.");
    }

    return await db.transaction(
      "rw",
      [db.currencies, db.auditLogs],
      async () => {
        await db.currencies.delete(code);

        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "currency",
          entityId: code,
          action: "DELETE",
          details: `Deleted currency ${code}`,
          timestamp: new Date().toISOString(),
        });
      },
    );
  },
};
