import React, { useState } from "react";
import {
  Settings,
  X,
  Plus,
  Edit,
  Save,
  Trash2,
  Loader2,
  AlertCircle,
  Mail,
  Send,
  TestTube,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const AdminPanel = ({
  releaseNotes,
  getNextVersionSuggestion,
  newNote,
  setNewNote,
  newNoteTagsInput,
  setNewNoteTagsInput,
  editingTagsInput,
  setEditingTagsInput,
  addNewNote,
  deleteNote,
  addChangeToNewNote,
  updateNewNoteChange,
  removeChangeFromNewNote,
  editingNote,
  editingData,
  setEditingData,
  startEditing,
  cancelEditing,
  saveEdit,
  updateEditingChange,
  addChangeToEditing,
  removeChangeFromEditing,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("releases");
  const [emailHistory, setEmailHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Email sending states
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [selectedReleaseForEmail, setSelectedReleaseForEmail] = useState("");


  // Subscriber count state
  const [subscriberCount, setSubscriberCount] = useState(null);
  const [subscriberCountLoading, setSubscriberCountLoading] = useState(false);

  const handleAddNewNote = async () => {
    setLoading(true);
    setError("");
    try {
      await addNewNote();
    } catch (err) {
      setError("Failed to create release note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch("/api/email-history");
      const data = await response.json();
      if (response.ok) {
        setEmailHistory(data.history || []);
        setCurrentPage(1); // Reset to first page when refreshing
      } else {
        console.error("Failed to fetch email history:", data.error);
      }
    } catch (error) {
      console.error("Error fetching email history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchSubscriberCount = async () => {
    setSubscriberCountLoading(true);
    try {
      const response = await fetch("/api/subscriber-count");
      const data = await response.json();
      if (response.ok) {
        setSubscriberCount(data.count);
      } else {
        console.error("Failed to fetch subscriber count:", data.error);
      }
    } catch (error) {
      console.error("Error fetching subscriber count:", error);
    } finally {
      setSubscriberCountLoading(false);
    }
  };

  // Client-side pagination calculations
  const totalPages = Math.ceil(emailHistory.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = emailHistory.slice(startIndex, endIndex);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const handleDeleteNote = async (id) => {
    if (window.confirm("Are you sure you want to delete this release note?")) {
      setLoading(true);
      setError("");
      try {
        await deleteNote(id);
      } catch (err) {
        setError("Failed to delete release note. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    setError("");
    try {
      await saveEdit();
    } catch (err) {
      setError("Failed to update release note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendTestEmail = async () => {
    if (!selectedReleaseForEmail) {
      setEmailError("Please select a release note to send");
      return;
    }

    if (!testEmail || !isValidEmail(testEmail)) {
      setEmailError("Please enter a valid test email address");
      return;
    }

    setEmailSending(true);
    setEmailError("");
    setEmailSuccess("");

    try {
      const response = await fetch("/api/send-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          releaseNoteId: selectedReleaseForEmail,
          testEmail: testEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSuccess(`Test email sent successfully to ${testEmail}! 🎉`);
        setTestEmail("");
        setTimeout(() => setEmailSuccess(""), 5000);
      } else {
        setEmailError(data.error || "Failed to send test email");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      setEmailError("Network error. Please try again.");
    } finally {
      setEmailSending(false);
    }
  };

  const handleSendToAllSubscribers = async () => {
    if (!selectedReleaseForEmail) {
      setEmailError("Please select a release note to send");
      return;
    }

    const selectedRelease = releaseNotes.find(
      (note) => note.id === selectedReleaseForEmail
    );

    if (
      !window.confirm(
        `Are you sure you want to send "${selectedRelease?.title}" to ALL subscribers? Emails will be sent in the background.`
      )
    ) {
      return;
    }

    setEmailSending(true);
    setEmailError("");
    setEmailSuccess("");

    try {
      const response = await fetch("/api/email-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          releaseNoteId: selectedReleaseForEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSuccess(data.message || `📧 Email job started! Sending to ${data.totalEmails} subscribers in the background.`);
        setSelectedReleaseForEmail("");
        setTimeout(() => setEmailSuccess(""), 10000);
        
        // Redirect to prevent resubmission on refresh
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        setEmailError(data.error || "Failed to create email job");
      }
    } catch (error) {
      console.error("Error creating email job:", error);
      setEmailError("Network error. Please try again.");
    } finally {
      setEmailSending(false);
    }
  };



  React.useEffect(() => {
    // Fetch subscriber count on component mount
    fetchSubscriberCount();
  }, []);

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
        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("releases")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "releases"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📝 Release Management
              </button>
              <button
                onClick={() => setActiveTab("emails")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "emails"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📧 Send Emails
              </button>
              <button
                onClick={() => {
                  setActiveTab("history");
                  fetchEmailHistory();
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "history"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📊 Email History
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "releases" ? (
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
                      placeholder={`e.g., ${getNextVersionSuggestion(
                        releaseNotes
                      )}`}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100"
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
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100"
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
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100"
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
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100"
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
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={newNoteTagsInput}
                    onChange={(e) => {
                      setNewNoteTagsInput(e.target.value);
                    }}
                    onBlur={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag !== "")
                        .map((tag) => tag.toLowerCase().replace(/\s+/g, "-"));
                      setNewNote({ ...newNote, tags });
                    }}
                    onFocus={() => {
                      if (newNoteTagsInput === "") {
                        setNewNoteTagsInput(newNote.tags.join(", "));
                      }
                    }}
                    placeholder="e.g., bug-fixes, performance, mobile (comma-separated)"
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter tags separated by commas. Spaces will be converted to
                    hyphens when you finish typing.
                  </p>
                  {newNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newNote.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
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
                      disabled={loading}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium disabled:text-gray-400"
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
                          disabled={loading}
                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
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
                          disabled={loading}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                        />
                        {newNote.changes.length > 1 && (
                          <button
                            onClick={() => removeChangeFromNewNote(index)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 px-2 disabled:text-gray-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddNewNote}
                  disabled={!newNote.version || !newNote.title || loading}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Add Release Note
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Existing Releases */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Manage Releases ({releaseNotes.length})
              </h2>

              <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pb-4">
                {releaseNotes.map((note) => (
                  <div
                    key={note.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    {editingNote === note.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editingData.version}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                version: e.target.value,
                              })
                            }
                            placeholder="Version"
                            disabled={loading}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                          />
                          <input
                            type="date"
                            value={editingData.date}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                date: e.target.value,
                              })
                            }
                            disabled={loading}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                          />
                        </div>

                        <select
                          value={editingData.type}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              type: e.target.value,
                            })
                          }
                          disabled={loading}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                        >
                          <option value="patch">Patch</option>
                          <option value="minor">Minor</option>
                          <option value="major">Major</option>
                        </select>

                        <input
                          type="text"
                          value={editingData.title}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              title: e.target.value,
                            })
                          }
                          placeholder="Title"
                          disabled={loading}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                        />

                        <textarea
                          value={editingData.description}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Description"
                          rows={2}
                          disabled={loading}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                        />

                        {/* Tags */}
                        <div>
                          <input
                            type="text"
                            value={editingTagsInput}
                            onChange={(e) => {
                              setEditingTagsInput(e.target.value);
                            }}
                            onBlur={(e) => {
                              const tags = e.target.value
                                .split(",")
                                .map((tag) => tag.trim())
                                .filter((tag) => tag !== "")
                                .map((tag) =>
                                  tag.toLowerCase().replace(/\s+/g, "-")
                                );
                              setEditingData({ ...editingData, tags });
                            }}
                            onFocus={() => {
                              if (editingTagsInput === "") {
                                setEditingTagsInput(
                                  editingData.tags
                                    ? editingData.tags.join(", ")
                                    : ""
                                );
                              }
                            }}
                            placeholder="Tags (comma-separated)"
                            disabled={loading}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                          />
                          {editingData.tags && editingData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {editingData.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Changes */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-medium text-gray-700">
                              Changes
                            </label>
                            <button
                              onClick={addChangeToEditing}
                              disabled={loading}
                              className="text-purple-600 hover:text-purple-700 text-xs font-medium disabled:text-gray-400"
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
                                  disabled={loading}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                                >
                                  <option value="feature">Feature</option>
                                  <option value="improvement">
                                    Improvement
                                  </option>
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
                                  placeholder="Change description"
                                  disabled={loading}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                                />
                                {editingData.changes.length > 1 && (
                                  <button
                                    onClick={() =>
                                      removeChangeFromEditing(index)
                                    }
                                    disabled={loading}
                                    className="text-red-500 hover:text-red-700 px-1 disabled:text-gray-400"
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
                            onClick={handleSaveEdit}
                            disabled={
                              !editingData.version ||
                              !editingData.title ||
                              loading
                            }
                            className="flex-1 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-1"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-3 h-3" />
                                Save
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={loading}
                            className="flex-1 bg-gray-500 text-white py-1 px-3 rounded text-sm hover:bg-gray-600 disabled:bg-gray-300 transition-colors font-medium"
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
                          <h4 className="font-medium text-gray-900 mb-1 text-sm">
                            {note.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
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
                            disabled={loading}
                            className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 disabled:text-gray-400"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === "emails" ? (
          // Email Notifications Tab
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
                <Mail className="w-6 h-6" />
                Email Notifications
              </h2>

              {/* Subscriber Count */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Total Subscribers:
                  </span>
                  {subscriberCountLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  ) : (
                    <span className="text-lg font-bold text-purple-600">
                      {subscriberCount !== null ? subscriberCount.toLocaleString() : "—"}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                {/* Success Message */}
                {emailSuccess && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-md border border-green-200">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{emailSuccess}</span>
                  </div>
                )}

                {/* Error Message */}
                {emailError && (
                  <div className="flex items-center gap-2 text-red-700 bg-red-50 p-4 rounded-md border border-red-200">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{emailError}</span>
                    <button
                      onClick={() => setEmailError("")}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Release Selection */}
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Select Release to Send
                  </label>
                  <select
                    value={selectedReleaseForEmail}
                    onChange={(e) => {
                      setSelectedReleaseForEmail(e.target.value);
                      setEmailError("");
                    }}
                    disabled={emailSending}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base disabled:bg-gray-100"
                  >
                    <option value="">Choose a release note...</option>
                    {releaseNotes.map((note) => (
                      <option key={note.id} value={note.id}>
                        v{note.version} - {note.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Release Preview */}
                {selectedReleaseForEmail && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-base">
                      <div className="font-medium text-blue-900 mb-2">
                        Selected Release:
                      </div>
                      {(() => {
                        const selected = releaseNotes.find(
                          (note) => note.id === selectedReleaseForEmail
                        );
                        return selected ? (
                          <div className="text-blue-800">
                            <span className="font-medium">
                              v{selected.version}
                            </span>{" "}
                            - {selected.title}
                            <div className="text-sm mt-2">
                              {selected.description}
                            </div>
                            <div className="text-sm mt-2">
                              {selected.changes.length} change
                              {selected.changes.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                  {/* Test Email Section */}
                  <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TestTube className="w-5 h-5" />
                      Send Test Email
                    </h3>
                    <div className="space-y-4 flex-1">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Test Email Address
                        </label>
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => {
                            setTestEmail(e.target.value);
                            setEmailError("");
                          }}
                          placeholder="your.email@example.com"
                          disabled={emailSending}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSendTestEmail}
                      disabled={
                        emailSending ||
                        !selectedReleaseForEmail ||
                        !testEmail ||
                        !isValidEmail(testEmail)
                      }
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-base font-medium flex items-center justify-center gap-2 mt-4"
                    >
                      {emailSending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending Test...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-5 h-5" />
                          Send Test Email
                        </>
                      )}
                    </button>
                  </div>

                  {/* Send to All Section */}
                  <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Send to All Subscribers
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <div className="font-medium mb-1">Warning:</div>
                            This will send the selected release note to ALL
                            subscribers. This action cannot be undone.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleSendToAllSubscribers}
                        disabled={emailSending || !selectedReleaseForEmail}
                        className="mt-auto w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-base font-medium flex items-center justify-center gap-2"
                      >
                        {emailSending ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending to All...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send to All Subscribers
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Email History Tab
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
                📊 Email History
                <button
                  onClick={fetchEmailHistory}
                  disabled={historyLoading}
                  className="ml-auto text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {historyLoading ? "Refreshing..." : "Refresh"}
                </button>
              </h2>

              {historyLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                  <p className="text-gray-600">Loading email history...</p>
                </div>
              ) : currentRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No email notifications sent yet</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentRecords.map((record) => (
                      <div
                        key={record.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-gray-900">
                                v{record.version} - {record.title}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  record.status === "sent"
                                    ? "bg-green-100 text-green-800"
                                    : record.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {record.status}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  record.email_type === "individual"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {record.email_type === "individual" ? "Test Email" : "All Subscribers"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                📧 Sent to {record.email_count} subscribers
                              </div>
                              <div>
                                📅 {new Date(record.sent_at).toLocaleString()}
                              </div>
                              {record.error_message && (
                                <div className="text-red-600">
                                  ❌ {record.error_message}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(endIndex, emailHistory.length)} of{" "}
                        {emailHistory.length} entries
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={!hasPrevPage}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={!hasNextPage}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
