export interface Item {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  status: 'Lost' | 'Found' | 'Resolved';
  imageUrl: string;
  postedBy: string;
  type: 'lost' | 'found';
  time?: string;
}

export const mockItems: Item[] = [
  {
    id: '1',
    title: 'Apple AirPods Pro',
    category: 'Electronics',
    description: 'Lost my AirPods Pro in a white case. Last seen near the Science Building library.',
    location: 'Science Building',
    date: '2023-10-24',
    time: '14:30',
    status: 'Lost',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    postedBy: 'John Doe',
    type: 'lost'
  },
  {
    id: '2',
    title: 'Black Leather Wallet',
    category: 'Wallet',
    description: 'Found a black leather wallet on a bench near the Student Center. Contains some cash and an ID.',
    location: 'Student Center',
    date: '2023-10-23',
    time: '09:15',
    status: 'Found',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    postedBy: 'Jane Smith',
    type: 'found'
  },
  {
    id: '3',
    title: 'Calculus Textbook',
    category: 'Books',
    description: 'Left my Stewart Calculus book in Room 304 of the Math Building.',
    location: 'Math Building, Room 304',
    date: '2023-10-22',
    time: '16:00',
    status: 'Lost',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    postedBy: 'Alice Johnson',
    type: 'lost'
  },
  {
    id: '4',
    title: 'Silver Car Keys',
    category: 'Keys',
    description: 'Found a set of silver car keys (Toyota) in the North Parking Lot.',
    location: 'North Parking Lot',
    date: '2023-10-25',
    time: '11:45',
    status: 'Found',
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    postedBy: 'Admin',
    type: 'found'
  }
];

// Mock API Functions
export const getItems = async (type?: 'lost' | 'found') => {
  await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay
  if (type) {
    return mockItems.filter(item => item.type === type);
  }
  return mockItems;
};

export const getItemById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockItems.find(item => item.id === id);
};
