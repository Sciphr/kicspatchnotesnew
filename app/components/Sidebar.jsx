"use client";

import React from "react";
import {
  Bell,
  CheckCircle,
  Filter,
  Settings,
  UserX,
  AlertCircle,
  Loader2,
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
}) => {
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
    <div className="w-96 bg-white shadow-lg flex flex-col h-screen fixed left-0 top-0 z-10">
      {/* Header - Always Visible */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Release Notes</h1>
            <p className="text-xs text-gray-500">
              Stay updated with our latest changes
            </p>
          </div>
        </div>

        {/* Email Subscription - Always Visible */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Get Notified
            </h3>
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
              <p className="text-xs text-gray-600 mb-3">
                Subscribe to receive email notifications when new releases are
                published.
              </p>

              {/* Success Message */}
              {isSubscribed && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-md mb-3">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    Successfully subscribed!
                  </span>
                </div>
              )}

              {/* Error Message */}
              {emailError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-md mb-3">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">{emailError}</span>
                </div>
              )}

              {/* Subscribe Form */}
              {!isSubscribed && (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    disabled={emailLoading}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={emailLoading || !email}
                    className="w-full bg-blue-600 text-white py-1.5 px-3 rounded-md hover:bg-blue-700 transition-colors text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {emailLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      "Subscribe to Updates"
                    )}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-gray-600 mb-3">
                Enter your email address to unsubscribe from release
                notifications.
              </p>

              {/* Success Message */}
              {isUnsubscribed && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-md mb-3">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    Successfully unsubscribed!
                  </span>
                </div>
              )}

              {/* Error Message */}
              {emailError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-md mb-3">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">{emailError}</span>
                </div>
              )}

              {/* Unsubscribe Form */}
              {!isUnsubscribed && (
                <form onSubmit={handleUnsubscribe} className="space-y-2">
                  <input
                    type="email"
                    value={unsubscribeEmail}
                    onChange={handleUnsubscribeEmailChange}
                    placeholder="Enter your email"
                    disabled={emailLoading}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={emailLoading || !unsubscribeEmail}
                    className="w-full bg-orange-600 text-white py-1.5 px-3 rounded-md hover:bg-orange-700 transition-colors text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {emailLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Unsubscribing...
                      </>
                    ) : (
                      "Unsubscribe"
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filters - Scrollable Middle Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Month Filter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Filter by Month
              </h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => handleMonthSelect("all")}
                className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors ${
                  selectedMonth === "all"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All Months
              </button>

              {uniqueMonths.map((month) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(month)}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors ${
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

          {/* Tag Filter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Filter by Tags
              </h3>
              {selectedTags.length > 0 && (
                <button
                  onClick={clearAllTags}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="mb-3 p-2 bg-green-50 rounded-md">
                <div className="text-xs text-green-700 font-medium mb-1">
                  Selected ({selectedTags.length}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full"
                    >
                      {tag.replace("-", " ")}
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className="hover:bg-green-200 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1">
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`text-left px-2 py-1.5 rounded-md text-xs transition-colors border ${
                    selectedTags.includes(tag)
                      ? "bg-green-100 text-green-700 border-green-200 font-medium"
                      : "text-gray-600 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  <span className="capitalize">{tag.replace("-", " ")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Always Visible */}
      <div className="border-t border-gray-200 flex-shrink-0">
        {/* Quick Stats */}
        <div className="p-4">
          <div className="text-center mb-3">
            <div className="text-xl font-bold text-gray-900">
              {releaseNotes.length}
            </div>
            <div className="text-xs text-gray-500">Total Releases</div>
          </div>

          {/* Admin Panel Access */}
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="w-full bg-purple-600 text-white py-1.5 px-3 rounded-md hover:bg-purple-700 transition-colors text-xs font-medium flex items-center justify-center gap-2"
            >
              <Settings className="w-3 h-3" />
              Admin Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
