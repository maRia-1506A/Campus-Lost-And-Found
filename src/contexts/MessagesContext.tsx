import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Message {
  id: string;
  claimId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

interface MessagesContextType {
  messages: Message[];
  sendMessage: (claimId: string, senderId: string, senderName: string, text: string) => void;
  getMessagesByClaimId: (claimId: string) => Message[];
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('messages');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = (claimId: string, senderId: string, senderName: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      claimId,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getMessagesByClaimId = (claimId: string) => {
    return messages.filter(m => m.claimId === claimId);
  };

  return (
    <MessagesContext.Provider value={{ messages, sendMessage, getMessagesByClaimId }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}
