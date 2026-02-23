export function formatDate(value?: { toDate: () => Date } | null) {
  if (!value) return "-";
  return value.toDate().toLocaleDateString();
}

export function daysUntil(value?: { toDate: () => Date } | null) {
  if (!value) return null;
  const now = new Date();
  const due = value.toDate();
  const diffMs = due.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
