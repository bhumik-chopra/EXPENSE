const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function getCurrentLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  if (!value || value === "Invalid Date") {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isSameLocalDate(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function formatDateInfo(value) {
  const parsedDate = parseDate(value);
  const today = new Date();

  if (!parsedDate) {
    return {
      raw: value || "",
      formatted: DATE_FORMATTER.format(today),
      isToday: true,
      note: "Using today's date",
      isoDate: getCurrentLocalDate(),
    };
  }

  const todayFlag = isSameLocalDate(parsedDate, today);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return {
    raw: value || `${year}-${month}-${day}`,
    formatted: DATE_FORMATTER.format(parsedDate),
    isToday: todayFlag,
    note: todayFlag ? "Today's date" : "Detected from receipt",
    isoDate: `${year}-${month}-${day}`,
  };
}

export function formatDisplayDate(value) {
  return formatDateInfo(value);
}
