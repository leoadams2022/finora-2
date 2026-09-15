/**
 * Validates Account creation & editing payload.
 */
export const validateAccount = (accountData) => {
  const errors = {};

  if (!accountData.name || !accountData.name.trim()) {
    errors.name = "Account name is required.";
  }

  if (!accountData.type) {
    errors.type = "Account type is required.";
  }

  if (!accountData.currency) {
    errors.currency = "Account currency is required.";
  }

  if (
    accountData.accountNumberLast4 &&
    accountData.accountNumberLast4.trim() !== ""
  ) {
    const cleanDigits = accountData.accountNumberLast4.trim();
    if (!/^\d{4}$/.test(cleanDigits)) {
      errors.accountNumberLast4 =
        "Last 4 digits must contain exactly 4 numbers.";
    }
  }

  if (accountData.type === "credit_card") {
    if (
      accountData.creditLimit === undefined ||
      accountData.creditLimit === null ||
      Number(accountData.creditLimit) < 0
    ) {
      errors.creditLimit = "Credit limit must be a non-negative number.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
