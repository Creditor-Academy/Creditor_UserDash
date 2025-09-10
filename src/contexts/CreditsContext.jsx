import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'user_credits_balance_v1';
const TRANSACTIONS_KEY = 'user_credits_transactions_v1';
const MEMBERSHIP_KEY = 'user_membership_v1';

const CreditsContext = createContext(undefined);

export const useCredits = () => {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error('useCredits must be used within CreditsProvider');
  return ctx;
};

export const CreditsProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);

  const [transactions, setTransactions] = useState([]);

  const [membership, setMembership] = useState({
    isActive: false,
    type: 'free',
    expiresAt: null,
    nextBillingDate: null
  });

  const [isLoading, setIsLoading] = useState(false);

  // Note: No persistence. Values reset on page refresh intentionally for preview flows.

  const addTransaction = (type, amount, metadata = {}) => {
    const transaction = {
      id: Date.now() + Math.random(),
      type,
      amount,
      balance: balance + amount,
      timestamp: new Date().toISOString(),
      metadata
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const addCredits = async (amount) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const safe = Number(amount) || 0;
      setBalance((prev) => Math.max(0, prev + safe));
      addTransaction('purchase', safe, { credits: safe });
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseCreditsWithMembership = async (amount) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const safe = Number(amount) || 0;
      const membershipFee = 69;
      
      // Activate membership
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      
      setMembership({
        isActive: true,
        type: 'monthly',
        expiresAt: nextMonth.toISOString(),
        nextBillingDate: nextMonth.toISOString()
      });
      
      // Add credits
      setBalance((prev) => Math.max(0, prev + safe));
      
      // Add transactions
      addTransaction('membership', membershipFee, { type: 'activation' });
      addTransaction('purchase', safe, { credits: safe, withMembership: true });
    } finally {
      setIsLoading(false);
    }
  };

  const renewMembership = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      
      setMembership({
        isActive: true,
        type: 'monthly',
        expiresAt: nextMonth.toISOString(),
        nextBillingDate: nextMonth.toISOString()
      });
      
      addTransaction('membership', 69, { type: 'renewal' });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelMembership = () => {
    setMembership({
      isActive: false,
      type: 'free',
      expiresAt: null,
      nextBillingDate: null
    });
    
    addTransaction('membership', -69, { type: 'cancellation' });
  };

  const spendCredits = (amount, metadata = {}) => {
    const safe = Number(amount) || 0;
    setBalance((prev) => Math.max(0, prev - safe));
    addTransaction('spend', -safe, { credits: safe, ...metadata });
  };

  const resetCredits = () => {
    setBalance(0);
    setTransactions([]);
    setMembership({
      isActive: false,
      type: 'free',
      expiresAt: null,
      nextBillingDate: null
    });
  };

  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.timestamp);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });
    
    const totalPurchased = transactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalSpent = Math.abs(transactions
      .filter(t => t.type === 'spend')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const totalBonuses = transactions
      .filter(t => t.type === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRefunds = transactions
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalMembershipFees = Math.abs(transactions
      .filter(t => t.type === 'membership')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const monthlySpent = Math.abs(monthlyTransactions
      .filter(t => t.type === 'spend')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const monthlyPurchased = monthlyTransactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyMembershipFees = Math.abs(monthlyTransactions
      .filter(t => t.type === 'membership')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const transactionCount = transactions.length;
    const averageTransaction = transactionCount > 0 ? totalPurchased / transactionCount : 0;
    
    return {
      totalPurchased,
      totalSpent,
      totalBonuses,
      totalRefunds,
      totalMembershipFees,
      monthlySpent,
      monthlyPurchased,
      monthlyMembershipFees,
      transactionCount,
      averageTransaction
    };
  }, [transactions]);

  const value = useMemo(() => ({ 
    balance, 
    transactions,
    membership,
    analytics,
    isLoading,
    addCredits, 
    purchaseCreditsWithMembership,
    renewMembership,
    cancelMembership,
    spendCredits, 
    resetCredits 
  }), [balance, transactions, membership, analytics, isLoading]);

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
};

export default CreditsContext;


