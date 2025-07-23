"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminPanel from "../components/AdminPanel";
import { isAdminIP } from "../utils/helpers";

export default function AdminPage() {
  const router = useRouter();
  const [releaseNotes, setReleaseNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Admin panel states
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
  const [newNoteTagsInput, setNewNoteTagsInput] = useState("");
  const [editingTagsInput, setEditingTagsInput] = useState("");

  // Check authorization and fetch data
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        // Check if user has admin access
        const hasAccess = await isAdminIP();
        if (!hasAccess) {
          router.push("/");
          return;
        }

        setIsAuthorized(true);
        await fetchReleaseNotes();
      } catch (error) {
        console.error("Admin initialization error:", error);
        router.push("/");
      }
    };

    initializeAdmin();
  }, [router]);

  const fetchReleaseNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/release-notes");
      if (!response.ok) {
        throw new Error("Failed to fetch release notes");
      }

      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        setReleaseNotes(result.data);
      }
    } catch (error) {
      console.error("Error fetching release notes:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getNextVersionSuggestion = (releaseNotes) => {
    if (releaseNotes.length === 0) return "1.0.0";
    const latestVersion = releaseNotes[0]?.version || "1.0.0";
    const parts = latestVersion.split(".").map(Number);
    parts[2] = (parts[2] || 0) + 1;
    return parts.join(".");
  };

  const addNewNote = async () => {
    if (!newNote.version || !newNote.title) return;

    try {
      const response = await fetch("/api/release-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: newNote.version,
          title: newNote.title,
          description: newNote.description,
          type: newNote.type,
          tags: newNote.tags,
          changes: newNote.changes.filter(
            (change) => change.text.trim() !== ""
          ),
          date: newNote.date,
        }),
      });

      if (response.ok) {
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
        const data = await response.json();
        throw new Error(data.error || "Failed to create release note");
      }
    } catch (error) {
      console.error("Error creating release note:", error);
      throw error;
    }
  };

  const deleteNote = async (id) => {
    const originalNotes = [...releaseNotes];
    try {
      setReleaseNotes(releaseNotes.filter((note) => note.id !== id));

      const response = await fetch(`/api/release-notes?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setReleaseNotes(originalNotes);
        const data = await response.json();
        throw new Error(data.error || "Failed to delete release note");
      }
    } catch (error) {
      setReleaseNotes(originalNotes);
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
    setEditingTagsInput("");
  };

  const saveEdit = async () => {
    if (!editingData || !editingData.version || !editingData.title) return;

    try {
      const response = await fetch("/api/release-notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
          date: editingData.date,
        }),
      });

      if (response.ok) {
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
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to update release note");
      }
    } catch (error) {
      console.error("Error updating release note:", error);
      throw error;
    }
  };

  // Change handlers for new note
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

  // Change handlers for editing
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

  // Show loading while checking authorization
  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isAuthorized ? "Checking access..." : "Loading admin panel..."}
          </p>
        </div>
      </div>
    );
  }

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
      onClose={() => router.push("/")}
    />
  );
}
