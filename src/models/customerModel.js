import { emptyForm, statuses } from "../constants/appConstants";

export const today = () => new Date().toISOString().slice(0, 10);

export const getNextSlno = (entries) => {
  const maxSlno = entries.reduce((max, entry) => {
    const value = Number(entry.slno);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);
  return `${maxSlno + 1}`;
};

export const makeForm = (entry) => ({
  ...emptyForm,
  date: entry?.date || today(),
  estimateDeliveryDate: entry?.estimateDeliveryDate || "",
  slno: entry?.slno || "",
  name: entry?.name || "",
  phone: entry?.phone || "",
  detail1: entry?.detail1 || "",
  detail2: entry?.detail2 || "",
  detail3: entry?.detail3 || "",
  type: entry?.type || "",
  notes: entry?.notes || "",
  status: entry?.status || statuses[0]
});

export const filterAndSortEntries = (entries, filter, sortBy, sortDir) => {
  const filtered = entries.filter((entry) => {
    const matchesDate = filter.date ? entry.date.includes(filter.date) : true;
    const matchesType = filter.type ? entry.type === filter.type : true;
    const matchesStatus = filter.status ? entry.status === filter.status : true;
    return matchesDate && matchesType && matchesStatus;
  });

  return filtered.sort((a, b) => {
    const left = sortBy === "slno" ? Number(a.slno) || a.slno : a[sortBy] || "";
    const right = sortBy === "slno" ? Number(b.slno) || b.slno : b[sortBy] || "";
    if (left < right) return sortDir === "asc" ? -1 : 1;
    if (left > right) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
};

export const toExcelRows = (entries) =>
  entries.map((entry) => ({
    Date: entry.date,
    "Estimated Delivery Date": entry.estimateDeliveryDate,
    "SL No": entry.slno,
    Name: entry.name,
    Phone: entry.phone,
    "Detail 1": entry.detail1,
    "Detail 2": entry.detail2,
    "Detail 3": entry.detail3,
    Type: entry.type,
    Status: entry.status,
    Notes: entry.notes,
    "Created At": entry.createdAt,
    "Updated At": entry.updatedAt
  }));
