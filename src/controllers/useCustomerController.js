import { useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import { defaultProfile, statuses, themes } from "../constants/appConstants";
import { filterAndSortEntries, getNextSlno, makeForm, today } from "../models/customerModel";
import {
  loadAppData,
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
  const [types, setTypes] = useState([]);
  const [profile, setProfile] = useState(defaultProfile);
  const [screen, setScreen] = useState("start");
  const [screenHistory, setScreenHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(makeForm());
  const [newType, setNewType] = useState("");
  const [filter, setFilter] = useState({ date: "", type: "", status: "" });
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
        setTypes(data.types);
        setProfile(data.profile);
        setThemeModeState(data.themeMode);
        setLoggedIn(data.loggedIn);
        setScreen(data.loggedIn ? "status" : "start");
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

  const visibleEntries = useMemo(
    () => filterAndSortEntries(entries, filter, sortBy, sortDir),
    [entries, filter, sortBy, sortDir]
  );

  const stats = useMemo(
    () => {
      const byStatus = statuses.reduce((result, status) => {
        result[status] = entries.filter((entry) => entry.status === status).length;
        return result;
      }, {});

      return {
        total: entries.length,
        running: byStatus["Currently Running"],
        completed: byStatus.Completed,
        onHold: byStatus["On Hold"],
        newlyAdded: byStatus["Newly Added"],
        cancelled: byStatus.Cancelled,
        byStatus
      };
    },
    [entries]
  );

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
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

  function goBack(fallbackScreen = "status") {
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
    replaceScreen("status");
  }

  async function logout() {
    setLoggedIn(false);
    await saveLoggedIn(false);
    replaceScreen("start");
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...makeForm(), slno: getNextSlno(entries) });
    setNewType("");
    navigate("form");
  }

  function openEdit(entry) {
    setEditingId(entry.id);
    setForm(makeForm(entry));
    setNewType("");
    navigate("form");
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

    if (!types.includes(finalType)) {
      setTypes((current) => [...current, finalType].sort());
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
      navigate("detail");
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
    navigate("detail");
  }

  function deleteEntry(id) {
    Alert.alert("Delete entry", "This customer entry will be removed from this phone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setEntries((current) => current.filter((entry) => entry.id !== id));
          setSelectedId(null);
          replaceScreen("list");
        }
      }
    ]);
  }

  async function exportEntries() {
    if (!entries.length) {
      Alert.alert("No data", "Add at least one entry before exporting.");
      return;
    }

    try {
      setExporting(true);
      const file = await shareExcelFile(entries);
      Alert.alert(
        "Export ready",
        `${file.fallback ? "CSV fallback file" : "Excel file"} ${
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
    if (!entries.length) {
      Alert.alert("No data", "Add at least one entry before uploading.");
      return;
    }

    try {
      setExporting(true);
      const file = await uploadExcelToGoogleDrive(entries);
      Alert.alert(
        "Upload ready",
        Platform.OS === "web"
          ? `${file.fallback ? "CSV fallback file" : "Excel file"} downloaded:\n${file.uri}\nGoogle Drive opened in a new tab.`
          : `Choose Google Drive from the share sheet to upload the ${file.fallback ? "CSV fallback file" : "Excel file"}.`
      );
    } catch (error) {
      Alert.alert("Upload failed", error?.message || "The Excel file could not be shared.");
    } finally {
      setExporting(false);
    }
  }

  async function exportPdfReport() {
    if (!entries.length) {
      Alert.alert("No data", "Add at least one entry before exporting.");
      return;
    }

    try {
      setExportingPdf(true);
      const uri = await sharePdfReport(entries, profile, stats);
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
    editing: Boolean(editingId),
    exporting,
    exportingPdf,
    filter,
    form,
    newType,
    profile,
    loggedIn,
    screen,
    selectedEntry,
    sortBy,
    sortDir,
    stats,
    theme: themes[themeMode],
    themeMode,
    types,
    visibleEntries,
    deleteEntry,
    exportEntries,
    exportPdfReport,
    login,
    logout,
    openCreate,
    openEdit,
    saveEntry,
    setField,
    setFilter,
    setNewType,
    setProfile,
    setScreen: navigate,
    setSelectedId,
    setSortBy,
    setSortDir,
    setThemeMode,
    uploadToGoogleDrive,
    goBack,
    replaceScreen
  };
}
