import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from '../contexts/MessagesContext';
import { useClaims } from '../contexts/ClaimsContext';
import { useAuth } from '../contexts/AuthContext';
import { useItems } from '../contexts/ItemsContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Send } from 'lucide-react';

export default function Messages() {
  const { id: claimId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { claims } = useClaims();
  const { items } = useItems();
  const { getMessagesByClaimId, sendMessage } = useMessages();
  
  const [inputText, setInputText] = useState('');

  if (!user || !claimId) return null;

  const claim = claims.find(c => c.id === claimId);
  if (!claim) return <div className="p-8 text-center text-slate-500">Claim not found.</div>;
  if (claim.status !== 'Approved') return <div className="p-8 text-center text-slate-500">Messaging is only available for approved claims.</div>;

  const item = items.find(i => i.id === claim.itemId);
  const messages = getMessagesByClaimId(claimId);

  // Determine chat partner name
  const isPoster = user.name === claim.posterId; // For mock, we used name as posterId
  const chatPartner = isPoster ? claim.claimerName : claim.posterId;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(claimId, user.studentId, user.name, inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[70vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-white rounded-t-2xl shrink-0">
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{chatPartner}</h2>
            <p className="text-xs text-slate-500 font-medium">Re: {item?.title}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 text-sm mt-8">
              No messages yet. Send a message to arrange the return!
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.senderId === user.studentId;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMine ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                  }`}>
                    {!isMine && <p className="text-xs font-semibold text-slate-500 mb-0.5">{msg.senderName}</p>}
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] text-right mt-1 ${isMine ? 'text-brand-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 rounded-b-2xl shrink-0 flex gap-2">
          <Input 
            id="message-input"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" className="shrink-0" disabled={!inputText.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>

      </div>
    </div>
  );
}
