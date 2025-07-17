"use client";

import React, { useState } from "react";
import {
  Bell,
  Calendar,
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
  const [activeFilter, setActiveFilter] = useState(null);

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
    <div className="w-96 bg-white shadow-xl flex flex-col h-screen fixed left-0 top-0 z-10 border-r border-gray-100">
      {/* Enhanced Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-5 h-5 text-white" />
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

          {/* Enhanced Email Subscription Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Get Notified
              </h3>
              <button
                onClick={() => setShowUnsubscribe(!showUnsubscribe)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
              >
                <UserX className="w-3 h-3" />
                {showUnsubscribe ? "Subscribe" : "Unsubscribe"}
              </button>
            </div>

            {!showUnsubscribe ? (
              <>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Subscribe to receive email notifications when new releases are
                  published.
                </p>

                {/* Enhanced Success Message */}
                {isSubscribed && (
                  <div className="flex items-center gap-2 text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg mb-3 border border-green-200 animate-in slide-in-from-top duration-300">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      Successfully subscribed! 🎉
                    </span>
                  </div>
                )}

                {/* Enhanced Error Message */}
                {emailError && (
                  <div className="flex items-center gap-2 text-red-700 bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg mb-3 border border-red-200 animate-in slide-in-from-top duration-300">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">{emailError}</span>
                  </div>
                )}

                {/* Enhanced Subscribe Form */}
                {!isSubscribed && (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email"
                        disabled={emailLoading}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 placeholder-gray-400"
                      />
                      {email && !emailLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={emailLoading || !email}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] disabled:transform-none"
                    >
                      {emailLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          Subscribe to Updates
                        </>
                      )}
                    </button>
                  </form>
                )}
              </>
            ) : (
              // Similar enhancements for unsubscribe section...
              <>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Enter your email address to unsubscribe from release
                  notifications.
                </p>

                {isUnsubscribed && (
                  <div className="flex items-center gap-2 text-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg mb-3 border border-orange-200 animate-in slide-in-from-top duration-300">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      Successfully unsubscribed! 👋
                    </span>
                  </div>
                )}

                {emailError && (
                  <div className="flex items-center gap-2 text-red-700 bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg mb-3 border border-red-200 animate-in slide-in-from-top duration-300">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">{emailError}</span>
                  </div>
                )}

                {!isUnsubscribed && (
                  <form onSubmit={handleUnsubscribe} className="space-y-3">
                    <div className="relative">
                      <input
                        type="email"
                        value={unsubscribeEmail}
                        onChange={handleUnsubscribeEmailChange}
                        placeholder="Enter your email"
                        disabled={emailLoading}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 placeholder-gray-400"
                      />
                      {unsubscribeEmail && !emailLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={emailLoading || !unsubscribeEmail}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 text-sm font-medium disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] disabled:transform-none"
                    >
                      {emailLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Unsubscribing...
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4" />
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
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Enhanced Month Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Filter by Month
              </h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => handleMonthSelect("all")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group ${
                  selectedMonth === "all"
                    ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
                onMouseEnter={() => setActiveFilter("all")}
                onMouseLeave={() => setActiveFilter(null)}
              >
                <span>All Months</span>
                {selectedMonth === "all" && (
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                )}
              </button>

              {uniqueMonths.map((month) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(month)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group ${
                    selectedMonth === month
                      ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                  onMouseEnter={() => setActiveFilter(month)}
                  onMouseLeave={() => setActiveFilter(null)}
                >
                  <span>{month}</span>
                  {selectedMonth === month && (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Tag Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-blue-500"></div>
                Filter by Tags
              </h3>
              {selectedTags.length > 0 && (
                <button
                  onClick={clearAllTags}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Enhanced Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 animate-in slide-in-from-top duration-300">
                <div className="text-xs text-green-700 font-medium mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Selected ({selectedTags.length}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white text-green-800 rounded-full border border-green-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {tag.replace("-", " ")}
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className="hover:bg-green-100 rounded-full p-0.5 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 border hover:shadow-sm transform hover:scale-[1.02] ${
                    selectedTags.includes(tag)
                      ? "bg-green-100 text-green-700 border-green-200 font-medium shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="capitalize">{tag.replace("-", " ")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Section */}
      <div className="border-t border-gray-200 flex-shrink-0 bg-gray-50">
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {releaseNotes.length}
            </div>
            <div className="text-xs text-gray-500">Total Releases</div>
            <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-2"></div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
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
