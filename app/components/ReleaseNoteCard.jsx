"use client";

import React from "react";
import { Star, Zap, Bug, AlertCircle, CheckCircle, Trash2 } from "lucide-react";

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ReleaseNoteCard = ({ note, isAdmin, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Content */}
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 space-y-2 lg:space-y-0">
          <div className="flex items-center gap-2 lg:gap-3">
            <span
              className={`px-2 lg:px-3 py-1 text-xs font-medium rounded-full border ${getVersionBadgeColor(
                note.type
              )}`}
            >
              v{note.version}
            </span>
            <span className="text-xs lg:text-sm text-gray-500">
              {formatDate(note.date)}
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={() => onDelete(note.id)}
              className="text-red-500 hover:text-red-700 p-1 self-end lg:self-auto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">
          {note.title}
        </h4>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 lg:gap-2 mb-3">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
              >
                {tag.replace("-", " ")}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm lg:text-base text-gray-600 mb-4">
          {note.description}
        </p>

        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-900 mb-3">
            What's Changed:
          </h5>
          {note.changes.map((change, index) => (
            <div
              key={index}
              className="flex items-start gap-2 lg:gap-3 text-xs lg:text-sm"
            >
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

export default ReleaseNoteCard;
