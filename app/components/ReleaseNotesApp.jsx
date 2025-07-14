"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Calendar,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
  Bug,
  Zap,
  Star,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  UserX,
  Image,
} from "lucide-react";

// Configuration for admin access
const ADMIN_IP_RANGES = [
  "192.168.1.0/24", // Local network
  "10.0.0.0/8", // Private network
  "172.16.0.0/12", // Private network
  "203.0.113.0/24", // Example VPN range - replace with your actual VPN IP range
];

// Function to check if IP is in admin range
const isAdminIP = async () => {
  try {
    // In a real application, you'd get the actual client IP
    // For demo purposes, we'll simulate admin access
    // You can replace this with actual IP checking logic

    // Simulate getting client IP (in production, use a service or server-side logic)
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    const clientIP = data.ip;

    // For demo purposes, always return true
    // In production, implement proper IP range checking
    return true; // Replace with actual IP range validation
  } catch (error) {
    console.error("Error checking IP:", error);
    return false;
  }
};
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
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center",
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
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=left",
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
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop&crop=center",
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
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center",
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
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop&crop=center",
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
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop&crop=center",
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
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center",
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
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=400&fit=crop&crop=center",
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
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&crop=center",
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

// Helper functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getMonthYear = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
};

const getUniqueMonths = (notes) => {
  const months = notes.map((note) => getMonthYear(note.date));
  return [...new Set(months)].sort((a, b) => new Date(b) - new Date(a));
};

const getChangeIcon = (type) => {
  switch (type) {
    case "feature":
      return <Star className="w-4 h-4 text-blue-500" />;
    case "improvement":
      return <Zap className="w-4 h-4 text-green-500" />;
    case "fix":
      return <Bug className="w-4 h-4 text-orange-500" />;
    case "security":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <CheckCircle className="w-4 h-4 text-gray-500" />;
  }
};

