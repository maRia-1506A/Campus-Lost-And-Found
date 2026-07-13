import React, { createContext, useContext, useState } from 'react';
import { mockItems, type Item } from '../services/mockData';

interface ItemsContextType {
  items: Item[];
  addItem: (item: Omit<Item, 'id'>) => Item;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>(mockItems);

  const addItem = (data: Omit<Item, 'id'>): Item => {
    const newItem: Item = {
      ...data,
      id: Date.now().toString(),
    };
    setItems(prev => [newItem, ...prev]);
    return newItem;
  };

  return (
    <ItemsContext.Provider value={{ items, addItem }}>
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
}
