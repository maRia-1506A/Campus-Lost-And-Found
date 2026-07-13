import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { X, ShieldAlert } from 'lucide-react';
import { useClaims } from '../../contexts/ClaimsContext';
import { useAuth } from '../../contexts/AuthContext';
import { type Item } from '../../services/mockData';

interface ClaimModalProps {
  item: Item;
  onClose: () => void;
}

export function ClaimModal({ item, onClose }: ClaimModalProps) {
  const { user } = useAuth();
  const { submitClaim } = useClaims();

  const [color, setColor] = useState('');
  const [uniqueMarks, setUniqueMarks] = useState('');
  const [proof, setProof] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    submitClaim({
      itemId: item.id,
      claimerId: user.studentId, // Using studentId as unique identifier for this mockup
      claimerName: user.name,
      posterId: item.postedBy, // In a real app, this should be the user ID, but we only have name right now
      color,
      uniqueMarks,
      proof,
    });
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Claim Submitted!</h3>
          <p className="text-slate-500">Your claim for "{item.title}" is now pending review by the finder. You will be notified once they respond.</p>
          <Button onClick={onClose} className="w-full">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-600" />
            Claim Ownership
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <p className="text-sm text-slate-500 mb-4">
            To prevent false claims, please provide specific details about the item that only the true owner would know.
          </p>

          <form id="claim-form" onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="color"
              label="Item Color"
              placeholder="e.g. Black with silver trim"
              required
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            
            <Textarea
              id="uniqueMarks"
              label="Unique Marks / Identifiers"
              placeholder="e.g. A small scratch on the bottom left corner, or contents of a wallet (ID card ending in 1234)"
              required
              value={uniqueMarks}
              onChange={(e) => setUniqueMarks(e.target.value)}
            />

            <Textarea
              id="proof"
              label="Proof of Ownership"
              placeholder="e.g. I have the original receipt, or the serial number is 987654321."
              required
              value={proof}
              onChange={(e) => setProof(e.target.value)}
            />
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50 rounded-b-2xl">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="claim-form">Submit Claim</Button>
        </div>

      </div>
    </div>
  );
}
