import { useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import { defaultProfile, emptyCustomerForm, emptyStatusForm, emptyTypeForm, themes } from "../constants/appConstants";
import { filterAndSortEntries, getNextSlno, makeForm, today } from "../models/customerModel";
import {
  loadAppData,
  saveCustomers,
  saveCustomStatuses,
  saveEntries,
  saveLoggedIn,
  saveProfile,
  saveThemeMode,
  saveTypes,
  shareExcelFile,
  sharePdfReport,
  uploadExcelToGoogleDrive
} from "../models/storageModel";

export function useCustomerController() {
  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customStatuses, setCustomStatuses] = useState([]);
  const [types, setTypes] = useState([]);
  const [profile, setProfile] = useState(defaultProfile);
  const [screen, setScreen] = useState("start");
  const [screenHistory, setScreenHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [editingTypeName, setEditingTypeName] = useState(null);
  const [form, setForm] = useState(makeForm());
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [statusForm, setStatusForm] = useState(emptyStatusForm);
  const [typeForm, setTypeForm] = useState(emptyTypeForm);
  const [listMode, setListMode] = useState("entries");
  const [newType, setNewType] = useState("");
  const [filter, setFilter] = useState({ date: "", customer: "", type: "", status: "" });
  const [exportFilter, setExportFilter] = useState({ fromDate: "", toDate: "", customer: "", status: "", type: "" });
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [themeMode, setThemeModeState] = useState("light");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadAppData();
        setEntries(data.entries);
        setCustomers(data.customers);
        setCustomStatuses(data.customStatuses);
        setTypes(data.types);
        setProfile(data.profile);
        setThemeModeState(data.themeMode);
        setLoggedIn(data.loggedIn);
        setScreen(data.loggedIn ? "dashboard" : "start");
      } catch {
        Alert.alert("Storage error", "Saved data could not be loaded.");
      }
    }
    load();
  }, []);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveCustomStatuses(customStatuses);
  }, [customStatuses]);

  useEffect(() => {
    saveTypes(types);
  }, [types]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveThemeMode(themeMode);
  }, [themeMode]);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedId),
    [entries, selectedId]
  );

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  const selectedStatus = useMemo(
    () => customStatuses.find((status) => status.id === selectedStatusId),
    [customStatuses, selectedStatusId]
  );

  const visibleEntries = useMemo(
    () => filterAndSortEntries(entries, filter, sortBy, sortDir),
    [entries, filter, sortBy, sortDir]
  );

  const statusOptions = useMemo(
    () => Array.from(new Set(customStatuses.map((status) => status.name).filter(Boolean))),
    [customStatuses]
  );

  const stats = useMemo(
    () => {
      const byStatus = statusOptions.reduce((result, status) => {
        result[status] = entries.filter((entry) => entry.status === status).length;
        return result;
      }, {});
      const countByText = (patterns) =>
        entries.filter((entry) => {
          const value = `${entry.status || ""}`.toLowerCase();
          return patterns.some((pattern) => value.includes(pattern));
        }).length;

      return {
        total: entries.length,
        running: countByText(["running", "active", "progress"]),
        completed: countByText(["completed", "complete", "done", "finished"]),
        onHold: countByText(["hold", "pending", "pause"]),
        newlyAdded: countByText(["new"]),
        cancelled: countByText(["cancel", "reject"]),
        byStatus
      };
    },
    [entries, statusOptions]
  );

  const exportEntriesList = useMemo(
    () =>
      entries
        .filter((entry) => {
          const matchesFrom = exportFilter.fromDate ? entry.date >= exportFilter.fromDate : true;
          const matchesTo = exportFilter.toDate ? entry.date <= exportFilter.toDate : true;
          const matchesCustomer = exportFilter.customer ? entry.name === exportFilter.customer : true;
          const matchesStatus = exportFilter.status ? entry.status === exportFilter.status : true;
          const matchesType = exportFilter.type ? entry.type === exportFilter.type : true;
          return matchesFrom && matchesTo && matchesCustomer && matchesStatus && matchesType;
        })
        .sort((left, right) => {
          const leftSlno = Number(left.slno);
          const rightSlno = Number(right.slno);
          if (Number.isFinite(leftSlno) && Number.isFinite(rightSlno)) {
            return leftSlno - rightSlno;
          }
          return `${left.slno || ""}`.localeCompare(`${right.slno || ""}`);
        }),
    [entries, exportFilter]
  );

  const exportStats = useMemo(
    () => {
      const byStatus = statusOptions.reduce((result, status) => {
        result[status] = exportEntriesList.filter((entry) => entry.status === status).length;
        return result;
      }, {});

      return {
        total: exportEntriesList.length,
        byStatus
      };
    },
    [exportEntriesList, statusOptions]
  );

  function normalizeListMode(mode) {
    const normalized = `${mode || ""}`.trim().toLowerCase();
    const aliases = {
      "current entries": "entries",
      entry: "entries",
      entries: "entries",
      customer: "customers",
      customers: "customers",
      status: "statuses",
      statuses: "statuses",
      type: "types",
      types: "types"
    };

    return aliases[normalized] || "entries";
  }

  function changeListMode(mode) {
    setListMode(normalizeListMode(mode));
  }

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setCustomerField(field, value) {
    setCustomerForm((current) => ({ ...current, [field]: value }));
  }

  function setStatusField(field, value) {
    setStatusForm((current) => ({ ...current, [field]: value }));
  }

  function setTypeField(field, value) {
    setTypeForm((current) => ({ ...current, [field]: value }));
  }

  function resetEntryForm() {
    setEditingId(null);
    setForm(makeForm());
    setNewType("");
  }

  function resetCustomerForm() {
    setEditingCustomerId(null);
    setCustomerForm(emptyCustomerForm);
  }

  function resetStatusForm() {
    setEditingStatusId(null);
    setStatusForm(emptyStatusForm);
  }

  function resetTypeForm() {
    setEditingTypeName(null);
    setTypeForm(emptyTypeForm);
  }

  function navigate(nextScreen) {
    setScreen((currentScreen) => {
      if (currentScreen && currentScreen !== nextScreen) {
        setScreenHistory((current) => [...current, currentScreen].slice(-30));
      }
      return nextScreen;
    });
  }

  function replaceScreen(nextScreen) {
    setScreenHistory([]);
    setScreen(nextScreen);
  }

  function goBack(fallbackScreen = "dashboard") {
    setScreenHistory((current) => {
      const previousScreen = current[current.length - 1];
      if (previousScreen) {
        setScreen(previousScreen);
        return current.slice(0, -1);
      }

      if (screen !== fallbackScreen) {
        setScreen(fallbackScreen);
      }
      return current;
    });
  }

  async function login(profileData = {}) {
    const nextProfile = { ...profile, ...profileData };
    setProfile(nextProfile);
    await saveProfile(nextProfile);
    setLoggedIn(true);
    await saveLoggedIn(true);
    replaceScreen("dashboard");
  }

  async function logout() {
    setLoggedIn(false);
    await saveLoggedIn(false);
    replaceScreen("start");
  }

  function openCreate() {
    navigate("newEntry");
  }

  function openEntryCreate() {
    setEditingId(null);
    setForm({ ...makeForm(), slno: getNextSlno(entries), status: "" });
    setNewType("");
    navigate("form");
  }

  function openCustomerCreate() {
    setEditingCustomerId(null);
    setCustomerForm(emptyCustomerForm);
    navigate("customerForm");
  }

  function openStatusCreate() {
    setEditingStatusId(null);
    setStatusForm(emptyStatusForm);
    navigate("statusForm");
  }

  function openTypeCreate() {
    setEditingTypeName(null);
    setTypeForm(emptyTypeForm);
    navigate("typeForm");
  }

  function openEdit(entry) {
    setEditingId(entry.id);
    setForm(makeForm(entry));
    setNewType("");
    navigate("form");
  }

  function openCustomerEdit(customer) {
    setEditingCustomerId(customer.id);
    setCustomerForm({
      name: customer.name || "",
      details: customer.details || "",
      location: customer.location || "",
      phone: customer.phone || ""
    });
    navigate("customerForm");
  }

  function openStatusEdit(status) {
    setEditingStatusId(status.id);
    setStatusForm({ name: status.name || "" });
    navigate("statusForm");
  }

  function openTypeEdit(typeName) {
    setEditingTypeName(typeName);
    setTypeForm({ name: typeName || "" });
    navigate("typeForm");
  }

  function applyCustomerToEntry(customerName) {
    const customer = customers.find((item) => item.name === customerName);
    setForm((current) => ({
      ...current,
      name: customerName,
      phone: customer?.phone || current.phone
    }));
  }

  function saveEntry() {
    if (!form.name.trim()) {
      Alert.alert("Missing details", "Name is required.");
      return;
    }

    const finalType = newType.trim() || form.type.trim();
    if (!finalType) {
      Alert.alert("Missing type", "Select a type or enter a new one.");
      return;
    }

    if (!form.status.trim()) {
      Alert.alert("Missing status", "Create or select a status before saving this entry.");
      return;
    }

    if (!types.includes(finalType)) {
      setTypes((current) => [finalType, ...current]);
    }

    const payload = {
      ...form,
      type: finalType,
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      setEntries((current) =>
        current.map((entry) => (entry.id === editingId ? { ...entry, ...payload } : entry))
      );
      setSelectedId(editingId);
      resetEntryForm();
      replaceScreen("detail");
      return;
    }

    const id = `${Date.now()}`;
    setEntries((current) => [
      {
        ...payload,
        id,
        date: today(),
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
    setSelectedId(id);
    resetEntryForm();
    replaceScreen("detail");
  }

  function saveCustomer() {
    if (!customerForm.name.trim()) {
      Alert.alert("Missing details", "Customer name is required.");
      return;
    }

    const payload = {
      ...customerForm,
      name: customerForm.name.trim(),
      updatedAt: new Date().toISOString()
    };

    if (editingCustomerId) {
      const previousCustomer = customers.find((customer) => customer.id === editingCustomerId);
      setCustomers((current) =>
        current.map((customer) => (customer.id === editingCustomerId ? { ...customer, ...payload } : customer))
      );
      if (previousCustomer?.name) {
        setEntries((current) =>
          current.map((entry) =>
            entry.name === previousCustomer.name
              ? { ...entry, name: payload.name, phone: payload.phone, updatedAt: new Date().toISOString() }
              : entry
          )
        );
      }
    } else {
      setCustomers((current) => [{ ...payload, id: `${Date.now()}`, createdAt: new Date().toISOString() }, ...current]);
    }
    resetCustomerForm();
    changeListMode("customers");
    replaceScreen("list");
  }

  function saveCustomStatus() {
    const name = statusForm.name.trim();
    if (!name) {
      Alert.alert("Missing details", "Status name is required.");
      return;
    }

    if (customStatuses.some((status) => status.name === name && status.id !== editingStatusId)) {
      Alert.alert("Duplicate status", "This status name already exists.");
      return;
    }

    const payload = { name, updatedAt: new Date().toISOString() };
    if (editingStatusId) {
      const previousStatus = customStatuses.find((status) => status.id === editingStatusId);
      setCustomStatuses((current) =>
        current.map((status) => (status.id === editingStatusId ? { ...status, ...payload } : status))
      );
      if (previousStatus?.name) {
        setEntries((current) =>
          current.map((entry) =>
            entry.status === previousStatus.name
              ? { ...entry, status: name, updatedAt: new Date().toISOString() }
              : entry
          )
        );
      }
    } else {
      setCustomStatuses((current) => [{ ...payload, id: `${Date.now()}`, createdAt: new Date().toISOString() }, ...current]);
    }
    resetStatusForm();
    changeListMode("statuses");
    replaceScreen("list");
  }

  function saveType() {
    const name = typeForm.name.trim();
    if (!name) {
      Alert.alert("Missing details", "Type name is required.");
      return;
    }

    if (types.some((type) => type === name && type !== editingTypeName)) {
      Alert.alert("Duplicate type", "This type name already exists.");
      return;
    }

    if (editingTypeName) {
      setTypes((current) => current.map((type) => (type === editingTypeName ? name : type)));
      setEntries((current) => current.map((entry) => (entry.type === editingTypeName ? { ...entry, type: name } : entry)));
    } else {
      setTypes((current) => [name, ...current]);
    }
    resetTypeForm();
    changeListMode("types");
    replaceScreen("list");
  }

  function confirmDelete(title, message, onConfirm) {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
      return;
    }

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onConfirm }
    ]);
  }

  function deleteEntry(id) {
    confirmDelete("Delete entry", "This customer entry will be removed from this phone.", () => {
      setEntries((current) => current.filter((entry) => entry.id !== id));
      setSelectedId(null);
      changeListMode("entries");
      replaceScreen("list");
    });
  }

  function deleteCustomer(id) {
    confirmDelete("Delete customer", "This saved customer will be removed from this phone.", () => {
      const deletedCustomer = customers.find((item) => item.id === id);
      setCustomers((current) => current.filter((item) => item.id !== id));
      if (deletedCustomer?.name) {
        setFilter((current) => ({
          ...current,
          customer: current.customer === deletedCustomer.name ? "" : current.customer
        }));
      }
      changeListMode("customers");
      replaceScreen("list");
    });
  }

  function deleteCustomStatus(id) {
    confirmDelete("Delete status", "This status option will be removed from this phone.", () => {
      const deletedStatus = customStatuses.find((item) => item.id === id);
      setCustomStatuses((current) => current.filter((item) => item.id !== id));
      if (deletedStatus?.name) {
        setEntries((current) =>
          current.map((entry) =>
            entry.status === deletedStatus.name ? { ...entry, status: "", updatedAt: new Date().toISOString() } : entry
          )
        );
      }
      changeListMode("statuses");
      replaceScreen("list");
    });
  }

  function deleteType(typeName) {
    const normalizedName = `${typeName || ""}`.trim();
    if (!normalizedName) {
      return;
    }

    confirmDelete("Delete type", "This type option will be removed from this phone.", () => {
      setTypes((current) => current.filter((type) => `${type || ""}`.trim() !== normalizedName));
      setEntries((current) =>
        current.map((entry) =>
          `${entry.type || ""}`.trim() === normalizedName ? { ...entry, type: "", updatedAt: new Date().toISOString() } : entry
        )
      );
      setFilter((current) => ({
        ...current,
        type: `${current.type || ""}`.trim() === normalizedName ? "" : current.type
      }));
      setForm((current) => ({
        ...current,
        type: `${current.type || ""}`.trim() === normalizedName ? "" : current.type
      }));
      setNewType((current) => (`${current || ""}`.trim() === normalizedName ? "" : current));
      setEditingTypeName((current) => (`${current || ""}`.trim() === normalizedName ? null : current));
      changeListMode("types");
      replaceScreen("list");
    });
  }

  async function exportEntries() {
    if (!exportEntriesList.length) {
      Alert.alert("No data", "No entries match the selected export conditions.");
      return;
    }

    try {
      setExporting(true);
      const file = await shareExcelFile(exportEntriesList);
      Alert.alert(
        "Export ready",
        `${file.fallback ? "Excel-compatible file" : "Excel file"} ${
          Platform.OS === "web" ? "downloaded" : "created"
        }:\n${file.uri}`
      );
    } catch (error) {
      Alert.alert("Export failed", error?.message || "The Excel file could not be created.");
    } finally {
      setExporting(false);
    }
  }

  async function uploadToGoogleDrive() {
    if (!exportEntriesList.length) {
      Alert.alert("No data", "No entries match the selected export conditions.");
      return;
    }

    try {
      setExporting(true);
      const file = await uploadExcelToGoogleDrive(exportEntriesList);
      Alert.alert(
        "Upload ready",
        Platform.OS === "web"
          ? `${file.fallback ? "Excel-compatible file" : "Excel file"} downloaded:\n${file.uri}\nGoogle Drive opened in a new tab.`
          : `Choose Google Drive from the share sheet to upload the ${file.fallback ? "Excel-compatible file" : "Excel file"}.`
      );
    } catch (error) {
      Alert.alert("Upload failed", error?.message || "The Excel file could not be shared.");
    } finally {
      setExporting(false);
    }
  }

  async function exportPdfReport() {
    if (!exportEntriesList.length) {
      Alert.alert("No data", "No entries match the selected export conditions.");
      return;
    }

    try {
      setExportingPdf(true);
      const uri = await sharePdfReport(exportEntriesList, profile, exportStats);
      Alert.alert(
        "PDF ready",
        Platform.OS === "web" ? "The report opened in a new print window." : `PDF report created:\n${uri}`
      );
    } catch {
      Alert.alert("PDF export failed", "The PDF report could not be created.");
    } finally {
      setExportingPdf(false);
    }
  }

  function setThemeMode(mode) {
    setThemeModeState(mode);
  }

  return {
    entries,
    exportEntriesList,
    exportFilter,
    customers,
    customStatuses,
    customerForm,
    editing: Boolean(editingId),
    exporting,
    exportingPdf,
    filter,
    form,
    listMode: normalizeListMode(listMode),
    newType,
    profile,
    loggedIn,
    screen,
    selectedEntry,
    selectedCustomer,
    selectedStatus,
    sortBy,
    sortDir,
    stats,
    statusForm,
    theme: themes[themeMode],
    themeMode,
    types,
    typeForm,
    visibleEntries,
    statusOptions,
    applyCustomerToEntry,
    deleteCustomer,
    deleteEntry,
    deleteCustomStatus,
    deleteType,
    exportEntries,
    exportPdfReport,
    login,
    logout,
    openCreate,
    openCustomerCreate,
    openCustomerEdit,
    openEdit,
    openEntryCreate,
    openStatusCreate,
    openStatusEdit,
    openTypeCreate,
    openTypeEdit,
    saveCustomer,
    saveCustomStatus,
    saveEntry,
    saveType,
    setCustomerField,
    setExportFilter,
    setField,
    setFilter,
    setListMode: changeListMode,
    setNewType,
    setProfile,
    setScreen: navigate,
    setSelectedId,
    setSelectedCustomerId,
    setSelectedStatusId,
    setSortBy,
    setSortDir,
    setThemeMode,
    setStatusField,
    setTypeField,
    uploadToGoogleDrive,
    goBack,
    replaceScreen
  };
}
