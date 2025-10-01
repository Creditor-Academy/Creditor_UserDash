import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { FaCoins } from "react-icons/fa";
import { Trash2 } from "lucide-react";
import { useCredits } from "@/contexts/CreditsContext";
import { fetchAllConsultations, updateConsultationStatus, deleteConsultation } from '@/services/consultationService';
import { fetchAllWebsiteServices, updateWebsiteServiceStatus, deleteWebsiteService } from '@/services/websiteService';
import { fetchAllUsersAdmin } from "@/services/userService";
import { api } from "@/services/apiClient";

const AdminPayments = () => {
  const { transactions, balance, addCredits, refreshBalance, refreshMembership } = useCredits();
  
  // DEFENSIVE: Debounced refresh to prevent triggering infinite loops in other components
  const refreshBalanceRef = useRef(null);
  const debouncedRefreshBalance = useCallback(() => {
    if (refreshBalanceRef.current) {
      clearTimeout(refreshBalanceRef.current);
    }
    refreshBalanceRef.current = setTimeout(() => {
      if (refreshBalance) {
        refreshBalance();
      }
    }, 1000); // 1 second debounce to prevent cascade effects
  }, [refreshBalance]);
  
  // DEFENSIVE: Cleanup debounced refresh on unmount
  useEffect(() => {
    return () => {
      if (refreshBalanceRef.current) {
        clearTimeout(refreshBalanceRef.current);
      }
    };
  }, []);
  const [paymentsView, setPaymentsView] = useState("credits");
  const [ordersPage, setOrdersPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [subsPage, setSubsPage] = useState(1);
  const [servicesPage, setServicesPage] = useState(1); // consultations page
  const [servicesWebPage, setServicesWebPage] = useState(1); // websites page
  const [servicesTab, setServicesTab] = useState("consultations"); // "consultations" | "websites"
  const itemsPerPage = 5;
  const [serviceStatus, setServiceStatus] = useState({});
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [grantCreditsAmount, setGrantCreditsAmount] = useState(10);
  const [userDetailModal, setUserDetailModal] = useState({ open: false, user: null });
  const [grantModal, setGrantModal] = useState({ open: false });
  const [deductModal, setDeductModal] = useState({ open: false });
  const [deductCreditsAmount, setDeductCreditsAmount] = useState(10);
  const [isDeducting, setIsDeducting] = useState(false);
  const [deductMessage, setDeductMessage] = useState("");

  // Services search and filter states
  const [consultationsSearch, setConsultationsSearch] = useState("");
  const [websitesSearch, setWebsitesSearch] = useState("");
  const [consultationsFilter, setConsultationsFilter] = useState({ status: "all" });
  const [websitesFilter, setWebsitesFilter] = useState({ status: "all", websiteType: "all" });

  // Services data state
  const [consultationsData, setConsultationsData] = useState([]);
  const [websitesData, setWebsitesData] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const [deleting, setDeleting] = useState({ type: null, id: null }); // ensure single-item delete
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, id: null, message: "" });

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
  
  // Services: consultations and websites (using real data)
  const services = useMemo(() => {
    return { consultations: consultationsData, websites: websitesData };
  }, [consultationsData, websitesData]);

  // Filtered consultations with search and filter
  const filteredConsultations = useMemo(() => {
    let filtered = services.consultations;
    
    // Apply search filter
    if (consultationsSearch.trim()) {
      const searchTerm = consultationsSearch.toLowerCase();
      filtered = filtered.filter(consultation =>
        consultation.user?.toLowerCase().includes(searchTerm) ||
        consultation.topic?.toLowerCase().includes(searchTerm) ||
        consultation.id?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (consultationsFilter.status !== "all") {
      filtered = filtered.filter(consultation => 
        (serviceStatus[consultation.id] || consultation.status) === consultationsFilter.status
      );
    }
    
    return filtered;
  }, [services.consultations, consultationsSearch, consultationsFilter, serviceStatus]);

  // Filtered websites with search and filter
  const filteredWebsites = useMemo(() => {
    let filtered = services.websites;
    
    // Apply search filter
    if (websitesSearch.trim()) {
      const searchTerm = websitesSearch.toLowerCase();
      filtered = filtered.filter(website =>
        website.user?.toLowerCase().includes(searchTerm) ||
        website.product?.toLowerCase().includes(searchTerm) ||
        website.id?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (websitesFilter.status !== "all") {
      filtered = filtered.filter(website => 
        (serviceStatus[website.id] || website.status) === websitesFilter.status
      );
    }
    
    // Apply website type filter
    if (websitesFilter.websiteType !== "all") {
      filtered = filtered.filter(website => 
        website.type?.toLowerCase() === websitesFilter.websiteType
      );
    }
    
    return filtered;
  }, [services.websites, websitesSearch, websitesFilter, serviceStatus]);

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
    if (!Array.isArray(realUsers) || realUsers.length === 0) return;
    
    setLocalMembership(prev => {
      const next = { ...prev };
      let hasChanges = false;
      
      for (const u of realUsers) {
        const id = u?.id;
        if (id == null) continue;
        const membership = (u.membership || "active").toString().toLowerCase();
        if (next[id] !== membership) {
          next[id] = membership;
          hasChanges = true;
        }
      }
      
      if (next["current_user"] == null) {
        next["current_user"] = "active";
        hasChanges = true;
      }
      
      // Only return new object if there are actual changes
      return hasChanges ? next : prev;
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
  useEffect(() => { setServicesPage(1); }, [consultationsSearch, consultationsFilter]);
  useEffect(() => { setServicesWebPage(1); }, [websitesSearch, websitesFilter]);

  // Fetch services data when services tab is selected
  useEffect(() => {
    if (paymentsView === "services" && consultationsData.length === 0 && websitesData.length === 0) {
      fetchServicesData();
    }
  }, [paymentsView]);
  const remainingCredits = Math.max(credits.sold - credits.used, 0);

  // Fetch services data
  const fetchServicesData = async () => {
    setServicesLoading(true);
    setServicesError("");
    
    try {
      console.log('[AdminPayments] Fetching services data');
      
      const [consultations, websites] = await Promise.all([
        fetchAllConsultations(),
        fetchAllWebsiteServices()
      ]);
      
      console.log('[AdminPayments] Consultations data:', consultations);
      console.log('[AdminPayments] Websites data:', websites);
      console.log('[AdminPayments] Consultation data type:', typeof consultations);
      console.log('[AdminPayments] Website data type:', typeof websites);
      console.log('[AdminPayments] Consultation is array:', Array.isArray(consultations));
      console.log('[AdminPayments] Website is array:', Array.isArray(websites));
      
      // Process consultations data
      const processedConsultations = Array.isArray(consultations) ? consultations.map(consultation => ({
        id: consultation.id,
        user: consultation.user ? `${consultation.user.first_name || ''} ${consultation.user.last_name || ''}`.trim() || consultation.user.email || 'Unknown User' : 'Unknown User',
        topic: 'Consultation Session',
        scheduledAt: new Date(consultation.created_at).toLocaleDateString(),
        duration: '30 mins',
        payment: {
          amount: consultation.pricing?.credits || 1000,
          currency: 'credits',
          method: 'credits'
        },
        status: consultation.status?.toLowerCase() || 'pending'
      })) : [];
      
      // Process websites data
      const processedWebsites = Array.isArray(websites) ? websites.map(website => {
        // Determine service type and cost from pricing data
        const cost = website.pricing?.credits || 750; // Default to basic if no pricing data
        const serviceType = cost >= 5000 ? 'Premium' : 'Basic'; // Use cost to determine type
        
        return {
          id: website.id,
          user: website.user ? `${website.user.first_name || ''} ${website.user.last_name || ''}`.trim() || website.user.email || 'Unknown User' : 'Unknown User',
          product: `${serviceType} Website Service`,
          purchasedAt: new Date(website.created_at).toLocaleDateString(),
          payment: {
            amount: cost,
            currency: 'credits',
            method: 'credits'
          },
          status: website.status?.toLowerCase() || 'pending',
          type: serviceType.toLowerCase()
        };
      }) : [];
      
      setConsultationsData(processedConsultations);
      setWebsitesData(processedWebsites);
      
    } catch (error) {
      console.error('[AdminPayments] Failed to fetch services data:', error);
      setServicesError('Failed to load services data');
    } finally {
      setServicesLoading(false);
    }
  };

  // Handle consultation status update
  const handleConsultationStatusUpdate = async (consultationId, newStatus) => {
    try {
      console.log('[AdminPayments] Updating consultation status:', consultationId, 'to', newStatus);
      
      await updateConsultationStatus(consultationId, newStatus.toUpperCase());
      
      // Update local state
      setConsultationsData(prev => 
        prev.map(consultation => 
          consultation.id === consultationId 
            ? { ...consultation, status: newStatus.toLowerCase() }
            : consultation
        )
      );
      
      console.log('[AdminPayments] Consultation status updated successfully');
    } catch (error) {
      console.error('[AdminPayments] Failed to update consultation status:', error);
      console.error('[AdminPayments] Error details:', error?.response?.data);
      console.error('[AdminPayments] Error status:', error?.response?.status);
      alert(`Failed to update consultation status: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    }
  };

  // Handle website service status update
  const handleWebsiteStatusUpdate = async (serviceId, newStatus) => {
    try {
      console.log('[AdminPayments] Updating website service status:', serviceId, 'to', newStatus);
      
      await updateWebsiteServiceStatus(serviceId, newStatus.toUpperCase());
      
      // Update local state
      setWebsitesData(prev => 
        prev.map(website => 
          website.id === serviceId 
            ? { ...website, status: newStatus.toLowerCase() }
            : website
        )
      );
      
      console.log('[AdminPayments] Website service status updated successfully');
    } catch (error) {
      console.error('[AdminPayments] Failed to update website service status:', error);
      console.error('[AdminPayments] Error details:', error?.response?.data);
      console.error('[AdminPayments] Error status:', error?.response?.status);
      alert(`Failed to update website service status: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    }
  };

  // Delete a single consultation (admin)
  const handleDeleteConsultation = async (consultationId) => {
    if (!consultationId || deleting.id) return;
    try {
      setDeleting({ type: 'consultation', id: consultationId });
      await deleteConsultation(consultationId);
      // Update local state to remove the deleted item
      setConsultationsData((prev) => prev.filter((c) => c.id !== consultationId));
    } catch (error) {
      console.error('[AdminPayments] Failed to delete consultation:', error);
      alert(`Failed to delete consultation: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    } finally {
      setDeleting({ type: null, id: null });
    }
  };

  // Delete a single website service (admin)
  const handleDeleteWebsite = async (serviceId) => {
    if (!serviceId || deleting.id) return;
    try {
      setDeleting({ type: 'website', id: serviceId });
      await deleteWebsiteService(serviceId);
      // Update local state to remove the deleted item
      setWebsitesData((prev) => prev.filter((w) => w.id !== serviceId));
    } catch (error) {
      console.error('[AdminPayments] Failed to delete website service:', error);
      alert(`Failed to delete website service: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    } finally {
      setDeleting({ type: null, id: null });
    }
  };

  // Open confirmation modal
  const requestDelete = (type, id) => {
    if (!id || deleting.id) return;
    const message = type === 'consultation'
      ? 'Delete this consultation record? This cannot be undone.'
      : 'Delete this website service record? This cannot be undone.';
    setConfirmDialog({ open: true, type, id, message });
  };

  // Confirm and perform deletion
  const confirmDeletion = async () => {
    const { type, id } = confirmDialog;
    setConfirmDialog({ open: false, type: null, id: null, message: "" });
    if (type === 'consultation') {
      await handleDeleteConsultation(id);
    } else if (type === 'website') {
      await handleDeleteWebsite(id);
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Payments & Subscriptions</h2>
            <p className="text-gray-600">Dummy data preview for admin payments dashboard.</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setPaymentsView("credits")} className={`px-3 py-1.5 text-sm rounded-md ${paymentsView === "credits" ? "bg-white shadow-sm text-gray-900" : "text-gray-700 hover:text-gray-900"}`}>Credits</button>
            <button onClick={() => setPaymentsView("services")} className={`px-3 py-1.5 text-sm rounded-md ${paymentsView === "services" ? "bg-white shadow-sm text-gray-900" : "text-gray-700 hover:text-gray-900"}`}>Services</button>
            <button onClick={() => setPaymentsView("orders")} className={`px-3 py-1.5 text-sm rounded-md ${paymentsView === "orders" ? "bg-white shadow-sm text-gray-900" : "text-gray-700 hover:text-gray-900"}`}>Orders</button>
            <button onClick={() => setPaymentsView("payments")} className={`px-3 py-1.5 text-sm rounded-md ${paymentsView === "payments" ? "bg-white shadow-sm text-gray-900" : "text-gray-700 hover:text-gray-900"}`}>Payments</button>
            <button onClick={() => setPaymentsView("subscriptions")} className={`px-3 py-1.5 text-sm rounded-md ${paymentsView === "subscriptions" ? "bg-white shadow-sm text-gray-900" : "text-gray-700 hover:text-gray-900"}`}>Subscriptions</button>
          </div>
        </div>
      </div>

      {false && (
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
      )}

      {paymentsView === "services" && (
        <div className="space-y-8">
          {/* Services Header with Tabs */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Services</h3>
                  <span className="text-sm text-blue-600 font-medium">Manage consultations and website services</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setServicesTab("consultations")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    servicesTab === "consultations"
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Consultations
                </button>
                <button
                  onClick={() => setServicesTab("websites")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    servicesTab === "websites"
                      ? "bg-green-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Websites
                </button>
              </div>
            </div>
          </div>
          
          {/* Consultations Tab */}
          {servicesTab === "consultations" && (
            <>
              {/* Enhanced Search and Filter Controls */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={consultationsSearch}
                        onChange={(e) => setConsultationsSearch(e.target.value)}
                        placeholder="Search by user, topic, or ID..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={consultationsFilter.status}
                      onChange={(e) => setConsultationsFilter(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {filteredConsultations.length} consultation{filteredConsultations.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {(consultationsSearch || consultationsFilter.status !== "all") && (
                    <button
                      onClick={() => {
                        setConsultationsSearch("");
                        setConsultationsFilter({ status: "all" });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold">ID</th>
                      <th className="text-left px-6 py-4 font-semibold">User</th>
                      <th className="text-left px-6 py-4 font-semibold">Topic</th>
                      <th className="text-left px-6 py-4 font-semibold">Booked</th>
                      <th className="text-left px-6 py-4 font-semibold">Duration</th>
                      <th className="text-left px-6 py-4 font-semibold">Payment</th>
                      <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-left px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicesLoading ? (
                      <tr>
                    <td colSpan="8" className="px-3 py-8 text-center text-gray-500">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                            Loading consultations...
                          </div>
                        </td>
                      </tr>
                    ) : servicesError ? (
                      <tr>
                    <td colSpan="8" className="px-3 py-8 text-center text-gray-500">
                          <div className="text-red-600 mb-2">{servicesError}</div>
                          <button 
                            onClick={fetchServicesData}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Try again
                          </button>
                        </td>
                      </tr>
                    ) : filteredConsultations.length === 0 ? (
                      <tr>
                    <td colSpan="8" className="px-3 py-8 text-center text-gray-500">
                          {services.consultations.length === 0 
                            ? "No consultations available" 
                            : "No consultations match your search criteria"
                          }
                        </td>
                      </tr>
                    ) : (
                      filteredConsultations.slice((servicesPage-1)*itemsPerPage, servicesPage*itemsPerPage).map(c => {
                      const status = (serviceStatus[c.id] || c.status || 'pending');
                      const statusColors = {
                        pending: 'bg-amber-100 text-amber-800 border-amber-200',
                        in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
                        completed: 'bg-green-100 text-green-800 border-green-200'
                      };
                      return (
                        <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-gray-600 bg-gray-50">{c.id}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{c.user}</td>
                          <td className="px-6 py-4 text-gray-700">{c.topic}</td>
                          <td className="px-6 py-4 text-gray-600">{c.scheduledAt}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              {c.duration}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-gray-900">{c.payment.amount}</span>
                              <span className="text-gray-600">{c.payment.currency}</span>
                              <span className="text-xs text-gray-400">({c.payment.method})</span>
                            </div>
                          </td>
                      <td className="px-6 py-4">
                            <select
                              value={status}
                              onChange={(e)=>{ const v=e.target.value; handleConsultationStatusUpdate(c.id, v); }}
                              className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                            >
                              <option value="pending">pending</option>
                              <option value="in_progress">in progress</option>
                              <option value="completed">completed</option>
                            </select>
                          </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => requestDelete('consultation', c.id)}
                          disabled={deleting.id === c.id}
                          aria-label="Delete consultation"
                          title="Delete"
                          className={`p-2 rounded-full border transition-colors ${deleting.id === c.id ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                        </tr>
                      );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Page {servicesPage} of {Math.max(Math.ceil(filteredConsultations.length / itemsPerPage), 1)}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={servicesPage===1} 
                    onClick={() => setServicesPage(p => Math.max(p-1,1))} 
                    className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                      servicesPage===1 
                        ? "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed" 
                        : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    Previous
                  </button>
                  <button 
                    disabled={servicesPage >= Math.ceil(filteredConsultations.length/itemsPerPage)} 
                    onClick={() => setServicesPage(p => Math.min(p+1, Math.ceil(filteredConsultations.length/itemsPerPage)))} 
                    className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                      servicesPage >= Math.ceil(filteredConsultations.length/itemsPerPage)
                        ? "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed" 
                        : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Websites Tab */}
          {servicesTab === "websites" && (
            <>
          
          {/* Enhanced Websites Search and Filter Controls */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={websitesSearch}
                    onChange={(e) => setWebsitesSearch(e.target.value)}
                    placeholder="Search by user, product, or ID..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={websitesFilter.status}
                  onChange={(e) => setWebsitesFilter(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Website Type</label>
                <select
                  value={websitesFilter.websiteType}
                  onChange={(e) => setWebsitesFilter(prev => ({ ...prev, websiteType: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="all">All Types</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {filteredWebsites.length} website{filteredWebsites.length !== 1 ? 's' : ''}
                </span>
              </div>
              {(websitesSearch || websitesFilter.status !== "all" || websitesFilter.websiteType !== "all") && (
                <button
                  onClick={() => {
                    setWebsitesSearch("");
                    setWebsitesFilter({ status: "all", websiteType: "all" });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">ID</th>
                  <th className="text-left px-6 py-4 font-semibold">User</th>
                  <th className="text-left px-6 py-4 font-semibold">Website</th>
                  <th className="text-left px-6 py-4 font-semibold">Purchased</th>
                  <th className="text-left px-6 py-4 font-semibold">Payment</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-left px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {servicesLoading ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Loading websites...
                      </div>
                    </td>
                  </tr>
                ) : servicesError ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-8 text-center text-gray-500">
                      <div className="text-red-600 mb-2">{servicesError}</div>
                      <button 
                        onClick={fetchServicesData}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Try again
                      </button>
                    </td>
                  </tr>
                ) : filteredWebsites.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-8 text-center text-gray-500">
                      {services.websites.length === 0 
                        ? "No websites available" 
                        : "No websites match your search criteria"
                      }
                    </td>
                  </tr>
                ) : (
                  filteredWebsites.slice((servicesWebPage-1)*itemsPerPage, servicesWebPage*itemsPerPage).map(w => {
                  const status = (serviceStatus[w.id] || w.status || 'pending');
                  const statusColors = {
                    pending: 'bg-amber-100 text-amber-800 border-amber-200',
                    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
                    completed: 'bg-green-100 text-green-800 border-green-200'
                  };
                  const websiteTypeColors = {
                    basic: 'bg-blue-100 text-blue-800',
                    premium: 'bg-purple-100 text-purple-800'
                  };
                  return (
                    <tr key={w.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-600 bg-gray-50">{w.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{w.user}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">{w.product}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${websiteTypeColors[w.type] || 'bg-gray-100 text-gray-800'}`}>
                            {w.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{w.purchasedAt}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-gray-900">{w.payment.amount}</span>
                          <span className="text-gray-600">{w.payment.currency}</span>
                          <span className="text-xs text-gray-400">({w.payment.method})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={status}
                          onChange={(e)=>{ const v=e.target.value; handleWebsiteStatusUpdate(w.id, v); }}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                        >
                          <option value="pending">pending</option>
                          <option value="in_progress">in progress</option>
                          <option value="completed">completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => requestDelete('website', w.id)}
                          disabled={deleting.id === w.id}
                          aria-label="Delete website service"
                          title="Delete"
                          className={`p-2 rounded-full border transition-colors ${deleting.id === w.id ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page {servicesWebPage} of {Math.max(Math.ceil(filteredWebsites.length / itemsPerPage), 1)}</span>
            </div>
            <div className="flex gap-2">
              <button 
                disabled={servicesWebPage===1} 
                onClick={() => setServicesWebPage(p => Math.max(p-1,1))} 
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                  servicesWebPage===1 
                    ? "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed" 
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                Previous
              </button>
              <button 
                disabled={servicesWebPage >= Math.ceil(filteredWebsites.length/itemsPerPage)} 
                onClick={() => setServicesWebPage(p => Math.min(p+1, Math.ceil(filteredWebsites.length/itemsPerPage)))} 
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                  servicesWebPage >= Math.ceil(filteredWebsites.length/itemsPerPage)
                    ? "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed" 
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                Next
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      )}

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

      {/* Confirmation Modal */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDialog({ open: false, type: null, id: null, message: "" })} />
          <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm mx-4 p-5">
            <div className="mb-3">
              <h4 className="text-lg font-semibold text-gray-900">Confirm deletion</h4>
              <p className="text-sm text-gray-600 mt-1">{confirmDialog.message}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConfirmDialog({ open: false, type: null, id: null, message: "" })}
                className="px-4 py-2 rounded-lg border text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletion}
                className="px-4 py-2 rounded-lg border bg-red-600 text-white hover:bg-red-700 border-red-600"
              >
                Delete
              </button>
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
              <div className="flex gap-2">
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
                <button
                  disabled={selectedUserIds.length !== 1}
                  onClick={() => { 
                    if (selectedUserIds.length === 0) { 
                      alert('Please select one user to deduct credits from.'); 
                      return; 
                    } 
                    if (selectedUserIds.length > 1) { 
                      alert('Please select only one user to deduct credits from.'); 
                      return; 
                    } 
                    setDeductModal({ open: true }); 
                  }}
                  className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors ${
                    selectedUserIds.length !== 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  <FaCoins /> Deduct credits{selectedUserIds.length === 1 ? " (1)" : ""}
                </button>
              </div>
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
                      try { debouncedRefreshBalance(); } catch {}
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

          {deductModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30" onClick={()=>setDeductModal({ open:false })} />
              <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Deduct Credits</h4>
                <p className="text-sm text-gray-600 mb-4">Selected user: {selectedUserIds.length === 1 ? realUsers.find(u => u.id === selectedUserIds[0])?.name || 'Unknown' : 'None'}</p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits to Deduct</label>
                <input value={deductCreditsAmount} onChange={(e)=>setDeductCreditsAmount(parseInt(e.target.value||"0",10))} type="number" min="1" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 mb-4" />
                {deductMessage && (
                  <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{deductMessage}</div>
                )}
                <div className="flex justify-end gap-2">
                  <button onClick={()=>{ if (!isDeducting) setDeductModal({ open:false }); }} className="px-4 py-2 rounded-md border hover:bg-gray-50" disabled={isDeducting}>Cancel</button>
                  <button onClick={async ()=>{ 
                    if (isDeducting) return; 
                    try {
                      setDeductMessage("");
                      setIsDeducting(true);
                      // Call backend to deduct credits
                      await api.post('/payment-order/admin/credits/deduct', { userId: selectedUserIds[0], credits: deductCreditsAmount }, { withCredentials: true });
                      // Reflect change locally
                      setRealUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, credits: Math.max(0, (Number(u.credits)||0) - (Number(deductCreditsAmount)||0)) } : u));
                      try { debouncedRefreshBalance(); } catch {}
                      setDeductMessage(`Deducted ${deductCreditsAmount} credits from user.`);
                      // Optionally clear selection
                      setSelectedUserIds([]);
                      // Close after brief delay
                      setTimeout(()=>{ setDeductModal({ open:false }); setDeductMessage(""); }, 800);
                    } catch (e) {
                      alert('Failed to deduct credits.');
                    } finally {
                      setIsDeducting(false);
                    }
                  }} className={`px-4 py-2 rounded-md text-white ${isDeducting? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>{isDeducting? 'Deducting…' : 'Deduct'}</button>
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



