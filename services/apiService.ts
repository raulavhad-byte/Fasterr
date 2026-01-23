import { Product } from '../types';

// This service demonstrates how to replace storageService.ts with real API calls.
// To use this: 
// 1. Run the server: cd server && npm install && npm start
// 2. Replace calls to storageService with these functions in your components.

const API_URL = '/api'; // Uses Vite proxy

export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return null;
    }
};

export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'status'>): Promise<string | null> => {
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
        const result = await response.json();
        return result.id;
    } catch (error) {
        console.error("Failed to create product:", error);
        return null;
    }
};