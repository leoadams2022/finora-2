import Decimal from "decimal.js";
// Configure Decimal defaults for financial arithmetic
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });
export const money = {
  /**
   * Adds two numbers with fixed decimal precision (2 decimal places).
   */
  add(a, b) {
    return new Decimal(a || 0)
      .plus(b || 0)
      .toDecimalPlaces(2)
      .toNumber();
  },

  /**
   * Subtracts b from a with fixed decimal precision.
   */
  subtract(a, b) {
    return new Decimal(a || 0)
      .minus(b || 0)
      .toDecimalPlaces(2)
      .toNumber();
  },

  /**
   * Multiplies two numbers with fixed decimal precision.
   */
  multiply(a, b) {
    return new Decimal(a || 0)
      .times(b || 0)
      .toDecimalPlaces(2)
      .toNumber();
  },

  /**
   * Divides a by b with fixed decimal precision (supports rate precision up to 6 decimals).
   */
  divide(a, b) {
    const divisor = new Decimal(b || 0);
    if (divisor.isZero()) return 0;
    return new Decimal(a || 0).dividedBy(divisor).toDecimalPlaces(6).toNumber();
  },

  /**
   * Calculates fee amount from a percentage rate with fixed decimal precision.
   */
  calculatePercentageFee(amount, rate) {
    const numAmount = new Decimal(amount || 0);
    const numRate = new Decimal(rate || 0);
    return numAmount
      .times(numRate.dividedBy(100))
      .toDecimalPlaces(2)
      .toNumber();
  },

  /**
   * Formats a number to 2 decimal places.
   */
  format(val) {
    return new Decimal(val || 0).toFixed(2);
  },
};
