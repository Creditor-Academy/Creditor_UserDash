import React, { useEffect, useMemo, useState } from 'react';
import {
  FaCloud,
  FaCheckCircle,
  FaShoppingCart,
  FaArrowUp,
} from 'react-icons/fa';
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
              {formatNumber(used)} / {formatNumber(total)} {unit}
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
    const used = Number(orgData?.storage) || 0;
    const total = Number(orgData?.storage_limit) || 0;
    const { value: usedFmt, unit: usedUnit } = formatBytes(used);
    const { value: totalFmt, unit: totalUnit } = formatBytes(total);
    const sameUnit = usedUnit === totalUnit;

    if (!sameUnit) {
      const gbUsed = used / Math.pow(1024, 3);
      const gbTotal = total / Math.pow(1024, 3);
      return {
        rawUsed: used,
        rawTotal: total,
        used: Number(gbUsed.toFixed(1)),
        total: Number(gbTotal.toFixed(1)),
        unit: 'GB',
      };
    }

    return {
      rawUsed: used,
      rawTotal: total,
      used: Number(usedFmt.toFixed(1)),
      total: Number(totalFmt.toFixed(1)),
      unit: usedUnit,
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
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold shadow-sm hover:shadow transition">
              <FaShoppingCart /> Buy Storage
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/50 text-white border border-white/30 font-semibold hover:bg-white/15 transition">
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
                    {storage.used} / {storage.total} {storage.unit}
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
                <button className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 font-semibold hover:border-blue-500 hover:text-blue-700 transition flex items-center justify-between">
                  <span>Buy more storage</span>
                  <FaShoppingCart />
                </button>
                <button className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 font-semibold hover:border-indigo-500 hover:text-indigo-700 transition flex items-center justify-between">
                  <span>Archive old assets</span>
                  <FaArrowUp />
                </button>
                <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm hover:shadow transition flex items-center justify-between">
                  <span>Upgrade storage plan</span>
                  <FaArrowUp />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StorageTokens;
