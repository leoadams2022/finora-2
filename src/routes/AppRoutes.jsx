import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import AppLayout from "../components/layout/AppLayout";

// Core Pages
import Dashboard from "../pages/Dashboard";
import Accounts from "../pages/Accounts";
import Transactions from "../pages/Transactions";
import Transfers from "../pages/Transfers";
import Budgets from "../pages/Budgets";
import RecurringTransactions from "../pages/RecurringTransactions";
import Debts from "../pages/Debts";
import PeopleEntities from "../pages/PeopleEntities";
import NetWorth from "../pages/NetWorth";
import Reports from "../pages/Reports";
import Categories from "../pages/Categories";
import Tags from "../pages/Tags";
import Settings from "../pages/Settings";
import Currencies from "../pages/Currencies";
import AuditHistory from "../pages/AuditHistory";
import Home from "../pages/Home";
/**
 * Main Routing Component for Finora Web App.
 * Maps routes defined in technical specification to main application layout and views.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Primary Application Layout Shell wrapper */}
      <Route path="/" element={<AppLayout />}>
        {/* Main Sections */}
        <Route index element={<Home />} />

        <Route path="dashboard" element={<Dashboard />} />
        {/* Account Routes */}
        <Route path="accounts" element={<Accounts />} />
        <Route path="accounts/:accountId" element={<Accounts />} />

        {/* Transaction Routes */}
        <Route path="transactions" element={<Transactions />} />
        <Route path="transactions/:transactionId" element={<Transactions />} />

        {/* Transfers & Fees */}
        <Route path="transfers" element={<Transfers />} />

        {/* Budgets */}
        <Route path="budgets" element={<Budgets />} />

        {/* Recurring Transactions */}
        <Route
          path="recurring-transactions"
          element={<RecurringTransactions />}
        />

        {/* Debts & Liabilities */}
        <Route path="debts" element={<Debts />} />
        <Route path="debts/:debtId" element={<Debts />} />

        {/* People & Entities */}
        <Route path="people" element={<PeopleEntities />} />
        <Route path="people/:personId" element={<PeopleEntities />} />

        {/* Net Worth */}
        <Route path="net-worth" element={<NetWorth />} />

        {/* Financial Reports & Analytics */}
        <Route path="reports" element={<Reports />} />

        <Route path="currencies" element={<Currencies />} />

        {/* Categories & Subcategories */}
        <Route path="categories" element={<Categories />} />

        {/* Flexible Tags */}
        <Route path="tags" element={<Tags />} />

        {/* Application Settings & Exchange Rates */}
        <Route path="settings/*" element={<Settings />} />

        <Route path="audit/*" element={<AuditHistory />} />

        {/* Fallback to Dashboard for unknown sub-paths AuditHistory*/}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
