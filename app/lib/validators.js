// lib/validators.js

export const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true };
};

export const validateReleaseNote = (data) => {
  const errors = [];

  // Required fields
  if (!data.version || !data.version.trim()) {
    errors.push("Version is required");
  }

  if (!data.title || !data.title.trim()) {
    errors.push("Title is required");
  }

  if (!data.description || !data.description.trim()) {
    errors.push("Description is required");
  }

  // Type validation
  if (!["major", "minor", "patch"].includes(data.type)) {
    errors.push("Release type must be major, minor, or patch");
  }

  // Tags validation
  if (data.tags && !Array.isArray(data.tags)) {
    errors.push("Tags must be an array");
  }

  // Notes validation (should be object/array for TipTap JSON)
  if (data.notes && typeof data.notes !== "object") {
    errors.push("Notes must be valid JSON content");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateEmailNotification = (data) => {
  const errors = [];

  // Release note ID validation
  if (!data.release_note_id || isNaN(Number(data.release_note_id))) {
    errors.push("Valid release note ID is required");
  }

  // Email count validation
  if (data.email_count !== undefined && isNaN(Number(data.email_count))) {
    errors.push("Email count must be a number");
  }

  // Status validation
  if (data.status && !["pending", "sent", "failed"].includes(data.status)) {
    errors.push("Status must be pending, sent, or failed");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to sanitize data
export const sanitizeReleaseNote = (data) => {
  return {
    version: data.version?.trim(),
    title: data.title?.trim(),
    description: data.description?.trim(),
    type: data.type || "patch",
    tags: Array.isArray(data.tags) ? data.tags : [],
    notes: data.notes || {},
  };
};

export const sanitizeEmail = (email) => {
  return email?.trim().toLowerCase();
};
