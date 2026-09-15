/**
 * Utility functions for calculating date range presets.
 */

// Helper to format Date instance to YYYY-MM-DD string
export const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const PRESET_DATE_RANGES = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "this_week", label: "This Week" },
  { key: "last_week", label: "Last Week" },
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "custom", label: "Custom" },
];

/**
 * Calculates start and end YYYY-MM-DD dates for a preset key.
 */
export const getPresetDateRange = (presetKey) => {
  const today = new Date();
  let startDate = "";
  let endDate = "";

  switch (presetKey) {
    case "today": {
      const iso = formatDateToISO(today);
      startDate = iso;
      endDate = iso;
      break;
    }
    case "yesterday": {
      const yest = new Date(today);
      yest.setDate(today.getDate() - 1);
      const iso = formatDateToISO(yest);
      startDate = iso;
      endDate = iso;
      break;
    }
    case "this_week": {
      // Assuming Sunday as start of week (0)
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      startDate = formatDateToISO(start);
      endDate = formatDateToISO(end);
      break;
    }
    case "last_week": {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay() - 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      startDate = formatDateToISO(start);
      endDate = formatDateToISO(end);
      break;
    }
    case "this_month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      startDate = formatDateToISO(start);
      endDate = formatDateToISO(end);
      break;
    }
    case "last_month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      startDate = formatDateToISO(start);
      endDate = formatDateToISO(end);
      break;
    }
    default:
      break;
  }

  return { startDate, endDate };
};
