"use client";

import React, { useRef } from "react";
import { Calendar } from "lucide-react";
import ReleaseNoteCard from "./ReleaseNoteCard";

const getMonthYear = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
};

const MainContent = ({
  selectedMonth,
  selectedTags,
  releaseNotes,
  filteredNotes,
  isAdmin,
  deleteNote,
  monthRefs,
}) => {
  const contentRef = useRef(null);

  // Group notes by month for section headers
  const notesByMonth = releaseNotes.reduce((acc, note) => {
    const month = getMonthYear(note.date);
    if (!acc[month]) acc[month] = [];
    acc[month].push(note);
    return acc;
  }, {});

  return (
    <div className="flex-1 ml-96 overflow-hidden">
      <div ref={contentRef} className="h-screen overflow-y-auto px-8 py-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedMonth === "all" && selectedTags.length === 0
                ? "All Release Notes"
                : `Filtered Release Notes`}
            </h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                {filteredNotes.length} release
                {filteredNotes.length !== 1 ? "s" : ""} found
                {selectedMonth !== "all" && ` in ${selectedMonth}`}
                {selectedTags.length > 0 &&
                  ` tagged with: ${selectedTags
                    .map((tag) => tag.replace("-", " "))
                    .join(", ")}`}
              </p>

              {/* Active Filters */}
              {(selectedMonth !== "all" || selectedTags.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {selectedMonth !== "all" && (
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      Month: {selectedMonth}
                    </span>
                  )}
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full"
                    >
                      Tag: {tag.replace("-", " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Release Notes */}
          <div className="space-y-8">
            {selectedMonth === "all" && selectedTags.length === 0 ? (
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
  );
};

export default MainContent;
