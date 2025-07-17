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

  // Add these new state variables for raw tag input
  const [newNoteTagsInput, setNewNoteTagsInput] = useState("");
  const [editingTagsInput, setEditingTagsInput] = useState("");

  // Refs
  const monthRefs = useRef({});

  // Helper function to get the next version number
  const getNextVersionSuggestion = (releaseNotes) => {
    if (releaseNotes.length === 0) return "1.0.0";

    const latestVersion = releaseNotes[0]?.version || "1.0.0";
    const parts = latestVersion.split(".").map(Number);

    // Increment patch version by default
    parts[2] = (parts[2] || 0) + 1;

    return parts.join(".");
  };

  const fetchReleaseNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/release-notes");

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          data.error ||
          `HTTP ${response.status}: Failed to fetch release notes`;
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        setReleaseNotes(result.data);
      } else {
        throw new Error(
          "Invalid response format: expected array of release notes"
        );
      }
    } catch (error) {
      console.error("Error fetching release notes:", error);
      setError(error.message || "Network error. Please try again.");
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
        // Handle specific error cases with better messages
        let errorMessage;
        switch (response.status) {
          case 409:
            errorMessage = "This email is already subscribed";
            break;
          case 400:
            errorMessage = data.error || "Invalid email address";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage =
              data.error || "Failed to subscribe. Please try again.";
        }
        setEmailError(errorMessage);
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      setEmailError(
        "Network error. Please check your connection and try again."
      );
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
        // Handle specific error cases with better messages
        let errorMessage;
        switch (response.status) {
          case 404:
            errorMessage = "Email not found in our subscriber list";
            break;
          case 400:
            errorMessage = data.error || "Invalid email address";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage =
              data.error || "Failed to unsubscribe. Please try again.";
        }
        setEmailError(errorMessage);
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      setEmailError(
        "Network error. Please check your connection and try again."
      );
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

  const addNewNote = async () => {
    if (!newNote.version || !newNote.title) return;

    try {
      const response = await fetch("/api/release-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: newNote.version,
          title: newNote.title,
          description: newNote.description,
          type: newNote.type,
          tags: newNote.tags,
          changes: newNote.changes.filter(
            (change) => change.text.trim() !== ""
          ),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form
        setNewNote({
          version: "",
          date: new Date().toISOString().split("T")[0],
          type: "patch",
          title: "",
          description: "",
          tags: [],
          changes: [{ type: "feature", text: "" }],
        });
        setNewNoteTagsInput("");
        await fetchReleaseNotes();
      } else {
        // Handle specific API errors
        const errorMessage = data.error || "Failed to create release note";
        console.error("Error creating release note:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Network error creating release note:", error);
      // Re-throw so AdminPanel can handle it
      throw error;
    }
  };

  const deleteNote = async (id) => {
    const originalNotes = [...releaseNotes]; // Backup for rollback

    try {
      // Remove from state immediately for better UX
      setReleaseNotes(releaseNotes.filter((note) => note.id !== id));

      const response = await fetch(`/api/release-notes?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data.error || "Failed to delete release note";
        console.error("Error deleting release note:", errorMessage);

        // Rollback the optimistic update
        setReleaseNotes(originalNotes);
        throw new Error(errorMessage);
      }

      const data = await response.json();
    } catch (error) {
      console.error("Network error deleting release note:", error);

      // Ensure rollback happened
      setReleaseNotes(originalNotes);

      // Re-throw so AdminPanel can handle it
      throw error;
    }
  };

  const startEditing = (note) => {
    setEditingNote(note.id);
    setEditingData({ ...note });
    setEditingTagsInput(note.tags ? note.tags.join(", ") : "");
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditingData(null);
  };

  const saveEdit = async () => {
    if (!editingData || !editingData.version || !editingData.title) return;

    try {
      const response = await fetch("/api/release-notes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingData.id,
          version: editingData.version,
          title: editingData.title,
          description: editingData.description,
          type: editingData.type,
          tags: editingData.tags,
          changes: editingData.changes.filter(
            (change) => change.text.trim() !== ""
          ),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state optimistically
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
        setEditingTagsInput("");
        // Refresh from database to ensure consistency
        await fetchReleaseNotes();
      } else {
        // Handle specific API errors
        const errorMessage = data.error || "Failed to update release note";
        console.error("Error updating release note:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Network error updating release note:", error);
      // Re-throw so AdminPanel can handle it
      throw error;
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
        getNextVersionSuggestion={getNextVersionSuggestion}
        newNote={newNote}
        setNewNote={setNewNote}
        newNoteTagsInput={newNoteTagsInput}
        setNewNoteTagsInput={setNewNoteTagsInput}
        editingTagsInput={editingTagsInput}
        setEditingTagsInput={setEditingTagsInput}
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
    <div
      className="min-h-screen bg-gray-50 flex"
      suppressHydrationWarning={true}
    >
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
