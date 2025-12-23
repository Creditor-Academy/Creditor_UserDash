import React, { useEffect, useMemo, useState } from 'react';
import {
  FaCloud,
  FaCheckCircle,
  FaShoppingCart,
  FaArrowUp,
} from 'react-icons/fa';
import { X } from 'lucide-react';
import { api } from '@/services/apiClient';
import { useUser } from '@/contexts/UserContext';

const formatNumber = value => value.toLocaleString();

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

const formatBytes = bytes => {
  const value = Number(bytes) || 0;
  if (value <= 0) return { value: 0, unit: 'GB' };
  const kb = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(
    Math.floor(Math.log(value) / Math.log(kb)),
    units.length - 1
  );
  const normalized = value / Math.pow(kb, i);
  return { value: normalized, unit: units[i] };
};

const StorageTokens = () => {
  const { userProfile } = useUser();
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isBuyStorageModalOpen, setIsBuyStorageModalOpen] = useState(false);
  const [storageAmount, setStorageAmount] = useState('');

  const orgId =
    userProfile?.organization_id ||
    userProfile?.org_id ||
    userProfile?.organizationId ||
    userProfile?.organization?.id ||
    localStorage.getItem('orgId') ||
    '997be751-2e1b-4751-80af-3b29f81e0eb0';

  useEffect(() => {
    const fetchOrg = async () => {
      if (!orgId) {
        setError('Organization not found. Please log in again.');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/org/SingleOrg/${orgId}`);
        const data = response?.data?.data || response?.data;
        setOrgData(data);
      } catch (err) {
        console.error('Failed to fetch organization usage', err);
        setError(
          err?.response?.data?.message ||
            'Unable to load storage and token usage right now.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, [orgId]);

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
      unit: 'GB',
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
              {orgData?.name || 'Storage & AI Tokens'}
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
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Usage Health
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1 mb-3">
                {storage.total
                  ? `${Math.round((storage.used / storage.total) * 100)}% used`
                  : '—'}
              </h3>
              <ProgressBar
                percent={
                  storage.total
                    ? Math.round((storage.used / storage.total) * 100)
                    : 0
                }
              />
              <p className="mt-3 text-sm text-gray-600">
                Keep usage below 80% for best performance. Offload old media or
                upgrade when you approach the limit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <FaCloud />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Storage Summary</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {storage.used.toFixed(2)} {storage.unit} /{' '}
                    {formatNumber(storage.total)} {storage.unit}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-blue-500 mt-0.5" />
                  <span>
                    Optimize uploads to reduce usage and keep performance high.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-blue-500 mt-0.5" />
                  <span>
                    Archive old lesson media to reclaim space instantly.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-blue-500 mt-0.5" />
                  <span>Upgrade anytime; changes apply immediately.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Quick Actions</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Keep storage healthy
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsBuyStorageModalOpen(true)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 font-semibold hover:border-blue-500 hover:text-blue-700 transition flex items-center justify-between"
                >
                  <span>Buy more storage</span>
                  <FaShoppingCart />
                </button>
                <button
                  onClick={() => setIsBuyStorageModalOpen(true)}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm hover:shadow transition flex items-center justify-between"
                >
                  <span>Upgrade storage plan</span>
                  <FaArrowUp />
                </button>
              </div>
            </div>
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
            onClick={e => e.stopPropagation()}
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
                    {orgData.plan || 'N/A'}
                  </p>
                </div>

                {/* Price */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Price
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {orgData.plan === 'YEARLY'
                      ? '$1,999/year'
                      : orgData.plan === 'MONTHLY'
                        ? '$99/month'
                        : 'N/A'}
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
                      : 'N/A'}
                  </p>
                </div>

                {/* User Limit */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    User Limit
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {orgData.user_limit || 'Unlimited'}
                  </p>
                </div>

                {/* Status */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 col-span-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      orgData.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : orgData.status === 'SUSPENDED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {orgData.status || 'N/A'}
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
                      {orgData.plan === 'YEARLY'
                        ? '$1,999/year'
                        : orgData.plan === 'MONTHLY'
                          ? '$99/month'
                          : 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Handle renew plan action here
                      console.log('Renew plan');
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
            onClick={e => e.stopPropagation()}
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

              {/* Storage Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Storage Amount (GB)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={storageAmount}
                  onChange={e => setStorageAmount(e.target.value)}
                  placeholder="Enter storage amount (e.g., 1, 2, 3)"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the amount of storage you want to purchase in GB
                </p>
              </div>

              {/* Price Calculation */}
              {storageAmount && Number(storageAmount) > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Storage Amount:
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {storageAmount} GB
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Price per GB:
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      $10/GB
                    </span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-gray-900">
                        Total Amount:
                      </span>
                      <span className="text-2xl font-bold text-green-700">
                        ${(Number(storageAmount) * 10).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (!storageAmount || Number(storageAmount) <= 0) {
                      alert('Please enter a valid storage amount');
                      return;
                    }
                    // Handle payment here
                    console.log('Processing payment for', storageAmount, 'GB');
                    // You can integrate payment gateway here
                    alert(
                      `Payment processing for ${storageAmount} GB ($${Number(storageAmount) * 10})`
                    );
                  }}
                  disabled={!storageAmount || Number(storageAmount) <= 0}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsBuyStorageModalOpen(false);
                  setStorageAmount('');
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
