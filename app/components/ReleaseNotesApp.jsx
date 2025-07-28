"use client";

import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import { getUniqueMonths, getMonthYear, isAdminIP } from "../utils/helpers";

const ReleaseNotesApp = () => {
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  // Pagination states
  const [visibleCount, setVisibleCount] = useState(15);
  const itemsPerPage = 15;

  // Admin state (for showing/hiding admin button)
  const [isAdmin, setIsAdmin] = useState(false);

  // Release notes states
  const [releaseNotes, setReleaseNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs
  const monthRefs = useRef({});

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

  // Close mobile sidebar when clicking outside or on mobile navigation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  // Get visible notes based on pagination
  const visibleNotes = filteredNotes.slice(0, visibleCount);
  const hasMoreNotes = filteredNotes.length > visibleCount;

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
    // If clicking the same month, toggle it off (return to "all")
    if (selectedMonth === month) {
      setSelectedMonth("all");
    } else {
      setSelectedMonth(month);
    }
    setShowFilters(false);
    setVisibleCount(15); // Reset pagination when filter changes
    // Close mobile sidebar when filter is selected
    setIsMobileSidebarOpen(false);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setVisibleCount(15); // Reset pagination when filter changes
  };

  const clearAllTags = () => {
    setSelectedTags([]);
    setVisibleCount(15); // Reset pagination when filter changes
  };

  // Pagination handlers
  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + itemsPerPage);
  };

  // Dummy delete function for non-admin users (shouldn't be called)
  const deleteNote = async (id) => {
    console.warn("Delete function called on main app - this shouldn't happen");
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
        isAdmin={false} // Remove admin button from sidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Vertical Divider - Only on desktop */}
      <div className="hidden lg:block fixed left-96 top-0 w-px h-screen bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 z-10"></div>

      <MainContent
        selectedMonth={selectedMonth}
        selectedTags={selectedTags}
        releaseNotes={releaseNotes}
        filteredNotes={visibleNotes}
        totalFilteredCount={filteredNotes.length}
        hasMoreNotes={hasMoreNotes}
        onShowMore={handleShowMore}
        isAdmin={false} // No admin functions on main app
        deleteNote={deleteNote}
        monthRefs={monthRefs}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />
    </div>
  );
};

export default ReleaseNotesApp;
