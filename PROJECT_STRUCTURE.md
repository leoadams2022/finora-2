# Finora — Project Structure & Code Reference

> **Purpose**: Comprehensive documentation of every file, its role, and every exported function/component with arguments and explanations. Designed so an AI can fully understand the codebase.

**Root**: `C:\Users\walid\Code\finora 2`
**Tech Stack**: React 18 + Vite + Dexie.js (IndexedDB) + React Router + Recharts + Lucide Icons + Tailwind CSS

---

## Table of Contents

1. [Configuration & Entry Points](#1-configuration--entry-points)
2. [Database Layer](#2-database-layer)
3. [State Management (Hooks)](#3-state-management-hooks)
4. [Context Providers](#4-context-providers)
5. [Services (Business Logic / DB Operations)](#5-services-business-logic--db-operations)
6. [Finance Module (Calculations & Utilities)](#6-finance-module-calculations--utilities)
7. [Utilities](#7-utilities)
8. [Constants](#8-constants)
9. [Components (UI / Layout / Modals)](#9-components-ui--layout--modals)
10. [Pages (Views)](#10-pages-views)
11. [Tests](#11-tests)
12. [Root-Level Files](#12-root-level-files)

---

## 1. Configuration & Entry Points

### `src/main.jsx`
Entry point. Renders the React app inside `StrictMode`. No exports.

### `src/App.jsx`
Root application component. Wraps `BrowserRouter`, `ThemeProvider`, and `ToastProvider` around `AppRoutes`. No exports.

### `src/routes/AppRoutes.jsx`
Defines all application routes using `react-router-dom` `Routes`/`Route`. Imports and renders all page components inside `AppLayout`. No exports.

| Route | Page |
|-------|------|
| `/` | Dashboard |
| `/accounts` | Accounts |
| `/transactions` | Transactions |
| `/transfers` | Transfers |
| `/budgets` | Budgets |
| `/recurring-transactions` | RecurringTransactions |
| `/debts` | Debts |
| `/people` | PeopleEntities |
| `/net-worth` | NetWorth |
| `/reports` | Reports |
| `/search` | Search |
| `/categories` | Categories |
| `/tags` | Tags |
| `/settings/*` | Settings |

### `vite.config.js`
Vite build configuration (project root). Not read in detail; standard React + Vite setup.

### `eslint.config.js`
ESLint configuration (project root). Not read in detail.

### `package.json`
Project dependencies and scripts (project root). Not read in detail.

---

## 2. Database Layer (Dexie.js / IndexedDB)

### `src/db/database.js`
Exports: **`db`** (default) — Dexie database instance named `"FinoraDatabase"`.
- Applies schema version 1 from `SCHEMAS.v1` (imported from `./schema`).
- On first populate, calls `initializeDefaultData()` (imported from `./defaultData`).

### `src/db/schema.js`
Exports: **`SCHEMAS`** — Object containing Dexie table schema definitions.

| Property | Type | Description |
|----------|------|-------------|
| `SCHEMAS.v1` | `object` | IndexedDB table definitions with indexed fields for all entities (accounts, currencies, transactions, transactionLines, categories, subcategories, tags, recurringTransactions, budgets, peopleEntities, attachments, auditLogs, netWorthSnapshots, debts, debtPayments). |

### `src/db/migrations.js`
No exports. TODO placeholder for future migrations.

### `src/db/defaultData.js`
Exports:

| Export | Args | Description |
|--------|------|-------------|
| `DEFAULT_CURRENCIES` | — (constant) | Array of 5 default currency objects (USD, EUR, EGP, SAR, GBP). |
| `DEFAULT_CATEGORIES` | — (constant) | Array of 5 default category objects (Food, Transport, Housing, Fees, Income). |
| `DEFAULT_SUBCATEGORIES` | — (constant) | Array of 5 default subcategory objects. |
| `initializeDefaultData` | `async () => void` | Seeds base currencies and core categories/subcategories into Dexie if tables are empty. Uses a `"rw"` transaction. |

### `src/db/seed.js`
Exports:

| Export | Args | Description |
|--------|------|-------------|
| `seedDatabase` | `async () => void` | Generates 50 random income/expense transactions spanning the last 2 months, ensuring seed accounts ("Main Checking Account", "High-Yield Savings", "Rewards Credit Card"), categories, subcategories, and tags exist. All wrapped in a Dexie `"rw"` transaction. Internal helper: `getRandomDateInRange(startDate, endDate)`. |

---

## 3. State Management (Custom Hooks)

All hooks use `dexie-react-hooks` `useLiveQuery` for reactive DB queries.

### `src/hooks/useTransactions.js`
Exports: **`useTransactions`**

| Param | Type | Description |
|-------|------|-------------|
| `filters` | `object` | Filter criteria: `accountId`, `type`, `categoryId`, `subcategoryId`, `tag`, `startDate`, `endDate`, `minAmount`, `maxAmount`. |
| `sortBy` | `object` | `{ field: string, direction: "asc"|"desc" }`. Fields: `"date"`, `"type"`, `"category"`, `"amount"`, or `"createdAt"`. |

Returns: `{ transactions: Array, isLoading: boolean }`. Queries `db.transactions` excluding soft-deleted, applies filters + sorting, reactive to filter changes.

### `src/hooks/useTransfers.js`
Exports: **`useTransfers`**

| Param | Type | Description |
|-------|------|-------------|
| `filters` | `object` | `sourceAccountId`, `destinationAccountId`. |

Returns: `{ transfers: Array, isLoading: boolean }`. Queries `db.transactions` where `type === "transfer"`, sorted by date descending.

### `src/hooks/useDebts.js`
Exports: **`useDebts`**

| Param | Type | Description |
|-------|------|-------------|
| `filters` | `object` | `direction` (`"i_owe"` or `"they_owe"`), `status`. |

Returns: `{ debts: Array, isLoading: boolean }`. Queries non-deleted debts, calculates balance via `calculateDebtBalance` from `../finance/debts`.

### `src/hooks/useAccounts.js`
Exports: **`useAccounts`**

| Param | Type | Description |
|-------|------|-------------|
| `includeArchived` | `boolean` | If `true`, returns all accounts including inactive ones. Default `false`. |

Returns: `{ accounts: Array, isLoading: boolean }`. Each account includes a computed `currentBalance` via `calculateAccountBalance` from `../finance/balances`.

### `src/hooks/useBudgets.js`
Exports: **`useBudgets`**

No params. Returns: `{ budgets: Array, isLoading: boolean }`. Each budget includes spending calculations via `calculateBudgetUsage` from `../finance/budgets`. Reactive to `db.transactions.count()`.

### `src/hooks/useCategories.js`
Exports: **`useCategories`**

| Param | Type | Description |
|-------|------|-------------|
| `includeInactive` | `boolean` | Include archived/inactive categories and subcategories. Default `false`. |

Returns: `{ categories: Array, subcategories: Array, isLoading: boolean }`.

### `src/hooks/useCurrencies.js`
Exports: **`useCurrencies`**

No params. Returns: `{ currencies: Array, isLoading: boolean }`. All rows from `db.currencies`.

### `src/hooks/useTags.js`
Exports: **`useTags`**

No params. Returns: `{ tags: Array, isLoading: boolean }`. All rows from `db.tags`.

### `src/hooks/usePeopleEntities.js`
Exports: **`usePeopleEntities`**

No params. Returns: `{ peopleEntities: Array, isLoading: boolean }`. All rows from `db.peopleEntities`.

### `src/hooks/useRecurringTransactions.js`
Exports: **`useRecurringTransactions`**

No params. Returns: `{ recurringTransactions: Array, isLoading: boolean }`. All rows from `db.recurringTransactions`.

### `src/hooks/useDashboardData.js`
Exports: **`useDashboardData`**

| Param | Type | Description |
|-------|------|-------------|
| `dateFilter` | `string` | Preset key: `"today"`, `"this_week"`, `"this_month"`, etc. Default `"this_month"`. |
| `customStart` | `string\|null` | Custom start date (ISO string). |
| `customEnd` | `string\|null` | Custom end date (ISO string). |
| `viewCurrency` | `string\|null` | Target display currency code. |

Returns: `{ data: object, isLoading: boolean }`. Delegates to `dashboardService.getDashboardSummary`.

### `src/hooks/useNetWorth.js`
Exports: **`useNetWorth`**

| Param | Type | Description |
|-------|------|-------------|
| `targetViewCurrency` | `string\|null` | Currency code for display conversion. |

Returns: `{ liveSummary: object, snapshots: Array, isLoading: boolean }`. Delegates to `netWorthService` methods.

### `src/hooks/useLocalStorage.js`
Exports: **`useLocalStorage`**

| Param | Type | Description |
|-------|------|-------------|
| `key` | `string` | localStorage key name. |
| `initialValue` | `any` | Fallback initial value if key does not exist. |

Returns: `[storedValue, setStoredValue]` — React state tuple synced to localStorage.

### `src/hooks/useTheme.js`
Exports: **`useTheme`**

No params. Returns: `{ isDarkMode: boolean, toggleDarkMode: function }` from `ThemeContext`. Throws if used outside `ThemeProvider`.

### `src/hooks/useToast`
Exports: **`useToast`**

No params. Returns: `{ addToast, removeToast, showSuccess, showError, showWarning, showInfo }` from `ToastContext`. Throws if used outside `ToastProvider`.

### `src/hooks/useTransactions copy.js`
Duplicate/legacy copy of `useTransactions`. Not imported by any page.

### `src/hooks/useTagHoldings.js`
Not found (does not exist).

---

## 4. Context Providers

### `src/context/ThemeContext.jsx`
Exports: **`ThemeContext`** (created via `createContext`), **`ThemeProvider`** (component).

`ThemeProvider` manages `isDarkMode` state from localStorage/system preference, toggles `dark` class on `<html>`, and provides `{ isDarkMode, toggleDarkMode }`.

### `src/context/ToastContext.jsx`
Exports: **`ToastContext`**, **`ToastProvider`**.

`ToastProvider` manages an array of toast notifications. Provides `addToast`, `removeToast`, `showSuccess`, `showError`, `showWarning`, `showInfo`. Renders a toast container at `z-50` with auto-dismiss after 4 seconds (configurable per toast).

---

## 5. Services (Business Logic / DB Operations)

### `src/services/accountService.js`
Exports: **`accountService`** — object with methods:

| Method | Args | Description |
|--------|------|-------------|
| `getAllAccounts` | `(includeArchived = false)` | Returns all accounts or only active ones. |
| `getAccountById` | `(id)` | Returns a single account by ID. |
| `checkDuplicateName` | `(name, excludeAccountId = null)` | Returns `true` if another account with same name exists. |
| `createAccount` | `(data)` | Validates via `validateAccount`, checks duplicates, creates account in Dexie. Returns new account object. |
| `updateAccount` | `(id, data)` | Updates an existing account with validation and duplicate check. |
| `toggleArchiveAccount` | `(id, archiveState = true)` | Soft-archives/unarchives an account. |

### `src/services/transactionService.js`
Exports: **`transactionService`** — object with methods:

| Method | Args | Description |
|--------|------|-------------|
| `getTransactions` | `(filters = {})` | Returns filtered transactions (excluding soft-deleted). Filters: `accountId`, `categoryId`, `type`. |
| `createTransaction` | `(data, rawFiles = [])` | Creates expense/income/refund transaction. Calculates fee and totalImpact. Handles attachments via `attachmentService.prepareAttachmentRecords`. Atomic Dexie `"rw"` transaction on transactions, transactionLines, attachments, auditLogs. |
| `updateTransaction` | `(id, data, newRawFiles = [], attachmentsToDelete = [])` | Updates transaction; replaces ledger lines, handles attachments add/delete. Atomic transaction. |
| `deleteTransaction` | `(id)` | Soft-deletes transaction + its transaction lines + attachments, writes audit log. Atomic transaction. |

### `src/services/transferService.js`
Exports: **`transferService`** — object with methods:

| Method | Args | Description |
|--------|------|-------------|
| `getTransfers` | `(filters = {})` | Returns transfers (transactions where `type === "transfer"`). Filters: `sourceAccountId`, `destinationAccountId`. Sorted by date desc. |
| `createTransfer` | `(data, rawFiles = [])` | Creates same-currency or cross-currency transfer with fee support. Atomic Dexie transaction. Validates source/destination accounts are different. Handles attachments. Returns transfer header object. |
| `deleteTransfer` | `(id)` | Soft-deletes transfer, its transaction lines, and attachments. Writes audit log. |

### `src/services/debtService.js`
Exports: **`debtService`** — object with methods:

| Method | Args | Description |
|--------|------|-------------|
| `getDebts` | `(filters = {})` | Returns non-deleted debts with calculated balance stats. Filters: `direction`, `personEntityId`. |
| `createDebt` | `(data, rawFiles = [])` | Creates debt with optional cross-currency cash-flow and attachments. If `accountId` provided, creates an associated income/expense transaction for cash flow. Atomic transaction. |
| `recordDebtPayment` | `(data)` | Records a payment against a debt. Handles cross-currency. Updates debt status (`"paid"`, `"partially_paid"`). Atomic transaction. |
| `deleteDebt` | `(id)` | Soft-deletes debt + payments + initial cash-flow transactions + attachments. Atomic transaction. |

### `src/services/tagService.js`
Exports: **`tagService`** — object with methods:

| Method | Args | Description |
|--------|------|-------------|
| `getAllTags` | `()` | Returns all tags. |
| `createTag` | `(name)` | Creates tag (trims, removes leading `#`, checks duplicates). |
| `updateTag` | `(id, name)` | Updates tag name with duplicate check. |
| `deleteTag` | `(id)` | Deletes tag from Dexie. |

### `src/services/recurringService.js`
Exports: **`recurringService`** — object with methods:

| Method | Args | Description |
|--------|------|-------------|
| `getRecurringTransactions` | `()` | Returns all recurring transaction rules. |
| `createRecurringTransaction` | `(data)` | Creates a recurring rule with name, type, amount, frequency, account, category, etc. Atomic transaction with audit log. |
| `updateRecurringTransaction` | `(id, data)` | Updates a recurring rule with duplicate name check. Atomic transaction. |
| `processDueRecurringTransactions` | `(asOfDateStr = today)` | Evaluates active rules whose `nextOccurrence <= asOfDateStr`, creates actual transactions, advances `nextOccurrence`, marks completed if past `endDate`. Returns created transactions. |
| `deleteRecurringTransaction` | `(id)` | Deletes a recurring rule and writes audit log. |

Helper (standalone export): **`calculateNextOccurrenceDate`** `(currentDateStr, frequency, customIntervalDays = 1)` → Returns next date string based on frequency (daily/weekly/monthly/yearly/custom).

### `src/services/peopleService.js`
Exports: **`peopleService`** — object with methods:

| Method | Args | Description |
|--------|------|-------------|
| `getAll` | `()` | Returns all people entities. |
| `create` | `(data)` | Creates a person/entity with name, type, phone, email, notes. |

### `src/services/netWorthService.js`
Exports: **`netWorthService`** — object with methods:

| Method | Args | Description |
|--------|------|-------------|
| `getLiveNetWorthSummary` | `(targetViewCurrency = null)` | Calculates total assets, total liabilities, net worth in display currency. Includes accounts (converted) and active `"i_owe"` debts. Uses `calculateAccountBalance`, `getTriangulatedExchangeRate`, `money` utilities. |
| `getSnapshots` | `()` | Returns all net worth snapshots sorted by date ascending. |
| `recordSnapshot` | `(notes = "")` | Captures current net worth as a snapshot (upserts if same date). Atomic transaction. |
| `deleteSnapshot` | `(id)` | Deletes a snapshot and writes audit log. |

### `src/services/dashboardService.js`
Exports: **`getDateRange`**, **`dashboardService`**.

| Export | Args | Description |
|--------|------|-------------|
| `getDateRange` | `(filterPreset, customStart = null, customEnd = null)` | Returns `{ startDate, endDate }` ISO strings for preset keys: today, yesterday, this_week, last_week, this_month, last_month, this_year, last_year, custom. |
| `dashboardService.getDashboardSummary` | `(dateFilter = "this_month", customStart = null, customEnd = null, targetViewCurrency = null)` | Main dashboard data compiler. Returns: `{ displayCurrency, totalAssetsBase, totalLiabilitiesBase, netWorthBase, totalIncomeBase, totalExpensesBase, netCashFlowBase, accountSummaries, expenseByCategoryChart, recentTransactions }`. All amounts converted to display currency. |

### `src/services/currencyService.js`
Exports: **`currencyService`** — object with methods:

| Method | Args | Description |
|--------|------|-------------|
| `getCurrencies` | `()` | Returns all currencies from Dexie. |
| `saveCurrency` | `(data)` | Creates or updates a currency (code, name, symbol, rateToUSD, isBase). Atomic transaction with audit log. Prevents invalid rates. |
| `deleteCurrency` | `(code)` | Deletes a non-base currency. Prevents deleting USD or base currency. Atomic transaction. |

### `src/services/categoryService.js`
Exports: **`checkDuplicateCategoryName`**, **`checkDuplicateSubcategoryName`**, **`categoryService`**.

| Export | Args | Description |
|--------|------|-------------|
| `checkDuplicateCategoryName` | `(name, excludeCategoryId = null)` | Returns `true` if another category has same name (case-insensitive). |
| `checkDuplicateSubcategoryName` | `(name, categoryId, excludeSubcategoryId = null)` | Returns `true` if a subcategory with same name exists under same parent category. |

`categoryService` methods:

| Method | Args | Description |
|--------|------|-------------|
| `getAllCategories` | `(includeInactive = false)` | Returns categories filtered by active status. |
| `createCategory` | `(data)` | Creates category with name, type, icon, color. Checks duplicates. |
| `updateCategory` | `(id, data)` | Updates category with duplicate check. |
| `toggleArchiveCategory` | `(id, archiveState = true)` | Toggles `isActive`. |
| `getSubcategoriesByCategory` | `(categoryId)` | Returns subcategories for a category. |
| `createSubcategory` | `(data)` | Creates subcategory under category. Checks duplicates. |
| `updateSubcategory` | `(id, data)` | Updates subcategory with duplicate check. |
| `toggleArchiveSubcategory` | `(id, archiveState = true)` | Toggles subcategory `isActive`. |

### `src/services/budgetService.js`
Exports: **`budgetService`** — object with methods:

| Method | Args | Description |
|--------|------|-------------|
| `getBudgets` | `()` | Returns all budgets with usage calculations via `calculateBudgetUsage`. |
| `createBudget` | `(data)` | Creates budget with name, amount, currency, period, categoryId/subcategoryId/tagId target. Enforces: at least one target required, no duplicate names. Atomic transaction. |
| `updateBudget` | `(id, data)` | Updates budget with duplicate name check and target validation. |
| `deleteBudget` | `(id)` | Deletes budget and writes audit log. |

### `src/services/attachmentService.js`
Exports: **`attachmentService`** — object with methods:

| Method | Args | Description |
|--------|------|-------------|
| `getAttachmentsByEntity` | `(entityId)` | Returns attachments linked to a transaction or debt ID. |
| `prepareAttachmentRecords` | `(entityId, fileList)` | Converts File objects to base64 Data URLs, returns record objects ready for Dexie insertion. Enforces 5MB file size limit. |
| `uploadAttachments` | `(entityId, fileList)` | Prepares + bulk-inserts attachment records. |
| `deleteAttachment` | `(id)` | Deletes an attachment record. |
| `fileToDataUrl` | `(file)` | Promise-based FileReader wrapper. |

### `src/services/transactionService copy.js`
Duplicate/legacy copy. Not imported.

### `src/services/transferService copy.js`
Duplicate/legacy copy. Not imported.

### `src/services/debtService copy.js`
Duplicate/legacy copy. Not imported.

---

## 6. Finance Module (Calculations & Utilities)

### `src/finance/money.js`
Exports: **`money`** — object with precision-safe arithmetic helpers (all use `Math.round(x * 100) / 100` for 2 decimal places):

| Method | Args | Description |
|--------|------|-------------|
| `add` | `(a, b)` | Adds two numbers. |
| `subtract` | `(a, b)` | Subtracts b from a. |
| `multiply` | `(a, b)` | Multiplies two numbers. |
| `divide` | `(a, b)` | Divides a by b (supports up to 6 decimal precision). Returns 0 if b is 0. |
| `format` | `(val)` | Formats number to 2 decimal places string. |

### `src/finance/balances.js`
Exports: **`calculateAccountBalance`**

| Param | Type | Description |
|-------|------|-------------|
| `accountId` | `string` | Account ID. |

Returns: `Promise<number>` — Account balance = `openingBalance + income/refund lines - expense/fee lines` (excluding soft-deleted lines).

### `src/finance/debts.js`
Exports: **`calculateDebtBalance`**

| Param | Type | Description |
|-------|------|-------------|
| `debtId` | `string` | Debt ID. |

Returns: `Promise<{ originalAmount, totalPaid, remainingBalance, status }>` where `status` is `"active"`, `"partially_paid"`, or `"paid"`.

### `src/finance/budgets.js`
Exports: **`calculateBudgetPeriodDates`**, **`calculateBudgetUsage`**.

| Export | Args | Description |
|--------|------|-------------|
| `calculateBudgetPeriodDates` | `(period, targetDate = new Date())` | Returns `{ startDate, endDate }` ISO strings for budget periods: daily, weekly, monthly, quarterly, semi_annual, yearly. |
| `calculateBudgetUsage` | `(budget)` | Calculates spending vs budget in budget currency. Handles multi-currency conversion, rollover (if enabled), returns `{ baseAmount, spentAmount, rolloverAmount, totalAvailable, remainingAmount, percentageUsed, isOverBudget, periodStartDate, periodEndDate }`. |

### `src/finance/conversions.js`
Exports:

| Export | Args | Description |
|--------|------|-------------|
| `getRateRelativeToUSD` | `(currencyCode)` | Returns rate relative to USD from `db.currencies` or `db.exchangeRates`. Returns 1.0 for USD. |
| `getTriangulatedExchangeRate` | `(fromCurrency, toCurrency)` | Cross-currency rate via USD bridge. Formula: `rateToUSD(to) / rateToUSD(from)`. Returns 1.0 if same currency. |
| `convertTransactionToBudgetCurrency` | `(transaction, budgetCurrency)` | Converts a transaction's amount to budget currency using triangulated rates or explicit `exchangeRate`. |

### `src/finance/fees.js`
No exports. TODO placeholder.

### `src/finance/ledger.js`
No exports. TODO placeholder.

### `src/finance/netWorth.js`
No exports. TODO placeholder.

---

## 7. Utilities

### `src/utils/validation.js`
Exports: **`validateAccount`**

| Param | Type | Description |
|-------|------|-------------|
| `accountData` | `object` | Account payload to validate. |

Returns: `{ isValid: boolean, errors: object }`. Validates: name required, type required, currency required, `accountNumberLast4` must be exactly 4 digits, credit card fields validated (credit limit ≥ 0).

### `src/utils/dates.js`
Exports:

| Export | Args | Description |
|--------|------|-------------|
| `formatDateToISO` | `(date)` | Formats Date to `YYYY-MM-DD` string. |
| `PRESET_DATE_RANGES` | — (constant) | Array of preset date range objects: `{ key, label }` for All Time, Today, Yesterday, This Week, Last Week, This Month, Last Month, Custom. |
| `getPresetDateRange` | `(presetKey)` | Returns `{ startDate, endDate }` ISO strings for the given preset key. |

### `src/utils/formatting.js`
No exports. TODO placeholder.

---

## 8. Constants

### `src/constants/transactionTypes.js`
No exports. TODO placeholder.

### `src/constants/currencies.js`
No exports. TODO placeholder.

### `src/constants/accountTypes.js`
Exports:

| Export | Description |
|--------|-------------|
| `ACCOUNT_TYPES` | Object of account type configs: SAVINGS, CHECKING, CREDIT_CARD, CASH, E_WALLET, INVESTMENT, LOAN, OTHER. Each has `{ key, label, icon, isLiability }`. |
| `ACCOUNT_TYPE_OPTIONS` | `Object.values(ACCOUNT_TYPES)` — array for form select options. |

---

## 9. Components (UI / Layout / Modals)

### Layout Components

#### `src/components/layout/AppLayout.jsx`
Default export: **`AppLayout`** component — Main application shell. Uses `react-router-dom` `Outlet` for nested page rendering. Contains:
- `Sidebar` (responsive, mobile drawer)
- `Header` (sticky navbar with menu toggle, base currency indicator, dark mode toggle, notifications, profile)
- Floating Action Button (FAB) for Quick Action Modal
- `QuickActionModal`

#### `src/components/layout/Sidebar.jsx`
Default export: **`Sidebar`** — `(props: { isOpen: boolean, onClose: function, onOpenQuickAction: function })` → React element. Navigation sidebar with 14 nav links (Dashboard, Accounts, Transactions, Transfers, Budgets, Recurring, Debts, People & Entities, Net Worth, Reports, Search, Categories, Tags, Settings). Mobile backdrop overlay.

#### `src/components/layout/Header.jsx`
Default export: **`Header`** — `(props: { onMenuToggle: function })` → React element. Sticky header with mobile menu trigger, title, base currency badge (USD), `DarkModeToggle`, notification button, profile stub.

### UI Components

#### `src/components/ui/MoneyDisplay.jsx`
Default export: **`MoneyDisplay`** — `(props: { amount, currency, showSymbol, className, positiveClass, negativeClass, neutralClass, colorize })` → React element. Formats amounts as currency via `Intl.NumberFormat`. Optional colorization based on positive/negative.

#### `src/components/ui/CurrencyInput.jsx`
Default export: **`CurrencyInput`** — `(props: { value, onChange, currency, label, error, placeholder, disabled, required })` → React element. Number input with currency prefix.

#### `src/components/ui/ConfirmDialog.jsx`
Default export: **`ConfirmDialog`** — `(props: { isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant, isLoading })` → React element. Reusable modal for destructive actions. Variants: `danger`, `warning`, `info`. Keyboard Escape key support.

#### `src/components/ui/LoadingState.jsx`
Default export: **`LoadingState`** — Simple loading placeholder component (minimal stub).

#### `src/components/ui/EmptyState.jsx`
Default export: **`EmptyState`** — `(props: { icon, title, description, actionLabel, onAction, children })` → React element. Dashed-border placeholder with optional CTA button.

#### `src/components/ui/DataTable.jsx`
Default export: **`DataTable`** — Stub component (minimal, not fully implemented).

#### `src/components/ui/DarkModeToggle.jsx`
Default export: **`DarkModeToggle`** — `(props: { className })` → React element. Sun/Moon icon toggle button using `useTheme` hook.

### Common Components

#### `src/components/common/QuickActionModal.jsx`
Default export: **`QuickActionModal`** — `(props: { isOpen, onClose })` → React element. Modal with 3 tabs: Transaction (expense/income/refund), Transfer (cross-currency), Debt (i_owe/they_owe). Handles full submit logic for all 3 types using `transactionService`, `transferService`, `debtService`. Supports attachments.

#### `src/components/common/AttachmentUploader.jsx`
Default export: **`AttachmentUploader`** — `(props: { files, onAddFiles, onRemoveFile })` → React element. Drag/drop file input accepting JPG/PNG/WEBP/PDF up to 5MB. Displays file list with preview and remove buttons.

### Account Components

#### `src/components/accounts/AccountModal.jsx`
Default export: **`AccountModal`** — `(props: { isOpen, onClose, onSave, accountToEdit })` → React element. Modal with full account form: name, type, currency, opening balance, last 4 digits, credit card fields (limit, statement/payment dates), color picker, description.

#### `src/components/accounts/AccountCard.jsx`
Default export: **`AccountCard`** — `(props: { account, onEdit, onToggleArchive })` → React element. Card displaying account name, type, balance, color icon, edit/archive buttons. Shows credit card metrics if type is `credit_card`.

### Category Components

#### `src/components/categories/CategoryModal.jsx`
Default export: **`CategoryModal`** — `(props: { isOpen, onClose, onSave, categoryToEdit })` → React element. Modal for creating/editing categories with name, type, color picker, icon.

#### `src/components/categories/SubcategoryModal.jsx`
Default export: **`SubcategoryModal`** — `(props: { isOpen, onClose, onSave, subcategoryToEdit, parentCategory })` → React element. Modal for creating/editing subcategories under a parent category.

### Budget Components

#### `src/components/budgets/BudgetModal.jsx`
Default export: **`BudgetModal`** — `(props: { isOpen, onClose, onSave, budgetToEdit })` → React element. Modal with amount, currency, period (daily/weekly/monthly/quarterly/semi_annual/yearly), target scope (category/subcategory or tag), and rollover toggle.

### Debt Components

#### `src/components/debts/DebtModal.jsx`
Default export: **`DebtModal`** — `(props: { isOpen, onClose, onSave })` → React element. Modal with direction switcher (I Owe / They Owe), person/entity selector, amount, currency, cross-currency panel, dates, notes, attachments.

#### `src/components/debts/DebtPaymentModal.jsx`
Default export: **`DebtPaymentModal`** — `(props: { isOpen, onClose, debt, onSave })` → React element. Modal for recording debt payments. Shows remaining balance, payment amount, account selector, cross-currency panel.

### Transfer Components

#### `src/components/transfers/TransferModal.jsx`
Default export: **`TransferModal`** — `(props: { isOpen, onClose, onSave })` → React element. Modal for creating transfers with source/destination accounts, amount, cross-currency conversion, date, fee options, description, attachments.

### Transaction Components

#### `src/components/transactions/TransactionModal.jsx`
Not read but referenced in `src/pages/Transactions.jsx`. Modal for creating/editing transactions.

#### `src/components/transactions/TransactionDetailsModal.jsx`
Default export: **`TransactionDetailsModal`** — `(props: { isOpen, onClose, transaction, account, category, subcategory })` → React element. Displays transaction details including amount, date, account, category, tags, attachments (reactive via `attachmentService.getAttachmentsByEntity`), download/preview.

#### `src/components/transactions/TagTooltip.jsx`
Default export: **`TagTooltip`** — `(props: { tags })` → React element. Hover tooltip showing tag names.

### Settings Components

#### `src/components/settings/CurrenciesSettings.jsx`
Default export: **`CurrenciesSettings`** — Settings page section for managing currencies and exchange rates. Add/edit/delete currencies in a CRUD UI. Uses `currencyService`.

### Recurring Components

#### `src/components/recurring/RecurringModal.jsx`
Default export: **`RecurringModal`** — `(props: { isOpen, onClose, ruleToEdit })` → React element. Modal for creating/editing recurring transaction rules: name, type, amount, currency, account, frequency (daily/weekly/monthly/yearly/custom), start/end dates, auto-create toggle, notes.

### Common UI (previously listed)

#### `src/components/ui/LoadingState.jsx` — (see above)

---

## 10. Pages (Views)

### `src/pages/Dashboard.jsx`
Default export: **`Dashboard`** — Main dashboard page. Uses `useDashboardData` and `useCurrencies`. Displays 6 KPI cards (Net Worth, Assets, Liabilities, Income, Expenses, Net Cash Flow), bar chart (cash flow), pie chart (expenses by category), account summaries, and recent transactions. Uses `useLocalStorage` for date filter and view currency preferences. Requires `recharts`.

### `src/pages/Accounts.jsx`
Default export: **`Accounts`** — Account management page. Uses `useAccounts`, `accountService`, `AccountCard`, `AccountModal`. Supports add/edit accounts, archive/unarchive, toggle archived view.

### `src/pages/Transactions.jsx`
Default export: **`Transactions`** — Transaction management page. Uses `useTransactions`, `useAccounts`, `useCategories`, `useTags`, `transactionService`. Features: filter bar (account, type, category, subcategory, tag, date range, amount range), sort by column header, standard table view & compact card view toggle, add/edit/delete/view transaction details. Uses `TransactionModal` and `TransactionDetailsModal`.

### `src/pages/Transfers.jsx`
Default export: **`Transfers`** — Transfer management page. Uses `useTransfers`, `transferService`, `TransferModal`. Displays transfers with source/destination accounts, amounts, fees, attachment counts. Supports delete (soft delete).

### `src/pages/Budgets.jsx`
Default export: **`Budgets`** — Budget management page. Uses `useBudgets`, `budgetService`, `BudgetModal`. Displays budget cards with progress bars, spent/remaining amounts, rollover indicators, over-budget warnings. Supports add/edit/delete budgets.

### `src/pages/Categories.jsx`
Default export: **`Categories`** — Category management page. Uses `useCategories`, `categoryService`, `CategoryModal`, `SubcategoryModal`. Supports CRUD for categories and subcategories, archive/unarchive, nested subcategory display.

### `src/pages/Tags.jsx`
Default export: **`Tags`** — Simple tag management page. Uses `useTags`, `tagService`. Quick-add form, tag list with delete confirmations.

### `src/pages/RecurringTransactions.jsx`
Default export: **`RecurringTransactions`** — Recurring rules page. Uses `useRecurringTransactions`, `recurringService`, `RecurringModal`. Supports add/edit/delete rules, toggle active/paused, "Process Due Now" button.

### `src/pages/PeopleEntities.jsx`
Default export: **`PeopleEntities`** — People/entities management page. Uses `usePeopleEntities`, `peopleService`. Quick-create form with name/type (Person/Company/Bank), grid display.

### `src/pages/NetWorth.jsx`
Default export: **`NetWorth`** — Net worth tracker page. Uses `useNetWorth`, `netWorthService`, `useCurrencies`, `useLocalStorage`. Displays net worth, assets, liabilities KPI cards, historical trend line chart, asset/liability breakdown tables, snapshot capture/delete. Requires `recharts`.

### `src/pages/Reports.jsx`
Default export: **`Reports`** — Stub page. Returns simple `<div>Reports</div>`.

### `src/pages/Search.jsx`
Default export: **`Search`** — Stub page. Returns simple `<div>Search</div>`.

### `src/pages/Settings.jsx`
Default export: **`Settings`** — Settings page with accordion layout. Sections: Currencies & Exchange Rates, People & Entities, Categories & Subcategories, Tags Management, Seed Sample Data. Uses `CurrenciesSettings`, `Categories`, `Tags`, `PeopleEntities` components, and `seedDatabase` from `../db/seed`.

### `src/pages/Debts.jsx`
Default export: **`Debts`** — Debt management page. Uses `useDebts`, `debtService`, `DebtModal`, `DebtPaymentModal`, `ConfirmDialog`. Features direction filter tabs (All / I Owe / They Owe), table with person/entity, amounts, status, pay/delete actions.

---

## 11. Tests

### `src/__tests__/setup.js`
Test setup configuration file.

### `src/__tests__/recurringService.test.js`
Tests for `recurringService`.

### `src/__tests__/debtService.test.js`
Tests for `debtService`.

### `src/__tests__/conversions.test.js`
Tests for `conversions.js` (cross-currency conversion logic).

### `src/__tests__/budgetService.test.js`
Tests for `budgetService`.

---

## 12. Root-Level Files

### `TODO.md`
Project TODOs (not read).

### `README.md`
Project readme (not read).

### `.gitignore`
Git ignore rules (not read).

### `public/`
Static public assets directory.

---

## Data Flow Summary

```
User Interaction (Pages)
  │
  ├──► Hooks (useXxx) ──► Dexie DB (db) ──► Services (business logic)
  │         │                                    │
  │         │                              Finance Module (calculations)
  │         │                                    │
  │         └────────────────────────────────────┘
  │
  ├──► Context Providers (Theme, Toast)
  │
  └──► Services ──► DB Transactions (atomic "rw" blocks)
                    ├── auditLogs
                    └── Related entities (transactions, lines, attachments)
```

**Key Patterns**:
- All DB writes use Dexie `"rw"` (read-write) transactions for atomicity
- All multi-table operations write an `auditLogs` entry
- All hooks use `useLiveQuery` for reactive data
- Soft-delete pattern: `isDeleted` flag on transactions, debts, payments, attachments
- Cross-currency: USD used as triangulation bridge via `getTriangulatedExchangeRate`
- Money precision: All arithmetic via `money` object (2 decimal places)
