import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Claim {
  id: string;
  itemId: string;
  claimerId: string; // The user making the claim
  claimerName: string;
  posterId: string; // The user who posted the item
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  color: string;
  uniqueMarks: string;
  proof: string;
}

interface ClaimsContextType {
  claims: Claim[];
  submitClaim: (claimData: Omit<Claim, 'id' | 'status' | 'date'>) => void;
  updateClaimStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  getClaimsByPoster: (posterId: string) => Claim[];
  getClaimsByClaimer: (claimerId: string) => Claim[];
  getClaimForUserAndItem: (claimerId: string, itemId: string) => Claim | undefined;
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export function ClaimsProvider({ children }: { children: React.ReactNode }) {
  const [claims, setClaims] = useState<Claim[]>(() => {
    const saved = localStorage.getItem('claims');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('claims', JSON.stringify(claims));
  }, [claims]);

  const submitClaim = (claimData: Omit<Claim, 'id' | 'status' | 'date'>) => {
    const newClaim: Claim = {
      ...claimData,
      id: Date.now().toString(),
      status: 'Pending',
      date: new Date().toISOString(),
    };
    setClaims(prev => [...prev, newClaim]);
  };

  const updateClaimStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const getClaimsByPoster = (posterId: string) => claims.filter(c => c.posterId === posterId);
  const getClaimsByClaimer = (claimerId: string) => claims.filter(c => c.claimerId === claimerId);
  const getClaimForUserAndItem = (claimerId: string, itemId: string) => 
    claims.find(c => c.claimerId === claimerId && c.itemId === itemId);

  return (
    <ClaimsContext.Provider value={{
      claims, submitClaim, updateClaimStatus, getClaimsByPoster, getClaimsByClaimer, getClaimForUserAndItem
    }}>
      {children}
    </ClaimsContext.Provider>
  );
}

export function useClaims() {
  const context = useContext(ClaimsContext);
  if (context === undefined) {
    throw new Error('useClaims must be used within a ClaimsProvider');
  }
  return context;
}
