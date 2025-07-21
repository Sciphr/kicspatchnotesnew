"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function UnsubscribeContent() {
  const [status, setStatus] = useState("loading"); // loading, success, error, not-found
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      setStatus("error");
      setMessage("No email address provided");
      return;
    }

    const handleUnsubscribe = async () => {
      try {
        const response = await fetch("/api/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: decodeURIComponent(email) }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(
            "You have been successfully unsubscribed from KICS release notifications."
          );
        } else if (response.status === 404) {
          setStatus("not-found");
          setMessage(
            "This email address was not found in our subscriber list."
          );
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to unsubscribe. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Network error. Please try again later.");
      }
    };

    handleUnsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Unsubscribe
          </h2>
          <p className="mt-2 text-sm text-gray-600">KICS Release Notes</p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {status === "loading" && (
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">
                Processing your unsubscribe request...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Successfully Unsubscribed
              </h3>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Email: {decodeURIComponent(email)}
              </p>
            </div>
          )}

          {status === "not-found" && (
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email Not Found
              </h3>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Email: {decodeURIComponent(email)}
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unsubscribe Failed
              </h3>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to Release Notes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Unsubscribe
            </h2>
            <p className="mt-2 text-sm text-gray-600">KICS Release Notes</p>
          </div>
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
