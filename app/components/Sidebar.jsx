"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  CheckCircle,
  Filter,
  Settings,
  UserX,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({
  email,
  setEmail,
  unsubscribeEmail,
  setUnsubscribeEmail,
  isSubscribed,
  isUnsubscribed,
  showUnsubscribe,
  setShowUnsubscribe,
  handleSubscribe,
  handleUnsubscribe,
  emailLoading,
  emailError,
  setEmailError,
  selectedMonth,
  selectedTags,
  uniqueMonths,
  uniqueTags,
  handleMonthSelect,
  handleTagToggle,
  clearAllTags,
  showFilters,
  setShowFilters,
  releaseNotes,
  isAdmin,
  setShowAdminPanel,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}) => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [expandedYears, setExpandedYears] = useState({}); // Track which years are expanded
  const [monthSectionExpanded, setMonthSectionExpanded] = useState(false);
  const [tagSectionExpanded, setTagSectionExpanded] = useState(false);

  // Group months by year
  const groupMonthsByYear = (months) => {
    const yearGroups = {};

    months.forEach((month) => {
      const year = month.split(" ")[1]; // Extract year from "January 2024"
      if (!yearGroups[year]) {
        yearGroups[year] = [];
      }
      yearGroups[year].push(month);
    });

    return yearGroups;
  };

  // Initialize expanded years when uniqueMonths changes - all collapsed by default
  useEffect(() => {
    if (uniqueMonths.length > 0) {
      const yearGroups = groupMonthsByYear(uniqueMonths);
      
      const defaultExpanded = {};
      // All years start collapsed - no auto-expansion
      
      setExpandedYears(defaultExpanded);
    }
  }, [uniqueMonths]);

  const toggleYear = (year) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Clear error when input changes
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handleUnsubscribeEmailChange = (e) => {
    setUnsubscribeEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  return (
    <div
      className={`
      w-96 bg-white shadow-xl flex flex-col h-screen z-50 border-r border-gray-100
      fixed left-0 top-0 
      lg:translate-x-0 
      ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      transition-transform duration-300 ease-in-out

    `}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-gray-50 border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="p-6 pb-4">
          {/* Mobile close button */}
          <div className="lg:hidden absolute top-4 right-4 z-10">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-100">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                KICS Release Notes
              </h1>
              <p className="text-sm text-gray-600">
                Stay updated with our latest changes
              </p>
            </div>
          </div>

          {/* More Compact Email Subscription */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-blue-900 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                Email Updates
              </h3>
              <button
                onClick={() => setShowUnsubscribe(!showUnsubscribe)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors font-medium"
              >
                <UserX className="w-3 h-3" />
                {showUnsubscribe ? "Subscribe" : "Unsubscribe"}
              </button>
            </div>

            {!showUnsubscribe ? (
              <>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  Get email notifications for new releases.
                </p>

                {/* Compact Success Message */}
                {isSubscribed && (
                  <div className="flex items-center gap-2 text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 p-2 rounded-md mb-2 border border-green-200 animate-in slide-in-from-top duration-300">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">Subscribed! 🎉</span>
                  </div>
                )}

                {/* Compact Error Message */}
                {emailError && (
                  <div className="flex items-center gap-2 text-red-700 bg-gradient-to-r from-red-50 to-pink-50 p-2 rounded-md mb-2 border border-red-200 animate-in slide-in-from-top duration-300">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">{emailError}</span>
                  </div>
                )}

                {/* Compact Subscribe Form */}
                {!isSubscribed && (
                  <form onSubmit={handleSubscribe} className="space-y-2">
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter email"
                        disabled={emailLoading}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 placeholder-gray-400"
                      />
                      {email && !emailLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          {isValidEmail(email) ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={emailLoading || !email || !isValidEmail(email)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1.5 px-3 rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-xs font-medium disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transform hover:scale-[1.02] disabled:transform-none"
                    >
                      {emailLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Bell className="w-3 h-3" />
                          Subscribe
                        </>
                      )}
                    </button>
                  </form>
                )}
              </>
            ) : (
              // Compact unsubscribe section
              <>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  Enter email to unsubscribe from notifications.
                </p>

                {isUnsubscribed && (
                  <div className="flex items-center gap-2 text-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 p-2 rounded-md mb-2 border border-orange-200 animate-in slide-in-from-top duration-300">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      Unsubscribed! 👋
                    </span>
                  </div>
                )}

                {emailError && (
                  <div className="flex items-center gap-2 text-red-700 bg-gradient-to-r from-red-50 to-pink-50 p-2 rounded-md mb-2 border border-red-200 animate-in slide-in-from-top duration-300">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">{emailError}</span>
                  </div>
                )}

                {!isUnsubscribed && (
                  <form onSubmit={handleUnsubscribe} className="space-y-2">
                    <div className="relative">
                      <input
                        type="email"
                        value={unsubscribeEmail}
                        onChange={handleUnsubscribeEmailChange}
                        placeholder="Enter email"
                        disabled={emailLoading}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 placeholder-gray-400"
                      />
                      {unsubscribeEmail && !emailLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          {isValidEmail(unsubscribeEmail) ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={
                        emailLoading ||
                        !unsubscribeEmail ||
                        !isValidEmail(unsubscribeEmail)
                      }
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-1.5 px-3 rounded-md hover:from-orange-700 hover:to-red-700 transition-all duration-200 text-xs font-medium disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transform hover:scale-[1.02] disabled:transform-none"
                    >
                      {emailLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Unsubscribing...
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3" />
                          Unsubscribe
                        </>
                      )}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="flex-1 overflow-y-scroll bg-gray-50">
        <div className="p-6 space-y-8">
          {/* Primary Filters Header */}
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
              Filter Releases
              {(selectedMonth !== "all" || selectedTags.length > 0) && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  {(selectedMonth !== "all" ? 1 : 0) + selectedTags.length} active
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-600">
              Find exactly what you're looking for
            </p>
            {(selectedMonth !== "all" || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  handleMonthSelect("all");
                  clearAllTags();
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Collapsible Month Filter */}
          <div className="space-y-3">
            <div className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-xl transition-colors duration-200 shadow-sm border border-gray-200">
              <button
                onClick={() => setMonthSectionExpanded(!monthSectionExpanded)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Filter by Month
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedMonth !== "all"
                      ? `Selected: ${selectedMonth}`
                      : `${uniqueMonths.length} months available`}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setMonthSectionExpanded(!monthSectionExpanded)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {monthSectionExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${monthSectionExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pl-4 space-y-1">
                  {/* All Months Option */}
                  <button
                    onClick={() => handleMonthSelect("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center justify-between group ${
                      selectedMonth === "all"
                        ? "text-blue-700 font-medium bg-blue-50 border border-blue-200"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <span>All Months</span>
                    <div className="w-4 h-4 flex items-center justify-center">
                      <CheckCircle
                        className={`w-4 h-4 text-blue-600 transition-all duration-300 ease-out ${
                          selectedMonth === "all"
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-75"
                        }`}
                      />
                    </div>
                  </button>

                  {/* Year-grouped months */}
                  {Object.entries(groupMonthsByYear(uniqueMonths))
                    .sort(([a], [b]) => b - a) // Sort years descending (newest first)
                    .map(([year, months]) => (
                      <div key={year} className="space-y-1">
                        {/* Year Header */}
                        <button
                          onClick={() => toggleYear(year)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center justify-between group hover:bg-gray-50 font-medium text-gray-700"
                        >
                          <span className="flex items-center gap-2">
                            {expandedYears[year] ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            {year}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {months.length}
                          </span>
                        </button>

                        {/* Months for this year */}
                        {expandedYears[year] && (
                          <div className="ml-6 space-y-1 border-l-2 border-gray-100 pl-3">
                            {months
                              .sort((a, b) => {
                                // Sort months by date (most recent first)
                                const monthOrder = [
                                  "January",
                                  "February",
                                  "March",
                                  "April",
                                  "May",
                                  "June",
                                  "July",
                                  "August",
                                  "September",
                                  "October",
                                  "November",
                                  "December",
                                ];
                                const aMonth = monthOrder.indexOf(
                                  a.split(" ")[0]
                                );
                                const bMonth = monthOrder.indexOf(
                                  b.split(" ")[0]
                                );
                                return bMonth - aMonth;
                              })
                              .map((month) => (
                                <button
                                  key={month}
                                  onClick={() => handleMonthSelect(month)}
                                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-all duration-150 flex items-center justify-between group ${
                                    selectedMonth === month
                                      ? "text-blue-700 font-medium bg-blue-50 border border-blue-200"
                                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                  }`}
                                >
                                  <span>{month.split(" ")[0]}</span>{" "}
                                  {/* Show just month name */}
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <CheckCircle
                                      className={`w-3 h-3 text-blue-600 transition-all duration-300 ease-out ${
                                        selectedMonth === month
                                          ? "opacity-100 scale-100"
                                          : "opacity-0 scale-75"
                                      }`}
                                    />
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
              </div>
            </div>
          </div>

          {/* Collapsible Tag Filter */}
          <div className="space-y-3">
            <div className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-xl transition-colors duration-200 shadow-sm border border-gray-200">
              <button
                onClick={() => setTagSectionExpanded(!tagSectionExpanded)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-blue-600"></div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Filter by Tags
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedTags.length > 0
                      ? `${selectedTags.length} selected`
                      : `${uniqueTags.length} tags available`}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-2">
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearAllTags}
                    className="text-xs text-gray-500 hover:text-blue-600 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
                  >
                    Clear Tags
                  </button>
                )}
                <button
                  onClick={() => setTagSectionExpanded(!tagSectionExpanded)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {tagSectionExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${tagSectionExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pl-4 space-y-3">
                <div className="space-y-3">
                  {/* Enhanced Selected Tags Display */}
                  {selectedTags.length > 0 && (
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="text-xs text-blue-700 font-medium mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Selected ({selectedTags.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white text-blue-800 rounded-full border border-blue-200 shadow-sm hover:shadow-md transition-shadow hover:bg-blue-50 cursor-pointer"
                          >
                            {tag.replace("-", " ")}
                            <span className="hover:bg-blue-100 rounded-full p-0.5 transition-colors">
                              ×
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optimized tag grid - 3 columns with smaller text */}
                  <div className="grid grid-cols-3 gap-1">
                    {uniqueTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`text-left px-2 py-1.5 rounded-md text-xs transition-all duration-200 border hover:shadow-sm ${
                          selectedTags.includes(tag)
                            ? "bg-blue-100 text-blue-700 border-blue-200 font-medium shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                        title={tag.replace("-", " ")} // Tooltip for full text
                      >
                        <span className="capitalize text-xs leading-tight block truncate">
                          {tag.replace("-", " ")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Section */}
      <div className="border-t border-gray-200 flex-shrink-0 bg-white shadow-lg">
        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center mb-4 border border-blue-100">
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {releaseNotes.length}
            </div>
            <div className="text-xs text-blue-700 font-medium">
              Total Releases
            </div>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mx-auto mt-2"></div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-blue-600"
            >
              <Settings className="w-4 h-4" />
              Admin Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
