// src/db/seed.js
import db from "./database";

/**
 * Helper to generate random date string (YYYY-MM-DD) between two dates
 */
const getRandomDateInRange = (startDate, endDate) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = new Date(start + Math.random() * (end - start));
  const year = randomTime.getFullYear();
  const month = String(randomTime.getMonth() + 1).padStart(2, "0");
  const day = String(randomTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Seed Script to populate 50 income/expense transactions, test people/entities, and debts.
 */
export const seedDatabase = async () => {
  return await db.transaction(
    "rw",
    [
      db.accounts,
      db.categories,
      db.subcategories,
      db.tags,
      db.transactions,
      db.transactionLines,
      db.peopleEntities,
      db.debts,
      db.debtPayments,
      db.auditLogs,
    ],
    async () => {
      const now = new Date().toISOString();

      // 1. Ensure Test Accounts Exist
      const existingAccounts = await db.accounts.toArray();
      let checkingAcc =
        existingAccounts.find((a) => a.name === "USA") ||
        existingAccounts.find((a) => a.type === "checking");
      let savingsAcc =
        existingAccounts.find((a) => a.name === "EGYPT") ||
        existingAccounts.find((a) => a.type === "savings");

      if (!checkingAcc) {
        checkingAcc = {
          id: "acc_seed_checking",
          name: "USA",
          type: "checking",
          currency: "USD",
          openingBalance: 5000,
          accountNumberLast4: "4321",
          color: "#3b82f6",
          icon: "Landmark",
          isActive: true,
          createdAt: now,
        };
        await db.accounts.add(checkingAcc);
      }

      if (!savingsAcc) {
        savingsAcc = {
          id: "acc_seed_savings",
          name: "EGYPT",
          type: "savings",
          currency: "EGP",
          openingBalance: 10000,
          accountNumberLast4: "8812",
          color: "#10b981",
          icon: "PiggyBank",
          isActive: true,
          createdAt: now,
        };
        await db.accounts.add(savingsAcc);
      }

      const accountPool = [checkingAcc, savingsAcc];

      // 2. Ensure Categories & Subcategories Exist
      const categoriesSeed = [
        {
          id: "cat_food",
          name: "Food & Dining",
          type: "expense",
          color: "#ef4444",
        },
        {
          id: "cat_transport",
          name: "Transportation",
          type: "expense",
          color: "#f59e0b",
        },
        {
          id: "cat_tech",
          name: "Technology & Software",
          type: "expense",
          color: "#8b5cf6",
        },
        {
          id: "cat_housing",
          name: "Housing & Utilities",
          type: "expense",
          color: "#06b6d4",
        },
        {
          id: "cat_income",
          name: "Salary & Business",
          type: "income",
          color: "#10b981",
        },
      ];

      for (const cat of categoriesSeed) {
        const exists = await db.categories.get(cat.id);
        if (!exists) {
          await db.categories.add({
            ...cat,
            icon: "FolderTree",
            isActive: true,
            createdAt: now,
          });
        }
      }

      const subcategoriesSeed = [
        { id: "sub_groceries", categoryId: "cat_food", name: "Groceries" },
        { id: "sub_restaurants", categoryId: "cat_food", name: "Restaurants" },
        { id: "sub_fuel", categoryId: "cat_transport", name: "Fuel" },
        {
          id: "sub_rideshare",
          categoryId: "cat_transport",
          name: "Taxi & Rideshare",
        },
        { id: "sub_cloud", categoryId: "cat_tech", name: "Cloud Services" },
        {
          id: "sub_electricity",
          categoryId: "cat_housing",
          name: "Electricity",
        },
      ];

      for (const sub of subcategoriesSeed) {
        const exists = await db.subcategories.get(sub.id);
        if (!exists) {
          await db.subcategories.add({
            ...sub,
            isActive: true,
            createdAt: now,
          });
        }
      }

      // 3. Ensure Tags Exist
      const tagList = [
        "Work",
        "Personal",
        "Vacation",
        "Subscription",
        "Weekend",
      ];
      for (const tagName of tagList) {
        const existing = await db.tags
          .filter((t) => t.name.toLowerCase() === tagName.toLowerCase())
          .first();
        if (!existing) {
          await db.tags.add({
            id: `tag_${tagName.toLowerCase()}`,
            name: tagName,
            createdAt: now,
          });
        }
      }

      // 4. Seed People & Entities
      const peopleSeed = [
        { id: "pe_john_doe", name: "John Doe", type: "Person" },
        { id: "pe_sarah_smith", name: "Sarah Smith", type: "Person" },
        { id: "pe_acme_corp", name: "Acme Corp", type: "Company" },
        { id: "pe_chase_bank", name: "National Bank", type: "Bank" },
      ];

      for (const person of peopleSeed) {
        const exists = await db.peopleEntities.get(person.id);
        if (!exists) {
          await db.peopleEntities.add({
            ...person,
            phone: "+1 555-0199",
            email: `${person.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            notes: "Seed record for debt testing",
            tags: ["Seed"],
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      // 5. Seed Debts & Debt Payments
      const debtSeed = [
        {
          id: "debt_seed_1",
          direction: "i_owe",
          personEntityId: "pe_john_doe",
          originalAmount: 1500,
          currency: "USD",
          accountId: checkingAcc.id,
          startDate: "2026-07-01",
          dueDate: "2026-10-15",
          notes: "Personal loan for electronics purchase",
          status: "active",
          payments: [],
        },
        {
          id: "debt_seed_2",
          direction: "they_owe",
          personEntityId: "pe_sarah_smith",
          originalAmount: 800,
          currency: "USD",
          accountId: checkingAcc.id,
          startDate: "2026-07-15",
          dueDate: "2026-09-30",
          notes: "Shared trip accommodation expenses",
          status: "partially_paid",
          payments: [
            {
              id: "dp_seed_1",
              amount: 300,
              accountAmount: 300,
              currency: "USD",
              accountCurrency: "USD",
              exchangeRate: 1.0,
              accountId: checkingAcc.id,
              date: "2026-08-01",
              notes: "First installment",
            },
          ],
        },
        {
          id: "debt_seed_3",
          direction: "i_owe",
          personEntityId: "pe_chase_bank",
          originalAmount: 25000,
          currency: "EGP",
          accountId: savingsAcc.id,
          startDate: "2026-06-01",
          dueDate: "2026-12-31",
          notes: "Emergency credit facility",
          status: "partially_paid",
          payments: [
            {
              id: "dp_seed_2",
              amount: 5000,
              accountAmount: 5000,
              currency: "EGP",
              accountCurrency: "EGP",
              exchangeRate: 1.0,
              accountId: savingsAcc.id,
              date: "2026-07-10",
              notes: "Monthly installment",
            },
          ],
        },
        {
          id: "debt_seed_4",
          direction: "they_owe",
          personEntityId: "pe_acme_corp",
          originalAmount: 1200,
          currency: "USD",
          accountId: checkingAcc.id,
          startDate: "2026-05-10",
          dueDate: "2026-06-10",
          notes: "Freelance invoice clearance",
          status: "paid",
          payments: [
            {
              id: "dp_seed_3",
              amount: 1200,
              accountAmount: 1200,
              currency: "USD",
              accountCurrency: "USD",
              exchangeRate: 1.0,
              accountId: checkingAcc.id,
              date: "2026-06-05",
              notes: "Full payment received",
            },
          ],
        },
      ];

      for (const item of debtSeed) {
        const { payments, ...debtData } = item;
        const exists = await db.debts.get(debtData.id);

        if (!exists) {
          await db.debts.add({
            ...debtData,
            interestRate: 0,
            tags: ["Seed"],
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
          });

          for (const payment of payments) {
            const payExists = await db.debtPayments.get(payment.id);
            if (!payExists) {
              await db.debtPayments.add({
                ...payment,
                debtId: debtData.id,
                transactionId: `tx_${payment.id}`,
                isDeleted: false,
                createdAt: now,
              });
            }
          }
        }
      }

      // 6. Generate 50 Sample Transactions (Income & Expense Only, Last 2 Months)
      const endDate = new Date(2026, 8, 12); // Sept 12, 2026
      const startDate = new Date(2026, 6, 12); // July 12, 2026

      const expenseDescriptions = [
        {
          desc: "Grocery Shopping at Walmart",
          catId: "cat_food",
          subId: "sub_groceries",
          amountMin: 40,
          amountMax: 180,
          tags: ["Personal", "Weekend"],
        },
        {
          desc: "Dinner at Italian Bistro",
          catId: "cat_food",
          subId: "sub_restaurants",
          amountMin: 35,
          amountMax: 110,
          tags: ["Personal"],
        },
        {
          desc: "Gas Station Refill",
          catId: "cat_transport",
          subId: "sub_fuel",
          amountMin: 30,
          amountMax: 65,
          tags: ["Work"],
        },
        {
          desc: "Uber Ride to Airport",
          catId: "cat_transport",
          subId: "sub_rideshare",
          amountMin: 25,
          amountMax: 55,
          tags: ["Vacation"],
        },
        {
          desc: "AWS Server Cloud Hosting",
          catId: "cat_tech",
          subId: "sub_cloud",
          amountMin: 15,
          amountMax: 140,
          tags: ["Subscription", "Work"],
        },
        {
          desc: "Monthly Electricity Bill",
          catId: "cat_housing",
          subId: "sub_electricity",
          amountMin: 80,
          amountMax: 220,
          tags: ["Personal"],
        },
      ];

      const incomeDescriptions = [
        {
          desc: "Bi-Weekly Paycheck",
          catId: "cat_income",
          subId: null,
          amountMin: 1800,
          amountMax: 2400,
          tags: ["Work"],
        },
        {
          desc: "Freelance Consulting Fee",
          catId: "cat_income",
          subId: null,
          amountMin: 350,
          amountMax: 950,
          tags: ["Work", "Personal"],
        },
        {
          desc: "Dividend & Capital Return",
          catId: "cat_income",
          subId: null,
          amountMin: 50,
          amountMax: 200,
          tags: ["Personal"],
        },
      ];

      const newTransactions = [];
      const newTransactionLines = [];

      for (let i = 1; i <= 50; i++) {
        const txId = `tx_seed_50_${i}`;
        const isExpense = i % 4 !== 0; // ~75% expenses, ~25% income
        const dateISO = getRandomDateInRange(startDate, endDate);
        const randomAccount =
          accountPool[Math.floor(Math.random() * accountPool.length)];

        let template;
        if (isExpense) {
          template =
            expenseDescriptions[
              Math.floor(Math.random() * expenseDescriptions.length)
            ];
        } else {
          template =
            incomeDescriptions[
              Math.floor(Math.random() * incomeDescriptions.length)
            ];
        }

        const rawAmount =
          template.amountMin +
          Math.random() * (template.amountMax - template.amountMin);
        const amount = Math.round(rawAmount * 100) / 100;

        let feeAmount = 0;
        if (isExpense && Math.random() < 0.15) {
          feeAmount = Math.round((amount * 0.02 + 1.5) * 100) / 100;
        }

        const totalImpact = isExpense
          ? Math.round((amount + feeAmount) * 100) / 100
          : amount;

        const txRecord = {
          id: txId,
          type: isExpense ? "expense" : "income",
          date: dateISO,
          time: `${String(Math.floor(Math.random() * 12) + 8).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
          amount,
          currency: randomAccount.currency,
          accountId: randomAccount.id,
          categoryId: template.catId,
          subcategoryId: template.subId,
          tags: template.tags,
          description: `${template.desc} #${i}`,
          feeAmount,
          totalImpact,
          status: "completed",
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        };

        newTransactions.push(txRecord);

        newTransactionLines.push({
          id: `txl_${txId}_1`,
          transactionId: txId,
          accountId: randomAccount.id,
          categoryId: template.catId,
          subcategoryId: template.subId,
          type: txRecord.type,
          amount,
          currency: randomAccount.currency,
          isDeleted: false,
        });

        if (feeAmount > 0) {
          newTransactionLines.push({
            id: `txl_${txId}_fee`,
            transactionId: txId,
            accountId: randomAccount.id,
            categoryId: "cat_fees",
            subcategoryId: "sub_payment_fees",
            type: "expense",
            amount: feeAmount,
            currency: randomAccount.currency,
            isDeleted: false,
          });
        }
      }

      await db.transactions.bulkPut(newTransactions);
      await db.transactionLines.bulkPut(newTransactionLines);
    },
  );
};
