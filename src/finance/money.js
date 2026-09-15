// src/finance/money.js

export const money = {
  /**
   * Adds two numbers with fixed decimal precision (2 decimal places).
   */
  add(a, b) {
    return Math.round((Number(a || 0) + Number(b || 0)) * 100) / 100;
  },

  /**
   * Subtracts b from a with fixed decimal precision.
   */
  subtract(a, b) {
    return Math.round((Number(a || 0) - Number(b || 0)) * 100) / 100;
  },

  /**
   * Multiplies two numbers with fixed decimal precision.
   */
  multiply(a, b) {
    return Math.round(Number(a || 0) * Number(b || 0) * 100) / 100;
  },

  /**
   * Divides a by b with fixed decimal precision (supports rate precision up to 6 decimals).
   */
  divide(a, b) {
    const numB = Number(b || 0);
    if (numB === 0) return 0;
    return Math.round((Number(a || 0) / numB) * 1000000) / 1000000;
  },

  /**
   * Calculates fee amount from a percentage rate with fixed decimal precision.
   */
  calculatePercentageFee(amount, rate) {
    const numAmount = Number(amount || 0);
    const numRate = Number(rate || 0);
    return Math.round(numAmount * (numRate / 100) * 100) / 100;
  },

  /**
   * Formats a number to 2 decimal places.
   */
  format(val) {
    return (Math.round(Number(val || 0) * 100) / 100).toFixed(2);
  },
};
