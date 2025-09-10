import React, { useEffect, useMemo, useState } from "react";
import { useCredits } from "@/contexts/CreditsContext";

// Design-only modal for managing credits
// Props: open, onClose, balance (optional external), onBalanceChange(newBalance) (optional)
const CreditPurchaseModal = ({ open = false, onClose = () => {}, balance: externalBalance, onBalanceChange }) => {
  const { transactions } = useCredits();
  const [balance, setBalance] = useState(typeof externalBalance === 'number' ? externalBalance : 35);
  const [quantity, setQuantity] = useState(10);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [packType, setPackType] = useState("pack500"); // pack500 | pack800 | custom
  const [paymentMethod, setPaymentMethod] = useState("stripe"); // stripe | westcoast | paypal
  const [customQty, setCustomQty] = useState("");
  const [checkoutStep, setCheckoutStep] = useState("packs"); // packs | payment
  const [membership, setMembership] = useState({ status: "active", nextBilling: "2025-10-01" });
  const [viewTab, setViewTab] = useState("overview"); // overview | history | usage
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", confirmText: "Confirm", cancelText: "Cancel", onConfirm: null });
  const [notice, setNotice] = useState("");

  // Sync internal balance if external changes
  useEffect(() => {
    if (typeof externalBalance === 'number') {
      setBalance(externalBalance);
    }
  }, [externalBalance]);

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

  // Get real usage data from transactions
  const usages = useMemo(() => {
    return transactions
      .filter(t => t.type === 'spend')
      .map(t => ({
        date: new Date(t.timestamp).toISOString().slice(0, 10),
        type: t.metadata?.type || 'Spend',
        ref: t.metadata?.moduleTitle || t.metadata?.courseTitle || 'Unknown',
        credits: t.amount
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  const canPurchase = useMemo(() => quantity > 0 && !isPurchasing, [quantity, isPurchasing]);
  const derived = useMemo(() => {
    if (packType === "pack500") return { credits: 500, price: 500 };
    if (packType === "pack800") return { credits: 800, price: 800 };
    const qty = Number.isFinite(customQty) ? Math.max(customQty || 0, 0) : 0;
    return { credits: qty, price: qty };
  }, [packType, customQty]);

  const handlePurchase = (e) => {
    e.preventDefault();
    if (membership.status !== "active") {
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
    setPackType("pack500");
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
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-3xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Manage Credits</h3>
          <button onClick={handleClose} className="px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm">Close</button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {notice && (
            <div className="rounded-md bg-green-50 border border-green-200 text-green-800 px-4 py-2 text-sm">{notice}</div>
          )}
          {/* Top navigation inside modal */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
            <button onClick={()=>setViewTab("overview")} className={`px-3 py-1.5 text-sm rounded-md ${viewTab==='overview'?'bg-white shadow-sm text-gray-900':'text-gray-700 hover:text-gray-900'}`}>Overview</button>
            <button onClick={()=>setViewTab("history")} className={`px-3 py-1.5 text-sm rounded-md ${viewTab==='history'?'bg-white shadow-sm text-gray-900':'text-gray-700 hover:text-gray-900'}`}>History</button>
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
                <span className={`px-2 py-1 rounded ${membership.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{membership.status === 'active' ? 'Membership active' : 'Membership inactive'}</span>
                {membership.status === 'active' && (
                  <div className="mt-1 text-gray-500">Next billing: <span className="font-medium text-gray-800">{membership.nextBilling}</span></div>
                )}
              </div>
              {membership.status === 'active' && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmModal({ open:true, title: 'Cancel membership', message: 'Are you sure you want to cancel your membership?', confirmText: 'Cancel membership', cancelText: 'Keep membership', onConfirm: () => { setMembership(m => ({ ...m, status: 'inactive' })); setConfirmModal(cm=>({ ...cm, open:false })); } })}
                    className="px-3 py-1.5 rounded-md text-xs bg-red-600 hover:bg-red-700 text-white"
                  >
                    Cancel membership
                  </button>
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-600">Preview:</span>
                <button
                  type="button"
                  onClick={() => setMembership(m => ({ ...m, status: m.status === 'active' ? 'inactive' : 'active' }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${membership.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}
                  aria-label="Toggle membership preview"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${membership.status === 'active' ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
                <span className="text-xs text-gray-700">{membership.status === 'active' ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="font-semibold text-gray-900 mb-1 text-lg">Purchase Credits</div>
                <div className="text-sm text-gray-600 mb-4">Pick a pack or use custom amount in the next step.</div>
              </div>
              {membership.status === 'active' ? (
                <form onSubmit={handlePurchase} className="flex items-center gap-3 flex-wrap">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-md font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Buy credits
                  </button>
                  <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
                    <span className="px-2 py-1 rounded border">500 for $500</span>
                    <span className="px-2 py-1 rounded border">800 for $800</span>
                    <span className="px-2 py-1 rounded border">Custom</span>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setConfirmModal({ open:true, title:'Purchase membership', message:'You need a membership to buy credits. Continue to purchase?', confirmText:'Continue', cancelText:'Close', onConfirm: () => setConfirmModal(m=>({ ...m, open:false })) })}
                    className="px-5 py-2.5 rounded-md font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Buy membership
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
                <span className="text-xs text-gray-500">Real-time data</span>
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
                <span className="text-xs text-gray-500">Real-time data</span>
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
                    {usages.length === 0 ? (
                      <tr><td className="py-2 text-gray-500" colSpan="4">No usage yet</td></tr>
                    ) : (
                      usages.map((u, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-1 pr-2">{u.date}</td>
                          <td className="py-1 pr-2">{u.type}</td>
                          <td className="py-1 pr-2">{u.ref}</td>
                          <td className="py-1 pr-2 font-medium text-red-600">{u.credits}</td>
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
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">Checkout</h4>
              <button aria-label="Close" onClick={()=>setCheckoutOpen(false)} className="px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm">Close</button>
            </div>
            <div className="space-y-2">
              {checkoutStep === "packs" && (
                <>
                  <div>
                    <div className="text-center mb-2">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Choose Your Credit Pack</h3>
                      <p className="text-xs text-gray-600">Select the amount of credits you'd like to purchase</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {/* 500 Credits Pack */}
                      <label className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all duration-200 ${
                        packType === "pack500" 
                          ? "border-blue-500 bg-blue-50 shadow-lg scale-105" 
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}>
                        <input 
                          type="radio" 
                          name="pack" 
                          className="sr-only" 
                          checked={packType === "pack500"} 
                          onChange={()=>setPackType("pack500")} 
                        />
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
                            <span className="text-blue-600 font-bold text-sm">500</span>
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 mb-1">500 Credits</h4>
                          <div className="text-xl font-bold text-gray-900 mb-1">$500</div>
                          <div className="text-xs text-gray-500">$1.00 per credit</div>
                          {packType === "pack500" && (
                            <div className="absolute top-3 right-3">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>

                      {/* 800 Credits Pack */}
                      <label className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all duration-200 ${
                        packType === "pack800" 
                          ? "border-blue-500 bg-blue-50 shadow-lg scale-105" 
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}>
                        <input 
                          type="radio" 
                          name="pack" 
                          className="sr-only" 
                          checked={packType === "pack800"} 
                          onChange={()=>setPackType("pack800")} 
                        />
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-2">
                            <span className="text-green-600 font-bold text-sm">800</span>
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 mb-1">800 Credits</h4>
                          <div className="text-xl font-bold text-gray-900 mb-1">$800</div>
                          <div className="text-xs text-gray-500">$1.00 per credit</div>
                          <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Most Popular
                          </div>
                          {packType === "pack800" && (
                            <div className="absolute top-3 right-3">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>

                      {/* Custom Pack */}
                      <label className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all duration-200 ${
                        packType === "custom" 
                          ? "border-blue-500 bg-blue-50 shadow-lg scale-105" 
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}>
                        <input 
                          type="radio" 
                          name="pack" 
                          className="sr-only" 
                          checked={packType === "custom"} 
                          onChange={()=>setPackType("custom")} 
                        />
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mb-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 mb-1">Custom Amount</h4>
                          <div className="text-xs text-gray-500 mb-2">Choose your own amount</div>
                        <div className="mt-2">
                          <input
                            type="number"
                            min="1"
                            value={packType === "custom" ? (customQty ?? "") : ""}
                            onChange={(e)=>setCustomQty(e.target.value === '' ? '' : parseInt(e.target.value||"0",10))}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            placeholder="Enter credits"
                            disabled={packType!=="custom"}
                          />
                            {packType === "custom" && customQty > 0 && (
                              <div className="mt-2 text-sm text-gray-600">
                                Total: ${customQty}
                              </div>
                            )}
                          </div>
                          {packType === "custom" && (
                            <div className="absolute top-3 right-3">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Selected credits</div>
                        <div className="text-2xl font-bold text-gray-900">{derived.credits}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total due</div>
                        <div className="text-2xl font-bold text-blue-600">${derived.price}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={()=>setCheckoutOpen(false)} 
                        className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={()=>setCheckoutStep("payment")} 
                        disabled={derived.credits<=0} 
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                          derived.credits<=0
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                        }`}
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                </>
              )}

              {checkoutStep === "payment" && (
                <>
                  <div>
                    <div className="text-center mb-2">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Choose Payment Method</h3>
                      <p className="text-xs text-gray-600">Select your preferred payment option</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <label className={`flex items-center p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        paymentMethod==='stripe' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input type="radio" name="pay" className="sr-only" checked={paymentMethod==='stripe'} onChange={()=>setPaymentMethod('stripe')} />
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod==='stripe' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {paymentMethod==='stripe' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white font-bold text-sm">S</span>
                            </div>
                            <span className="font-medium text-gray-900">Stripe</span>
                          </div>
                        </div>
                      </label>
                      <label className={`flex items-center p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        paymentMethod==='westcoast' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input type="radio" name="pay" className="sr-only" checked={paymentMethod==='westcoast'} onChange={()=>setPaymentMethod('westcoast')} />
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod==='westcoast' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {paymentMethod==='westcoast' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                              <span className="text-white font-bold text-sm">W</span>
                            </div>
                            <span className="font-medium text-gray-900">Westcoast</span>
                          </div>
                        </div>
                      </label>
                      <label className={`flex items-center p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        paymentMethod==='paypal' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input type="radio" name="pay" className="sr-only" checked={paymentMethod==='paypal'} onChange={()=>setPaymentMethod('paypal')} />
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod==='paypal' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {paymentMethod==='paypal' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
                              <span className="text-white font-bold text-sm">P</span>
                            </div>
                            <span className="font-medium text-gray-900">PayPal</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Selected credits</div>
                        <div className="text-2xl font-bold text-gray-900">{derived.credits}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total due</div>
                        <div className="text-2xl font-bold text-blue-600">${derived.price}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={()=>setCheckoutStep("packs")} 
                        className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button 
                        onClick={confirmCheckout} 
                        disabled={isPurchasing || derived.credits<=0} 
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                          isPurchasing||derived.credits<=0
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                            : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {isPurchasing ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          "Complete Purchase"
                        )}
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


