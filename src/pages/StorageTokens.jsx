import React, { useEffect, useMemo, useState } from "react";
import { FaCloud, FaShoppingCart, FaArrowUp, FaBolt } from "react-icons/fa";
import { X } from "lucide-react";
import { api } from "@/services/apiClient";
import { useUser } from "@/contexts/UserContext";

const formatNumber = (value) => value.toLocaleString();

const ProgressBar = ({ percent, color }) => (
  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
    <div
      className={`h-full ${color}`}
      style={{ width: `${Math.min(percent, 100)}%` }}
    />
  </div>
);

const StatCard = ({
  icon: Icon,
  title,
  used,
  total,
  unit,
  accent,
  tag,
  description,
}) => {
  const percent = total ? Math.round((used / total) * 100) : 0;
  const remaining = Math.max(total - used, 0);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${accent}`}
          >
            <Icon />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
              {title}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {used.toFixed(2)} {unit} / {formatNumber(total)} {unit}
            </p>
          </div>
        </div>
        {tag && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
            {tag}
          </span>
        )}
      </div>
      <ProgressBar
        percent={percent}
        color="bg-gradient-to-r from-blue-500 to-indigo-500"
      />
      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
        <span>{percent}% used</span>
        <span className="text-gray-700 font-semibold">
          {formatNumber(remaining)} {unit} left
        </span>
      </div>
      {description && (
        <p className="mt-3 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
};

const StorageTokens = () => {
  const { userProfile } = useUser();
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isBuyStorageModalOpen, setIsBuyStorageModalOpen] = useState(false);
  const [isBuyTokensModalOpen, setIsBuyTokensModalOpen] = useState(false);
  const [storageAmount, setStorageAmount] = useState("");
  const [tokensAmount, setTokensAmount] = useState("");

  const orgId =
    userProfile?.organization_id ||
    userProfile?.org_id ||
    userProfile?.organizationId ||
    userProfile?.organization?.id ||
    localStorage.getItem("orgId");

  const fetchOrg = React.useCallback(async () => {
    if (!orgId) {
      setError("Organization not found. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/org/SingleOrg/${orgId}`);
      const data = response?.data?.data || response?.data;
      if (!data) {
        setError("Organization data not found.");
        setOrgData(null);
      } else {
        setOrgData(data);
      }
    } catch (err) {
      console.error("Failed to fetch organization usage", err);
      setError(
        err?.response?.data?.message ||
          "Unable to load storage and token usage right now.",
      );
      setOrgData(null);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  // Refresh org data whenever uploads complete anywhere in LMS
  useEffect(() => {
    const handleOrgRefresh = () => {
      fetchOrg();
    };
    window.addEventListener("org:refreshSingleOrg", handleOrgRefresh);
    return () => {
      window.removeEventListener("org:refreshSingleOrg", handleOrgRefresh);
    };
  }, [fetchOrg]);

  const storage = useMemo(() => {
    // API returns storage and storage_limit already in GB
    const used = Number(orgData?.storage) || 0;
    const total = Number(orgData?.storage_limit) || 0;
    // If values are small (< 10000), they're already in GB, not bytes
    // Otherwise, convert from bytes to GB
    let usedGB = used;
    let totalGB = total;

    if (used >= 10000 || total >= 10000) {
      // Values are in bytes, convert to GB
      usedGB = used / Math.pow(1024, 3);
      totalGB = total / Math.pow(1024, 3);
    }

    return {
      rawUsed: used,
      rawTotal: total,
      used: usedGB, // Keep as number for calculations
      total: totalGB, // Keep as number for calculations
      unit: "GB",
    };
  }, [orgData]);

  const tokens = useMemo(() => {
    const used = Number(orgData?.ai_tokens_used) || 0;
    const total = Number(orgData?.ai_token_limit) || 0;

    return {
      used,
      total,
      usedInMillions: used / 1_000_000,
      totalInMillions: total / 1_000_000,
      unit: "M",
    };
  }, [orgData]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl text-white p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-100 font-semibold">
              Account Usage
            </p>
            <h2 className="text-2xl font-bold">
              {orgData?.name || "Storage & AI Tokens"}
            </h2>
            <p className="text-blue-100 mt-1">
              Track limits and add capacity without leaving the dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBuyStorageModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold shadow-sm hover:shadow transition"
            >
              <FaShoppingCart /> Buy Storage
            </button>
            <button
              onClick={() => setIsBuyTokensModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 text-indigo-700 font-semibold shadow-sm hover:shadow transition"
            >
              <FaBolt /> Buy Tokens
            </button>
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/50 text-white border border-white/30 font-semibold hover:bg-white/15 transition"
            >
              <FaArrowUp /> My Plan
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-gray-600">Loading usage...</p>
        </div>
      )}

      {/* Buy Tokens Modal */}
      {isBuyTokensModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
          onClick={() => setIsBuyTokensModalOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-5 shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Buy AI Tokens</h2>
              <button
                onClick={() => setIsBuyTokensModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Token Info */}
              {orgData && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Current AI Tokens
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {tokens.usedInMillions.toFixed(2)}M /{" "}
                    {tokens.totalInMillions.toFixed(2)}M tokens
                  </p>
                </div>
              )}

              {/* Contact Sales Message */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-700 font-semibold">
                  Kindly contact our sales team for AI token purchases.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Email:{" "}
                  <a
                    className="text-blue-600 font-semibold"
                    href="mailto:support@creditoracademy.com"
                  >
                    support@creditoracademy.com
                  </a>
                </p>
              </div>

              {/* Payment Button commented out intentionally */}
              {/* Previous purchase flow removed as requested */}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsBuyTokensModalOpen(false);
                  setTokensAmount("");
                }}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && orgData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatCard
              icon={FaCloud}
              title="Storage"
              used={storage.used}
              total={storage.total}
              unit={storage.unit}
              accent="bg-blue-500"
              tag="Media, files, resources"
              description="Includes courses, media uploads, and shared assets."
            />
            <StatCard
              icon={FaBolt}
              title="AI Tokens"
              used={tokens.usedInMillions}
              total={tokens.totalInMillions}
              unit={`${tokens.unit} tokens`}
              accent="bg-purple-600"
              tag="AI requests, chat, media"
              description="Track and top-up token capacity used across AI features."
            />
          </div>
        </>
      )}

      {/* Plan Details Modal */}
      {isPlanModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
          onClick={() => setIsPlanModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-5 shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                My Plan Details
              </h2>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {orgData ? (
              <div className="grid grid-cols-2 gap-3">
                {/* Plan Type */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Plan Type
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {orgData.plan || "N/A"}
                  </p>
                </div>

                {/* Price */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Price
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {orgData.plan === "YEARLY"
                      ? "$1,999/year"
                      : orgData.plan === "MONTHLY"
                        ? "$99/month"
                        : "N/A"}
                  </p>
                </div>

                {/* Storage Limit */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Storage Limit
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {orgData.storage_limit
                      ? `${Number(orgData.storage_limit)} GB`
                      : "N/A"}
                  </p>
                </div>

                {/* User Limit */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    User Limit
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {orgData.user_limit || "Unlimited"}
                  </p>
                </div>

                {/* Status */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 col-span-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      orgData.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : orgData.status === "SUSPENDED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {orgData.status || "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading plan details...</p>
              </div>
            )}

            {/* Renew Plan Section */}
            {orgData && orgData.plan && (
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Renew your plan
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {orgData.plan === "YEARLY"
                        ? "$1,999/year"
                        : orgData.plan === "MONTHLY"
                          ? "$99/month"
                          : "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Handle renew plan action here
                      console.log("Renew plan");
                      // You can add navigation or API call here
                    }}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Renew Plan
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Storage Modal */}
      {isBuyStorageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
          onClick={() => setIsBuyStorageModalOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-5 shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Buy Storage</h2>
              <button
                onClick={() => setIsBuyStorageModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Storage Info */}
              {orgData && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Current Storage
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {storage.used.toFixed(2)} GB / {storage.total.toFixed(0)} GB
                  </p>
                </div>
              )}

              {/* Contact Sales Message */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-700 font-semibold">
                  Kindly contact our sales team for storage purchases.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Email:{" "}
                  <a
                    className="text-blue-600 font-semibold"
                    href="mailto:support@creditoracademy.com"
                  >
                    support@creditoracademy.com
                  </a>
                </p>
              </div>

              {/* Payment Button commented out intentionally */}
              {/* Previous purchase flow removed as requested */}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsBuyStorageModalOpen(false);
                  setStorageAmount("");
                }}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageTokens;
