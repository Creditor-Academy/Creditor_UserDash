import React, { useState, useMemo, useEffect } from "react";
import { FaCoins } from "react-icons/fa";
import { useCredits } from "@/contexts/CreditsContext";
import { fetchAllUsersAdmin } from "@/services/userService";
import { api } from "@/services/apiClient";

const AdminPayments = () => {
  const { transactions, balance, addCredits, refreshBalance, refreshMembership } = useCredits();
  const [paymentsView, setPaymentsView] = useState("orders");
  const [ordersPage, setOrdersPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [subsPage, setSubsPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [grantCreditsAmount, setGrantCreditsAmount] = useState(10);
  const [userDetailModal, setUserDetailModal] = useState({ open: false, user: null });
  const [grantModal, setGrantModal] = useState({ open: false });

  // Mix dummy data with real transaction data
  const orders = useMemo(() => {
    const dummyOrders = [
      { id: "ord_1001", user: "alice@example.com", items: 1, amount: 49, currency: "USD", date: "2025-09-01", status: "paid" },
      { id: "ord_1002", user: "bob@example.com", items: 2, amount: 98, currency: "USD", date: "2025-09-03", status: "paid" },
      { id: "ord_1003", user: "chris@example.com", items: 1, amount: 49, currency: "USD", date: "2025-09-05", status: "refunded" }
    ];
    
    // Add real credit purchases as orders
    const realOrders = transactions
      .filter(t => t.type === 'purchase')
      .map(t => ({
        id: `ord_${t.id}`,
        user: "current@user.com", // You could get this from auth context
        items: 1,
        amount: t.amount,
        currency: "CR",
        date: new Date(t.timestamp).toISOString().slice(0, 10),
        status: "paid"
      }));
    
    return [...realOrders, ...dummyOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  const payments = useMemo(() => {
    const dummyPayments = [
      { id: "pay_2001", orderId: "ord_1001", provider: "stripe", amount: 49, currency: "USD", status: "succeeded", date: "2025-09-01" },
      { id: "pay_2002", orderId: "ord_1002", provider: "stripe", amount: 98, currency: "USD", status: "succeeded", date: "2025-09-03" },
      { id: "pay_2003", orderId: "ord_1003", provider: "stripe", amount: 49, currency: "USD", status: "refunded", date: "2025-09-05" }
    ];
    
    // Add real credit purchases as payments
    const realPayments = transactions
      .filter(t => t.type === 'purchase')
      .map(t => ({
        id: `pay_${t.id}`,
        orderId: `ord_${t.id}`,
        provider: "credits",
        amount: t.amount,
        currency: "CR",
        status: "succeeded",
        date: new Date(t.timestamp).toISOString().slice(0, 10)
      }));
    
    return [...realPayments, ...dummyPayments].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);
  const subscriptions = [
    { id: "sub_3001", user: "alice@example.com", plan: "Pro Monthly", status: "active", currentPeriodEnd: "2025-10-01", startedAt: "2025-06-01" },
    { id: "sub_3002", user: "bob@example.com", plan: "Pro Monthly", status: "active", currentPeriodEnd: "2025-10-03", startedAt: "2025-07-03" },
    { id: "sub_3003", user: "dana@example.com", plan: "Basic Annual", status: "past_due", currentPeriodEnd: "2026-01-10", startedAt: "2025-01-10" }
  ];
  const credits = useMemo(() => {
    const sold = transactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const used = Math.abs(transactions
      .filter(t => t.type === 'spend')
      .reduce((sum, t) => sum + t.amount, 0));
    
    return { 
      sold: sold + 1200, // Add dummy data to real data
      used: used + 875   // Add dummy data to real data
    };
  }, [transactions]);
  const [realUsers, setRealUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [isGranting, setIsGranting] = useState(false);
  const [grantMessage, setGrantMessage] = useState("");
  const [localMembership, setLocalMembership] = useState({});

  const membershipColorClasses = (status) => {
    const s = (status || "active").toString().toLowerCase();
    if (s === "active") return "bg-green-100 text-green-700 border-green-200";
    if (s === "expired") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (s === "cancelled") return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setUsersLoading(true);
        setUsersError("");
        const [fetched, creditsRes] = await Promise.all([
          fetchAllUsersAdmin(),
          api.get('/payment-order/admin/credits', { withCredentials: true }).catch(() => ({ data: { data: [] } }))
        ]);
        if (cancelled) return;
        const creditsArray = Array.isArray(creditsRes?.data?.data) ? creditsRes.data.data : (Array.isArray(creditsRes?.data) ? creditsRes.data : []);
        const idToCredits = new Map(
          (creditsArray || []).map((c) => [String(c.id), Number(c.total_credits) || 0])
        );
        
        // Fetch membership status for each user from backend
        const usersWithMembership = await Promise.all(
          fetched.map(async (u) => {
            const userId = u.id || u.user_id || u._id;
            let membershipStatus = "cancelled"; // Default to cancelled
            
            try {
              const membershipRes = await api.get(`/payment-order/membership/status/${userId}`, { withCredentials: true });
              const membershipData = membershipRes?.data?.data;
              if (membershipData && membershipData !== null) {
                membershipStatus = membershipData?.status?.toLowerCase() || "cancelled";
              }
            } catch (err) {
              console.warn(`Failed to fetch membership for user ${userId}:`, err);
            }
            
            return {
              id: userId,
              name: `${u.first_name || u.firstName || u.given_name || ""} ${u.last_name || u.lastName || u.family_name || ""}`.trim() || u.name || u.username || u.email || "Unknown",
              email: u.email || u.user_email || "",
              membership: membershipStatus,
              credits: (() => {
                const idStr = String(userId || '');
                const fromAdmin = idToCredits.has(idStr) ? idToCredits.get(idStr) : undefined;
                const val = (fromAdmin != null ? fromAdmin : (u.total_credits != null ? u.total_credits : u.credits));
                const num = Number(val);
                return Number.isFinite(num) ? num : 0;
              })(),
            };
          })
        );
        
        setRealUsers(usersWithMembership);
      } catch (e) {
        if (!cancelled) setUsersError("Failed to load users");
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Keep local membership (frontend-only) in sync with loaded users
  useEffect(() => {
    if (!Array.isArray(realUsers)) return;
    setLocalMembership(prev => {
      const next = { ...prev };
      for (const u of realUsers) {
        const id = u?.id;
        if (id == null) continue;
        if (next[id] == null) {
          next[id] = (u.membership || "active").toString().toLowerCase();
        }
      }
      if (next["current_user"] == null) next["current_user"] = "active";
      return next;
    });
  }, [realUsers]);

  const users = useMemo(() => {
    // Apply local membership overrides to real users
    const withLocal = realUsers.map(u => ({
      ...u,
      membership: (localMembership[u.id] || u.membership || "active").toString().toLowerCase()
    }));
    return withLocal;
  }, [realUsers, localMembership]);

  // Search + paging for users list (credits view)
  const filteredUsers = useMemo(() => {
    const term = usersSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter(u =>
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.id || "").toString().toLowerCase().includes(term)
    );
  }, [users, usersSearch]);

  const totalUserPages = Math.max(Math.ceil(filteredUsers.length / itemsPerPage), 1);
  const pagedUsers = useMemo(() => {
    const start = (usersPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, usersPage, itemsPerPage]);

  useEffect(() => { setUsersPage(1); }, [usersSearch]);
  const remainingCredits = Math.max(credits.sold - credits.used, 0);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Payments & Subscriptions</h2>
            <p className="text-gray-600">Dummy data preview for admin payments dashboard.</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setPaymentsView("orders")} className={`px-3 py-1.5 text-sm rounded-md ${paymentsView === "orders" ? "bg-white shadow-sm text-gray-900" : "text-gray-700 hover:text-gray-900"}`}>Orders</button>
            <button onClick={() => setPaymentsView("payments")} className={`px-3 py-1.5 text-sm rounded-md ${paymentsView === "payments" ? "bg-white shadow-sm text-gray-900" : "text-gray-700 hover:text-gray-900"}`}>Payments</button>
            <button onClick={() => setPaymentsView("subscriptions")} className={`px-3 py-1.5 text-sm rounded-md ${paymentsView === "subscriptions" ? "bg-white shadow-sm text-gray-900" : "text-gray-700 hover:text-gray-900"}`}>Subscriptions</button>
            <button onClick={() => setPaymentsView("credits")} className={`px-3 py-1.5 text-sm rounded-md ${paymentsView === "credits" ? "bg-white shadow-sm text-gray-900" : "text-gray-700 hover:text-gray-900"}`}>Credits</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-1">Credits</h3>
          <p className="text-sm text-gray-600 mb-3">Sold vs used</p>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm">
            <div className="flex justify-between py-1"><span className="text-gray-600">Sold</span><span className="font-medium">{credits.sold}</span></div>
            <div className="flex justify-between py-1"><span className="text-gray-600">Used</span><span className="font-medium">{credits.used}</span></div>
            <div className="flex justify-between py-1"><span className="text-gray-600">Remaining</span><span className="font-medium">{remainingCredits}</span></div>
            <div className="mt-2 h-2 bg-gray-200 rounded">
              <div className="h-2 bg-blue-500 rounded" style={{ width: `${Math.min((credits.used / Math.max(credits.sold, 1)) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {paymentsView === "orders" && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Orders</h3>
            <span className="text-sm text-gray-500">GET /admin/orders</span>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-3 py-2">Order ID</th>
                  <th className="text-left px-3 py-2">User</th>
                  <th className="text-left px-3 py-2">Items</th>
                  <th className="text-left px-3 py-2">Amount</th>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice((ordersPage-1)*itemsPerPage, (ordersPage)*itemsPerPage).map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-3 py-2 font-medium text-gray-900">{o.id}</td>
                    <td className="px-3 py-2 text-gray-700">{o.user}</td>
                    <td className="px-3 py-2 text-gray-700">{o.items}</td>
                    <td className="px-3 py-2 text-gray-700">${o.amount} {o.currency}</td>
                    <td className="px-3 py-2 text-gray-700">{o.date}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${o.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Page {ordersPage} of {Math.max(Math.ceil(orders.length / itemsPerPage), 1)}</span>
            <div className="flex gap-2">
              <button disabled={ordersPage===1} onClick={() => setOrdersPage(p => Math.max(p-1,1))} className={`px-3 py-1.5 rounded-md border ${ordersPage===1?"text-gray-400 bg-gray-50":"hover:bg-gray-50"}`}>Prev</button>
              <button disabled={ordersPage >= Math.ceil(orders.length/itemsPerPage)} onClick={() => setOrdersPage(p => Math.min(p+1, Math.ceil(orders.length/itemsPerPage)))} className={`px-3 py-1.5 rounded-md border ${ordersPage >= Math.ceil(orders.length/itemsPerPage)?"text-gray-400 bg-gray-50":"hover:bg-gray-50"}`}>Next</button>
            </div>
          </div>
        </div>
      )}

      {paymentsView === "payments" && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Payments</h3>
            <span className="text-sm text-gray-500">GET /admin/payments</span>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-3 py-2">Payment ID</th>
                  <th className="text-left px-3 py-2">Order ID</th>
                  <th className="text-left px-3 py-2">Provider</th>
                  <th className="text-left px-3 py-2">Amount</th>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice((paymentsPage-1)*itemsPerPage, paymentsPage*itemsPerPage).map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2 font-medium text-gray-900">{p.id}</td>
                    <td className="px-3 py-2 text-gray-700">{p.orderId}</td>
                    <td className="px-3 py-2 text-gray-700 capitalize">{p.provider}</td>
                    <td className="px-3 py-2 text-gray-700">${p.amount} {p.currency}</td>
                    <td className="px-3 py-2 text-gray-700">{p.date}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${p.status === "succeeded" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Page {paymentsPage} of {Math.max(Math.ceil(payments.length / itemsPerPage), 1)}</span>
            <div className="flex gap-2">
              <button disabled={paymentsPage===1} onClick={() => setPaymentsPage(p => Math.max(p-1,1))} className={`px-3 py-1.5 rounded-md border ${paymentsPage===1?"text-gray-400 bg-gray-50":"hover:bg-gray-50"}`}>Prev</button>
              <button disabled={paymentsPage >= Math.ceil(payments.length/itemsPerPage)} onClick={() => setPaymentsPage(p => Math.min(p+1, Math.ceil(payments.length/itemsPerPage)))} className={`px-3 py-1.5 rounded-md border ${paymentsPage >= Math.ceil(payments.length/itemsPerPage)?"text-gray-400 bg-gray-50":"hover:bg-gray-50"}`}>Next</button>
            </div>
          </div>
        </div>
      )}

      {paymentsView === "subscriptions" && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Active Subscriptions</h3>
            <span className="text-sm text-gray-500">GET /admin/subscriptions</span>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-3 py-2">Subscription ID</th>
                  <th className="text-left px-3 py-2">User</th>
                  <th className="text-left px-3 py-2">Plan</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Current Period End</th>
                  <th className="text-left px-3 py-2">Started</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.slice((subsPage-1)*itemsPerPage, subsPage*itemsPerPage).map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-3 py-2 font-medium text-gray-900">{s.id}</td>
                    <td className="px-3 py-2 text-gray-700">{s.user}</td>
                    <td className="px-3 py-2 text-gray-700">{s.plan}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${s.status === "active" ? "bg-green-100 text-green-700" : s.status === "past_due" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{s.status}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{s.currentPeriodEnd}</td>
                    <td className="px-3 py-2 text-gray-700">{s.startedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Page {subsPage} of {Math.max(Math.ceil(subscriptions.length / itemsPerPage), 1)}</span>
            <div className="flex gap-2">
              <button disabled={subsPage===1} onClick={() => setSubsPage(p => Math.max(p-1,1))} className={`px-3 py-1.5 rounded-md border ${subsPage===1?"text-gray-400 bg-gray-50":"hover:bg-gray-50"}`}>Prev</button>
              <button disabled={subsPage >= Math.ceil(subscriptions.length/itemsPerPage)} onClick={() => setSubsPage(p => Math.min(p+1, Math.ceil(subscriptions.length/itemsPerPage)))} className={`px-3 py-1.5 rounded-md border ${subsPage >= Math.ceil(subscriptions.length/itemsPerPage)?"text-gray-400 bg-gray-50":"hover:bg-gray-50"}`}>Next</button>
            </div>
          </div>
        </div>
      )}

      {paymentsView === "credits" && (
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <input
                  value={usersSearch}
                  onChange={(e)=>setUsersSearch(e.target.value)}
                  placeholder="Search users by name, email, or ID"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button
                disabled={selectedUserIds.length === 0}
                onClick={() => { if (selectedUserIds.length === 0) { return; } setGrantModal({ open: true }); }}
                className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors ${
                  selectedUserIds.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <FaCoins /> Grant credits{selectedUserIds.length > 0 ? ` (${selectedUserIds.length})` : ""}
              </button>
            </div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Users</h3>
              <span className="text-sm text-gray-600">{usersLoading ? 'Loading…' : `${filteredUsers.length} users`}</span>
            </div>
            {usersError && (
              <div className="mb-2 text-sm text-red-600">{usersError}</div>
            )}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2 w-10">
                      <input type="checkbox" aria-label="Select page" onChange={(e)=>{ const pageIds = pagedUsers.map(u=>u.id); setSelectedUserIds(prev => e.target.checked ? [...new Set([...prev, ...pageIds])] : prev.filter(id=>!pageIds.includes(id))); }} checked={pagedUsers.length>0 && pagedUsers.every(u=>selectedUserIds.includes(u.id))} />
                    </th>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">Email</th>
                    <th className="text-left px-3 py-2">Membership</th>
                    <th className="text-left px-3 py-2">Credits</th>
                    <th className="text-left px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((u)=>{
                    const checked = selectedUserIds.includes(u.id);
                    return (
                      <tr key={u.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={checked} onChange={(e)=>{
                            setSelectedUserIds(prev => e.target.checked ? [...new Set([...prev, u.id])] : prev.filter(id=>id!==u.id));
                          }} />
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-900 cursor-pointer" onClick={()=>setUserDetailModal({ open: true, user: u })}>{u.name}</td>
                        <td className="px-3 py-2 text-gray-700 cursor-pointer" onClick={()=>setUserDetailModal({ open: true, user: u })}>{u.email}</td>
                        <td className="px-3 py-2">
                          {(() => {
                            const value = (localMembership[u.id] || u.membership || "active").toString().toLowerCase();
                            return (
                              <select
                                value={value}
                                onChange={async (e) => {
                                  const v = e.target.value;
                                  const userId = u.id;
                                  
                                  // Update local state immediately
                                  setLocalMembership(prev => ({ ...prev, [userId]: v }));
                                  setRealUsers(prev => prev.map(r => r.id === userId ? { ...r, membership: v } : r));
                                  
                                  // Call backend API when setting to "not active" (cancelled)
                                  if (v === "cancelled") {
                                    try {
                                      await api.patch(`/payment-order/membership/${userId}/cancel`, {}, { withCredentials: true });
                                      console.log(`Membership cancelled for user ${userId}`);
                                      // Refresh current user's membership status if this is the current user
                                      try { await refreshMembership?.(); } catch {}
                                    } catch (err) {
                                      console.error('Failed to cancel membership:', err);
                                      // Revert local state on error
                                      setLocalMembership(prev => ({ ...prev, [userId]: "active" }));
                                      setRealUsers(prev => prev.map(r => r.id === userId ? { ...r, membership: "active" } : r));
                                    }
                                  } else if (v === "active") {
                                    // Use subscription API to activate membership
                                    try {
                                      const subscriptionData = {
                                        plan_type: "MONTHLY",
                                        total_amount: 69,
                                        type: "MEMBERSHIP"
                                      };
                                      console.log(`Activating membership for user ${userId} with data:`, subscriptionData);
                                      console.log(`Making POST request to: /payment-order/membership/subscribe/${userId}`);
                                      
                                      const response = await api.post(`/payment-order/membership/subscribe/${userId}`, subscriptionData, { withCredentials: true });
                                      console.log(`Membership activation response:`, response?.data);
                                      console.log(`Response status:`, response?.status);
                                      console.log(`Full response object:`, response);
                                      
                                      // Refresh current user's membership status if this is the current user
                                      try { await refreshMembership?.(); } catch {}
                                      
                                      // Refresh the users list to show updated status
                                      setTimeout(async () => {
                                        // Reload users with fresh membership data
                                        try {
                                          const fetched = await fetchAllUsersAdmin();
                                          const usersWithMembership = await Promise.all(
                                            fetched.map(async (u) => {
                                              const userId = u.id || u.user_id || u._id;
                                              let membershipStatus = "cancelled";
                                              
                                              try {
                                                const membershipRes = await api.get(`/payment-order/membership/status/${userId}`, { withCredentials: true });
                                                const membershipData = membershipRes?.data?.data;
                                                if (membershipData && membershipData !== null) {
                                                  membershipStatus = membershipData?.status?.toLowerCase() || "cancelled";
                                                }
                                              } catch (err) {
                                                console.warn(`Failed to fetch membership for user ${userId}:`, err);
                                              }
                                              
                                              return {
                                                id: userId,
                                                name: `${u.first_name || u.firstName || u.given_name || ""} ${u.last_name || u.lastName || u.family_name || ""}`.trim() || u.name || u.username || u.email || "Unknown",
                                                email: u.email || u.user_email || "",
                                                membership: membershipStatus,
                                                credits: Number(u.total_credits) || 0,
                                              };
                                            })
                                          );
                                          setRealUsers(usersWithMembership);
                                        } catch (err) {
                                          console.error('Failed to refresh users:', err);
                                        }
                                      }, 1000);
                                    } catch (err) {
                                      console.error('Failed to activate membership:', err?.response?.data || err?.message);
                                      console.error('Full error object:', err);
                                      console.error('Error status:', err?.response?.status);
                                      console.error('Error config:', err?.config);
                                      // Don't revert local state - keep it as "active" to show the attempt
                                      // The user can manually refresh to see the real status
                                    }
                                  }
                                }}
                                className={`rounded-md border px-2 py-1 text-xs capitalize focus:outline-none focus:ring-2 focus:ring-blue-200 ${membershipColorClasses(value)}`}
                              >
                                <option value="active">active</option>
                                <option value="cancelled">not active</option>
                              </select>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-2 text-gray-700">{u.credits}</td>
                        <td className="px-3 py-2 text-gray-400">—</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Page {usersPage} of {totalUserPages}</span>
              <div className="flex gap-2">
                <button disabled={usersPage===1} onClick={() => setUsersPage(p => Math.max(p-1,1))} className={`px-3 py-1.5 rounded-md border ${usersPage===1?"text-gray-400 bg-gray-50":"hover:bg-gray-50"}`}>Prev</button>
                <button disabled={usersPage>=totalUserPages} onClick={() => setUsersPage(p => Math.min(p+1, totalUserPages))} className={`px-3 py-1.5 rounded-md border ${usersPage>=totalUserPages?"text-gray-400 bg-gray-50":"hover:bg-gray-50"}`}>Next</button>
              </div>
            </div>
          </div>

          {grantModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30" onClick={()=>setGrantModal({ open:false })} />
              <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Grant Credits</h4>
                <p className="text-sm text-gray-600 mb-4">Selected users: {selectedUserIds.length}</p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                <input value={grantCreditsAmount} onChange={(e)=>setGrantCreditsAmount(parseInt(e.target.value||"0",10))} type="number" min="1" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 mb-4" />
                {grantMessage && (
                  <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{grantMessage}</div>
                )}
                <div className="flex justify-end gap-2">
                  <button onClick={()=>{ if (!isGranting) setGrantModal({ open:false }); }} className="px-4 py-2 rounded-md border hover:bg-gray-50" disabled={isGranting}>Cancel</button>
                  <button onClick={async ()=>{ 
                    if (isGranting) return; 
                    try {
                      setGrantMessage("");
                      setIsGranting(true);
                      // Call backend to grant credits
                      await api.post('/payment-order/admin/credits/grant', { userIds: selectedUserIds, credits: grantCreditsAmount }, { withCredentials: true });
                      // Reflect change locally
                      setRealUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, credits: (Number(u.credits)||0) + (Number(grantCreditsAmount)||0) } : u));
                      try { await refreshBalance?.(); } catch {}
                      setGrantMessage(`Granted ${grantCreditsAmount} credits to ${selectedUserIds.length} user(s).`);
                      // Optionally clear selection
                      setSelectedUserIds([]);
                      // Close after brief delay
                      setTimeout(()=>{ setGrantModal({ open:false }); setGrantMessage(""); }, 800);
                    } catch (e) {
                      alert('Failed to grant credits.');
                    } finally {
                      setIsGranting(false);
                    }
                  }} className={`px-4 py-2 rounded-md text-white ${isGranting? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>{isGranting? 'Granting…' : 'Grant'}</button>
                </div>
              </div>
            </div>
          )}

          {userDetailModal.open && userDetailModal.user && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30" onClick={()=>setUserDetailModal({ open:false, user:null })} />
              <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-5xl p-4">
                <h4 className="text-xl font-semibold text-gray-900 mb-3">User Credit Details</h4>
                {(() => {
                  const u = userDetailModal.user;
                  const userOrders = [
                    { id: "ord_1001", amount: 49, currency: "USD", date: "2025-06-02", status: "paid" },
                    { id: "ord_1010", amount: 98, currency: "USD", date: "2025-08-15", status: "paid" }
                  ];
                  const purchasedLessons = [
                    { course: "Operate Private Merchant", lesson: "Getting Started" },
                    { course: "Remedy Masterclass", lesson: "Dispute Strategy" }
                  ];
                  const membershipEnd = u.membership === "active" ? "2025-12-01" : "—";
                  const creditSummary = { current: u.credits, grantedTotal: 120, usedTotal: 85, lastGrantDate: "2025-09-01" };
                  const creditHistory = [
                    { date: "2025-09-01", type: "grant", amount: 20, note: "Promo bonus" },
                    { date: "2025-08-20", type: "use", amount: 10, note: "Lesson: Getting Started" },
                    { date: "2025-08-05", type: "grant", amount: 50, note: "Manual grant" },
                    { date: "2025-07-28", type: "use", amount: 15, note: "Quiz attempts" }
                  ];
                  const meta = { role: "member", lastLogin: "2025-09-07 14:22", plan: "Pro Monthly", nextBilling: "2025-10-01", totalOrders: userOrders.length, totalSpend: userOrders.reduce((s,o)=>s+o.amount,0) };
                  return (
                    <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                          <div className="flex justify-between py-1"><span className="text-gray-600">Name</span><span className="font-medium">{u.name}</span></div>
                          <div className="flex justify-between py-1"><span className="text-gray-600">Email</span><span className="font-medium">{u.email}</span></div>
                          <div className="flex justify-between items-center py-1 gap-2">
                            <span className="text-gray-600">Membership</span>
                            {(() => {
                              const value = (localMembership[u.id] || u.membership || "active").toString().toLowerCase();
                              return (
                                <select
                                  value={value}
                                  onChange={async (e) => {
                                    const v = e.target.value;
                                    const userId = u.id;
                                    
                                    // Update local state immediately
                                    setLocalMembership(prev => ({ ...prev, [userId]: v }));
                                    setRealUsers(prev => prev.map(r => r.id === userId ? { ...r, membership: v } : r));
                                    
                                    // Call backend API when setting to "not active" (cancelled)
                                    if (v === "cancelled") {
                                      try {
                                        await api.patch(`/payment-order/membership/${userId}/cancel`, {}, { withCredentials: true });
                                        console.log(`Membership cancelled for user ${userId}`);
                                        // Refresh current user's membership status if this is the current user
                                        try { await refreshMembership?.(); } catch {}
                                      } catch (err) {
                                        console.error('Failed to cancel membership:', err);
                                        // Revert local state on error
                                        setLocalMembership(prev => ({ ...prev, [userId]: "active" }));
                                        setRealUsers(prev => prev.map(r => r.id === userId ? { ...r, membership: "active" } : r));
                                      }
                                      } else if (v === "active") {
                                        // Use subscription API to activate membership
                                        try {
                                          const subscriptionData = {
                                            plan_type: "MONTHLY",
                                            total_amount: 69,
                                            type: "MEMBERSHIP"
                                          };
                                          console.log(`Activating membership for user ${userId} with data:`, subscriptionData);
                                          console.log(`Making POST request to: /payment-order/membership/subscribe/${userId}`);
                                          
                                          const response = await api.post(`/payment-order/membership/subscribe/${userId}`, subscriptionData, { withCredentials: true });
                                          console.log(`Membership activation response:`, response?.data);
                                          console.log(`Response status:`, response?.status);
                                          console.log(`Full response object:`, response);
                                          
                                          // Refresh current user's membership status if this is the current user
                                          try { await refreshMembership?.(); } catch {}
                                          
                                          // Refresh the users list to show updated status
                                          setTimeout(async () => {
                                            // Reload users with fresh membership data
                                            try {
                                              const fetched = await fetchAllUsersAdmin();
                                              const usersWithMembership = await Promise.all(
                                                fetched.map(async (u) => {
                                                  const userId = u.id || u.user_id || u._id;
                                                  let membershipStatus = "cancelled";
                                                  
                                                  try {
                                                    const membershipRes = await api.get(`/payment-order/membership/status/${userId}`, { withCredentials: true });
                                                    const membershipData = membershipRes?.data?.data;
                                                    if (membershipData && membershipData !== null) {
                                                      membershipStatus = membershipData?.status?.toLowerCase() || "cancelled";
                                                    }
                                                  } catch (err) {
                                                    console.warn(`Failed to fetch membership for user ${userId}:`, err);
                                                  }
                                                  
                                                  return {
                                                    id: userId,
                                                    name: `${u.first_name || u.firstName || u.given_name || ""} ${u.last_name || u.lastName || u.family_name || ""}`.trim() || u.name || u.username || u.email || "Unknown",
                                                    email: u.email || u.user_email || "",
                                                    membership: membershipStatus,
                                                    credits: Number(u.total_credits) || 0,
                                                  };
                                                })
                                              );
                                              setRealUsers(usersWithMembership);
                                            } catch (err) {
                                              console.error('Failed to refresh users:', err);
                                            }
                                          }, 1000);
                                        } catch (err) {
                                          console.error('Failed to activate membership:', err?.response?.data || err?.message);
                                          console.error('Full error object:', err);
                                          console.error('Error status:', err?.response?.status);
                                          console.error('Error config:', err?.config);
                                          // Don't revert local state - keep it as "active" to show the attempt
                                          // The user can manually refresh to see the real status
                                        }
                                      }
                                  }}
                                  className={`ml-auto rounded-md border px-2 py-1 text-xs capitalize focus:outline-none focus:ring-2 focus:ring-blue-200 ${membershipColorClasses(value)}`}
                                >
                                  <option value="active">active</option>
                                  <option value="cancelled">not active</option>
                                </select>
                              );
                            })()}
                          </div>
                          <div className="flex justify-between py-1"><span className="text-gray-600">Membership Ends</span><span className="font-medium">{membershipEnd}</span></div>
                          <div className="flex justify-between py-1"><span className="text-gray-600">Credits</span><span className="font-medium">{u.credits}</span></div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                          <div className="font-medium text-gray-800 mb-2">Recent Orders</div>
                          <div className="space-y-1">
                            {userOrders.map(o => (
                              <div key={o.id} className="flex justify-between">
                                <span className="text-gray-600">{o.id}</span>
                                <span className="text-gray-800">${o.amount} {o.currency} • {o.status} • {o.date}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-gray-600">Total Orders: <span className="font-medium text-gray-800">{meta.totalOrders}</span> • Total Spend: <span className="font-medium text-gray-800">${meta.totalSpend}</span></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                          <div className="font-medium text-gray-800 mb-2">Credit Summary</div>
                          <div className="space-y-1">
                            <div className="flex justify-between py-1"><span className="text-gray-600">Current</span><span className="font-semibold">{creditSummary.current}</span></div>
                            <div className="flex justify-between py-1"><span className="text-gray-600">Total Granted</span><span className="font-medium">{creditSummary.grantedTotal}</span></div>
                            <div className="flex justify-between py-1"><span className="text-gray-600">Total Used</span><span className="font-medium">{creditSummary.usedTotal}</span></div>
                            <div className="flex justify-between py-1"><span className="text-gray-600">Last Grant</span><span className="font-medium">{creditSummary.lastGrantDate}</span></div>
                            <div className="flex justify-between py-1"><span className="text-gray-600">Plan</span><span className="font-medium">{meta.plan}</span></div>
                            <div className="flex justify-between py-1"><span className="text-gray-600">Next Billing</span><span className="font-medium">{meta.nextBilling}</span></div>
                          </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                          <div className="font-medium text-gray-800 mb-2">Credit History</div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                              <thead className="text-gray-700">
                                <tr>
                                  <th className="text-left py-1">Date</th>
                                  <th className="text-left py-1">Type</th>
                                  <th className="text-left py-1">Amount</th>
                                  <th className="text-left py-1">Note</th>
                                </tr>
                              </thead>
                              <tbody>
                                {creditHistory.map((h, i) => (
                                  <tr key={i} className="border-t">
                                    <td className="py-1">{h.date}</td>
                                    <td className="py-1 capitalize"><span className={`px-2 py-0.5 rounded text-[10px] ${h.type === "grant" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{h.type}</span></td>
                                    <td className="py-1">{h.amount}</td>
                                    <td className="py-1">{h.note}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                        <div className="font-medium text-gray-800 mb-2">Purchased Lessons</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {purchasedLessons.map((pl, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-gray-600">{pl.course}</span>
                              <span className="text-gray-800">{pl.lesson}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                <div className="mt-5 flex justify-between">
                  <button onClick={()=>{ alert("Cancel membership (mock). No API call."); }} className="px-4 py-2 rounded-md border text-red-700 border-red-200 hover:bg-red-50">Cancel Membership</button>
                  <div className="flex gap-2">
                    <button onClick={()=>setUserDetailModal({ open:false, user:null })} className="px-4 py-2 rounded-md border hover:bg-gray-50">Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminPayments;


