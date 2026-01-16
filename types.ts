export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export enum Category {
  MOBILES = 'Mobiles',
  CARS = 'Cars',
  BIKES = 'Bikes',
  PROPERTIES_SALE = 'Properties for Sale',
  PROPERTIES_RENT = 'Properties for Rent',
  ELECTRONICS = 'Electronics & Appliances',
  FURNITURE = 'Furniture',
  FASHION = 'Fashion',
  BOOKS_SPORTS = 'Books, Sports & Hobbies',
  PETS = 'Pets',
  SERVICES = 'Services',
  OTHER = 'Other'
}

export type Condition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: Category;
  condition: Condition;
  image: string; // Primary thumbnail
  images: string[]; // All images
  sellerId: string;
  sellerName: string;
  createdAt: number;
  location: string;
  status: 'active' | 'sold';
}

export interface Review {
    id: string;
    sellerId: string;
    buyerId: string;
    buyerName: string;
    rating: number;
    comment: string;
    createdAt: number;
}

export interface ChatMessage {
    id: string;
    productId: string;
    senderId: string;
    text: string;
    createdAt: number;
    attachment?: string;
    location?: { lat: number; lng: number };
}

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};