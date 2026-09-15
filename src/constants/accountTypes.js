export const ACCOUNT_TYPES = {
  SAVINGS: {
    key: "savings",
    label: "Savings Account",
    icon: "PiggyBank",
    isLiability: false,
  },
  CHECKING: {
    key: "checking",
    label: "Current / Checking",
    icon: "Landmark",
    isLiability: false,
  },
  CREDIT_CARD: {
    key: "credit_card",
    label: "Credit Card",
    icon: "CreditCard",
    isLiability: true,
  },
  CASH: { key: "cash", label: "Cash", icon: "Banknote", isLiability: false },
  E_WALLET: {
    key: "e_wallet",
    label: "E-Wallet",
    icon: "Smartphone",
    isLiability: false,
  },
  INVESTMENT: {
    key: "investment",
    label: "Investment",
    icon: "TrendingUp",
    isLiability: false,
  },
  LOAN: { key: "loan", label: "Loan", icon: "Receipt", isLiability: true },
  OTHER: { key: "other", label: "Other", icon: "Wallet", isLiability: false },
};

export const ACCOUNT_TYPE_OPTIONS = Object.values(ACCOUNT_TYPES);
