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

export function formatWeekRange({ startDate, endDate }: DateRange) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return `${formatter.format(startDate)} — ${formatter.format(endDate)}, ${endDate.getFullYear()}`;
}

export function toApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
