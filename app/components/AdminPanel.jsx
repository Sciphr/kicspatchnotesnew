"use client";

import React from "react";
import { Settings, X, Plus, Edit, Save, Trash2 } from "lucide-react";

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
  newNote,
  setNewNote,
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

export default AdminPanel;
