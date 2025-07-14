"use client";

import React from "react";
import { Bell, CheckCircle, Filter, Settings, UserX } from "lucide-react";

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
  selectedMonth,
  uniqueMonths,
  handleMonthSelect,
  showFilters,
  setShowFilters,
  releaseNotes,
  isAdmin,
  setShowAdminPanel,
}) => {
  return (
    <div className="w-80 bg-white shadow-lg flex flex-col h-screen fixed left-0 top-0 z-10">
      {/* Header - Always Visible */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Release Notes</h1>
            <p className="text-sm text-gray-500">
              Stay updated with our latest changes
            </p>
          </div>
        </div>

        {/* Email Subscription - Always Visible */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Get Notified</h3>
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
              <p className="text-sm text-gray-600 mb-4">
                Subscribe to receive email notifications when new releases are
                published.
              </p>

              {isSubscribed ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Successfully subscribed!
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSubscribe}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Subscribe to Updates
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Enter your email address to unsubscribe from release
                notifications.
              </p>

              {isUnsubscribed ? (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-md">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Successfully unsubscribed!
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={unsubscribeEmail}
                    onChange={(e) => setUnsubscribeEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleUnsubscribe}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Unsubscribe
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filters - Scrollable Middle Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filter by Month</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleMonthSelect("all")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedMonth === "all"
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Releases
            </button>

            {uniqueMonths.map((month) => (
              <button
                key={month}
                onClick={() => handleMonthSelect(month)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
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
      </div>

      {/* Bottom Section - Always Visible */}
      <div className="border-t border-gray-200 flex-shrink-0">
        {/* Quick Stats */}
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-gray-900">
              {releaseNotes.length}
            </div>
            <div className="text-sm text-gray-500">Total Releases</div>
          </div>

          {/* Admin Panel Access */}
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
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
