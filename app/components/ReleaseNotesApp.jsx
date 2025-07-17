"use client";

import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import AdminPanel from "./AdminPanel";
import { getUniqueMonths, getMonthYear, isAdminIP } from "../utils/helpers";

const ReleaseNotesApp = () => {
  // Email subscription states
  const [email, setEmail] = useState("");
  const [unsubscribeEmail, setUnsubscribeEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Release notes states
  const [releaseNotes, setReleaseNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [newNote, setNewNote] = useState({
    version: "",
    date: new Date().toISOString().split("T")[0],
    type: "patch",
    title: "",
    description: "",
    tags: [],
    changes: [{ type: "feature", text: "" }],
  });

  // Refs
  const monthRefs = useRef({});

  // Fetch release notes from database
  const fetchReleaseNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/release-notes");
      const result = await response.json();

      if (response.ok) {
        setReleaseNotes(result.data);
      } else {
        setError(result.error || "Failed to fetch release notes");
      }
    } catch (error) {
      console.error("Error fetching release notes:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check admin access and fetch data on component mount
  useEffect(() => {
    const initializeApp = async () => {
      const hasAdminAccess = await isAdminIP();
      setIsAdmin(hasAdminAccess);

      // Fetch release notes
      await fetchReleaseNotes();
    };

    initializeApp();
  }, []);

  // Computed values
  const uniqueMonths = getUniqueMonths(releaseNotes);
  const uniqueTags = [
    ...new Set(releaseNotes.flatMap((note) => note.tags)),
  ].sort();

  const filteredNotes = releaseNotes.filter((note) => {
    const monthMatch =
      selectedMonth === "all" || getMonthYear(note.date) === selectedMonth;
    const tagMatch =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => note.tags.includes(tag));
    return monthMatch && tagMatch;
  });

  // Email handlers with API calls
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailLoading(true);
    setEmailError("");

    try {
      const response = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        setEmail("");
        setTimeout(() => setIsSubscribed(false), 3000);
      } else {
        // Handle specific error cases
        if (response.status === 409) {
          setEmailError("This email is already subscribed");
        } else {
          setEmailError(data.error || "Failed to subscribe. Please try again.");
        }
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      setEmailError("Network error. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!unsubscribeEmail || !unsubscribeEmail.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailLoading(true);
    setEmailError("");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: unsubscribeEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsUnsubscribed(true);
        setUnsubscribeEmail("");
        setTimeout(() => setIsUnsubscribed(false), 3000);
      } else {
        // Handle specific error cases
        if (response.status === 404) {
          setEmailError("Email not found in our subscriber list");
        } else {
          setEmailError(
            data.error || "Failed to unsubscribe. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      setEmailError("Network error. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  // Clear error when switching between subscribe/unsubscribe
  useEffect(() => {
    setEmailError("");
  }, [showUnsubscribe]);

  // Filter handlers
  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setShowFilters(false);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  // Admin handlers
  const addNewNote = async () => {
    if (newNote.version && newNote.title) {
      // Instead of adding to state, we'll need to call the API
      // For now, let's add to state and refresh from database
      const noteWithId = {
        ...newNote,
        id: Date.now().toString(),
        changes: newNote.changes.filter((change) => change.text.trim() !== ""),
      };
      setReleaseNotes([noteWithId, ...releaseNotes]);
      setNewNote({
        version: "",
        date: new Date().toISOString().split("T")[0],
        type: "patch",
        title: "",
        description: "",
        tags: [],
        changes: [{ type: "feature", text: "" }],
      });

      // TODO: Later we'll replace this with API call and refresh
      // For now, refresh from database after a brief delay
      setTimeout(() => {
        fetchReleaseNotes();
      }, 100);
    }
  };

  const deleteNote = async (id) => {
    // Remove from state immediately for better UX
    setReleaseNotes(releaseNotes.filter((note) => note.id !== id));

    // TODO: Later we'll add API call to delete from database
    // For now, the note will come back on next refresh since we're not actually deleting from DB
  };

  const startEditing = (note) => {
    setEditingNote(note.id);
    setEditingData({ ...note });
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditingData(null);
  };

  const saveEdit = () => {
    if (editingData && editingData.version && editingData.title) {
      const updatedNotes = releaseNotes.map((note) =>
        note.id === editingNote
          ? {
              ...editingData,
              changes: editingData.changes.filter(
                (change) => change.text.trim() !== ""
              ),
            }
          : note
      );
      setReleaseNotes(updatedNotes);
      setEditingNote(null);
      setEditingData(null);
    }
  };

  // New note change handlers
  const addChangeToNewNote = () => {
    setNewNote({
      ...newNote,
      changes: [...newNote.changes, { type: "feature", text: "" }],
    });
  };

  const updateNewNoteChange = (index, field, value) => {
    const updatedChanges = newNote.changes.map((change, i) =>
      i === index ? { ...change, [field]: value } : change
    );
    setNewNote({ ...newNote, changes: updatedChanges });
  };

  const removeChangeFromNewNote = (index) => {
    if (newNote.changes.length > 1) {
      const updatedChanges = newNote.changes.filter((_, i) => i !== index);
      setNewNote({ ...newNote, changes: updatedChanges });
    }
  };

  // Editing change handlers
  const updateEditingChange = (index, field, value) => {
    const updatedChanges = editingData.changes.map((change, i) =>
      i === index ? { ...change, [field]: value } : change
    );
    setEditingData({ ...editingData, changes: updatedChanges });
  };

  const addChangeToEditing = () => {
    setEditingData({
      ...editingData,
      changes: [...editingData.changes, { type: "feature", text: "" }],
    });
  };

  const removeChangeFromEditing = (index) => {
    if (editingData.changes.length > 1) {
      const updatedChanges = editingData.changes.filter((_, i) => i !== index);
      setEditingData({ ...editingData, changes: updatedChanges });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading release notes...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchReleaseNotes}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render admin panel if shown
  if (showAdminPanel) {
    return (
      <AdminPanel
        releaseNotes={releaseNotes}
        newNote={newNote}
        setNewNote={setNewNote}
        addNewNote={addNewNote}
        deleteNote={deleteNote}
        addChangeToNewNote={addChangeToNewNote}
        updateNewNoteChange={updateNewNoteChange}
        removeChangeFromNewNote={removeChangeFromNewNote}
        editingNote={editingNote}
        editingData={editingData}
        setEditingData={setEditingData}
        startEditing={startEditing}
        cancelEditing={cancelEditing}
        saveEdit={saveEdit}
        updateEditingChange={updateEditingChange}
        addChangeToEditing={addChangeToEditing}
        removeChangeFromEditing={removeChangeFromEditing}
        onClose={() => setShowAdminPanel(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        email={email}
        setEmail={setEmail}
        unsubscribeEmail={unsubscribeEmail}
        setUnsubscribeEmail={setUnsubscribeEmail}
        isSubscribed={isSubscribed}
        isUnsubscribed={isUnsubscribed}
        showUnsubscribe={showUnsubscribe}
        setShowUnsubscribe={setShowUnsubscribe}
        handleSubscribe={handleSubscribe}
        handleUnsubscribe={handleUnsubscribe}
        emailLoading={emailLoading}
        emailError={emailError}
        setEmailError={setEmailError}
        selectedMonth={selectedMonth}
        selectedTags={selectedTags}
        uniqueMonths={uniqueMonths}
        uniqueTags={uniqueTags}
        handleMonthSelect={handleMonthSelect}
        handleTagToggle={handleTagToggle}
        clearAllTags={clearAllTags}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        releaseNotes={releaseNotes}
        isAdmin={isAdmin}
        setShowAdminPanel={setShowAdminPanel}
      />

      {/* Vertical Divider - Fixed */}
      <div className="fixed left-96 top-0 w-px h-screen bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 z-10"></div>

      <MainContent
        selectedMonth={selectedMonth}
        selectedTags={selectedTags}
        releaseNotes={releaseNotes}
        filteredNotes={filteredNotes}
        isAdmin={isAdmin}
        deleteNote={deleteNote}
        monthRefs={monthRefs}
      />
    </div>
  );
};

export default ReleaseNotesApp;
