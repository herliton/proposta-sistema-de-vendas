export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export function getCurrentWeekRange(referenceDate = new Date()): DateRange {
  const startDate = new Date(referenceDate);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

export function formatDateRange({ startDate, endDate }: DateRange) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return `${formatter.format(startDate)} — ${formatter.format(endDate)}, ${endDate.getFullYear()}`;
}

export function dateFromInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(Number.NaN);
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (toApiDate(date) !== value) return new Date(Number.NaN);
  return date;
}

export function isDateRangeValid({ startDate, endDate }: DateRange) {
  return !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    endDate >= startDate &&
    endDate.getTime() - startDate.getTime() < 366 * 24 * 60 * 60 * 1000;
}

export function toApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
