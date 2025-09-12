import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useUser } from './UserContext';
import api from '../services/apiClient';

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
  const { userProfile } = useUser();
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

  // Backend integration functions
  const fetchBackendBalance = async (userId) => {
    try {
      console.log(`[CreditsContext] Fetching balance for user ${userId}`);
      console.log(`[CreditsContext] Making GET request to: /payment-order/credits/balance/${userId}`);
      const response = await api.get(`/payment-order/credits/balance/${userId}`, { withCredentials: true });
      console.log(`[CreditsContext] Balance response:`, response?.data);
      console.log(`[CreditsContext] Response status:`, response?.status);
      console.log(`[CreditsContext] Full response object:`, response);
      
      // Handle different response structures
      const balance = response?.data?.balance || response?.data?.data?.balance;
      if (balance !== undefined) {
        console.log(`[CreditsContext] Setting balance to:`, balance);
        setBalance(balance);
      } else {
        console.log(`[CreditsContext] No balance found in response. Response data:`, response?.data);
        console.log(`[CreditsContext] Response structure:`, {
          'response.data': response?.data,
          'response.data.balance': response?.data?.balance,
          'response.data.data': response?.data?.data,
          'response.data.data.balance': response?.data?.data?.balance
        });
      }
    } catch (error) {
      console.error('[CreditsContext] Failed to fetch balance:', error);
      console.error('[CreditsContext] Error status:', error?.response?.status);
      console.error('[CreditsContext] Error data:', error?.response?.data);
      console.error('[CreditsContext] Full error object:', error);
    }
  };

  const fetchBackendMembership = async (userId) => {
    try {
      console.log(`Fetching membership for user ${userId}`);
      const response = await api.get(`/payment-order/membership/status/${userId}`, { withCredentials: true });
      console.log(`Membership response:`, response?.data);
      
      // Handle the response format
      const membershipData = response?.data?.data || response?.data;
      
      if (membershipData === null) {
        // No subscription found - user is inactive
        setMembership({
          isActive: false,
          type: 'free',
          expiresAt: null,
          nextBillingDate: null
        });
      } else if (membershipData?.status === 'ACTIVE') {
        setMembership({
          isActive: true,
          type: 'monthly',
          expiresAt: membershipData.expiresAt || null,
          nextBillingDate: membershipData.nextBillingDate || null
        });
      } else {
        // CANCELLED or other status
        setMembership({
          isActive: false,
          type: 'free',
          expiresAt: null,
          nextBillingDate: null
        });
      }
    } catch (error) {
      console.error('Failed to fetch membership:', error);
    }
  };

  // Fetch data when user profile changes
  useEffect(() => {
    if (userProfile?.id) {
      console.log(`[CreditsContext] User profile changed, fetching data for user ${userProfile.id}`);
      console.log(`[CreditsContext] User profile object:`, userProfile);
      fetchBackendBalance(userProfile.id);
      fetchBackendMembership(userProfile.id);
    } else {
      console.log(`[CreditsContext] No user profile ID found. User profile:`, userProfile);
    }
  }, [userProfile?.id]);

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

  // Unlock content (catalog or lesson) using credits
  const unlockContent = async (unlockType, unlockId, creditsSpent) => {
    if (!userProfile?.id) {
      throw new Error('User not logged in');
    }

    setIsLoading(true);
    try {
      console.log(`[CreditsContext] Unlocking ${unlockType} with ID ${unlockId} for ${creditsSpent} credits`);
      
      const unlockData = {
        userId: userProfile.id,
        credits_spent: creditsSpent,
        unlock_type: unlockType,
        unlock_id: unlockId
      };

      console.log(`[CreditsContext] Making POST request to: /payment-order/unlock`);
      console.log(`[CreditsContext] Unlock data:`, unlockData);

      const response = await api.post('/payment-order/unlock', unlockData, { withCredentials: true });
      
      console.log(`[CreditsContext] Unlock response:`, response?.data);
      console.log(`[CreditsContext] Response status:`, response?.status);

      // Don't deduct locally - let backend handle it
      // The backend will update the user's total_credits
      // We'll fetch the updated balance after successful unlock
      
      // Add transaction record for local display
      addTransaction('spend', -creditsSpent, { 
        unlockType, 
        unlockId, 
        type: 'unlock' 
      });

      // Fetch updated balance from backend
      await fetchBackendBalance(userProfile.id);

      return response.data;
    } catch (error) {
      console.error('[CreditsContext] Failed to unlock content:', error);
      console.error('[CreditsContext] Error status:', error?.response?.status);
      console.error('[CreditsContext] Error data:', error?.response?.data);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
    resetCredits,
    unlockContent,
    refreshBalance: () => userProfile?.id && fetchBackendBalance(userProfile.id),
    refreshMembership: () => userProfile?.id && fetchBackendMembership(userProfile.id)
  }), [balance, transactions, membership, analytics, isLoading, userProfile?.id]);

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
};

export default CreditsContext;