const getVersionBadgeColor = (type) => {
  switch (type) {
    case "major":
      return "bg-red-100 text-red-800 border-red-200";
    case "minor":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "patch":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const ReleaseNotesApp = () => {
  const [email, setEmail] = useState("");
  const [unsubscribeEmail, setUnsubscribeEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState(initialReleaseNotes);
  const [editingNote, setEditingNote] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [newNote, setNewNote] = useState({
    version: "",
    date: new Date().toISOString().split("T")[0],
    type: "patch",
    title: "",
    description: "",
    image: "",
    changes: [{ type: "feature", text: "" }],
  });

  const contentRef = useRef(null);
  const monthRefs = useRef({});

  // Check admin access on component mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      const hasAdminAccess = await isAdminIP();
      setIsAdmin(hasAdminAccess);
    };
    checkAdminAccess();
  }, []);

  const uniqueMonths = getUniqueMonths(releaseNotes);

  const filteredNotes =
    selectedMonth === "all"
      ? releaseNotes
      : releaseNotes.filter(
          (note) => getMonthYear(note.date) === selectedMonth
        );

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

  // Admin functions
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
        image: "",
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

  const scrollToMonth = (month) => {
    if (month === "all") {
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const monthElement = monthRefs.current[month];
      if (monthElement) {
        const container = contentRef.current;
        const elementTop = monthElement.offsetTop;
        container?.scrollTo({ top: elementTop - 20, behavior: "smooth" });
      }
    }
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setShowFilters(false);
    if (month !== "all") {
      setTimeout(() => scrollToMonth(month), 100);
    }
  };

  // Group notes by month for section headers
  const notesByMonth = releaseNotes.reduce((acc, note) => {
    const month = getMonthYear(note.date);
    if (!acc[month]) acc[month] = [];
    acc[month].push(note);
    return acc;
  }, {});

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
      {/* Sidebar - Completely Fixed */}
      <div className="w-80 bg-white shadow-lg flex flex-col h-screen fixed left-0 top-0 z-10">
        {/* Header - Always Visible */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Release Notes</h1>
              <p className="text-sm text-gray-500">
                Stay updated with our latest changes
              </p>
            </div>
          </div>

          {/* Email Subscription - Always Visible */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Get Notified</h3>
              <button
                onClick={() => setShowUnsubscribe(!showUnsubscribe)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <UserX className="w-3 h-3" />
                {showUnsubscribe ? "Subscribe" : "Unsubscribe"}
              </button>
            </div>

            {!showUnsubscribe ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Subscribe to receive email notifications when new releases are
                  published.
                </p>

                {isSubscribed ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Successfully subscribed!
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleSubscribe}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Subscribe to Updates
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your email address to unsubscribe from release
                  notifications.
                </p>

                {isUnsubscribed ? (
                  <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-md">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Successfully unsubscribed!
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={unsubscribeEmail}
                      onChange={(e) => setUnsubscribeEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleUnsubscribe}
                      className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      Unsubscribe
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filters - Scrollable Middle Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filter by Month</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleMonthSelect("all")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedMonth === "all"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All Releases
              </button>

              {uniqueMonths.map((month) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(month)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedMonth === month
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Always Visible */}
        <div className="border-t border-gray-200 flex-shrink-0">
          {/* Quick Stats */}
          <div className="p-6">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-gray-900">
                {releaseNotes.length}
              </div>
              <div className="text-sm text-gray-500">Total Releases</div>
            </div>

            {/* Admin Panel Access */}
            {isAdmin && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vertical Divider - Fixed */}
      <div className="fixed left-80 top-0 w-px h-screen bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 z-10"></div>

      {/* Main Content - With Left Margin */}
      <div className="flex-1 ml-80 overflow-hidden">
        <div ref={contentRef} className="h-screen overflow-y-auto px-8 py-8">
          <div className="max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedMonth === "all"
                  ? "All Release Notes"
                  : `${selectedMonth} Releases`}
              </h2>
              <p className="text-gray-600">
                {selectedMonth === "all"
                  ? `View all ${releaseNotes.length} releases and updates to our software.`
                  : `${filteredNotes.length} release${
                      filteredNotes.length !== 1 ? "s" : ""
                    } in ${selectedMonth}.`}
              </p>
            </div>

            {/* Release Notes */}
            <div className="space-y-8">
              {selectedMonth === "all" ? (
                // Show all notes grouped by month
                Object.entries(notesByMonth)
                  .sort(([a], [b]) => new Date(b) - new Date(a))
                  .map(([month, notes]) => (
                    <div key={month}>
                      <h3
                        ref={(el) => (monthRefs.current[month] = el)}
                        className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2"
                      >
                        <Calendar className="w-5 h-5 text-gray-500" />
                        {month}
                      </h3>
                      <div className="space-y-6 ml-7">
                        {notes.map((note) => (
                          <ReleaseNoteCard
                            key={note.id}
                            note={note}
                            isAdmin={isAdmin}
                            onDelete={deleteNote}
                          />
                        ))}
                      </div>
                    </div>
                  ))
              ) : (
                // Show filtered notes
                <div className="space-y-6">
                  {filteredNotes.map((note) => (
                    <ReleaseNoteCard
                      key={note.id}
                      note={note}
                      isAdmin={isAdmin}
                      onDelete={deleteNote}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500">
              <p className="text-sm">
                Have questions about a release? Contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReleaseNoteCard = ({ note, isAdmin, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Header */}
      {note.image && (
        <div className="relative bg-gray-100">
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border bg-white/90 backdrop-blur-sm ${getVersionBadgeColor(
                note.type
              )}`}
            >
              v{note.version}
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={() => onDelete(note.id)}
              className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Header without image */}
        {!note.image && (
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full border ${getVersionBadgeColor(
                  note.type
                )}`}
              >
                v{note.version}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(note.date)}
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={() => onDelete(note.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Date for cards with images */}
        {note.image && (
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              {formatDate(note.date)}
            </span>
          </div>
        )}

        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          {note.title}
        </h4>
        <p className="text-gray-600 mb-4">{note.description}</p>

        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-900 mb-3">
            What's Changed:
          </h5>
          {note.changes.map((change, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              {getChangeIcon(change.type)}
              <span className="text-gray-700 leading-relaxed">
                {change.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({
  releaseNotes,
  newNote,
  setNewNote,
  addNewNote,
  deleteNote,
  addChangeToNewNote,
  updateNewNoteChange,
  removeChangeFromNewNote,
  editingNote,
  editingData,
  startEditing,
  cancelEditing,
  saveEdit,
  updateEditingChange,
  addChangeToEditing,
  removeChangeFromEditing,
  onClose,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New Release */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Release
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={newNote.version}
                    onChange={(e) =>
                      setNewNote({ ...newNote, version: e.target.value })
                    }
                    placeholder="e.g., 2.4.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newNote.date}
                    onChange={(e) =>
                      setNewNote({ ...newNote, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Release Type
                </label>
                <select
                  value={newNote.type}
                  onChange={(e) =>
                    setNewNote({ ...newNote, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="patch">Patch</option>
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  placeholder="e.g., Bug Fixes and Performance Improvements"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newNote.description}
                  onChange={(e) =>
                    setNewNote({ ...newNote, description: e.target.value })
                  }
                  placeholder="Brief description of this release..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Feature Image (Optional)
                  </div>
                </label>
                <input
                  type="url"
                  value={newNote.image}
                  onChange={(e) =>
                    setNewNote({ ...newNote, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Landscape format (16:9 ratio) works best. Recommended size:
                  800x400px
                </p>
                {newNote.image && (
                  <div className="mt-2">
                    <img
                      src={newNote.image}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded border"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Changes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Changes
                  </label>
                  <button
                    onClick={addChangeToNewNote}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    + Add Change
                  </button>
                </div>
                <div className="space-y-3">
                  {newNote.changes.map((change, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={change.type}
                        onChange={(e) =>
                          updateNewNoteChange(index, "type", e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="feature">Feature</option>
                        <option value="improvement">Improvement</option>
                        <option value="fix">Fix</option>
                        <option value="security">Security</option>
                      </select>
                      <input
                        type="text"
                        value={change.text}
                        onChange={(e) =>
                          updateNewNoteChange(index, "text", e.target.value)
                        }
                        placeholder="Describe the change..."
                        className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      {newNote.changes.length > 1 && (
                        <button
                          onClick={() => removeChangeFromNewNote(index)}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={addNewNote}
                disabled={!newNote.version || !newNote.title}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Add Release Note
              </button>
            </div>
          </div>

          {/* Existing Releases */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Manage Releases ({releaseNotes.length})
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {releaseNotes.map((note) => (
                <div
                  key={note.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {editingNote === note.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Version
                          </label>
                          <input
                            type="text"
                            value={editingData.version}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                version: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={editingData.date}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                date: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={editingData.type}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              type: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="patch">Patch</option>
                          <option value="minor">Minor</option>
                          <option value="major">Major</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editingData.title}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={editingData.description}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              description: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <div className="flex items-center gap-1">
                            <Image className="w-3 h-3" />
                            Image URL
                          </div>
                        </label>
                        <input
                          type="url"
                          value={editingData.image || ""}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              image: e.target.value,
                            })
                          }
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        {editingData.image && (
                          <div className="mt-1">
                            <img
                              src={editingData.image}
                              alt="Preview"
                              className="w-full h-16 object-cover rounded border"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Changes
                          </label>
                          <button
                            onClick={addChangeToEditing}
                            className="text-purple-600 hover:text-purple-700 text-xs font-medium"
                          >
                            + Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {editingData.changes.map((change, index) => (
                            <div key={index} className="flex gap-2">
                              <select
                                value={change.type}
                                onChange={(e) =>
                                  updateEditingChange(
                                    index,
                                    "type",
                                    e.target.value
                                  )
                                }
                                className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="feature">Feature</option>
                                <option value="improvement">Improvement</option>
                                <option value="fix">Fix</option>
                                <option value="security">Security</option>
                              </select>
                              <input
                                type="text"
                                value={change.text}
                                onChange={(e) =>
                                  updateEditingChange(
                                    index,
                                    "text",
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                              {editingData.changes.length > 1 && (
                                <button
                                  onClick={() => removeChangeFromEditing(index)}
                                  className="text-red-500 hover:text-red-700 px-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveEdit}
                          disabled={!editingData.version || !editingData.title}
                          className="flex-1 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex-1 bg-gray-500 text-white py-1 px-3 rounded text-sm hover:bg-gray-600 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded border ${getVersionBadgeColor(
                              note.type
                            )}`}
                          >
                            v{note.version}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(note.date)}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {note.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {note.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          {note.changes.length} change
                          {note.changes.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <button
                          onClick={() => startEditing(note)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseNotesApp;
