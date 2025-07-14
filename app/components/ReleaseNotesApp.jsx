"use client";

import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import AdminPanel from "./AdminPanel";
import { getUniqueMonths, getMonthYear, isAdminIP } from "../utils/helpers";

// Sample release notes data - in production this would come from a database
const initialReleaseNotes = [
  {
    id: "1",
    version: "2.4.1",
    date: "2025-01-15",
    type: "patch",
    title: "Bug Fixes and Performance Improvements",
    description:
      "This release focuses on stability improvements and bug fixes based on user feedback.",
    tags: ["bug-fixes", "performance", "mobile", "dashboard"],
    changes: [
      {
        type: "fix",
        text: "Fixed authentication timeout issues in mobile apps",
      },
      { type: "fix", text: "Resolved memory leak in dashboard components" },
      {
        type: "improvement",
        text: "Improved loading times by 25% across all pages",
      },
      { type: "fix", text: "Fixed export functionality for large datasets" },
    ],
  },
  {
    id: "2",
    version: "2.4.0",
    date: "2025-01-08",
    type: "minor",
    title: "New Dashboard Features",
    description:
      "Introducing enhanced analytics and customizable dashboard widgets.",
    tags: ["dashboard", "analytics", "widgets", "mobile", "dark-mode"],
    changes: [
      { type: "feature", text: "Added customizable dashboard widgets" },
      { type: "feature", text: "New analytics charts with real-time data" },
      { type: "improvement", text: "Enhanced mobile responsiveness" },
      { type: "feature", text: "Dark mode support for all components" },
    ],
  },
  {
    id: "3",
    version: "2.3.2",
    date: "2024-12-20",
    type: "patch",
    title: "Holiday Security Update",
    description: "Important security patches and stability improvements.",
    tags: ["security", "patches", "xss", "authentication"],
    changes: [
      { type: "security", text: "Patched XSS vulnerability in user profiles" },
      { type: "security", text: "Updated authentication encryption standards" },
      { type: "fix", text: "Fixed timezone display issues" },
      { type: "improvement", text: "Improved error handling and logging" },
    ],
  },
  {
    id: "4",
    version: "2.3.1",
    date: "2024-12-15",
    type: "patch",
    title: "Quick Fixes",
    description: "Addressing critical issues reported by our community.",
    tags: ["bug-fixes", "search", "file-upload", "ux"],
    changes: [
      {
        type: "fix",
        text: "Fixed search functionality not working with special characters",
      },
      { type: "fix", text: "Resolved file upload timeout issues" },
      {
        type: "improvement",
        text: "Better error messages for failed operations",
      },
    ],
  },
  {
    id: "5",
    version: "2.3.0",
    date: "2024-12-01",
    type: "minor",
    title: "Enhanced User Experience",
    description: "Major UX improvements and new collaboration features.",
    tags: ["ux", "collaboration", "notifications", "accessibility", "search"],
    changes: [
      { type: "feature", text: "Real-time collaboration on documents" },
      {
        type: "feature",
        text: "New notification system with granular controls",
      },
      {
        type: "improvement",
        text: "Redesigned navigation with improved accessibility",
      },
      { type: "feature", text: "Advanced search with filters and sorting" },
      { type: "improvement", text: "Faster page transitions and animations" },
    ],
  },
  {
    id: "6",
    version: "2.2.3",
    date: "2024-11-28",
    type: "patch",
    title: "Thanksgiving Update",
    description: "Small but important fixes for a smoother experience.",
    tags: ["bug-fixes", "calendar", "mobile", "performance"],
    changes: [
      {
        type: "fix",
        text: "Fixed calendar sync issues with external providers",
      },
      { type: "fix", text: "Resolved layout breaking on very small screens" },
      { type: "improvement", text: "Optimized images for faster loading" },
    ],
  },
  {
    id: "7",
    version: "2.2.2",
    date: "2024-11-15",
    type: "patch",
    title: "Stability Improvements",
    description: "Backend optimizations and bug fixes.",
    tags: ["backend", "performance", "database", "security", "file-upload"],
    changes: [
      { type: "fix", text: "Fixed database connection pooling issues" },
      { type: "improvement", text: "Reduced API response times by 40%" },
      {
        type: "fix",
        text: "Fixed rare crash when handling large file uploads",
      },
      { type: "security", text: "Enhanced rate limiting to prevent abuse" },
    ],
  },
  {
    id: "8",
    version: "2.2.1",
    date: "2024-11-08",
    type: "patch",
    title: "Quick Bug Fixes",
    description: "Addressing urgent issues from the 2.2.0 release.",
    tags: ["bug-fixes", "payments", "notifications", "validation"],
    changes: [
      { type: "fix", text: "Fixed critical bug in payment processing" },
      { type: "fix", text: "Resolved email notification delivery issues" },
      { type: "improvement", text: "Better validation for form inputs" },
    ],
  },
  {
    id: "9",
    version: "2.2.0",
    date: "2024-11-01",
    type: "minor",
    title: "Payment System Overhaul",
    description: "Complete redesign of our payment and billing system.",
    tags: ["payments", "dashboard", "analytics", "security", "enterprise"],
    changes: [
      {
        type: "feature",
        text: "New payment dashboard with detailed analytics",
      },
      { type: "feature", text: "Support for multiple payment methods" },
      { type: "feature", text: "Automated invoice generation and delivery" },
      { type: "improvement", text: "Enhanced security for payment processing" },
      {
        type: "feature",
        text: "Subscription management for enterprise customers",
      },
    ],
  },
];

const ReleaseNotesApp = () => {
  // Email subscription states
  const [email, setEmail] = useState("");
  const [unsubscribeEmail, setUnsubscribeEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Release notes states
  const [releaseNotes, setReleaseNotes] = useState(initialReleaseNotes);
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

  // Check admin access on component mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      const hasAdminAccess = await isAdminIP();
      setIsAdmin(hasAdminAccess);
    };
    checkAdminAccess();
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

  // Email handlers
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const handleUnsubscribe = (e) => {
    e.preventDefault();
    if (unsubscribeEmail && unsubscribeEmail.includes("@")) {
      setIsUnsubscribed(true);
      setUnsubscribeEmail("");
      setTimeout(() => setIsUnsubscribed(false), 3000);
    }
  };

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
  const addNewNote = () => {
    if (newNote.version && newNote.title) {
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
    }
  };

  const deleteNote = (id) => {
    setReleaseNotes(releaseNotes.filter((note) => note.id !== id));
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
