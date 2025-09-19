import React, { useEffect, useMemo, useState } from "react";
import { useCredits } from "@/contexts/CreditsContext";
import { useUser } from "@/contexts/UserContext";
import api from "@/services/apiClient";

// Design-only modal for managing credits
// Props: open, onClose, balance (optional external), onBalanceChange(newBalance) (optional)
const CreditPurchaseModal = ({ open = false, onClose = () => {}, balance: externalBalance, onBalanceChange }) => {
  const { transactions, addCredits, balance: contextBalance, refreshBalance, membership: contextMembership, refreshMembership } = useCredits();
  const { userProfile } = useUser();
  const [unlockHistory, setUnlockHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [balance, setBalance] = useState(typeof externalBalance === 'number' ? externalBalance : contextBalance);
  const [quantity, setQuantity] = useState(10);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [packType, setPackType] = useState("pack50"); // pack50 | pack100 | pack500 | pack2800
  const [paymentMethod, setPaymentMethod] = useState("stripe"); // kept for compatibility, not used
  const [customQty, setCustomQty] = useState(""); // retained for compatibility
  const [checkoutStep, setCheckoutStep] = useState("packs"); // only 'packs'
  const [membership, setMembership] = useState(contextMembership);
  const [viewTab, setViewTab] = useState("overview"); // overview | history | usage
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", confirmText: "Confirm", cancelText: "Cancel", onConfirm: null });
  const [notice, setNotice] = useState("");

  // Sync internal balance if external changes
  useEffect(() => {
    if (typeof externalBalance === 'number') {
      setBalance(externalBalance);
    }
  }, [externalBalance]);

  // Sync with context balance when it changes
  useEffect(() => {
    if (typeof externalBalance !== 'number') {
      setBalance(contextBalance);
    }
  }, [contextBalance, externalBalance]);

  // Sync with context membership when it changes
  useEffect(() => {
    setMembership(contextMembership);
  }, [contextMembership]);

  // Get real purchase history from transactions
  const history = useMemo(() => {
    return transactions
      .filter(t => t.type === 'purchase')
      .map(t => ({
        id: `ord_${t.id}`,
        date: new Date(t.timestamp).toISOString().slice(0, 10),
        credits: t.amount,
        amount: t.amount,
        currency: "CR"
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  // Fetch unlock history from backend
  const fetchUnlockHistory = async () => {
    if (!userProfile?.id) return;
    
    setLoadingHistory(true);
    try {
      console.log(`[CreditModal] Fetching usage history for user ${userProfile.id}`);
      const response = await api.get(`/payment-order/credits/usages/${userProfile.id}`, { 
        withCredentials: true
      });
      
      console.log(`[CreditModal] Usage history response:`, response?.data);
      
      const historyData = response?.data?.data || response?.data || [];
      setUnlockHistory(historyData);
    } catch (error) {
      console.error('[CreditModal] Failed to fetch usage history:', error);
      setUnlockHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Get real usage data from backend unlock history
  const usages = useMemo(() => {
    return unlockHistory.map(unlock => ({
      date: new Date(unlock.used_at).toISOString().slice(0, 10),
      type: unlock.unlock_type === 'CATALOG' ? 'Catalog Purchase' : 
            unlock.unlock_type === 'LESSON' ? 'Lesson Purchase' : 
            unlock.unlock_type || 'Unlock',
      ref: unlock.unlock_id || 'Unknown',
      credits: unlock.credits_spent || 0
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [unlockHistory]);

  const canPurchase = useMemo(() => quantity > 0 && !isPurchasing, [quantity, isPurchasing]);
  // New rate: 5 credits per $1 (no bonus credits)
  const CREDIT_RATE = 5;
  const derived = useMemo(() => {
    if (packType === "pack50") return { credits: 250, price: 50 };
    if (packType === "pack100") return { credits: 500, price: 100 };
    if (packType === "pack500") return { credits: 500 * CREDIT_RATE, price: 500 };
    if (packType === "pack2800") return { credits: 2800 * CREDIT_RATE, price: 2800 };
    return { credits: 0, price: 0 };
  }, [packType]);

  const formatNumber = (val) =>
    typeof val === 'number' ? val.toLocaleString(undefined) : String(val);

  const handlePurchase = (e) => {
    e.preventDefault();
    if (!membership.isActive) {
      setConfirmModal({
        open: true,
        title: "Membership required",
        message: "You need an active membership to buy credits.",
        confirmText: "Buy membership",
        cancelText: "Close",
        onConfirm: () => setConfirmModal(m => ({ ...m, open: false }))
      });
      return;
    }
    // reset checkout flow each time
    setPackType("pack50");
    setCustomQty("");
    setPaymentMethod("stripe");
    setCheckoutStep("packs");
    setCheckoutOpen(true);
  };

  const confirmCheckout = () => {
    const creditsBought = derived.credits;
    const amount = derived.price;
    if (!creditsBought || creditsBought <= 0) return;
    setIsPurchasing(true);
    setTimeout(() => {
      setBalance((b) => {
        const updated = b + creditsBought;
        if (typeof onBalanceChange === 'function') {
          try { onBalanceChange(updated, { added: creditsBought }); } catch {}
        }
        return updated;
      });
      // History is now automatically updated via transactions context
      setIsPurchasing(false);
      setCheckoutOpen(false);
      setViewTab('overview');
      setNotice(`Added ${creditsBought} credits to your balance`);
      setTimeout(() => setNotice(""), 3000);
    }, 600);
  };

  const handleClose = () => {
    setCheckoutOpen(false);
    setIsPurchasing(false);
    setPackType("pack500");
    setPaymentMethod("stripe");
    setCustomQty(10);
    onClose();
  };
  
  useEffect(() => {
    if (!open) return;
    console.log('[CreditModal] Modal opened, refreshing data...');
    try { 
      refreshBalance && refreshBalance(); 
      refreshMembership && refreshMembership();
      fetchUnlockHistory();
    } catch {}
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, userProfile?.id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-3xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Manage Credits</h3>
          <div className="flex gap-2">
            <button onClick={handleClose} className="px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm">Close</button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {notice && (
            <div className="rounded-md bg-green-50 border border-green-200 text-green-800 px-4 py-2 text-sm">{notice}</div>
          )}
          {/* Top navigation inside modal */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
            <button onClick={()=>setViewTab("overview")} className={`px-3 py-1.5 text-sm rounded-md ${viewTab==='overview'?'bg-white shadow-sm text-gray-900':'text-gray-700 hover:text-gray-900'}`}>Overview</button>
            <button onClick={()=>setViewTab("usage")} className={`px-3 py-1.5 text-sm rounded-md ${viewTab==='usage'?'bg-white shadow-sm text-gray-900':'text-gray-700 hover:text-gray-900'}`}>Usage</button>
          </div>

          {/* Overview */}
          {viewTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Current Balance</div>
              <div className="text-3xl font-bold text-gray-900">{balance}</div>
              <div className="text-xs text-gray-500 mt-1">credits available</div>
               <div className="mt-3 text-xs">
                 <span className={`px-2 py-1 rounded ${membership.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{membership.isActive ? 'Membership active' : 'Membership inactive'}</span>
               </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="font-semibold text-gray-900 mb-1 text-lg">Purchase Credits</div>
                <div className="text-sm text-gray-600 mb-4">Pick a pack or use custom amount in the next step.</div>
              </div>
              {membership.isActive ? (
                <div className="space-y-3">
                  <form onSubmit={handlePurchase} className="flex items-center gap-3 flex-wrap">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-md font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Buy credits
                    </button>
                    <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
                      <span className="px-2 py-1 rounded border">2,500 credits for $500</span>
                      <span className="px-2 py-1 rounded border">14,000 credits for $2,800</span>
                    </div>
                  </form>
                  
                  
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      window.location.href = "https://quickclick.com/r/m7o5skh90z5o7s6x6bg9yeklf7ql3f";
                    }}
                    className="px-5 py-2.5 rounded-md font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Buy membership ($69)
                  </button>
                  <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
                    <span className="px-2 py-1 rounded border">Membership unlocks credits</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* History */}
          {viewTab === 'history' && (
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-800">Purchase History</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-gray-700">
                    <tr>
                      <th className="text-left py-1 pr-2">Date</th>
                      <th className="text-left py-1 pr-2">Order</th>
                      <th className="text-left py-1 pr-2">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr><td className="py-2 text-gray-500" colSpan="3">No purchases yet</td></tr>
                    ) : (
                      history.map((h) => (
                        <tr key={h.id} className="border-t">
                          <td className="py-1 pr-2">{h.date}</td>
                          <td className="py-1 pr-2">{h.id}</td>
                          <td className="py-1 pr-2 font-medium">+{h.credits}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}

          {/* Usage */}
          {viewTab === 'usage' && (
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-800">Credit Usage</div>
                {loadingHistory && (
                  <div className="text-xs text-gray-500">Loading...</div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-gray-700">
                    <tr>
                      <th className="text-left py-1 pr-2">Date</th>
                      <th className="text-left py-1 pr-2">Type</th>
                      <th className="text-left py-1 pr-2">Reference</th>
                      <th className="text-left py-1 pr-2">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingHistory ? (
                      <tr><td className="py-4 text-gray-500 text-center" colSpan="4">Loading usage history...</td></tr>
                    ) : usages.length === 0 ? (
                      <tr><td className="py-4 text-gray-500 text-center" colSpan="4">No credit usage yet</td></tr>
                    ) : (
                      usages.map((u, i) => (
                        <tr key={i} className="border-t hover:bg-gray-50">
                          <td className="py-2 pr-2">{u.date}</td>
                          <td className="py-2 pr-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              u.type === 'Catalog Purchase' ? 'bg-purple-100 text-purple-800' :
                              u.type === 'Lesson Purchase' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {u.type}
                            </span>
                          </td>
                          <td className="py-2 pr-2 font-medium">{u.ref}</td>
                          <td className="py-2 pr-2 font-medium text-red-600">-{u.credits}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {checkoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-3xl p-3">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Checkout</h4>
              <button aria-label="Close" onClick={()=>setCheckoutOpen(false)} className="px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm">Close</button>
            </div>
            <div className="space-y-4">
              {checkoutStep === "packs" && (
                <>
                  <div>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Choose Your Credit Pack</h3>
                      <p className="text-sm text-gray-600">Select the amount of credits you'd like to purchase</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* $50 Pack */}
                      <label className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                        packType === "pack50" 
                          ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg" 
                          : "hover:shadow-md hover:scale-[1.02]"
                      }`}>
                        <input 
                          type="radio" 
                          name="pack" 
                          className="sr-only" 
                          checked={packType === "pack50"} 
                          onChange={()=>setPackType("pack50")} 
                        />
                        <div className={`relative p-3 ${packType === "pack50" ? "bg-gradient-to-br from-blue-50 to-blue-100" : "bg-white border border-gray-200"}`}>
                          <div className="text-center">
                            <div className={`relative w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center shadow-sm ${
                              packType === "pack50" 
                                ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                                : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-blue-200"
                            }`}>
                              <span className={`font-bold text-xs ${
                                packType === "pack50" ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                              }`}>$50</span>
                            </div>
                            <h3 className={`font-bold text-base mb-1 ${
                              packType === "pack50" ? "text-blue-900" : "text-gray-900"
                            }`}>250 Credits</h3>
                            <p className={`text-xs mb-2 ${
                              packType === "pack50" ? "text-blue-700" : "text-gray-500"
                            }`}>Perfect for trying out</p>
                            <div className={`text-lg font-bold ${
                              packType === "pack50" ? "text-blue-900" : "text-gray-900"
                            }`}>$50</div>
                            {packType === "pack50" && (
                              <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </label>

                      {/* $100 Pack */}
                      <label className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                        packType === "pack100" 
                          ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg" 
                          : "hover:shadow-md hover:scale-[1.02]"
                      }`}>
                        <input 
                          type="radio" 
                          name="pack" 
                          className="sr-only" 
                          checked={packType === "pack100"} 
                          onChange={()=>setPackType("pack100")} 
                        />
                        <div className={`relative p-3 ${packType === "pack100" ? "bg-gradient-to-br from-blue-50 to-blue-100" : "bg-white border border-gray-200"}`}>
                          <div className="text-center">
                            <div className={`relative w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center shadow-sm ${
                              packType === "pack100" 
                                ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                                : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-blue-200"
                            }`}>
                              <span className={`font-bold text-xs ${
                                packType === "pack100" ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                              }`}>$100</span>
                            </div>
                            <h3 className={`font-bold text-base mb-1 ${
                              packType === "pack100" ? "text-blue-900" : "text-gray-900"
                            }`}>500 Credits</h3>
                            <p className={`text-xs mb-2 ${
                              packType === "pack100" ? "text-blue-700" : "text-gray-500"
                            }`}>Great for regular use</p>
                            <div className={`text-lg font-bold ${
                              packType === "pack100" ? "text-blue-900" : "text-gray-900"
                            }`}>$100</div>
                            {packType === "pack100" && (
                              <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </label>

                      {/* $500 Pack */}
                      <label className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                        packType === "pack500" 
                          ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg" 
                          : "hover:shadow-md hover:scale-[1.02]"
                      }`}>
                        <input 
                          type="radio" 
                          name="pack" 
                          className="sr-only" 
                          checked={packType === "pack500"} 
                          onChange={()=>setPackType("pack500")} 
                        />
                        <div className={`relative p-3 ${packType === "pack500" ? "bg-gradient-to-br from-blue-50 to-blue-100" : "bg-white border border-gray-200"}`}>
                        <div className="text-center">
                            <div className={`relative w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center shadow-sm ${
                              packType === "pack500" 
                                ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                                : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-blue-200"
                            }`}>
                              <span className={`font-bold text-xs ${
                                packType === "pack500" ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                              }`}>$500</span>
                          </div>
                            <h3 className={`font-bold text-base mb-1 ${
                              packType === "pack500" ? "text-blue-900" : "text-gray-900"
                            }`}>2,500 Credits</h3>
                            <p className={`text-xs mb-2 ${
                              packType === "pack500" ? "text-blue-700" : "text-gray-500"
                            }`}>For serious learners</p>
                            <div className={`text-lg font-bold ${
                              packType === "pack500" ? "text-blue-900" : "text-gray-900"
                            }`}>$500</div>
                          {packType === "pack500" && (
                              <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                          )}
                          </div>
                        </div>
                      </label>

                      {/* $2,800 Pack */}
                      <label className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                        packType === "pack2800" 
                          ? "ring-2 ring-emerald-500 ring-offset-2 shadow-lg" 
                          : "hover:shadow-md hover:scale-[1.02]"
                      }`}>
                        <input 
                          type="radio" 
                          name="pack" 
                          className="sr-only" 
                          checked={packType === "pack2800"} 
                          onChange={()=>setPackType("pack2800")} 
                        />
                        <div className={`relative p-3 ${packType === "pack2800" ? "bg-gradient-to-br from-emerald-50 to-emerald-100" : "bg-white border border-gray-200"}`}>
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-sm">
                              ⭐ BEST VALUE
                            </span>
                          </div>
                        <div className="text-center">
                            <div className={`relative w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center shadow-sm ${
                              packType === "pack2800" 
                                ? "bg-gradient-to-br from-emerald-500 to-emerald-600" 
                                : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-emerald-100 group-hover:to-emerald-200"
                            }`}>
                              <span className={`font-bold text-xs ${
                                packType === "pack2800" ? "text-white" : "text-gray-600 group-hover:text-emerald-600"
                              }`}>$2.8K</span>
                          </div>
                            <h3 className={`font-bold text-base mb-1 ${
                              packType === "pack2800" ? "text-emerald-900" : "text-gray-900"
                            }`}>14,000 Credits</h3>
                            <p className={`text-xs mb-2 ${
                              packType === "pack2800" ? "text-emerald-700" : "text-gray-500"
                            }`}>Maximum value & savings</p>
                            <div className={`text-lg font-bold ${
                              packType === "pack2800" ? "text-emerald-900" : "text-gray-900"
                            }`}>$2,800</div>
                          {packType === "pack2800" && (
                              <div className="absolute top-2 left-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                          )}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Selected credits</div>
                        <div className="text-3xl font-bold text-gray-900">{formatNumber(derived.credits)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total due</div>
                        <div className="text-lg font-semibold text-gray-700">${derived.price}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={()=>setCheckoutOpen(false)} 
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          const link50 = "https://quickclick.com/r/fi2mzpe8cnq0k90yz6ljw1d12x7pw6";
                          const link100 = "https://quickclick.com/r/ysml6zlwfwmfluvaep3mxkq7xj8ste";
                          const link500 = "https://quickclick.com/r/o0h2bwvcumvpwgot6qxsm6moukluyn";
                          const link2800 = "https://quickclick.com/r/06k6zonz2prrxt1pqknxgwgi2jsbtr";
                          
                          let target;
                          if (packType === 'pack50') target = link50;
                          else if (packType === 'pack100') target = link100;
                          else if (packType === 'pack500') target = link500;
                          else if (packType === 'pack2800') target = link2800;
                          else target = link50; // fallback
                          
                          window.location.href = target;
                        }} 
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg`}
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmModal.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md p-6">
            <div className="mb-2">
              <h4 className="text-lg font-semibold text-gray-900">{confirmModal.title}</h4>
            </div>
            <div className="text-sm text-gray-700 mb-4">{confirmModal.message}</div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setConfirmModal(m=>({ ...m, open:false }))} className="px-4 py-2 rounded-md border hover:bg-gray-50">{confirmModal.cancelText || 'Cancel'}</button>
              <button onClick={()=>{ if (typeof confirmModal.onConfirm === 'function') confirmModal.onConfirm(); else setConfirmModal(m=>({ ...m, open:false })); }} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white">{confirmModal.confirmText || 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditPurchaseModal;


